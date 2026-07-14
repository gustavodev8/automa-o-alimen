import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono, Space_Grotesk } from 'next/font/google';
import { Providers } from '../components/providers';
import './globals.css';

const bodyFont = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
});

const headingFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '700'],
});

const monoFont = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Lanchonete Central',
  description: 'Painel de automação para pedidos via WhatsApp',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${bodyFont.variable} ${headingFont.variable} ${monoFont.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
