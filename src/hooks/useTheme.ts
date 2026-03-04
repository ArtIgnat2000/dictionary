import { useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';

export function useTheme() {
  const theme = useSettingsStore(s => s.theme);

  useEffect(() => {
    const apply = (isDark: boolean) => {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      document.querySelector('meta[name="theme-color"][media*="light"]')?.setAttribute('content', isDark ? '#1C1C1E' : '#F5F5F7');
    };

    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches);
      const handler = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      apply(theme === 'dark');
    }
  }, [theme]);
}

export function useBreakpoint() {
  // Returns true if viewport is desktop (>= 1024px)
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
}
