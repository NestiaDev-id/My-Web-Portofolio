import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Paperclip, Pin, Calendar, Scissors, Sparkles, Star, Zap, Ghost, Skull, Asterisk, Hexagon, Cat } from "lucide-react";
import {
  FaPython, FaFigma, FaGitAlt, FaReact, FaNodeJs, FaDocker, FaJava,
} from "react-icons/fa";
import {
  SiFastapi, SiPytorch, SiTypescript, SiNextdotjs, SiPostgresql, SiTensorflow,
  SiHuggingface, SiJavascript, SiPhp, SiDart, SiFlutter, SiGo, SiTailwindcss,
  SiBootstrap, SiExpress, SiLaravel, SiMongodb, SiMysql, SiFirebase,
  SiSupabase, SiPostman, SiPowers, SiGooglecloud, SiLangchain,
  SiArchlinux,
} from "react-icons/si";

import SquiggleDecorations from "../components/SquiggleDecorations";

/* ─── Stable hash ─── */
// function hash(str: string): number {
//   let h = 9;
//   for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 387420489);
//   return (h ^ (h >>> 9)) >>> 0;
// }

/* ─── Ransom Letter (per-character) ─── */
const FONTS = [
  "font-typewriter font-bold", "font-marker", "font-pixel tracking-widest",
  "font-heavy-block uppercase", "font-bungee uppercase", "font-p5-display",
];
const STYLES = [
  "bg-black text-white border-2 border-black",
  "bg-white text-black border-2 border-black border-dashed",
  "bg-yellow-400 text-black border-2 border-black",
  "bg-[#ef4444] text-white border-2 border-black",
  "bg-[#ec4899] text-white border-2 border-black",
  "bg-[#06b6d4] text-black border-2 border-black",
  "bg-[#10b981] text-black border-2 border-black",
  "bg-[#a855f7] text-white border-2 border-black",
];
const TILTS = ["rotate-1", "-rotate-2", "rotate-3", "-rotate-3", "rotate-6", "-rotate-6", "-rotate-1", "rotate-2"];

const RansomChar: React.FC<{ char: string; idx: number; seed: string; size?: string }> = ({
  char, idx, seed, size = "text-2xl md:text-4xl",
}) => {
  if (char === " ") return <span className="w-3 md:w-5 inline-block" />;
  const code = (char.charCodeAt(0) || 0) + idx + seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return (
    <span
      className={`inline-flex items-center justify-center p-1 leading-none select-none transition-transform hover:scale-125 cursor-pointer shadow-md ${FONTS[code % FONTS.length]} ${STYLES[(code + 2) % STYLES.length]} ${TILTS[(code + 5) % TILTS.length]} ${size}`}
      style={{ minWidth: "1.2em", minHeight: "1.2em" }}
    >
      {char}
    </span>
  );
};

const RansomPhrase: React.FC<{ text: string; seed?: string; size?: string; className?: string }> = ({
  text, seed = "default", size, className = "",
}) => (
  <div className={`flex flex-wrap items-center justify-center gap-y-2 md:gap-y-4 ${className}`}>
    {text.split(" ").map((word, wi) => (
      <div key={wi} className="flex items-center">
        {word.split("").map((c, ci) => (
          <RansomChar key={ci} char={c} idx={wi * 10 + ci} seed={seed} size={size} />
        ))}
        {wi < text.split(" ").length - 1 && <span className="w-3 md:w-5 inline-block" />}
      </div>
    ))}
  </div>
);

