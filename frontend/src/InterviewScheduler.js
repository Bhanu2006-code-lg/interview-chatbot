import React, { useState, useEffect } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TOPICS = ["Mock Interview", "Daily Challenge", "Quiz", "Resume Review", "JD Matcher", "AI Coach", "General Practice"];

export default function InterviewScheduler({ candidate }) {
  const key = `schedule_${candidate.id}`;
  const [reminders, setReminders] = useState(() => JSON.parse(localStorage.getItem(key) || "[]"));
  const [form, setForm] = useState({ topic: "Mock Interview", time: "09:00", days: [], note: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(reminders));
  }, [reminders, key]);

  // Check reminders every minute
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const currentDay = DAYS[now.getDay()];
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      reminders.filter(r => r.active).forEach(r => {
        if (r.days.includes(currentDay) && r.time === currentTime) {
          if (Notification.permission === "granted") {
            new Notification("⏰ InterviewIQ Pro Reminder", {
              body: `Time for your ${r.topic} practice session!`,
              icon: "/favicon.ico"
            });
          }
        }
      });
    };
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [reminders]);

  const requestNotification = () => {
    if (Notification.permission === "default") Notification.requestPermission();
  };

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day]
    }));
  };

  const addReminder = () => {
    if (!form.days.length) { alert("Please select at least one day."); return; }
    const newReminder = { id: Date.now(), ...form, active: true };
    setReminders(prev => [...prev, newReminder]);
    setForm({ topic: "Mock Interview", time: "09:00", days: [], note: "" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    requestNotification();
  };

  const toggleActive = (id) => setReminders(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  const deleteReminder = (id) => setReminders(prev => prev.filter(r => r.id !== id));

  const upcomingToday = () => {
    const now = new Date();
    const today = DAYS[now.getDay()];
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    return reminders.filter(r => r.active && r.days.includes(today) && r.time >= currentTime);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "30px 24px", color: "white" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 26, fontWeight: "bold" }}>📅 Interview Scheduler</div>
        <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>Set practice reminders to stay consistent</div>
      </div>

      {/* Today's reminders */}
      {upcomingToday().length > 0 && (
        <div style={{ background: "linear-gradient(135deg,#4CAF5022,#1a1a2e)", border: "1px solid #4CAF5055", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>⏰</span>
          <div>
            <div style={{ fontWeight: "bold", color: "#4CAF50", fontSize: 14 }}>Today's Upcoming Sessions</div>
            <div style={{ fontSize: 13, color: "#ccc", marginTop: 2 }}>
              {upcomingToday().map(r => `${r.topic} at ${r.time}`).join(" · ")}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Add Reminder Form */}
        <div style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 13, color: "#4CAF50", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>➕ Add Reminder</div>

          {/* Topic */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>Practice Topic</label>
            <select value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
              style={{ width: "100%", padding: "10px 12px", background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: 10, color: "white", fontSize: 14, outline: "none" }}>
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Time */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>Time</label>
            <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              style={{ width: "100%", padding: "10px 12px", background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: 10, color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* Days */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 8 }}>Repeat on Days</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {DAYS.map(d => (
                <button key={d} onClick={() => toggleDay(d)}
                  style={{ padding: "6px 12px", borderRadius: 20, border: form.days.includes(d) ? "none" : "1px solid #333", background: form.days.includes(d) ? "#4CAF50" : "transparent", color: "white", cursor: "pointer", fontSize: 12, fontWeight: form.days.includes(d) ? "bold" : "normal" }}>
                  {d}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => setForm(f => ({ ...f, days: ["Mon", "Tue", "Wed", "Thu", "Fri"] }))}
                style={{ fontSize: 11, padding: "3px 10px", background: "transparent", border: "1px solid #555", borderRadius: 20, color: "#aaa", cursor: "pointer" }}>Weekdays</button>
              <button onClick={() => setForm(f => ({ ...f, days: [...DAYS] }))}
                style={{ fontSize: 11, padding: "3px 10px", background: "transparent", border: "1px solid #555", borderRadius: 20, color: "#aaa", cursor: "pointer" }}>Every Day</button>
              <button onClick={() => setForm(f => ({ ...f, days: [] }))}
                style={{ fontSize: 11, padding: "3px 10px", background: "transparent", border: "1px solid #555", borderRadius: 20, color: "#aaa", cursor: "pointer" }}>Clear</button>
            </div>
          </div>

          {/* Note */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>Note (optional)</label>
            <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="e.g. Focus on system design today"
              style={{ width: "100%", padding: "10px 12px", background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: 10, color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <button onClick={addReminder}
            style={{ width: "100%", padding: 13, fontSize: 14, fontWeight: "bold", background: saved ? "#4CAF50" : "linear-gradient(135deg,#4CAF50,#2196F3)", border: "none", borderRadius: 10, color: "white", cursor: "pointer" }}>
            {saved ? "✅ Reminder Saved!" : "⏰ Add Reminder"}
          </button>

          {Notification.permission === "default" && (
            <button onClick={requestNotification}
              style={{ width: "100%", marginTop: 8, padding: 10, fontSize: 13, background: "transparent", border: "1px solid #FF9800", borderRadius: 10, color: "#FF9800", cursor: "pointer" }}>
              🔔 Enable Browser Notifications
            </button>
          )}
          {Notification.permission === "granted" && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#4CAF50", textAlign: "center" }}>🔔 Notifications enabled ✅</div>
          )}
        </div>

        {/* Reminders List */}
        <div>
          <div style={{ fontSize: 13, color: "#2196F3", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
            📋 Your Reminders ({reminders.length})
          </div>
          {reminders.length === 0 ? (
            <div style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, padding: 40, textAlign: "center", color: "#555" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
              No reminders yet — add one to stay consistent!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {reminders.map(r => (
                <div key={r.id} style={{ background: "#1a1a2e", border: `1px solid ${r.active ? "#2196F344" : "#2a2a4a"}`, borderRadius: 12, padding: "14px 16px", opacity: r.active ? 1 : 0.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: 14, color: r.active ? "white" : "#888" }}>{r.topic}</div>
                      <div style={{ fontSize: 13, color: "#2196F3", marginTop: 2 }}>⏰ {r.time}</div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                        {r.days.map(d => (
                          <span key={d} style={{ background: "#2196F322", color: "#90CAF9", border: "1px solid #2196F344", borderRadius: 20, padding: "2px 8px", fontSize: 11 }}>{d}</span>
                        ))}
                      </div>
                      {r.note && <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>📝 {r.note}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => toggleActive(r.id)}
                        style={{ padding: "4px 10px", background: r.active ? "#4CAF5022" : "transparent", border: `1px solid ${r.active ? "#4CAF50" : "#555"}`, borderRadius: 20, color: r.active ? "#4CAF50" : "#888", cursor: "pointer", fontSize: 11 }}>
                        {r.active ? "ON" : "OFF"}
                      </button>
                      <button onClick={() => deleteReminder(r.id)}
                        style={{ padding: "4px 8px", background: "transparent", border: "1px solid #f44336", borderRadius: 20, color: "#f44336", cursor: "pointer", fontSize: 11 }}>
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
