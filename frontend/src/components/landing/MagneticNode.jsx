import React, { useRef, useState, useEffect } from 'react';

// ─── Spring Physics & 3D Tilt Hook ───
export const useMouseTilt = (config = { maxTilt: 15, springDamping: 0.1 }) => {
  const ref = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)' });

  useEffect(() => {
    const isHoverableDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isHoverableDevice || prefersReducedMotion) return;

    const el = ref.current;
    if (!el) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrameId;

    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      targetX = ((x - centerX) / centerX) * config.maxTilt;
      targetY = ((y - centerY) / centerY) * -config.maxTilt;
    };

    const onMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const update = () => {
      currentX += (targetX - currentX) * config.springDamping;
      currentY += (targetY - currentY) * config.springDamping;
      setTiltStyle({
        transform: `perspective(1000px) rotateX(${currentY}deg) rotateY(${currentX}deg) scale3d(1.05, 1.05, 1.05)`,
        transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      });

      if (Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1 && targetX === 0) {
        setTiltStyle({
          transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
      } else {
        animationFrameId = requestAnimationFrame(update);
      }
    };

    const onMouseEnter = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(update);
    };

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseenter', onMouseEnter);

    return () => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [config.maxTilt, config.springDamping]);

  return { ref, tiltStyle };
};

export const MagneticNode = ({ children, className }) => {
  const { ref, tiltStyle } = useMouseTilt({ maxTilt: 10, springDamping: 0.15 });
  return (
    <div ref={ref} className={`${className} will-change-transform`} style={tiltStyle}>
      {children}
    </div>
  );
};
