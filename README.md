# 🎯 InterviewIQ Pro

AI-powered mock interview platform for **Tech jobs** and **Government of India exams** — with real-time voice transcription, eye contact tracking, and instant STAR-method feedback.

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
│   ├── main.py          # FastAPI backend
│   ├── requirements.txt # Python dependencies
│   └── .env.example     # Environment variables template
└── frontend/
    └── src/
        ├── App.js           # Main app with routing
        ├── courses.js       # Shared course data
        ├── InterviewRoom.js # Live interview with camera + voice
        ├── Analytics.js     # Performance charts
        ├── Dashboard.js     # Role-specific prep dashboard
        ├── MockInterview.js # 5-question mock interview
        ├── ResumeRoaster.js # Resume review + improvement
        ├── JDMatcher.js     # Job description analyzer
        ├── Quiz.js          # MCQ knowledge quiz
        ├── Leaderboard.js   # Global rankings
        ├── Chatbot.js       # AI interview coach chat
        └── Profile.js       # User profile + badges
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 |
| Backend | FastAPI (Python) |
| AI | Groq LLaMA 3 / Gemma |
| Database | SQLite |
| Speech | Web Speech API |
| Charts | Recharts |
| PDF | pdfjs-dist |

---

## 📄 License

MIT License — free to use and modify.
