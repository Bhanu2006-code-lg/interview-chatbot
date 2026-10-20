import React, { useEffect, useRef, useState } from "react";

/**
 * AvatarInterviewer
 * A talking AI avatar that reads interview questions aloud using the
 * browser's Web Speech API (SpeechSynthesis). No external API needed.
 *
 * Props:
 *   question  {string}  - The question text to speak
 *   speaking  {bool}    - Controlled: true = speak, false = stop
 *   onDone    {fn}      - Called when speech finishes
 *   muted     {bool}    - If true, skip speaking but still animate briefly
 *   name      {string}  - Avatar name shown below face (default "Alex")
 *   role      {string}  - Interviewer title (default "Senior Interviewer")
 */
export default function AvatarInterviewer({
  question = "",
  speaking = false,
  onDone = () => {},
  muted = false,
  name = "Alex",
  role = "Senior Interviewer",
}) {
  const [isTalking, setIsTalking] = useState(false);
  const [eyeBlink, setEyeBlink] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(0); // 0–4 mouth open level
  const utterRef = useRef(null);
  const talkIntervalRef = useRef(null);
  const blinkIntervalRef = useRef(null);

  // ── Blink loop (always running) ──────────────────────────────
  useEffect(() => {
    blinkIntervalRef.current = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 150);
    }, 3500 + Math.random() * 2000);
    return () => clearInterval(blinkIntervalRef.current);
  }, []);

  // ── Mouth animation while talking ───────────────────────────
  useEffect(() => {
    if (isTalking) {
      talkIntervalRef.current = setInterval(() => {
        setMouthOpen(Math.floor(Math.random() * 5));
      }, 120);
    } else {
      clearInterval(talkIntervalRef.current);
      setMouthOpen(0);
    }
    return () => clearInterval(talkIntervalRef.current);
  }, [isTalking]);

  // ── Speak when `speaking` flips to true ─────────────────────
  useEffect(() => {
    if (!speaking || !question) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    if (muted) {
      // No audio — just flash talking for 1.5s then done
      setIsTalking(true);
      const t = setTimeout(() => { setIsTalking(false); onDone(); }, 1500);
      return () => clearTimeout(t);
    }

    const utter = new SpeechSynthesisUtterance(question);
    utter.rate = 0.92;
    utter.pitch = 1.05;
    utter.volume = 1;

    // Prefer a natural English voice if available
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = ["Google UK English Male", "Google US English", "Microsoft David", "Alex", "Daniel"];
      for (const p of preferred) {
        const v = voices.find(v => v.name === p);
        if (v) return v;
      }
      return voices.find(v => v.lang?.startsWith("en")) || null;
    };

    const assignVoice = () => {
      const v = pickVoice();
      if (v) utter.voice = v;
    };

    assignVoice();
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = assignVoice;
    }

    utter.onstart  = () => setIsTalking(true);
    utter.onend    = () => { setIsTalking(false); onDone(); };
    utter.onerror  = () => { setIsTalking(false); onDone(); };

    utterRef.current = utter;
    window.speechSynthesis.speak(utter);

    return () => {
      window.speechSynthesis.cancel();
      setIsTalking(false);
    };
  }, [speaking, question]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop speech when component unmounts
  useEffect(() => () => window.speechSynthesis.cancel(), []);

  // ── Mouth shape SVG paths ────────────────────────────────────
  const mouthPath = [
    "M 38 68 Q 50 72 62 68", // closed
    "M 38 68 Q 50 74 62 68", // slightly open
    "M 38 67 Q 50 76 62 67", // medium
    "M 37 66 Q 50 78 63 66", // open
    "M 36 65 Q 50 80 64 65", // wide open
  ][mouthOpen];

  const eyeH = eyeBlink ? 1 : 8;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>

      {/* ── Avatar face ── */}
      <div style={{ position: "relative", width: 120, height: 120 }}>

        {/* Talking glow ring */}
        <div style={{
          position: "absolute", inset: -4, borderRadius: "50%",
          background: isTalking
            ? "conic-gradient(#4CAF50, #2196F3, #4CAF50, #2196F3, #4CAF50)"
            : "conic-gradient(#2a2a4a, #333, #2a2a4a)",
          animation: isTalking ? "spin 2s linear infinite" : "none",
          transition: "background 0.3s",
        }} />
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>

        {/* Face SVG */}
        <svg
          viewBox="0 0 100 100"
          width={120} height={120}
          style={{
            position: "absolute", inset: 4, borderRadius: "50%",
            background: "linear-gradient(135deg,#1a1a3e,#0f0f2a)",
            border: "2px solid #2a2a4a",
            overflow: "hidden",
          }}
        >
          {/* Head */}
          <ellipse cx="50" cy="54" rx="36" ry="40" fill="#f5c5a3" />

          {/* Hair */}
          <ellipse cx="50" cy="18" rx="36" ry="14" fill="#2d1b00" />
          <rect x="14" y="18" width="72" height="10" fill="#2d1b00" />

          {/* Neck */}
          <rect x="42" y="90" width="16" height="12" fill="#f5c5a3" />

          {/* Shirt collar */}
          <polygon points="30,100 50,84 70,100" fill="#1a1a3e" />
          <polygon points="30,100 50,90 50,100" fill="#ffffff22" />

          {/* Left eye */}
          <ellipse cx="36" cy="52" rx="7" ry={eyeH * 0.8} fill="white" />
          {!eyeBlink && <ellipse cx="36" cy="52" rx="4" ry="4" fill="#1a1a2e" />}
          {!eyeBlink && <ellipse cx="37.5" cy="50.5" rx="1.5" ry="1.5" fill="white" />}

          {/* Right eye */}
          <ellipse cx="64" cy="52" rx="7" ry={eyeH * 0.8} fill="white" />
          {!eyeBlink && <ellipse cx="64" cy="52" rx="4" ry="4" fill="#1a1a2e" />}
          {!eyeBlink && <ellipse cx="65.5" cy="50.5" rx="1.5" ry="1.5" fill="white" />}

          {/* Eyebrows */}
          <path d="M 30 44 Q 36 41 42 44" stroke="#2d1b00" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 58 44 Q 64 41 70 44" stroke="#2d1b00" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Nose */}
          <path d="M 50 56 Q 46 64 48 66 Q 50 68 52 66 Q 54 64 50 56" fill="#e8a882" />

          {/* Mouth */}
          <path d={mouthPath} stroke="#c0624a" strokeWidth="2.5" fill={mouthOpen > 0 ? "#8b2020" : "none"} strokeLinecap="round" />
          {mouthOpen > 1 && <path d="M 42 70 Q 50 74 58 70" fill="#f8d7d7" />}

          {/* Cheeks */}
          <ellipse cx="27" cy="64" rx="7" ry="4" fill="#ffaaaa" opacity="0.4" />
          <ellipse cx="73" cy="64" rx="7" ry="4" fill="#ffaaaa" opacity="0.4" />

          {/* Tie / collar detail */}
          <polygon points="44,98 50,88 56,98 50,102" fill="#4CAF50" opacity="0.8" />
        </svg>
      </div>

      {/* Name & status */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>{name}</div>
        <div style={{ fontSize: 11, color: "#aaa" }}>{role}</div>
        <div style={{
          marginTop: 4, fontSize: 11, fontWeight: 600,
          color: isTalking ? "#4CAF50" : "#555",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
          transition: "color 0.3s",
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: isTalking ? "#4CAF50" : "#333",
            boxShadow: isTalking ? "0 0 8px #4CAF50" : "none",
            display: "inline-block", transition: "all 0.3s",
          }} />
          {isTalking ? "Speaking..." : "Listening"}
        </div>
      </div>
    </div>
  );
}
