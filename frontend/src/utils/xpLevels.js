/**
 * XP-based level system.
 * Maps total XP to a named level title with emoji and color.
 */

const LEVELS = [
  { threshold: 5000, title: 'Grand Master', emoji: '👑', color: 'text-purple-500' },
  { threshold: 3000, title: 'Expert Scholar', emoji: '🏆', color: 'text-amber-500' },
  { threshold: 1500, title: 'Advanced Learner', emoji: '🎓', color: 'text-blue-500' },
  { threshold: 500,  title: 'College Scholar', emoji: '📚', color: 'text-emerald-500' },
  { threshold: 100,  title: 'Rising Student', emoji: '⭐', color: 'text-cyan-500' },
  { threshold: 0,    title: 'Novice', emoji: '🌱', color: 'text-[#666666]' },
];

export function getXpLevel(totalXp) {
  for (const level of LEVELS) {
    if (totalXp >= level.threshold) return level;
  }
  return LEVELS[LEVELS.length - 1];
}

export function getNextLevel(totalXp) {
  const currentIndex = LEVELS.findIndex((l) => totalXp >= l.threshold);
  if (currentIndex <= 0) return null; // Already at max level
  const next = LEVELS[currentIndex - 1];
  return { xpNeeded: next.threshold - totalXp, threshold: next.threshold, title: next.title };
}
