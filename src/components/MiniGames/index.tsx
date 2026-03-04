import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Word } from '../../types';
import { IosButton } from '../UI';
import { useSound } from '../../hooks/useSound';

// ─── Shared keyboard for mobile ──────────────────────────────────────────────

const KEYBOARD_ROWS = [
  ['й','ц','у','к','е','н','г','ш','щ','з','х','ъ'],
  ['ф','ы','в','а','п','р','о','л','д','ж','э'],
  ['я','ч','с','м','и','т','ь','б','ю','⌫'],
];

interface KeyboardProps {
  onKey: (k: string) => void;
  disabled?: boolean;
}

const RusKeyboard: React.FC<KeyboardProps> = ({ onKey, disabled }) => (
  <div className="flex flex-col gap-2 select-none w-full" style={{ userSelect: 'none' }}>
    {KEYBOARD_ROWS.map((row, ri) => (
      <div key={ri} className="flex justify-center gap-1.5 w-full">
        {row.map(k => (
          <motion.button
            key={k}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            onClick={() => !disabled && onKey(k)}
            disabled={disabled}
            className="flex items-center justify-center rounded-[10px] font-semibold border-none cursor-pointer"
            style={{
              flex: k === '⌫' ? 1.5 : 1,
              minWidth: 0,
              height: 52,
              background: k === '⌫' ? 'var(--glass-bg)' : 'var(--glass-bg-strong)',
              color: 'var(--text-color)',
              fontSize: k === '⌫' ? 20 : 18,
              fontWeight: 600,
              boxShadow: '0 2px 6px rgba(0,0,0,0.13)',
              borderBottom: '2px solid var(--glass-border-subtle)',
            }}
          >
            {k}
          </motion.button>
        ))}
      </div>
    ))}
  </div>
);

// ─── Dictation ────────────────────────────────────────────────────────────────

interface DictationProps { word: Word; onResult: (correct: boolean, usedHint?: boolean) => void; }

