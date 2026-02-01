'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { SpecNavSection } from '@/lib/specs-navigation';

// ============================================================================
// Types
// ============================================================================

interface SpecsSidebarProps {
  navigation: SpecNavSection[];
}

// ============================================================================
// Status Badge Component
// ============================================================================

interface StatusDotProps {
  status: 'Draft' | 'Active' | 'Standard';
}

const statusColors = {
  Draft: 'bg-yellow-500',
  Active: 'bg-green-500',
  Standard: 'bg-blue-500',
};

const statusLabels = {
  Draft: 'Draft specification',
  Active: 'Active specification',
  Standard: 'Finalized standard',
};

function StatusDot({ status }: StatusDotProps) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${statusColors[status]} opacity-60`}
      title={statusLabels[status]}
      aria-label={statusLabels[status]}
    />
  );
}

// ============================================================================
// Sidebar Component
// ============================================================================

export function SpecsSidebar({ navigation }: SpecsSidebarProps) {
  const pathname = usePathname();

  // Initialize all sections as expanded
  const [expanded, setExpanded] = useState<string[]>(
    navigation.map((s) => s.title)
  );

  const toggleSection = (title: string) => {
    setExpanded((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <nav className="sticky top-24 pr-6 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
        {/* Sidebar header */}
        <div className="pb-4 border-b border-[var(--platinum)]/10">
          <Link
            href="/specifications"
            className="text-sm font-medium text-[var(--platinum)] hover:text-[var(--antique-gold)] transition-colors"
          >
            All Specifications
          </Link>
        </div>

        {/* Category sections */}
        {navigation.map((section) => (
          <div key={section.title}>
            {/* Section header (collapsible) */}
            <button
              onClick={() => toggleSection(section.title)}
              className="flex items-center justify-between w-full text-sm font-medium text-[var(--platinum)] mb-3 hover:text-[var(--antique-gold)] transition-colors"
            >
              <span className="flex items-center gap-2">
                {section.title}
                <span className="text-xs text-[var(--platinum-dim)]">
                  ({section.items.length})
                </span>
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  expanded.includes(section.title) ? '' : '-rotate-90'
                }`}
              />
            </button>

            {/* Section items */}
            {expanded.includes(section.title) && (
              <ul className="space-y-1 pl-3 border-l border-[var(--platinum)]/10">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2 py-1.5 text-sm transition-colors ${
                          isActive
                            ? 'text-[var(--antique-gold)] font-medium border-l-2 border-[var(--antique-gold)] -ml-[calc(0.75rem+1px)] pl-[calc(0.75rem-1px)]'
                            : 'text-[var(--platinum-dim)] hover:text-[var(--platinum)]'
                        }`}
                      >
                        <StatusDot status={item.status} />
                        <span className="truncate" title={item.title}>
                          {item.title}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}

        {/* Status legend */}
        <div className="pt-4 border-t border-[var(--platinum)]/10">
          <p className="text-xs text-[var(--platinum-dim)] mb-2">Status</p>
          <div className="space-y-1 text-xs text-[var(--platinum-dim)]">
            <div className="flex items-center gap-2">
              <StatusDot status="Draft" />
              <span>Draft</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status="Active" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status="Standard" />
              <span>Standard</span>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
