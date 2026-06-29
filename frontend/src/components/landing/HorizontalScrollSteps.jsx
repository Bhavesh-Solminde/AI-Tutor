import React from 'react';
import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

const STEPS = [
  {
    number: "01",
    pinColor: "#e57a5b",
    pinHighlight: "#f4a98e",
    pinShadow: "#b8512e",
    cardBg: "#fff8f5",
    cardBgDark: "#221915",
    rotate: "-2.5deg",
    label: "Upload your syllabus",
    detail:
      "NeuralNest extracts every topic, due date, and reading assignment directly from your course materials.",
    tag: "topicExtractor.ts → Pinecone",
  },
  {
    number: "02",
    pinColor: "#7a90e5",
    pinHighlight: "#a8b8f4",
    pinShadow: "#4a63c8",
    cardBg: "#f5f6ff",
    cardBgDark: "#161826",
    rotate: "1.8deg",
    label: "Agents build your map.",
    detail:
      "Our multi-agent system constructs a dynamic cognitive map, identifying dependencies and pre-requisite knowledge gaps.",
    tag: "router → tutorNode → gradeNode",
  },
  {
    number: "03",
    pinColor: "#7abbe5",
    pinHighlight: "#a8d8f4",
    pinShadow: "#4a8fb8",
    cardBg: "#f5fbff",
    cardBgDark: "#131d2b",
    rotate: "-1.5deg",
    label: "Master the material.",
    detail:
      "As you learn and pass adaptive quizzes, your mastery rating deterministically increases until you're ready for the exam.",
    tag: "masteryCalculator.ts · no LLM",
  },
];

export default function HorizontalScrollSteps() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      id="how"
      className="relative py-24 px-6 overflow-hidden bg-[#f6f5f1] dark:bg-[#181818]"
    >
      {/* ── Section header ── */}
      <div className="text-center mb-20">
        <p
          className="text-xs font-mono uppercase tracking-widest mb-3"
          style={{ color: "#9b8f7e" }}
        >
          How it works
        </p>
        <h2
          className="font-display text-4xl font-black tracking-tight text-[#1a1a1a] dark:text-white"
        >
          Three steps. One agent loop.
        </h2>
      </div>

      {/* ── Timeline ── */}
      <div className="relative max-w-4xl mx-auto">

        {/* Curved connecting line (hidden on mobile) */}
        <svg
          className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ zIndex: 0 }}
        >
          <path
            d="M 22.5,12 Q 50,31 77.5,50 T 22.5,88"
            fill="none"
            stroke={isDark ? "rgba(255, 255, 255, 0.15)" : "#c8c4ba"}
            strokeWidth="0.25"
            strokeDasharray="1.2,1.2"
          />
        </svg>

        <div className="flex flex-col gap-12 md:gap-0">
          {STEPS.map((step, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div
                key={step.number}
                className={`relative z-10 flex flex-col md:flex-row ${
                  isLeft ? "md:justify-start" : "md:justify-end"
                } ${i > 0 ? "md:-mt-20" : ""}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ rotate: 0, scale: 1.02, transition: { duration: 0.25 } }}
                  className="w-full md:w-[45%] max-w-[420px] rounded-3xl p-3 pt-12 relative bg-white dark:bg-[#222222] cursor-default"
                  style={{
                    border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.08)",
                    boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(0,0,0,0.08)",
                    rotate: step.rotate,
                    transformOrigin: "center top",
                  }}
                >
                  {/* 3D Pin attached to the white outer card header */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: `radial-gradient(circle at 35% 35%, ${step.pinHighlight}, ${step.pinColor} 60%, ${step.pinShadow} 100%)`,
                        boxShadow: `0 4px 10px ${step.pinColor}66, inset 0 -2px 4px rgba(0,0,0,0.2)`,
                      }}
                    />
                  </div>

                  {/* Inner colored card */}
                  <div
                    className="rounded-2xl p-6"
                    style={{
                      backgroundColor: isDark ? step.cardBgDark : step.cardBg,
                    }}
                  >
                    {/* Step number — handwritten style */}
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

                    {/* Heading */}
                    <h3
                      className="text-xl font-bold mb-3 text-[#1a1a1a] dark:text-white"
                    >
                      {step.label}
                    </h3>

                    {/* Body */}
                    <p
                      className="text-sm leading-relaxed text-[#555555] dark:text-slate-300"
                    >
                      {step.detail}
                    </p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
