import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";
import { PushPin } from "../components/ui/PushPin";



// --- AGENT LOG SIMULATION DATA ---
const LOG_LINES = [
  { delay: 0, node: "ROUTER", msg: "Message classified → teach", type: "info" },
  { delay: 600, node: "TUTOR_NODE", msg: "Searching ML_Syllabus.pdf (namespace: user_sess_42)...", type: "info" },
  { delay: 1200, node: "TUTOR_NODE", msg: "Retrieved 5 chunks · top score 0.94 · GPT-4o invoked", type: "info" },
  { delay: 2800, node: "TUTOR_NODE", msg: "Explanation streamed · checkpoint question generated", type: "success" },
  { delay: 3600, node: "GRADE_NODE", msg: "Student response received: \"the time quantum\"", type: "info" },
  { delay: 4400, node: "GRADE_NODE", msg: "Classification → PARTIAL · missing preemption mechanism", type: "warn" },
  { delay: 5000, node: "GRADE_NODE", msg: "Re-routing tutorNode · mode=step_by_step · attempt 2/3", type: "warn" },
  { delay: 5800, node: "TUTOR_NODE", msg: "Switching to step-by-step breakdown mode...", type: "info" },
  { delay: 7200, node: "TUTOR_NODE", msg: "Re-explanation streamed", type: "success" },
  { delay: 8000, node: "GRADE_NODE", msg: "Classification → UNDERSTOOD ✓ · advancing curriculum", type: "success" },
];

const NODE_COLORS = {
  ROUTER: "text-blue-400",
  TUTOR_NODE: "text-violet-400",
  GRADE_NODE: "text-amber-400",
  DOUBT_NODE: "text-emerald-400",
};

const TYPE_COLORS = {
  info: "text-slate-300",
  success: "text-emerald-400",
  warn: "text-amber-400",
};

function AgentLog() {
  const [visibleLines, setVisibleLines] = useState([]);
  const [loop, setLoop] = useState(0);
  const logRef = useRef(null);

  useEffect(() => {
    setVisibleLines([]);
    const timers = LOG_LINES.map((line, i) =>
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, { ...line, id: `${loop}-${i}` }]);
      }, line.delay)
    );
    // restart loop after last line + 3s pause
    const restartTimer = setTimeout(() => {
      setLoop((l) => l + 1);
    }, LOG_LINES[LOG_LINES.length - 1].delay + 3000);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(restartTimer);
    };
  }, [loop]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [visibleLines]);

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  return (
    <div className="rounded-xl border border-white/10 bg-[#181818] overflow-hidden shadow-2xl shadow-blue-950/50">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#0d1220]">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
        <span className="ml-3 text-xs text-[#555555] font-mono tracking-widest uppercase">
          Agent System Log — Live
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-mono">RUNNING</span>
        </span>
      </div>

      {/* Log body */}
      <div
        ref={logRef}
        className="font-mono text-xs p-4 h-56 overflow-y-auto space-y-2 scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {visibleLines.map((line) => (
          <div
            key={line.id}
            className="flex gap-3 animate-fadeIn"
          >
            <span className="text-[#4A4A4A] shrink-0">[{timeStr}]</span>
            <span className={`shrink-0 font-bold ${NODE_COLORS[line.node] || "text-[#666666]"}`}>
              {line.node}
            </span>
            <span className={TYPE_COLORS[line.type]}>{line.msg}</span>
          </div>
        ))}
        {/* blinking cursor */}
        <div className="flex gap-3">
          <span className="text-[#4A4A4A]">[{timeStr}]</span>
          <span className="text-[#4A4A4A] animate-pulse">█</span>
        </div>
      </div>
    </div>
  );
}

