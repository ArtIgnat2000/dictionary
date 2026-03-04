import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../store/settingsStore';
import { useProgressStore } from '../../store/progressStore';
import { GlassCard, IosButton } from '../UI';
import { exportProgress, importProgress } from '../../lib/exportImport';
import type { Theme } from '../../types';
import { APP_VERSION, BUILD_DATE } from '../../version';

export const SettingsScreen: React.FC = () => {
  const {
    childName, setChildName,
    activeGrade, setActiveGrade,
    theme, setTheme,
    soundEnabled, setSoundEnabled,
    wordsPerSession, setWordsPerSession,
  } = useSettingsStore();
  const { reset, unlockGrade } = useProgressStore();
  const importRef = useRef<HTMLInputElement>(null);

  const themeOptions: { value: Theme; label: string; emoji: string }[] = [
    { value: 'auto', label: 'Авто', emoji: '🌗' },
    { value: 'light', label: 'Светлая', emoji: '☀️' },
    { value: 'dark', label: 'Тёмная', emoji: '🌙' },
  ];

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importProgress(file);
      alert('Прогресс успешно загружен!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка');
    }
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('Удалить весь прогресс? Это действие нельзя отменить.')) {
      reset();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-display mb-1">Настройки</h1>
      </motion.div>

      {/* Profile */}
      <GlassCard className="p-5">
        <h3 className="text-headline mb-3">👤 Профиль</h3>
        <input
          type="text"
          value={childName}
          onChange={e => setChildName(e.target.value)}
          placeholder="Имя ребёнка"
          className="word-input"
          style={{ fontSize: 17 }}
          maxLength={20}
        />
      </GlassCard>

      {/* Grade */}
      <GlassCard className="p-5">
        <h3 className="text-headline mb-3">🎓 Класс</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 11 }, (_, i) => i + 1).map(g => (
            <motion.button
              key={g}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setActiveGrade(g); unlockGrade(g); }}
              className="w-10 h-10 rounded-[10px] border-none cursor-pointer font-bold text-base"
              style={{
                background: activeGrade === g ? 'var(--ios-blue)' : 'var(--glass-bg-strong)',
                color: activeGrade === g ? '#fff' : 'var(--text-color)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {g}
            </motion.button>
          ))}
        </div>
      </GlassCard>

      {/* Theme */}
      <GlassCard className="p-5">
        <h3 className="text-headline mb-3">🎨 Тема</h3>
        <div className="flex gap-2">
          {themeOptions.map(t => (
            <motion.button
              key={t.value}
              whileTap={{ scale: 0.93 }}
              onClick={() => setTheme(t.value)}
              className="flex-1 py-2.5 rounded-[14px] border-none cursor-pointer font-semibold text-sm"
              style={{
                background: theme === t.value ? 'var(--ios-blue)' : 'var(--glass-bg-strong)',
                color: theme === t.value ? '#fff' : 'var(--text-color)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {t.emoji} {t.label}
            </motion.button>
          ))}
        </div>
      </GlassCard>

      {/* Sound */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-headline">🔊 Звук</h3>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="border-none cursor-pointer rounded-full px-4 py-1.5 font-semibold text-sm"
            style={{
              background: soundEnabled ? 'var(--success-color)' : 'var(--glass-bg-strong)',
              color: soundEnabled ? '#fff' : 'var(--text-secondary)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {soundEnabled ? 'Включён' : 'Выключен'}
          </motion.button>
        </div>
      </GlassCard>

      {/* Words per session */}
      <GlassCard className="p-5">
        <h3 className="text-headline mb-3">📝 Слов за тренировку: {wordsPerSession}</h3>
        <input
          type="range"
          min={3}
          max={15}
          value={wordsPerSession}
          onChange={e => setWordsPerSession(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--ios-blue)' }}
        />
        <div className="flex justify-between text-caption mt-1">
          <span>3 (быстро)</span>
          <span>15 (полный)</span>
        </div>
      </GlassCard>

      {/* Backup */}
      <GlassCard className="p-5">
        <h3 className="text-headline mb-3">💾 Резервная копия</h3>
        <p className="text-body mb-4" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Сохрани прогресс в файл и загрузи его на другом устройстве.
        </p>
        <div className="flex gap-3 flex-wrap">
          <IosButton variant="secondary" onClick={exportProgress}>
            ⬇ Скачать
          </IosButton>
          <IosButton variant="secondary" onClick={() => importRef.current?.click()}>
            ⬆ Загрузить
          </IosButton>
          <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </GlassCard>

      {/* Danger zone */}
      <GlassCard className="p-5">
        <h3 className="text-headline mb-3" style={{ color: 'var(--error-color)' }}>⚠️ Сброс прогресса</h3>
        <p className="text-body mb-4" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Полностью удалит все данные о прогрессе.
        </p>
        <IosButton variant="danger" onClick={handleReset}>
          Сбросить всё
        </IosButton>
      </GlassCard>

      {/* Version */}
      <GlassCard className="p-5">
        <h3 className="text-headline mb-3">ℹ️ О приложении</h3>
        <div className="flex flex-col gap-2" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          <div className="flex justify-between">
            <span>Академия СЛОВО</span>
            <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>v{APP_VERSION}</span>
          </div>
          <div className="flex justify-between">
            <span>Дата сборки</span>
            <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{BUILD_DATE}</span>
          </div>
          <div className="flex justify-between">
            <span>Словарный запас</span>
            <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>781 слово · 11 классов</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
