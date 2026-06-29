import useAutoplay from './useAutoplay';
import { NATURE_GENRE } from '../stores/useMusicStore';

/**
 * Convenience wrapper — autoplays nature sounds on the first user interaction.
 * Used by Tutor, Quiz, and all logged-in pages via MainLayout.
 */
const useAutoplayNature = () => useAutoplay(NATURE_GENRE);

export default useAutoplayNature;
