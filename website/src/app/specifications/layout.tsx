import { SpecsSidebar } from '@/components/specifications/SpecsSidebar';
import { buildSpecsNavigation } from '@/lib/specs-navigation';
import type { Metadata } from 'next';

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'Specifications | Galileo Luxury Standard',
  description:
    'Browse 46 technical specifications across 8 categories. Each specification includes detailed technical requirements, schemas, and implementation guidance for the Galileo protocol.',
};

// ============================================================================
// Layout Component
// ============================================================================

export default async function SpecificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Build navigation structure at build time
  const navigation = await buildSpecsNavigation();

  return (
    <div className="container">
      <div className="flex gap-12 py-12">
        {/* Sidebar navigation */}
        <SpecsSidebar navigation={navigation} />

        {/* Main content area */}
        <main className="flex-1 min-w-0">
          <article className="prose">{children}</article>
        </main>
      </div>
    </div>
  );
}
