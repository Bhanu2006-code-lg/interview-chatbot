import React, { useRef, useState, useEffect, useCallback } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import API_BASE from "./api";

function ScoreRing({ score }) {
  const r = 54, c = 2 * Math.PI * r;
  const fill = ((score || 0) / 100) * c;
  const color = score >= 80 ? "#4CAF50" : score >= 60 ? "#2196F3" : score >= 40 ? "#FF9800" : "#f44336";
  return (
    <svg width={130} height={130} style={{ display: "block" }}>
      <circle cx={65} cy={65} r={r} fill="none" stroke="#2a2a4a" strokeWidth={10} />
      <circle cx={65} cy={65} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${fill} ${c}`} strokeLinecap="round"
        transform="rotate(-90 65 65)" style={{ transition: "stroke-dasharray 1s ease" }} />
      <text x={65} y={60} textAnchor="middle" fill="white" fontSize={26} fontWeight="bold">{score}</text>
      <text x={65} y={80} textAnchor="middle" fill="#888" fontSize={12}>/100</text>
    </svg>
  );
}

function useStreak() {
  const today = new Date().toDateString();
  const [streak, setStreak] = useState(() => {
    const s = JSON.parse(localStorage.getItem("streak") || '{"count":0,"last":""}');
    return s;
  });
  const bump = () => {
    setStreak(prev => {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const count = prev.last === today ? prev.count : prev.last === yesterday ? prev.count + 1 : 1;
      const next = { count, last: today };
      localStorage.setItem("streak", JSON.stringify(next));
      return next;
    });
  };
  return [streak.count, bump];
}

const FILLERS = ["um","uh","like","you know","basically","actually","right","so"];
function highlightFillers(text) {
  if (!text) return null;
  const regex = new RegExp(`\\b(${FILLERS.join("|")})\\b`, "gi");
  const parts = text.split(regex);
  return parts.map((p, i) =>
    regex.test(p) ? <mark key={i} style={{ background: "#FF980044", color: "#FF9800", borderRadius: 3, padding: "0 2px" }}>{p}</mark> : p
  );
}

const ALLOWED_ROLES = new Set([
  "Software Engineer", "Data Scientist", "Product Manager", "DevOps Engineer",
  "UX/UI Designer", "Business Analyst", "Cybersecurity Analyst", "AI Engineer",
  "Mobile Developer", "UPSC Civil Services (IAS/IPS/IFS)", "IBPS Bank PO/Clerk",
  "Railway RRB NTPC", "SSC CGL/CHSL", "Judiciary/Law Services",
  "Defence Services NDA/CDS", "State Police Services", "AIIMS/Medical PSU",
  "Teaching KVS/NVS/TGT/PGT",
]);
const ALLOWED_LEVELS = new Set(["Beginner", "Intermediate", "Advanced"]);

export default function InterviewRoom({ candidate, selectedCourse, onChangeCourse }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const faceTimerRef = useRef(null);
  const recRef = useRef(null);
  const isRecRef = useRef(false);
  const transcriptRef = useRef("");
  const startTimeRef = useRef(null);
  const countdownRef = useRef(null);
  const eyeGoodRef = useRef(0);
  const eyeTotalRef = useRef(0);

  const [camStatus, setCamStatus] = useState("📷 Camera will start when you begin");
  const [camReady, setCamReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [words, setWords] = useState(0);
  const [fillers, setFillers] = useState(0);
  const [eyeGood, setEyeGood] = useState(0);
  const [eyeTotal, setEyeTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerLimit, setTimerLimit] = useState(120);
  const [question, setQuestion] = useState("");
  const [qLoading, setQLoading] = useState(false);
  const [level, setLevel] = useState("Intermediate");
  const levelRef = useRef("Intermediate");
  const [scorecard, setScorecard] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const usedQuestionsRef = useRef([]);
  const [improved, setImproved] = useState(null);
  const [improveLoading, setImproveLoading] = useState(false);
  const [followup, setFollowup] = useState(null);
  const [followupLoading, setFollowupLoading] = useState(false);
  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [streakCount, bumpStreak] = useStreak();
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [readLang, setReadLang] = useState("");
  const [translatedQuestion, setTranslatedQuestion] = useState("");
  const [translateLoading, setTranslateLoading] = useState(false);
  const [micLang, setMicLang] = useState("en-US");
  const micLangRef = useRef("en-US");
  const [micActive, setMicActive] = useState(false);

  const loadSessions = useCallback(() => {
    fetch(`${API_BASE}/sessions?candidate_id=${candidate.id}`)
      .then(r => r.json())
      .then(d => setSessions(Array.isArray(d.sessions) ? d.sessions : []))
      .catch(() => {});
  }, [candidate.id]);

  const loadQuestion = useCallback((forceLevel) => {
    const lvl = forceLevel || levelRef.current;
    if (!ALLOWED_LEVELS.has(lvl) || !ALLOWED_ROLES.has(selectedCourse.role)) return;
    setQLoading(true);
    setRelatedQuestions([]);
    const used = usedQuestionsRef.current;
    const usedParam = encodeURIComponent(used.slice(-10).join("|"));
    fetch(`${API_BASE}/question?role=${encodeURIComponent(selectedCourse.role)}&level=${encodeURIComponent(lvl)}&t=${Date.now()}&used=${usedParam}`)
      .then(r => r.json())
      .then(d => {
        if (d.question) {
          setQuestion(d.question);
          usedQuestionsRef.current = [...used, d.question];
          
          setTranslatedQuestion("");
          setHint("");
          if (readLang) translateQuestion(readLang, d.question);
          setRelatedLoading(true);
          fetch(`${API_BASE}/related-questions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: d.question, role: selectedCourse.role, level: lvl })
          }).then(r => r.json()).then(rd => setRelatedQuestions(rd.questions || [])).catch(() => {}).finally(() => setRelatedLoading(false));
        } else throw new Error("empty");
      })
      .catch(() => {
        const fallbacks = [
          `Tell me about a time you solved a difficult problem as a ${selectedCourse.role}.`,
          `Describe a situation where you showed leadership in your ${selectedCourse.role} work.`,
          `Tell me about a project you're most proud of as a ${selectedCourse.role}.`,
          `Describe a time you had to learn something new quickly in your ${selectedCourse.role} role.`,
          `Tell me about a conflict you resolved in a team as a ${selectedCourse.role}.`,
        ];
        const available = fallbacks.filter(q => !usedQuestionsRef.current.includes(q));
        const pick = (available.length ? available : fallbacks)[Math.floor(Math.random() * (available.length || fallbacks.length))];
        setQuestion(pick);
        usedQuestionsRef.current = [...usedQuestionsRef.current, pick];
        
      })
      .finally(() => setQLoading(false));
  }, [selectedCourse.role, readLang]);

  const translateQuestion = (lang, q) => {
    if (!lang || !q) return;
    setTranslateLoading(true);
    setTranslatedQuestion("");
    fetch(`${API_BASE}/translate-question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, language: lang })
    }).then(r => r.json()).then(d => setTranslatedQuestion(d.translated || "")).catch(() => {}).finally(() => setTranslateLoading(false));
  };

  const pickRelated = (q) => {
    setQuestion(q);
    setRelatedQuestions([]);
    usedQuestionsRef.current = [...usedQuestionsRef.current, q];
    
    setRelatedLoading(true);
    fetch(`${API_BASE}/related-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, role: selectedCourse.role, level })
    }).then(r => r.json()).then(rd => setRelatedQuestions(rd.questions || [])).catch(() => {}).finally(() => setRelatedLoading(false));
  };

  useEffect(() => {
    loadQuestion();
    loadSessions();
    return () => {
      clearInterval(faceTimerRef.current);
      clearInterval(countdownRef.current);
      isRecRef.current = false;
      try { recRef.current?.stop(); } catch {}
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [loadQuestion, loadSessions]);


  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      const v = videoRef.current;
      if (v) {
        v.srcObject = stream;
        v.play().catch(() => {});
      }
      setCamReady(true);
      setCamStatus("👁 Detecting face...");
      const canvas = document.createElement("canvas");
      canvas.width = 160; canvas.height = 120;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      // Use FaceDetector API if available, else skin-tone fallback
      const useFaceDetector = "FaceDetector" in window;
      const faceDetector = useFaceDetector ? new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 }) : null;

      faceTimerRef.current = setInterval(async () => {
        if (!isRecRef.current) return;
        const vid = videoRef.current;
        if (!vid || vid.readyState < 2) return;

        ctx.drawImage(vid, 0, 0, 160, 120);

        let faceFound = false;

        if (faceDetector) {
          try {
            const faces = await faceDetector.detect(canvas);
            faceFound = faces.length > 0;
          } catch { faceFound = false; }
        } else {
          // Skin-tone detection fallback: count pixels in skin HSV range
          const data = ctx.getImageData(0, 0, 160, 120).data;
          let skinPixels = 0;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2];
            // Skin tone range in RGB
            if (r > 95 && g > 40 && b > 20 &&
                r > g && r > b &&
                Math.abs(r - g) > 15 &&
                r - b > 15) skinPixels++;
          }
          const skinRatio = skinPixels / (160 * 120 / 4);
          faceFound = skinRatio > 0.08; // at least 8% skin pixels
        }

        eyeTotalRef.current++;
        setEyeTotal(t => t + 1);
        if (faceFound) {
          eyeGoodRef.current++;
          setEyeGood(g => g + 1);
          setCamStatus("👁 Face Detected");
        } else {
          setCamStatus("⚠️ No Face Detected");
        }
      }, 800);
    } catch {
      setCamStatus("❌ Camera denied — allow in browser address bar");
    }
  }

  async function startRecording() {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStream.getTracks().forEach(t => t.stop());
    } catch {
      alert("Microphone permission denied. Please allow microphone access in your browser settings.");
      return;
    }
    if (!camReady) await startCamera();
    eyeGoodRef.current = 0; eyeTotalRef.current = 0;
    setEyeGood(0); setEyeTotal(0);
    transcriptRef.current = "";
    setTranscript(""); setWords(0); setFillers(0); setScorecard(null); setMicActive(false);
    startTimeRef.current = Date.now();
    isRecRef.current = true;
    setTimeLeft(timerLimit);

    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(countdownRef.current); stopRecording(); return 0; }
        return prev - 1;
      });
    }, 1000);

    function countFillers(text) {
      const lower = text.toLowerCase();
      return FILLERS.reduce((acc, f) => acc + (lower.match(new RegExp(`\\b${f}\\b`, "g")) || []).length, 0);
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Please use Google Chrome or Edge for voice recognition."); return; }

    
    let restartTimer = null;

    function scheduleRestart(delay = 80) {
      clearTimeout(restartTimer);
      restartTimer = setTimeout(() => {
        if (isRecRef.current) runSR();
      }, delay);
    }

    function runSR() {
      if (!isRecRef.current) return;
      const r = new SR();
      r.continuous = true;
      r.interimResults = true;
      r.maxAlternatives = 1;
      r.lang = micLangRef.current;
      recRef.current = r;
      

      r.onspeechstart = () => setMicActive(true);
      r.onspeechend   = () => setMicActive(false);

      r.onresult = (e) => {
        let newFinal = "";
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            newFinal += t + " ";
          } else {
            interim += t;
          }
        }
        if (newFinal) {
          transcriptRef.current = (transcriptRef.current + " " + newFinal).trim();
          
          setWords(transcriptRef.current.split(/\s+/).filter(Boolean).length);
          setFillers(countFillers(transcriptRef.current));
        }
        const display = interim
          ? (transcriptRef.current + " " + interim).trim()
          : transcriptRef.current;
        setTranscript(display);
      };

      r.onerror = (e) => {
        setMicActive(false);
        if (e.error === "not-allowed" || e.error === "audio-capture") {
          alert(`Microphone error: ${e.error}. Please check browser permissions.`);
          stopRecording();
          return;
        }
        // no-speech = user paused, just restart quietly
        if (isRecRef.current) scheduleRestart(e.error === "no-speech" ? 300 : 80);
      };

      r.onend = () => {
        setMicActive(false);
        if (isRecRef.current) scheduleRestart(100);
      };

      try { r.start(); } catch { if (isRecRef.current) scheduleRestart(150); }
    }
    runSR();
    setRecording(true);
  }

  async function stopRecording() {
    clearInterval(countdownRef.current);
    isRecRef.current = false;
    setMicActive(false);
    const rec = recRef.current;
    if (rec) {
      if (typeof rec.stop === "function") { try { rec.stop(); } catch {} }
    }
    recRef.current = null;
    setRecording(false);
    setTimeLeft(null);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamReady(false);
    setCamStatus("📷 Camera will start when you begin");
    clearInterval(faceTimerRef.current);

    const eyePct = eyeTotalRef.current > 0 ? (eyeGoodRef.current / eyeTotalRef.current) * 100 : 0;
    const mins = startTimeRef.current ? (Date.now() - startTimeRef.current) / 60000 : 1;
    const wpmVal = transcriptRef.current.split(/\s+/).filter(Boolean).length / Math.max(mins, 0.1);

    if (!transcriptRef.current.trim()) {
      alert("No speech detected. Please speak clearly and try again.");
      return;
    }

    setEvalLoading(true);
    try {
      const res = await fetch(`${API_BASE}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          transcript: transcriptRef.current,
          eye_contact: Math.round(eyePct),
          filler_count: fillers,
          wpm: Math.round(wpmVal),
          candidate_id: candidate.id
        }),
      });
      const data = await res.json();
      setScorecard(data);
      setImproved(null); setFollowup(null);
      bumpStreak();
      loadSessions();
    } catch {
      alert("Evaluation failed. Make sure backend is running on port 8000.");
    }
    setEvalLoading(false);
  }

  const eyePct = eyeTotal > 0 ? ((eyeGood / eyeTotal) * 100).toFixed(1) : "0.0";
  const elapsed = startTimeRef.current && recording ? (Date.now() - startTimeRef.current) / 60000 : 0;
  const wpm = elapsed > 0.01 ? (words / elapsed).toFixed(1) : "0.0";
  const gc = g => ({ A: "#4CAF50", B: "#2196F3", C: "#FF9800" }[g] || "#f44336");

  const radarData = scorecard ? [
    { s: "Situation", v: scorecard.situation_score || 0 },
    { s: "Task", v: scorecard.task_score || 0 },
    { s: "Action", v: scorecard.action_score || 0 },
    { s: "Result", v: scorecard.result_score || 0 },
    { s: "Eye", v: Math.round((scorecard.eye_contact || 0) / 4) },
    { s: "Fluency", v: Math.max(0, 25 - (scorecard.filler_count || 0) * 2) },
  ] : [];

  return (
    <div style={{ padding: "20px 24px", maxWidth: 1200, margin: "0 auto" }}>

      {/* Streak Banner */}
      {streakCount > 0 && (
        <div style={{ background: "linear-gradient(135deg,#FF980022,#1a1a2e)", border: "1px solid #FF980055", borderRadius: 10, padding: "8px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🔥</span>
          <span style={{ color: "#FF9800", fontWeight: "bold", fontSize: 15 }}>{streakCount}-Day Practice Streak!</span>
          <span style={{ color: "#888", fontSize: 13 }}>Keep it up — consistency beats talent.</span>
        </div>
      )}

      {/* Question */}
      <div style={{ background: "#1a1a2e", border: "1px solid #333", padding: "16px 20px", borderRadius: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#4CAF50", textTransform: "uppercase", fontWeight: "bold" }}>{selectedCourse.icon} {selectedCourse.title}</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Beginner","Intermediate","Advanced"].map(l => (
              <button key={l} onClick={() => { setLevel(l); levelRef.current = l; loadQuestion(l); }} disabled={recording}
                style={{ padding: "3px 12px", borderRadius: 20, border: level===l?"none":"1px solid #444", background: level===l?(l==="Beginner"?"#4CAF50":l==="Intermediate"?"#2196F3":"#FF9800"):"transparent", color: "white", cursor: "pointer", fontSize: 12 }}>{l}</button>
            ))}
            <button onClick={() => !recording && loadQuestion()} disabled={recording}
              style={{ padding: "3px 12px", borderRadius: 20, border: "1px solid #4CAF50", background: "transparent", color: "#4CAF50", cursor: recording ? "not-allowed" : "pointer", fontSize: 12 }}>Next ▶</button>
            <button onClick={onChangeCourse}
              style={{ padding: "3px 12px", background: "transparent", border: "1px solid #666", borderRadius: 20, color: "#aaa", cursor: "pointer", fontSize: 12 }}>⇄ Change</button>
          </div>
        </div>
        <div style={{ fontSize: 17, lineHeight: 1.7, color: "white" }}>
          {qLoading ? "🤖 Generating question..." : (question || "Loading...")}
        </div>
        {hint && (
          <div style={{ marginTop: 10, padding: "10px 14px", background: "#FF980015", border: "1px solid #FF980044", borderRadius: 8, fontSize: 13, color: "#FFB74D", lineHeight: 1.6 }}>
            💡 {hint}
          </div>
        )}
        {!recording && question && !qLoading && (
          <button onClick={async () => { setHintLoading(true); setHint(""); const r = await fetch(`${API_BASE}/hint`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question,role:selectedCourse.role})}); const d = await r.json(); setHint(d.hint||""); setHintLoading(false); }}
            disabled={hintLoading || !!hint}
            style={{ marginTop: 8, padding: "5px 14px", background: "transparent", border: "1px solid #FF9800", borderRadius: 20, color: "#FF9800", cursor: "pointer", fontSize: 12 }}>
            {hintLoading ? "Getting hint..." : hint ? "💡 Hint shown" : "💡 Get Hint"}
          </button>
        )}

        {/* Read in Language */}
        {question && !qLoading && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#888" }}>🌐 Read in:</span>
            <select
              value={readLang}
              onChange={e => { setReadLang(e.target.value); if (e.target.value) translateQuestion(e.target.value, question); else setTranslatedQuestion(""); }}
              style={{ background: "#0f0f1a", border: "1px solid #333", borderRadius: 8, color: "#ccc", padding: "4px 8px", fontSize: 12, cursor: "pointer" }}>
              <option value="">English (original)</option>
              <option value="Odia">🇮🇳 Odia</option>
              <option value="Hindi">🇮🇳 Hindi</option>
              <option value="Bengali">🇮🇳 Bengali</option>
              <option value="Telugu">🇮🇳 Telugu</option>
              <option value="Tamil">🇮🇳 Tamil</option>
              <option value="Marathi">🇮🇳 Marathi</option>
              <option value="Gujarati">🇮🇳 Gujarati</option>
              <option value="Kannada">🇮🇳 Kannada</option>
              <option value="Malayalam">🇮🇳 Malayalam</option>
              <option value="Punjabi">🇮🇳 Punjabi</option>
              <option value="Urdu">🇮🇳 Urdu</option>
              <option value="Spanish">🇪🇸 Spanish</option>
              <option value="French">🇫🇷 French</option>
              <option value="German">🇩🇪 German</option>
              <option value="Arabic">🇸🇦 Arabic</option>
              <option value="Chinese">🇨🇳 Chinese</option>
              <option value="Japanese">🇯🇵 Japanese</option>
            </select>
            {translateLoading && <span style={{ fontSize: 12, color: "#888" }}>Translating...</span>}
          </div>
        )}
        {translatedQuestion && (
          <div style={{ marginTop: 8, padding: "10px 14px", background: "#0f0f1a", borderRadius: 8, borderLeft: "3px solid #2196F3", fontSize: 15, color: "#90CAF9", lineHeight: 1.7 }}>
            {translatedQuestion}
          </div>
        )}
        {/* Related Questions */}
        {(relatedQuestions.length > 0 || relatedLoading) && !recording && (
          <div style={{ marginTop: 12, borderTop: "1px solid #2a2a4a", paddingTop: 12 }}>
            <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>🔗 Related Questions</div>
            {relatedLoading && relatedQuestions.length === 0
              ? <div style={{ color: "#555", fontSize: 13 }}>Generating related questions...</div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {relatedQuestions.map((q, i) => (
                    <button key={i} onClick={() => !recording && pickRelated(q)} disabled={recording}
                      style={{ textAlign: "left", background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: 8, padding: "8px 12px", color: "#ccc", cursor: "pointer", fontSize: 13, lineHeight: 1.5, transition: "border-color 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#4CAF50"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a4a"}>
                      <span style={{ color: "#4CAF50", marginRight: 6 }}>Q{i + 1}.</span>{q}
                    </button>
                  ))}
                </div>
            }
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="ir-grid">
        {/* LEFT */}
        <div>
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#000", minHeight: 240 }}>
            {!camReady && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0a14", zIndex: 2 }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>📷</div>
                <div style={{ color: "#555", fontSize: 13 }}>Camera starts when you begin the interview</div>
              </div>
            )}
            <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", display: "block", minHeight: 240, objectFit: "cover", transform: "scaleX(-1)" }} />
            <div style={{ position: "absolute", bottom: 10, left: 10, background: camStatus.includes("Face") ? "rgba(76,175,80,0.9)" : "rgba(200,50,50,0.9)", padding: "5px 14px", borderRadius: 20, fontSize: 13, color: "white" }}>
              {camStatus}
            </div>
            {recording && (
              <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(244,67,54,0.9)", padding: "5px 12px", borderRadius: 20, fontSize: 13, color: "white", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, background: "white", borderRadius: "50%" }} /> REC
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
            {[["Eye Contact",`${eyePct}%`,"#4CAF50"],["WPM",wpm,"#2196F3"],["Filler Words",fillers,"#FF9800"],["Words Spoken",words,"#9C27B0"]].map(([label,value,color]) => (
              <div key={label} style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", padding: 14, borderRadius: 10, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: "bold", color }}>{value}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            {!recording ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: "#aaa" }}>Time:</span>
                  {[60,120,180,300].map(s => (
                    <button key={s} onClick={() => setTimerLimit(s)}
                      style={{ padding: "5px 12px", borderRadius: 20, border: timerLimit===s?"2px solid #4CAF50":"1px solid #555", background: timerLimit===s?"#4CAF50":"transparent", color: "white", cursor: "pointer", fontSize: 13 }}>
                      {s < 60 ? `${s}s` : `${s/60}m`}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: "#aaa" }}>Language:</span>
                  {[["en-US","🇺🇸 English"],["hi-IN","🇮🇳 हिंदी"]].map(([code,label]) => (
                    <button key={code} onClick={() => { setMicLang(code); micLangRef.current = code; }}
                      style={{ padding: "5px 14px", borderRadius: 20, border: micLang===code?"2px solid #2196F3":"1px solid #555", background: micLang===code?"#2196F3":"transparent", color: "white", cursor: "pointer", fontSize: 13 }}>
                      {label}
                    </button>
                  ))}
                </div>
                <button onClick={startRecording}
                  style={{ width: "100%", padding: 14, fontSize: 16, background: "linear-gradient(135deg,#4CAF50,#2196F3)", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: "bold" }}>
                  🎤 Start Interview
                </button>
              </>
            ) : (
              <>
                <div style={{ textAlign: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 32, fontWeight: "bold", color: timeLeft<=10?"#f44336":timeLeft<=30?"#FF9800":"#4CAF50" }}>
                    {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,"0")}
                  </span>
                  <div style={{ height: 6, background: "#333", borderRadius: 3, marginTop: 6 }}>
                    <div style={{ height: "100%", borderRadius: 3, background: timeLeft<=10?"#f44336":"#4CAF50", width: `${(timeLeft/timerLimit)*100}%`, transition: "width 1s linear" }} />
                  </div>
                </div>
                <button onClick={stopRecording}
                  style={{ width: "100%", padding: 14, fontSize: 16, background: "#f44336", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: "bold" }}>
                  ■ Stop & Get Feedback
                </button>
              </>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, padding: 18, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>🎙 Live Transcription</span>
              {recording && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11,
                  color: micActive ? "#4CAF50" : "#888",
                  background: micActive ? "#4CAF5022" : "#ffffff11",
                  padding: "2px 8px", borderRadius: 20, transition: "all 0.3s" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: micActive ? "#4CAF50" : "#555",
                    boxShadow: micActive ? "0 0 6px #4CAF50" : "none", display: "inline-block", transition: "all 0.3s" }} />
                  {micActive ? "Listening..." : "Waiting..."}
                </span>
              )}
            </div>
            <div style={{ color: transcript ? "#ddd" : "#555", lineHeight: 1.7, minHeight: 100, maxHeight: 220, overflowY: "auto", fontSize: 14, whiteSpace: "pre-wrap" }}>
              {transcript ? highlightFillers(transcript) : "Click 'Start Interview' and speak — your words appear here in real time..."}
            </div>
          </div>

          <div style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>📊 Progress Tracking</div>
              <button onClick={() => fetch(`${API_BASE}/sessions/reset?candidate_id=${candidate.id}`,{method:"DELETE"}).then(()=>setSessions([]))}
                style={{ fontSize: 12, background: "transparent", border: "1px solid #f44336", color: "#f44336", padding: "3px 10px", borderRadius: 20, cursor: "pointer" }}>Reset</button>
            </div>
            {sessions.length === 0
              ? <div style={{ color: "#555", fontSize: 13, textAlign: "center", padding: "16px 0" }}>Complete an interview to see progress</div>
              : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr style={{ borderBottom: "1px solid #333" }}>
                    {["Date","Score","Grade","Eye%","WPM"].map(h => <th key={h} style={{ padding: "6px 8px", textAlign: "left", color: "#888", fontWeight: "normal" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{sessions.map(s => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #1e1e3a" }}>
                      <td style={{ padding: "7px 8px", color: "#ccc" }}>{s.date}</td>
                      <td style={{ padding: "7px 8px", color: "white", fontWeight: "bold" }}>{s.score}</td>
                      <td style={{ padding: "7px 8px" }}><span style={{ background: gc(s.grade), color: "white", padding: "2px 8px", borderRadius: 20, fontSize: 11 }}>{s.grade}</span></td>
                      <td style={{ padding: "7px 8px", color: "#ccc" }}>{parseFloat(s.eye||0).toFixed(1)}%</td>
                      <td style={{ padding: "7px 8px", color: "#ccc" }}>{parseFloat(s.wpm||0).toFixed(1)}</td>
                    </tr>
                  ))}</tbody>
                </table>
            }
          </div>
        </div>
      </div>

      {evalLoading && (
        <div style={{ textAlign: "center", padding: 30, fontSize: 18, color: "#4CAF50" }}>
          🤖 Analyzing your performance... please wait
        </div>
      )}

      {scorecard && !evalLoading && (
        <div style={{ background: "#1a1a2e", border: "1px solid #4CAF50", borderRadius: 12, padding: 24, marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ margin: 0, color: "white" }}>📋 Post-Interview Scorecard</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={async () => { setFollowupLoading(true); const r = await fetch(`${API_BASE}/followup`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question,transcript:transcriptRef.current,role:selectedCourse.role})}); const d = await r.json(); setFollowup(d.followup); setFollowupLoading(false); }}
                disabled={followupLoading}
                style={{ padding: "8px 16px", background: "transparent", border: "1px solid #FF9800", borderRadius: 20, color: "#FF9800", cursor: "pointer", fontSize: 13, fontWeight: "bold" }}>
                {followupLoading ? "..." : "🔥 Follow-up Q"}
              </button>
              <button onClick={async () => { setImproveLoading(true); const r = await fetch(`${API_BASE}/improve-answer`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question,transcript:transcriptRef.current,role:selectedCourse.role})}); const d = await r.json(); setImproved(d.improved); setImproveLoading(false); }}
                disabled={improveLoading}
                style={{ padding: "8px 16px", background: "linear-gradient(135deg,#9C27B0,#2196F3)", border: "none", borderRadius: 20, color: "white", cursor: "pointer", fontSize: 13, fontWeight: "bold" }}>
                {improveLoading ? "Rewriting..." : "✨ Improve My Answer"}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap", alignItems: "center" }}>
            <ScoreRing score={scorecard.total_score || 0} />
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[["Grade",scorecard.grade||"B",gc(scorecard.grade)],["Eye",`${Math.round(scorecard.eye_contact||0)}%`,"#FF9800"],["WPM",Math.round(scorecard.wpm||0),"#9C27B0"],["Fillers",scorecard.filler_count||0,"#f44336"]].map(([l,v,bg]) => (
                <div key={l} style={{ background: bg, color: "white", padding: "14px 18px", borderRadius: 10, textAlign: "center", minWidth: 80 }}>
                  <div style={{ fontSize: 26, fontWeight: "bold" }}>{v}</div>
                  <div style={{ fontSize: 11, marginTop: 3 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          {followup && (
            <div style={{ background: "#FF980015", border: "1px solid #FF980055", borderRadius: 10, padding: "14px 18px", marginBottom: 18 }}>
              <div style={{ color: "#FF9800", fontWeight: "bold", marginBottom: 6, fontSize: 13 }}>🔥 Follow-up Question</div>
              <div style={{ color: "#fff", fontSize: 15, lineHeight: 1.6 }}>{followup}</div>
            </div>
          )}
          {improved && (
            <div style={{ background: "#9C27B015", border: "1px solid #9C27B055", borderRadius: 10, padding: "14px 18px", marginBottom: 18 }}>
              <div style={{ color: "#CE93D8", fontWeight: "bold", marginBottom: 8, fontSize: 13 }}>✨ AI-Improved Answer</div>
              <div style={{ color: "#ddd", fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{improved}</div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="scorecard-grid">
            <div>
              <h3 style={{ marginBottom: 12, color: "white" }}>STAR Breakdown</h3>
              {["situation","task","action","result"].map(k => (
                <div key={k} style={{ marginBottom: 10, background: "#0f0f1a", padding: "10px 14px", borderRadius: 8, borderLeft: "3px solid #4CAF50" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#4CAF50", textTransform: "capitalize", fontWeight: "bold", fontSize: 14 }}>{k}</span>
                    <span style={{ color: "white", fontSize: 14 }}>{scorecard[`${k}_score`]||0}/25</span>
                  </div>
                  <div style={{ color: "#aaa", fontSize: 13 }}>{scorecard[`${k}_feedback`]||"—"}</div>
                </div>
              ))}
              <div style={{ background: "#0f0f1a", padding: 14, borderRadius: 8, marginTop: 10 }}>
                <div style={{ color: "#4CAF50", fontWeight: "bold", marginBottom: 6 }}>Overall Feedback</div>
                <p style={{ color: "#ddd", lineHeight: 1.7, margin: 0, fontSize: 14 }}>{scorecard.overall_feedback}</p>
              </div>
            </div>
            <div>
              <h3 style={{ marginBottom: 12, color: "white" }}>Performance Radar</h3>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="s" tick={{ fill: "#aaa", fontSize: 12 }} />
                  <Radar dataKey="v" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.35} />
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", color: "white" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
