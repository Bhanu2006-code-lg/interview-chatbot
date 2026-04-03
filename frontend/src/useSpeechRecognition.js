import { useRef, useState } from "react";

const FILLERS = ["um","uh","like","you know","basically","actually","right","so"];

export function countFillers(text) {
  const lower = text.toLowerCase();
  return FILLERS.reduce((acc, f) => acc + (lower.match(new RegExp(`\\b${f}\\b`, "g")) || []).length, 0);
}

export default function useSpeechRecognition({ lang = "en-US" } = {}) {
  const recRef = useRef(null);
  const isRecRef = useRef(false);
  const transcriptRef = useRef("");
  const langRef = useRef(lang);
  const restartTimerRef = useRef(null);

  const [transcript, setTranscript] = useState("");
  const [micActive, setMicActive] = useState(false);
  const [words, setWords] = useState(0);
  const [fillers, setFillers] = useState(0);

  langRef.current = lang;

  function scheduleRestart(delay, runSR) {
    clearTimeout(restartTimerRef.current);
    restartTimerRef.current = setTimeout(() => {
      if (isRecRef.current) runSR();
    }, delay);
  }

  function start() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Please use Google Chrome or Edge for voice recognition.");
      return false;
    }
    transcriptRef.current = "";
    setTranscript("");
    setWords(0);
    setFillers(0);
    setMicActive(false);
    isRecRef.current = true;

    function runSR() {
      if (!isRecRef.current) return;
      const r = new SR();
      r.continuous = true;
      r.interimResults = true;
      r.maxAlternatives = 1;
      r.lang = langRef.current;
      recRef.current = r;

      r.onspeechstart = () => setMicActive(true);
      r.onspeechend = () => setMicActive(false);

      r.onresult = (e) => {
        let newFinal = "", interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) newFinal += t + " ";
          else interim += t;
        }
        if (newFinal) {
          transcriptRef.current = (transcriptRef.current + " " + newFinal).trim();
          setWords(transcriptRef.current.split(/\s+/).filter(Boolean).length);
          setFillers(countFillers(transcriptRef.current));
        }
        setTranscript(interim
          ? (transcriptRef.current + " " + interim).trim()
          : transcriptRef.current
        );
      };

      r.onerror = (e) => {
        setMicActive(false);
        if (e.error === "not-allowed" || e.error === "audio-capture") {
          alert(`Microphone error: ${e.error}. Please check browser permissions.`);
          stop();
          return;
        }
        scheduleRestart(e.error === "no-speech" ? 300 : 80, runSR);
      };

      r.onend = () => {
        setMicActive(false);
        scheduleRestart(100, runSR);
      };

      try { r.start(); } catch { scheduleRestart(150, runSR); }
    }

    runSR();
    return true;
  }

  function stop() {
    clearTimeout(restartTimerRef.current);
    isRecRef.current = false;
    setMicActive(false);
    try { recRef.current?.stop(); } catch {}
    recRef.current = null;
  }

  function reset() {
    transcriptRef.current = "";
    setTranscript("");
    setWords(0);
    setFillers(0);
  }

  return { transcript, micActive, words, fillers, transcriptRef, isRecRef, start, stop, reset };
}