/* ─── Tech Stack Data ─── */
const techCategories = [
  {
    category: "FRONT-END",
    skills: [
      { name: "JavaScript", icon: <SiJavascript />, color: "bg-yellow-400 text-black" },
      { name: "TypeScript", icon: <SiTypescript />, color: "bg-blue-600 text-white" },
      { name: "React", icon: <FaReact />, color: "bg-cyan-500 text-black" },
      { name: "Next.js", icon: <SiNextdotjs />, color: "bg-black text-white" },
      { name: "Flutter", icon: <SiFlutter />, color: "bg-blue-500 text-white" },
      { name: "Tailwind", icon: <SiTailwindcss />, color: "bg-sky-500 text-black" },
      { name: "Bootstrap", icon: <SiBootstrap />, color: "bg-purple-600 text-white" },
      { name: "Figma", icon: <FaFigma />, color: "bg-pink-500 text-white" },
    ],
  },
  {
    category: "BACK-END & DB",
    skills: [
      { name: "Python", icon: <FaPython />, color: "bg-blue-700 text-white" },
      { name: "Go", icon: <SiGo />, color: "bg-teal-500 text-black" },
      { name: "PHP", icon: <SiPhp />, color: "bg-indigo-500 text-white" },
      { name: "Dart", icon: <SiDart />, color: "bg-cyan-600 text-white" },
      { name: "Java", icon: <FaJava />, color: "bg-red-600 text-white" },
      { name: "Node.js", icon: <FaNodeJs />, color: "bg-green-600 text-black" },
      { name: "Express", icon: <SiExpress />, color: "bg-gray-800 text-white" },
      { name: "FastAPI", icon: <SiFastapi />, color: "bg-teal-600 text-white" },
      { name: "Laravel", icon: <SiLaravel />, color: "bg-red-500 text-white" },
      { name: "MongoDB", icon: <SiMongodb />, color: "bg-green-500 text-black" },
      { name: "PostgreSQL", icon: <SiPostgresql />, color: "bg-blue-500 text-white" },
      { name: "MySQL", icon: <SiMysql />, color: "bg-blue-400 text-white" },
      { name: "Firebase", icon: <SiFirebase />, color: "bg-amber-400 text-black" },
      { name: "Supabase", icon: <SiSupabase />, color: "bg-emerald-500 text-black" },
    ],
  },
  {
    category: "TOOLS & AI",
    skills: [
      { name: "Git", icon: <FaGitAlt />, color: "bg-orange-600 text-white" },
      { name: "Docker", icon: <FaDocker />, color: "bg-blue-500 text-white" },
      { name: "Postman", icon: <SiPostman />, color: "bg-orange-500 text-white" },
      { name: "Arch Linux", icon: <SiArchlinux />, color: "bg-gray-900 text-yellow-300" },
      { name: "PowerShell", icon: <SiPowers />, color: "bg-blue-700 text-white" },
      { name: "GCP", icon: <SiGooglecloud />, color: "bg-blue-500 text-white" },
      { name: "TensorFlow", icon: <SiTensorflow />, color: "bg-orange-500 text-white" },
      { name: "PyTorch", icon: <SiPytorch />, color: "bg-red-600 text-white" },
      { name: "LangChain", icon: <SiLangchain />, color: "bg-emerald-800 text-white" },
      { name: "Hugging Face", icon: <SiHuggingface />, color: "bg-yellow-400 text-black" },
    ],
  },
];

/* ─── Experience Data ─── */
const experiences = [
  {
    img: "https://www.usd.ac.id/logo/usd.png",
    role: "Computer Science Graduate",
    company: "Sanata Dharma University",
    period: "Aug 2021 – Dec 2024",
    desc: [
      "Pursuing a Bachelor's degree in Computer Science with a focus on software engineering and data-driven technologies.",
      "Actively involved in academic projects and research, including web application development, machine learning experiments, and system design.",
    ],
    tags: [
      "JavaScript", "Java", "Python", "SQL", "Git", "Kotlin", 
      "Team Work", "Critical Thinking", "Problem Solving", "Leadership", 
      "Communication", "Time Management", "Project Management", "Collaboration", 
      "Agile Development", "Scrum Methodology", "Kanban Methodology", "Agile Methodology"
    ],
  },
  {
    img: "https://www.logo.wine/a/logo/Microsoft_Store/Microsoft_Store-Logo.wine.svg",
    role: "AI Scholarship Student",
    company: "Elevate Program by Dicoding",
    period: "Jan 2025 – Present",
    desc: [
      "Awarded the Artificial Intelligence Scholarship through the Elevate Program by Dicoding (Microsoft).",
      "Building AI solutions using Azure AI services covering NLP, computer vision, and generative AI applications.",
    ],
    tags: [
      "Natural Language Processing (NLP)", "Azure OpenAI", "Microsoft Azure", "GitHub", 
      "Computer Vision", "OpenCV", "Git", "Document Processing with Form Recognizer", 
      "Azure AI Vision Solutions", "Semantic Kernel", "Azure DevOps", "AI Security", 
      "Cloud-Native App Development with Azure", "AI and Data Science Solutions", 
      "Azure Container Apps", "Generative AI Applications"
    ],
  },
];

