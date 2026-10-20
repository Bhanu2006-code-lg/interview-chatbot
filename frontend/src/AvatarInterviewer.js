import React, { useEffect, useRef, useState } from "react";

/**
 * AvatarInterviewer
 * Speaks the question aloud whenever `question` changes (and speakTrigger increments).
 *
 * Props:
 *   question      {string}  - The question text to speak
 *   speakTrigger  {number}  - Increment this to (re-)trigger speech for the same question
 *   onDone        {fn}      - Called when speech finishes
 *   muted         {bool}    - Skip audio, just animate briefly
 *   name          {string}  - Avatar name (default "Alex")
 *   role          {string}  - Interviewer title
 */
export default function AvatarInterviewer({
  question   = "",
  speakTrigger = 0,
  onDone     = () => {},
  muted      = false,
  name       = "Alex",
  role       = "Senior Interviewer",
}) {
  const [isTalking, setIsTalking]   = useState(false);
  const [eyeBlink,  setEyeBlink]    = useState(false);
  const [mouthOpen, setMouthOpen]   = useState(0);
  const talkIntervalRef = useRef(null);
  const blinkIntervalRef = useRef(null);

  // ── Random eye-blink loop ────────────────────────────────────
  useEffect(() => {
    const blink = () => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 140);
    };
    const schedule = () => {
      blinkIntervalRef.current = setTimeout(() => { blink(); schedule(); }, 3000 + Math.random() * 2500);
    };
    schedule();
    return () => clearTimeout(blinkIntervalRef.current);
  }, []);

  // ── Mouth animation while talking ───────────────────────────
  useEffect(() => {
    if (isTalking) {
      talkIntervalRef.current = setInterval(() => {
        setMouthOpen(Math.floor(Math.random() * 5));
      }, 110);
    } else {
      clearInterval(talkIntervalRef.current);
      setMouthOpen(0);
    }
    return () => clearInterval(talkIntervalRef.current);
  }, [isTalking]);

  // ── Speak whenever speakTrigger changes (and question is ready) ──
  useEffect(() => {
    // speakTrigger === 0 means initial mount — never auto-speak on load
    if (!question || speakTrigger === 0) return;

    window.speechSynthesis.cancel();

    if (muted) {
      setIsTalking(true);
      const t = setTimeout(() => { setIsTalking(false); onDone(); }, 1200);
      return () => clearTimeout(t);
    }

    const utter = new SpeechSynthesisUtterance(question);
    utter.rate   = 0.9;
    utter.pitch  = 1.05;
    utter.volume = 1;

    // Always set callbacks first
    utter.onstart = () => setIsTalking(true);
    utter.onend   = () => { setIsTalking(false); onDone(); };
    utter.onerror = () => { setIsTalking(false); onDone(); };

    const assignVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = [
        "Google UK English Male",
        "Microsoft David Desktop - English (United States)",
        "Microsoft David",
        "Google US English",
        "Alex",
        "Daniel",
      ];
      for (const p of preferred) {
        const v = voices.find(v => v.name === p);
        if (v) { utter.voice = v; return; }
      }
      const en = voices.find(v => v.lang?.startsWith("en"));
      if (en) utter.voice = en;
    };

    const speak = () => {
      assignVoice();
      window.speechSynthesis.speak(utter);
    };

    let delayTimer;
    if (window.speechSynthesis.getVoices().length === 0) {
      // Voices not loaded yet — wait for them
      window.speechSynthesis.onvoiceschanged = speak;
    } else {
      // Small delay so React finishes painting the question text first
      delayTimer = setTimeout(speak, 350);
    }

    return () => {
      clearTimeout(delayTimer);
      window.speechSynthesis.cancel();
    };
  }, [speakTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop speech on unmount
  useEffect(() => () => window.speechSynthesis.cancel(), []);

  // ── Mouth SVG paths (closed → wide open) ────────────────────
  const mouthPath = [
    "M 38 68 Q 50 72 62 68",
    "M 38 68 Q 50 74 62 68",
    "M 38 67 Q 50 76 62 67",
    "M 37 66 Q 50 78 63 66",
    "M 36 65 Q 50 80 64 65",
  ][mouthOpen];

  const eyeRy = eyeBlink ? 1 : 6;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 110 }}>

      {/* ── Face ── */}
      <div style={{ position: "relative", width: 120, height: 120 }}>

        {/* Talking glow ring */}
        <div style={{
          position: "absolute", inset: -4, borderRadius: "50%",
          background: isTalking
            ? "conic-gradient(#4CAF50,#2196F3,#4CAF50,#2196F3,#4CAF50)"
            : "conic-gradient(#222,#333,#222)",
          animation: isTalking ? "avatarSpin 1.8s linear infinite" : "none",
          transition: "background 0.4s",
        }} />
        <style>{`@keyframes avatarSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

        <svg viewBox="0 0 100 100" width={112} height={112}
          style={{ position: "absolute", inset: 4, borderRadius: "50%", overflow: "hidden",
                   background: "linear-gradient(160deg,#1a1a3e,#0f0f2a)" }}>

          {/* Head */}
          <ellipse cx="50" cy="55" rx="36" ry="40" fill="#f5c5a3" />

          {/* Hair */}
          <ellipse cx="50" cy="18" rx="37" ry="15" fill="#2d1b00" />
          <rect x="14" y="20" width="72" height="10" fill="#2d1b00" />

          {/* Neck */}
          <rect x="42" y="90" width="16" height="12" fill="#f5c5a3" />

          {/* Shirt / collar */}
          <polygon points="20,100 50,82 80,100" fill="#1565C0" />
          <polygon points="44,100 50,88 56,100" fill="#E3F2FD" opacity="0.9" />

          {/* Tie */}
          <polygon points="46,96 50,86 54,96 50,101" fill="#4CAF50" />

          {/* Left eye white */}
          <ellipse cx="36" cy="53" rx="7" ry={eyeRy} fill="white" />
          {!eyeBlink && <>
            <ellipse cx="36" cy="53" rx="4" ry="4" fill="#1a1a2e" />
            <ellipse cx="37.5" cy="51.5" rx="1.4" ry="1.4" fill="white" />
          </>}

          {/* Right eye white */}
          <ellipse cx="64" cy="53" rx="7" ry={eyeRy} fill="white" />
          {!eyeBlink && <>
            <ellipse cx="64" cy="53" rx="4" ry="4" fill="#1a1a2e" />
            <ellipse cx="65.5" cy="51.5" rx="1.4" ry="1.4" fill="white" />
          </>}

          {/* Eyebrows */}
          <path d="M 30 44 Q 36 41 42 44" stroke="#3e2000" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          <path d="M 58 44 Q 64 41 70 44" stroke="#3e2000" strokeWidth="2.2" fill="none" strokeLinecap="round"/>

          {/* Nose */}
          <path d="M 50 57 Q 46 65 48 67 Q 50 69 52 67 Q 54 65 50 57" fill="#e8a882"/>

          {/* Cheeks */}
          <ellipse cx="26" cy="66" rx="7" ry="4" fill="#ff9999" opacity="0.35"/>
          <ellipse cx="74" cy="66" rx="7" ry="4" fill="#ff9999" opacity="0.35"/>

          {/* Mouth */}
          <path d={mouthPath} stroke="#b04030" strokeWidth="2.5"
            fill={mouthOpen > 0 ? "#7a1515" : "none"} strokeLinecap="round"/>
          {mouthOpen > 1 && <path d="M 42 71 Q 50 75 58 71" fill="#f8d0d0"/>}
        </svg>
      </div>

      {/* Name & status */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>{name}</div>
        <div style={{ fontSize: 11, color: "#888" }}>{role}</div>
        <div style={{
          marginTop: 4, fontSize: 11, fontWeight: 600,
          color: isTalking ? "#4CAF50" : "#555",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          transition: "color 0.3s",
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: isTalking ? "#4CAF50" : "#333",
            boxShadow: isTalking ? "0 0 8px #4CAF50" : "none",
            display: "inline-block", transition: "all 0.3s",
          }}/>
          {isTalking ? "Asking..." : "Listening"}
        </div>
      </div>
    </div>
  );
}
