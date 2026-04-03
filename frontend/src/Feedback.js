import React, { useState, useEffect } from "react";
import API_BASE from "./api";

const CATEGORIES = ["General", "Interview Practice", "Quiz", "AI Coach", "Resume Roaster", "UI/UX", "Bug Report", "Feature Request"];

export default function Feedback({ candidate }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [category, setCategory] = useState("General");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/feedback`)
      .then(r => r.json())
      .then(d => setReviews(d.feedback || []))
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  }, [submitted]);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) { setError("Please select a star rating."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: candidate?.id, candidate_name: candidate?.name, rating, category, message }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.detail || "Failed to submit."); return; }
      setSubmitted(true); setRating(0); setMessage(""); setCategory("General");
    } catch { setError("Cannot connect to server."); }
    finally { setLoading(false); }
  };

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  const ratingCounts = [5, 4, 3, 2, 1].map(n => ({ n, count: reviews.filter(r => r.rating === n).length }));

  return (
    <div style={{ padding: "30px 40px", maxWidth: 900, margin: "0 auto", fontFamily: "Segoe UI, Arial", color: "white" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800 }}>💬 User Feedback</h2>
        <p style={{ margin: 0, color: "#aaa", fontSize: 14 }}>Help us improve InterviewIQ Pro — your feedback matters!</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* Submit Form */}
        <div style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 16, padding: 28 }}>
          <div style={{ fontSize: 13, color: "#4CAF50", fontWeight: "bold", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>✍️ Share Your Experience</div>

          {submitted ? (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Thank you!</div>
              <div style={{ color: "#aaa", fontSize: 14, marginBottom: 20 }}>Your feedback helps us get better.</div>
              <button onClick={() => setSubmitted(false)}
                style={{ padding: "10px 24px", background: "linear-gradient(135deg,#4CAF50,#2196F3)", border: "none", borderRadius: 10, color: "white", cursor: "pointer", fontWeight: "bold" }}>
                Submit Another
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              {/* Stars */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 10 }}>Overall Rating</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <span key={n} onClick={() => setRating(n)} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
                      style={{ fontSize: 32, cursor: "pointer", transition: "transform 0.1s", transform: (hovered || rating) >= n ? "scale(1.2)" : "scale(1)" }}>
                      {(hovered || rating) >= n ? "⭐" : "☆"}
                    </span>
                  ))}
                  {rating > 0 && <span style={{ fontSize: 13, color: "#aaa", alignSelf: "center", marginLeft: 4 }}>
                    {["", "Poor", "Fair", "Good", "Great", "Excellent!"][rating]}
                  </span>}
                </div>
              </div>

              {/* Category */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: 10, color: "white", fontSize: 14, outline: "none" }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Message */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>Your Feedback</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4}
                  placeholder="Tell us what you think, what's working well, or what could be improved..."
                  style={{ width: "100%", padding: "10px 12px", background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: 10, color: "white", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
              </div>

              {error && <div style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.4)", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 13, color: "#f44336" }}>⚠️ {error}</div>}

              <button type="submit" disabled={loading}
                style={{ width: "100%", padding: "12px", background: loading ? "#333" : "linear-gradient(135deg,#4CAF50,#2196F3)", border: "none", borderRadius: 10, color: "white", cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: 15 }}>
                {loading ? "Submitting..." : "Submit Feedback →"}
              </button>
            </form>
          )}
        </div>

        {/* Rating Summary + Reviews */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Summary */}
          <div style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 13, color: "#FF9800", fontWeight: "bold", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>📊 Rating Summary</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: "#FFD700", lineHeight: 1 }}>{avgRating}</div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</div>
              </div>
              <div style={{ flex: 1 }}>
                {ratingCounts.map(({ n, count }) => (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "#aaa", width: 8 }}>{n}</span>
                    <span style={{ fontSize: 11 }}>⭐</span>
                    <div style={{ flex: 1, height: 6, background: "#0f0f1a", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%", background: "linear-gradient(90deg,#4CAF50,#FFD700)", borderRadius: 3, transition: "width 0.5s" }} />
                    </div>
                    <span style={{ fontSize: 11, color: "#aaa", width: 16, textAlign: "right" }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Reviews */}
          <div style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 16, padding: 24, flex: 1, overflowY: "auto", maxHeight: 320 }}>
            <div style={{ fontSize: 13, color: "#06B6D4", fontWeight: "bold", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>🗣 Recent Reviews</div>
            {loadingReviews ? (
              <div style={{ color: "#aaa", fontSize: 13 }}>Loading...</div>
            ) : reviews.length === 0 ? (
              <div style={{ color: "#aaa", fontSize: 13 }}>No reviews yet. Be the first!</div>
            ) : reviews.map((r, i) => (
              <div key={i} style={{ borderBottom: i < reviews.length - 1 ? "1px solid #1e1e3a" : "none", paddingBottom: 12, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#4CAF50,#2196F3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" }}>
                      {r.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</span>
                    <span style={{ fontSize: 10, color: "#aaa", background: "#0f0f1a", padding: "2px 7px", borderRadius: 6 }}>{r.category}</span>
                  </div>
                  <span style={{ fontSize: 12 }}>{"⭐".repeat(r.rating)}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#ccc", lineHeight: 1.5 }}>{r.message}</p>
                <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{r.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
