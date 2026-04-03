import React, { useState } from "react";

const techCourses = [
  { icon: "💻", title: "Software Engineering", role: "Software Engineer", desc: "DSA, system design, coding rounds, OOP concepts", level: "Intermediate", questions: "50+", free: true },
  { icon: "📊", title: "Data Science & ML", role: "Data Scientist", desc: "Statistics, ML algorithms, case studies, Python", level: "Advanced", questions: "40+", free: true },
  { icon: "🎯", title: "Product Management", role: "Product Manager", desc: "Product sense, metrics, roadmap, GTM strategy", level: "Intermediate", questions: "45+", free: false, price: "₹499" },
  { icon: "☁️", title: "DevOps & Cloud", role: "DevOps Engineer", desc: "AWS, Docker, Kubernetes, CI/CD pipelines", level: "Advanced", questions: "35+", free: false, price: "₹599" },
  { icon: "🎨", title: "UX/UI Design", role: "UX/UI Designer", desc: "Design thinking, Figma, portfolio critique", level: "Beginner", questions: "30+", free: true },
  { icon: "📈", title: "Business Analyst", role: "Business Analyst", desc: "Requirements gathering, SQL, stakeholder mgmt", level: "Beginner", questions: "40+", free: true },
  { icon: "🔐", title: "Cybersecurity", role: "Cybersecurity Analyst", desc: "Threat modeling, VAPT, compliance, SOC", level: "Advanced", questions: "30+", free: false, price: "₹699" },
  { icon: "🤖", title: "AI/ML Engineering", role: "AI Engineer", desc: "Deep learning, MLOps, LLMs, model deployment", level: "Advanced", questions: "35+", free: false, price: "₹799" },
  { icon: "📱", title: "Mobile Development", role: "Mobile Developer", desc: "iOS, Android, React Native, Flutter", level: "Intermediate", questions: "30+", free: false, price: "₹499" },
];

const govCourses = [
  { icon: "🏛️", title: "UPSC Civil Services", role: "UPSC Civil Services (IAS/IPS/IFS)", desc: "IAS, IPS, IFS — Personality test, GK, current affairs", level: "Advanced", questions: "60+", free: false, price: "₹999", tag: "UPSC" },
  { icon: "🏦", title: "IBPS Bank PO/Clerk", role: "IBPS Bank PO/Clerk", desc: "SBI, PNB, BOB — Banking awareness, reasoning, English", level: "Intermediate", questions: "50+", free: true, tag: "IBPS" },
  { icon: "🚂", title: "Railway (RRB)", role: "Railway RRB NTPC", desc: "RRB NTPC, Group D — Technical, aptitude, GK", level: "Beginner", questions: "45+", free: true, tag: "RRB" },
  { icon: "🛡️", title: "SSC CGL / CHSL", role: "SSC CGL/CHSL", desc: "Staff Selection Commission — Tier 3 & 4 interview", level: "Intermediate", questions: "40+", free: true, tag: "SSC" },
  { icon: "⚖️", title: "Judiciary / Law", role: "Judiciary/Law Services", desc: "District Judge, Civil Judge — Legal reasoning, viva voce", level: "Advanced", questions: "35+", free: false, price: "₹899", tag: "Judiciary" },
  { icon: "🎖️", title: "Defence (NDA/CDS)", role: "Defence Services NDA/CDS", desc: "Army, Navy, Air Force — SSB interview, GTO, psychology", level: "Advanced", questions: "50+", free: false, price: "₹799", tag: "Defence" },
  { icon: "👮", title: "State Police", role: "State Police Services", desc: "SI, ASI, Constable — GK, law, personality assessment", level: "Beginner", questions: "40+", free: true, tag: "Police" },
  { icon: "🏥", title: "AIIMS / Medical PSU", role: "AIIMS/Medical PSU", desc: "AIIMS, ESIC, CGHS — Medical knowledge, ethics", level: "Advanced", questions: "35+", free: false, price: "₹699", tag: "Medical" },
  { icon: "🎓", title: "Teaching (KVS/NVS)", role: "Teaching KVS/NVS/TGT/PGT", desc: "KVS, NVS, DSSSB — Subject knowledge, pedagogy", level: "Intermediate", questions: "40+", free: true, tag: "Teaching" },
];

const levelColor = { Beginner: "#4CAF50", Intermediate: "#2196F3", Advanced: "#FF9800" };

function CourseSelect({ candidate, onSelectCourse, onLogout, hideNav }) {
  const [tab, setTab] = useState("tech");

  const courses = tab === "tech" ? techCourses : govCourses;

  return (
    <div style={{ fontFamily: "Segoe UI, Arial", background: "#0f0f1a", minHeight: "100vh", color: "white" }}>

      {/* Navbar */}
      {!hideNav && (
      <nav style={{ padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1e1e3a", background: "rgba(15,15,26,0.97)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#4CAF50,#2196F3)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎯</div>
          <span style={{ fontSize: 20, fontWeight: "bold" }}>MockMentor <span style={{ color: "#4CAF50" }}>AI</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, fontWeight: "bold" }}>{candidate.name}</div>
            <div style={{ fontSize: 12, color: "#4CAF50" }}>{candidate.role}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#4CAF50,#2196F3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 16 }}>
            {candidate.name.charAt(0).toUpperCase()}
          </div>
          <button onClick={onLogout} style={{ padding: "6px 16px", background: "transparent", border: "1px solid #333", borderRadius: 20, color: "#aaa", cursor: "pointer", fontSize: 13 }}>Logout</button>
        </div>
      </nav>
      )}

      {/* Header */}
      <div style={{ textAlign: "center", padding: "50px 40px 30px" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 10 }}>
          Choose Your <span style={{ background: "linear-gradient(135deg,#4CAF50,#2196F3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Interview Track</span>
        </h1>
        <p style={{ color: "#aaa", fontSize: 16 }}>Select a course to start your AI-powered mock interview session</p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 36 }}>
        {[["tech", "💻 Tech & Private Sector"], ["gov", "🏛️ Government of India"]].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "10px 28px", borderRadius: 25, border: tab === t ? "none" : "1px solid #333", background: tab === t ? "linear-gradient(135deg,#4CAF50,#2196F3)" : "transparent", color: "white", cursor: "pointer", fontSize: 14, fontWeight: "bold" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Course grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px 60px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {courses.map(c => (
          <div key={c.title} onClick={() => onSelectCourse(c)}
            style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 14, padding: 24, cursor: "pointer", position: "relative" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#4CAF50"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e3a"; e.currentTarget.style.transform = "translateY(0)"; }}>
            {c.free
              ? <span style={{ position: "absolute", top: 14, right: 14, background: "rgba(76,175,80,0.15)", color: "#4CAF50", border: "1px solid rgba(76,175,80,0.4)", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: "bold" }}>FREE</span>
              : <span style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,152,0,0.15)", color: "#FF9800", border: "1px solid rgba(255,152,0,0.4)", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: "bold" }}>{c.price}</span>
            }
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 38 }}>{c.icon}</span>
              {c.tag && <span style={{ background: "#FF980022", color: "#FF9800", border: "1px solid #FF980044", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: "bold" }}>{c.tag}</span>}
            </div>
            <div style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8, paddingRight: 55 }}>{c.title}</div>
            <div style={{ color: "#aaa", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{c.desc}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ background: levelColor[c.level] + "22", color: levelColor[c.level], border: `1px solid ${levelColor[c.level]}44`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: "bold" }}>{c.level}</span>
              <span style={{ fontSize: 13, color: "#4CAF50", fontWeight: "bold" }}>📝 {c.questions} Q · Start →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseSelect;
