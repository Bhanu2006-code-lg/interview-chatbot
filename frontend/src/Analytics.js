import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import API_BASE from "./api";

export default function Analytics({ candidate }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/sessions/full?candidate_id=${candidate.id}`)
      .then(r => r.json()).then(d => setSessions(d.sessions || [])).catch(() => {});
  }, [candidate.id]);

  const gc = g => ({ A: "#4CAF50", B: "#2196F3", C: "#FF9800" }[g] || "#f44336");
  const avg = key => sessions.length ? Math.round(sessions.reduce((s, r) => s + (r[key] || 0), 0) / sessions.length) : 0;
  const best = sessions.length ? Math.max(...sessions.map(s => s.score || 0)) : 0;
  const gradeDist = sessions.reduce((acc, s) => { acc[s.grade] = (acc[s.grade] || 0) + 1; return acc; }, {});

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "30px 24px", color: "white" }}>
      <div style={{ fontSize: 26, fontWeight: "bold", marginBottom: 4 }}>📊 My Analytics</div>
      <div style={{ fontSize: 13, color: "#aaa", marginBottom: 24 }}>Your performance trends over time</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }} className="stat-grid">
        {[["Total Sessions", sessions.length, "#4CAF50"], ["Avg Score", avg("score"), "#2196F3"], ["Best Score", best, "#FF9800"], ["Avg WPM", avg("wpm"), "#9C27B0"]].map(([l, v, c]) => (
          <div key={l} style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: "bold", color: c }}>{v}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      {sessions.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#555" }}>Complete interviews to see your analytics</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: "#4CAF50", fontWeight: "bold", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>Score Trend</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={[...sessions].reverse()}>
                <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#666", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", color: "white" }} />
                <Line type="monotone" dataKey="score" stroke="#4CAF50" strokeWidth={2} dot={{ fill: "#4CAF50", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: "#2196F3", fontWeight: "bold", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>WPM Trend</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={[...sessions].reverse()}>
                <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 11 }} />
                <YAxis tick={{ fill: "#666", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", color: "white" }} />
                <Line type="monotone" dataKey="wpm" stroke="#2196F3" strokeWidth={2} dot={{ fill: "#2196F3", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: "#FF9800", fontWeight: "bold", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>Grade Distribution</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={Object.entries(gradeDist).map(([g, c]) => ({ grade: g, count: c }))}>
                <XAxis dataKey="grade" tick={{ fill: "#666", fontSize: 13 }} />
                <YAxis tick={{ fill: "#666", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", color: "white" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {Object.keys(gradeDist).map(g => <Cell key={g} fill={gc(g)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: "#9C27B0", fontWeight: "bold", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>Eye Contact Trend</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={[...sessions].reverse()}>
                <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#666", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", color: "white" }} />
                <Line type="monotone" dataKey="eye" stroke="#9C27B0" strokeWidth={2} dot={{ fill: "#9C27B0", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
