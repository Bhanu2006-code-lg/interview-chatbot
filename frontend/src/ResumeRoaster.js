import React, { useState, useRef } from "react";
import API_BASE from "./api";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(" ") + "\n";
  }
  return text.trim();
}

export default function ResumeRoaster({ candidate }) {
  const [resume, setResume] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [improved, setImproved] = useState("");
  const [loading, setLoading] = useState(false);
  const [improveLoading, setImproveLoading] = useState(false);
  const [tab, setTab] = useState("feedback"); // feedback | improved
  const [fileName, setFileName] = useState("");
  const fileRef = useRef(null);

  const loadFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    if (file.name.toLowerCase().endsWith(".pdf")) {
      try {
        const text = await extractTextFromPDF(file);
        setResume(text);
      } catch {
        alert("Could not read PDF. Try copy-pasting the text instead.");
      }
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => setResume(ev.target.result);
      reader.readAsText(file);
    }
  };

  const handleFile = (e) => loadFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); loadFile(e.dataTransfer.files[0]); };

  const roast = async () => {
    if (!resume.trim()) return;
    setLoading(true); setFeedback(null); setImproved("");
    try {
      const res = await fetch(`${API_BASE}/roast-resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, role: candidate.role }),
      });
      const d = await res.json();
      setFeedback(d);
      setTab("feedback");
    } catch { setFeedback({ error: "Could not connect to server." }); }
    setLoading(false);
  };

  const improveResume = async () => {
    if (!resume.trim()) return;
    setImproveLoading(true); setImproved("");
    try {
      const res = await fetch(`${API_BASE}/improve-resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, role: candidate.role }),
      });
      const d = await res.json();
      setImproved(d.improved || "");
      setTab("improved");
    } catch {}
    setImproveLoading(false);
  };

  const downloadResume = () => {
    const text = improved || resume;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${candidate.name.replace(/\s+/g, "_")}_Resume_Improved.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scoreColor = s => s >= 80 ? "#4CAF50" : s >= 60 ? "#2196F3" : s >= 40 ? "#FF9800" : "#f44336";

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "30px 24px", color: "white" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 26, fontWeight: "bold" }}>📝 Resume Roaster</div>
        <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>Upload or paste your resume — get AI feedback, score, and a rewritten improved version</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 24 }} className="resume-grid">
        {/* LEFT — Input */}
        <div>
          {/* File Upload */}
          <div
            onDrop={handleDrop} onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current.click()}
            style={{ border: "2px dashed #2a2a4a", borderRadius: 12, padding: "20px 16px", textAlign: "center", cursor: "pointer", marginBottom: 12, background: "#1a1a2e", transition: "border-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#4CAF50"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a4a"}>
            <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleFile} style={{ display: "none" }} />
            <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
            <div style={{ fontSize: 14, color: "#ccc", marginBottom: 4 }}>
              {fileName ? `✅ ${fileName}` : "Drop your resume file here or click to upload"}
            </div>
            <div style={{ fontSize: 12, color: "#555" }}>Supports .txt, .pdf, .doc, .docx</div>
          </div>

          <div style={{ fontSize: 12, color: "#555", textAlign: "center", marginBottom: 8 }}>— or paste text below —</div>

          <textarea
            value={resume} onChange={e => setResume(e.target.value)}
            placeholder="Paste your resume text here..."
            style={{ width: "100%", minHeight: 280, padding: 14, background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, color: "#ddd", fontSize: 13, lineHeight: 1.7, resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "monospace" }}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={roast} disabled={loading || !resume.trim()}
              style={{ flex: 1, padding: 13, fontSize: 14, fontWeight: "bold", background: loading || !resume.trim() ? "#333" : "linear-gradient(135deg,#f44336,#FF9800)", border: "none", borderRadius: 10, color: "white", cursor: loading || !resume.trim() ? "not-allowed" : "pointer" }}>
              {loading ? "🔥 Analyzing..." : "🔥 Roast My Resume"}
            </button>
            <button onClick={improveResume} disabled={improveLoading || !resume.trim()}
              style={{ flex: 1, padding: 13, fontSize: 14, fontWeight: "bold", background: improveLoading || !resume.trim() ? "#333" : "linear-gradient(135deg,#4CAF50,#2196F3)", border: "none", borderRadius: 10, color: "white", cursor: improveLoading || !resume.trim() ? "not-allowed" : "pointer" }}>
              {improveLoading ? "✨ Rewriting..." : "✨ Improve Resume"}
            </button>
          </div>

          {(feedback || improved) && (
            <button onClick={downloadResume}
              style={{ width: "100%", marginTop: 10, padding: 12, fontSize: 14, fontWeight: "bold", background: "transparent", border: "1px solid #4CAF50", borderRadius: 10, color: "#4CAF50", cursor: "pointer" }}>
              ⬇️ Download {improved ? "Improved" : "Original"} Resume
            </button>
          )}
        </div>

        {/* RIGHT — Results */}
        <div>
          {(feedback || improved) && (
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {feedback && <button onClick={() => setTab("feedback")}
                style={{ padding: "7px 20px", borderRadius: 20, border: tab === "feedback" ? "none" : "1px solid #333", background: tab === "feedback" ? "linear-gradient(135deg,#f44336,#FF9800)" : "transparent", color: "white", cursor: "pointer", fontSize: 13, fontWeight: "bold" }}>
                🔥 Feedback
              </button>}
              {improved && <button onClick={() => setTab("improved")}
                style={{ padding: "7px 20px", borderRadius: 20, border: tab === "improved" ? "none" : "1px solid #333", background: tab === "improved" ? "linear-gradient(135deg,#4CAF50,#2196F3)" : "transparent", color: "white", cursor: "pointer", fontSize: 13, fontWeight: "bold" }}>
                ✨ Improved Resume
              </button>}
            </div>
          )}

          {/* Feedback Tab */}
          {tab === "feedback" && feedback && !feedback.error && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, padding: 20, display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ textAlign: "center", minWidth: 70 }}>
                  <div style={{ fontSize: 44, fontWeight: "bold", color: scoreColor(feedback.score) }}>{feedback.score}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>/ 100</div>
                  {/* Score bar */}
                  <div style={{ height: 6, background: "#2a2a4a", borderRadius: 3, marginTop: 6, width: 60 }}>
                    <div style={{ height: "100%", borderRadius: 3, background: scoreColor(feedback.score), width: `${feedback.score}%`, transition: "width 1s ease" }} />
                  </div>
                </div>
                <div style={{ flex: 1, fontSize: 14, color: "#ddd", lineHeight: 1.7 }}>{feedback.verdict}</div>
              </div>

              {[["💪 Strengths", "strengths", "#4CAF50"], ["⚠️ Weaknesses", "weaknesses", "#f44336"], ["🚀 Quick Wins", "quick_wins", "#2196F3"], ["🎯 ATS Tips", "ats_tips", "#FF9800"]].map(([label, key, color]) => (
                feedback[key]?.length > 0 && (
                  <div key={key} style={{ background: "#1a1a2e", border: `1px solid ${color}33`, borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 12, color, fontWeight: "bold", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                    {feedback[key].map((item, i) => (
                      <div key={i} style={{ fontSize: 13, color: "#ccc", padding: "6px 0", borderBottom: i < feedback[key].length - 1 ? "1px solid #1e1e3a" : "none", display: "flex", gap: 8 }}>
                        <span style={{ color, flexShrink: 0 }}>•</span>{item}
                      </div>
                    ))}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Improved Resume Tab */}
          {tab === "improved" && improved && (
            <div style={{ background: "#1a1a2e", border: "1px solid #4CAF5044", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: "#4CAF50", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1 }}>✨ AI-Improved Resume</div>
                <button onClick={downloadResume}
                  style={{ padding: "5px 14px", background: "#4CAF50", border: "none", borderRadius: 20, color: "white", cursor: "pointer", fontSize: 12, fontWeight: "bold" }}>
                  ⬇️ Download
                </button>
              </div>
              <pre style={{ fontSize: 13, color: "#ddd", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "monospace", margin: 0, maxHeight: 520, overflowY: "auto" }}>
                {improved}
              </pre>
            </div>
          )}

          {feedback?.error && <div style={{ color: "#f44336", padding: 20 }}>⚠️ {feedback.error}</div>}

          {!feedback && !improved && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#555" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <div style={{ fontSize: 15, marginBottom: 8 }}>Upload or paste your resume</div>
              <div style={{ fontSize: 13 }}>Click <span style={{ color: "#f44336" }}>🔥 Roast</span> for feedback or <span style={{ color: "#4CAF50" }}>✨ Improve</span> to get a rewritten version</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
