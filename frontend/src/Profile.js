import React, { useEffect, useState, useRef } from "react";
import API_BASE from "./api";

const BADGES = [
  { id: "first_interview", icon: "🎤", label: "First Interview", desc: "Complete your first mock interview", check: (s) => s.length >= 1 },
  { id: "streak_3", icon: "🔥", label: "3-Day Streak", desc: "Practice 3 days in a row", check: (s) => JSON.parse(localStorage.getItem("streak") || '{"count":0}').count >= 3 },
  { id: "streak_7", icon: "⚡", label: "Week Warrior", desc: "Practice 7 days in a row", check: (s) => JSON.parse(localStorage.getItem("streak") || '{"count":0}').count >= 7 },
  { id: "score_80", icon: "🏆", label: "High Scorer", desc: "Score 80+ in an interview", check: (s) => s.some(x => x.score >= 80) },
  { id: "score_90", icon: "💎", label: "Excellence", desc: "Score 90+ in an interview", check: (s) => s.some(x => x.score >= 90) },
  { id: "grade_a", icon: "⭐", label: "Grade A", desc: "Earn an A grade", check: (s) => s.some(x => x.grade === "A") },
  { id: "sessions_5", icon: "📚", label: "Dedicated", desc: "Complete 5 interviews", check: (s) => s.length >= 5 },
  { id: "sessions_10", icon: "🎯", label: "Pro Practitioner", desc: "Complete 10 interviews", check: (s) => s.length >= 10 },
  { id: "sessions_25", icon: "🚀", label: "Interview Master", desc: "Complete 25 interviews", check: (s) => s.length >= 25 },
];

export default function Profile({ candidate, onLogout }) {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("badges");
  const [avatar, setAvatar] = useState(() => localStorage.getItem(`avatar_${candidate.id}`) || "");
  const fileRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      localStorage.setItem(`avatar_${candidate.id}`, dataUrl);
      setAvatar(dataUrl);
      window.dispatchEvent(new Event("avatarUpdated"));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetch(`${API_BASE}/sessions/full?candidate_id=${candidate.id}`)
      .then(r => r.json()).then(d => setSessions(d.sessions || [])).catch(() => {});
  }, [candidate.id]);

  const earned = BADGES.filter(b => b.check(sessions));
  const locked = BADGES.filter(b => !b.check(sessions));
  const avg = sessions.length ? Math.round(sessions.reduce((s, r) => s + (r.score || 0), 0) / sessions.length) : 0;
  const best = sessions.length ? Math.max(...sessions.map(s => s.score || 0)) : 0;
  const gc = g => ({ A: "#4CAF50", B: "#2196F3", C: "#FF9800" }[g] || "#f44336");

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "30px 24px", color: "white" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1a1a2e,#0d1b2a)", border: "1px solid #2a2a4a", borderRadius: 16, padding: 24, marginBottom: 24, display: "flex", gap: 20, alignItems: "center" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#4CAF50,#2196F3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: "bold", overflow: "hidden", border: "3px solid #4CAF5066" }}>
            {avatar
              ? <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : candidate.name.charAt(0).toUpperCase()
            }
          </div>
          <button onClick={() => fileRef.current.click()}
            style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: "#4CAF50", border: "2px solid #0d1b2a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}
            title="Change photo">📷</button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: "bold" }}>{candidate.name}</div>
          <div style={{ fontSize: 13, color: "#4CAF50", marginTop: 2 }}>{candidate.role}</div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{candidate.email}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {[["Sessions", sessions.length, "#4CAF50"], ["Avg Score", avg, "#2196F3"], ["Best", best, "#FF9800"], ["Badges", earned.length, "#9C27B0"]].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: "bold", color: c }}>{v}</div>
                <div style={{ fontSize: 11, color: "#888" }}>{l}</div>
              </div>
            ))}
          </div>
          <button onClick={onLogout}
            style={{ padding: "8px 20px", background: "transparent", border: "1px solid #f4433666", borderRadius: 8, color: "#f44336", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f4433615"; e.currentTarget.style.borderColor = "#f44336"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#f4433666"; }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["badges", "🏅 Badges"], ["history", "📋 Session History"]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "8px 20px", borderRadius: 20, border: tab === t ? "none" : "1px solid #333", background: tab === t ? "linear-gradient(135deg,#4CAF50,#2196F3)" : "transparent", color: "white", cursor: "pointer", fontSize: 13, fontWeight: tab === t ? "bold" : "normal" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Badges Tab */}
      {tab === "badges" && (
        <div>
          {earned.length > 0 && (
            <>
              <div style={{ fontSize: 12, color: "#4CAF50", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>✅ Earned ({earned.length})</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
                {earned.map(b => (
                  <div key={b.id} style={{ background: "#1a1a2e", border: "1px solid #4CAF5044", borderRadius: 12, padding: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>{b.icon}</div>
                    <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 4 }}>{b.label}</div>
                    <div style={{ fontSize: 11, color: "#888", lineHeight: 1.4 }}>{b.desc}</div>
                  </div>
                ))}
              </div>
            </>
          )}
          {locked.length > 0 && (
            <>
              <div style={{ fontSize: 12, color: "#555", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>🔒 Locked ({locked.length})</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                {locked.map(b => (
                  <div key={b.id} style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, padding: 16, textAlign: "center", opacity: 0.5 }}>
                    <div style={{ fontSize: 36, marginBottom: 8, filter: "grayscale(1)" }}>{b.icon}</div>
                    <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 4 }}>{b.label}</div>
                    <div style={{ fontSize: 11, color: "#666", lineHeight: 1.4 }}>{b.desc}</div>
                  </div>
                ))}
              </div>
            </>
          )}
          {sessions.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#555" }}>Complete interviews to earn badges!</div>}
        </div>
      )}

      {/* History Tab */}
      {tab === "history" && (
        <div>
          {sessions.length === 0
            ? <div style={{ textAlign: "center", padding: 40, color: "#555" }}>No sessions yet — complete an interview to see history</div>
            : [...sessions].reverse().map(s => (
              <div key={s.id}>
                <div onClick={() => setSelected(selected === s.id ? null : s.id)}
                  style={{ background: "#1a1a2e", border: `1px solid ${selected === s.id ? "#4CAF50" : "#2a2a4a"}`, borderRadius: 10, padding: "14px 18px", marginBottom: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ textAlign: "center", minWidth: 50 }}>
                    <div style={{ fontSize: 20, fontWeight: "bold", color: gc(s.grade) }}>{s.score}</div>
                    <div style={{ fontSize: 10, color: "#888" }}>score</div>
                  </div>
                  <span style={{ background: gc(s.grade), color: "white", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: "bold" }}>{s.grade}</span>
                  <div style={{ flex: 1, fontSize: 13, color: "#ccc" }}>{s.question || "Interview Session"}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{s.date}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>👁 {parseFloat(s.eye || 0).toFixed(0)}% · {parseFloat(s.wpm || 0).toFixed(0)} WPM</div>
                  <span style={{ color: "#555", fontSize: 12 }}>{selected === s.id ? "▲" : "▼"}</span>
                </div>
                {selected === s.id && s.transcript && (
                  <div style={{ background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: 10, padding: 16, marginBottom: 8, marginTop: -4 }}>
                    <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>📝 Your Answer</div>
                    <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.7 }}>{s.transcript}</div>
                    {s.overall_feedback && (
                      <>
                        <div style={{ fontSize: 11, color: "#4CAF50", textTransform: "uppercase", letterSpacing: 1, marginTop: 12, marginBottom: 6 }}>💬 AI Feedback</div>
                        <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7 }}>{s.overall_feedback}</div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