export const Dictation: React.FC<DictationProps> = ({ word, onResult }) => {
  const sound = useSound();
  const [input, setInput] = useState('');
  const [state, setState] = useState<'idle' | 'error' | 'success'>('idle');
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const speak = () => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(word.text);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    window.speechSynthesis?.cancel(); // clear any queued utterances from previous card
    const t = setTimeout(() => speak(), 150); // small delay so cancel completes first
    return () => {
      clearTimeout(t);
      window.speechSynthesis?.cancel(); // cancel on unmount
    };
  }, [word.id]);

  const handleKey = (k: string) => {
    if (state === 'success') return;
    if (k === '⌫') { setInput(p => p.slice(0, -1)); setState('idle'); return; }
    setInput(p => p + k);
    setState('idle');
  };

  const handleCheck = () => {
    const correct = input.trim().toLowerCase() === word.text.toLowerCase();
    if (correct) {
      sound.correct();
      setState('success');
      onResult(true);
    } else {
      sound.wrong();
      setState('error');
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 2) { setRevealed(true); }
      setTimeout(() => {
        if (newAttempts >= 2) { onResult(false); }
        else { setState('idle'); setInput(''); }
      }, 1800);
    }
  };

  const sentenceDisplay = word.sentence.replace('____', ' —       — ');

  return (
    <div className="flex flex-col gap-5 items-center w-full max-w-md mx-auto">
      {/* Hint sentence */}
      <div className="glass-card p-4 w-full text-center">
        <p className="text-body" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {word.hint}
        </p>
        <p className="text-headline mt-1" style={{ lineHeight: 1.6 }}>
          {sentenceDisplay}
        </p>
      </div>

      {/* Speaker button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={speak}
        className="flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer"
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 72, height: 72, background: 'var(--ios-blue)', boxShadow: '0 4px 16px rgba(0,122,255,0.35)' }}
        >
          <span style={{ fontSize: 32 }}>🔊</span>
        </div>
        <span className="text-caption">Нажми, чтобы услышать</span>
      </motion.button>

      {/* Input display */}
      <motion.div
        animate={state === 'error' ? { x: [-8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`word-input ${state}`}
        style={{ minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.12em' }}
      >
        <span style={{ fontSize: 28, fontWeight: 700, color: state === 'error' ? 'var(--error-color)' : state === 'success' ? 'var(--success-color)' : 'var(--text-color)' }}>
          {revealed ? word.text : (input || <span style={{ opacity: 0.3 }}>—</span>)}
        </span>
      </motion.div>

      {/* Keyboard */}
      <RusKeyboard onKey={handleKey} disabled={state === 'success' || revealed} />

      {state !== 'success' && !revealed && (
        <IosButton onClick={handleCheck} disabled={!input} fullWidth>
          Проверить ✓
        </IosButton>
      )}

      {state === 'success' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center text-2xl font-bold"
          style={{ color: 'var(--success-color)' }}
        >
          ✓ Правильно!
        </motion.div>
      )}
    </div>
  );
};

// ─── WordBuilder ──────────────────────────────────────────────────────────────

interface WordBuilderProps { word: Word; onResult: (correct: boolean, usedHint?: boolean) => void; }

export const WordBuilder: React.FC<WordBuilderProps> = ({ word, onResult }) => {
  const sound = useSound();
  const shuffled = useRef<string[]>([]);
  const [placed, setPlaced] = useState<(string | null)[]>(Array(word.text.length).fill(null));
  const [available, setAvailable] = useState<{ letter: string; used: boolean }[]>([]);
  const [state, setState] = useState<'idle' | 'success' | 'error'>('idle');
  const [usedHint, setUsedHint] = useState(false);
  const [hintCount, setHintCount] = useState(0);

  useEffect(() => {
    const letters = word.text.split('');
    // Add 3 decoy letters
    const decoys = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.split('').filter(l => !letters.includes(l));
    const pool = [...letters, ...decoys.slice(0, 3)].sort(() => Math.random() - 0.5);
    shuffled.current = pool;
    setAvailable(pool.map(letter => ({ letter, used: false })));
    setPlaced(Array(word.text.length).fill(null));
    setState('idle');
    setUsedHint(false);
    setHintCount(0);
  }, [word.id]);

  // Reveal the next correct letter as a hint
  const handleHint = () => {
    if (state !== 'idle') return;
    const nextSlot = placed.findIndex(p => p === null);
    if (nextSlot === -1) return;
    const correctLetter = word.text[nextSlot];
    // Find this letter in available pool
    const aIdx = available.findIndex(a => !a.used && a.letter === correctLetter);
    if (aIdx === -1) return;
    const newPlaced = [...placed];
    newPlaced[nextSlot] = correctLetter;
    const newAvail = [...available];
    newAvail[aIdx] = { ...newAvail[aIdx], used: true };
    setPlaced(newPlaced);
    setAvailable(newAvail);
    setUsedHint(true);
    setHintCount(c => c + 1);
    if (!newPlaced.includes(null)) {
      setState('success');
      sound.correct();
      setTimeout(() => onResult(true, true), 800);
    }
  };

  const handleLetterClick = (idx: number) => {
    if (available[idx].used || state !== 'idle') return;
    const slotIdx = placed.findIndex(p => p === null);
    if (slotIdx === -1) return;
    const newPlaced = [...placed];
    newPlaced[slotIdx] = available[idx].letter;
    const newAvail = [...available];
    newAvail[idx] = { ...newAvail[idx], used: true };
    setPlaced(newPlaced);
    setAvailable(newAvail);

    if (!newPlaced.includes(null)) {
      const result = newPlaced.join('') === word.text;
      setState(result ? 'success' : 'error');
      if (result) { sound.correct(); setTimeout(() => onResult(true, usedHint), 800); }
      else {
        sound.wrong();
        setTimeout(() => {
          setPlaced(Array(word.text.length).fill(null));
          setAvailable(shuffled.current.map(letter => ({ letter, used: false })));
          setState('idle');
        }, 1000);
      }
    }
  };

  const handleSlotClick = (slotIdx: number) => {
    if (placed[slotIdx] === null || state !== 'idle') return;
    const letter = placed[slotIdx]!;
    const newPlaced = [...placed];
    newPlaced[slotIdx] = null;
    // Find the first matching available
    const newAvail = [...available];
    const aIdx = newAvail.findIndex(a => a.used && a.letter === letter);
    if (aIdx !== -1) newAvail[aIdx] = { ...newAvail[aIdx], used: false };
    setPlaced(newPlaced);
    setAvailable(newAvail);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full max-w-md mx-auto">
      <div className="glass-card p-4 w-full text-center">
        <p className="text-body" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{word.hint}</p>
        <p className="text-headline mt-1">{word.sentence.replace('____', '?')}</p>
      </div>

      <p className="text-caption">Собери слово из букв</p>

      {/* Hint button */}
      {state === 'idle' && placed.some(p => p === null) && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleHint}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: usedHint ? 'rgba(255,149,0,0.12)' : 'rgba(0,122,255,0.10)',
            color: usedHint ? 'var(--ios-orange)' : 'var(--ios-blue)',
            fontSize: 13, fontWeight: 600,
          }}
        >
          💡 Подсказка{hintCount > 0 ? ` (${hintCount})` : ''}
          {!usedHint && <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 4 }}>-10 XP</span>}
        </motion.button>
      )}

      {/* Slots */}
      <div className="flex gap-2 flex-wrap justify-center">
        {placed.map((l, i) => (
          <motion.div
            key={i}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSlotClick(i)}
            className="letter-tile"
            style={{
              width: 44, height: 52,
              borderColor: l ? (state === 'success' ? 'var(--success-color)' : state === 'error' ? 'var(--error-color)' : 'var(--ios-blue)') : 'var(--glass-border)',
              background: l ? 'var(--glass-bg-strong)' : 'transparent',
              color: state === 'success' ? 'var(--success-color)' : state === 'error' ? 'var(--error-color)' : 'var(--text-color)',
            }}
          >
            {l || ''}
          </motion.div>
        ))}
      </div>

      {/* Available letters */}
      <div className="flex gap-2 flex-wrap justify-center">
        <AnimatePresence>
          {available.map((a, i) => (
            !a.used && (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => handleLetterClick(i)}
                className="letter-tile"
                style={{ width: 44, height: 52 }}
              >
                {a.letter}
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>

      {state === 'success' && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xl font-bold" style={{ color: 'var(--success-color)' }}>
          {usedHint ? '✓ Верно! (+5 XP)' : '✓ Правильно! (+15 XP)'}
        </motion.p>
      )}
    </div>
  );
};