// --- FLOW STEPS ---
const STEPS = [
  {
    number: "01",
    pinColor: "#e57a5b",
    pinHighlight: "#f4a98e",
    pinShadow: "#b8512e",
    pinRim: "#8c3a1e",
    cardBg: "#fff8f5",
    cardBgDark: "#221915",
    rotate: "6deg",
    label: "Upload your syllabus",
    detail:
      "NeuralNest extracts every topic, due date, and reading assignment directly from your course materials — PDF, DOCX, or plain text.",
    tag: "topicExtractor.ts → Pinecone",
  },
  {
    number: "02",
    pinColor: "#7a90e5",
    pinHighlight: "#a8b8f4",
    pinShadow: "#4a63c8",
    pinRim: "#2e40a0",
    cardBg: "#f5f6ff",
    cardBgDark: "#161826",
    rotate: "-7deg",
    label: "Agents build your map.",
    detail:
      "Our multi-agent system constructs a dynamic cognitive map, identifying concept dependencies and prerequisite knowledge gaps across your entire curriculum.",
    tag: "router → tutorNode → gradeNode",
  },
  {
    number: "03",
    pinColor: "#7abbe5",
    pinHighlight: "#a8d8f4",
    pinShadow: "#4a8fb8",
    pinRim: "#2e6a8c",
    cardBg: "#f5fbff",
    cardBgDark: "#131d2b",
    rotate: "5deg",
    label: "Get a personalised study plan.",
    detail:
      "Based on your mastery gaps and exam timeline, the AI schedules daily micro-sessions — balancing spaced repetition with your real-world availability.",
    tag: "plannerAgent.ts → scheduleEngine",
  },
  {
    number: "04",
    pinColor: "#e5c07a",
    pinHighlight: "#f4d9a8",
    pinShadow: "#b88c2e",
    pinRim: "#8c6010",
    cardBg: "#fffdf0",
    cardBgDark: "#222115",
    rotate: "-8deg",
    label: "Learn through dialogue.",
    detail:
      "Chat with your AI tutor in real time. Ask questions, request re-explanations, and get worked examples — all grounded in your specific syllabus.",
    tag: "tutorNode → OpenAI · GPT-4o",
  },
  {
    number: "05",
    pinColor: "#b07ae5",
    pinHighlight: "#cea8f4",
    pinShadow: "#7a4ac8",
    pinRim: "#551e9e",
    cardBg: "#faf5ff",
    cardBgDark: "#1d1626",
    rotate: "6deg",
    label: "Master the material.",
    detail:
      "As you pass adaptive quizzes, your mastery rating deterministically increases. When you hit 100% on every topic, you are exam-ready — no guesswork.",
    tag: "masteryCalculator.ts · no LLM",
  },
];


// --- STATS ---
const STATS = [
  { value: "57", label: "Topics extracted from one ML syllabus" },
  { value: "3×", label: "Re-explanation cycles before moving on" },
  { value: "0.6 / 0.3 / 0.1", label: "Quiz · self-rating · engagement weights" },
  { value: "1024", label: "Cohere embedding dimensions per chunk" },
];

// --- COMPARISON ---
const VS_ROWS = [
  { feature: "Verifies student understood before moving on", nn: true, others: false },
  { feature: "Re-teaches in a different mode when confused", nn: true, others: false },
  { feature: "Prerequisite dependency graph from your PDF", nn: true, others: false },
  { feature: "Mastery = weighted formula, not quiz score only", nn: true, others: false },
  { feature: "PYQ frequency analysis for exam prioritization", nn: true, others: false },
  { feature: "Persistent learning profile across sessions", nn: true, others: false },
  { feature: "Generates a study plan around your exam date", nn: true, others: true },
  { feature: "Adaptive quizzes", nn: true, others: true },
];

