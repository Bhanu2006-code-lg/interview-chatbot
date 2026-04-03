import React, { useState } from "react";
import Logo from "./Logo";

const techCourses = [
  { icon: "💻", title: "Software Engineering", desc: "DSA, system design, coding rounds, OOP concepts", level: "Intermediate", questions: "50+", free: true },
  { icon: "📊", title: "Data Science & ML", desc: "Statistics, ML algorithms, case studies, Python", level: "Advanced", questions: "40+", free: true },
  { icon: "📦", title: "Product Management", desc: "Product sense, metrics, roadmap, GTM strategy", level: "Intermediate", questions: "45+", free: false, price: "₹499" },
  { icon: "☁️", title: "DevOps & Cloud", desc: "AWS, Docker, Kubernetes, CI/CD pipelines", level: "Advanced", questions: "35+", free: false, price: "₹599" },
  { icon: "🎨", title: "UX/UI Design", desc: "Design thinking, Figma, portfolio critique", level: "Beginner", questions: "30+", free: true },
  { icon: "📈", title: "Business Analyst", desc: "Requirements gathering, SQL, stakeholder mgmt", level: "Beginner", questions: "40+", free: true },
  { icon: "🔐", title: "Cybersecurity", desc: "Threat modeling, VAPT, compliance, SOC", level: "Advanced", questions: "30+", free: false, price: "₹699" },
  { icon: "🤖", title: "AI/ML Engineering", desc: "Deep learning, MLOps, LLMs, model deployment", level: "Advanced", questions: "35+", free: false, price: "₹799" },
  { icon: "📱", title: "Mobile Development", desc: "iOS, Android, React Native, Flutter", level: "Intermediate", questions: "30+", free: false, price: "₹499" },
];

const govCourses = [
  { icon: "🏛️", title: "UPSC Civil Services", desc: "IAS, IPS, IFS – Personality test, GK, current affairs, essay writing", level: "Advanced", questions: "60+", free: false, price: "₹999", tag: "UPSC" },
  { icon: "🏦", title: "IBPS Bank PO/Clerk", desc: "SBI, PNB, BOB – Banking awareness, reasoning, English, interview prep", level: "Intermediate", questions: "50+", free: true, tag: "IBPS" },
  { icon: "🚂", title: "Railway Recruitment (RRB)", desc: "RRB NTPC, Group D – Technical, aptitude, GK, interview rounds", level: "Beginner", questions: "45+", free: true, tag: "RRB" },
  { icon: "🛡️", title: "SSC CGL / CHSL", desc: "Staff Selection Commission – Tier 3 descriptive, Tier 4 interview", level: "Intermediate", questions: "40+", free: true, tag: "SSC" },
  { icon: "⚖️", title: "Judiciary / Law Services", desc: "District Judge, Civil Judge – Legal reasoning, case analysis, viva voce", level: "Advanced", questions: "35+", free: false, price: "₹899", tag: "Judiciary" },
  { icon: "🎖️", title: "Defence Services (NDA/CDS)", desc: "Army, Navy, Air Force – SSB interview, GTO, psychology, personal interview", level: "Advanced", questions: "50+", free: false, price: "₹799", tag: "Defence" },
  { icon: "👮", title: "State Police Services", desc: "SI, ASI, Constable – Physical, GK, law, personality assessment", level: "Beginner", questions: "40+", free: true, tag: "Police" },
  { icon: "🏥", title: "AIIMS / Medical PSU", desc: "AIIMS, ESIC, CGHS – Medical knowledge, ethics, situational judgment", level: "Advanced", questions: "35+", free: false, price: "₹699", tag: "Medical" },
  { icon: "🎓", title: "Teaching (KVS/NVS/TGT/PGT)", desc: "KVS, NVS, DSSSB – Subject knowledge, pedagogy, classroom scenarios", level: "Intermediate", questions: "40+", free: true, tag: "Teaching" },
];

const features = [
  { icon: "🎤", title: "Live Voice Transcription", desc: "Real-time speech-to-text as you speak" },
  { icon: "👁️", title: "Eye Contact Tracking", desc: "AI monitors your eye contact via FaceMesh" },
  { icon: "⭐", title: "STAR Method Scoring", desc: "Evaluated on Situation, Task, Action & Result" },
  { icon: "📊", title: "Performance Analytics", desc: "Track WPM, filler words, progress over time" },
  { icon: "🤖", title: "AI Feedback", desc: "Instant feedback powered by Groq LLaMA 3" },
  { icon: "⏱️", title: "Timed Practice", desc: "Custom time limits to simulate real interviews" },
];

const levelColor = { Beginner: "#4CAF50", Intermediate: "#2196F3", Advanced: "#FF9800" };

