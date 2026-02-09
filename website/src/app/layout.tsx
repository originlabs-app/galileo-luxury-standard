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
  metadataBase: new URL('https://galileoprotocol.io'),
  title: {
    default: 'Galileo Protocol',
    template: '%s | Galileo Protocol',
  },
  description: 'Open standard for luxury product authentication and provenance',
  openGraph: {
    title: 'Galileo Protocol',
    description: 'Open standard for luxury product authentication and provenance',
    url: 'https://galileoprotocol.io',
    siteName: 'Galileo Protocol',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Galileo Protocol',
    description: 'Open standard for luxury product authentication and provenance',
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} ${cormorant.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
