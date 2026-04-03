import React, { useState } from "react";
import { techCourses, govCourses } from "./courses";

const levelColor = { Beginner: "#4CAF50", Intermediate: "#2196F3", Advanced: "#FF9800" };

function CourseSelect({ candidate, onSelectCourse, onLogout, hideNav }) {
  const [tab, setTab] = useState("tech");

  const courses = tab === "tech" ? techCourses : govCourses;

  return (
    <div style={{ fontFamily: "Segoe UI, Arial", background: "#0f0f1a", minHeight: "100vh", color: "white" }}>

      {/* Navbar */}
      {!hideNav && (
      <nav style={{ padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1e1e3a", background: "rgba(15,15,26,0.97)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#4CAF50,#2196F3)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎯</div>
          <span style={{ fontSize: 20, fontWeight: "bold" }}>InterviewIQ <span style={{ color: "#06B6D4" }}>Pro</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, fontWeight: "bold" }}>{candidate.name}</div>
            <div style={{ fontSize: 12, color: "#4CAF50" }}>{candidate.role}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#4CAF50,#2196F3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 16 }}>
            {candidate.name.charAt(0).toUpperCase()}
          </div>
          <button onClick={onLogout} style={{ padding: "6px 16px", background: "transparent", border: "1px solid #333", borderRadius: 20, color: "#aaa", cursor: "pointer", fontSize: 13 }}>Logout</button>
        </div>
      </nav>
      )}

      {/* Header */}
      <div style={{ textAlign: "center", padding: "50px 40px 30px" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 10 }}>
          Choose Your <span style={{ background: "linear-gradient(135deg,#4CAF50,#2196F3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Interview Track</span>
        </h1>
        <p style={{ color: "#aaa", fontSize: 16 }}>Select a course to start your AI-powered mock interview session</p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 36 }}>
        {[["tech", "💻 Tech & Private Sector"], ["gov", "🏛️ Government of India"]].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "10px 28px", borderRadius: 25, border: tab === t ? "none" : "1px solid #333", background: tab === t ? "linear-gradient(135deg,#4CAF50,#2196F3)" : "transparent", color: "white", cursor: "pointer", fontSize: 14, fontWeight: "bold" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Course grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px 60px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {courses.map(c => (
          <div key={c.title} onClick={() => onSelectCourse(c)}
            style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 14, padding: 24, cursor: "pointer", position: "relative" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#4CAF50"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e3a"; e.currentTarget.style.transform = "translateY(0)"; }}>
            {c.free
              ? <span style={{ position: "absolute", top: 14, right: 14, background: "rgba(76,175,80,0.15)", color: "#4CAF50", border: "1px solid rgba(76,175,80,0.4)", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: "bold" }}>FREE</span>
              : <span style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,152,0,0.15)", color: "#FF9800", border: "1px solid rgba(255,152,0,0.4)", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: "bold" }}>{c.price}</span>
            }
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 38 }}>{c.icon}</span>
              {c.tag && <span style={{ background: "#FF980022", color: "#FF9800", border: "1px solid #FF980044", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: "bold" }}>{c.tag}</span>}
            </div>
            <div style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8, paddingRight: 55 }}>{c.title}</div>
            <div style={{ color: "#aaa", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{c.desc}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ background: levelColor[c.level] + "22", color: levelColor[c.level], border: `1px solid ${levelColor[c.level]}44`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: "bold" }}>{c.level}</span>
              <span style={{ fontSize: 13, color: "#4CAF50", fontWeight: "bold" }}>📝 {c.questions} Q · Start →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseSelect;
