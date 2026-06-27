import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import RunawayButton from './RunawayButton';

const FinalCTA = () => {
  const headline = "Your exam isn't going to study for itself.";
  const words = headline.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <section className="py-24 px-6 relative z-50">
      <div className="max-w-5xl mx-auto rounded-3xl bg-slate-50 dark:bg-[#121622] border border-slate-200 dark:border-white/5 text-center p-12 md:p-20 relative shadow-sm dark:shadow-none overflow-hidden group">
        
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 dark:from-primary/10 to-transparent pointer-events-none rounded-3xl" />
        
        {/* "Moving Border" simulated with a rotating gradient background behind a slightly smaller inner mask, or just a glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-[radial-gradient(circle_at_50%_120%,rgba(59,107,255,0.1),transparent)] pointer-events-none rounded-3xl" />

        <div className="relative z-10">
          
          <motion.h2 
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 text-center"
          >
            {words.map((word, index) => (
              <motion.span variants={child} key={index} className="inline-block mr-3 mb-2">
                {word}
                {word === "to" && <br className="hidden md:block"/>}
              </motion.span>
            ))}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-slate-600 dark:text-slate-400 text-lg mb-10 max-w-xl mx-auto"
          >
            Stop cramming and start mastering. Free to start. No credit card required.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5, type: "spring", bounce: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-[0_0_30px_-5px_rgba(59,107,255,0.4)] hover:shadow-[0_0_40px_-5px_rgba(59,107,255,0.6)] hover:-translate-y-0.5 flex items-center justify-center text-center group/btn relative overflow-hidden">
              <span className="relative z-10">Start Learning Free</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>
            <RunawayButton />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
