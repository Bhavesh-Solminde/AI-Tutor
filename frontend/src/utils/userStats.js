export const getStudyStreakDays = (studyDays = []) => {
  if (!Array.isArray(studyDays) || studyDays.length === 0) return 0;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  return studyDays.filter((studyDay) => {
    const day = new Date(studyDay);
    return !Number.isNaN(day.getTime()) && day >= weekAgo;
  }).length;
};

export const getCompletedTopicsCount = ({ mastered = 0, topics = [] } = {}) => {
  if (typeof mastered === 'number') return mastered;
  if (Array.isArray(topics)) return topics.filter((topic) => topic?.status === 'mastered').length;
  return 0;
};
