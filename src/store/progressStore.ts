import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MasteryEntry } from '../types';
import { sm2Update, makeDefaultEntry } from '../lib/spacedRepetition';

interface ProgressState {
  xp: number;
  crystals: number;
  streak: number;
  lastStudyDate: string;         // ISO date YYYY-MM-DD
  masteryMap: Record<string, MasteryEntry>;
  unlockedGrades: number[];
  totalWordsLearned: number;

  addXP: (amount: number) => void;
  addCrystals: (amount: number) => void;
  updateStreak: () => void;
  recordAnswer: (wordId: string, quality: number) => void;
  unlockGrade: (grade: number) => void;
  getMastery: (wordId: string) => MasteryEntry;
  reset: () => void;
  importData: (data: Partial<ProgressState>) => void;
}

const initialState = {
  xp: 0,
  crystals: 0,
  streak: 0,
  lastStudyDate: '',
  masteryMap: {} as Record<string, MasteryEntry>,
  unlockedGrades: [1,2,3,4,5,6,7,8,9,10,11],
  totalWordsLearned: 0,
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addXP: (amount) => set(s => ({ xp: s.xp + amount })),
      addCrystals: (amount) => set(s => ({ crystals: s.crystals + amount })),

      updateStreak: () => {
        const today = new Date().toISOString().slice(0, 10);
        const { lastStudyDate, streak } = get();
        if (lastStudyDate === today) return;
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
        const newStreak = lastStudyDate === yesterday ? streak + 1 : 1;
        set({ streak: newStreak, lastStudyDate: today });
      },

      recordAnswer: (wordId, quality) => {
        const { masteryMap, totalWordsLearned } = get();
        const prev = masteryMap[wordId] ?? makeDefaultEntry(wordId);
        const wasLearned = prev.score >= 90;
        const updated = sm2Update(prev, quality);
        const justLearned = !wasLearned && updated.score >= 90;
        set({
          masteryMap: { ...masteryMap, [wordId]: updated },
          totalWordsLearned: totalWordsLearned + (justLearned ? 1 : 0),
        });
      },

      unlockGrade: (grade) => {
        const { unlockedGrades } = get();
        if (!unlockedGrades.includes(grade)) {
          set({ unlockedGrades: [...unlockedGrades, grade] });
        }
      },

      getMastery: (wordId) => {
        return get().masteryMap[wordId] ?? makeDefaultEntry(wordId);
      },

      reset: () => set(initialState),

      importData: (data) => set(s => ({ ...s, ...data })),
    }),
    {
      name: 'slovo-progress',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
