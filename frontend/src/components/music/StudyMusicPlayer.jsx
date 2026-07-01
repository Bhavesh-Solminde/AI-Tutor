import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, ChevronDown, ChevronUp, X, Music,
  Headphones, Piano, Trees, CloudRain, Wind, Radio, Volume2, VolumeX,
} from 'lucide-react';
import useMusicStore, { STUDY_GENRES } from '../../stores/useMusicStore';

// ── Genre → Lucide icon map ───────────────────────────────────────────────────
const GENRE_ICONS = {
  lofi: Headphones,
  classical: Piano,
  natural: Trees,
  natural_rain: CloudRain,
  ambient: Wind,
};

// ── Waveform bars animation ───────────────────────────────────────────────────
const WaveformBars = ({ active, color = '#C4A882' }) => (
  <div className="flex items-end gap-[2.5px]" style={{ height: 18 }}>
    {[0.55, 1, 0.65, 0.9, 0.5].map((h, i) => (
      <motion.div
        key={i}
        style={{ backgroundColor: color, height: 18 * h, width: 3, borderRadius: 99, originY: 1 }}
        animate={active
          ? { scaleY: [1, 1.6, 0.8, 1.4, 1], opacity: 1 }
          : { scaleY: 0.3, opacity: 0.4 }}
        transition={active 
          ? { duration: 0.85 + i * 0.15, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }
          : { duration: 0.3, ease: 'easeOut' }}
      />
    ))}
  </div>
);

// ── YouTube IFrame Player (youtube-nocookie.com) ──────────────────────────────
// Single persistent player instance — uses loadVideoById when genre changes
const useYouTubePlayer = ({ containerId, videoId, isPlaying, volume, onReady }) => {
  const playerRef = useRef(null);
  const readyRef = useRef(false);
  const prevVideoId = useRef(null);
  // isSwitching: true while loadVideoById transition is in progress.
  // Prevents the isPlaying sync effect from calling pauseVideo() during the
  // brief window when YouTube fires PAUSED for the old video before PLAYING fires.
  const isSwitching = useRef(false);
  // userPaused: true when the user deliberately hit pause.
  // Blocks YouTube's automatic re-PLAYING event (triggered on tab visibility restore)
  // from overriding the user's explicit pause state.
  const userPaused = useRef(false);
  const play = useMusicStore((s) => s.play);
  const pause = useMusicStore((s) => s.pause);

  // Load YouTube IFrame API script once globally
  useEffect(() => {
    if (window.YT?.Player) return;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }, []);

  // ── Create the player ONCE on mount ──────────────────────────────────────
  useEffect(() => {
    const init = () => {
      playerRef.current = new window.YT.Player(containerId, {
        host: 'https://www.youtube-nocookie.com',
        videoId,
        width: '1',
        height: '1',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            readyRef.current = true;
            prevVideoId.current = videoId;
            e.target.setVolume(volume);
            // Only start playback if the store says we should be playing.
            // Don't blindly call playVideo() — the user may have paused before
            // the player finished initialising (or on player recreation).
            if (isPlaying) {
              e.target.playVideo();
            } else {
              userPaused.current = true; // treat as user-paused from the start
            }
            onReady?.();
          },
          onStateChange: (e) => {
            const YTState = window.YT?.PlayerState;
            if (!YTState) return;
            if (e.data === YTState.PLAYING) {
              isSwitching.current = false; // transition complete
              // If user deliberately paused, YouTube may auto-resume on tab switch —
              // cancel it immediately and keep the store in paused state.
              if (userPaused.current) {
                playerRef.current?.pauseVideo?.();
                return;
              }
              play();
            } else if (e.data === YTState.PAUSED || e.data === YTState.ENDED) {
              // Ignore PAUSED fired during a genre switch — it's from the old video
              if (!isSwitching.current) pause();
            }
          },
        },
      });
    };

    if (window.YT?.Player) init();
    else window.onYouTubeIframeAPIReady = init;

    return () => {
      readyRef.current = false;
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  // ── Switch video when genre changes (no player teardown) ─────────────────
  useEffect(() => {
    if (!readyRef.current || !playerRef.current) return;
    if (videoId === prevVideoId.current) return;
    prevVideoId.current = videoId;
    isSwitching.current = true;  // block pause() until new video fires PLAYING
    userPaused.current = false;  // genre switch always plays the new track
    playerRef.current.loadVideoById({ videoId });
  }, [videoId]);

  // ── Sync user play/pause button → player (skip during transitions) ────────
  useEffect(() => {
    if (!readyRef.current || !playerRef.current) return;
    if (isSwitching.current) return; // loadVideoById handles playback itself
    if (isPlaying) {
      userPaused.current = false;
      playerRef.current.playVideo?.();
    } else {
      userPaused.current = true;   // user explicitly paused — block YouTube auto-resume
      playerRef.current.pauseVideo?.();
    }
  }, [isPlaying]);

  // ── Sync volume ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!readyRef.current || !playerRef.current) return;
    playerRef.current.setVolume?.(volume);
  }, [volume]);
};

