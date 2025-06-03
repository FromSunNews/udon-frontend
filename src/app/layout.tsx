import type { Metadata } from 'next';
// import EnvironmentBadge from '@/components/environment-badge';
import { Analytics } from '@/analytics';
import { SITE_URL } from '@/utils/env';
import { Providers } from '@/providers';
import './globals.css';
import localFont from 'next/font/local';
import { Toaster } from '@/components/common/sonner';

const BattlefinFont = localFont({
  src: '../../public/fonts/Battlefin-Black.woff2',
  variable: '--font-battlefin',
  weight: '900',
});

const NBInternationalFont = localFont({
  variable: '--font-nb-international',
  src: [
    {
      path: '../../public/fonts/NBInternationalLightWebfont.woff2',
      weight: '300',
    },
    {
      path: '../../public/fonts/NBInternationalRegularWebfont.woff2',
      weight: '400',
    },
    {
      path: '../../public/fonts/NBInternationalBoldWebfont.woff2',
      weight: '700',
    },
  ],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Udon Finance',
    default: 'Udon Finance - Unlocking Liquidity Money Markets and Leverage on Chromia',
  },
  description: 'Unlocking Liquidity Money Markets and Leverage on Chromia',
  keywords: ['next.js', 'react', 'typescript', 'web development'],
  authors: [{ name: 'Udon Team' }],
  creator: 'Udon Team',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  manifest: '/favicon/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    other: [
      { url: '/favicon/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Udon Finance',
    description: 'Unlocking Liquidity Money Markets and Leverage on Chromia',
    url: SITE_URL,
    siteName: 'Udon Finance',
    images: [
      {
        url: '/seo/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Udon Finance',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Udon Finance',
    description: 'Unlocking Liquidity Money Markets and Leverage on Chromia',
    images: [SITE_URL + '/seo/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontClasses = `${BattlefinFont.variable} ${NBInternationalFont.variable}`;

  return (
    <html lang="en" className={fontClasses} suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground" suppressHydrationWarning>
        <Providers>{children}</Providers>
        {/* TODO: remove this when we have a production environment */}
        {/* <EnvironmentBadge /> */}
        {/* Analytics webpage */}
        <Analytics />
        {/* Toaster */}
        <Toaster closeButton richColors />
      </body>
    </html>
  );
}
