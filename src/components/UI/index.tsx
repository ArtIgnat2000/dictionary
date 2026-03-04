import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', strong, onClick, style }) => (
  <div
    className={`${strong ? 'glass-card-strong' : 'glass-card'} ${className}`}
    onClick={onClick}
    style={style}
  >
    {children}
  </div>
);

interface IosButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  fullWidth?: boolean;
}

export const IosButton: React.FC<IosButtonProps> = ({
  children, onClick, variant = 'primary', size = 'md',
  disabled, className = '', type = 'button', fullWidth,
}) => {
  const sizeStyles: Record<string, string> = {
    sm: 'px-4 py-2 text-[15px]',
    md: 'px-6 py-3.5 text-[17px]',
    lg: 'px-8 py-4 text-[19px]',
  };
  const variantStyles: Record<string, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'bg-[var(--error-color)] text-white rounded-[var(--radius-btn)] font-semibold cursor-pointer border-none',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.94 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className} select-none`}
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {children}
    </motion.button>
  );
};

interface ProgressBarProps {
  value: number;      // 0–100
  total?: number;
  current?: number;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, label, className = '' }) => (
  <div className={className}>
    {label && <p className="text-caption mb-1">{label}</p>}
    <div className="progress-track">
      <motion.div
        className="progress-fill"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
  </div>
);

interface StarRatingProps {
  stars: number;  // 0–3
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ stars, size = 32 }) => (
  <div className="flex gap-1 justify-center">
    {[1, 2, 3].map(i => (
      <motion.span
        key={i}
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: i * 0.15, type: 'spring', stiffness: 500, damping: 20 }}
        style={{ fontSize: size, filter: i <= stars ? 'none' : 'grayscale(1) opacity(0.3)' }}
      >
        ⭐
      </motion.span>
    ))}
  </div>
);

interface XpBadgeProps {
  xp: number;
  className?: string;
}

export const XpBadge: React.FC<XpBadgeProps> = ({ xp, className = '' }) => (
  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--ios-blue)] text-white text-sm font-bold ${className}`}>
    <span>⚡</span>
    <span>{xp}</span>
  </div>
);
