import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Word } from '../../types';
import { GlassCard } from '../UI';
import grade1  from '../../data/words/grade1.json';
import grade2  from '../../data/words/grade2.json';
import grade3  from '../../data/words/grade3.json';
import grade4  from '../../data/words/grade4.json';
import grade5  from '../../data/words/grade5.json';
import grade6  from '../../data/words/grade6.json';
import grade7  from '../../data/words/grade7.json';
import grade8  from '../../data/words/grade8.json';
import grade9  from '../../data/words/grade9.json';
import grade10 from '../../data/words/grade10.json';
import grade11 from '../../data/words/grade11.json';

const GRADE_DATA: Record<number, Word[]> = {
  1:  grade1  as Word[], 2:  grade2  as Word[], 3:  grade3  as Word[],
  4:  grade4  as Word[], 5:  grade5  as Word[], 6:  grade6  as Word[],
  7:  grade7  as Word[], 8:  grade8  as Word[], 9:  grade9  as Word[],
  10: grade10 as Word[], 11: grade11 as Word[],
};

const ALL_WORDS: Word[] = Object.values(GRADE_DATA).flat();

// Highlight matching substring
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: 'rgba(0,122,255,0.18)', color: 'var(--ios-blue)', borderRadius: 2, padding: '0 1px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export const DictionaryScreen: React.FC = () => {
  const [activeGrade, setActiveGrade] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  const sourceList = activeGrade === 'all' ? ALL_WORDS : (GRADE_DATA[activeGrade] ?? []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? sourceList.filter(w =>
          w.text.toLowerCase().includes(q) ||
          w.hint.toLowerCase().includes(q)
        )
      : sourceList;
    return [...list].sort((a, b) => a.text.localeCompare(b.text, 'ru'));
  }, [sourceList, search]);

  const totalCount = activeGrade === 'all'
    ? ALL_WORDS.length
    : (GRADE_DATA[activeGrade as number]?.length ?? 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-display mb-1">Словарь</h1>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
          {totalCount} слов · {filtered.length} показано
        </p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Поиск по слову или теме..."
          className="word-input"
          style={{ fontSize: 16, width: '100%' }}
        />
      </motion.div>

      {/* Grade tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            padding: '12px 14px',
            background: 'var(--glass-bg)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <TabButton label="Все" active={activeGrade === 'all'} onClick={() => setActiveGrade('all')} />
          {Array.from({ length: 11 }, (_, i) => i + 1).map(g => (
            <TabButton
              key={g}
              label={`${g} кл.`}
              active={activeGrade === g}
              onClick={() => setActiveGrade(g)}
            />
          ))}
        </div>
      </motion.div>

      {/* Word list */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
        {filtered.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p style={{ fontSize: 36, marginBottom: 8 }}>🔍</p>
            <p className="text-headline">Ничего не найдено</p>
            <p className="text-body" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              Попробуй другой запрос
            </p>
          </GlassCard>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 8,
            }}
          >
            {filtered.map((word, i) => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.015, 0.4), type: 'spring', stiffness: 300, damping: 28 }}
                style={{
                  padding: '12px 14px',
                  background: 'var(--glass-bg)',
                  borderRadius: 14,
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-color)', letterSpacing: '-0.01em', wordBreak: 'break-word' }}>
                  <Highlight text={word.text} query={search.trim()} />
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.03em' }}>
                  <Highlight text={word.hint} query={search.trim()} />
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.88 }}
    onClick={onClick}
    style={{
      padding: '5px 12px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      fontWeight: 700,
      background: active ? 'var(--ios-blue)' : 'var(--glass-bg-strong)',
      color: active ? '#fff' : 'var(--text-color)',
      boxShadow: active ? '0 2px 8px rgba(0,122,255,0.28)' : 'none',
      transition: 'background 0.15s, box-shadow 0.15s',
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </motion.button>
);
