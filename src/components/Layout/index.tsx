import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { House, Lightning, ChartBar, Gear } from 'phosphor-react';

export type NavPage = 'map' | 'study' | 'progress' | 'settings';

interface NavItem {
  id: NavPage;
  label: string;
  icon: React.ReactNode;
}

const items: NavItem[] = [
  { id: 'map',      label: 'Карта',     icon: <House weight="fill" size={22} /> },
  { id: 'study',    label: 'Учиться',   icon: <Lightning weight="fill" size={22} /> },
  { id: 'progress', label: 'Прогресс',  icon: <ChartBar weight="fill" size={22} /> },
  { id: 'settings', label: 'Настройки', icon: <Gear weight="fill" size={22} /> },
];

interface BottomNavProps {
  active: NavPage;
  onChange: (page: NavPage) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ active, onChange }) => (
  <nav
    className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-2 py-2"
    style={{
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid var(--nav-border)',
      paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
    }}
  >
    {items.map(item => (
      <button
        key={item.id}
        onClick={() => onChange(item.id)}
        className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl border-none bg-transparent cursor-pointer"
        style={{ minWidth: 60 }}
      >
        <motion.div
          animate={{ scale: active === item.id ? 1.15 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{ color: active === item.id ? 'var(--ios-blue)' : 'var(--text-secondary)' }}
        >
          {item.icon}
        </motion.div>
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          color: active === item.id ? 'var(--ios-blue)' : 'var(--text-secondary)',
          letterSpacing: '0.01em',
        }}>
          {item.label}
        </span>
      </button>
    ))}
  </nav>
);

interface SidebarProps {
  active: NavPage;
  onChange: (page: NavPage) => void;
  childName: string;
  xp: number;
  streak: number;
}

export const DesktopSidebar: React.FC<SidebarProps> = ({ active, onChange, childName, xp, streak }) => (
  <aside
    className="fixed left-0 top-0 bottom-0 z-40 flex flex-col py-8 px-4 w-56"
    style={{
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRight: '1px solid var(--nav-border)',
    }}
  >
    {/* Logo */}
    <div className="mb-8 px-2">
      <div className="text-2xl font-black tracking-tight" style={{ color: 'var(--ios-blue)' }}>
        📚 СЛОВО
      </div>
      {childName && (
        <div className="text-caption mt-1">Привет, {childName}!</div>
      )}
    </div>

    {/* Stats */}
    <div className="glass-card px-3 py-2 mb-6 flex gap-3">
      <div className="text-center flex-1">
        <div className="text-sm font-bold" style={{ color: 'var(--ios-blue)' }}>{xp}</div>
        <div className="text-caption" style={{ fontSize: 10 }}>XP</div>
      </div>
      <div className="w-px" style={{ background: 'var(--glass-border)' }} />
      <div className="text-center flex-1">
        <div className="text-sm font-bold" style={{ color: 'var(--ios-orange)' }}>🔥 {streak}</div>
        <div className="text-caption" style={{ fontSize: 10 }}>ДНЕЙ</div>
      </div>
    </div>

    {/* Nav items */}
    <nav className="flex flex-col gap-1 flex-1">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-[14px] border-none cursor-pointer text-left w-full transition-colors"
          style={{
            background: active === item.id ? 'var(--ios-blue)' : 'transparent',
            color: active === item.id ? '#fff' : 'var(--text-color)',
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          <span style={{ opacity: 0.9 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>

    <div className="text-caption text-center" style={{ fontSize: 11 }}>
      Академия СЛОВО v1
    </div>
  </aside>
);

interface ResponsiveShellProps {
  active: NavPage;
  onChange: (page: NavPage) => void;
  children: React.ReactNode;
  childName: string;
  xp: number;
  streak: number;
}

export const ResponsiveShell: React.FC<ResponsiveShellProps> = ({
  active, onChange, children, childName, xp, streak,
}) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-color)' }}>
      {isDesktop ? (
        <>
          <DesktopSidebar active={active} onChange={onChange} childName={childName} xp={xp} streak={streak} />
          <main style={{ marginLeft: 224, padding: '32px 48px', minHeight: '100dvh' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              {children}
            </div>
          </main>
        </>
      ) : (
        <>
          <main style={{ padding: '16px 16px 90px 16px', minHeight: '100dvh' }}>
            {children}
          </main>
          <BottomNav active={active} onChange={onChange} />
        </>
      )}
    </div>
  );
};
