import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

const Testimonials = () => {
  const containerRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Vertical parallax to avoid horizontal overlap on small screens
  const yUp = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const yDown = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  const testimonials = [
    { name: 'Sarah M.', role: 'Computer Science Major', text: 'The Exam Rescue mode saved my OS grade. I uploaded my syllabus 2 days before the exam, and it gave me exactly what I needed to pass. It is like magic.' },
    { name: 'Michael T.', role: 'Pre-Med Student', text: 'I use NeuralNest for Organic Chemistry. The AI tutor explains complex reactions with analogies that actually make sense to me. Best study app I have ever used.' },
    { name: 'Emily R.', role: 'High School Senior', text: 'The visual roadmap keeps me sane during AP exam season. Seeing the nodes turn green gives me so much dopamine. I actually look forward to studying now.' },
  ];

  return (
    <section ref={containerRef} id="testimonials" className="py-24 px-6 relative z-10 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-[#333333] dark:text-white mb-16 md:w-1/2"
        >
          Real learners. Real mastery.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 mt-10">
          {testimonials.map((testimonial, idx) => {
            const y = reduceMotion ? 0 : (idx === 1 ? yDown : yUp);
            return (
              <motion.div
                key={idx}
                style={{ y }}
                className="flex flex-col"
              >
                <div className="rounded-2xl border border-[#EAE8E1] dark:border-white/8 bg-white dark:bg-[#121622] p-6 h-full flex flex-col justify-between hover:border-primary/40 transition-colors duration-300 group">
                  <p className="text-base md:text-lg text-[#4A4A4A] dark:text-slate-300 leading-relaxed mb-6 font-medium">"{testimonial.text}"</p>
                  <div>
                    <h5 className="font-bold text-[#333333] dark:text-white text-sm group-hover:text-primary transition-colors">{testimonial.name}</h5>
                    <p className="text-xs text-[#4A4A4A] mt-0.5">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
