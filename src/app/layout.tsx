// src/app/layout.tsx

import './globals.css';
import { Quicksand, Lora } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google'

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['300','400', '500', '600', '700'], // You can customize this
  variable: '--font-body',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
});

export const metadata = {
  title: 'Serelora',
  description:
    'Serelora',
  icons: {
    icon: '/stealth-circle.png',
    shortcut: '/stealth-circle.png',
    apple: '/stealth-circle.png'
  },
  keywords: [
    'Serelora'
  ],
  authors: [{ name: 'Serelora Team', url: 'https://serelora.com' }],
  creator: 'Serelora',
  metadataBase: new URL('https://serelora.com'),
  openGraph: {
    title: 'Serelora',
    description:
      'Serelora',
    url: 'https://serelora.com',
    siteName: 'Serelora',
    images: [
      {
        url: 'https://serelora.com/stealth-square.jpg',
        width: 1200,
        height: 630,
        alt: 'Serelora Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Serelora',
    description:
      'Serelora',
    site: '@serelora',
    creator: '@serelora',
    images: ['https://serelora.com/stealth-square.jpg'],
  },
};



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${quicksand.variable} ${lora.variable}`}>
      <head>
        {/* ✅ JSON-LD Structured Data for Google Logo */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Serelora",
              "url": "https://www.serelora.com",
              "logo": "https://www.serelora.com/stealth-circle.png",
              "sameAs": [
                "https://www.linkedin.com/company/serelora"
              ]
            })
          }}
        />

      </head>
      <body>{children}</body>
      <GoogleAnalytics gaId="G-RSLC4ZEHW9" />
    </html>
  );
}