const CourseCard = ({ c, onSelect, hoverColor = "#4CAF50" }) => (
  <div
    onClick={() => onSelect(c)}
    style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 14, padding: 24, cursor: "pointer", position: "relative" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = hoverColor}
    onMouseLeave={e => e.currentTarget.style.borderColor = "#1e1e3a"}
  >
    {c.free
      ? <span style={{ position: "absolute", top: 14, right: 14, background: "rgba(76,175,80,0.15)", color: "#4CAF50", border: "1px solid rgba(76,175,80,0.4)", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: "bold" }}>FREE</span>
      : <span style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,152,0,0.15)", color: "#FF9800", border: "1px solid rgba(255,152,0,0.4)", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: "bold" }}>{c.price}</span>
    }
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{ fontSize: 36 }}>{c.icon}</span>
      {c.tag && <span style={{ background: "#FF980022", color: "#FF9800", border: "1px solid #FF980044", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: "bold" }}>{c.tag}</span>}
    </div>
    <div style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8, paddingRight: 55 }}>{c.title}</div>
    <div style={{ color: "#aaa", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{c.desc}</div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ background: levelColor[c.level] + "22", color: levelColor[c.level], border: `1px solid ${levelColor[c.level]}44`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: "bold" }}>{c.level}</span>
      <span style={{ fontSize: 13, color: hoverColor, fontWeight: "bold" }}>Start Practice →</span>
    </div>
  </div>
);

