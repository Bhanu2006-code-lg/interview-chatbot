import React, { useState, useRef, useEffect } from "react";

export default function VideoRecorder({ candidate }) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [recordings, setRecordings] = useState(() => {
    const saved = localStorage.getItem(`recordings_${candidate.id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [playing, setPlaying] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerLimit, setTimerLimit] = useState(120);
  const [label, setLabel] = useState("");
  const countdownRef = useRef(null);
  const playRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(countdownRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "video/webm" });
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => saveRecording();
      mr.start(200);
      mediaRecorderRef.current = mr;

      setRecording(true);
      setTimeLeft(timerLimit);
      countdownRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(countdownRef.current); stopRecording(); return 0; }
          return t - 1;
        });
      }, 1000);
    } catch {
      alert("Camera/microphone permission denied. Please allow access.");
    }
  };

  const stopRecording = () => {
    clearInterval(countdownRef.current);
    setRecording(false);
    try { mediaRecorderRef.current?.stop(); } catch {}
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const saveRecording = () => {
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const newRec = {
      id: Date.now(),
      url,
      label: label.trim() || `Interview ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      duration: timerLimit,
    };
    const updated = [newRec, ...recordings];
    setRecordings(updated);
    // Save labels only (URLs are blob and can't be persisted)
    localStorage.setItem(`recordings_${candidate.id}`, JSON.stringify(
      updated.map(r => ({ ...r, url: "" }))
    ));
    setLabel("");
  };

  const deleteRecording = (id) => {
    const updated = recordings.filter(r => r.id !== id);
    setRecordings(updated);
    localStorage.setItem(`recordings_${candidate.id}`, JSON.stringify(
      updated.map(r => ({ ...r, url: "" }))
    ));
    if (playing === id) setPlaying(null);
  };

  const downloadRecording = (rec) => {
    const a = document.createElement("a");
    a.href = rec.url;
    a.download = `${rec.label.replace(/\s+/g, "_")}.webm`;
    a.click();
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "30px 24px", color: "white" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 26, fontWeight: "bold" }}>🎥 Video Recorder</div>
        <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>Record your mock interview and replay to improve</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* LEFT — Camera */}
        <div>
          <div style={{ background: "#000", borderRadius: 14, overflow: "hidden", position: "relative", minHeight: 260 }}>
            {!recording && !streamRef.current && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0a14", zIndex: 2 }}>
                <div style={{ fontSize: 56, marginBottom: 10 }}>🎥</div>
                <div style={{ color: "#555", fontSize: 13 }}>Camera starts when you record</div>
              </div>
            )}
            <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", display: "block", minHeight: 260, objectFit: "cover", transform: "scaleX(-1)" }} />
            {recording && (
              <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(244,67,54,0.9)", padding: "5px 12px", borderRadius: 20, fontSize: 13, color: "white", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, background: "white", borderRadius: "50%" }} /> REC
              </div>
            )}
            {recording && (
              <div style={{ position: "absolute", bottom: 10, left: 10, background: "rgba(0,0,0,0.7)", padding: "5px 12px", borderRadius: 20, fontSize: 20, fontWeight: "bold", color: timeLeft <= 10 ? "#f44336" : "#4CAF50" }}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </div>
            )}
          </div>

          {/* Timer selector */}
          {!recording && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#aaa" }}>Duration:</span>
              {[60, 120, 180, 300].map(s => (
                <button key={s} onClick={() => setTimerLimit(s)}
                  style={{ padding: "5px 12px", borderRadius: 20, border: timerLimit === s ? "2px solid #4CAF50" : "1px solid #555", background: timerLimit === s ? "#4CAF50" : "transparent", color: "white", cursor: "pointer", fontSize: 12 }}>
                  {s < 60 ? `${s}s` : `${s / 60}m`}
                </button>
              ))}
            </div>
          )}

          {/* Label input */}
          {!recording && (
            <input value={label} onChange={e => setLabel(e.target.value)}
              placeholder="Label this recording (optional)..."
              style={{ width: "100%", marginTop: 10, padding: "10px 14px", background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 10, color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          )}

          <div style={{ marginTop: 12 }}>
            {!recording
              ? <button onClick={startRecording} style={{ width: "100%", padding: 14, fontSize: 15, fontWeight: "bold", background: "linear-gradient(135deg,#f44336,#FF9800)", border: "none", borderRadius: 10, color: "white", cursor: "pointer" }}>
                  🎥 Start Recording
                </button>
              : <button onClick={stopRecording} style={{ width: "100%", padding: 14, fontSize: 15, fontWeight: "bold", background: "#f44336", border: "none", borderRadius: 10, color: "white", cursor: "pointer" }}>
                  ■ Stop Recording
                </button>
            }
          </div>
        </div>

        {/* RIGHT — Recordings list */}
        <div>
          <div style={{ fontSize: 13, color: "#4CAF50", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
            📼 Your Recordings ({recordings.filter(r => r.url).length})
          </div>

          {recordings.filter(r => r.url).length === 0 ? (
            <div style={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 12, padding: 40, textAlign: "center", color: "#555" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
              No recordings yet — record your first interview!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto" }}>
              {recordings.filter(r => r.url).map(rec => (
                <div key={rec.id} style={{ background: "#1a1a2e", border: `1px solid ${playing === rec.id ? "#4CAF50" : "#2a2a4a"}`, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: 14 }}>{rec.label}</div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{rec.date} · {Math.floor(rec.duration / 60)}:{String(rec.duration % 60).padStart(2, "0")} max</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setPlaying(playing === rec.id ? null : rec.id)}
                        style={{ padding: "5px 12px", background: playing === rec.id ? "#4CAF50" : "transparent", border: "1px solid #4CAF50", borderRadius: 20, color: playing === rec.id ? "white" : "#4CAF50", cursor: "pointer", fontSize: 12 }}>
                        {playing === rec.id ? "⏹ Close" : "▶ Play"}
                      </button>
                      <button onClick={() => downloadRecording(rec)}
                        style={{ padding: "5px 10px", background: "transparent", border: "1px solid #2196F3", borderRadius: 20, color: "#2196F3", cursor: "pointer", fontSize: 12 }}>
                        ⬇
                      </button>
                      <button onClick={() => deleteRecording(rec.id)}
                        style={{ padding: "5px 10px", background: "transparent", border: "1px solid #f44336", borderRadius: 20, color: "#f44336", cursor: "pointer", fontSize: 12 }}>
                        🗑
                      </button>
                    </div>
                  </div>
                  {playing === rec.id && (
                    <video ref={playRef} src={rec.url} controls autoPlay
                      style={{ width: "100%", display: "block", maxHeight: 200, background: "#000" }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
