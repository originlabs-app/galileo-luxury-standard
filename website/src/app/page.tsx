import {
  AbysseHero,
  DiscoverSection,
  DescentSection,
  BioluminescentFeatures,
  UseCasesSection,
  TreasureReveal,
} from '@/components/abysse';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'Galileo Protocol | The Open Standard for Luxury Authentication',
  description: 'Dive into truth. The definitive protocol for luxury product authenticity. Where counterfeits dissolve under pressure.',
};

export default function Home() {
  return (
    <main className="bg-black">
      {/* Hero: Surface - Sky meets ocean */}
      <AbysseHero />

      {/* Discover: What is Galileo */}
      <DiscoverSection />

      {/* Descent: Interactive scroll journey 0m → 6000m */}
      <DescentSection />

      {/* Features: Bioluminescent capabilities */}
      <BioluminescentFeatures />

      {/* Use Cases: Luxury verticals */}
      <UseCasesSection />

      {/* Treasure: The reveal - Absolute Truth */}
      <TreasureReveal />

      {/* Footer: Rise to surface + navigation */}
      <Footer />
    </main>
  );
}
