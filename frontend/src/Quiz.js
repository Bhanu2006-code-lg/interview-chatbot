import React, { useState } from "react";
import API_BASE from "./api";

export default function Quiz({ candidate }) {
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const startQuiz = async () => {
    setLoading(true); setSelected({}); setCurrent(0); setDone(false);
    try {
      const res = await fetch(`${API_BASE}/quiz`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: candidate.role }),
      });
      const d = await res.json();
      setQuiz(d.questions || []);
    } catch { setQuiz([]); }
    setLoading(false);
  };

  const pick = (idx) => {
    if (done) return;
    setSelected(s => ({ ...s, [current]: idx }));
  };

  const next = () => {
    if (current < quiz.length - 1) setCurrent(c => c + 1);
    else setDone(true);
  };

  const score = quiz ? quiz.reduce((acc, q, i) => acc + (selected[i] === q.answer ? 1 : 0), 0) : 0;
  const pct = quiz ? Math.round((score / quiz.length) * 100) : 0;
  const scoreColor = pct >= 80 ? "#4CAF50" : pct >= 60 ? "#2196F3" : pct >= 40 ? "#FF9800" : "#f44336";

  if (!quiz) return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "60px 24px", color: "white", textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🧠</div>
      <div style={{ fontSize: 26, fontWeight: "bold", marginBottom: 8 }}>Role Knowledge Quiz</div>
      <div style={{ fontSize: 14, color: "#aaa", marginBottom: 32 }}>10 rapid-fire MCQs tailored for <span style={{ color: "#4CAF50" }}>{candidate.role}</span></div>
      <button onClick={startQuiz} disabled={loading}
        style={{ padding: "14px 40px", fontSize: 16, fontWeight: "bold", background: "linear-gradient(135deg,#4CAF50,#2196F3)", border: "none", borderRadius: 25, color: "white", cursor: "pointer" }}>
        {loading ? "Generating Quiz..." : "🚀 Start Quiz"}
      </button>
    </div>
  );

  if (done) return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px", color: "white" }}>
      <div style={{ background: "#1a1a2e", border: `1px solid ${scoreColor}55`, borderRadius: 16, padding: 32, textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 56, fontWeight: "bold", color: scoreColor }}>{pct}%</div>
        <div style={{ fontSize: 18, marginTop: 8 }}>{score}/{quiz.length} correct</div>
        <div style={{ fontSize: 14, color: "#aaa", marginTop: 8 }}>{pct >= 80 ? "🎉 Excellent! You're well prepared." : pct >= 60 ? "👍 Good effort, keep studying!" : "📚 More practice needed."}</div>
        <button onClick={startQuiz} style={{ marginTop: 20, padding: "10px 28px", background: "linear-gradient(135deg,#4CAF50,#2196F3)", border: "none", borderRadius: 20, color: "white", cursor: "pointer", fontWeight: "bold" }}>
          🔄 Retake Quiz
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {quiz.map((q, i) => {
          const correct = selected[i] === q.answer;
          return (
            <div key={i} style={{ background: "#1a1a2e", border: `1px solid ${correct ? "#4CAF5044" : "#f4433644"}`, borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 13, color: "#aaa", marginBottom: 6 }}>Q{i+1}. {q.question}</div>
              <div style={{ fontSize: 13 }}>
                <span style={{ color: correct ? "#4CAF50" : "#f44336" }}>{correct ? "✅" : "❌"} Your answer: {q.options[selected[i]] ?? "—"}</span>
                {!correct && <span style={{ color: "#4CAF50", marginLeft: 12 }}>✔ Correct: {q.options[q.answer]}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const q = quiz[current];
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "30px 24px", color: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#aaa" }}>Question {current + 1} of {quiz.length}</div>
        <div style={{ height: 6, flex: 1, margin: "0 16px", background: "#2a2a4a", borderRadius: 3 }}>
          <div style={{ height: "100%", background: "#4CAF50", borderRadius: 3, width: `${((current + 1) / quiz.length) * 100}%`, transition: "width 0.3s" }} />
        </div>
        <div style={{ fontSize: 13, color: "#4CAF50", fontWeight: "bold" }}>{score} pts</div>
      </div>

      <div style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 16, lineHeight: 1.7, color: "white" }}>{q.question}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {q.options.map((opt, i) => {
          const picked = selected[current] === i;
          const correct = selected[current] !== undefined && i === q.answer;
          const wrong = picked && i !== q.answer;
          return (
            <button key={i} onClick={() => pick(i)}
              style={{ padding: "14px 18px", textAlign: "left", background: correct ? "#4CAF5022" : wrong ? "#f4433622" : picked ? "#2196F322" : "#1a1a2e", border: `1px solid ${correct ? "#4CAF50" : wrong ? "#f44336" : picked ? "#2196F3" : "#2a2a4a"}`, borderRadius: 10, color: "white", cursor: selected[current] !== undefined ? "default" : "pointer", fontSize: 14, transition: "all 0.15s" }}>
              <span style={{ color: "#888", marginRight: 10 }}>{String.fromCharCode(65 + i)}.</span>{opt}
            </button>
          );
        })}
      </div>

      {selected[current] !== undefined && (
        <button onClick={next}
          style={{ width: "100%", padding: 14, fontSize: 15, fontWeight: "bold", background: "linear-gradient(135deg,#4CAF50,#2196F3)", border: "none", borderRadius: 10, color: "white", cursor: "pointer" }}>
          {current < quiz.length - 1 ? "Next Question →" : "See Results 🎯"}
        </button>
      )}
    </div>
  );
}
