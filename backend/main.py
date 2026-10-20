from fastapi import FastAPI, WebSocket, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, field_validator
from groq import Groq
import os
import uuid
import bcrypt
import secrets
from dotenv import load_dotenv
import json
import sqlite3
from datetime import datetime, timedelta
import asyncio
from collections import defaultdict
import time
import re

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
if not api_key or api_key == "your_groq_api_key_here":
    print("⚠️  WARNING: GROQ_API_KEY is not set. AI features will not work.")
    print("   → Get your free key at https://console.groq.com")
    print("   → Add it to backend/.env as: GROQ_API_KEY=gsk_...")
    api_key = "missing"
client = Groq(api_key=api_key)

app = FastAPI()

# ── Rate limiting ────────────────────────────────────────────────
_rate_store: dict = defaultdict(list)
RATE_LIMIT = 30  # max requests
RATE_WINDOW = 60  # per 60 seconds

def check_rate_limit(ip: str):
    now = time.time()
    _rate_store[ip] = [t for t in _rate_store[ip] if now - t < RATE_WINDOW]
    if len(_rate_store[ip]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Too many requests. Please wait a moment.")
    _rate_store[ip].append(now)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    ip = request.client.host if request.client else "unknown"
    if request.method in ("POST", "DELETE") and request.url.path not in ("/",):
        try:
            check_rate_limit(ip)
        except HTTPException as e:
            return JSONResponse(status_code=429, content={"detail": e.detail})
    return await call_next(request)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_db():
    conn = sqlite3.connect("sessions.db")
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT,
        created_at TEXT
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidate_id INTEGER,
        date TEXT,
        score INTEGER,
        grade TEXT,
        eye_contact REAL,
        wpm REAL,
        filler_count INTEGER,
        question TEXT,
        transcript TEXT,
        overall_feedback TEXT
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidate_id INTEGER,
        candidate_name TEXT,
        rating INTEGER,
        category TEXT,
        message TEXT,
        created_at TEXT
    )''')
    c.execute("SELECT COUNT(*) FROM sessions")
    count = c.fetchone()[0]

    if count == 0:
        sample_data = [
            (1, "Mar 20", 55, "C", 60.0, 140.0, 8, "Tell me about a challenge you faced.", "I faced a challenge in my project...", "Good start but needs more detail."),
            (1, "Mar 22", 65, "B", 70.0, 130.0, 5, "Describe a time you showed leadership.", "I led a team of 5 people...", "Good leadership example, improve Result."),
            (1, "Mar 24", 72, "B", 78.0, 125.0, 3, "Tell me about working under pressure.", "During my internship I had a deadline...", "Strong Situation and Action, good progress!"),
        ]
        c.executemany("INSERT INTO sessions (candidate_id, date, score, grade, eye_contact, wpm, filler_count, question, transcript, overall_feedback) VALUES (?,?,?,?,?,?,?,?,?,?)", sample_data)

    conn.commit()
    conn.close()

init_db()

INTERVIEW_QUESTIONS = [
    "Tell me about a time you faced a major challenge at work or in a project.",
    "Describe a situation where you had to work under pressure.",
    "Tell me about a time you showed leadership in a team.",
    "Describe a project where you had to learn something new quickly.",
    "Tell me about a time you had a conflict with a teammate and how you resolved it.",
    "Tell me about a time you delivered a project under a tight deadline.",
    "Describe a situation where you had to make a difficult decision with limited information.",
    "Tell me about a time you received critical feedback and how you handled it.",
    "Describe a time you went above and beyond your job responsibilities.",
    "Tell me about a time you failed and what you learned from it.",
]

SYSTEM_PROMPT = """You are an expert interview coach evaluating answers using the STAR method.

STAR Method:
- Situation: Did the candidate describe the context clearly?
- Task: Did they explain their specific responsibility?
- Action: Did they describe what THEY did, with specific steps?
- Result: Did they mention the outcome with measurable impact?

Evaluate the answer and respond ONLY in this exact JSON format:
{
  "situation_score": <0-25>,
  "task_score": <0-25>,
  "action_score": <0-25>,
  "result_score": <0-25>,
  "total_score": <0-100>,
  "situation_feedback": "<specific feedback>",
  "task_feedback": "<specific feedback>",
  "action_feedback": "<specific feedback>",
  "result_feedback": "<specific feedback>",
  "overall_feedback": "<2-3 sentence summary>",
  "grade": "<A/B/C/D/F>"
}"""

# Model config — updated to use available models on this Groq account
FAST_MODEL = "openai/gpt-oss-20b"        # fast, low cost
SMART_MODEL = "qwen/qwen3.8-27b"         # smarter, for evaluation

class GroqRateLimitError(RuntimeError):
    """Raised when all Groq models are rate-limited."""

def strip_thinking(text: str) -> str:
    """Remove <think>...</think> chain-of-thought blocks that qwen models emit."""
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    return text.strip()

def extract_content(resp) -> str:
    """Extract text from a Groq response.
    These reasoning models store their answer in 'content' (when available)
    or fall back to the 'reasoning' field."""
    msg = resp.choices[0].message
    content = msg.content or ""
    if not content.strip():
        # Reasoning models sometimes store output in the reasoning field
        content = getattr(msg, "reasoning", "") or ""
    return strip_thinking(content).strip()

def groq_call(messages, model=None, temperature=0.5, max_tokens=200):
    """Sync Groq call with automatic fallback on rate limit."""
    models = [model or FAST_MODEL, FAST_MODEL, SMART_MODEL]
    # deduplicate while preserving order
    seen = set()
    models = [m for m in models if not (m in seen or seen.add(m))]
    last_err = None
    for m in models:
        try:
            # Use low reasoning_effort to minimize reasoning leakage into answers
            resp = client.chat.completions.create(
                model=m, messages=messages,
                temperature=temperature, max_tokens=max_tokens,
                extra_body={"reasoning_effort": "low"}
            )
            # Wrap in a simple namespace so callers can do resp.choices[0].message.content
            class _Msg:
                def __init__(self, content): self.content = content
            class _Choice:
                def __init__(self, content): self.message = _Msg(content)
            class _Resp:
                def __init__(self, content): self.choices = [_Choice(content)]
            return _Resp(extract_content(resp))
        except Exception as e:
            last_err = e
            if "rate_limit" in str(e).lower() or "429" in str(e):
                continue
            raise
    raise GroqRateLimitError(
        f"Rate limit reached on all models. Please wait a few minutes. ({last_err})"
    ) from last_err


def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def verify_password(p: str, hashed: str) -> bool:
    return bcrypt.checkpw(p.encode(), hashed.encode())

# ── Pydantic models ───────────────────────────────────────────
class RegisterBody(BaseModel):
    name: str
    email: str
    password: str
    role: str = "Software Engineer"

    @field_validator("name")
    @classmethod
    def name_valid(cls, v):
        v = v.strip()
        if not v or len(v) > 100:
            raise ValueError("Name must be 1-100 characters")
        return v

    @field_validator("email")
    @classmethod
    def email_valid(cls, v):
        v = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v) or len(v) > 200:
            raise ValueError("Invalid email")
        return v

    @field_validator("password")
    @classmethod
    def password_valid(cls, v):
        if len(v) < 6 or len(v) > 128:
            raise ValueError("Password must be 6-128 characters")
        return v

class LoginBody(BaseModel):
    email: str
    password: str

class ForgotBody(BaseModel):
    email: str

class EvaluateBody(BaseModel):
    question: str
    transcript: str
    eye_contact: float = 0
    filler_count: int = 0
    wpm: float = 0
    candidate_id: int = 0

class ChatBody(BaseModel):
    message: str
    role: str = "Software Engineer"
    history: list = []

class FeedbackBody(BaseModel):
    candidate_id: int = 0
    candidate_name: str = "Anonymous"
    rating: int
    category: str = "General"
    message: str

    @field_validator("rating")
    @classmethod
    def rating_valid(cls, v):
        if v < 1 or v > 5:
            raise ValueError("Rating must be 1-5")
        return v

    @field_validator("message")
    @classmethod
    def message_valid(cls, v):
        if not v.strip() or len(v) > 2000:
            raise ValueError("Message must be 1-2000 characters")
        return v.strip()

class ResumeBody(BaseModel):
    resume: str
    role: str = "Software Engineer"

class JDBody(BaseModel):
    jd: str
    role: str = "Software Engineer"
    level: str = "Intermediate"

class QuestionBody(BaseModel):
    question: str
    role: str = "Software Engineer"
    jd: str = ""

class HintBody(BaseModel):
    question: str
    role: str = "Software Engineer"

class TranslateBody(BaseModel):
    question: str
    language: str = "Hindi"

class ImproveBody(BaseModel):
    question: str
    transcript: str
    role: str = "Software Engineer"

class FollowupBody(BaseModel):
    question: str
    transcript: str
    role: str = "Software Engineer"

class RelatedBody(BaseModel):
    question: str
    role: str = "Software Engineer"
    level: str = "Intermediate"

class MockEvalBody(BaseModel):
    answers: list
    role: str = "Software Engineer"
    candidate_id: int = 0

class WarmupBody(BaseModel):
    role: str = "Software Engineer"
    level: str = "Intermediate"

@app.get("/")
async def root():
    return {"message": "Backend Running!"}

@app.post("/auth/register")
async def register(data: RegisterBody):
    name = data.name
    email = data.email
    password = data.password
    role = data.role
    conn = sqlite3.connect("sessions.db")
    c = conn.cursor()
    try:
        c.execute("INSERT INTO candidates (name, email, password, role, created_at) VALUES (?,?,?,?,?)",
                  (name, email, hash_password(password), role, datetime.now().strftime("%Y-%m-%d")))
        conn.commit()
        candidate_id = c.lastrowid
        return {"candidate": {"id": candidate_id, "name": name, "email": email, "role": role}}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already registered")
    finally:
        conn.close()

@app.post("/auth/login")
async def login(data: LoginBody):
    email = data.email.strip().lower()
    password = data.password
    conn = sqlite3.connect("sessions.db")
    c = conn.cursor()
    try:
        c.execute("SELECT id, name, email, role, password FROM candidates WHERE email=?", (email,))
        row = c.fetchone()
    finally:
        conn.close()
    if not row or not verify_password(password, row[4]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"candidate": {"id": row[0], "name": row[1], "email": row[2], "role": row[3]}}

@app.post("/auth/forgot-password")
async def forgot_password(data: ForgotBody):
    email = data.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    conn = sqlite3.connect("sessions.db")
    c = conn.cursor()
    try:
        c.execute("SELECT id FROM candidates WHERE email=?", (email,))
        row = c.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="No account found with that email")
        new_password = secrets.token_urlsafe(8)
        c.execute("UPDATE candidates SET password=? WHERE email=?", (hash_password(new_password), email))
        conn.commit()
        # NOTE: In production, send via email. Returning here for demo only.
        return {"message": f"Password reset. Your temporary password is: {new_password[:4]}**** — change it after login."}
    finally:
        conn.close()


# ── Question cache ──────────────────────────────────────────────
question_cache = defaultdict(list)
refilling = set()

SUBJECT_TOPICS = {
    "Software Engineer": "DSA, algorithms, system design, OOP, databases, coding problem-solving, debugging, scalability",
    "Data Scientist": "statistics, machine learning algorithms, data wrangling, Python/R, model evaluation, feature engineering, A/B testing, SQL",
    "Product Manager": "product sense, metrics, roadmap prioritization, go-to-market strategy, user research, stakeholder management, PRDs",
    "DevOps Engineer": "AWS/GCP/Azure, Docker, Kubernetes, CI/CD pipelines, infrastructure as code, monitoring, incident response",
    "UX/UI Designer": "design thinking, user research, Figma, wireframing, usability testing, accessibility, design systems",
    "Business Analyst": "requirements gathering, SQL, stakeholder management, process mapping, data analysis, JIRA, Agile",
    "Cybersecurity Analyst": "threat modeling, VAPT, SIEM, incident response, compliance (ISO/SOC2), network security, ethical hacking",
    "AI Engineer": "deep learning, LLMs, MLOps, model deployment, transformers, fine-tuning, vector databases, RAG",
    "Mobile Developer": "iOS/Android, React Native, Flutter, app performance, offline storage, push notifications, app store deployment",
    "UPSC Civil Services (IAS/IPS/IFS)": "current affairs, governance, ethics & integrity, public administration, Indian polity, economy, international relations",
    "IBPS Bank PO/Clerk": "banking awareness, RBI policies, financial products, reasoning, English language, customer service scenarios",
    "Railway RRB NTPC": "general knowledge, railway operations, technical aptitude, reasoning, current affairs, Indian geography",
    "SSC CGL/CHSL": "general awareness, English, reasoning, quantitative aptitude, government schemes, Indian history",
    "Judiciary/Law Services": "constitutional law, IPC, CrPC, legal reasoning, case analysis, judicial ethics, viva voce",
    "Defence Services NDA/CDS": "SSB interview, leadership, group tasks, psychology tests, current affairs, defence awareness",
    "State Police Services": "law & order, IPC sections, community policing, GK, physical fitness awareness, situational judgment",
    "AIIMS/Medical PSU": "clinical knowledge, medical ethics, patient care, pharmacology, anatomy, public health",
    "Teaching KVS/NVS/TGT/PGT": "subject pedagogy, classroom management, NEP 2020, child psychology, lesson planning, inclusive education",
}

LEVEL_GUIDANCE = {
    "Beginner": "The candidate is a fresher with 0-1 years of experience. Ask simple, foundational questions.",
    "Intermediate": "The candidate has 2-5 years of experience. Ask real work scenario questions.",
    "Advanced": "The candidate is senior with 5+ years. Ask complex, strategic questions.",
}

def build_system_prompt(role, level):
    topics = SUBJECT_TOPICS.get(role, "relevant domain knowledge and professional skills")
    guidance = LEVEL_GUIDANCE.get(level, "The candidate has moderate experience.")
    gov_roles = ["UPSC", "IBPS", "RRB", "SSC", "Judiciary", "Defence", "Police", "Medical", "Teaching"]
    is_gov = any(g.lower() in role.lower() for g in gov_roles)
    if is_gov:
        return f"""You are an expert Government of India exam interviewer for {role}.
{guidance}\nKey topics: {topics}
Generate ONE unique interview question testing knowledge, integrity, situational judgment, or subject expertise.
Return ONLY the question text, nothing else."""
    return f"""You are an expert technical interviewer for {role}.
{guidance}\nKey topics: {topics}
Generate ONE unique interview question about {role} skills. Alternate between technical, problem-solving, behavioral, and case-study questions.
Return ONLY the question text, nothing else."""

async def generate_one_question(role, level, used_set):
    topics = SUBJECT_TOPICS.get(role, "relevant domain knowledge")
    used_note = f" Do NOT repeat: {', '.join(list(used_set)[-5:])}" if used_set else ""
    loop = asyncio.get_running_loop()
    def _call():
        return groq_call([
            {"role": "system", "content": build_system_prompt(role, level)},
            {"role": "user", "content": f"Fresh {level} question for {role} covering {topics}.{used_note}"}
        ], temperature=1.0, max_tokens=80)
    resp = await loop.run_in_executor(None, _call)
    return resp.choices[0].message.content.strip().strip('"')

async def refill_cache(role, level, used_set, count=3):
    key = f"{role}||{level}"
    if key in refilling:
        return
    refilling.add(key)
    try:
        tasks = [generate_one_question(role, level, used_set) for _ in range(count)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for q in results:
            if isinstance(q, str) and q:
                question_cache[key].append(q)
    except Exception as e:
        print(f"Cache refill error: {e}")
    finally:
        refilling.discard(key)

@app.on_event("startup")
async def warmup_cache():
    common = [("Software Engineer", "Intermediate"), ("Data Scientist", "Intermediate"), ("IBPS Bank PO/Clerk", "Intermediate")]
    for role, level in common:
        asyncio.create_task(refill_cache(role, level, set(), count=3))

@app.post("/warmup")
async def warmup(data: WarmupBody):
    role = data.role
    level = data.level
    key = f"{role}||{level}"
    if len(question_cache[key]) < 2:
        asyncio.create_task(refill_cache(role, level, set(), count=3))
    return {"status": "warming"}

@app.get("/question")
async def get_question(role: str = "Software Engineer", level: str = "Intermediate", t: str = "", used: str = ""):
    import random
    if level not in {"Beginner", "Intermediate", "Advanced"}:
        level = "Intermediate"

    key = f"{role}||{level}"
    used_set = set(u.strip() for u in used.split("|") if u.strip())

    # Serve from cache instantly if available
    cached = [q for q in question_cache[key] if q not in used_set]
    if cached:
        question = cached[0]
        question_cache[key].remove(question)
        # Refill in background if running low
        if len(question_cache[key]) < 2:
            asyncio.create_task(refill_cache(role, level, used_set))
        return {"question": question}

    # Cache empty — generate one now and refill rest in background
    try:
        question = await generate_one_question(role, level, used_set)
        asyncio.create_task(refill_cache(role, level, used_set | {question}))
        return {"question": question}
    except Exception as e:
        print("Question generation error:", e)
        fallbacks = [
            f"Tell me about a time you solved a difficult problem as a {role}.",
            f"Describe a situation where you showed leadership in your {role} work.",
            f"Tell me about a project you are most proud of as a {role}.",
            f"Describe a time you had to learn something new quickly in your {role} role.",
            f"Tell me about a conflict you resolved in a team as a {role}.",
        ]
        available = [q for q in fallbacks if q not in used_set] or fallbacks
        return {"question": random.choice(available)}

@app.post("/translate-question")
async def translate_question(data: TranslateBody):
    question = data.question[:500]
    language = data.language

    language_scripts = {
        "Odia": "Odia script (ଓଡ଼ିଆ)",
        "Hindi": "Hindi Devanagari script (हिंदी)",
        "Bengali": "Bengali script (বাংলা)",
        "Telugu": "Telugu script (తెలుగు)",
        "Tamil": "Tamil script (தமிழ்)",
        "Marathi": "Marathi Devanagari script (मराठी)",
        "Gujarati": "Gujarati script (ગુજરાતી)",
        "Kannada": "Kannada script (ಕನ್ನಡ)",
        "Malayalam": "Malayalam script (മലയാളം)",
        "Punjabi": "Gurmukhi script (ਪੰਜਾਬੀ)",
        "Urdu": "Urdu Nastaliq script (اردو)",
        "Arabic": "Arabic script (العربية)",
        "Chinese": "Simplified Chinese (中文)",
        "Japanese": "Japanese (日本語)",
    }
    script_hint = language_scripts.get(language, language)

    try:
        loop = asyncio.get_running_loop()
        def _call():
            return groq_call([
                {"role": "system", "content": f"You are a professional translator specializing in {script_hint}. Your task is to translate the ENTIRE given text into {language} using {script_hint}. Rules: 1) Translate EVERY single word - do not leave any English words untranslated. 2) Use only native {language} script characters. 3) No romanization. 4) No English words mixed in. 5) Return ONLY the fully translated text."},
                {"role": "user", "content": question}
            ], temperature=0.1, max_tokens=400)
        resp = await loop.run_in_executor(None, _call)
        translated = resp.choices[0].message.content.strip()
        return {"translated": translated}
    except Exception as e:
        return {"translated": "", "error": str(e)}

@app.post("/hint")
async def get_hint(data: HintBody):
    question = data.question[:300]
    role = data.role
    try:
        loop = asyncio.get_running_loop()
        def _call():
            return groq_call([
                {"role": "system", "content": f"You are an interview coach for {role}. Give a SHORT hint (2-3 sentences) to help the candidate structure their answer. Do NOT give the answer."},
                {"role": "user", "content": f"Hint for: {question}"}
            ], temperature=0.5, max_tokens=80)
        resp = await loop.run_in_executor(None, _call)
        return {"hint": resp.choices[0].message.content.strip()}
    except Exception as e:
        return {"hint": "Think about a specific situation, your role, the actions you took, and the measurable result."}

@app.post("/jd-match")
async def jd_match(data: JDBody):
    jd = data.jd
    role = data.role
    level = data.level
    try:
        loop = asyncio.get_running_loop()
        def _call():
            return groq_call([
                {"role": "system", "content": "You are an expert interviewer. Analyze the job description and generate 5 targeted interview questions. Respond ONLY as JSON: {\"questions\": [\"q1\",\"q2\",\"q3\",\"q4\",\"q5\"], \"key_skills\": [\"s1\",\"s2\",\"s3\"], \"tips\": \"1 sentence prep tip\"}"},
                {"role": "user", "content": f"Role: {role}\n\nJD:\n{jd[:1500]}"}
            ], temperature=0.7, max_tokens=400)
        resp = await loop.run_in_executor(None, _call)
        raw = resp.choices[0].message.content.strip()
        start, end = raw.find("{"), raw.rfind("}")
        return json.loads(raw[start:end+1]) if start != -1 else {"questions": [], "key_skills": [], "tips": ""}
    except Exception as e:
        return {"questions": [], "key_skills": [], "tips": "", "error": str(e)}

@app.post("/jd-match/answer")
async def jd_match_answer(data: QuestionBody):
    question = data.question[:300]
    role = data.role
    jd = data.jd
    try:
        loop = asyncio.get_running_loop()
        def _call():
            return groq_call([
                {"role": "system", "content": f"You are an expert interview coach for {role}. Write a strong sample answer using the STAR method (Situation, Task, Action, Result). Be concise and specific. Label each STAR section."},
                {"role": "user", "content": f"Job Description context: {jd[:500]}\n\nQuestion: {question}\n\nWrite a strong sample answer:"}
            ], temperature=0.5, max_tokens=300)
        resp = await loop.run_in_executor(None, _call)
        return {"answer": resp.choices[0].message.content.strip()}
    except Exception as e:
        return {"answer": "Could not generate answer. Please try again."}

@app.post("/mock-interview/evaluate")
async def mock_evaluate(data: MockEvalBody):
    answers = data.answers[:10]
    role = data.role
    candidate_id = data.candidate_id or None
    if not answers:
        return {"error": "No answers provided"}
    try:
        loop = asyncio.get_running_loop()
        def _call():
            answers_text = "\n\n".join([f"Q{i+1}: {a['question']}\nA: {a['transcript'][:300]}" for i, a in enumerate(answers)])
            return groq_call([
                {"role": "system", "content": f"""You are an interview coach for {role}. Evaluate all answers. Respond ONLY in JSON:
{{"overall_score": <0-100>, "grade": "<A/B/C/D/F>", "summary": "<2 sentence summary>",
"strengths": ["s1","s2"], "improvements": ["i1","i2"],
"per_question": [{{"score": <0-100>, "feedback": "<short feedback>"}}]}}"""},
                {"role": "user", "content": answers_text}
            ], model=SMART_MODEL, temperature=0.3, max_tokens=600)
        resp = await loop.run_in_executor(None, _call)
        raw = resp.choices[0].message.content.strip()
        start, end = raw.find("{"), raw.rfind("}")
        result = json.loads(raw[start:end+1]) if start != -1 else {}
        if candidate_id and result.get("overall_score"):
            conn = sqlite3.connect("sessions.db")
            c = conn.cursor()
            c.execute("INSERT INTO sessions (candidate_id, date, score, grade, eye_contact, wpm, filler_count, question, transcript, overall_feedback) VALUES (?,?,?,?,?,?,?,?,?,?)",
                (candidate_id, datetime.now().strftime("%b %d"), result.get("overall_score", 0), result.get("grade", "B"),
                 0, 0, 0, f"Mock Interview ({len(answers)} questions)", "", result.get("summary", "")))
            conn.commit()
            conn.close()
        return result
    except Exception as e:
        return {"error": str(e)}


@app.post("/related-questions")
async def related_questions(data: RelatedBody):
    question = data.question[:300]
    role = data.role
    level = data.level
    topics = SUBJECT_TOPICS.get(role, "relevant domain knowledge")
    try:
        loop = asyncio.get_running_loop()
        def _call():
            return groq_call(
                messages=[
                    {"role": "system", "content": f"""You are an expert interviewer for {role}.
Given an interview question, generate exactly 3 related follow-up or similar questions on the same topic.
Respond ONLY as a JSON array of 3 strings: ["question1", "question2", "question3"]"""},
                    {"role": "user", "content": f"Main question: {question}\nRole: {role}, Level: {level}, Topics: {topics}\n\nGenerate 3 related questions:"}
                ],
                model=SMART_MODEL,
                temperature=0.9,
                max_tokens=300,
            )
        resp = await loop.run_in_executor(None, _call)
        raw = resp.choices[0].message.content.strip()
        # extract JSON array
        start, end = raw.find("["), raw.rfind("]")
        questions = json.loads(raw[start:end+1]) if start != -1 else []
        return {"questions": questions[:3]}
    except Exception as e:
        print("Related questions error:", e)
        return {"questions": []}

@app.get("/sessions")
async def get_sessions(candidate_id: int = 0):
    conn = sqlite3.connect("sessions.db")
    c = conn.cursor()
    try:
        if candidate_id:
            c.execute("SELECT id, date, score, grade, eye_contact, wpm, filler_count FROM sessions WHERE candidate_id=? ORDER BY id DESC LIMIT 10", (candidate_id,))
        else:
            c.execute("SELECT id, date, score, grade, eye_contact, wpm, filler_count FROM sessions ORDER BY id DESC LIMIT 20")
        rows = c.fetchall()
    finally:
        conn.close()
    return {"sessions": [
        {"id": r[0], "date": r[1], "score": r[2], "grade": r[3], "eye": r[4], "wpm": r[5], "filler_count": r[6]}
        for r in rows
    ]}

@app.delete("/sessions/reset")
async def reset_sessions(candidate_id: int = 0):
    conn = sqlite3.connect("sessions.db")
    c = conn.cursor()
    try:
        if candidate_id:
            c.execute("DELETE FROM sessions WHERE candidate_id=?", (candidate_id,))
        else:
            c.execute("DELETE FROM sessions")
        conn.commit()
    finally:
        conn.close()
    return {"message": "Sessions cleared"}

@app.post("/evaluate")
async def evaluate_answer(data: EvaluateBody):
    question = data.question[:500]
    transcript = data.transcript
    eye_contact = max(0.0, min(100.0, data.eye_contact))
    filler_count = max(0, data.filler_count)
    wpm = max(0.0, data.wpm)
    candidate_id = data.candidate_id or None

    if not transcript or len(transcript.strip()) < 10:
        return {
            "error": "No answer detected",
            "overall_feedback": "No answer was provided. Please speak clearly into the microphone."
        }

    try:
        loop = asyncio.get_running_loop()
        def _call():
            return groq_call([
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Q: {question}\n\nA: {transcript[:1500]}"}
            ], model=SMART_MODEL, temperature=0.3, max_tokens=400)
        resp = await loop.run_in_executor(None, _call)
        raw = resp.choices[0].message.content.strip()

        try:
            result = json.loads(raw)
        except json.JSONDecodeError:
            result = {"overall_feedback": raw, "total_score": 50, "grade": "B"}

        result["eye_contact"] = round(eye_contact, 1)
        result["filler_count"] = filler_count
        result["wpm"] = round(wpm, 1)

        if eye_contact < 50:
            result["overall_feedback"] += " Your eye contact was low — try to look at the camera more."
        if filler_count > 5:
            result["overall_feedback"] += f" You used {filler_count} filler words — practice pausing instead."

        conn = sqlite3.connect("sessions.db")
        c = conn.cursor()
        c.execute("INSERT INTO sessions (candidate_id, date, score, grade, eye_contact, wpm, filler_count, question, transcript, overall_feedback) VALUES (?,?,?,?,?,?,?,?,?,?)",
            (candidate_id, datetime.now().strftime("%b %d"), result.get("total_score", 0), result.get("grade", "B"),
             eye_contact, wpm, filler_count, question, transcript, result.get("overall_feedback", "")))
        conn.commit()
        conn.close()

        return result

    except Exception as e:
        print("Evaluation Error:", e)
        return {"error": str(e), "overall_feedback": "Evaluation failed. Please try again."}

@app.post("/improve-answer")
async def improve_answer(data: ImproveBody):
    question = data.question[:500]
    transcript = data.transcript
    role = data.role
    try:
        loop = asyncio.get_running_loop()
        resp = await loop.run_in_executor(None, lambda: groq_call([{
            "role": "system",
            "content": f"You are an interview coach for {role}. Rewrite the answer as a concise STAR method response with Situation, Task, Action, Result labels."
        }, {
            "role": "user",
            "content": f"Q: {question}\n\nOriginal: {transcript[:800]}\n\nRewrite as STAR:"
        }], temperature=0.5, max_tokens=350))
        return {"improved": resp.choices[0].message.content.strip()}
    except Exception as e:
        return {"improved": "Could not generate improved answer. Please try again."}

@app.post("/followup")
async def followup_question(data: FollowupBody):
    question = data.question[:500]
    transcript = data.transcript
    role = data.role
    try:
        loop = asyncio.get_running_loop()
        resp = await loop.run_in_executor(None, lambda: groq_call([{
            "role": "system",
            "content": f"You are a tough interviewer for {role}. Ask ONE sharp follow-up question. Return ONLY the question."
        }, {
            "role": "user",
            "content": f"Q: {question}\nA: {transcript[:500]}\n\nFollow-up:"
        }], temperature=0.7, max_tokens=300))
        return {"followup": resp.choices[0].message.content.strip().strip('"')}
    except Exception as e:
        return {"followup": "Can you elaborate more on the specific actions you took?"}

@app.get("/leaderboard")
async def leaderboard():
    conn = sqlite3.connect("sessions.db")
    c = conn.cursor()
    try:
        c.execute("SELECT ca.id, ca.name, ca.role, MAX(s.score) as best_score, COUNT(s.id) as sessions FROM candidates ca JOIN sessions s ON s.candidate_id=ca.id GROUP BY ca.id ORDER BY best_score DESC LIMIT 20")
        rows = c.fetchall()
    finally:
        conn.close()
    return {"leaderboard": [{"id":r[0],"name":r[1],"role":r[2],"best_score":r[3],"best_grade":"A" if r[3]>=90 else "B" if r[3]>=75 else "C" if r[3]>=60 else "D","sessions":r[4]} for r in rows]}

@app.get("/sessions/full")
async def get_sessions_full(candidate_id: int = 0):
    conn = sqlite3.connect("sessions.db")
    c = conn.cursor()
    try:
        if candidate_id:
            c.execute("SELECT id, date, score, grade, eye_contact, wpm, filler_count, question, transcript, overall_feedback FROM sessions WHERE candidate_id=? ORDER BY id ASC", (candidate_id,))
        else:
            c.execute("SELECT id, date, score, grade, eye_contact, wpm, filler_count, question, transcript, overall_feedback FROM sessions ORDER BY id ASC LIMIT 100")
        rows = c.fetchall()
    finally:
        conn.close()
    return {"sessions": [{"id":r[0],"date":r[1],"score":r[2],"grade":r[3],"eye":r[4],"wpm":r[5],"filler_count":r[6],"question":r[7],"transcript":r[8],"overall_feedback":r[9]} for r in rows]}

@app.post("/improve-resume")
async def improve_resume(data: ResumeBody):
    resume = data.resume
    role = data.role
    try:
        loop = asyncio.get_running_loop()
        resp = await loop.run_in_executor(None, lambda: groq_call([{
            "role": "system",
            "content": f"You are a resume writer for {role}. Rewrite the resume with strong action verbs, quantified achievements, and ATS keywords. Return ONLY the improved resume text."
        }, {
            "role": "user",
            "content": f"Improve this resume for {role}:\n\n{resume[:2500]}"
        }], model=SMART_MODEL, temperature=0.4, max_tokens=1200))
        return {"improved": resp.choices[0].message.content.strip()}
    except Exception as e:
        return {"improved": "", "error": str(e)}

@app.post("/roast-resume")
async def roast_resume(data: ResumeBody):
    resume = data.resume
    role = data.role
    try:
        loop = asyncio.get_running_loop()
        resp = await loop.run_in_executor(None, lambda: groq_call([{
            "role": "system", "content": f'You are a resume reviewer for {role}. Respond ONLY in JSON: {{"score": <0-100>, "verdict": "<1 sentence>", "strengths": ["x","x"], "weaknesses": ["x","x"], "quick_wins": ["x","x"], "ats_tips": ["x","x"]}}'
        }, {
            "role": "user", "content": f"Review this resume for {role}:\n\n{resume[:2000]}"
        }], temperature=0.5, max_tokens=400))
        raw = resp.choices[0].message.content.strip()
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {"score": 50, "verdict": raw, "strengths": [], "weaknesses": [], "quick_wins": [], "ats_tips": []}
    except Exception as e:
        return {"error": str(e)}

@app.post("/quiz")
async def generate_quiz(data: WarmupBody):
    role = data.role
    try:
        loop = asyncio.get_running_loop()
        resp = await loop.run_in_executor(None, lambda: groq_call([{
            "role": "system", "content": 'Generate exactly 10 MCQ questions. Respond ONLY in JSON: {"questions": [{"question": "<q>", "options": ["A","B","C","D"], "answer": <0-3>}]}'
        }, {
            "role": "user", "content": f"10 MCQ quiz for {role} interview."
        }], temperature=0.7, max_tokens=1500))
        raw = resp.choices[0].message.content.strip()
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {"questions": []}
    except Exception:
        return {"questions": []}

@app.post("/chat")
async def chat(data: ChatBody):
    message = data.message.strip()[:1000]
    role = data.role
    history = data.history[-6:]
    if not message:
        return {"reply": "Please ask a question."}
    messages = [
        {"role": "system", "content": f"""You are InterviewIQ Pro, an expert interview coach for {role} roles.
Help the candidate with interview preparation: answer questions about interview tips, STAR method, technical concepts, behavioral questions, resume advice, and career guidance.
Be concise, practical, and encouraging. Format responses clearly."""},
    ]
    for h in history[-6:]:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": message})
    try:
        loop = asyncio.get_running_loop()
        resp = await loop.run_in_executor(None, lambda: groq_call(messages, temperature=0.7, max_tokens=300))
        return {"reply": resp.choices[0].message.content.strip()}
    except Exception as e:
        return {"reply": f"Sorry, I couldn't process that. Please try again. ({str(e)})"}

@app.post("/feedback")
async def submit_feedback(data: FeedbackBody):
    candidate_id = data.candidate_id or None
    candidate_name = data.candidate_name[:100]
    rating = data.rating
    category = data.category[:50]
    message = data.message
    conn = sqlite3.connect("sessions.db")
    c = conn.cursor()
    try:
        c.execute("INSERT INTO feedback (candidate_id, candidate_name, rating, category, message, created_at) VALUES (?,?,?,?,?,?)",
                  (candidate_id, candidate_name, rating, category, message, datetime.now().strftime("%Y-%m-%d %H:%M")))
        conn.commit()
    finally:
        conn.close()
    return {"message": "Feedback submitted successfully"}

@app.get("/feedback")
async def get_feedback():
    conn = sqlite3.connect("sessions.db")
    c = conn.cursor()
    try:
        c.execute("SELECT candidate_name, rating, category, message, created_at FROM feedback ORDER BY id DESC LIMIT 50")
        rows = c.fetchall()
    finally:
        conn.close()
    return {"feedback": [{"name": r[0], "rating": r[1], "category": r[2], "message": r[3], "date": r[4]} for r in rows]}

@app.websocket("/ws/transcribe")
async def websocket_endpoint(websocket: WebSocket, lang: str = "or"):
    await websocket.accept()
    print("✅ Client connected")
    session_id = uuid.uuid4().hex
    audio_path = f"audio_{session_id}.webm"
    chunk_count = 0
    try:
        while True:
            try:
                data = await websocket.receive_bytes()
                chunk_count += 1
                print(f"📦 Chunk {chunk_count} received: {len(data)} bytes")
                with open(audio_path, "ab") as f:
                    f.write(data)
                file_size = os.path.getsize(audio_path)
                print(f"📁 Total file size: {file_size} bytes")
                try:
                    with open(audio_path, "rb") as f:
                        result = client.audio.transcriptions.create(
                            file=(audio_path, f, "audio/webm"),
                            model="whisper-large-v3",
                            language=lang,
                            response_format="text"
                        )
                    text = result.strip() if isinstance(result, str) else result.text.strip()
                    print(f"🎤 Transcription result: [{text}]")
                    if text:
                        await websocket.send_text(text)
                except Exception as e:
                    print(f"❌ Transcription error: {type(e).__name__}: {e}")
            except Exception as e:
                print(f"❌ Receive error: {type(e).__name__}: {e}")
                break
    except Exception as e:
        print(f"❌ Disconnected: {e}")
    finally:
        print(f"🔌 Session ended. Total chunks: {chunk_count}")
        if os.path.exists(audio_path):
            os.remove(audio_path)