const bioText = [
  "Hi, I'm Christian, a passionate software engineer with a strong background in full-stack development, artificial intelligence, and data analytics. I specialize in building intelligent, scalable, and high-performance applications.",
  "My interest in AI began during university, where I worked on time series forecasting using Holt-Winters optimized by Genetic Algorithms. Later, I explored YOLO, CNNs, and LSTM models for real-time detection. Curiosity drives me — I'm always eager to learn and contribute to open-source.",
];


/* ====================================================================
   ABOUT PAGE
==================================================================== */
const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlocked = useRef(false);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [focusedExp, setFocusedExp] = useState<number | null>(null);

  useEffect(() => {
    const unlock = () => { audioUnlocked.current = true; };
    window.addEventListener("pointerdown", unlock, { once: true, capture: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  const playSound = useCallback(() => {
    if (!audioUnlocked.current || !sfxRef.current) return;
    try { sfxRef.current.currentTime = 0; sfxRef.current.play().catch(() => {}); } catch {}
  }, []);

  const getSkillDesc = (skillName: string) => {
    const descriptions: Record<string, string> = {
      // Front-End
      "JavaScript": "Telah diandalkan untuk memanipulasi DOM tingkat lanjut, integrasi API dinamis, dan merancang logika interaktif sisi klien.",
      "TypeScript": "Diterapkan pada proyek berskala besar guna menjamin keamanan tipe (type-safety) dan meminimalisir bug kritis saat runtime.",
      "React": "Menjadi fondasi utama saya dalam merancang arsitektur antarmuka modular, manajemen state global, dan UI yang highly-reactive.",
      "Next.js": "Berhasil mendeploy portal web berkinerja tinggi dengan optimasi SEO maksimal memanfaatkan fitur Server-Side Rendering (SSR).",
      "Flutter": "Telah digunakan untuk mengembangkan aplikasi mobile multi-platform (Android & iOS) dengan animasi mulus dan performa mendekati native.",
      "Tailwind": "Diimplementasikan sebagai standar alur kerja untuk menyusun tata letak kustom dan sistem desain responsif dengan sangat cepat.",
      "Bootstrap": "Dimanfaatkan pada fase prototyping cepat dan pengembangan sistem informasi web tradisional berbasis sistem grid standar.",
      "Figma": "Terbiasa merancang alur UX, wireframe, mockup fidelitas tinggi, hingga transisi aset visual (handoff) untuk tim pengembang.",
      
      // Back-End & DB
      "Python": "Digunakan secara ekstensif untuk merancang model AI/ML, memproses data berjumlah besar, dan mendeploy layanan backend.",
      "PHP": "Menjadi pijakan awal saya dalam memahami fundamental pemrograman sisi server dan arsitektur pengembangan web dinamis.",
      "Dart": "Dikembangkan secara mendalam demi merajut logika state management yang kompleks di dalam ekosistem aplikasi Flutter.",
      "Java": "Diaplikasikan dalam membedah konsep Object-Oriented Programming (OOP) tingkat lanjut dan pola arsitektur sistem enterprise.",
      "Node.js": "Menjadi andalan utama saat merancang ekosistem backend asinkron yang efisien sepenuhnya dengan tumpukan JavaScript.",
      "Express": "Diimplementasikan untuk merancang endpoint RESTful API yang ringan, cepat, dan mudah diintegrasikan dengan berbagai database.",
      "FastAPI": "Digunakan khusus untuk merancang backend berkinerja ekstrim yang melayani inferensi model AI dengan latensi sangat rendah.",
      "Laravel": "Terbiasa mengelola arsitektur web modern memanfaatkan sistem routing dinamis, perintah artisan, dan ORM Eloquent.",
      "MongoDB": "Solusi NoSQL pilihan utama saat menangani skema data dokumen JSON yang sangat dinamis dan butuh skalabilitas tinggi.",
      "PostgreSQL": "Diandalkan dalam proyek krusial yang menuntut integritas relasi tabel kompleks dan performa komputasi query yang berat.",
      "MySQL": "Terbukti andal dan konsisten dalam mengelola aliran data transaksi pengguna pada sebagian besar pengembangan web tradisional.",
      "Firebase": "Diintegrasikan sebagai solusi backend-as-a-service (BaaS) kilat untuk sistem autentikasi realtime dan manajemen berkas.",
      "Supabase": "Pilihan terfavorit saya saat ini untuk kebutuhan backend-as-a-service berbekal kekuatan penuh dari ekosistem Postgres.",
      
      // Tools & AI
      "Git": "Terintegrasi penuh dalam alur kerja harian untuk versioning kode, code review, dan kolaborasi tim yang terstruktur rapi.",
      "Docker": "Membungkus arsitektur aplikasi ke dalam container terisolasi untuk menjamin konsistensi mutlak dari tahap lokal ke production.",
      "Postman": "Utilitas esensial harian untuk memvalidasi respon endpoint, menyimulasikan berbagai skenario payload, dan mendokumentasikan API.",
      "Arch Linux": "Sistem operasi harian (daily driver) kebanggaan yang melatih pemahaman mendalam saya terhadap manajemen core OS secara mandiri.",
      "PowerShell": "Dimanfaatkan secara khusus untuk mengeksekusi skrip otomatisasi tugas administratif di lingkup server dan desktop Windows.",
      "GCP": "Dieksplorasi secara teknis untuk mengelola arsitektur komputasi awan, virtual machine, dan kebutuhan hosting terdistribusi.",
      "TensorFlow": "Diandalkan secara proaktif untuk merancang arsitektur jaringan saraf tiruan (ANN) dari fase eksperimen hingga evaluasi model.",
      "PyTorch": "Framework pilihan utama dalam riset machine learning mutakhir, prapemrosesan tensor dinamis, dan implementasi computer vision.",
      "LangChain": "Digunakan secara intensif untuk merancang agen orchestration yang menjembatani kecerdasan LLM dengan sumber data eksternal.",
      "Hugging Face": "Dimanfaatkan untuk mengadopsi, bereksperimen, dan memoles (fine-tuning) model bahasa alami (NLP) open-source terkemuka."
    };

    
    return descriptions[skillName] || "Teknologi yang selalu saya siap eksplorasi dan adaptasi untuk memecahkan masalah dalam proyek.";
  };

  return (
    <section className="relative z-[2] min-h-screen bg-[#ece5d8] newspaper-grid text-black overflow-y-auto p5-scroll">
      <SquiggleDecorations />
      
      <audio ref={sfxRef} src="/p5/sfx/select.mp3" preload="auto" />

      {/* Top black bar */}
      <div className="w-full h-4 bg-black relative z-10" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-8 pb-20 relative z-10">

        {/* ─── Header + Back ─── */}
        <div className="flex items-center gap-4 mb-4">
          <button className="p5-back-hint" onClick={() => { playSound(); navigate("/"); }}>
            ESC · Back
          </button>
        </div>

        {/* ─── Hero Title ─── */}
        <header className="relative flex flex-col items-center mb-16 text-center">
          <div className="absolute inset-0 bg-[#d7c4a3] border-4 border-black cardboard-texture transform rotate-1 scale-105 -z-10 paper-shadow-lg" />
          <div className="p-6 md:p-8 w-full">
            <div className="font-mono text-xs font-black bg-black text-yellow-300 px-3 py-1 inline-block mb-4 -rotate-1">
              PORTFOLIO KLIPING DIGITAL RESMI
            </div>
            <div className="flex justify-center mb-6">
              <RansomPhrase text="YOHANES CHRISTIAN DEVANO" seed="hero-title" size="text-2xl sm:text-4xl md:text-5xl" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {["CREATIVE DEVELOPER", "FULL-STACK DEVELOPMENT", "ML RESEARCH ENGINEER"].map((t, i) => {
                const colors = ["bg-p5-red text-white", "bg-black text-white", "bg-cyan-500 text-black"];
                const tilts = ["rotate-1", "-rotate-1", "rotate-2"];
                return (
                  <span key={i} className={`font-heavy-block text-xs md:text-sm px-3 py-1 border-2 border-black ${colors[i]} ${tilts[i]} paper-shadow-sm uppercase`}>
                    {t}
                  </span>
                );
              })}
            </div>
            
            {/* ─── Main Skills Tags ─── */}
            <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-3xl mx-auto">
              {[
                "Artificial Intelligence", "Machine Learning", "Computer Vision", 
                "Forecasting", "Data Analysis", "Data Visualization", 
                "Problem Solving", "Team Work & Collaboration", 
                "Personal Growth", "Curious & Passionate"
              ].map((skill, i) => (
                <span 
                  key={i} 
                  className={`font-mono text-[10px] md:text-xs px-2 py-1 bg-white border border-black/80 text-black shadow-sm ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:bg-black hover:text-white transition-colors cursor-crosshair`}
                >
                  #{skill.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* ─── Profile Card + Bio (Bento Grid) ─── */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">

          {/* LEFT: Profile + Bio */}
          <section className="col-span-1 lg:col-span-7 space-y-10">
            <div className="bg-white border-4 border-black p-6 md:p-8 relative -rotate-1 paper-shadow-lg dot-grid-bg">
              {/* Paper clip */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 rotate-12">
                <Paperclip className="w-10 h-10 text-gray-800 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
              </div>
              {/* Tape */}
              <div className="absolute -top-3 right-6 w-24 h-6 bg-yellow-200 opacity-90 border-x border-dashed border-yellow-500 rotate-[8deg]" />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mt-4">
                {/* Polaroid */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="bg-stone-50 p-3 pb-6 border-2 border-black -rotate-3 paper-shadow-sm w-full max-w-[200px]">
                    <div className="relative w-full aspect-square border border-black overflow-hidden bg-zinc-200">
                      <img
                        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                        alt="Profile"
                        className="w-full h-full object-cover contrast-[1.3] brightness-95 grayscale hover:grayscale-0 transition-all duration-500"
                      />
                      <div className="absolute top-2 -left-6 w-20 h-5 bg-pink-500 text-white text-[7px] font-mono font-black -rotate-[40deg] flex items-center justify-center border-y border-black">
                        DEV-ID: 90
                      </div>
                    </div>
                    <div className="text-center font-marker text-md text-black mt-3 -rotate-2">
                      Yohanes Christian Devano
                    </div>
                  </div>
                </div>

                {/* Bio text */}
                <div className="md:col-span-7 space-y-4">
                  <h3 className="font-bungee text-sm bg-yellow-300 px-2.5 py-1 inline-block border-2 border-black rotate-[1.5deg]">
                    📝 BIOGRAFI SINGKAT
                  </h3>
                  <div className="font-typewriter text-xs md:text-sm text-gray-800 space-y-3 leading-relaxed">
                    {bioText.map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                </div>
              </div>

              {/* Cut line */}
              <div className="border-t-2 border-dashed border-black mt-6 pt-4 flex justify-between items-center text-[10px] font-mono text-gray-500">
                <span><Scissors className="inline w-3 h-3 mr-1" />GUNTING DI SINI UNTUK KARTU NAMA</span>
                <span>YOHANES_DEV_2026</span>
              </div>
            </div>

            {/* ─── Academic Thesis Card ─── */}
            <div className="bg-yellow-50 border-4 border-black p-5 relative rotate-1 paper-shadow-lg notebook-lines mt-8 group cursor-crosshair transition-transform hover:scale-[1.02]">
              <div className="absolute -top-3 left-8 bg-red-600 text-white px-2 py-0.5 font-mono text-[9px] font-bold -rotate-[4deg] uppercase border border-black shadow-[2px_2px_0px_#000]">
                ACADEMIC THESIS
              </div>
              
              <h3 className="font-bungee text-sm text-black mt-3 mb-2 uppercase flex items-center">
                <Pin className="w-4 h-4 mr-2 text-blue-500 fill-blue-500 -rotate-12" /> TUGAS AKHIR (SKRIPSI)
              </h3>
              
              <p className="font-heavy-block text-xs uppercase leading-relaxed text-black mb-2 px-1 bg-white inline-block border border-black/20">
                "Optimisasi Metode Holt-Winter Menggunakan Algoritma Genetika Untuk Prediksi Jumlah Penumpang Pesawat Di Bandara Soekarno-Hatta"
              </p>
              
              <p className="font-typewriter text-xs text-gray-800 leading-relaxed mb-4 pr-4">
                Penyelesaian studi di Universitas Sanata Dharma. Riset berfokus pada optimasi parameter metode Holt-Winter menggunakan Algoritma Genetika untuk menghasilkan akurasi prediksi data yang maksimal.
              </p>
              
              <div className="flex gap-2 items-center">
                <div className="inline-block px-2 py-1 bg-black text-white text-[9px] font-mono font-bold border-2 border-dashed border-white -rotate-2">
                  STATUS: COMPLETED ✅
                </div>
                {/* <div className="inline-block px-2 py-1 bg-green-300 text-black text-[9px] font-heavy-block rotate-1 border border-black">
                  GRADE: A
                </div> */}
              </div>

              {/* Tape deco */}
              <div className="absolute -bottom-3 -right-4 w-16 h-8 bg-sky-200 rotate-[-25deg] opacity-80 border-t border-black border-dashed pointer-events-none" />
              <div className="absolute -top-3 -right-2 w-12 h-6 bg-rose-200 rotate-[45deg] opacity-80 border-b border-black border-dashed pointer-events-none" />
            </div>

          </section>

          {/* RIGHT: Social Links */}
          <section className="col-span-1 lg:col-span-5 space-y-10">
            <div className="bg-orange-400 border-4 border-black p-6 relative rotate-2 paper-shadow-lg">
              <div className="absolute top-2 left-6 bg-black text-orange-400 px-2 py-0.5 font-mono text-[9px] font-bold -rotate-3 uppercase">
                CONNECT
              </div>
              <h3 className="font-bungee text-sm text-black mt-4 mb-6 uppercase">📬 HUBUNGI / JARINGAN</h3>
              <div className="flex flex-col gap-4">
                {[
                  { label: "KIRIM EMAIL", url: "mailto:yohanesdevano90@gmail.com", color: "bg-rose-500 text-white", tilt: "-rotate-2" },
                  { label: "GITHUB REPO", url: "https://github.com/NestiaDev-id", color: "bg-emerald-500 text-black", tilt: "rotate-3" },
                  { label: "LINKEDIN", url: "https://www.linkedin.com/in/yohanes-christian-devano/", color: "bg-blue-500 text-white", tilt: "-rotate-1" },
                  { label: "WHATSAPP", url: "https://api.whatsapp.com/send/?phone=6281325720265", color: "bg-green-500 text-black", tilt: "rotate-2" },
                ].map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noreferrer"
                    className={`block p-4 border-2 border-black font-heavy-block text-xs uppercase tracking-wider text-center paper-shadow-sm transition-all hover:-translate-y-1 hover:rotate-0 hover:scale-105 ${s.color} ${s.tilt}`}
                  >
                    {s.label} ↗
                  </a>
                ))}
              </div>
            </div>

            {/* CTA: Chat with AI */}
            <button
              className="p5-cv-btn w-full sm:w-auto"
              onClick={() => { playSound(); navigate("/chat-me"); }}
            >
              <span>💬 Chat with My AI Assistant</span>
            </button>
          </section>
        </main>

        {/* ─── GitHub Contributions Full Width ─── */}
        <section className="mb-16">
          <div className="bg-white border-4 border-black p-4 md:p-6 relative rotate-1 paper-shadow-lg notebook-lines">
            {/* Tape */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-7 bg-rose-300 opacity-90 border-x border-dashed border-rose-500 rotate-[-2deg]" />
            
            <div className="flex justify-between items-end mb-4">
              <h3 className="font-bungee text-sm bg-black text-white px-2.5 py-1.5 inline-block border-2 border-black rotate-[-1deg] paper-shadow-sm">
                📈 CODE CONTRIBUTIONS
              </h3>
              <span className="font-typewriter text-xs text-gray-500 hidden sm:block">@NestiaDev-id</span>
            </div>
            
            <div className="border-2 border-black bg-zinc-50 p-2 md:p-4 overflow-hidden flex justify-center -rotate-[0.5deg] paper-shadow-sm">
              <img 
                src="https://ghchart.rshah.org/NestiaDev-id" 
                alt="Yohanes Devano GitHub Contributions" 
                className="w-full max-w-full cursor-crosshair"
              />
            </div>
            
            <div className="text-right mt-3 font-mono text-[9px] text-gray-400 font-bold tracking-widest uppercase">
              [ LIVE DATA // GITHUB.COM ]
            </div>
          </div>
        </section>

        {/* ─── Tech Stack Grid ─── */}
        <section className="mb-16">
          <div className="bg-black text-white p-3 -rotate-1 inline-block mb-8 paper-shadow-sm font-bungee text-lg uppercase border-2 border-dashed border-white">
            <Scissors className="inline w-5 h-5 mr-2" />TECH SKILL STACK
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {techCategories.map((cat, ci) => {
              const boxTilts = ["rotate-1", "-rotate-1", "rotate-[-2deg]"];
              return (
                <div key={ci} className={`bg-white border-4 border-black p-5 ${boxTilts[ci]} paper-shadow-lg relative overflow-hidden dot-grid-bg`}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-32 h-6 bg-yellow-100 opacity-85 -rotate-2 border border-black border-dashed flex items-center justify-center text-[8px] font-mono font-bold tracking-widest text-gray-700">
                    VERIFIED SOURCE
                  </div>
                  <h3 className="font-heavy-block text-sm bg-black text-white px-2 py-1.5 mt-2 inline-block mb-6 -rotate-2 tracking-tight">
                    {cat.category}
                  </h3>
                  <div className="flex flex-wrap gap-2.5 relative z-10">
                    {cat.skills.map((skill, si) => {
                      const tagTilts = ["rotate-2", "-rotate-2", "rotate-1", "-rotate-1", "rotate-3", "-rotate-3"];
                      return (
                        <button key={si}
                          onMouseEnter={() => { setActiveSkill(skill.name); playSound(); }}
                          onMouseLeave={() => setActiveSkill(null)}
                          className={`px-3 py-2 font-typewriter text-sm font-bold border-2 border-black paper-shadow-sm transition-all hover:-translate-y-1 hover:scale-105 cursor-help ${skill.color} ${tagTilts[(si + ci) % tagTilts.length]}`}
                        >
                          <span className="mr-1.5 text-lg align-middle">{skill.icon}</span>
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Tape deco */}
                  <div className="absolute -bottom-2 -right-4 w-16 h-8 bg-[#fed7aa] rotate-[35deg] opacity-70 border-t border-black border-dashed pointer-events-none z-0" />
                </div>
              );
            })}
          </div>

          {/* Hover hint */}
          <div className="mt-8 h-24 relative">
            {activeSkill ? (
              (() => {
                const desc = getSkillDesc(activeSkill);
                return (
                  <div className="absolute w-full bg-[#f8fafc] border-2 border-black p-4 rounded-none paper-shadow-sm flex items-start gap-4 animate-fade-in rotate-[0.5deg] z-20">
                    <div className="flex-1 relative">
                      <Pin className="absolute -top-2 right-0 w-4 h-4 text-red-500 fill-red-500 rotate-12 drop-shadow-sm" />
                      <h4 className="font-heavy-block text-sm uppercase tracking-tight text-black mb-1 border-b-2 border-black border-dashed pb-1 inline-block pr-6">
                        {activeSkill}
                      </h4>
                      <p className="font-typewriter text-xs text-gray-700 leading-relaxed mt-1.5">{desc}</p>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="border-2 border-dashed border-gray-400 p-4 text-center select-none rotate-[-0.5deg]">
                <p className="font-typewriter text-xs text-gray-500 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Hover atau klik tag keahlian untuk mendeteksi rekam jejak teknis saya secara mendalam!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ─── Experience Timeline ─── */}
        <section className="mb-16">
          <div className="relative mb-12 inline-block">
            <div className="absolute inset-0 bg-rose-300 opacity-50 -rotate-[4deg] scale-110" />
            <h2 className="relative font-bungee text-lg text-black px-4 py-2 bg-white border-2 border-black -rotate-2 paper-shadow-sm uppercase inline-block">
              📂 ARSIP PENGALAMAN & TIMELINE
            </h2>
          </div>

          <div className="relative flex flex-col gap-10">
            {experiences.map((exp, i) => {
              const isFocused = focusedExp === i;
              const rotation = isFocused ? "rotate-0 scale-[1.02] z-30" : i === 0 ? "rotate-1 hover:-rotate-1 hover:scale-[1.01]" : "-rotate-1 hover:rotate-1 hover:scale-[1.01]";
              return (
                <div key={i}
                  onClick={() => { setFocusedExp(i === focusedExp ? null : i); playSound(); }}
                  className={`bg-amber-50 text-black border-4 border-black p-6 md:p-8 relative cursor-pointer transition-all duration-300 ${rotation} ${isFocused ? "paper-shadow-lg" : "paper-shadow"} select-none notebook-lines`}
                >
                  <div className="absolute -top-5 right-10 z-20 rotate-12 text-gray-700 hover:scale-110 transition-transform">
                    <Paperclip className="w-8 h-8 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
                  </div>
                  {i === 1 && (
                    <div className="absolute -top-3 left-6 z-20 -rotate-12 text-red-600">
                      <Pin className="w-6 h-6 drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] fill-red-600" />
                    </div>
                  )}
                  {isFocused && (
                    <div className="absolute top-[-10px] left-[30%] w-36 h-7 bg-yellow-100 opacity-90 border-x border-dashed border-yellow-400 -rotate-1 flex items-center justify-center font-mono text-[9px] font-bold tracking-widest text-amber-800 z-30">
                      📁 PINNED
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2 bg-rose-500 text-white font-bungee text-xs px-3 py-1.5 border-2 border-black -rotate-1 paper-shadow-sm uppercase">
                      <Calendar className="w-3.5 h-3.5" />{exp.period}
                    </div>
                    <span className="font-mono text-xs font-bold text-gray-500">DOC-ID: 00{i + 1}_KRAFT</span>
                  </div>

                  <div className="mb-4">
                    <div className="inline-block bg-black text-purple-400 px-3 py-1 font-heavy-block text-xs uppercase rotate-1 mb-2">
                      {exp.company}
                    </div>
                    <h4 className="font-marker text-xl md:text-2xl text-black leading-tight">{exp.role}</h4>
                  </div>

                  <div className="space-y-3 mt-6 font-typewriter text-xs md:text-sm text-gray-800 border-l-4 border-dashed border-purple-300 pl-4">
                    {exp.desc.map((b, bi) => <p key={bi}>👉 {b}</p>)}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-8 pt-4 border-t border-dashed border-gray-300">
                    {exp.tags.map((tag, ti) => (
                      <span key={ti} className="font-pixel text-xs bg-white text-black border border-black px-2 py-0.5 rotate-1 font-bold shadow-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {!isFocused && (
                    <div className="absolute bottom-2 right-2 font-mono text-[8px] text-gray-400 animate-pulse uppercase">
                      [ Klik Untuk Pin ]
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </section>
  );
};

export default AboutPage;
