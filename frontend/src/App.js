import React, { useState } from "react";
import API_BASE from "./api";
import Logo from "./Logo";
import SignIn from "./SignIn";
import Landing from "./Landing";
import CourseSelect from "./CourseSelect";
import Dashboard from "./Dashboard";
import Chatbot from "./Chatbot";
import InterviewRoom from "./InterviewRoom";
import Leaderboard from "./Leaderboard";
import ResumeRoaster from "./ResumeRoaster";
import DailyChallenge from "./DailyChallenge";
import Analytics from "./Analytics";
import Quiz from "./Quiz";
import JDMatcher from "./JDMatcher";
import Profile from "./Profile";
import Feedback from "./Feedback";
import { allCourses } from "./courses";
import VideoRecorder from "./VideoRecorder";
import InterviewScheduler from "./InterviewScheduler";
import PeerInterview from "./PeerInterview";

const DARK = { bg: "#0f0f1a", nav: "#1a1a2e", navBorder: "#333", card: "#1a1a2e", text: "white", muted: "#aaa" };
const LIGHT = { bg: "#f0f2f5", nav: "#ffffff", navBorder: "#e0e0e0", card: "#ffffff", text: "#111", muted: "#555" };

function App() {
  const [candidate, setCandidate] = useState(() => {
    const s = sessionStorage.getItem("candidate");
    return s ? JSON.parse(s) : null;
  });
  const [showLanding, setShowLanding] = useState(() => !sessionStorage.getItem("candidate"));
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [appPage, setAppPage] = useState("interview");
  const [brightness, setBrightness] = useState(() => parseInt(localStorage.getItem("brightness") || "100"));
  const [showBrightness, setShowBrightness] = useState(false);
  const [navAvatar, setNavAvatar] = useState("");

  // sync avatar from localStorage whenever it changes
  React.useEffect(() => {
    const sync = () => {
      if (candidate) setNavAvatar(localStorage.getItem(`avatar_${candidate.id}`) || "");
    };
    sync();
    window.addEventListener("avatarUpdated", sync);
    return () => window.removeEventListener("avatarUpdated", sync);
  }, [candidate]);

  React.useEffect(() => {
    if (!showBrightness) return;
    const close = (e) => { if (!e.target.closest(".brightness-ctrl")) setShowBrightness(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [showBrightness]);
  const dark = brightness < 75;
  const theme = dark ? DARK : LIGHT;
  const handleBrightness = (val) => { setBrightness(val); localStorage.setItem("brightness", val); };

  const handleLogin = (c) => {
    sessionStorage.setItem("candidate", JSON.stringify(c));
    setCandidate(c); setShowLanding(false); setSelectedCourse(null); setAppPage("home");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("candidate");
    setCandidate(null); setSelectedCourse(null); setShowLanding(true);
  };

  if (showLanding) return <Landing onGetStarted={() => setShowLanding(false)} />;
  if (!candidate) return <SignIn onLogin={handleLogin} onBack={() => setShowLanding(true)} />;

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "interview", label: "Interview" },
    { id: "jd", label: "JD Match" },
    { id: "quiz", label: "Quiz" },
    { id: "daily", label: "Daily" },
    { id: "resume", label: "Resume" },
    { id: "books", label: "Books" },
    { id: "tips", label: "Tips" },
    { id: "video", label: "🎥 Record" },
    { id: "schedule", label: "📅 Schedule" },
    { id: "peer", label: "🤝 Peer" },
    { id: "chatbot", label: "AI Coach" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "analytics", label: "Analytics" },
    { id: "feedback", label: "Feedback" },
  ];

  return (
    <div style={{ fontFamily: "Segoe UI, Arial", background: theme.bg, minHeight: "100vh", color: theme.text, transition: "background 0.3s, color 0.3s, filter 0.2s", overflowX: "hidden", filter: `brightness(${brightness}%)` }}>
      {/* NAVBAR */}
      <div style={{ background: dark ? "rgba(10,10,20,0.97)" : "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", padding: "0 28px", borderBottom: `1px solid ${dark ? "#ffffff0f" : "#e0e0e0"}`, display: "flex", alignItems: "center", gap: 4, height: 60, position: "sticky", top: 0, zIndex: 100, boxShadow: dark ? "0 2px 20px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.08)" }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 20 }}>
          <Logo size={32} />
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.3, color: dark ? "white" : "#111" }}>Interview<span style={{ color: "#06B6D4" }}>IQ</span> <span style={{ color: "#4CAF50", fontSize: 11, fontWeight: 600, background: dark ? "#4CAF5022" : "#e8f5e9", padding: "1px 6px", borderRadius: 6 }}>PRO</span></span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {navLinks.map(l => (
            <button key={l.id} onClick={() => setAppPage(l.id)}
              style={{
                padding: "6px 14px", background: appPage === l.id ? (dark ? "#ffffff12" : "#f0f0f0") : "transparent", border: "none",
                borderRadius: 8, color: appPage === l.id ? "#4CAF50" : theme.muted,
                cursor: "pointer", fontSize: 13, fontWeight: appPage === l.id ? 700 : 400,
                whiteSpace: "nowrap", position: "relative", transition: "all 0.15s"
              }}
              onMouseEnter={e => { if (appPage !== l.id) e.currentTarget.style.background = dark ? "#ffffff08" : "#f5f5f5"; }}
              onMouseLeave={e => { if (appPage !== l.id) e.currentTarget.style.background = "transparent"; }}>
              {l.label}
              {appPage === l.id && <div style={{ position: "absolute", bottom: -1, left: "20%", right: "20%", height: 2, background: "linear-gradient(90deg,#4CAF50,#06B6D4)", borderRadius: 2 }} />}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
          <div style={{ position: "relative" }} className="brightness-ctrl">
            <button onClick={() => setShowBrightness(s => !s)} title={dark ? "Dark mode — adjust brightness" : "Light mode — adjust brightness"}
              style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", background: dark ? "#ffffff12" : "#f0f0f0", border: `1.5px solid ${dark ? "#ffffff22" : "#ddd"}`, borderRadius: 10, cursor: "pointer", padding: 0, transition: "all 0.2s" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {dark ? (
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#a78bfa" />
                ) : (
                  <>
                    <circle cx="12" cy="12" r="5" fill="#FFD700" />
                    <line x1="12" y1="2" x2="12" y2="5" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="12" y1="19" x2="12" y2="22" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="2" y1="12" x2="5" y2="12" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="19" y1="12" x2="22" y2="12" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="19.78" y1="4.22" x2="17.66" y2="6.34" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="6.34" y1="17.66" x2="4.22" y2="19.78" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
                  </>
                )}
              </svg>
            </button>
            {showBrightness && (
              <div style={{ position: "absolute", right: 0, top: 42, background: dark ? "#1a1a2e" : "#fff", border: `1px solid ${dark ? "#333" : "#e0e0e0"}`, borderRadius: 12, padding: "12px 16px", zIndex: 200, width: 180, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                <div style={{ fontSize: 12, color: theme.muted, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                  <span>🌑 Dark</span><span style={{ color: theme.text, fontWeight: 600 }}>{brightness}%</span><span>☀️ Bright</span>
                </div>
                <input type="range" min="30" max="150" value={brightness} onChange={e => handleBrightness(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#4CAF50", cursor: "pointer" }} />
                <button onClick={() => handleBrightness(100)}
                  style={{ marginTop: 8, width: "100%", padding: "5px", fontSize: 11, background: "transparent", border: `1px solid ${dark ? "#333" : "#ddd"}`, borderRadius: 6, color: theme.muted, cursor: "pointer" }}>Reset</button>
              </div>
            )}
          </div>

          <div onClick={() => setAppPage("profile")}
            style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: 3, borderRadius: "50%", background: dark ? "#ffffff08" : "#f5f5f5", border: `2px solid ${dark ? "#ffffff20" : "#e0e0e0"}`, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#4CAF50"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? "#ffffff20" : "#e0e0e0"; }}
            title={`${candidate.name} — ${candidate.role}`}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#4CAF50,#2196F3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 14, color: "white", overflow: "hidden", flexShrink: 0 }}>
              {navAvatar
                ? <img src={navAvatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : candidate.name.charAt(0).toUpperCase()
              }
            </div>
          </div>
        </div>
      </div>

      {appPage === "home" && <Dashboard candidate={candidate} onStartInterview={() => {
        const match = allCourses.find(c => c.role === candidate.role) || allCourses[0];
        setSelectedCourse(match); setAppPage("interview");
      }} />}

      {appPage === "interview" && !selectedCourse && (
        <CourseSelect candidate={candidate} onSelectCourse={c => {
          if (!c.free) {
            const unlocked = JSON.parse(localStorage.getItem("unlocked") || "[]");
            if (!unlocked.includes(c.role)) {
              if (!window.confirm(`"${c.title}" is a premium course (${c.price}). Click OK to unlock for demo purposes.`)) return;
              localStorage.setItem("unlocked", JSON.stringify([...unlocked, c.role]));
            }
          }
          fetch(`${API_BASE}/warmup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: c.role, level: c.level || "Intermediate" }) }).catch(() => {});
          setSelectedCourse(c);
        }} onLogout={handleLogout} hideNav />
      )}

      {appPage === "interview" && selectedCourse && (
        <InterviewRoom key={selectedCourse.role} candidate={candidate} selectedCourse={selectedCourse} onChangeCourse={() => setSelectedCourse(null)} />
      )}

      {appPage === "video" && <VideoRecorder candidate={candidate} />}
      {appPage === "schedule" && <InterviewScheduler candidate={candidate} />}
      {appPage === "peer" && <PeerInterview candidate={candidate} />}
      {appPage === "chatbot" && <Chatbot candidate={candidate} />}
      {appPage === "daily" && <DailyChallenge candidate={candidate} />}
      {appPage === "quiz" && <Quiz candidate={candidate} />}
      {appPage === "jd" && <JDMatcher candidate={candidate} />}
      {appPage === "analytics" && <Analytics candidate={candidate} />}
      {appPage === "leaderboard" && <Leaderboard candidate={candidate} />}
      {appPage === "resume" && <ResumeRoaster candidate={candidate} />}
      {appPage === "feedback" && <Feedback candidate={candidate} />}
      {appPage === "profile" && <Profile candidate={candidate} onLogout={handleLogout} />}
      {appPage === "books" && <Landing onGetStarted={() => {}} initialPage="books" hideNav />}
      {appPage === "process" && <Landing onGetStarted={() => {}} initialPage="process" hideNav />}
      {appPage === "tips" && <Landing onGetStarted={() => {}} initialPage="tips" hideNav />}
    </div>
  );
}

export default App;