function Landing({ onGetStarted, onSelectCourse, initialPage, hideNav }) {
  const [page, setPage] = useState(initialPage || "home");
  const [courseTab, setCourseTab] = useState("tech");
  const [processTab, setProcessTab] = useState("tech");
  const [tipsTab, setTipsTab] = useState("tech");
  const [showDemo, setShowDemo] = useState(false);

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "courses", label: "Mock Interview Courses" },
    { id: "books", label: "📚 Books" },
    { id: "process", label: "🎬 Interview Process" },
    { id: "tips", label: "💡 Interview Tips" },
  ];

  const Navbar = () => (
    <nav style={{ padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1e1e3a", position: "sticky", top: 0, background: "rgba(15,15,26,0.97)", backdropFilter: "blur(12px)", zIndex: 100, height: 64 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setPage("home")}>
        <Logo size={38} />
        <span style={{ fontSize: 20, fontWeight: "bold" }}>InterviewIQ <span style={{ color: "#06B6D4" }}>Pro</span></span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {navLinks.map(l => (
          <button key={l.id} onClick={() => setPage(l.id)}
            style={{ padding: "8px 16px", background: "transparent", border: "none", color: page === l.id ? "#4CAF50" : "#ccc", cursor: "pointer", fontSize: 14, fontWeight: page === l.id ? "bold" : "normal", borderBottom: page === l.id ? "2px solid #4CAF50" : "2px solid transparent", transition: "all 0.2s" }}>
            {l.label}
          </button>
        ))}
      </div>
      <button onClick={onGetStarted} style={{ padding: "9px 24px", background: "linear-gradient(135deg,#6C63FF,#4CAF50)", border: "none", borderRadius: 25, color: "white", cursor: "pointer", fontSize: 14, fontWeight: "bold" }}>
        Sign In
      </button>
    </nav>
  );

  const Footer = () => (
    <div style={{ padding: "24px 40px", borderTop: "1px solid #1e1e3a", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Logo size={28} />
        <span style={{ fontWeight: "bold", fontSize: 14 }}>InterviewIQ Pro</span>
      </div>
      <div style={{ color: "#555", fontSize: 13 }}>© 2025 InterviewIQ Pro · Powered by Groq LLaMA 3</div>
      <div style={{ display: "flex", gap: 16 }}>
        {navLinks.map(l => (
          <span key={l.id} onClick={() => setPage(l.id)} style={{ color: "#555", fontSize: 13, cursor: "pointer" }}>{l.label}</span>
        ))}
      </div>
    </div>
  );

  const techVideos = [
    { id: "XKu_SEDAykw", title: "How to Crack a Tech Interview at Google", channel: "Google Careers", desc: "Google engineers explain exactly what happens in a software engineering interview round by round." },
    { id: "BN5wFSHFSAQ", title: "Amazon Software Engineer Interview Process", channel: "Amazon Jobs", desc: "Full walkthrough of Amazon's interview process including leadership principles and coding rounds." },
    { id: "0Z9RW_hhUT4", title: "How to Prepare for System Design Interview", channel: "Gaurav Sen", desc: "Step-by-step guide to cracking system design rounds at top tech companies." },
    { id: "1qw5ITr3k9E", title: "DSA Interview Tips", channel: "NeetCode", desc: "How to approach DSA problems - patterns, tips and common mistakes." },
    { id: "HG68Ymazo18", title: "Behavioral Interview Questions & Answers", channel: "Jeff H Sipe", desc: "How to answer behavioral questions using the STAR method with real examples." },
    { id: "PJKYqLP6MRE", title: "How to Introduce Yourself in a Tech Interview", channel: "Exponent", desc: "Craft the perfect self-introduction for software engineering and product interviews." },
  ];

  const govVideos = [
    { id: "JVId8u2BFpQ", title: "UPSC Interview Process Explained", channel: "Unacademy UPSC", desc: "Complete walkthrough of the UPSC personality test – what the board looks for and how to prepare." },
    { id: "3bLhMFBMqaA", title: "SSC CGL Interview Tips & Process", channel: "SSC Adda247", desc: "Everything you need to know about the SSC CGL Tier 4 interview and document verification." },
    { id: "Ks-_Mh1QhMc", title: "IBPS Bank PO Interview Preparation", channel: "Adda247", desc: "Banking interview questions, dress code, body language tips and common mistakes to avoid." },
    { id: "dQw4w9WgXcQ", title: "SSB Interview Process for Defence", channel: "SSB Crack", desc: "Complete 5-day SSB interview process for NDA, CDS – GTO, psychology, personal interview." },
    { id: "tgbNymZ7vqY", title: "How to Crack Railway RRB Interview", channel: "RailwayExam", desc: "RRB NTPC interview process, document verification, and common questions asked." },
    { id: "M7lc1UVf-VE", title: "KVS Teacher Interview Questions", channel: "Teaching Exams", desc: "KVS, NVS TGT/PGT interview process – subject knowledge, pedagogy and personality assessment." },
  ];

  const processVideos = processTab === "tech" ? techVideos : govVideos;

  const techTips = [
    {
      category: "💻 Before the Interview",
      color: "#2196F3",
      tips: [
        { icon: "📚", title: "Research the Company", desc: "Study the company's products, culture, recent news, and tech stack. Mention specific details during the interview to show genuine interest." },
        { icon: "📝", title: "Prepare Your STAR Stories", desc: "Write 5-7 behavioral stories using the STAR method. Cover leadership, conflict, failure, success, and teamwork scenarios." },
        { icon: "💻", title: "Practice Coding Daily", desc: "Solve at least 2-3 LeetCode problems daily. Focus on arrays, strings, trees, graphs, and dynamic programming patterns." },
        { icon: "📱", title: "Mock Interview Practice", desc: "Use InterviewIQ Pro to simulate real interviews. Practice speaking your answers out loud – not just thinking them." },
      ]
    },
    {
      category: "🎯 During the Interview",
      color: "#4CAF50",
      tips: [
        { icon: "👁️", title: "Maintain Eye Contact", desc: "Look directly at the camera (not the screen) during video interviews. This signals confidence and engagement." },
        { icon: "🗣️", title: "Think Out Loud", desc: "Verbalize your thought process while solving problems. Interviewers want to see how you think, not just the final answer." },
        { icon: "❓", title: "Ask Clarifying Questions", desc: "Before solving any problem, ask questions to clarify requirements, edge cases, and constraints. This shows maturity." },
        { icon: "👌", title: "Speak at the Right Pace", desc: "Aim for 120-150 WPM. Too fast shows nervousness, too slow loses the interviewer. Practice with InterviewIQ Pro's WPM tracker." },
      ]
    },
    {
      category: "✅ After the Interview",
      color: "#FF9800",
      tips: [
        { icon: "📧", title: "Send a Thank You Email", desc: "Within 24 hours, send a brief thank-you email to the interviewer. Mention something specific from your conversation." },
        { icon: "📊", title: "Review Your Performance", desc: "Note what went well and what didn't. Use InterviewIQ Pro's scorecard to track your eye contact, WPM, and STAR scores over time." },
        { icon: "🔄", title: "Follow Up Professionally", desc: "If you haven't heard back in a week, send a polite follow-up email. Keep it short and professional." },
        { icon: "💪", title: "Don't Stop Practicing", desc: "Whether you got the job or not, keep practicing. Consistent practice is the only way to improve interview performance." },
      ]
    },
  ];

  const govTips = [
    {
      category: "📚 Before the Interview",
      color: "#FF9800",
      tips: [
        { icon: "🏛️", title: "Know Your DAF Thoroughly", desc: "For UPSC, your Detailed Application Form (DAF) is the base of your interview. Know every detail – hobbies, education, hometown, optional subject." },
        { icon: "📰", title: "Follow Current Affairs Daily", desc: "Read The Hindu or Indian Express daily. Focus on national issues, government schemes, international relations, and economic policies." },
        { icon: "🇮🇳", title: "Know Your State & District", desc: "Be prepared for questions about your home state, district, local issues, culture, and history. Boards often ask about your roots." },
        { icon: "👔", title: "Dress Formally", desc: "Wear formal attire – white/light shirt with dark trousers for men, saree or formal suit for women. First impression matters greatly." },
      ]
    },
    {
      category: "🎯 During the Interview",
      color: "#4CAF50",
      tips: [
        { icon: "🙏", title: "Be Respectful & Composed", desc: "Greet the board with a smile. Sit only when asked. Maintain a calm, composed demeanor even under pressure or tricky questions." },
        { icon: "🤔", title: "Say 'I Don't Know' Honestly", desc: "If you don't know an answer, say so honestly. Boards respect honesty over bluffing. You can say 'I'm not sure but I think...'" },
        { icon: "⚖️", title: "Give Balanced Opinions", desc: "On controversial topics, present multiple perspectives before giving your view. Show that you can think objectively and fairly." },
        { icon: "💬", title: "Speak in Clear Hindi or English", desc: "Use the language you're most comfortable in. Clarity and confidence matter more than language choice in most government interviews." },
      ]
    },
    {
      category: "✅ Exam-Specific Tips",
      color: "#2196F3",
      tips: [
        { icon: "🏛️", title: "UPSC: Show Administrative Mindset", desc: "Demonstrate empathy, problem-solving, and public service motivation. The board looks for future administrators, not just scholars." },
        { icon: "🏦", title: "Banking: Know Financial Basics", desc: "For IBPS/SBI, be ready for questions on RBI policies, banking terms, current interest rates, and recent financial news." },
        { icon: "🎖️", title: "SSB: Show Leadership & Teamwork", desc: "In SSB interviews, demonstrate initiative, team spirit, and decision-making. The GTO tasks test your real personality." },
        { icon: "🚂", title: "RRB/SSC: Be Precise & Factual", desc: "These interviews are short and direct. Give concise, factual answers. Avoid over-explaining. Know your technical subject well." },
      ]
    },
  ];

  // ── HOME PAGE ──
  if (page === "home") return (
    <div style={{ fontFamily: "Segoe UI, Arial", background: "#0f0f1a", minHeight: "100vh", color: "white" }}>
      {!hideNav && <Navbar />}

      {/* HERO */}
      <div style={{ padding: "70px 60px", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(79,70,229,0.15)", border: "1px solid rgba(79,70,229,0.4)", borderRadius: 25, padding: "5px 14px", fontSize: 12, color: "#a78bfa" }}>🎯 STAR Method Scoring</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.35)", borderRadius: 25, padding: "5px 14px", fontSize: 12, color: "#06B6D4" }}>🇮🇳 18 Career Tracks</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: 25, padding: "5px 14px", fontSize: 12, color: "#10B981" }}>⚡ Real-time AI Feedback</span>
          </div>
          <h1 style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.15, margin: "0 0 20px" }}>
            Prepare Smarter,<br />
            <span style={{ background: "linear-gradient(135deg,#6C63FF,#06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Interview Better</span>
          </h1>
          <p style={{ fontSize: 17, color: "#aaa", lineHeight: 1.8, marginBottom: 32 }}>
            AI-powered mock interviews with real-time voice transcription, eye contact tracking,
            and instant STAR-method feedback – for Tech jobs and Government of India exams.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36 }}>
            <button onClick={onGetStarted}
              style={{ padding: "14px 36px", background: "linear-gradient(135deg,#4F46E5,#06B6D4)", border: "none", borderRadius: 30, color: "white", cursor: "pointer", fontSize: 15, fontWeight: "bold", boxShadow: "0 4px 24px rgba(79,70,229,0.45)", letterSpacing: 0.3 }}>
              🚀 Start Free Practice
            </button>
            <button onClick={() => setShowDemo(true)}
              style={{ padding: "14px 32px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 30, color: "#ccc", cursor: "pointer", fontSize: 15, backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, background: "#10B981", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 6px #10B981" }}></span> Watch Demo
            </button>
          </div>
          <div style={{ display: "flex", gap: 0, flexWrap: "wrap", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px 24px" }}>
            {[["500+", "Questions", "#4F46E5"], ["18", "Career Tracks", "#06B6D4"], ["95%", "Success Rate", "#10B981"], ["Free", "To Start", "#F59E0B"]].map(([v, l, c], i, arr) => (
              <div key={l} style={{ flex: 1, textAlign: "center", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none", padding: "0 16px" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visual */}
        <div style={{ position: "relative" }}>
          <div style={{ background: "linear-gradient(135deg,#1a1a2e,#0d1b2a)", borderRadius: 20, padding: 28, border: "1px solid #1e2a3a", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f44336" }}></div>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF9800" }}></div>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4CAF50" }}></div>
              <span style={{ marginLeft: 8, fontSize: 12, color: "#555" }}>InterviewIQ Pro – Live Session</span>
            </div>
            <div style={{ background: "#000", borderRadius: 12, height: 160, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: 64 }}>👤</div>
              <div style={{ position: "absolute", bottom: 10, left: 10, background: "rgba(76,175,80,0.85)", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>👁 Looking at Camera</div>
              <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(244,67,54,0.85)", padding: "4px 10px", borderRadius: 20, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 7, height: 7, background: "white", borderRadius: "50%" }}></div> REC
              </div>
            </div>
            <div style={{ background: "#0f0f1a", borderRadius: 10, padding: "12px 14px", marginBottom: 12, fontSize: 13, color: "#4CAF50", border: "1px solid #1e1e3a" }}>
              🎯 Question: Tell me about a time you led a team under pressure...
            </div>
            <div style={{ background: "#0f0f1a", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#ddd", border: "1px solid #1e1e3a", lineHeight: 1.6 }}>
              🎤 <span style={{ color: "#aaa" }}>"During my internship at XYZ, I was assigned to lead a critical...</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
              {[["👁", "Eye", "87%", "#4CAF50"], ["💬", "WPM", "132", "#2196F3"], ["⏱", "Time", "1:24", "#FF9800"]].map(([ic, lb, vl, cl]) => (
                <div key={lb} style={{ background: "#1a1a2e", borderRadius: 8, padding: "8px", textAlign: "center", border: "1px solid #1e1e3a" }}>
                  <div style={{ fontSize: 16 }}>{ic}</div>
                  <div style={{ fontSize: 16, fontWeight: "bold", color: cl }}>{vl}</div>
                  <div style={{ fontSize: 10, color: "#555" }}>{lb}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "absolute", top: -16, right: -16, background: "linear-gradient(135deg,#6C63FF,#4CAF50)", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: "bold", boxShadow: "0 4px 16px rgba(76,175,80,0.4)" }}>
            ✨ AI Feedback Ready
          </div>
          <div style={{ position: "absolute", bottom: -16, left: -16, background: "#1a1a2e", border: "1px solid #FF9800", borderRadius: 12, padding: "10px 16px", fontSize: 13, color: "#FF9800", fontWeight: "bold" }}>
            🇮🇳 Govt Exam Ready
          </div>
        </div>
      </div>

      {/* TRUST BADGES */}
      <div style={{ padding: "30px 60px", borderTop: "1px solid #1a1a2e", borderBottom: "1px solid #1a1a2e", background: "#0d0d1f" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-around", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          {[["🏛️", "UPSC Ready"], ["🏦", "IBPS / SBI"], ["🚂", "RRB / SSC"], ["💻", "FAANG Prep"], ["🎖️", "Defence SSB"], ["🏥", "AIIMS / PSU"]].map(([ic, lb]) => (
            <div key={lb} style={{ display: "flex", alignItems: "center", gap: 8, color: "#666", fontSize: 14 }}>
              <span style={{ fontSize: 20 }}>{ic}</span> {lb}
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ padding: "70px 60px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, marginBottom: 8 }}>How It <span style={{ color: "#4CAF50" }}>Works</span></h2>
        <p style={{ textAlign: "center", color: "#aaa", marginBottom: 50 }}>3 simple steps to ace your next interview</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 30 }}>
          {[
            { step: "01", icon: "🔍", title: "Choose Your Track", desc: "Pick from 18 career tracks – Software Engineering, UPSC, Banking, Defence, and more." },
            { step: "02", icon: "🎤", title: "Practice with AI", desc: "Answer AI-generated questions out loud. Your voice is transcribed live in real time." },
            { step: "03", icon: "📊", title: "Get Instant Feedback", desc: "Receive STAR-method scoring, eye contact %, WPM analysis, and detailed AI feedback." },
          ].map(s => (
            <div key={s.step} style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 16, padding: 28, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 16, right: 20, fontSize: 48, fontWeight: 900, color: "#ffffff08" }}>{s.step}</div>
              <div style={{ width: 48, height: 48, background: "linear-gradient(135deg,#4CAF5022,#2196F322)", border: "1px solid #4CAF5044", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>{s.icon}</div>
              <div style={{ fontWeight: "bold", fontSize: 17, marginBottom: 10 }}>{s.title}</div>
              <div style={{ color: "#aaa", fontSize: 14, lineHeight: 1.7 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES GRID */}
      <div style={{ padding: "60px 60px", background: "#0d0d1f" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 32, marginBottom: 8 }}>Powerful <span style={{ color: "#4CAF50" }}>Features</span></h2>
          <p style={{ textAlign: "center", color: "#aaa", marginBottom: 40 }}>Everything you need for a complete interview preparation experience</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
            {features.map(f => (
              <div key={f.title} style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 14, padding: 22, display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 44, height: 44, background: "#0f0f1a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, border: "1px solid #2a2a4a" }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 5 }}>{f.title}</div>
                  <div style={{ color: "#aaa", fontSize: 13, lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{ padding: "70px 60px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, marginBottom: 8 }}>What Candidates <span style={{ color: "#4CAF50" }}>Say</span></h2>
        <p style={{ textAlign: "center", color: "#aaa", marginBottom: 44 }}>Real results from real people</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {[
            { name: "Priya S.", role: "SDE at Amazon", text: "InterviewIQ Pro helped me crack my Amazon interview. The eye contact tracking was a game changer!", stars: 5 },
            { name: "Rahul K.", role: "IAS Officer (UPSC 2024)", text: "I used the UPSC track daily for 3 months. The AI feedback on my personality test answers was incredibly accurate.", stars: 5 },
            { name: "Anjali M.", role: "Bank PO at SBI", text: "The IBPS course prepared me perfectly. I knew exactly what to expect in the interview round.", stars: 5 },
          ].map(t => (
            <div key={t.name} style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 14, padding: 24 }}>
              <div style={{ color: "#FFD700", fontSize: 16, marginBottom: 12 }}>{"★".repeat(t.stars)}</div>
              <p style={{ color: "#ddd", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>" {t.text} "</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#6C63FF,#4CAF50)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 15 }}>{t.name[0]}</div>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "#4CAF50" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DEMO MODAL */}
      {showDemo && (
        <div onClick={() => setShowDemo(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(6px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0f0f1a", border: "1px solid #2a2a4a", borderRadius: 20, width: "100%", maxWidth: 820, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.8)" }}>
            <div style={{ padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e1e3a" }}>
              <div>
                <div style={{ fontWeight: "bold", fontSize: 16 }}>🎬 InterviewIQ Pro – Live Demo</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 3 }}>See how AI mock interviews work in real time</div>
              </div>
              <button onClick={() => setShowDemo(false)} style={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: "50%", width: 34, height: 34, color: "#aaa", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe src="https://www.youtube.com/embed/HG68Ymazo18?autoplay=1&rel=0&modestbranding=1" title="InterviewIQ Pro Demo" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} />
            </div>
            <div style={{ padding: "16px 24px", display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center", background: "#0a0a14" }}>
              <div style={{ fontSize: 13, color: "#aaa" }}>Ready to practice with real AI feedback?</div>
              <button onClick={() => { setShowDemo(false); onGetStarted(); }} style={{ padding: "10px 24px", background: "linear-gradient(135deg,#4F46E5,#06B6D4)", border: "none", borderRadius: 20, color: "white", cursor: "pointer", fontWeight: "bold", fontSize: 14 }}>🚀 Try It Free →</button>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{ padding: "60px 40px", textAlign: "center", background: "#0d0d1f" }}>
        <h2 style={{ fontSize: 34, marginBottom: 14 }}>Ready to <span style={{ color: "#4CAF50" }}>Start Practicing?</span></h2>
        <p style={{ color: "#aaa", marginBottom: 28, fontSize: 16 }}>Join thousands preparing for tech and government interviews – completely free to start</p>
        <button onClick={onGetStarted} style={{ padding: "15px 48px", background: "linear-gradient(135deg,#6C63FF,#4CAF50)", border: "none", borderRadius: 30, color: "white", cursor: "pointer", fontSize: 17, fontWeight: "bold", boxShadow: "0 4px 28px rgba(76,175,80,0.35)" }}>
          Create Free Account →
        </button>
      </div>
      {!hideNav && <Footer />}
    </div>
  );

  // ── COURSES PAGE ──
  if (page === "courses") return (
    <div style={{ fontFamily: "Segoe UI, Arial", background: "#0f0f1a", minHeight: "100vh", color: "white" }}>
      <Navbar />
      <div style={{ padding: "60px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 34, marginBottom: 8 }}>Interview <span style={{ color: "#4CAF50" }}>Courses</span></h2>
        <p style={{ textAlign: "center", color: "#aaa", marginBottom: 36 }}>Role-specific AI-generated questions with instant feedback</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 36 }}>
          {[["tech", "💻 Tech & Private Sector"], ["gov", "🏛️ Government of India"]].map(([tab, label]) => (
            <button key={tab} onClick={() => setCourseTab(tab)}
              style={{ padding: "10px 28px", borderRadius: 25, border: courseTab === tab ? "none" : "1px solid #333", background: courseTab === tab ? "linear-gradient(135deg,#6C63FF,#4CAF50)" : "transparent", color: "white", cursor: "pointer", fontSize: 14, fontWeight: "bold" }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {(courseTab === "tech" ? techCourses : govCourses).map(c => (
            <CourseCard key={c.title} c={c} onSelect={onSelectCourse || onGetStarted} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );

  // ── GOVERNMENT PAGE ──
  if (page === "government") return (
    <div style={{ fontFamily: "Segoe UI, Arial", background: "#0f0f1a", minHeight: "100vh", color: "white" }}>
      <Navbar />
      <div style={{ padding: "60px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(33,150,243,0.1)", border: "1px solid rgba(33,150,243,0.3)", borderRadius: 25, padding: "8px 20px", marginBottom: 18 }}>
            <span style={{ fontSize: 22 }}>🇮🇳</span>
            <span style={{ color: "#2196F3", fontWeight: "bold", fontSize: 14 }}>Government of India – Official Exam Preparation</span>
          </div>
          <h2 style={{ fontSize: 34, marginBottom: 10 }}>Crack <span style={{ color: "#FF9800" }}>Government Exams</span></h2>
          <p style={{ color: "#aaa", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
            Prepare for UPSC, SSC, Banking, Railway, Defence and all major Government of India
            recruitment interviews with AI-powered mock sessions
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {govCourses.map(c => (
            <CourseCard key={c.title} c={c} onSelect={onGetStarted} hoverColor="#FF9800" />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );

  // ── BOOKS PAGE ──
  if (page === "books") return (
    <div style={{ fontFamily: "Segoe UI, Arial", background: "#0f0f1a", minHeight: "100vh", color: "white" }}>
      {!hideNav && <Navbar />}
      <div style={{ padding: "60px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 34, marginBottom: 8 }}>📚 Interview <span style={{ color: "#4CAF50" }}>Books</span></h2>
        <p style={{ textAlign: "center", color: "#aaa", marginBottom: 44 }}>Handpicked books to sharpen your interview skills across all domains</p>
        {[
          {
            category: "💻 Tech & Software Engineering",
            color: "#2196F3",
            books: [
              { title: "Cracking the Coding Interview", author: "Gayle Laakmann McDowell", desc: "189 programming questions & solutions. The bible for software engineering interviews.", tag: "Must Read", tagColor: "#4CAF50", link: "https://www.amazon.in/s?k=Cracking+the+Coding+Interview" },
              { title: "System Design Interview", author: "Alex Xu", desc: "Step-by-step guide to system design questions asked at top tech companies.", tag: "Popular", tagColor: "#2196F3", link: "https://www.amazon.in/s?k=System+Design+Interview+Alex+Xu" },
              { title: "Clean Code", author: "Robert C. Martin", desc: "A handbook of agile software craftsmanship. Essential for coding best practices.", tag: "Classic", tagColor: "#9C27B0", link: "https://www.amazon.in/s?k=Clean+Code+Robert+Martin" },
              { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", desc: "Deep dive into distributed systems, databases, and scalability concepts.", tag: "Advanced", tagColor: "#FF9800", link: "https://www.amazon.in/s?k=Designing+Data+Intensive+Applications" },
            ]
          },
          {
            category: "🧠 Behavioral & Soft Skills",
            color: "#4CAF50",
            books: [
              { title: "The STAR Interview", author: "Misha Yurchenko", desc: "Master the Situation-Task-Action-Result method with real examples and templates.", tag: "Must Read", tagColor: "#4CAF50", link: "https://www.amazon.in/s?k=The+STAR+Interview+Misha+Yurchenko" },
              { title: "How to Win Friends & Influence People", author: "Dale Carnegie", desc: "Timeless principles for communication, persuasion, and building rapport in interviews.", tag: "Classic", tagColor: "#9C27B0", link: "https://www.amazon.in/s?k=How+to+Win+Friends+and+Influence+People+Dale+Carnegie" },
              { title: "Knock 'em Dead Job Interview", author: "Martin Yate", desc: "Comprehensive guide covering every type of interview question with winning answers.", tag: "Popular", tagColor: "#2196F3", link: "https://www.amazon.in/s?k=Knock+em+Dead+Job+Interview+Martin+Yate" },
              { title: "What Color Is Your Parachute?", author: "Richard N. Bolles", desc: "Career guidance and job-hunting strategies updated annually. A career classic.", tag: "Classic", tagColor: "#9C27B0", link: "https://www.amazon.in/s?k=What+Color+Is+Your+Parachute" },
            ]
          },
          {
            category: "🏛️ Government & UPSC Exams",
            color: "#FF9800",
            books: [
              { title: "Indian Polity", author: "M. Laxmikanth", desc: "The most comprehensive book on Indian Constitution and polity for UPSC aspirants.", tag: "Must Read", tagColor: "#4CAF50", link: "https://www.amazon.in/s?k=Indian+Polity+Laxmikanth" },
              { title: "Certificate Physical & Human Geography", author: "Goh Cheng Leong", desc: "Essential geography reference for UPSC, SSC, and other government exams.", tag: "Popular", tagColor: "#2196F3", link: "https://www.amazon.in/s?k=Certificate+Physical+Human+Geography+Goh+Cheng+Leong" },
              { title: "Modern India", author: "Bipin Chandra", desc: "Authoritative history of modern India – essential for UPSC Prelims and Mains.", tag: "Must Read", tagColor: "#4CAF50", link: "https://www.amazon.in/s?k=Modern+India+Bipin+Chandra" },
              { title: "SSC CGL Complete Guide", author: "Arihant Experts", desc: "All-in-one preparation guide for SSC CGL covering all sections and previous papers.", tag: "Exam Prep", tagColor: "#FF9800", link: "https://www.amazon.in/s?k=SSC+CGL+Complete+Guide+Arihant" },
            ]
          },
          {
            category: "📊 Data Science & Product",
            color: "#9C27B0",
            books: [
              { title: "Ace the Data Science Interview", author: "Nick Singh & Kevin Huo", desc: "201 real interview questions from top companies with detailed solutions.", tag: "Must Read", tagColor: "#4CAF50", link: "https://www.amazon.in/s?k=Ace+the+Data+Science+Interview" },
              { title: "Inspired: How to Create Products", author: "Marty Cagan", desc: "The definitive guide to product management – essential for PM interview prep.", tag: "Popular", tagColor: "#2196F3", link: "https://www.amazon.in/s?k=Inspired+Marty+Cagan" },
              { title: "Naked Statistics", author: "Charles Wheelan", desc: "Makes statistics accessible and intuitive – great for data science interviews.", tag: "Beginner", tagColor: "#4CAF50", link: "https://www.amazon.in/s?k=Naked+Statistics+Charles+Wheelan" },
              { title: "The Lean Startup", author: "Eric Ries", desc: "Foundational product thinking and startup methodology for PM and BA roles.", tag: "Classic", tagColor: "#9C27B0", link: "https://www.amazon.in/s?k=The+Lean+Startup+Eric+Ries" },
            ]
          },
        ].map(section => (
          <div key={section.category} style={{ marginBottom: 50 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 4, height: 28, background: section.color, borderRadius: 2 }}></div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: "bold" }}>{section.category}</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
              {section.books.map(b => (
                <div key={b.title}
                  onClick={() => window.open(b.link, "_blank")}
                  style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 14, padding: 22, position: "relative", cursor: "pointer", transition: "transform 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = section.color; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e3a"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <span style={{ position: "absolute", top: 14, right: 14, background: b.tagColor + "22", color: b.tagColor, border: `1px solid ${b.tagColor}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: "bold" }}>{b.tag}</span>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📖</div>
                  <div style={{ fontWeight: "bold", fontSize: 15, marginBottom: 4, paddingRight: 60 }}>{b.title}</div>
                  <div style={{ fontSize: 12, color: section.color, marginBottom: 10 }}>by {b.author}</div>
                  <div style={{ color: "#aaa", fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>{b.desc}</div>
                  <div style={{ fontSize: 12, color: "#4CAF50", fontWeight: "bold" }}>🛒 View on Amazon →</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!hideNav && <Footer />}
    </div>
  );

  // ── INTERVIEW PROCESS PAGE ──
  if (page === "process") return (
    <div style={{ fontFamily: "Segoe UI, Arial", background: "#0f0f1a", minHeight: "100vh", color: "white" }}>
      {!hideNav && <Navbar />}
      <div style={{ padding: "60px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 34, marginBottom: 8 }}>🎬 Offline <span style={{ color: "#4CAF50" }}>Interview Process</span></h2>
        <p style={{ textAlign: "center", color: "#aaa", marginBottom: 36 }}>Watch real interview process videos to know exactly what to expect on the day</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 44 }}>
          {[["tech", "💻 Tech & Private Sector"], ["gov", "🏛️ Government of India"]].map(([t, label]) => (
            <button key={t} onClick={() => setProcessTab(t)}
              style={{ padding: "10px 28px", borderRadius: 25, border: processTab === t ? "none" : "1px solid #333", background: processTab === t ? "linear-gradient(135deg,#6C63FF,#4CAF50)" : "transparent", color: "white", cursor: "pointer", fontSize: 14, fontWeight: "bold" }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {processVideos.map(v => (
            <div key={v.id} style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 14, overflow: "hidden" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#4CAF50"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#1e1e3a"}>
              <div style={{ position: "relative", cursor: "pointer" }} onClick={() => window.open(`https://www.youtube.com/watch?v=${v.id}`, "_blank")}>
                <img src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`} alt={v.title}
                  style={{ width: "100%", display: "block", height: 190, objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.35)" }}>
                  <div style={{ width: 56, height: 56, background: "rgba(255,0,0,0.9)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>▶</div>
                </div>
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ fontSize: 11, color: "#f44336", fontWeight: "bold", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>📺 {v.channel}</div>
                <div style={{ fontWeight: "bold", fontSize: 15, marginBottom: 8, lineHeight: 1.4 }}>{v.title}</div>
                <div style={{ color: "#aaa", fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>{v.desc}</div>
                <button onClick={() => window.open(`https://www.youtube.com/watch?v=${v.id}`, "_blank")}
                  style={{ padding: "7px 18px", background: "#f44336", border: "none", borderRadius: 20, color: "white", cursor: "pointer", fontSize: 13, fontWeight: "bold" }}>
                  📺 Watch on YouTube
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {!hideNav && <Footer />}
    </div>
  );

  // ── TIPS PAGE ──
  if (page === "tips") {
    const currentTips = tipsTab === "tech" ? techTips : govTips;
    return (
      <div style={{ fontFamily: "Segoe UI, Arial", background: "#0f0f1a", minHeight: "100vh", color: "white" }}>
        {!hideNav && <Navbar />}
        <div style={{ padding: "60px 40px", maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 34, marginBottom: 8 }}>💡 Interview <span style={{ color: "#4CAF50" }}>Tips</span></h2>
          <p style={{ textAlign: "center", color: "#aaa", marginBottom: 36 }}>Proven strategies to help you perform your best on interview day</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 44 }}>
            {[["tech", "💻 Tech & Private Sector"], ["gov", "🏛️ Government of India"]].map(([t, label]) => (
              <button key={t} onClick={() => setTipsTab(t)}
                style={{ padding: "10px 28px", borderRadius: 25, border: tipsTab === t ? "none" : "1px solid #333", background: tipsTab === t ? "linear-gradient(135deg,#6C63FF,#4CAF50)" : "transparent", color: "white", cursor: "pointer", fontSize: 14, fontWeight: "bold" }}>
                {label}
              </button>
            ))}
          </div>
          {currentTips.map(section => (
            <div key={section.category} style={{ marginBottom: 48 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 4, height: 28, background: section.color, borderRadius: 2 }} />
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: "bold" }}>{section.category}</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
                {section.tips.map(tip => (
                  <div key={tip.title}
                    style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 14, padding: 22 }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = section.color}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#1e1e3a"}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{tip.icon}</div>
                    <div style={{ fontWeight: "bold", fontSize: 15, marginBottom: 8, color: "white" }}>{tip.title}</div>
                    <div style={{ color: "#aaa", fontSize: 13, lineHeight: 1.7 }}>{tip.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {!hideNav && <Footer />}
      </div>
    );
  }

  // ── FEATURES PAGE ──
  if (page === "features") return (
    <div style={{ fontFamily: "Segoe UI, Arial", background: "#0f0f1a", minHeight: "100vh", color: "white" }}>
      <Navbar />
      <div style={{ padding: "60px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 34, marginBottom: 8 }}>Everything You Need to <span style={{ color: "#4CAF50" }}>Succeed</span></h2>
        <p style={{ textAlign: "center", color: "#aaa", marginBottom: 44 }}>Cutting-edge AI tools for the most realistic interview experience</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {features.map(f => (
            <div key={f.title} style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 14, padding: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>{f.title}</div>
              <div style={{ color: "#aaa", fontSize: 14, lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 50 }}>
          <button onClick={onGetStarted} style={{ padding: "14px 44px", background: "linear-gradient(135deg,#6C63FF,#4CAF50)", border: "none", borderRadius: 30, color: "white", cursor: "pointer", fontSize: 17, fontWeight: "bold" }}>
            Try It Free →
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );

  return null;
}

export default Landing;
