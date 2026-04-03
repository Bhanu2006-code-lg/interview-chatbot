import React, { useState, useRef, useEffect } from "react";
import API_BASE from "./api";

const QUESTIONS_PER_ROUND = 5;

export default function PeerInterview({ candidate }) {
  const [phase, setPhase] = useState("setup"); // setup | waiting | interview | result
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [role, setRole] = useState("interviewer"); // interviewer | interviewee
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);
  const [scores, setScores] = useState({});
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const countdownRef = useRef(null);

  const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const createRoom = async () => {
    const code = generateRoomCode();
    setRoomCode(code);
    setRole("interviewer");
    setLoading(true);
    try {
      const qs = [];
      for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
        const r = await fetch(`${API_BASE}/question?role=${encodeURIComponent(candidate.role)}&level=Intermediate&t=${Date.now() + i}`);
        const d = await r.json();
        if (d.question) qs.push(d.question);
      }
      setQuestions(qs);
      setPhase("waiting");
    } catch { alert("Failed to load questions. Try again."); }
    setLoading(false);
  };

  const joinRoom = () => {
    if (!joinCode.trim()) { alert("Enter a room code."); return; }
    setRoomCode(joinCode.toUpperCase());
    setRole("interviewee");
    setPhase("waiting");
    // In a real app this would connect via WebSocket — here we simulate locally
    setTimeout(() => startInterview(), 1000);
  };

  const startInterview = () => {
    setCurrent(0);
    setAnswers([]);
    setCurrentAnswer("");
    setPhase("interview");
    startTimer();
  };

  const startTimer = () => {
    setTimeLeft(120);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(countdownRef.current); handleNext(); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleNext = () => {
    clearInterval(countdownRef.current);
    const newAnswers = [...answers, { question: questions[current] || "", answer: currentAnswer || "(no answer)" }];
    setAnswers(newAnswers);
    setCurrentAnswer("");

    if (current + 1 < questions.length) {
      setCurrent(c => c + 1);
      startTimer();
    } else {
      finishInterview(newAnswers);
    }
  };

  const finishInterview = async (allAnswers) => {
    setPhase("result");
    setLoading(true);
    // Auto-score each answer using AI
    const newScores = {};
    const newFeedback = {};
    for (let i = 0; i < allAnswers.length; i++) {
      try {
        const res = await fetch(`${API_BASE}/evaluate`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: allAnswers[i].question, transcript: allAnswers[i].answer, eye_contact: 75, filler_count: 0, wpm: 120, candidate_id: candidate.id })
        });
        const d = await res.json();
        newScores[i] = d.total_score || 0;
        newFeedback[i] = d.overall_feedback || "";
      } catch { newScores[i] = 0; }
    }
    setScores(newScores);
    setFeedback(newFeedback);
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setPhase("setup"); setRoomCode(""); setJoinCode(""); setQuestions([]);
    setCurrent(0); setAnswers([]); setCurrentAnswer(""); setScores({}); setFeedback({});
    clearInterval(countdownRef.current);
  };

  useEffect(() => () => clearInterval(countdownRef.current), []);

  const avgScore = Object.values(scores).length ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length) : 0;
  const gc = s => s >= 80 ? "#4CAF50" : s >= 60 ? "#2196F3" : s >= 40 ? "#FF9800" : "#f44336";

  // ── SETUP ──
  if (phase === "setup") return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px", color: "white", textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🤝</div>
      <div style={{ fontSize: 26, fontWeight: "bold", marginBottom: 8 }}>Peer Mock Interview</div>
      <div style={{ fontSize: 14, color: "#aaa", marginBottom: 36 }}>Practice with a friend — one interviews, one answers</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "#1a1a2e", border: "1px solid #4CAF5044", borderRadius: 14, padding: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎙</div>
          <div style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>Create Room</div>
          <div style={{ fontSize: 13, color: "#aaa", marginBottom: 20, lineHeight: 1.6 }}>You act as the interviewer. Share the room code with your friend.</div>
          <button onClick={createRoom} disabled={loading}
            style={{ width: "100%", padding: 12, background: loading ? "#333" : "linear-gradient(135deg,#4CAF50,#2196F3)", border: "none", borderRadius: 10, color: "white", cursor: "pointer", fontWeight: "bold", fontSize: 14 }}>
            {loading ? "Loading questions..." : "🚀 Create Room"}
          </button>
        </div>

        <div style={{ background: "#1a1a2e", border: "1px solid #2196F344", borderRadius: 14, padding: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎯</div>
          <div style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>Join Room</div>
          <div style={{ fontSize: 13, color: "#aaa", marginBottom: 12, lineHeight: 1.6 }}>Enter the room code your friend shared with you.</div>
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter room code..."
            style={{ width: "100%", padding: "10px 12px", background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: 10, color: "white", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 10, textAlign: "center", letterSpacing: 4, fontWeight: "bold" }} />
          <button onClick={joinRoom}
            style={{ width: "100%", padding: 12, background: "linear-gradient(135deg,#2196F3,#9C27B0)", border: "none", borderRadius: 10, color: "white", cursor: "pointer", fontWeight: "bold", fontSize: 14 }}>
            🔗 Join Room
          </button>
        </div>
      </div>

      <div style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, padding: 20, textAlign: "left" }}>
        <div style={{ fontSize: 13, color: "#FF9800", fontWeight: "bold", marginBottom: 12 }}>📖 How it works</div>
        {[["1️⃣", "One person creates a room and shares the code"], ["2️⃣", "Friend joins using the room code"], ["3️⃣", "Answer 5 AI-generated questions (2 min each)"], ["4️⃣", "Get AI scores and feedback for each answer"]].map(([ic, txt]) => (
          <div key={txt} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 13, color: "#ccc" }}>
            <span>{ic}</span><span>{txt}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── WAITING ──
  if (phase === "waiting") return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "60px 24px", color: "white", textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
      <div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>
        {role === "interviewer" ? "Waiting for your friend..." : "Connecting to room..."}
      </div>
      {role === "interviewer" && (
        <>
          <div style={{ fontSize: 14, color: "#aaa", marginBottom: 24 }}>Share this code with your friend</div>
          <div style={{ background: "#1a1a2e", border: "2px solid #4CAF50", borderRadius: 16, padding: "24px 32px", marginBottom: 20, display: "inline-block" }}>
            <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: 8, color: "#4CAF50" }}>{roomCode}</div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24 }}>
            <button onClick={copyCode}
              style={{ padding: "10px 24px", background: copied ? "#4CAF50" : "transparent", border: "1px solid #4CAF50", borderRadius: 20, color: copied ? "white" : "#4CAF50", cursor: "pointer", fontWeight: "bold" }}>
              {copied ? "✅ Copied!" : "📋 Copy Code"}
            </button>
          </div>
          <button onClick={startInterview}
            style={{ padding: "12px 32px", background: "linear-gradient(135deg,#4CAF50,#2196F3)", border: "none", borderRadius: 20, color: "white", cursor: "pointer", fontWeight: "bold", fontSize: 15 }}>
            ▶ Start Interview (Solo Practice)
          </button>
          <div style={{ marginTop: 10, fontSize: 12, color: "#555" }}>Or wait for your friend to join</div>
        </>
      )}
      <button onClick={reset} style={{ display: "block", margin: "20px auto 0", background: "transparent", border: "none", color: "#666", cursor: "pointer", fontSize: 13 }}>← Back</button>
    </div>
  );

  // ── INTERVIEW ──
  if (phase === "interview") return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "30px 24px", color: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        {questions.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < current ? "#4CAF50" : i === current ? "#2196F3" : "#2a2a4a" }} />
        ))}
        <span style={{ fontSize: 13, color: "#aaa", whiteSpace: "nowrap" }}>{current + 1}/{questions.length}</span>
      </div>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 36, fontWeight: "bold", color: timeLeft <= 20 ? "#f44336" : timeLeft <= 40 ? "#FF9800" : "#4CAF50" }}>
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </span>
        <div style={{ height: 4, background: "#2a2a4a", borderRadius: 2, marginTop: 6 }}>
          <div style={{ height: "100%", borderRadius: 2, background: timeLeft <= 20 ? "#f44336" : "#4CAF50", width: `${(timeLeft / 120) * 100}%`, transition: "width 1s linear" }} />
        </div>
      </div>

      <div style={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 12, padding: "18px 20px", marginBottom: 16, fontSize: 17, lineHeight: 1.7 }}>
        {questions[current] || "Loading question..."}
      </div>

      <textarea value={currentAnswer} onChange={e => setCurrentAnswer(e.target.value)}
        placeholder="Type your answer here..."
        style={{ width: "100%", minHeight: 140, padding: 14, background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, color: "#ddd", fontSize: 14, lineHeight: 1.6, resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 14 }} />

      <button onClick={handleNext}
        style={{ width: "100%", padding: 14, fontSize: 15, fontWeight: "bold", background: current + 1 < questions.length ? "linear-gradient(135deg,#2196F3,#9C27B0)" : "linear-gradient(135deg,#4CAF50,#2196F3)", border: "none", borderRadius: 10, color: "white", cursor: "pointer" }}>
        {current + 1 < questions.length ? "Next Question →" : "Finish Interview ✓"}
      </button>
    </div>
  );

  // ── RESULT ──
  if (phase === "result") return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "30px 24px", color: "white" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: "bold" }}>🤝 Peer Interview Results</div>
        <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>Room: {roomCode}</div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#4CAF50", fontSize: 16 }}>🤖 AI is scoring your answers...</div>
      ) : (
        <>
          <div style={{ background: "#1a1a2e", border: `1px solid ${gc(avgScore)}55`, borderRadius: 14, padding: 24, marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 56, fontWeight: "bold", color: gc(avgScore) }}>{avgScore}</div>
            <div style={{ fontSize: 14, color: "#aaa" }}>Average Score / 100</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {answers.map((a, i) => (
              <div key={i} style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 10, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#aaa", flex: 1 }}>Q{i + 1}. {a.question}</span>
                  <span style={{ fontWeight: "bold", color: gc(scores[i] || 0), marginLeft: 12 }}>{scores[i] || 0}/100</span>
                </div>
                <div style={{ fontSize: 13, color: "#ccc", background: "#0f0f1a", padding: "8px 12px", borderRadius: 8, marginBottom: 6 }}>{a.answer}</div>
                {feedback[i] && <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5 }}>💬 {feedback[i]}</div>}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={reset}
              style={{ flex: 1, padding: 13, background: "linear-gradient(135deg,#4CAF50,#2196F3)", border: "none", borderRadius: 10, color: "white", cursor: "pointer", fontWeight: "bold", fontSize: 14 }}>
              🔄 New Session
            </button>
          </div>
        </>
      )}
    </div>
  );
}
