import React from 'react';
import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { PushPin } from "../ui/PushPin";

const STEPS = [
  {
    number: "01",
    pinColor: "#e57a5b",
    pinHighlight: "#f4a98e",
    pinShadow: "#b8512e",
    pinRim: "#8c3a1e",
    cardBg: "#fff8f5",
    rotate: "6deg",
    label: "Upload your syllabus",
    detail:
      "NeuralNest extracts every topic, due date, and reading assignment directly from your course materials — PDF, DOCX, or plain text.",
  },
  {
    number: "02",
    pinColor: "#7a90e5",
    pinHighlight: "#a8b8f4",
    pinShadow: "#4a63c8",
    pinRim: "#2e40a0",
    cardBg: "#f5f6ff",
    rotate: "-7deg",
    label: "Agents build your map.",
    detail:
      "Our multi-agent system constructs a dynamic cognitive map, identifying concept dependencies and prerequisite knowledge gaps across your entire curriculum.",
  },
  {
    number: "03",
    pinColor: "#7abbe5",
    pinHighlight: "#a8d8f4",
    pinShadow: "#4a8fb8",
    pinRim: "#2e6a8c",
    cardBg: "#f5fbff",
    rotate: "5deg",
    label: "Get a personalised study plan.",
    detail:
      "Based on your mastery gaps and exam timeline, the AI schedules daily micro-sessions — balancing spaced repetition with your real-world availability.",
  },
  {
    number: "04",
    pinColor: "#e5c07a",
    pinHighlight: "#f4d9a8",
    pinShadow: "#b88c2e",
    pinRim: "#8c6010",
    cardBg: "#fffdf0",
    rotate: "-8deg",
    label: "Learn through dialogue.",
    detail:
      "Chat with your AI tutor in real time. Ask questions, request re-explanations, and get worked examples — all grounded in your specific syllabus.",
  },
  {
    number: "05",
    pinColor: "#b07ae5",
    pinHighlight: "#cea8f4",
    pinShadow: "#7a4ac8",
    pinRim: "#551e9e",
    cardBg: "#faf5ff",
    rotate: "6deg",
    label: "Master the material.",
    detail:
      "As you pass adaptive quizzes, your mastery rating deterministically increases. When you hit 100% on every topic, you are exam-ready — no guesswork.",
  },
];

// Diagonal dashed connectors between consecutive card pairs.
// Left cards pin at ~22% from left; right cards pin at ~78% from left.
const CONNECTORS = [
  { x1: "22%", y1: "0%", x2: "78%", y2: "100%" }, // 01 left  -> 02 right
  { x1: "78%", y1: "0%", x2: "22%", y2: "100%" }, // 02 right -> 03 left
  { x1: "22%", y1: "0%", x2: "78%", y2: "100%" }, // 03 left  -> 04 right
  { x1: "78%", y1: "0%", x2: "22%", y2: "100%" }, // 04 right -> 05 left
];

export default function HorizontalScrollSteps() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ruleColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const connectorColor = isDark ? "rgba(255,255,255,0.3)" : "#9b9690";

  return (
    <section
      id="how"
      className="relative z-[1] py-24 px-6 overflow-hidden"
    >

      {/* Section header */}
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

      {/* Timeline */}
      <div className="relative max-w-4xl mx-auto" style={{ zIndex: 1 }}>
        <div className="flex flex-col gap-12 md:gap-0">
          {STEPS.map((step, i) => {
            const isLeft = i % 2 === 0;
            const connector = CONNECTORS[i];
            return (
              <div key={step.number} className="relative">

                {/* Card row */}
                <div
                  className={`relative z-10 flex flex-col md:flex-row ${isLeft ? "md:justify-start" : "md:justify-end"
                    } ${i > 0 ? "md:-mt-16" : ""}`}
                >
                  <div className="relative w-full md:w-[45%] max-w-[420px]">
                    {/* 3D Push Pin */}
                    <div
                      className="absolute z-50 pointer-events-none"
                      style={{
                        top: "-24px",
                        left: "50%",
                        transform: "translateX(-50%) ",
                        transformOrigin: "bottom center",
                      }}
                    >
                      <PushPin color={step.pinColor} className="w-[72px] h-[72px]" />
                    </div>

                    <motion.div
                      whileHover={{ rotate: 0, scale: 1.03, transition: { duration: 0.2 } }}
                      className="w-full rounded-3xl p-3 pt-14 relative bg-white dark:bg-[#222222] cursor-pointer"
                      style={{
                        border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.08)",
                        boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(0,0,0,0.06)",
                        rotate: isMobile ? "0deg" : step.rotate,
                        transformOrigin: "center top",
                      }}
                    >
                      {/* Inner coloured card */}
                      <div
                        className="rounded-2xl p-6"
                        style={{ backgroundColor: step.cardBg }}
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

                {/* Curved dashed connector to next card — desktop only */}
                {connector && !isMobile && (
                  <div
                    className="hidden md:block absolute pointer-events-none"
                    style={{
                      left: 0, right: 0,
                      top: "60%",
                      height: "160px",
                      zIndex: 0,
                    }}
                    aria-hidden="true"
                  >
                    <svg
                      width="100%" height="100%"
                      viewBox="0 0 800 160"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <path
                        d={isLeft
                          ? "M 180,0 Q 400,-40 620,160"
                          : "M 620,0 Q 400,-40 180,160"
                        }
                        fill="none"
                        stroke={connectorColor}
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
    </section>
  );
}
