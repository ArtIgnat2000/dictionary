import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Word, GameType } from '../../types';
import { useProgressStore } from '../../store/progressStore';
import { useSettingsStore } from '../../store/settingsStore';
import { getNextWords } from '../../lib/spacedRepetition';
import { useMascot } from '../Mascot';
import { ProgressBar, StarRating, IosButton } from '../UI';
import { useSound } from '../../hooks/useSound';
import { Dictation, WordBuilder, FillBlank, FixRobot, SpeedTrain, PhraseArrange } from '../MiniGames';
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

const GAME_SEQUENCE: GameType[] = ['dictation', 'wordBuilder', 'fillBlank', 'fixRobot', 'dictation'];

function pickGame(idx: number, grade: number, word: Word): GameType {
  // Устойчивые выражения (с пробелом) — всегда «Собери выражение»
  if (word.text.includes(' ')) return 'phraseArrange';
  if (grade >= 5 && idx % 5 === 4) return 'speedTrain';
  return GAME_SEQUENCE[idx % GAME_SEQUENCE.length];
}

interface SessionResult { word: Word; correct: boolean; gameType: GameType; }

interface ResultsScreenProps {
  results: SessionResult[];
  onRetry: () => void;
  onExit: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, onRetry, onExit }) => {
  const correct = results.filter(r => r.correct).length;
  const stars = correct === results.length ? 3 : correct >= results.length * 0.66 ? 2 : correct >= results.length * 0.33 ? 1 : 0;
  const xpEarned = correct * 15 + (stars === 3 ? 30 : stars === 2 ? 15 : 0);
  const { setMood } = useMascot();
  const sound = useSound();

  useEffect(() => {
    sound.session(stars);
    setMood(stars >= 2 ? 'dance' : stars === 1 ? 'happy' : 'sad',
      stars >= 2 ? 'Отлично! Ты молодец!' : stars === 1 ? 'Хорошая работа!' : 'Попробуем ещё раз?', 3000);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col gap-6 items-center py-8 px-4 max-w-md mx-auto"
    >
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}>
        <StarRating stars={stars} size={44} />
      </motion.div>

      <div className="text-center">
        <h2 className="text-display mb-1">
          {stars === 3 ? '🎉 Блестяще!' : stars === 2 ? '👏 Хорошо!' : stars === 1 ? '👍 Неплохо!' : '💪 Продолжай!'}
        </h2>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
          Правильно: {correct} из {results.length}
        </p>
      </div>

      {/* XP earned */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card px-6 py-3 text-center"
      >
        <span style={{ fontSize: 24 }}>⚡ +{xpEarned} XP</span>
      </motion.div>

      {/* Word breakdown */}
      <div className="w-full flex flex-col gap-2">
        {results.map((r, i) => (
          <motion.div
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="glass-card px-4 py-2 flex items-center justify-between"
          >
            <span className="font-semibold" style={{ fontSize: 16 }}>{r.word.text}</span>
            <span style={{ fontSize: 20 }}>{r.correct ? '✅' : '❌'}</span>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3 w-full">
        <IosButton variant="secondary" onClick={onExit} fullWidth>На карту</IosButton>
        <IosButton onClick={onRetry} fullWidth>Ещё раз! 🔄</IosButton>
      </div>
    </motion.div>
  );
};

// ── Session Header ────────────────────────────────────────────────────────────

interface SessionHeaderProps {
  current: number;
  total: number;
  streak: number;
  onExit: () => void;
  gameLabel: string;
}

const SESSION_LABELS: Record<GameType, string> = {
  dictation: '🔊 Диктант',
  wordBuilder: '🧩 Собери слово',
  fillBlank: '❓ Пропавшая буква',
  fixRobot: '🤖 Исправь робота',
  speedTrain: '🚂 Скоростной поезд',
  phraseArrange: '🃏 Собери выражение',
};

const SessionHeader: React.FC<SessionHeaderProps> = ({ current, total, streak, onExit, gameLabel }) => (
  <div className="flex items-center gap-3 mb-5">
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onExit}
      className="border-none bg-transparent cursor-pointer text-xl"
      title="Выйти"
    >
      ✕
    </motion.button>
    <div className="flex-1">
      <div className="flex justify-between text-caption mb-1">
        <span>{gameLabel}</span>
        <span>{current} / {total}</span>
      </div>
      <ProgressBar value={(current / total) * 100} />
    </div>
    {streak > 1 && (
      <div className="streak-badge">🔥 {streak}</div>
    )}
  </div>
);

// ── Main Session Engine ───────────────────────────────────────────────────────

interface SessionEngineProps {
  grade: number;
  onComplete: () => void;
}

export const SessionEngine: React.FC<SessionEngineProps> = ({ grade, onComplete }) => {
  const { masteryMap, recordAnswer, addXP, addCrystals, updateStreak } = useProgressStore();
  const { wordsPerSession } = useSettingsStore();
  const { setMood } = useMascot();
  const sound = useSound();

  const wordList = GRADE_DATA[grade] ?? GRADE_DATA[1];
  // Compute session words ONCE on mount — never recompute mid-session
  // so masteryMap updates don't reorder words and trigger unexpected speech.
  const sessionWordsRef = useRef<Word[]>([]);
  if (sessionWordsRef.current.length === 0) {
    sessionWordsRef.current = getNextWords(masteryMap, wordList, wordsPerSession);
  }
  const sessionWords = sessionWordsRef.current;

  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [done, setDone] = useState(false);
  const [localStreak, setLocalStreak] = useState(0);
  const [gameKey, setGameKey] = useState(0);

  const currentWord = sessionWords[idx];
  const currentGame = pickGame(idx, grade, currentWord);

  useEffect(() => { updateStreak(); }, []);

  const handleResult = useCallback((correct: boolean) => {
    const quality = correct ? 5 : 1;
    recordAnswer(currentWord.id, quality);

    const newStreak = correct ? localStreak + 1 : 0;
    setLocalStreak(newStreak);

    if (correct) {
      addXP(15);
      if (newStreak > 0 && newStreak % 3 === 0) { addCrystals(1); sound.streak(); }
      setMood(
        newStreak >= 5 ? 'dance' : newStreak >= 3 ? 'excited' : 'happy',
        newStreak >= 5 ? '🔥 Великолепно!' : newStreak >= 3 ? '🎯 Серия!' : '✓ Правильно!',
        1500
      );
    } else {
      setMood('sad', 'Попробуй ещё раз!', 1500);
    }

    const newResults = [...results, { word: currentWord, correct, gameType: currentGame }];
    setResults(newResults);

    setTimeout(() => {
      if (idx + 1 >= sessionWords.length) {
        setDone(true);
      } else {
        setIdx(i => i + 1);
        setGameKey(k => k + 1);
      }
    }, 800);
  }, [currentWord, currentGame, idx, results, localStreak]);

  if (done) {
    return (
      <ResultsScreen
        results={results}
        onRetry={() => {
          // Reset session words so spaced repetition recalculates with updated mastery
          sessionWordsRef.current = getNextWords(masteryMap, wordList, wordsPerSession);
          setIdx(0);
          setResults([]);
          setDone(false);
          setLocalStreak(0);
          setGameKey(k => k + 1);
        }}
        onExit={onComplete}
      />
    );
  }

  if (!currentWord) {
    return (
      <div className="text-center py-16">
        <p className="text-title mb-4">Нет слов для практики!</p>
        <IosButton onClick={onComplete}>Вернуться на карту</IosButton>
      </div>
    );
  }

  const renderGame = () => {
    const props = { word: currentWord, onResult: handleResult };
    switch (currentGame) {
      case 'dictation':      return <Dictation key={gameKey} {...props} />;
      case 'wordBuilder':    return <WordBuilder key={gameKey} {...props} />;
      case 'fillBlank':      return <FillBlank key={`fb-${gameKey}`} word={currentWord} onResult={handleResult} />;
      case 'fixRobot':       return <FixRobot key={`fr-${gameKey}`} word={currentWord} onResult={handleResult} />;
      case 'speedTrain':     return <SpeedTrain key={gameKey} {...props} />;
      case 'phraseArrange':  return <PhraseArrange key={gameKey} {...props} />;
      default:               return <Dictation key={gameKey} {...props} />;
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <SessionHeader
        current={idx + 1}
        total={sessionWords.length}
        streak={localStreak}
        onExit={onComplete}
        gameLabel={SESSION_LABELS[currentGame]}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={gameKey}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {renderGame()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
