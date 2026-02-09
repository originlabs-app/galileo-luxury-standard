'use client';

import { useRef, type ReactNode, type MouseEvent } from 'react';

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  size?: 'large' | 'small';
  variant?: 'default' | 'gold' | 'blue';
  style?: React.CSSProperties;
}

export function BentoCard({
  children,
  className = '',
  size = 'large',
  variant = 'default',
  style: externalStyle,
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

  // Variant-specific glow classes
  const glowClass = variant === 'blue'
    ? 'angle-glow angle-glow-blue angle-glow-ambient'
    : 'angle-glow angle-glow-ambient';

  // Variant-specific hover border tint
  const hoverBorderClass = variant === 'blue'
    ? 'hover:border-[rgba(0,163,255,0.15)]'
    : 'hover:border-[rgba(0,255,255,0.15)]';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-b from-[var(--graphite)] to-[var(--obsidian)]
        border-t border-[rgba(255,255,255,0.06)]
        border border-[rgba(168,168,179,0.08)]
        precision-line
        ${glowClass}
        liquid-glass
        transition-all duration-300
        hover:scale-[1.01]
        ${hoverBorderClass}
        ${size === 'large' ? 'p-8' : 'p-6'}
        ${className}
      `}
      style={{
        '--mouse-x': '50%',
        '--mouse-y': '50%',
        boxShadow: `
          0 1px 2px rgba(0, 0, 0, 0.3),
          0 4px 8px rgba(0, 0, 0, 0.2),
          0 8px 16px rgba(0, 0, 0, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.03)
        `,
        transitionTimingFunction: 'var(--ease-precision)',
        ...externalStyle,
      } as React.CSSProperties}
    >
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
