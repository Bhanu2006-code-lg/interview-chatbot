# 🎯 InterviewIQ Pro

AI-powered mock interview platform for **Tech jobs** and **Government of India exams** — with real-time voice transcription, eye contact tracking, instant STAR-method feedback, video recording, peer interviews, and practice scheduling.

---

## ✨ Features

- 🎤 **Live Voice Transcription** — Real-time speech-to-text as you speak
- 👁 **Eye Contact Tracking** — AI monitors your eye contact via camera
- ⭐ **STAR Method Scoring** — Evaluated on Situation, Task, Action & Result
- 📊 **Performance Analytics** — Track WPM, filler words, progress over time
- 🤖 **AI Feedback** — Instant feedback powered by Groq LLaMA 3
- 🧠 **Role Knowledge Quiz** — 10 MCQ questions tailored to your role
- 📝 **Resume Roaster** — AI resume review + improved version
- 🎯 **JD Matcher** — Paste a job description, get 5 tailored questions
- 🏆 **Leaderboard** — Compete with other candidates
- 🌐 **18 Career Tracks** — Tech + Government of India exams
- 🎥 **Video Recorder** — Record your interview and replay to improve
- 📅 **Interview Scheduler** — Set practice reminders with browser notifications
- 🤝 **Peer Mock Interview** — Practice with a friend using room codes
- 💬 **AI Coach Chatbot** — Ask anything about interview prep
- 🎯 **Daily Challenge** — One hard question per day with timer
- 📚 **Interview Books** — Handpicked books for all domains
- 💡 **Interview Tips** — Proven strategies for tech & govt exams
- 🎬 **Interview Process Videos** — Real interview process walkthroughs

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

---

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file:
```
GROQ_API_KEY=your_groq_api_key_here
ALLOWED_ORIGINS=http://localhost:3000
```

Run the backend:
```bash
uvicorn main:app --reload --port 8000
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗂 Project Structure

```
interview-chatbot/
├── backend/
│   ├── main.py               # FastAPI backend
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variables template
└── frontend/
    └── src/
        ├── App.js                # Main app with routing
        ├── api.js                # API base URL config
        ├── courses.js            # Shared course data (18 tracks)
        ├── InterviewRoom.js      # Live interview with camera + voice
        ├── MockInterview.js      # 5-question mock interview
        ├── VideoRecorder.js      # Record & replay interviews
        ├── InterviewScheduler.js # Practice reminders & notifications
        ├── PeerInterview.js      # Peer mock interview with room codes
        ├── Analytics.js          # Performance charts
        ├── Dashboard.js          # Role-specific prep dashboard
        ├── ResumeRoaster.js      # Resume review + improvement
        ├── JDMatcher.js          # Job description analyzer
        ├── Quiz.js               # MCQ knowledge quiz
        ├── DailyChallenge.js     # Daily timed challenge
        ├── Leaderboard.js        # Global rankings
        ├── Chatbot.js            # AI interview coach chat
        ├── Profile.js            # User profile + badges
        ├── Feedback.js           # User feedback & reviews
        ├── Landing.js            # Landing page
        ├── SignIn.js             # Login & register
        ├── CourseSelect.js       # Course selection screen
        └── useSpeechRecognition.js # Reusable speech hook
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 |
| Backend | FastAPI (Python) |
| AI | Groq LLaMA 3 / Gemma |
| Database | SQLite |
| Auth | bcrypt password hashing |
| Speech | Web Speech API |
| Video | MediaRecorder API |
| Charts | Recharts |
| PDF | pdfjs-dist |
| Notifications | Web Notifications API |

---

## 🌐 18 Career Tracks

### 💻 Tech & Private Sector
| Track | Level |
|-------|-------|
| Software Engineering | Intermediate |
| Data Science & ML | Advanced |
| Product Management | Intermediate |
| DevOps & Cloud | Advanced |
| UX/UI Design | Beginner |
| Business Analyst | Beginner |
| Cybersecurity | Advanced |
| AI/ML Engineering | Advanced |
| Mobile Development | Intermediate |

### 🏛️ Government of India
| Track | Level |
|-------|-------|
| UPSC Civil Services (IAS/IPS/IFS) | Advanced |
| IBPS Bank PO/Clerk | Intermediate |
| Railway RRB NTPC | Beginner |
| SSC CGL/CHSL | Intermediate |
| Judiciary/Law Services | Advanced |
| Defence Services NDA/CDS | Advanced |
| State Police Services | Beginner |
| AIIMS/Medical PSU | Advanced |
| Teaching KVS/NVS/TGT/PGT | Intermediate |

---

## 🔐 Security

- Passwords hashed with **bcrypt** (not plain SHA-256)
- API keys stored in `.env` (never committed)
- Input validation on all endpoints
- CORS restricted to allowed origins

---

## 📄 License

MIT License — free to use and modify.

---

## 👨‍💻 Author

**Bhanu** — [GitHub](https://github.com/Bhanu2006-code-lg)
