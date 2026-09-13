import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ClientContext } from '@/core/contexts/ClientContext';
import type { Metadata } from 'next';
import { IBM_Plex_Mono, Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const inter = Inter({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

// Self-hosted: an on-prem deployment cannot reach graphics.hyperi.io, so the
// brand font ships in the console's own bundle rather than the CDN @font-face
// in hyperi-graphics/brand/tokens.css.
const martelSansExtraBold = localFont({
  src: './fonts/martel-sans-extrabold.woff2',
  weight: '800',
  style: 'normal',
  variable: '--font-martel-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DFE UI',
  description: 'Data Fusion Engine management console',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${ibmPlexMono.variable} ${martelSansExtraBold.variable} antialiased min-h-screen overflow-hidden`}
      >
        <AntdRegistry>
          <ClientContext>{children}</ClientContext>
        </AntdRegistry>
      </body>
    </html>
  );
}
