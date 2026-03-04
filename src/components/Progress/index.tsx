import React from 'react';
import { motion } from 'framer-motion';
import { useProgressStore } from '../../store/progressStore';
import { useSettingsStore } from '../../store/settingsStore';
import { GlassCard, ProgressBar } from '../UI';
import { WORLDS } from '../../types';
import { isMastered } from '../../lib/spacedRepetition';
import grade1 from '../../data/words/grade1.json';
import grade2 from '../../data/words/grade2.json';
import grade3 from '../../data/words/grade3.json';
import grade4 from '../../data/words/grade4.json';
import grade5 from '../../data/words/grade5.json';
import grade6 from '../../data/words/grade6.json';
import grade7 from '../../data/words/grade7.json';
import grade8 from '../../data/words/grade8.json';
import grade9 from '../../data/words/grade9.json';
import grade10 from '../../data/words/grade10.json';
import grade11 from '../../data/words/grade11.json';

const GRADE_WORD_COUNT: Record<number, number> = {
  1: grade1.length, 2: grade2.length, 3: grade3.length,
  4: grade4.length, 5: grade5.length, 6: grade6.length,
  7: grade7.length, 8: grade8.length, 9: grade9.length,
  10: grade10.length, 11: grade11.length,
};

export const ProgressScreen: React.FC = () => {
  const { xp, crystals, streak, masteryMap } = useProgressStore();
  const { childName } = useSettingsStore();

  const allEntries = Object.values(masteryMap);
  const practicedWords = allEntries.filter(e => e.score > 0).length;
  const masteredWords = allEntries.filter(e => isMastered(e)).length;
  // Total vocabulary across grades we have data for
  const totalVocab = Object.values(GRADE_WORD_COUNT).reduce((s, n) => s + n, 0) || 1;
  const masteryPct = (practicedWords / totalVocab) * 100;

  const stats = [
    { label: 'XP', value: xp, emoji: '⚡', color: 'var(--ios-blue)' },
    { label: 'Кристаллы', value: crystals, emoji: '💎', color: 'var(--ios-purple)' },
    { label: 'Серия дней', value: streak, emoji: '🔥', color: 'var(--ios-orange)' },
    { label: 'В работе слов', value: practicedWords, emoji: '📚', color: 'var(--success-color)' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-display mb-1">Прогресс{childName ? `, ${childName}` : ''}</h1>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Твои достижения</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
          >
            <GlassCard className="p-4 text-center">
              <div style={{ fontSize: 36 }}>{s.emoji}</div>
              <div className="text-title" style={{ color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Overall mastery */}
      <GlassCard className="p-5">
        <h3 className="text-headline mb-3">Общий прогресс</h3>
        <ProgressBar value={masteryPct} />
        <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-secondary)', marginTop: 8 }}>
          В работе: {practicedWords} из {totalVocab} слов ({Math.round(masteryPct)}%){masteredWords > 0 ? ` · Освоено: ${masteredWords}` : ''}
        </p>
      </GlassCard>

      {/* Per-world progress */}
      <GlassCard className="p-5">
        <h3 className="text-headline mb-4">По мирам</h3>
        <div className="flex flex-col gap-4">
          {WORLDS.map(world => {
            const worldEntries = Object.values(masteryMap).filter(e => {
              const g = parseInt(e.wordId.split('_')[0].replace('g', ''));
              return world.grades.includes(g);
            });
            const practiced = worldEntries.filter(e => e.score > 0).length;
            const mastered = worldEntries.filter(e => isMastered(e)).length;
            const total = world.grades.reduce((s, g) => s + (GRADE_WORD_COUNT[g] ?? 0), 0) || world.grades.length * 30;
            const pct = total > 0 ? (practiced / total) * 100 : 0;
            return (
              <div key={world.id}>
                <div className="flex justify-between mb-1" style={{ fontSize: 15, fontWeight: 500 }}>
                  <span style={{ color: 'var(--text-color)' }}>{world.emoji} {world.name}</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{practiced}/{total}{mastered > 0 ? ` (⭐${mastered})` : ''}</span>
                </div>
                <div className="progress-track">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 80, damping: 20 }}
                    style={{ background: `linear-gradient(90deg, ${world.colorFrom}, ${world.colorTo})` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Streak calendar (last 7 days) */}
      {streak > 0 && (
        <GlassCard className="p-5">
          <h3 className="text-headline mb-3">🔥 Серия: {streak} {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'}</h3>
          <div className="flex gap-2">
            {Array.from({ length: 7 }, (_, i) => i < streak).map((active, i) => (
              <div
                key={i}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: active ? 'var(--ios-orange)' : 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                }}
              />
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};
