import React, { useEffect, useState } from "react";
import API_BASE from "./api";

export default function Leaderboard({ candidate }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/leaderboard`)
      .then(r => r.json())
      .then(d => setRows(d.leaderboard || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const medal = i => ["🥇","🥈","🥉"][i] || `#${i+1}`;
  const gc = g => ({ A: "#4CAF50", B: "#2196F3", C: "#FF9800" }[g] || "#f44336");

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "30px 24px", color: "white" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 26, fontWeight: "bold" }}>🏆 Global Leaderboard</div>
        <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>Top performers ranked by best interview score</div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#4CAF50", fontSize: 18 }}>Loading rankings...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((r, i) => (
            <div key={r.id} style={{
              background: r.name === candidate.name ? "linear-gradient(135deg,#4CAF5022,#2196F322)" : "#1a1a2e",
              border: `1px solid ${r.name === candidate.name ? "#4CAF5066" : "#2a2a4a"}`,
              borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
              transition: "transform 0.2s", cursor: "default"
            }}>
              <div style={{ fontSize: i < 3 ? 28 : 16, fontWeight: "bold", minWidth: 40, textAlign: "center", color: i < 3 ? "white" : "#666" }}>{medal(i)}</div>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#4CAF50,#2196F3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 16, flexShrink: 0 }}>
                {r.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", fontSize: 15 }}>{r.name} {r.name === candidate.name && <span style={{ fontSize: 11, color: "#4CAF50", marginLeft: 6 }}>← You</span>}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{r.role}</div>
              </div>
              <div style={{ textAlign: "center", minWidth: 60 }}>
                <div style={{ fontSize: 22, fontWeight: "bold", color: "#2196F3" }}>{r.best_score}</div>
                <div style={{ fontSize: 11, color: "#888" }}>Best Score</div>
              </div>
              <div style={{ textAlign: "center", minWidth: 50 }}>
                <span style={{ background: gc(r.best_grade), color: "white", padding: "3px 10px", borderRadius: 20, fontSize: 13, fontWeight: "bold" }}>{r.best_grade}</span>
              </div>
              <div style={{ textAlign: "center", minWidth: 60 }}>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#FF9800" }}>{r.sessions}</div>
                <div style={{ fontSize: 11, color: "#888" }}>Sessions</div>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: "#555" }}>No data yet — complete an interview to appear here!</div>
          )}
        </div>
      )}
    </div>
  );
}