// ── Player container (mounts when open) ──────────────────────────────────────
const AudioCore = ({ videoId, isPlaying, volume, onReady }) => {
  useYouTubePlayer({ containerId: 'yt-music-player-el', videoId, isPlaying, volume, onReady });
  return (
    <div
      style={{ position: 'fixed', width: 1, height: 1, bottom: 0, right: 0, zIndex: 1, opacity: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <div id="yt-music-player-el" />
    </div>
  );
};

// ── Main floating UI ──────────────────────────────────────────────────────────
const StudyMusicPlayer = () => {
  const {
    isOpen, isPlaying, isMinimized, currentGenre, volume,
    hasEverPlayed,
    openPlayer, closePlayer, toggleMinimize,
    togglePlay, setGenre, setVolume,
  } = useMusicStore();

  const [playerReady, setPlayerReady] = useState(false);
  const [showVol, setShowVol] = useState(false);

  const handleGenreSelect = useCallback((genre) => {
    setGenre(genre); // setPlayerReady stays true — player never un-readies on switch
  }, [setGenre]);

  return (
    <>
      {/* YouTube player (always mounted when open so music continues on minimize) */}
      {isOpen && (
        <AudioCore
          videoId={currentGenre.videoId}
          isPlaying={isPlaying}
          volume={volume}
          onReady={() => setPlayerReady(true)}
        />
      )}

      {/* ── FAB — shown when player is closed ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="fab-wrapper"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="fixed bottom-6 right-6 z-[9990] flex items-center gap-3"
          >
            {/* "Click anywhere" hint — only visible before first play */}
            {!hasEverPlayed && (
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl
                  bg-[#F6F5F1]/90 dark:bg-[#2A2A2A]/90 backdrop-blur-md
                  border border-[#EAE8E1] dark:border-[#444444]
                  shadow-lg pointer-events-none"
              >
                <p className="text-[11px] font-medium text-[#555555] dark:text-[#AAAAAA] whitespace-nowrap">
                  Click anywhere to start music
                </p>
              </motion.div>
            )}

            <button
              onClick={openPlayer}
              title="Study Music"
              className="w-14 h-14 rounded-full flex-shrink-0
                bg-[#F6F5F1] dark:bg-[#2A2A2A] border border-[#EAE8E1] dark:border-[#444444]
                shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95
                transition-all duration-200 flex items-center justify-center"
            >
              <Music className="h-5 w-5 text-[#333333] dark:text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Player card ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="player-card"
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed bottom-6 right-6 z-[9990] w-[340px] rounded-2xl overflow-hidden
              bg-[#F6F5F1]/96 dark:bg-[#222222]/96 backdrop-blur-xl
              border border-[#EAE8E1] dark:border-[#383838] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE8E1] dark:border-[#383838]">
              <div className="flex items-center gap-3">
                <WaveformBars active={isPlaying && playerReady} color={currentGenre.color} />
                <div>
                  <p className="text-[11px] font-bold text-[#333333] dark:text-white leading-none">Study Music</p>
                  <p className="text-[10px] text-[#666666] dark:text-[#888888] mt-0.5">{currentGenre.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={toggleMinimize} className="p-1.5 rounded-lg hover:bg-[#EAE8E1] dark:hover:bg-[#383838] transition-colors text-[#666666] dark:text-[#888888]">
                  {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <button onClick={closePlayer} className="p-1.5 rounded-lg hover:bg-[#EAE8E1] dark:hover:bg-[#383838] transition-colors text-[#666666] dark:text-[#888888]">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <AnimatePresence initial={false}>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  {/* Genre grid */}
                  <div className="px-4 pt-4 pb-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555] mb-3">Choose Vibe</p>
                    <div className="grid grid-cols-3 gap-2">
                      {STUDY_GENRES.map((genre) => {
                        const active = currentGenre.id === genre.id;
                        const Icon = GENRE_ICONS[genre.id] || Radio;
                        return (
                          <button
                            key={genre.id}
                            onClick={() => handleGenreSelect(genre)}
                            className={`flex flex-col items-center gap-2 px-2 py-3 rounded-xl border text-center transition-all duration-200 ${
                              active
                                ? 'border-[#C4A882] bg-[#EAE8E1] dark:bg-[#2A2A2A] dark:border-[#555555] shadow-sm'
                                : 'border-[#EAE8E1] dark:border-[#333333] hover:border-[#C4A882]/60 hover:bg-white/80 dark:hover:bg-[#2A2A2A]/60'
                            }`}
                          >
                            {genre.id === 'neural' ? (
                              <img 
                                src="/logo_without_text.png" 
                                alt="Neural" 
                                className={`h-4 w-4 object-contain transition-all duration-200 ${!active ? 'opacity-50 grayscale dark:invert dark:brightness-200' : 'dark:invert dark:brightness-200'}`} 
                              />
                            ) : (
                              <Icon className="h-4 w-4" style={{ color: active ? genre.color : '#888888' }} />
                            )}
                            <span className="text-[9px] font-semibold text-[#555555] dark:text-[#888888] leading-tight">
                              {genre.id === 'natural_rain' ? 'Rain' : genre.label.replace(' Hip Hop', '')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-3 px-4 py-3 border-t border-[#EAE8E1] dark:border-[#383838]">
                    {/* Play/Pause */}
                    <button
                      onClick={togglePlay}
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                        bg-[#333333] dark:bg-white shadow-md hover:scale-110 active:scale-95 transition-all"
                    >
                      {isPlaying
                        ? <Pause className="h-4 w-4 text-white dark:text-[#333333]" />
                        : <Play className="h-4 w-4 text-white dark:text-[#333333] ml-0.5" />}
                    </button>

                    {/* Now playing */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] uppercase tracking-widest text-[#AAAAAA] font-semibold">Now Playing</p>
                      <p className="text-xs font-semibold text-[#333333] dark:text-white truncate mt-0.5">
                        {playerReady ? currentGenre.description : 'Loading…'}
                      </p>
                    </div>

                    {/* Volume slider */}
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setShowVol((v) => !v)}
                        className="p-2 rounded-lg hover:bg-[#EAE8E1] dark:hover:bg-[#383838] transition-colors"
                      >
                        {volume === 0
                          ? <VolumeX className="h-4 w-4 text-[#AAAAAA]" />
                          : <Volume2 className="h-4 w-4 text-[#AAAAAA]" />}
                      </button>
                      <AnimatePresence>
                        {showVol && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            className="absolute bottom-10 right-0 px-3 py-3 rounded-xl shadow-xl
                              bg-white dark:bg-[#2A2A2A] border border-[#EAE8E1] dark:border-[#383838]"
                          >
                            <input
                              type="range" min={0} max={100} value={volume}
                              onChange={(e) => setVolume(Number(e.target.value))}
                              className="w-24 h-1 accent-[#333333] dark:accent-white cursor-pointer"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <p className="text-center text-[9px] text-[#CCCCCC] dark:text-[#555555] pb-3">
                    Powered by YouTube · Privacy-enhanced embed
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StudyMusicPlayer;
