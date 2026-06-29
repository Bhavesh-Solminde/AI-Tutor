import { useEffect } from 'react';
import useMusicStore from '../stores/useMusicStore';

/**
 * Call this hook at the top of any page that should autoplay nature sounds.
 * It silently opens the player in minimised mode and starts playing.
 * If the user has already started music manually, it does nothing.
 */
const useAutoplayNature = () => {
  const autoplayNature = useMusicStore((s) => s.autoplayNature);

  useEffect(() => {
    autoplayNature();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useAutoplayNature;
