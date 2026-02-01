import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { docsNavigation } from '@/lib/docs-navigation';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container">
      <div className="flex gap-12 py-12">
        <DocsSidebar navigation={docsNavigation} />
        <main className="flex-1 min-w-0 max-w-3xl">
          <article className="prose">
            {children}
          </article>
        </main>
      </div>
    </div>
  );
}
