import React from 'react';
import { motion } from 'framer-motion';
import { WORLDS, type WorldInfo } from '../../types';
import { useProgressStore } from '../../store/progressStore';
import { useSettingsStore } from '../../store/settingsStore';
import { GlassCard, ProgressBar } from '../UI';
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

interface WorldCardProps {
  world: WorldInfo;
  isUnlocked: boolean;
  isActive: boolean;
  practiced: number;
  mastered: number;
  totalCount: number;
  activeGrade: number;
  onSelectGrade: (grade: number) => void;
}

const WorldCard: React.FC<WorldCardProps> = ({
  world, isUnlocked, isActive, practiced, mastered, totalCount, activeGrade, onSelectGrade,
}) => {
  const pct = totalCount > 0 ? (practiced / totalCount) * 100 : 0;

  return (
    <motion.div
      whileHover={isUnlocked ? { scale: 1.02, y: -2 } : {}}
      whileTap={isUnlocked ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="relative overflow-hidden"
      style={{
        borderRadius: 'var(--radius-card)',
        opacity: isUnlocked ? 1 : 0.55,
        cursor: 'default',
      }}
    >
      {/* Gradient background */}
      <div
        style={{
          background: `linear-gradient(135deg, ${world.colorFrom}, ${world.colorTo})`,
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      />

      {/* Glass overlay */}
      <div
        className="relative z-10 p-5"
        style={{
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(4px)',
        }}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 700, color: '#fff' }}>
            ▶ Текущий
          </div>
        )}

        {/* Lock */}
        {!isUnlocked && (
          <div className="absolute top-4 right-4 text-2xl">🔒</div>
        )}

        <div className="text-4xl mb-2">{world.emoji}</div>
        <h3 className="text-title text-white mb-0.5"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.25)' }}>{world.name}</h3>
        <p style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 12, textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
          {world.subtitle}
        </p>

        {isUnlocked && (
          <>
            <ProgressBar value={pct} className="mb-2" />
            <div className="flex items-center justify-between mb-3">
              <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
                В работе: {practiced} / {totalCount} слов
              </p>
              {mastered > 0 && (
                <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
                  ⭐ {mastered}
                </p>
              )}
            </div>
            {/* Grade buttons */}
            <div className="flex gap-2 flex-wrap">
              {world.grades.map(g => (
                <motion.button
                  key={g}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onSelectGrade(g)}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 24,
                    border: 'none',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: activeGrade === g
                      ? 'rgba(255,255,255,0.97)'
                      : 'rgba(255,255,255,0.32)',
                    color: activeGrade === g ? world.colorTo : '#fff',
                    textShadow: activeGrade === g ? 'none' : '0 1px 3px rgba(0,0,0,0.2)',
                    boxShadow: activeGrade === g ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                    transition: 'background 0.2s',
                    minHeight: 42,
                  }}
                >
                  {g} кл.
                </motion.button>
              ))}
            </div>
          </>
        )}

        {!isUnlocked && (
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 8 }}>
            Недоступно
          </p>
        )}
      </div>
    </motion.div>
  );
};

interface WorldMapProps {
  onStartSession: (grade: number) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({ onStartSession }) => {
  const { masteryMap } = useProgressStore();
  const { setActiveGrade, activeGrade } = useSettingsStore();

  // Все миры доступны — замок убран, прогресс не ограничивает выбор класса
  const isGradeUnlocked = (_grade: number) => true;

  const getWorldStats = (world: WorldInfo) => {
    const total = world.grades.reduce((sum, g) => sum + (GRADE_WORD_COUNT[g] ?? 0), 0) || world.grades.length * 30;
    const entries = Object.values(masteryMap).filter(e => {
      const gradeNum = parseInt(e.wordId.split('_')[0].replace('g', ''));
      return world.grades.includes(gradeNum);
    });
    const practiced = entries.filter(e => e.score > 0).length;
    const mastered = entries.filter(e => isMastered(e)).length;
    return { total, practiced, mastered };
  };

  const handleWorldSelect = (grade: number) => {
    setActiveGrade(grade);
    onStartSession(grade);
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-display mb-1">Карта миров</h1>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
          Выбери мир и начни тренировку
        </p>
      </motion.div>

      {/* World grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {WORLDS.map((world, idx) => {
          const isUnlocked = world.grades.some(g => isGradeUnlocked(g));
          const isActive = world.grades.includes(activeGrade);
          const { total, practiced, mastered } = getWorldStats(world);

          return (
            <motion.div
              key={world.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, type: 'spring', stiffness: 200, damping: 25 }}
            >
              <WorldCard
                world={world}
                isUnlocked={isUnlocked}
                isActive={isActive}
                practiced={practiced}
                mastered={mastered}
                totalCount={total}
                activeGrade={activeGrade}
                onSelectGrade={handleWorldSelect}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Quick start */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <GlassCard className="p-5">
          <h3 className="text-headline mb-3">Быстрый переход к классу</h3>
          <div className="flex gap-2 flex-wrap mb-4">
            {Array.from({ length: 11 }, (_, i) => i + 1).map(g => (
              <motion.button
                key={g}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleWorldSelect(g)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: activeGrade === g ? '2px solid var(--ios-blue)' : '1.5px solid var(--glass-border)',
                  background: activeGrade === g ? 'var(--ios-blue)' : 'var(--glass-bg)',
                  color: activeGrade === g ? '#fff' : 'var(--text-primary)',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {g} кл.
              </motion.button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-caption">Следующая тренировка: <strong>{activeGrade} класс</strong></p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={() => onStartSession(activeGrade)}
              className="btn-primary px-6 py-3 text-base font-semibold"
              style={{ borderRadius: 'var(--radius-btn)', whiteSpace: 'nowrap' }}
            >
              ▶ Начать
            </motion.button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
