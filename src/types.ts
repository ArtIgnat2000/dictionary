export interface Word {
  id: string;
  text: string;
  hint: string;
  sentence: string;
  difficulty: number;
}

export interface MasteryEntry {
  wordId: string;
  score: number;       // 0–100
  lastSeen: number;    // timestamp
  interval: number;    // days until next review
  repetitions: number;
}

export interface SessionWord extends Word {
  masteryEntry: MasteryEntry;
}

export type GameType = 'dictation' | 'wordBuilder' | 'fillBlank' | 'fixRobot' | 'speedTrain' | 'phraseArrange';

export type MascotMood = 'idle' | 'happy' | 'excited' | 'sad' | 'thinking' | 'dance';

export type Theme = 'auto' | 'light' | 'dark';

export interface WorldInfo {
  id: number;
  name: string;
  subtitle: string;
  grades: number[];
  colorFrom: string;
  colorTo: string;
  emoji: string;
}

export const WORLDS: WorldInfo[] = [
  { id: 1, name: 'Волшебный лес',    subtitle: '1–2 класс',  grades: [1, 2], colorFrom: '#52d78a', colorTo: '#34C759', emoji: '🌲' },
  { id: 2, name: 'Деревня мастеров', subtitle: '3–4 класс',  grades: [3, 4], colorFrom: '#ffb347', colorTo: '#FF9F0A', emoji: '🏡' },
  { id: 3, name: 'Морской порт',     subtitle: '5–6 класс',  grades: [5, 6], colorFrom: '#5bc8f5', colorTo: '#007AFF', emoji: '⛵' },
  { id: 4, name: 'Горная экспедиция',subtitle: '7–8 класс',  grades: [7, 8], colorFrom: '#c77dff', colorTo: '#AF52DE', emoji: '⛰️' },
  { id: 5, name: 'Космическая база', subtitle: '9–11 класс', grades: [9,10,11], colorFrom: '#4cc9f0', colorTo: '#5E5CE6', emoji: '🚀' },
];
