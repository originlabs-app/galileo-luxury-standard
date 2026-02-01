'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { NavSection } from '@/lib/docs-navigation';

interface DocsSidebarProps {
  navigation: NavSection[];
}

export function DocsSidebar({ navigation }: DocsSidebarProps) {
  const pathname = usePathname();
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
        {navigation.map((section) => (
          <div key={section.title}>
            <button
              onClick={() => toggleSection(section.title)}
              className="flex items-center justify-between w-full text-sm font-medium text-[var(--platinum)] mb-3 hover:text-[var(--antique-gold)] transition-colors"
            >
              {section.title}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  expanded.includes(section.title) ? '' : '-rotate-90'
                }`}
              />
            </button>
            {expanded.includes(section.title) && (
              <ul className="space-y-1 pl-3 border-l border-[var(--platinum)]/10">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`block py-1.5 text-sm transition-colors ${
                          isActive
                            ? 'text-[var(--antique-gold)] font-medium border-l-2 border-[var(--antique-gold)] -ml-[calc(0.75rem+1px)] pl-[calc(0.75rem-1px)]'
                            : 'text-[var(--platinum-dim)] hover:text-[var(--platinum)]'
                        }`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
