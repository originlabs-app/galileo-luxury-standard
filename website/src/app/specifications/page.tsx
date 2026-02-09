import Link from 'next/link';
import {
  getSpecCategories,
  getSpecifications,
  capitalizeCategory,
} from '@/lib/specifications';
import { getTotalSpecCount } from '@/lib/specs-navigation';
import {
  Building2,
  Shield,
  Fingerprint,
  Server,
  Link2,
  Database,
  Coins,
  Lock,
} from 'lucide-react';

// ============================================================================
// Category Icons
// ============================================================================

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  architecture: Building2,
  compliance: Shield,
  crypto: Lock,
  identity: Fingerprint,
  infrastructure: Server,
  resolver: Link2,
  schemas: Database,
  token: Coins,
};

// ============================================================================
// Category Card Component
// ============================================================================

interface CategoryCardProps {
  name: string;
  count: number;
  previewSpecs: { title: string; status: string }[];
}

function CategoryCard({ name, count, previewSpecs }: CategoryCardProps) {
  const Icon = categoryIcons[name] || Database;

  return (
    <Link
      href={`/specifications/${name}`}
      className="group block p-6 rounded-lg border border-[var(--platinum)]/10 bg-[var(--obsidian)]/50 hover:border-[var(--cyan-primary)]/50 transition-all duration-300 angle-glow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-[var(--cyan-primary)]/10 text-[var(--cyan-primary)]">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs text-[var(--platinum-dim)] bg-[var(--obsidian)] px-2 py-1 rounded">
          {count} spec{count !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-[var(--platinum)] mb-2 group-hover:text-[var(--cyan-primary)] transition-colors">
        {capitalizeCategory(name)}
      </h2>

      {/* Preview specs */}
      <ul className="space-y-1">
        {previewSpecs.slice(0, 3).map((spec) => (
          <li
            key={spec.title}
            className="text-sm text-[var(--platinum-dim)] truncate"
            title={spec.title}
          >
            {spec.title}
          </li>
        ))}
        {count > 3 && (
          <li className="text-sm text-[var(--platinum-dim)] italic">
            +{count - 3} more...
          </li>
        )}
      </ul>
    </Link>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default async function SpecificationsPage() {
  const categories = await getSpecCategories();
  const totalSpecs = await getTotalSpecCount();

  // Get specs for each category (for counts and previews)
  const categoriesWithSpecs = await Promise.all(
    categories.map(async (category) => {
      const specs = await getSpecifications(category);
      return {
        name: category,
        count: specs.length,
        previewSpecs: specs.slice(0, 4).map((s) => ({
          title: s.title,
          status: s.status,
        })),
      };
    })
  );

  return (
    <div className="max-w-4xl">
      {/* Page header */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--platinum)] mb-4">
          Technical Specifications
        </h1>
        <p className="text-lg text-[var(--platinum-dim)] leading-relaxed">
          Browse {totalSpecs} technical specifications across {categories.length}{' '}
          categories. Each specification includes detailed technical requirements,
          schemas, and implementation guidance for the Galileo Luxury Standard
          protocol.
        </p>
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-8 p-4 rounded-lg bg-[var(--obsidian)]/50 border border-[var(--platinum)]/10">
        <span className="text-sm text-[var(--platinum-dim)]">Status:</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500 opacity-60" />
          <span className="text-sm text-[var(--platinum-dim)]">Draft</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 opacity-60" />
          <span className="text-sm text-[var(--platinum-dim)]">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 opacity-60" />
          <span className="text-sm text-[var(--platinum-dim)]">Standard</span>
        </div>
      </div>

      {/* Category grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesWithSpecs.map((category) => (
          <CategoryCard
            key={category.name}
            name={category.name}
            count={category.count}
            previewSpecs={category.previewSpecs}
          />
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-12 pt-8 border-t border-[var(--platinum)]/10">
        <p className="text-sm text-[var(--platinum-dim)]">
          These specifications define the technical foundation of the Galileo Luxury
          Standard. They are organized by domain and include JSON schemas, protocol
          definitions, and integration guides. All specifications follow semantic
          versioning.
        </p>
      </div>
    </div>
  );
}
