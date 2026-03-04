import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import type { TargetAndTransition } from 'framer-motion';
import type { MascotMood } from '../../types';

interface MascotContextValue {
  mood: MascotMood;
  message: string;
  setMood: (mood: MascotMood, message?: string, duration?: number) => void;
}

const MascotContext = createContext<MascotContextValue>({
  mood: 'idle',
  message: '',
  setMood: () => {},
});

export const useMascot = () => useContext(MascotContext);

export const MascotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mood, setMoodState] = useState<MascotMood>('idle');
  const [message, setMessage] = useState('');

  const setMood = useCallback((newMood: MascotMood, msg = '', duration = 2500) => {
    setMoodState(newMood);
    setMessage(msg);
    if (newMood !== 'idle') {
      setTimeout(() => { setMoodState('idle'); setMessage(''); }, duration);
    }
  }, []);

  return (
    <MascotContext.Provider value={{ mood, message, setMood }}>
      {children}
    </MascotContext.Provider>
  );
};

// ── BUK SVG owl ──────────────────────────────────────────────────────────────

const BukBody: React.FC<{ mood: MascotMood }> = ({ mood }) => {
  const eyeVariants: Record<MascotMood, React.ReactNode> = {
    idle:     <><circle cx="36" cy="34" r="8" fill="#fff"/><circle cx="64" cy="34" r="8" fill="#fff"/><circle cx="37" cy="35" r="4" fill="#1D1D1F"/><circle cx="65" cy="35" r="4" fill="#1D1D1F"/></>,
    happy:    <><ellipse cx="36" cy="36" rx="8" ry="6" fill="#fff"/><ellipse cx="64" cy="36" rx="8" ry="6" fill="#fff"/><circle cx="37" cy="37" r="4" fill="#1D1D1F"/><circle cx="65" cy="37" r="4" fill="#1D1D1F"/></>,
    excited:  <><circle cx="36" cy="34" r="9" fill="#fff"/><circle cx="64" cy="34" r="9" fill="#fff"/><circle cx="36" cy="34" r="5" fill="#1D1D1F"/><circle cx="64" cy="34" r="5" fill="#1D1D1F"/><circle cx="38" cy="32" r="2" fill="#fff"/><circle cx="66" cy="32" r="2" fill="#fff"/></>,
    sad:      <><ellipse cx="36" cy="37" rx="8" ry="5" fill="#fff"/><ellipse cx="64" cy="37" rx="8" ry="5" fill="#fff"/><circle cx="35" cy="38" r="3.5" fill="#1D1D1F"/><circle cx="63" cy="38" r="3.5" fill="#1D1D1F"/></>,
    thinking: <><ellipse cx="36" cy="34" rx="8" ry="7" fill="#fff"/><ellipse cx="64" cy="34" rx="8" ry="7" fill="#fff"/><circle cx="38" cy="34" r="4" fill="#1D1D1F"/><circle cx="66" cy="34" r="4" fill="#1D1D1F"/></>,
    dance:    <><circle cx="36" cy="33" r="9" fill="#fff"/><circle cx="64" cy="33" r="9" fill="#fff"/><circle cx="35" cy="33" r="5" fill="#1D1D1F"/><circle cx="63" cy="33" r="5" fill="#1D1D1F"/><circle cx="33" cy="31" r="2" fill="#fff"/><circle cx="61" cy="31" r="2" fill="#fff"/></>,
  };

  const mouthVariants: Record<MascotMood, React.ReactNode> = {
    idle:     <path d="M42 50 Q50 55 58 50" stroke="#1D1D1F" strokeWidth="2" fill="none" strokeLinecap="round"/>,
    happy:    <path d="M38 48 Q50 60 62 48" stroke="#1D1D1F" strokeWidth="2.5" fill="none" strokeLinecap="round"/>,
    excited:  <ellipse cx="50" cy="52" rx="8" ry="5" fill="#FF3B30"/>,
    sad:      <path d="M42 55 Q50 48 58 55" stroke="#1D1D1F" strokeWidth="2" fill="none" strokeLinecap="round"/>,
    thinking: <path d="M44 52 Q50 52 58 52" stroke="#1D1D1F" strokeWidth="2" fill="none" strokeLinecap="round"/>,
    dance:    <ellipse cx="50" cy="51" rx="7" ry="4" fill="#FF3B30"/>,
  };

  return (
    <svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="50" cy="80" rx="36" ry="38" fill="#F4A51A"/>
      <ellipse cx="50" cy="85" rx="24" ry="28" fill="#FCD768"/>
      {/* Wings */}
      {mood === 'dance'
        ? <><path d="M14 70 Q2 50 12 35 Q20 55 24 70Z" fill="#E8901A" transform="rotate(-15 14 70)"/><path d="M86 70 Q98 50 88 35 Q80 55 76 70Z" fill="#E8901A" transform="rotate(15 86 70)"/></>
        : <><path d="M14 75 Q2 60 12 40 Q20 60 24 75Z" fill="#E8901A"/><path d="M86 75 Q98 60 88 40 Q80 60 76 75Z" fill="#E8901A"/></>
      }
      {/* Head */}
      <ellipse cx="50" cy="37" rx="30" ry="28" fill="#F4A51A"/>
      {/* Ears / tufts */}
      <path d="M24 18 L18 5 L30 14Z" fill="#E8901A"/>
      <path d="M76 18 L82 5 L70 14Z" fill="#E8901A"/>
      {/* Eye whites */}
      <circle cx="36" cy="36" r="12" fill="#FCD768"/>
      <circle cx="64" cy="36" r="12" fill="#FCD768"/>
      {/* Eyes detailed */}
      {eyeVariants[mood]}
      {/* Beak */}
      <path d="M44 44 L50 52 L56 44Z" fill="#E8901A"/>
      {/* Mouth */}
      {mouthVariants[mood]}
      {/* Feet */}
      <ellipse cx="38" cy="116" rx="10" ry="5" fill="#E8901A"/>
      <ellipse cx="62" cy="116" rx="10" ry="5" fill="#E8901A"/>
    </svg>
  );
};

