import { create } from 'zustand';

// Curated long-form study music — played via youtube-nocookie.com (no tracking, minimal ads)
export const STUDY_GENRES = [
  {
    id: 'lofi',
    label: 'Lo-Fi Hip Hop',
    description: 'Chill beats for deep focus',
    videoId: 'lTRiuFIWV54',
    color: '#C4A882',
  },
  {
    id: 'classical',
    label: 'Classical',
    description: 'Mozart, Bach & Beethoven',
    videoId: 'jgpJVI3tDbY',
    color: '#B8A99A',
  },
  {
    id: 'nature',
    label: 'Nature Sounds',
    description: 'Rain, forest & ocean ambience',
    videoId: 'eKFTSSKCzWA',
    color: '#8FAF8F',
  },
  {
    id: 'binaural',
    label: 'Binaural Beats',
    description: 'Deep focus alpha waves',
    videoId: 'WPni755-Krg',
    color: '#9B8EC4',
  },
  {
    id: 'jazz',
    label: 'Jazz',
    description: 'Smooth jazz for studying',
    videoId: 'Dx5qFachd3A',
    color: '#C49A6C',
  },
  {
    id: 'ambient',
    label: 'Ambient',
    description: 'Space & atmospheric sounds',
    videoId: 'UfcAVejslrU',
    color: '#7A9BBF',
  },
];

export const NATURE_GENRE    = STUDY_GENRES.find((g) => g.id === 'nature');
export const CLASSICAL_GENRE = STUDY_GENRES.find((g) => g.id === 'classical');

const useMusicStore = create((set, get) => ({
  isOpen: false,
  isPlaying: false,
  isMinimized: true,
  currentGenre: NATURE_GENRE,
  volume: 60,
  hasEverPlayed: false,
  // userClosedPlayer: true means the user explicitly hit X — respect their choice
  // and don't auto-trigger again until they manually open it.
  userClosedPlayer: false,

  // Manual open via the music icon — resets userClosedPlayer
  openPlayer: () => set({ isOpen: true, isMinimized: false, isPlaying: true, hasEverPlayed: true, userClosedPlayer: false }),

  // X button — mark as intentionally closed
  closePlayer: () => set({ isOpen: false, isPlaying: false, userClosedPlayer: true }),

  toggleMinimize: () => set((s) => ({ isMinimized: !s.isMinimized })),

  play:       () => set({ isPlaying: true, hasEverPlayed: true }),
  pause:      () => set({ isPlaying: false }),
  togglePlay: () => set((s) => {
    const nextPlaying = !s.isPlaying;
    return { isPlaying: nextPlaying, hasEverPlayed: nextPlaying ? true : s.hasEverPlayed };
  }),

  setGenre:  (genre) => set({ currentGenre: genre, isPlaying: true, isOpen: true, isMinimized: false, hasEverPlayed: true }),
  setVolume: (v)     => set({ volume: v }),

  /**
   * Trigger autoplay for a specific genre on first user interaction.
   * Does nothing if:
   *  - Music is already playing
   *  - The user has explicitly closed the player
   */
  autoplay: (genre) => {
    const { isPlaying, userClosedPlayer } = get();
    if (isPlaying || userClosedPlayer) return;
    set({
      isOpen: true,
      isPlaying: true,
      isMinimized: true,
      currentGenre: genre,
    });
  },
}));

export default useMusicStore;
