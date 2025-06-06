'use client';

import Script from 'next/script';
import { env } from '@/utils/env';

export function GoogleAnalytics() {
  return (
    <>
      {/* Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${env.gaTrackingId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${env.gaTrackingId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