const moodAnimations: Record<MascotMood, TargetAndTransition> = {
  idle:     { y: [0, -4, 0], transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' } },
  happy:    { y: [0, -12, 0, -8, 0], transition: { duration: 0.6, repeat: 2 } },
  excited:  { rotate: [-8, 8, -8, 8, 0], scale: [1, 1.15, 1, 1.1, 1], transition: { duration: 0.5 } },
  sad:      { y: [0, 4, 0], transition: { repeat: 2, duration: 1 } },
  thinking: { rotate: [0, -5, 0], transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' } },
  dance:    { rotate: [-10, 10, -10, 10, 0], y: [0, -10, 0, -6, 0], transition: { duration: 0.7, repeat: 3 } },
};

export const Mascot: React.FC = () => {
  const { mood, message } = useMascot();
  const [minimized, setMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  const handleTap = () => {
    if (!isDragging) setMinimized(v => !v);
  };

  return (
    <>
      {/* Invisible full-screen constraint box */}
      <div
        ref={constraintsRef}
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 49 }}
      />

      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragConstraints={constraintsRef}
        dragElastic={0.08}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
        className="fixed z-50"
        style={{ bottom: 80, right: 16, touchAction: 'none', cursor: 'grab' }}
        whileDrag={{ cursor: 'grabbing', scale: 1.05 }}
      >
        <div className="flex flex-col items-end gap-2">
          {/* Speech bubble */}
          <AnimatePresence>
            {message && !minimized && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="glass-card px-3 py-2 text-sm font-medium max-w-[160px] text-right"
                style={{ borderRadius: 14, pointerEvents: 'none' }}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Owl or minimized pill */}
          <AnimatePresence mode="wait">
            {minimized ? (
              <motion.div
                key="mini"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={handleTap}
                style={{
                  width: 48, height: 48,
                  borderRadius: '50%',
                  background: 'rgba(244,165,26,0.92)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                  cursor: 'pointer',
                }}
              >
                🦉
              </motion.div>
            ) : (
              <motion.div
                key="full"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ ...moodAnimations[mood], scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                onClick={handleTap}
                style={{ width: 80, height: 96, cursor: 'pointer' }}
                title="Нажми, чтобы спрятать / перетащить"
              >
                <BukBody mood={mood} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};
