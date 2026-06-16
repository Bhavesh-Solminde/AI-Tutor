import { useState, useEffect, useRef } from 'react';

const useTimer = (initialSeconds = 60, onExpire) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    setSeconds(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isActive) return;

    if (seconds <= 0) {
      if (onExpire) {
        onExpire();
      }
      setIsActive(false);
      return;
    }

    timerRef.current = setTimeout(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [seconds, isActive, onExpire]);

  const pause = () => setIsActive(false);
  const resume = () => setIsActive(true);
  const reset = (newSeconds = initialSeconds) => {
    setSeconds(newSeconds);
    setIsActive(true);
  };

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return {
    seconds,
    isActive,
    pause,
    resume,
    reset,
    formatTime,
  };
};

export default useTimer;
