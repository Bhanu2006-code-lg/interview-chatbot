import React, { useState, useRef, useEffect } from "react";
import API_BASE from "./api";

export default function Chatbot({ candidate }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi ${candidate?.name || "there"}! 👋 I'm InterviewIQ Pro. Ask me anything about interview prep, STAR method, resume tips, or your ${candidate?.role || ""} role!` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    const updated = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, role: candidate?.role, history: updated.slice(-6) }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "❌ Cannot connect to server. Make sure backend is running." }]);
    }
    setLoading(false);
  };

  const suggestions = ["How do I use the STAR method?", "Give me a mock interview question", "How to improve eye contact?", "Tips for reducing filler words"];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "30px 24px", display: "flex", flexDirection: "column", height: "calc(100vh - 60px)" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: "bold" }}>🤖 AI Interview Coach</div>
        <div style={{ fontSize: 13, color: "#aaa" }}>Ask anything about interview prep</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, marginBottom: 16, paddingRight: 4 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "75%", padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role === "user" ? "linear-gradient(135deg,#4CAF50,#2196F3)" : "#1a1a2e",
              border: m.role === "assistant" ? "1px solid #333" : "none",
              fontSize: 14, lineHeight: 1.6, color: "white", whiteSpace: "pre-wrap"
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", color: "#4CAF50", fontSize: 14 }}>
              ● ● ●
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        {suggestions.map(s => (
          <button key={s} onClick={() => { setInput(s); }}
            style={{ padding: "5px 12px", background: "transparent", border: "1px solid #333", borderRadius: 20, color: "#aaa", cursor: "pointer", fontSize: 12 }}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask about interview tips, STAR method, resume..."
          style={{ flex: 1, padding: "12px 16px", background: "#1a1a2e", border: "1px solid #333", borderRadius: 25, color: "white", fontSize: 14, outline: "none" }}
        />
        <button onClick={send} disabled={loading || !input.trim()}
          style={{ padding: "12px 22px", background: loading || !input.trim() ? "#333" : "linear-gradient(135deg,#4CAF50,#2196F3)", border: "none", borderRadius: 25, color: "white", cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: 14 }}>
          Send
        </button>
      </div>
    </div>
  );
}
