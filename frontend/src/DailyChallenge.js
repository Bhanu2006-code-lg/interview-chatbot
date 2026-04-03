import React, { useState, useEffect, useRef } from "react";
import API_BASE from "./api";

export default function DailyChallenge({ candidate }) {
  const today = new Date().toDateString();
  const storageKey = `daily_${candidate.id}_${today}`;
  const [done, setDone] = useState(() => !!localStorage.getItem(storageKey));
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(180);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : null;
  });
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const answerRef = useRef("");

  useEffect(() => {
    fetch(`${API_BASE}/question?role=${encodeURIComponent(candidate.role)}&level=Advanced`)
      .then(r => r.json()).then(d => setQuestion(d.question || "")).catch(() => {});
  }, [candidate.role]);

  const start = () => {
    setStarted(true);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); submit(answerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const submit = async (ans) => {
    clearInterval(timerRef.current);
    setStarted(false);
    if (!ans.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/evaluate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, transcript: ans, eye_contact: 80, filler_count: 0, wpm: 130, candidate_id: candidate.id }),
      });
      const d = await res.json();
      const r = { score: d.total_score, grade: d.grade, feedback: d.overall_feedback };
      localStorage.setItem(storageKey, JSON.stringify(r));
      setResult(r); setDone(true);
    } catch {}
    setLoading(false);
  };

  const gc = g => ({ A: "#4CAF50", B: "#2196F3", C: "#FF9800" }[g] || "#f44336");
  const mins = Math.floor(timeLeft / 60), secs = String(timeLeft % 60).padStart(2, "0");

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "30px 24px", color: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: "bold" }}>🎯 Daily Challenge</div>
          <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>One hard question per day — 3 minutes on the clock</div>
        </div>
        <div style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 10, padding: "8px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#888" }}>TODAY</div>
          <div style={{ fontSize: 13, fontWeight: "bold", color: "#4CAF50" }}>{new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</div>
        </div>
      </div>

      <div style={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#FF9800", fontWeight: "bold", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>🔥 Today's Question — {candidate.role}</div>
        <div style={{ fontSize: 17, lineHeight: 1.8, color: "white" }}>{question || "Loading..."}</div>
      </div>

      {done && result ? (
        <div style={{ background: "#1a1a2e", border: `1px solid ${gc(result.grade)}55`, borderRadius: 14, padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#aaa", marginBottom: 12 }}>✅ Challenge Completed!</div>
          <div style={{ fontSize: 56, fontWeight: "bold", color: gc(result.grade) }}>{result.score}</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>/ 100 — Grade <span style={{ color: gc(result.grade), fontWeight: "bold" }}>{result.grade}</span></div>
          <div style={{ fontSize: 14, color: "#ccc", lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>{result.feedback}</div>
          <div style={{ marginTop: 20, fontSize: 13, color: "#555" }}>Come back tomorrow for a new challenge 🌅</div>
        </div>
      ) : (
        <>
          {started && (
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 48, fontWeight: "bold", color: timeLeft <= 30 ? "#f44336" : "#4CAF50" }}>{mins}:{secs}</div>
              <div style={{ height: 6, background: "#333", borderRadius: 3, marginTop: 8 }}>
                <div style={{ height: "100%", background: timeLeft <= 30 ? "#f44336" : "#4CAF50", borderRadius: 3, width: `${(timeLeft/180)*100}%`, transition: "width 1s linear" }} />
              </div>
            </div>
          )}
          <textarea value={answer} onChange={e => { answerRef.current = e.target.value; setAnswer(e.target.value); }} disabled={!started}
            placeholder={started ? "Type your answer here..." : "Click 'Start Challenge' to begin the timer"}
            style={{ width: "100%", minHeight: 160, padding: 16, background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, color: started ? "#ddd" : "#555", fontSize: 14, lineHeight: 1.7, resize: "none", outline: "none", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            {!started ? (
              <button onClick={start} style={{ flex: 1, padding: 14, fontSize: 15, fontWeight: "bold", background: "linear-gradient(135deg,#FF9800,#f44336)", border: "none", borderRadius: 10, color: "white", cursor: "pointer" }}>
                ⏱ Start Challenge
              </button>
            ) : (
              <button onClick={() => submit(answer)} disabled={loading || !answer.trim()}
                style={{ flex: 1, padding: 14, fontSize: 15, fontWeight: "bold", background: loading ? "#333" : "#4CAF50", border: "none", borderRadius: 10, color: "white", cursor: "pointer" }}>
                {loading ? "Evaluating..." : "✅ Submit Answer"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
