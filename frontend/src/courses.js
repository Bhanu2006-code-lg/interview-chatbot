export const techCourses = [
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

export const govCourses = [
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

export const allCourses = [...techCourses, ...govCourses];
