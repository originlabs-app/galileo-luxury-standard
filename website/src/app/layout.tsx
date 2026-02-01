import type { Metadata } from 'next';
import { Navigation } from '@/components/layout/Navigation';
import './globals.css';

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
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="pt-16">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
