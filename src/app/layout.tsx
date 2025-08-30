import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import PerformanceMonitor from '@/components/PerformanceMonitor';

// Optimize font loading
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Prevent font loading from blocking rendering
  preload: true,
});

export const metadata: Metadata = {
  title: 'Store Locator - Find Stores Near You',
  description: 'Discover and locate stores, restaurants, and businesses in your area with our intelligent search platform.',
  keywords: 'store locator, business finder, local search, store directory',
  authors: [{ name: 'Store Locator Team' }],
  // Performance optimizations
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Navigation />
          <main>
            {children}
          </main>
          <Footer />
          <PerformanceMonitor />
        </AuthProvider>
      </body>
    </html>
  );
}
