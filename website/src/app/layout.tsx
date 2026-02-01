import type { Metadata } from 'next';
import { Outfit, Inter, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google';
import { Navigation } from '@/components/layout/Navigation';
import './globals.css';

// Swiss-Luxe Typography Stack
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-satoshi', // Satoshi proxy until we add local font
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Galileo Luxury Standard',
  description: 'The open standard for luxury product authenticity and compliance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} ${cormorant.variable} ${jetbrainsMono.variable}`}>
      <body className="pt-16">
        <Navigation />
        <main className="spatial-background min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
