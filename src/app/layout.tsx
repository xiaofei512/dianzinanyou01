import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ClientProviders } from '@/components/client-providers';

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
    <html lang="zh-CN">
      <head>
        {/* 引入 Noto Serif SC 中文字体 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`antialiased bg-[#FAF7F2]`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
