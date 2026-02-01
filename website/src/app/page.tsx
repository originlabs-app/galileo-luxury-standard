import { Hero } from '@/components/sections/Hero';
import { ValueProposition } from '@/components/sections/ValueProposition';
import { Architecture } from '@/components/sections/Architecture';
import { Features } from '@/components/sections/Features';
import { Standards } from '@/components/sections/Standards';
import { Regulatory } from '@/components/sections/Regulatory';
import { Footer } from '@/components/layout/Footer';

export default async function Home() {
  return (
    <main>
      <Hero />
      <ValueProposition />
      <Architecture />
      <Features />
      <Standards />
      <Regulatory />
      <Footer />
    </main>
  );
}
