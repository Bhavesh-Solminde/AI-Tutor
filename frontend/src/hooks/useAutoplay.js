import { useEffect } from 'react';
import useMusicStore from '../stores/useMusicStore';

/**
 * Autoplays the given genre on the FIRST user interaction (click / keydown / touch).
 * Browsers block true audio autoplay until there has been at least one user gesture.
 * Once triggered, removes the listeners so it only fires once per page mount.
 * Respects userClosedPlayer — won't re-trigger if the user explicitly closed it.
 *
 * @param {object} genre - One of the STUDY_GENRES objects from useMusicStore
 */
const useAutoplay = (genre) => {
  const autoplay = useMusicStore((s) => s.autoplay);

  useEffect(() => {
    const trigger = () => {
      autoplay(genre);
      // Once triggered, remove all listeners
      document.removeEventListener('click',      trigger, true);
      document.removeEventListener('keydown',    trigger, true);
      document.removeEventListener('touchstart', trigger, true);
    };

    // Use capture phase so we get the event before any stopPropagation calls
    document.addEventListener('click',      trigger, { once: true, capture: true });
    document.addEventListener('keydown',    trigger, { once: true, capture: true });
    document.addEventListener('touchstart', trigger, { once: true, capture: true });

    return () => {
      document.removeEventListener('click',      trigger, true);
      document.removeEventListener('keydown',    trigger, true);
      document.removeEventListener('touchstart', trigger, true);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useAutoplay;
