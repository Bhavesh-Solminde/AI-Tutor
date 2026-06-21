import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axiosClient';
import toast from 'react-hot-toast';
import useSessionStore from './useSessionStore';
import useProgressStore from './useProgressStore';
import useAuthStore from './useAuthStore';

const useQuizStore = create(
  persist(
    (set, get) => ({
      questions: [],
      timeLimit: 600,
      loading: false,
      submitting: false,
      error: null,
      result: null,        // Last quiz submit result (mastery, XP, etc.)
      quizHistory: [],
      activeQuizzes: [],

      // Generate 10 questions from backend
      generateQuiz: async (topicId) => {
        set({ loading: true, error: null, questions: [], result: null });
        try {
          const { data } = await api.post('/api/quiz/generate', { topicId });
          if (!data.questions || data.questions.length === 0) {
            throw new Error('No questions returned from AI. Please try again.');
          }
          set({
            questions: data.questions,
            timeLimit: data.timeLimit || 600,
            loading: false,
          });
          return data;
        } catch (err) {
          const msg = err.userMessage || err.message || "Couldn't generate quiz questions. The AI is busy — try again.";
          set({ loading: false, error: msg });
          throw err;
        }
      },

      // Submit quiz answers
      submitQuiz: async ({ topicId, answers, questions, selfRatingAfter = 5, sessionDurationMinutes = 15, examDate, timeTaken = 0 }) => {
        set({ submitting: true, error: null });
        try {
          const { data } = await api.post('/api/quiz/submit', {
            topicId, answers, questions, selfRatingAfter, sessionDurationMinutes, examDate, timeTaken,
          });
          set({ result: data, submitting: false });

          // Invalidate roadmap so mastery % updates immediately when user navigates back
          const { fetchRoadmap, currentSession } = useSessionStore.getState();
          if (currentSession?._id) {
            fetchRoadmap(currentSession._id).catch(() => {});
          }
          // Also refresh progress store so Dashboard stays in sync
          const { fetchProgress } = useProgressStore.getState();
          const { user, fetchMe } = useAuthStore.getState();
          if (user?._id) fetchProgress(user._id).catch(() => {});
          // Re-fetch the user so XP in Profile/Dashboard updates immediately
          fetchMe().catch(() => {});

          if (data.xpEarned) {
            toast.success(`+${data.xpEarned} XP earned! ${data.passed ? '🎉 Topic mastered!' : '📚 Keep studying!'}`, { duration: 4000 });
          }
          return data;
        } catch (err) {
          set({ submitting: false, error: err.userMessage || 'Failed to submit quiz. Your answers are saved locally.' });
          throw err;
        }
      },

      // Fetch quiz history
      fetchQuizHistory: async (userId) => {
        try {
          const { data } = await api.get(`/api/quiz/history/${userId}`);
          set({ quizHistory: data.history || [] });
        } catch {}
      },

      // Fetch active (in-progress) quizzes
      fetchActiveQuizzes: async (userId) => {
        try {
          const { data } = await api.get(`/api/quiz/active/${userId}`);
          set({ activeQuizzes: data.active || [] });
        } catch {}
      },

      clearResult: () => set({ result: null }),
    }),
    {
      name: 'neuralnest-quiz',
      partialize: (state) => ({ result: state.result }),
    }
  )
);

export default useQuizStore;
