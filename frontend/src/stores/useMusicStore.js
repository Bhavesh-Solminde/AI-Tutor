import { create } from 'zustand';

// Curated long-form study music — played via youtube-nocookie.com (no tracking, minimal ads)
export const STUDY_GENRES = [
  {
    id: 'lofi',
    label: 'Lo-Fi Hip Hop',
    description: 'Chill beats for deep focus',
    videoId: 'lTRiuFIWV54',  // Lo-Fi Hip Hop study mix
    color: '#C4A882',
  },
  {
    id: 'classical',
    label: 'Classical',
    description: 'Mozart, Bach & Beethoven',
    videoId: 'jgpJVI3tDbY',  // Classical Music For Studying & Brain Power — 3hr upload
    color: '#B8A99A',
  },
  {
    id: 'nature',
    label: 'Nature Sounds',
    description: 'Rain, forest & ocean ambience',
    videoId: 'eKFTSSKCzWA',  // Relaxing Nature Sounds
    color: '#8FAF8F',
    autoplayOnStudy: true,
  },
  {
    id: 'binaural',
    label: 'Binaural Beats',
    description: 'Deep focus alpha waves',
    videoId: 'WPni755-Krg',  // Binaural Beats for Focus
    color: '#9B8EC4',
  },
  {
    id: 'jazz',
    label: 'Jazz',
    description: 'Smooth jazz for studying',
    videoId: 'Dx5qFachd3A',  // Jazz Café Music
    color: '#C49A6C',
  },
  {
    id: 'ambient',
    label: 'Ambient',
    description: 'Space & atmospheric sounds',
    videoId: 'UfcAVejslrU',  // Deep Ambient Music
    color: '#7A9BBF',
  },
];

const NATURE_GENRE = STUDY_GENRES.find((g) => g.id === 'nature');

const useMusicStore = create((set, get) => ({
  isOpen: false,
  isPlaying: false,
  isMinimized: true,
  currentGenre: NATURE_GENRE,
  volume: 60,

  openPlayer: () => set({ isOpen: true, isMinimized: false, isPlaying: true }),
  closePlayer: () => set({ isOpen: false, isPlaying: false }),
  toggleMinimize: () => set((s) => ({ isMinimized: !s.isMinimized })),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  setGenre: (genre) => set({ currentGenre: genre, isPlaying: true, isOpen: true, isMinimized: false }),
  setVolume: (v) => set({ volume: v }),

  autoplayNature: () => {
    const { isPlaying } = get();
    if (!isPlaying) {
      set({ isOpen: true, isPlaying: true, isMinimized: true, currentGenre: NATURE_GENRE });
    }
  },
}));

export default useMusicStore;
