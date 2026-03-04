import { useProgressStore } from '../store/progressStore';
import { useSettingsStore } from '../store/settingsStore';

export function exportProgress(): void {
  const progress = localStorage.getItem('slovo-progress');
  const settings = localStorage.getItem('slovo-settings');
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    progress: progress ? JSON.parse(progress) : null,
    settings: settings ? JSON.parse(settings) : null,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `slovo-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importProgress(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.progress?.state) {
          useProgressStore.getState().importData(data.progress.state);
        }
        if (data.settings?.state) {
          const s = data.settings.state;
          const settings = useSettingsStore.getState();
          if (s.childName) settings.setChildName(s.childName);
          if (s.activeGrade) settings.setActiveGrade(s.activeGrade);
          if (s.theme) settings.setTheme(s.theme);
          if (typeof s.soundEnabled === 'boolean') settings.setSoundEnabled(s.soundEnabled);
          if (s.wordsPerSession) settings.setWordsPerSession(s.wordsPerSession);
        }
        resolve();
      } catch (err) {
        reject(new Error('Неверный формат файла'));
      }
    };
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file);
  });
}
