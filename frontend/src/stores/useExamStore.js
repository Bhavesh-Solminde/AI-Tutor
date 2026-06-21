import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axiosClient';
import toast from 'react-hot-toast';

const useExamStore = create(
  persist(
    (set, get) => ({
      exam: null,
      examSessionId: null,
      topics: [],
      examRoadmapNodes: [],
      examRoadmapEdges: [],
      daysLeft: null,
      rescuePlan: null,
      setupComplete: false,
      loading: false,
      error: null,

      setupExam: async ({ subject, examDate }) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/api/exam/setup', { subject, examDate });
          set({ exam: data.exam, daysLeft: data.daysLeft, loading: false });
          return data;
        } catch (err) {
          set({ loading: false, error: err.userMessage || 'Failed to save exam details.' });
          throw err;
        }
      },

      uploadSyllabus: async (formData) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/api/exam/upload-syllabus', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          set({ topics: data.topics || [], examSessionId: data.sessionId || null, loading: false });
          toast.success('Syllabus processed! Your exam roadmap is being built.');
          return data;
        } catch (err) {
          const msg = err.userMessage || "Couldn't process the syllabus. Make sure it's a valid PDF.";
          set({ loading: false, error: msg });
          throw err;
        }
      },

      uploadPYQ: async (formData) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/api/exam/upload-pyq', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          toast.success('Past papers analyzed! Topics weighted by frequency.');
          set({ loading: false });
          return data;
        } catch (err) {
          set({ loading: false, error: err.userMessage || 'Failed to analyze past papers.' });
          throw err;
        }
      },

      fetchExam: async (userId) => {
        set({ loading: true, error: null });
        try {
          // _silent: true — 404 is expected for users who haven't set up an exam yet
          const { data } = await api.get(`/api/exam/${userId}`, { _silent: true });
          set({
            exam: data.exam,
            topics: data.topics || [],
            daysLeft: data.daysLeft,
            examSessionId: data.exam?.sessionId || null,
            loading: false,
          });
          return data;
        } catch (err) {
          if (err.response?.status === 404) {
            // No exam set yet — perfectly normal for new users
            set({ loading: false, exam: null, topics: [], daysLeft: null });
            return null;
          }
          set({ loading: false, error: err.userMessage || 'Failed to load exam data.' });
        }
      },

      generateStudyPlan: async ({ sessionId: explicitSessionId, examDate }) => {
        set({ loading: true, error: null });
        try {
          const sessionId = explicitSessionId || get().examSessionId;
          const { data } = await api.post('/api/studyplan/generate', { sessionId, examDate });
          set({ rescuePlan: data.plan, loading: false, setupComplete: true });
          return data;
        } catch (err) {
          set({ loading: false, error: err.userMessage || 'Failed to generate study plan.' });
          throw err;
        }
      },

      fetchExamRoadmap: async (sessionId) => {
        if (!sessionId) return;
        try {
          const { data } = await api.get(`/api/roadmap/${sessionId}`);
          set({
            examRoadmapNodes: data.nodes || [],
            examRoadmapEdges: data.edges || [],
          });
        } catch (err) {
          console.warn('Failed to fetch exam roadmap', err);
        }
      },

      recalibrateExam: async () => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/api/exam/recalibrate');
          set({ rescuePlan: data.plan, loading: false });
          toast.success('Study plan recalibrated with PYQ data! 🎯');
          return data;
        } catch (err) {
          set({ loading: false });
          toast.error('Failed to recalibrate plan.');
        }
      },

      fetchStudyPlan: async (userId) => {
        try {
          const { data } = await api.get(`/api/studyplan/${userId}`);
          if (data.plan) set({ rescuePlan: data.plan, setupComplete: true });
        } catch {}
      },

      markDayComplete: async (dayId, planId, score) => {
        try {
          await api.patch(`/api/studyplan/day/${dayId}`, { planId, score });
          // Reflect locally
          set((state) => ({
            rescuePlan: state.rescuePlan
              ? {
                  ...state.rescuePlan,
                  days: state.rescuePlan.days.map((d) =>
                    d._id === dayId ? { ...d, completed: true } : d
                  ),
                }
              : null,
          }));
          if (score < 60) toast('Weak score — topics added to tomorrow\'s plan 📅', { icon: '⚠️' });
        } catch {}
      },

      setSetupComplete: (val) => set({ setupComplete: val }),
      clearExam: () => set({ exam: null, examSessionId: null, topics: [], examRoadmapNodes: [], examRoadmapEdges: [], daysLeft: null, rescuePlan: null, setupComplete: false }),

      // DELETE exam + study plan so user can restart from scratch
      deleteExam: async (userId) => {
        try {
          await api.delete(`/api/exam/${userId}`);
          set({ exam: null, examSessionId: null, topics: [], daysLeft: null, rescuePlan: null, setupComplete: false });
        } catch (err) {
          throw err;
        }
      },
    }),
    {
      name: 'neuralnest-exam',
      partialize: (state) => ({ exam: state.exam, examSessionId: state.examSessionId, setupComplete: state.setupComplete }),
    }
  )
);

export default useExamStore;
