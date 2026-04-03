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
        <button onClick={onBack} style={{ padding: "8px 18px", background: "transparent", border: "1px solid #333", borderRadius: 20, color: "#aaa", cursor: "pointer", fontSize: 13 }}>← Back to Home</button>
      </nav>

      {/* Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 26 }}>{mode === "login" ? "Welcome Back 👋" : "Create Account 🚀"}</h2>
            <p style={{ color: "#aaa", margin: 0, fontSize: 14 }}>{mode === "login" ? "Sign in to continue your practice" : "Start your interview preparation journey"}</p>
          </div>

          <div style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 16, padding: 32 }}>
            {mode === "forgot" && (
              <div>
                <button onClick={() => { setMode("login"); setResetMsg(""); setResetEmail(""); }}
                  style={{ background: "none", border: "none", color: "#4CAF50", cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0 }}>← Back to Sign In</button>
                <h3 style={{ margin: "0 0 8px", color: "white" }}>Reset Password 🔑</h3>
                <p style={{ color: "#aaa", fontSize: 13, marginBottom: 20 }}>Enter your email and we'll set a new password for you.</p>
                <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>Email Address</label>
                <input value={resetEmail} onChange={e => setResetEmail(e.target.value)} type="email" placeholder="you@example.com"
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
                  {resetLoading ? "Sending..." : "Reset Password →"}
                </button>
              </div>
            )}
            {mode !== "forgot" && (
            <>
            <div style={{ display: "flex", marginBottom: 24, background: "#0f0f1a", borderRadius: 10, padding: 4 }}>
              {["login", "register"].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(""); }}
                  style={{ flex: 1, padding: "10px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: 14, background: mode === m ? "linear-gradient(135deg,#4CAF50,#2196F3)" : "transparent", color: "white", transition: "all 0.2s" }}>
                  {m === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            <form onSubmit={submit}>
              {mode === "register" && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>Full Name</label>
                    <input name="name" value={form.name} onChange={handle} required placeholder="John Doe"
                      style={{ width: "100%", padding: "11px 14px", background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: 10, color: "white", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>Target Role</label>
                    <select name="role" value={form.role} onChange={handle}
                      style={{ width: "100%", padding: "11px 14px", background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: 10, color: "white", fontSize: 14, boxSizing: "border-box", outline: "none" }}>
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>Email Address</label>
                <input name="email" type="email" value={form.email} onChange={handle} required placeholder="you@example.com"
                  style={{ width: "100%", padding: "11px 14px", background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: 10, color: "white", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>Password</label>
                <input name="password" type="password" value={form.password} onChange={handle} required placeholder="••••••••"
                  style={{ width: "100%", padding: "11px 14px", background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: 10, color: "white", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
              </div>

              {mode === "login" && (
                <div style={{ textAlign: "right", marginTop: -14, marginBottom: 18 }}>
                  <span onClick={() => { setMode("forgot"); setError(""); }}
                    style={{ fontSize: 12, color: "#4CAF50", cursor: "pointer" }}>Forgot password?</span>
                </div>
              )}

              {error && (
                <div style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.4)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#f44336" }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ width: "100%", padding: "13px", fontSize: 15, background: loading ? "#333" : "linear-gradient(135deg,#4CAF50,#2196F3)", color: "white", border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold" }}>
                {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
              </button>
            </form>
            </>
            )}
          </div>

          <p style={{ textAlign: "center", color: "#555", fontSize: 13, marginTop: 20 }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              style={{ color: "#4CAF50", cursor: "pointer", fontWeight: "bold" }}>
              {mode === "login" ? "Register free" : "Sign in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
