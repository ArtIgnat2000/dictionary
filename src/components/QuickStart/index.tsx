import React from 'react';
import { motion } from 'framer-motion';
import { useProgressStore } from '../../store/progressStore';
import { useSettingsStore } from '../../store/settingsStore';
import { GlassCard, ProgressBar } from '../UI';
import { isMastered } from '../../lib/spacedRepetition';
import type { Word } from '../../types';
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

const GRADE_DATA: Record<number, Word[]> = {
  1: grade1 as Word[], 2: grade2 as Word[], 3: grade3 as Word[],
  4: grade4 as Word[], 5: grade5 as Word[], 6: grade6 as Word[],
  7: grade7 as Word[], 8: grade8 as Word[], 9: grade9 as Word[],
  10: grade10 as Word[], 11: grade11 as Word[],
};

interface QuickStartProps {
  onStartSession: (grade: number) => void;
}

export const QuickStartScreen: React.FC<QuickStartProps> = ({ onStartSession }) => {
  const { masteryMap, xp, streak } = useProgressStore();
  const { activeGrade, childName, wordsPerSession } = useSettingsStore();

  const words = GRADE_DATA[activeGrade] ?? [];
  const total = words.length;

  const entries = words.map(w => masteryMap[w.id]);
  const practiced = entries.filter(e => e && e.score > 0).length;
  const mastered = entries.filter(e => isMastered(e)).length;
  const pct = total > 0 ? (practiced / total) * 100 : 0;

  // Слабые слова: знакомые, но плохо запомненные (score 1–59)
  const weakWords = words
    .filter(w => {
      const e = masteryMap[w.id];
      return e && e.score > 0 && e.score < 60;
    })
    .sort((a, b) => (masteryMap[a.id]?.score ?? 0) - (masteryMap[b.id]?.score ?? 0))
    .slice(0, 8);

  // Новые слова (ещё не встречались)
  const newCount = words.filter(w => !masteryMap[w.id] || masteryMap[w.id].score === 0).length;

  const gradeLabel = `${activeGrade} класс`;

  return (
    <div className="flex flex-col gap-5">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-display mb-1">
          {childName ? `Учиться, ${childName}` : 'Учиться'}
        </h1>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
          Быстрый старт тренировки
        </p>
      </motion.div>

      {/* Текущий класс + кнопка старта */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>
                ТЕКУЩИЙ КЛАСС
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-color)', letterSpacing: '-0.02em' }}>
                {gradeLabel}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>
                СЛОВ В СЕССИИ
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--ios-blue)', letterSpacing: '-0.02em' }}>
                {wordsPerSession}
              </div>
            </div>
          </div>

          <ProgressBar value={pct} className="mb-2" />
          <div className="flex justify-between mb-5" style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
            <span>В работе: {practiced} / {total}</span>
            {mastered > 0 && <span>⭐ Освоено: {mastered}</span>}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => onStartSession(activeGrade)}
            className="w-full py-4 rounded-[16px] border-none cursor-pointer font-bold"
            style={{
              background: 'var(--ios-blue)',
              color: '#fff',
              fontSize: 18,
              fontFamily: 'var(--font-sans)',
              boxShadow: '0 4px 20px rgba(0,122,255,0.35)',
              letterSpacing: '-0.02em',
            }}
          >
            ▶ Начать тренировку
          </motion.button>
        </GlassCard>
      </motion.div>

      {/* Слабые слова */}
      {weakWords.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="p-5">
            <h3 className="text-headline mb-1">⚠️ Требуют повторения</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Эти слова запомнены плохо — они попадут в следующую тренировку первыми
            </p>
            <div className="flex flex-wrap gap-2">
              {weakWords.map(w => {
                const score = masteryMap[w.id]?.score ?? 0;
                return (
                  <div
                    key={w.id}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 20,
                      background: score < 30
                        ? 'rgba(255,59,48,0.1)'
                        : 'rgba(255,149,0,0.1)',
                      color: score < 30
                        ? 'var(--error-color)'
                        : 'var(--ios-orange)',
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {w.text}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Мини-статистика */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Новых слов', value: newCount, color: 'var(--ios-blue)', emoji: '🆕' },
            { label: 'XP накоплено', value: xp, color: 'var(--ios-purple)', emoji: '⚡' },
            { label: 'Серия дней', value: streak, color: 'var(--ios-orange)', emoji: '🔥' },
          ].map(s => (
            <GlassCard key={s.label} className="p-3 text-center">
              <div style={{ fontSize: 22 }}>{s.emoji}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginTop: 2, lineHeight: 1.3 }}>{s.label}</div>
            </GlassCard>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
