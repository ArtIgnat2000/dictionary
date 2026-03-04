import { useSettingsStore } from '../store/settingsStore';
import { playCorrect, playWrong, playStreak, playSessionComplete } from '../lib/sounds';

export function useSound() {
  const soundEnabled = useSettingsStore(s => s.soundEnabled);

  return {
    correct: () => { if (soundEnabled) playCorrect(); },
    wrong:   () => { if (soundEnabled) playWrong(); },
    streak:  () => { if (soundEnabled) playStreak(); },
    session: (stars: number) => { if (soundEnabled) playSessionComplete(stars); },
  };
}
