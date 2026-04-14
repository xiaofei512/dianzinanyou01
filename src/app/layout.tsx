import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Serif_SC } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/client-providers';
import { SiteNavbar } from '@/components/site/site-navbar';
import { SiteFooter } from '@/components/site/site-footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const notoSerif = Noto_Serif_SC({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: '予你 | AI陪伴',
    template: '%s | 予你',
  },
  description:
    '予你 - 一款面向中国女性用户的AI陪伴应用，提供沉浸式的文字、语音、图片互动体验。',
  keywords: [
    '予你',
    'AI陪伴',
    'AI男友',
    '情感陪伴',
    '虚拟对话',
  ],
  authors: [{ name: '予你团队' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FAF7F2',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${notoSerif.variable}`}>
      <body className="bg-theme-bg font-sans antialiased">
        <ClientProviders>
          <SiteNavbar />
          <main>{children}</main>
          <SiteFooter />
        </ClientProviders>
      </body>
    </html>
  );
}
