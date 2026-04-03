import React, { useState } from "react";
import API_BASE from "./api";

export default function JDMatcher({ candidate }) {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeQ, setActiveQ] = useState(null);

  const analyze = async () => {
    if (!jd.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch(`${API_BASE}/jd-match`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd, role: candidate.role, level: "Intermediate" })
      });
      const d = await res.json();
      setResult(d);
    } catch {}
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "30px 24px", color: "white" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 26, fontWeight: "bold" }}>🎯 Job Description Matcher</div>
        <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>Paste a job description — get 5 tailored interview questions for that exact role</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: 20 }}>
        <div>
          <textarea value={jd} onChange={e => setJd(e.target.value)}
            placeholder="Paste the job description here...&#10;&#10;Example:&#10;We are looking for a Senior Software Engineer with 5+ years experience in React, Node.js, and AWS. The candidate should have experience with microservices architecture, CI/CD pipelines..."
            style={{ width: "100%", minHeight: 320, padding: 16, background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, color: "#ddd", fontSize: 13, lineHeight: 1.7, resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          <button onClick={analyze} disabled={loading || !jd.trim()}
            style={{ width: "100%", marginTop: 12, padding: 14, fontSize: 15, fontWeight: "bold", background: loading || !jd.trim() ? "#333" : "linear-gradient(135deg,#6C63FF,#2196F3)", border: "none", borderRadius: 10, color: "white", cursor: loading || !jd.trim() ? "not-allowed" : "pointer" }}>
            {loading ? "🔍 Analyzing JD..." : "🎯 Generate Tailored Questions"}
          </button>
        </div>

        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Key Skills */}
            <div style={{ background: "#1a1a2e", border: "1px solid #2196F333", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, color: "#2196F3", fontWeight: "bold", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>🔑 Key Skills Detected</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(result.key_skills || []).map((s, i) => (
                  <span key={i} style={{ background: "#2196F322", color: "#90CAF9", border: "1px solid #2196F344", borderRadius: 20, padding: "3px 12px", fontSize: 12 }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Prep Tip */}
            {result.tips && (
              <div style={{ background: "#FF980015", border: "1px solid #FF980044", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 12, color: "#FF9800", fontWeight: "bold", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>💡 Prep Tip</div>
                <div style={{ fontSize: 13, color: "#FFB74D", lineHeight: 1.6 }}>{result.tips}</div>
              </div>
            )}

            {/* Questions */}
            <div style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, color: "#4CAF50", fontWeight: "bold", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>🎤 Tailored Interview Questions</div>
              {(result.questions || []).map((q, i) => (
                <div key={i} onClick={() => setActiveQ(activeQ === i ? null : i)}
                  style={{ background: activeQ === i ? "#0f0f1a" : "transparent", border: `1px solid ${activeQ === i ? "#4CAF50" : "#2a2a4a"}`, borderRadius: 8, padding: "12px 14px", marginBottom: 8, cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "#4CAF50", fontWeight: "bold", fontSize: 13, flexShrink: 0 }}>Q{i + 1}.</span>
                    <span style={{ fontSize: 13, color: "#ddd", lineHeight: 1.6 }}>{q}</span>
                  </div>
                  {activeQ === i && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #2a2a4a", fontSize: 12, color: "#888" }}>
                      💡 Tip: Use the STAR method — describe the Situation, your Task, the Actions you took, and the Result.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
