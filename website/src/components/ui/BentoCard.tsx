'use client';

import { useRef, type ReactNode, type MouseEvent } from 'react';

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  size?: 'large' | 'small';
  variant?: 'default' | 'gold' | 'blue';
}

export function BentoCard({
  children,
  className = '',
  size = 'large',
  variant = 'default',
}: BentoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty('--mouse-x', `${x}%`);
    cardRef.current.style.setProperty('--mouse-y', `${y}%`);
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--mouse-x', '50%');
    cardRef.current.style.setProperty('--mouse-y', '50%');
  };

  const glowClass = variant === 'blue'
    ? 'angle-glow angle-glow-blue angle-glow-ambient'
    : 'angle-glow angle-glow-ambient';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        relative overflow-hidden rounded-2xl
        bg-[var(--obsidian-surface)] border border-[var(--platinum)]/8
        ${glowClass}
        liquid-glass
        ${size === 'large' ? 'p-8' : 'p-6'}
        ${className}
      `}
      style={{
        '--mouse-x': '50%',
        '--mouse-y': '50%',
      } as React.CSSProperties}
    >
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
