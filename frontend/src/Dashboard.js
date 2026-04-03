import React from "react";

const roleData = {
  "Software Engineer": {
    icon: "💻", color: "#2196F3",
    skills: ["Data Structures & Algorithms", "System Design", "OOP Concepts", "Database Design", "API Development"],
    topics: ["Arrays & Strings", "Trees & Graphs", "Dynamic Programming", "OS Concepts", "Networking Basics"],
    tips: ["Practice 2-3 LeetCode problems daily", "Study system design patterns", "Review SOLID principles", "Mock interview weekly"],
    roadmap: ["Basics of DSA", "OOP & Design Patterns", "System Design", "Behavioral Questions", "Mock Interviews"],
  },
  "Frontend Developer": {
    icon: "🎨", color: "#FF9800",
    skills: ["HTML/CSS", "JavaScript", "React/Vue/Angular", "Performance Optimization", "Accessibility"],
    topics: ["DOM Manipulation", "Event Loop", "CSS Flexbox/Grid", "React Hooks", "Web Performance"],
    tips: ["Build portfolio projects", "Learn browser DevTools", "Study CSS animations", "Practice JS fundamentals"],
    roadmap: ["HTML & CSS Mastery", "JavaScript Deep Dive", "React/Framework", "Performance & SEO", "Mock Interviews"],
  },
  "Backend Developer": {
    icon: "⚙️", color: "#4CAF50",
    skills: ["REST APIs", "Databases", "Authentication", "Microservices", "Cloud Deployment"],
    topics: ["SQL vs NoSQL", "API Design", "Caching Strategies", "Message Queues", "Security Best Practices"],
    tips: ["Build REST APIs from scratch", "Learn Docker basics", "Study database indexing", "Practice system design"],
    roadmap: ["API Design", "Database Mastery", "Auth & Security", "Microservices", "Mock Interviews"],
  },
  "Data Scientist": {
    icon: "📊", color: "#9C27B0",
    skills: ["Python/R", "Machine Learning", "Statistics", "Data Visualization", "SQL"],
    topics: ["Regression & Classification", "Feature Engineering", "Model Evaluation", "A/B Testing", "Deep Learning Basics"],
    tips: ["Work on Kaggle competitions", "Build end-to-end ML projects", "Study statistics deeply", "Practice SQL queries"],
    roadmap: ["Statistics & Math", "Python & Libraries", "ML Algorithms", "Projects & Portfolio", "Mock Interviews"],
  },
  "ML Engineer": {
    icon: "🤖", color: "#f44336",
    skills: ["Deep Learning", "MLOps", "Python", "Model Deployment", "Data Pipelines"],
    topics: ["Neural Networks", "Transformers & LLMs", "Model Optimization", "Feature Stores", "CI/CD for ML"],
    tips: ["Deploy a model to production", "Learn MLflow or Kubeflow", "Study transformer architecture", "Build ML pipelines"],
    roadmap: ["ML Fundamentals", "Deep Learning", "MLOps Tools", "Production Deployment", "Mock Interviews"],
  },
  "Product Manager": {
    icon: "🎯", color: "#FF9800",
    skills: ["Product Strategy", "User Research", "Metrics & Analytics", "Roadmapping", "Stakeholder Management"],
    topics: ["Product Sense", "GTM Strategy", "Prioritization Frameworks", "OKRs & KPIs", "Competitive Analysis"],
    tips: ["Practice product critique", "Study famous product failures", "Learn SQL for data analysis", "Read product case studies"],
    roadmap: ["Product Fundamentals", "User Research", "Metrics & Data", "Strategy & Roadmap", "Mock Interviews"],
  },
  "DevOps Engineer": {
    icon: "☁️", color: "#2196F3",
    skills: ["Docker & Kubernetes", "CI/CD Pipelines", "AWS/GCP/Azure", "Infrastructure as Code", "Monitoring"],
    topics: ["Container Orchestration", "Jenkins/GitHub Actions", "Terraform", "Prometheus & Grafana", "Linux Administration"],
    tips: ["Get AWS/GCP certified", "Build a CI/CD pipeline", "Practice Kubernetes deployments", "Learn Terraform"],
    roadmap: ["Linux & Networking", "Docker & K8s", "CI/CD", "Cloud Platforms", "Mock Interviews"],
  },
  "default": {
    icon: "🎓", color: "#4CAF50",
    skills: ["Communication", "Problem Solving", "Teamwork", "Leadership", "Technical Knowledge"],
    topics: ["STAR Method", "Behavioral Questions", "Role-specific Knowledge", "Industry Trends", "Soft Skills"],
    tips: ["Practice STAR method answers", "Research the company", "Prepare 5-7 key stories", "Mock interview weekly"],
    roadmap: ["Know Your Role", "STAR Method", "Technical Prep", "Behavioral Prep", "Mock Interviews"],
  }
};

export default function Dashboard({ candidate, onStartInterview }) {
  const role = candidate?.role || "default";
  const data = roleData[role] || roleData["default"];

  return (
    <div style={{ padding: "30px 40px", maxWidth: 1100, margin: "0 auto", color: "white", fontFamily: "Segoe UI, Arial" }}>

      {/* Welcome Banner */}
      <div style={{ background: `linear-gradient(135deg, ${data.color}22, #1a1a2e)`, border: `1px solid ${data.color}44`, borderRadius: 16, padding: "28px 32px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, color: data.color, fontWeight: "bold", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Welcome back 👋</div>
          <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800 }}>{candidate?.name}</h1>
          <div style={{ fontSize: 15, color: "#aaa" }}>{data.icon} {role} — Your personalized prep dashboard</div>
        </div>
        <button onClick={onStartInterview}
          style={{ padding: "12px 28px", background: `linear-gradient(135deg, ${data.color}, #2196F3)`, border: "none", borderRadius: 25, color: "white", cursor: "pointer", fontSize: 15, fontWeight: "bold", whiteSpace: "nowrap" }}>
          🎤 Start Mock Interview
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

        {/* Key Skills */}
        <div style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 13, color: data.color, fontWeight: "bold", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>🛠 Key Skills to Master</div>
          {data.skills.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: data.color, flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "#ddd" }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Hot Topics */}
        <div style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 13, color: "#FF9800", fontWeight: "bold", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>🔥 Hot Interview Topics</div>
          {data.topics.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF9800", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "#ddd" }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Prep Tips */}
        <div style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 13, color: "#4CAF50", fontWeight: "bold", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>💡 Prep Tips for {role}</div>
          {data.tips.map((t, i) => (
            <div key={i} style={{ background: "#0f0f1a", borderRadius: 8, padding: "10px 14px", marginBottom: 8, fontSize: 13, color: "#ccc", borderLeft: `3px solid #4CAF50` }}>
              {t}
            </div>
          ))}
        </div>

        {/* Roadmap */}
        <div style={{ background: "#1a1a2e", border: "1px solid #1e1e3a", borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 13, color: "#9C27B0", fontWeight: "bold", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>🗺 Interview Prep Roadmap</div>
          {data.roadmap.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${data.color}, #9C27B0)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold", flexShrink: 0 }}>{i + 1}</div>
              <span style={{ fontSize: 14, color: "#ddd" }}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
