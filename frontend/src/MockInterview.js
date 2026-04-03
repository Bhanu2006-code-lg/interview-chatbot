import React, { useState, useRef, useEffect } from "react";
import API_BASE from "./api";

const TOTAL = 5;

export default function MockInterview({ candidate, selectedCourse, onBack }) {
  const [phase, setPhase] = useState("intro"); // intro | question | result
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [inputMode, setInputMode] = useState("voice"); // voice | text
  const [micActive, setMicActive] = useState(false);

  const recRef = useRef(null);
  const isRecRef = useRef(false);
  const transcriptRef = useRef("");
  const countdownRef = useRef(null);
  const usedRef = useRef([]);

  useEffect(() => {
    loadQuestions();
    return () => { clearInterval(countdownRef.current); stopSR(); };
  }, [selectedCourse.role]);

  const loadQuestions = async () => {
    const qs = [];
    for (let i = 0; i < TOTAL; i++) {
      try {
        const used = encodeURIComponent(usedRef.current.join("|"));
        const r = await fetch(`${API_BASE}/question?role=${encodeURIComponent(selectedCourse.role)}&level=Intermediate&t=${Date.now()}&used=${used}`);
        const d = await r.json();
        if (d.question) { qs.push(d.question); usedRef.current.push(d.question); }
      } catch {}
    }
    setQuestions(qs);
  };

  const startInterview = () => {
    setPhase("question");
    setCurrent(0);
    setAnswers([]);
    startTimer();
  };

  const startTimer = () => {
    setTimeLeft(120);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(countdownRef.current); handleNext(); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const stopSR = () => {
    isRecRef.current = false;
    try { recRef.current?.stop(); } catch {}
    recRef.current = null;
  };

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Use Chrome or Edge for voice."); return; }
    transcriptRef.current = "";
    setTranscript("");
    isRecRef.current = true;
    setRecording(true);

    let restartTimer = null;
    function scheduleRestart(delay = 100) {
      clearTimeout(restartTimer);
      restartTimer = setTimeout(() => { if (isRecRef.current) runSR(); }, delay);
    }

    function runSR() {
      if (!isRecRef.current) return;
      const r = new SR();
      r.continuous = true; r.interimResults = true; r.maxAlternatives = 1; r.lang = "en-US";
      recRef.current = r;
      r.onspeechstart = () => setMicActive(true);
      r.onspeechend = () => setMicActive(false);
      r.onresult = (e) => {
        let newFinal = "", interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) newFinal += t + " ";
          else interim += t;
        }
        if (newFinal) {
          transcriptRef.current = (transcriptRef.current + " " + newFinal).trim();
        }
        setTranscript(interim ? (transcriptRef.current + " " + interim).trim() : transcriptRef.current);
      };
      r.onerror = (e) => {
        setMicActive(false);
        if (isRecRef.current) scheduleRestart(e.error === "no-speech" ? 300 : 80);
      };
      r.onend = () => { setMicActive(false); if (isRecRef.current) scheduleRestart(100); };
      try { r.start(); } catch { if (isRecRef.current) scheduleRestart(150); }
    }
    runSR();
  };

  const stopRecording = () => { stopSR(); setRecording(false); setMicActive(false); };

  const handleNext = () => {
    clearInterval(countdownRef.current);
    stopRecording();
    const ans = inputMode === "voice" ? transcriptRef.current : textAnswer;
    const newAnswers = [...answers, { question: questions[current], transcript: ans || "(no answer)" }];
    setAnswers(newAnswers);
    setTranscript(""); transcriptRef.current = ""; setTextAnswer(""); setHint("");

    if (current + 1 < questions.length) {
      setCurrent(c => c + 1);
      startTimer();
    } else {
      submitAll(newAnswers);
    }
  };

  const submitAll = async (allAnswers) => {
    setPhase("result");
    setEvalLoading(true);
    try {
      const res = await fetch(`${API_BASE}/mock-interview/evaluate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: allAnswers, role: selectedCourse.role, candidate_id: candidate.id })
      });
      const d = await res.json();
      setResult(d);
    } catch {}
    setEvalLoading(false);
  };

  const getHint = async () => {
    setHintLoading(true);
    try {
      const r = await fetch(`${API_BASE}/hint`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questions[current], role: selectedCourse.role })
      });
      const d = await r.json();
      setHint(d.hint || "");
    } catch {}
    setHintLoading(false);
  };

  const gc = g => ({ A: "#4CAF50", B: "#2196F3", C: "#FF9800" }[g] || "#f44336");

  // ── INTRO ──
  if (phase === "intro") return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px", color: "white", textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
      <div style={{ fontSize: 26, fontWeight: "bold", marginBottom: 8 }}>Mock Interview</div>
      <div style={{ fontSize: 14, color: "#aaa", marginBottom: 8 }}>{selectedCourse.icon} {selectedCourse.title}</div>
      <div style={{ fontSize: 14, color: "#aaa", marginBottom: 32 }}>
        {TOTAL} questions · 2 minutes each · Full AI report at the end
      </div>
      <div style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, padding: 20, marginBottom: 24, textAlign: "left" }}>
        {[["🎤", "Answer by voice or typing"], ["💡", "Get hints if you're stuck"], ["⏱", "2 minutes per question"], ["📊", "Full scorecard after all 5"]].map(([ic, txt]) => (
          <div key={txt} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, fontSize: 14, color: "#ccc" }}>
            <span style={{ fontSize: 18 }}>{ic}</span>{txt}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: "#aaa" }}>Answer mode:</span>
        {[["voice", "🎤 Voice"], ["text", "⌨️ Type"]].map(([m, l]) => (
          <button key={m} onClick={() => setInputMode(m)}
            style={{ padding: "6px 16px", borderRadius: 20, border: inputMode === m ? "none" : "1px solid #555", background: inputMode === m ? "#2196F3" : "transparent", color: "white", cursor: "pointer", fontSize: 13 }}>
            {l}
          </button>
        ))}
      </div>
      {questions.length < TOTAL
        ? <div style={{ color: "#4CAF50", fontSize: 14 }}>⏳ Loading questions...</div>
        : <button onClick={startInterview}
            style={{ padding: "14px 40px", fontSize: 16, fontWeight: "bold", background: "linear-gradient(135deg,#4CAF50,#2196F3)", border: "none", borderRadius: 25, color: "white", cursor: "pointer" }}>
            🚀 Start Mock Interview
          </button>
      }
      <button onClick={onBack} style={{ display: "block", margin: "16px auto 0", background: "transparent", border: "none", color: "#666", cursor: "pointer", fontSize: 13 }}>← Back</button>
    </div>
  );

  // ── QUESTION ──
  if (phase === "question") return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "30px 24px", color: "white" }}>
      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        {questions.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < current ? "#4CAF50" : i === current ? "#2196F3" : "#2a2a4a" }} />
        ))}
        <span style={{ fontSize: 13, color: "#aaa", whiteSpace: "nowrap" }}>{current + 1}/{questions.length}</span>
      </div>

      {/* Timer */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 36, fontWeight: "bold", color: timeLeft <= 20 ? "#f44336" : timeLeft <= 40 ? "#FF9800" : "#4CAF50" }}>
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </span>
        <div style={{ height: 4, background: "#2a2a4a", borderRadius: 2, marginTop: 6 }}>
          <div style={{ height: "100%", borderRadius: 2, background: timeLeft <= 20 ? "#f44336" : "#4CAF50", width: `${(timeLeft / 120) * 100}%`, transition: "width 1s linear" }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 12, padding: "18px 20px", marginBottom: 16, fontSize: 17, lineHeight: 1.7 }}>
        {questions[current]}
      </div>

      {/* Hint */}
      {hint && <div style={{ background: "#FF980015", border: "1px solid #FF980055", borderRadius: 10, padding: "12px 16px", marginBottom: 14, fontSize: 13, color: "#FFB74D", lineHeight: 1.6 }}>💡 {hint}</div>}

      {/* Answer area */}
      {inputMode === "voice" ? (
        <div style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, padding: 16, marginBottom: 14, minHeight: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>🎙 Your Answer</span>
            {recording && <span style={{ fontSize: 11, color: micActive ? "#4CAF50" : "#888", background: micActive ? "#4CAF5022" : "#ffffff11", padding: "2px 8px", borderRadius: 20 }}>
              {micActive ? "● Listening..." : "Waiting..."}
            </span>}
          </div>
          <div style={{ color: transcript ? "#ddd" : "#555", fontSize: 14, lineHeight: 1.6 }}>{transcript || "Click 'Start Speaking' and answer out loud..."}</div>
        </div>
      ) : (
        <textarea value={textAnswer} onChange={e => setTextAnswer(e.target.value)}
          placeholder="Type your answer here..."
          style={{ width: "100%", minHeight: 120, padding: 14, background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, color: "#ddd", fontSize: 14, lineHeight: 1.6, resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 14 }} />
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {inputMode === "voice" && (
          !recording
            ? <button onClick={startRecording} style={{ flex: 1, padding: 12, background: "linear-gradient(135deg,#4CAF50,#2196F3)", border: "none", borderRadius: 10, color: "white", cursor: "pointer", fontWeight: "bold", fontSize: 14 }}>🎤 Start Speaking</button>
            : <button onClick={stopRecording} style={{ flex: 1, padding: 12, background: "#f44336", border: "none", borderRadius: 10, color: "white", cursor: "pointer", fontWeight: "bold", fontSize: 14 }}>■ Stop</button>
        )}
        <button onClick={getHint} disabled={hintLoading || !!hint}
          style={{ padding: "12px 18px", background: "transparent", border: "1px solid #FF9800", borderRadius: 10, color: "#FF9800", cursor: "pointer", fontSize: 13 }}>
          {hintLoading ? "..." : "💡 Hint"}
        </button>
        <button onClick={handleNext}
          style={{ flex: 1, padding: 12, background: current + 1 < questions.length ? "#2196F3" : "#4CAF50", border: "none", borderRadius: 10, color: "white", cursor: "pointer", fontWeight: "bold", fontSize: 14 }}>
          {current + 1 < questions.length ? "Next →" : "Finish ✓"}
        </button>
      </div>
    </div>
  );

  // ── RESULT ──
  if (phase === "result") return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "30px 24px", color: "white" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: "bold" }}>📋 Mock Interview Report</div>
        <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>{selectedCourse.icon} {selectedCourse.title}</div>
      </div>

      {evalLoading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#4CAF50", fontSize: 16 }}>🤖 Analyzing your performance...</div>
      ) : result && (
        <>
          {/* Overall */}
          <div style={{ background: "#1a1a2e", border: `1px solid ${gc(result.grade)}55`, borderRadius: 14, padding: 24, marginBottom: 20, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center", minWidth: 80 }}>
              <div style={{ fontSize: 52, fontWeight: "bold", color: gc(result.grade) }}>{result.overall_score}</div>
              <div style={{ fontSize: 12, color: "#888" }}>/ 100</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <span style={{ background: gc(result.grade), color: "white", padding: "4px 14px", borderRadius: 20, fontWeight: "bold", fontSize: 15 }}>{result.grade}</span>
              </div>
              <div style={{ fontSize: 14, color: "#ddd", lineHeight: 1.7 }}>{result.summary}</div>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div style={{ background: "#1a1a2e", border: "1px solid #4CAF5033", borderRadius: 12, padding: 18 }}>
              <div style={{ color: "#4CAF50", fontWeight: "bold", marginBottom: 10, fontSize: 13 }}>💪 Strengths</div>
              {(result.strengths || []).map((s, i) => <div key={i} style={{ fontSize: 13, color: "#ccc", marginBottom: 6 }}>✓ {s}</div>)}
            </div>
            <div style={{ background: "#1a1a2e", border: "1px solid #FF980033", borderRadius: 12, padding: 18 }}>
              <div style={{ color: "#FF9800", fontWeight: "bold", marginBottom: 10, fontSize: 13 }}>📈 Improve</div>
              {(result.improvements || []).map((s, i) => <div key={i} style={{ fontSize: 13, color: "#ccc", marginBottom: 6 }}>→ {s}</div>)}
            </div>
          </div>

          {/* Per question */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Question Breakdown</div>
            {answers.map((a, i) => (
              <div key={i} style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "#aaa" }}>Q{i + 1}. {a.question}</span>
                  <span style={{ fontWeight: "bold", color: gc(result.per_question?.[i]?.score >= 80 ? "A" : result.per_question?.[i]?.score >= 60 ? "B" : "C") }}>{result.per_question?.[i]?.score ?? "—"}/100</span>
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>{result.per_question?.[i]?.feedback}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setPhase("intro"); setResult(null); setAnswers([]); setCurrent(0); loadQuestions(); }}
              style={{ flex: 1, padding: 13, background: "linear-gradient(135deg,#4CAF50,#2196F3)", border: "none", borderRadius: 10, color: "white", cursor: "pointer", fontWeight: "bold", fontSize: 14 }}>
              🔄 Retry Mock Interview
            </button>
            <button onClick={onBack}
              style={{ padding: "13px 20px", background: "transparent", border: "1px solid #555", borderRadius: 10, color: "#aaa", cursor: "pointer", fontSize: 14 }}>
              ← Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}
