import type { MasteryEntry, Word } from '../types';

/**
 * Simplified SM-2 spaced repetition algorithm.
 * Returns a score 0–100 and the interval in days for the next review.
 */
export function sm2Update(
  entry: MasteryEntry,
  quality: number  // 0 (wrong) – 5 (perfect)
): MasteryEntry {
  let { score, interval, repetitions } = entry;

  if (quality >= 3) {
    // Correct answer
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else interval = Math.round(interval * 2.1);
    repetitions += 1;
    score = Math.min(100, score + (quality === 5 ? 20 : quality === 4 ? 12 : 8));
  } else {
    // Wrong answer
    repetitions = 0;
    interval = 1;
    score = Math.max(0, score - 20);
  }

  return {
    ...entry,
    score,
    interval,
    repetitions,
    lastSeen: Date.now(),
  };
}

export function makeDefaultEntry(wordId: string): MasteryEntry {
  return { wordId, score: 0, lastSeen: 0, interval: 1, repetitions: 0 };
}

/**
 * Return the next batch of words to practice.
 * Priority: overdue > low score > new words.
 */
export function getNextWords(
  masteryMap: Record<string, MasteryEntry>,
  allWords: Word[],
  count: number
): Word[] {
  const now = Date.now();
  const ONE_DAY = 86_400_000;

  const scored = allWords.map(w => {
    const entry = masteryMap[w.id] ?? makeDefaultEntry(w.id);
    const daysOverdue = (now - entry.lastSeen) / ONE_DAY - entry.interval;
    // Higher = more urgent
    const priority = entry.score < 50
      ? 1000 - entry.score + daysOverdue * 10
      : daysOverdue * 5;
    return { word: w, entry, priority };
  });

  scored.sort((a, b) => b.priority - a.priority);
  return scored.slice(0, count).map(s => s.word);
}

/** Returns true if the word is fully mastered (score >= 90) */
export function isMastered(entry: MasteryEntry | undefined): boolean {
  return (entry?.score ?? 0) >= 90;
}
