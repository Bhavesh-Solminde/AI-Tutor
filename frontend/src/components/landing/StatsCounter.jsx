import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const AnimatedCounter = ({ from, to, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    
    let startTime;
    let animationFrame;

    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        // easeOutQuart
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(from + (to - from) * easeProgress));
        animationFrame = requestAnimationFrame(updateCount);
      } else {
        setCount(to);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [inView, from, to, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const StatsCounter = () => {
  const stats = [
    { value: 1200000, suffix: '+', label: 'Knowledge Nodes Mapped', description: 'Concepts linked dynamically across all student courses.' },
    { value: 98, suffix: '%', label: 'Rescue Pass Rate', description: 'Students who passed their exam after using Rescue Mode.' },
    { value: 15000, suffix: '+', label: 'Hours of Cramming Saved', description: 'Time reclaimed by focusing on strictly necessary material.' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section className="py-24 px-6 relative z-10 bg-transparent border-y border-[#EAE8E1] dark:border-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-[#EAE8E1] dark:divide-white/10"
        >
          {stats.map((stat, i) => (
            <motion.div key={i} variants={itemVariants} className="pt-8 md:pt-0 md:px-8 first:md:pl-0 last:md:pr-0 flex flex-col items-center md:items-start text-center md:text-left">
              <h3 className="font-display text-5xl md:text-6xl font-black text-[#333333] dark:text-white tracking-tighter mb-4 tabular-nums">
                <AnimatedCounter from={0} to={stat.value} suffix={stat.suffix} />
              </h3>
              <p className="text-xl font-bold text-[#4A4A4A] dark:text-slate-200 mb-2">{stat.label}</p>
              <p className="text-[#4A4A4A] dark:text-[#666666]">{stat.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsCounter;
