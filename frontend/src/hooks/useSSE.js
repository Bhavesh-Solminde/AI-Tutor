import { useState, useCallback } from 'react';

export const useSSE = () => {
  const [streamData, setStreamData] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = useCallback((fullText, callback) => {
    setStreamData('');
    setIsStreaming(true);
    
    const words = fullText.split(' ');
    let currentIdx = 0;
    let accumulatedText = '';

    const timer = setInterval(() => {
      if (currentIdx < words.length) {
        accumulatedText += (currentIdx === 0 ? '' : ' ') + words[currentIdx];
        setStreamData(accumulatedText);
        if (callback) callback(accumulatedText);
        currentIdx++;
      } else {
        clearInterval(timer);
        setIsStreaming(false);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return { streamData, isStreaming, startStream };
};
export default useSSE;