// ─── FillBlank ────────────────────────────────────────────────────────────────

interface FillBlankProps { word: Word; onResult: (correct: boolean, usedHint?: boolean) => void; }

export const FillBlank: React.FC<FillBlankProps> = ({ word, onResult }) => {
  const sound = useSound();
  const missIdx = useRef(Math.floor(word.text.length / 2));
  const [chosen, setChosen] = useState<string | null>(null);

  const correct = word.text[missIdx.current];
  const displayed = word.text.split('').map((l, i) => i === missIdx.current ? '_' : l).join('');

  const alphabet = 'аеёиоуыьэюяскнтрвпдлжбзгчшщхцъф';
  const options = [correct];
  while (options.length < 4) {
    const r = alphabet[Math.floor(Math.random() * alphabet.length)];
    if (!options.includes(r)) options.push(r);
  }
  const shuffledOpts = useRef(options.sort(() => Math.random() - 0.5));

  const handle = (letter: string) => {
    if (chosen) return;
    setChosen(letter);
    const ok = letter === correct;
    if (ok) sound.correct(); else sound.wrong();
    setTimeout(() => onResult(ok), 900);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full max-w-md mx-auto">
      <div className="glass-card p-4 w-full text-center">
        <p className="text-body" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{word.hint}</p>
        <p className="text-headline mt-1">{word.sentence.replace('____', `«${displayed}»`)}</p>
      </div>
      <div className="text-display" style={{ letterSpacing: '0.1em' }}>{displayed}</div>
      <p className="text-caption">Выбери пропущенную букву</p>
      <div className="grid grid-cols-2 gap-3 w-full">
        {shuffledOpts.current.map(opt => {
          const isCorrect = opt === correct;
          const isChosen = chosen === opt;
          let bg = 'var(--glass-bg-strong)';
          let color = 'var(--text-color)';
          if (isChosen) { bg = isCorrect ? 'var(--success-color)' : 'var(--error-color)'; color = '#fff'; }
          else if (chosen && isCorrect) { bg = 'var(--success-color)'; color = '#fff'; }
          return (
            <motion.button
              key={opt}
              whileTap={{ scale: 0.93 }}
              onClick={() => handle(opt)}
              className="glass-card py-4 text-2xl font-bold border-none cursor-pointer"
              style={{ background: bg, color, borderRadius: 'var(--radius-btn)', fontFamily: 'var(--font-sans)' }}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// ─── FixRobot ─────────────────────────────────────────────────────────────────

interface FixRobotProps { word: Word; onResult: (correct: boolean, usedHint?: boolean) => void; }

export const FixRobot: React.FC<FixRobotProps> = ({ word, onResult }) => {
  const sound = useSound();
  const wrongIdx = useRef(Math.floor(Math.random() * word.text.length));
  const alphabet = 'аеёиоуыьэюяскнтрвпдлжбзгчшщхцъф';
  const wrongLetter = useRef((() => {
    let l: string;
    do { l = alphabet[Math.floor(Math.random() * alphabet.length)]; } while (l === word.text[wrongIdx.current]);
    return l;
  })());
  const [chosen, setChosen] = useState<number | null>(null);
  const [shake, setShake] = useState(false);

  const misspelled = word.text.split('').map((l, i) => i === wrongIdx.current ? wrongLetter.current : l).join('');

  const handle = (idx: number) => {
    if (chosen !== null) return;
    setChosen(idx);
    const ok = idx === wrongIdx.current;
    if (ok) sound.correct(); else sound.wrong();
    if (!ok) { setShake(true); setTimeout(() => setShake(false), 500); }
    setTimeout(() => onResult(ok), 900);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full max-w-md mx-auto">
      <div className="glass-card p-4 w-full text-center">
        <p style={{ fontSize: 48 }}>🤖</p>
        <p className="text-headline mb-1">Робот написал с ошибкой!</p>
        <p className="text-body" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Найди и нажми на неправильную букву
        </p>
      </div>
      <motion.div
        animate={shake ? { x: [-6, 6, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex gap-2 flex-wrap justify-center"
      >
        {misspelled.split('').map((l, i) => {
          const isWrongIdx = i === wrongIdx.current;
          const isChosen = chosen === i;
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.85 }}
              onClick={() => handle(i)}
              className="letter-tile border-none cursor-pointer"
              style={{
                width: 48, height: 56, fontSize: 24, fontWeight: 700,
                background: isChosen ? (isWrongIdx ? 'var(--success-color)' : 'var(--error-color)') : 'var(--glass-bg-strong)',
                color: isChosen ? '#fff' : isWrongIdx && chosen !== null ? 'var(--success-color)' : 'var(--text-color)',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              {l}
            </motion.button>
          );
        })}
      </motion.div>
      <p className="text-caption">Слово: <strong>{word.hint}</strong></p>
    </div>
  );
};

// ─── SpeedTrain ───────────────────────────────────────────────────────────────

interface SpeedTrainProps { word: Word; onResult: (correct: boolean, usedHint?: boolean) => void; timeLimit?: number; }

export const SpeedTrain: React.FC<SpeedTrainProps> = ({ word, onResult, timeLimit = 12 }) => {
  const sound = useSound();
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [state, setState] = useState<'idle' | 'success' | 'failed'>('idle');

  useEffect(() => {
    if (state !== 'idle') return;
    const t = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(t); sound.wrong(); setState('failed'); onResult(false); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [state]);

  const handleKey = (k: string) => {
    if (state !== 'idle') return;
    if (k === '⌫') { setInput(p => p.slice(0, -1)); return; }
    const next = input + k;
    setInput(next);
    if (next.length === word.text.length) {
      const ok = next.toLowerCase() === word.text.toLowerCase();
      setState(ok ? 'success' : 'idle');
      if (ok) { sound.correct(); setTimeout(() => onResult(true), 600); }
      else { setTimeout(() => setInput(''), 400); }
    }
  };

  const pct = (timeLeft / timeLimit) * 100;

  return (
    <div className="flex flex-col gap-5 items-center w-full max-w-md mx-auto">
      <div className="glass-card p-4 w-full text-center">
        <p className="text-body" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{word.hint}</p>
        <p className="text-headline mt-1">{word.sentence.replace('____', '???')}</p>
      </div>

      {/* Timer */}
      <div className="w-full">
        <div className="flex justify-between text-caption mb-2">
          <span>🚂 Поезд отправляется через...</span>
          <span style={{ color: timeLeft <= 4 ? 'var(--error-color)' : 'inherit', fontWeight: 700 }}>{timeLeft}с</span>
        </div>
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            style={{
              width: `${pct}%`,
              background: timeLeft <= 4
                ? 'linear-gradient(90deg, var(--error-color), #FF6B00)'
                : 'linear-gradient(90deg, var(--ios-blue), var(--ios-purple))',
            }}
            transition={{ duration: 0.9 }}
          />
        </div>
      </div>

      <div
        className="word-input"
        style={{ fontSize: 28, color: state === 'success' ? 'var(--success-color)' : 'var(--text-color)' }}
      >
        {input || <span style={{ opacity: 0.3 }}>—</span>}
      </div>

      <RusKeyboard onKey={handleKey} disabled={state !== 'idle'} />

      {state === 'failed' && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-headline text-center" style={{ color: 'var(--error-color)' }}>
          Поезд уехал! Правильно: <strong>{word.text}</strong>
        </motion.p>
      )}
    </div>
  );
};

// ─── PhraseArrange ─────────────────────────────────────────────────────────────
// Для устойчивых выражений: перемешанные карточки-слова — нажимай в правильном порядке

interface PhraseArrangeProps { word: Word; onResult: (correct: boolean, usedHint?: boolean) => void; }

type Tile = { word: string; origIdx: number; tileId: number };

export const PhraseArrange: React.FC<PhraseArrangeProps> = ({ word, onResult }) => {
  const sound = useSound();
  const phraseWords = word.text.split(' ');

  // Tile pool shuffled once on mount
  const initialTiles = useMemo<Tile[]>(() => {
    const arr: Tile[] = phraseWords.map((w, i) => ({ word: w, origIdx: i, tileId: i }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  const [pool, setPool] = useState<Tile[]>(initialTiles);
  const [built, setBuilt] = useState<Tile[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'wrong' | 'revealed'>('idle');

  const addTile = (tileId: number) => {
    if (status !== 'idle') return;
    const tile = pool.find(t => t.tileId === tileId)!;
    const newPool = pool.filter(t => t.tileId !== tileId);
    const newBuilt = [...built, tile];
    setPool(newPool);
    setBuilt(newBuilt);

    if (newBuilt.length === phraseWords.length) {
      const answer = newBuilt.map(t => t.word).join(' ');
      const correct = answer === word.text;
      if (correct) {
        setStatus('success');
        sound.correct();
        setTimeout(() => onResult(true), 900);
      } else {
        setStatus('wrong');
        sound.wrong();
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 2) {
          setTimeout(() => { setStatus('revealed'); setTimeout(() => onResult(false), 2200); }, 900);
        } else {
          setTimeout(() => { setStatus('idle'); setPool(initialTiles); setBuilt([]); }, 900);
        }
      }
    }
  };

  const removeTile = (tileId: number) => {
    if (status !== 'idle') return;
    const tile = built.find(t => t.tileId === tileId)!;
    setBuilt(built.filter(t => t.tileId !== tileId));
    setPool(p => [...p, tile]);
  };

  const borderColor = status === 'success' ? 'var(--success-color)'
    : status === 'wrong' ? 'var(--error-color)'
    : 'var(--glass-border)';
  const bgColor = status === 'success' ? 'rgba(52,199,89,0.12)'
    : status === 'wrong' ? 'rgba(255,59,48,0.10)'
    : 'var(--glass-bg)';

  return (
    <div className="flex flex-col gap-5 items-center w-full max-w-md mx-auto">
      {/* Подсказка */}
      <div className="glass-card p-4 w-full text-center">
        <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>{word.hint}</p>
        <p className="text-headline mt-1">
          {word.sentence.includes(word.text)
            ? word.sentence.replace(word.text, '——')
            : word.sentence}
        </p>
        <p className="text-caption mt-2" style={{ color: 'var(--text-tertiary)' }}>
          Собери выражение из {phraseWords.length} слов
        </p>
      </div>

      {/* Зона составленного ответа */}
      <motion.div
        className="w-full rounded-2xl flex flex-wrap gap-2 p-3 items-center justify-center"
        style={{ background: bgColor, border: `1.5px solid ${borderColor}`, minHeight: 56, transition: 'background 0.3s, border-color 0.3s' }}
        animate={status === 'wrong' ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {built.length === 0
          ? <span style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Нажимай слова в правильном порядке...</span>
          : built.map(tile => (
            <motion.button
              key={tile.tileId}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => removeTile(tile.tileId)}
              className="letter-tile"
              style={{ fontSize: 15, padding: '6px 12px', height: 'auto', cursor: status === 'idle' ? 'pointer' : 'default' }}
            >
              {tile.word}
            </motion.button>
          ))
        }
      </motion.div>

      {/* Пул доступных слов */}
      <div className="flex flex-wrap gap-2 justify-center w-full">
        {pool.map(tile => (
          <motion.button
            key={tile.tileId}
            whileTap={{ scale: 0.88 }}
            onClick={() => addTile(tile.tileId)}
            className="letter-tile"
            style={{ fontSize: 15, padding: '8px 14px', height: 'auto', opacity: status !== 'idle' ? 0.4 : 1 }}
            disabled={status !== 'idle'}
          >
            {tile.word}
          </motion.button>
        ))}
      </div>

      {status === 'success' && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-headline text-center" style={{ color: 'var(--success-color)' }}>✓ Верно!</motion.p>
      )}
      {status === 'wrong' && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-body text-center" style={{ color: 'var(--error-color)' }}>
          Неверный порядок{attempts < 2 ? ' — попробуй ещё раз' : ''}
        </motion.p>
      )}
      {status === 'revealed' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-caption" style={{ color: 'var(--error-color)' }}>Правильно:</p>
          <p className="text-headline" style={{ letterSpacing: 1, color: 'var(--ios-blue)' }}>{word.text}</p>
        </motion.div>
      )}
    </div>
  );
};