// --- MAIN COMPONENT ---
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pinboardStyle = {
    backgroundColor: isDark ? '#181818' : '#f6f5f1',
    backgroundImage: isDark
      ? 'repeating-linear-gradient(to bottom, transparent, transparent 39px, rgba(255,255,255,0.07) 39px, rgba(255,255,255,0.07) 40px)'
      : 'repeating-linear-gradient(to bottom, transparent, transparent 39px, rgba(0,0,0,0.07) 39px, rgba(0,0,0,0.07) 40px)',
  };

  return (
    <div className="min-h-screen text-white relative" style={pinboardStyle}>

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#181818]/90 backdrop-blur border-b border-white/10" : ""
        }`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#3B6BFF] flex items-center justify-center text-sm font-black">
              N
            </div>
            <span className="font-bold tracking-tight text-white">NeuralNest</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how" className="text-sm text-[#666666] hover:text-white transition-colors hidden sm:block">
              How it works
            </a>
            <a href="#compare" className="text-sm text-[#666666] hover:text-white transition-colors hidden sm:block">
              Compare
            </a>
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-[#666666] hover:text-white transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-4 py-2 rounded-lg bg-[#3B6BFF] hover:bg-blue-500 text-sm font-semibold transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-6 pt-32 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: copy */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            LangGraph · GPT-4o · Pinecone RAG
          </div>

          <h1 className="text-4xl sm:text-5xl font-black leading-[1.08] tracking-tight">
            The AI that knows{" "}
            <span className="text-[#3B6BFF]">when you're confused</span>
            {" "}and re-teaches until you're not.
          </h1>

          <p className="text-[#666666] text-lg leading-relaxed max-w-lg">
            Upload your syllabus. NeuralNest maps every topic, teaches you one concept at a time,
            grades your understanding after each explanation, and only advances when you've actually got it.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-3 rounded-xl bg-[#3B6BFF] hover:bg-blue-500 font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
            >
              Start Learning Free →
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 rounded-xl border border-white/15 hover:border-white/30 text-slate-300 font-semibold transition-colors"
            >
              Log In
            </button>
          </div>

          <p className="text-xs text-[#4A4A4A]">
            No credit card. Works with any PDF syllabus.
          </p>
        </div>

        {/* Right: live agent log */}
        <div className="lg:pl-4">
          <p className="text-xs text-[#555555] font-mono mb-3 uppercase tracking-widest">
            Live agent activity — teaching Round Robin Scheduling
          </p>
          <AgentLog />
          <p className="text-xs text-[#4A4A4A] mt-3 text-center">
            This is the actual LangGraph loop running right now
          </p>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-white/10 relative z-[1]" style={{ backgroundColor: isDark ? 'rgba(13,18,32,0.85)' : 'rgba(230,228,220,0.85)' }}>
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="space-y-1">
              <div className="text-2xl font-black text-[#3B6BFF] font-mono">{s.value}</div>
              <div className="text-xs text-[#555555] leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how"
        className="relative z-[1] py-24 px-6 overflow-hidden"
      >

        {/* ── Section header ── */}
        <div className="relative z-10 text-center mb-20">
          <p
            className="text-xs font-mono uppercase tracking-widest mb-3"
            style={{ color: "#9b8f7e" }}
          >
            How it works
          </p>
          <h2
            className="font-display text-4xl font-black tracking-tight text-[#1a1a1a] dark:text-white"
          >
            Five steps. One agent loop.
          </h2>
        </div>

        {/* ── Timeline ── */}
        <div className="relative max-w-4xl mx-auto mb-20" style={{ zIndex: 1 }}>
          <div className="flex flex-col gap-12 md:gap-0">
            {STEPS.map((step, i) => {
              const isLeft = i % 2 === 0;
              // Diagonal connector definitions: left pin at 22%, right pin at 78%
              const connectors = [
                { x1: "22%", y1: "0%", x2: "78%", y2: "100%" },
                { x1: "78%", y1: "0%", x2: "22%", y2: "100%" },
                { x1: "22%", y1: "0%", x2: "78%", y2: "100%" },
                { x1: "78%", y1: "0%", x2: "22%", y2: "100%" },
              ];
              const connector = connectors[i];
              return (
                <div key={step.number} className="relative">
                  {/* Card row */}
                  <div
                    className={`relative z-10 flex flex-col md:flex-row ${isLeft ? "md:justify-start" : "md:justify-end"
                      } ${i > 0 ? "md:-mt-16" : ""}`}
                  >
                    <div className="relative w-full md:w-[45%] max-w-[420px]">
                      {/* Push-pin SVG component */}
                      <div
                        className="absolute z-20"
                        style={{
                          top: "-28px",
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      >
                        <PushPin color={step.pinColor} className="w-14 h-14" />
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 32 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{ rotate: 0, scale: 1.03, transition: { duration: 0.2 } }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="w-full rounded-3xl p-3 pt-14 relative bg-white dark:bg-[#222222] cursor-pointer"
                        style={{
                          border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.08)",
                          boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(0,0,0,0.06)",
                          rotate: (window.innerWidth < 768) ? "0deg" : step.rotate,
                          transformOrigin: "center top",
                        }}
                      >
                        {/* Inner coloured card */}
                        <div
                          className="rounded-2xl p-6"
                          style={{ backgroundColor: isDark ? step.cardBgDark : step.cardBg }}
                        >
                          <p
                            className="mb-2"
                            style={{
                              fontFamily: "'Caveat', cursive",
                              fontWeight: 700,
                              fontSize: "1.75rem",
                              color: "#9b8f7e",
                              letterSpacing: "0.02em",
                              lineHeight: 1,
                            }}
                          >
                            {step.number}
                          </p>
                          <h3 className="text-xl font-bold mb-3 text-[#1a1a1a] dark:text-white">
                            {step.label}
                          </h3>
                          <p className="text-sm leading-relaxed text-[#555555] dark:text-slate-300">
                            {step.detail}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Curved dashed connector to the next card — desktop only */}
                  {connector && (
                    <div
                      className="hidden md:block absolute pointer-events-none"
                      style={{ left: 0, right: 0, top: "60%", height: "160px", zIndex: 0 }}
                      aria-hidden="true"
                    >
                      <svg width="100%" height="100%" viewBox="0 0 800 160" preserveAspectRatio="xMidYMid meet">
                        <path
                          d={isLeft
                            ? "M 180,0 Q 400,-40 620,160"
                            : "M 620,0 Q 400,-40 180,160"
                          }
                          fill="none"
                          stroke={isDark ? "rgba(255,255,255,0.3)" : "#9b9690"}
                          strokeWidth="2"
                          strokeDasharray="8 6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Agent graph visual */}
        <div className="max-w-4xl mx-auto rounded-xl border border-white/10 bg-[#0d1220] p-6 overflow-x-auto shadow-xl">
          <p className="text-xs text-[#555555] font-mono uppercase tracking-widest mb-6">
            LangGraph execution path
          </p>
          <div className="flex items-center gap-2 min-w-max text-xs font-mono flex-wrap gap-y-4">
            {[
              { label: "__start__", color: "bg-slate-700 text-slate-300" },
              { arrow: true },
              { label: "router", color: "bg-blue-900/60 text-blue-300 border border-blue-500/30" },
              { arrow: true },
              { label: "tutorNode", color: "bg-violet-900/60 text-violet-300 border border-violet-500/30" },
              { arrow: true },
              { label: "gradeNode", color: "bg-amber-900/60 text-amber-300 border border-amber-500/30" },
            ].map((item, i) =>
              item.arrow ? (
                <span key={i} className="text-[#4A4A4A]">→</span>
              ) : (
                <span key={i} className={`px-3 py-1.5 rounded-lg ${item.color}`}>
                  {item.label}
                </span>
              )
            )}
            <div className="flex flex-col gap-2 ml-2">
              {[
                { result: "UNDERSTOOD", next: "END", color: "text-emerald-400" },
                { result: "CONFUSED", next: "tutorNode (simpler)", color: "text-amber-400" },
                { result: "PARTIAL", next: "tutorNode (deeper)", color: "text-amber-400" },
                { result: "DOUBT", next: "doubtNode", color: "text-blue-400" },
              ].map((r) => (
                <div key={r.result} className="flex items-center gap-2">
                  <span className="text-[#4A4A4A]">├─</span>
                  <span className={`font-bold ${r.color}`}>{r.result}</span>
                  <span className="text-[#4A4A4A]">→</span>
                  <span className="text-[#666666]">{r.next}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section id="compare" className="relative z-[1] max-w-6xl mx-auto px-6 pb-24 space-y-8">
        <div className="space-y-3">
          <p className="text-xs text-[#555555] font-mono uppercase tracking-widest">Why NeuralNest</p>
          <h2 className="text-3xl font-black tracking-tight">
            Other tools generate content.{" "}
            <span className="text-[#3B6BFF]">NeuralNest verifies understanding.</span>
          </h2>
        </div>

        <div className="rounded-xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-3 bg-[#1A1F2E] px-6 py-3 text-xs font-mono uppercase tracking-widest text-[#555555]">
            <div className="col-span-1">Capability</div>
            <div className="text-center text-[#3B6BFF]">NeuralNest</div>
            <div className="text-center">Others</div>
          </div>
          {VS_ROWS.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-3 px-6 py-4 text-sm items-center border-t border-white/5 ${i % 2 === 0 ? "bg-[#0d1220]" : "bg-transparent"
                }`}
            >
              <div className="text-slate-300 col-span-1 pr-4">{row.feature}</div>
              <div className="text-center text-xl">{row.nn ? "✓" : "✗"}</div>
              <div className={`text-center text-xl ${row.others ? "text-[#666666]" : "text-[#333333]"}`}>
                {row.others ? "✓" : "✗"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="border-t border-white/10 relative z-[1]" style={{ backgroundColor: isDark ? 'rgba(13,18,32,0.85)' : 'rgba(230,228,220,0.85)' }}>
        <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-6">
          <h2 className="text-4xl font-black tracking-tight">
            Your syllabus is already sitting on your desktop.
          </h2>
          <p className="text-[#666666] text-lg">
            Upload it. Let the agent map what you need to know,
            teach you concept by concept, and tell you exactly when you're ready for the exam.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-4 rounded-xl bg-[#3B6BFF] hover:bg-blue-500 font-bold text-lg transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1"
          >
            Start Learning Free →
          </button>
          <p className="text-xs text-[#4A4A4A]">
            Built on LangGraph · GPT-4o · Cohere · Pinecone
          </p>
        </div>
      </section>

    </div>
  );
}
