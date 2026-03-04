import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ResponsiveShell, type NavPage } from './components/Layout';
import { WorldMap } from './components/WorldMap';
import { SessionEngine } from './components/Session';
import { ProgressScreen } from './components/Progress';
import { SettingsScreen } from './components/Settings';
import { Mascot, MascotProvider } from './components/Mascot';
import { useTheme } from './hooks/useTheme';
import { useProgressStore } from './store/progressStore';
import { useSettingsStore } from './store/settingsStore';

// Onboarding screen shown when no name is set
const Onboarding: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const { setChildName } = useSettingsStore();
  const [name, setName] = useState('');

  const handleStart = () => {
    if (name.trim()) setChildName(name.trim());
    onDone();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-6 z-50"
      style={{ background: 'var(--bg-color)' }}
    >
      <div className="bg-blob" />
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
        className="glass-modal p-8 w-full max-w-sm text-center flex flex-col gap-5"
      >
        <div style={{ fontSize: 72 }}>📚</div>
        <h1 className="text-display">Академия СЛОВО</h1>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
          Учись писать без ошибок — увлекательно и весело!
        </p>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Как тебя зовут?"
          className="word-input"
          style={{ fontSize: 18 }}
          maxLength={20}
          onKeyDown={e => e.key === 'Enter' && handleStart()}
          autoFocus
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleStart}
          className="btn-primary py-4 text-lg font-bold w-full"
          style={{ borderRadius: 'var(--radius-btn)' }}
        >
          Начать приключение! 🚀
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

const AppContent: React.FC = () => {
  useTheme();

  const { xp, streak } = useProgressStore();
  const { childName } = useSettingsStore();

  const [page, setPage] = useState<NavPage>('map');
  const [sessionGrade, setSessionGrade] = useState<number | null>(null);
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem('slovo-settings') && !!JSON.parse(localStorage.getItem('slovo-settings') || '{}')?.state?.childName);

  const handleStartSession = (grade: number) => {
    setSessionGrade(grade);
    setPage('study');
  };

  const handleSessionComplete = () => {
    setSessionGrade(null);
    setPage('map');
  };

  if (!onboarded) {
    return (
      <AnimatePresence>
        <Onboarding onDone={() => setOnboarded(true)} />
      </AnimatePresence>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'map':
        return <WorldMap onStartSession={handleStartSession} />;
      case 'study':
        return sessionGrade
          ? <SessionEngine grade={sessionGrade} onComplete={handleSessionComplete} />
          : <WorldMap onStartSession={handleStartSession} />;
      case 'progress':
        return <ProgressScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <WorldMap onStartSession={handleStartSession} />;
    }
  };

  return (
    <>
      <div className="bg-blob" />
      <ResponsiveShell
        active={page}
        onChange={setPage}
        childName={childName}
        xp={xp}
        streak={streak}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={page + (sessionGrade ?? '')}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </ResponsiveShell>
      <Mascot />
    </>
  );
};

const App: React.FC = () => (
  <MascotProvider>
    <AppContent />
  </MascotProvider>
);

export default App;
