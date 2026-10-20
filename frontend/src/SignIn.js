import React, { useState } from "react";
import Logo from "./Logo";
import API_BASE from "./api";

function SignIn({ onLogin, onBack }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Software Engineer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const roles = [
    "--- Tech & Private Sector ---",
    "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Data Scientist", "ML Engineer", "AI Engineer", "Data Analyst",
    "Product Manager", "UX/UI Designer", "DevOps Engineer", "Cloud Architect",
    "Cybersecurity Analyst", "Business Analyst", "Mobile Developer", "QA Engineer",
    "--- Government of India ---",
    "UPSC Civil Services (IAS/IPS/IFS)", "IBPS Bank PO/Clerk", "Railway RRB NTPC",
    "SSC CGL/CHSL", "Judiciary/Law Services", "Defence Services NDA/CDS",
    "State Police Services", "AIIMS/Medical PSU", "Teaching KVS/NVS/TGT/PGT",
  ];

  const UI = {
    title: { login: "Welcome Back 👋", register: "Create Account 🚀" },
    subtitle: { login: "Sign in to continue your practice", register: "Start your interview preparation journey" },
    tabs: { login: "Sign In", register: "Register" },
    submit: { login: "Sign In →", register: "Create Account →" },
    toggle: { login: "Don't have an account? ", register: "Already have an account? " },
    toggleLink: { login: "Register free", register: "Sign in" },
    backToSignIn: "← Back to Sign In",
    resetTitle: "Reset Password 🔑",
    resetSubtitle: "Enter your email and we'll set a new password for you.",
    emailLabel: "Email Address",
    emailPlaceholder: "you@example.com",
    resetButton: "Reset Password →",
    sending: "Sending...",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "John Doe",
    targetRoleLabel: "Target Role",
    passwordLabel: "Password",
    forgotPassword: "Forgot password?",
    pleaseWait: "Please wait...",
    backToHome: "← Back to Home",
  };

  const LABELS = {
    login: UI.tabs.login,
    register: UI.tabs.register,
  };

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, role: form.role };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Something went wrong"); return; }
      onLogin(data.candidate);
    } catch {
      setError("Cannot connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Segoe UI, Arial", background: "#0f0f1a", minHeight: "100vh", display: "flex", flexDirection: "column", color: "white" }}>

      <nav style={{ padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1e1e3a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={onBack}>
          <Logo size={36} />
          <span style={{ fontSize: 20, fontWeight: "bold" }}>InterviewIQ <span style={{ color: "#06B6D4" }}>Pro</span></span>
        </div>
        <button onClick={onBack} style={{ padding: "8px 18px", background: "transparent", border: "1px solid #333", borderRadius: 20, color: "#aaa", cursor: "pointer", fontSize: 13 }}>{UI.backToHome}</button>
      </nav>

      {/* Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 26 }}>{UI.title[mode] || UI.title.login}</h2>
            <p style={{ color: "#aaa", margin: 0, fontSize: 14 }}>{UI.subtitle[mode] || UI.subtitle.login}</p>
          </div>

          <div style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 16, padding: 32 }}>
            {mode === "forgot" && (
              <div>
                <button onClick={() => { setMode("login"); setResetMsg(""); setResetEmail(""); }}
                  style={{ background: "none", border: "none", color: "#4CAF50", cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0 }}>{UI.backToSignIn}</button>
                <h3 style={{ margin: "0 0 8px", color: "white" }}>{UI.resetTitle}</h3>
                <p style={{ color: "#aaa", fontSize: 13, marginBottom: 20 }}>{UI.resetSubtitle}</p>
                <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>{UI.emailLabel}</label>
                <input value={resetEmail} onChange={e => setResetEmail(e.target.value)} type="email" placeholder={UI.emailPlaceholder}
                  style={{ width: "100%", padding: "11px 14px", background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: 10, color: "white", fontSize: 14, boxSizing: "border-box", outline: "none", marginBottom: 16 }} />
                {resetMsg && (
                  <div style={{ background: resetMsg.startsWith("✅") ? "rgba(76,175,80,0.1)" : "rgba(244,67,54,0.1)", border: `1px solid ${resetMsg.startsWith("✅") ? "rgba(76,175,80,0.4)" : "rgba(244,67,54,0.4)"}`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: resetMsg.startsWith("✅") ? "#4CAF50" : "#f44336" }}>
                    {resetMsg}
                  </div>
                )}
                <button disabled={resetLoading || !resetEmail.trim()} onClick={async () => {
                  setResetLoading(true); setResetMsg("");
                  try {
                    const res = await fetch(`${API_BASE}/auth/forgot-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: resetEmail }) });
                    const d = await res.json();
                    setResetMsg(res.ok ? `✅ ${d.message}` : `⚠️ ${d.detail}`);
                  } catch { setResetMsg("⚠️ Cannot connect to server."); }
                  setResetLoading(false);
                }} style={{ width: "100%", padding: "13px", fontSize: 15, background: resetLoading || !resetEmail.trim() ? "#333" : "linear-gradient(135deg,#4CAF50,#2196F3)", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: "bold" }}>
                  {resetLoading ? UI.sending : UI.resetButton}
                </button>
              </div>
            )}
            {mode !== "forgot" && (
            <>
            <div style={{ display: "flex", marginBottom: 24, background: "#0f0f1a", borderRadius: 10, padding: 4 }}>
              {["login", "register"].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(""); }}
                  style={{ flex: 1, padding: "10px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: 14, background: mode === m ? "linear-gradient(135deg,#4CAF50,#2196F3)" : "transparent", color: "white", transition: "all 0.2s" }}>
                  {LABELS[m]}
                </button>
              ))}
            </div>

            <form onSubmit={submit}>
              {mode === "register" && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>{UI.fullNameLabel}</label>
                    <input name="name" value={form.name} onChange={handle} required placeholder={UI.fullNamePlaceholder}
                      style={{ width: "100%", padding: "11px 14px", background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: 10, color: "white", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>{UI.targetRoleLabel}</label>
                    <select name="role" value={form.role} onChange={handle}
                      style={{ width: "100%", padding: "11px 14px", background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: 10, color: "white", fontSize: 14, boxSizing: "border-box", outline: "none" }}>
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>{UI.emailLabel}</label>
                <input name="email" type="email" value={form.email} onChange={handle} required placeholder={UI.emailPlaceholder}
                  style={{ width: "100%", padding: "11px 14px", background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: 10, color: "white", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>{UI.passwordLabel}</label>
                <input name="password" type="password" value={form.password} onChange={handle} required placeholder="••••••••"
                  style={{ width: "100%", padding: "11px 14px", background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: 10, color: "white", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
              </div>

              {mode === "login" && (
                <div style={{ textAlign: "right", marginTop: -14, marginBottom: 18 }}>
                  <span onClick={() => { setMode("forgot"); setError(""); }}
                    style={{ fontSize: 12, color: "#4CAF50", cursor: "pointer" }}>{UI.forgotPassword}</span>
                </div>
              )}

              {error && (
                <div style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.4)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#f44336" }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ width: "100%", padding: "13px", fontSize: 15, background: loading ? "#333" : "linear-gradient(135deg,#4CAF50,#2196F3)", color: "white", border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold" }}>
                {loading ? UI.pleaseWait : UI.submit[mode]}
              </button>
            </form>
            </>
            )}
          </div>

          <p style={{ textAlign: "center", color: "#555", fontSize: 13, marginTop: 20 }}>
            {UI.toggle[mode]}
            <span onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              style={{ color: "#4CAF50", cursor: "pointer", fontWeight: "bold" }}>
              {UI.toggleLink[mode]}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
