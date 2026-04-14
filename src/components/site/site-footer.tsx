import Link from 'next/link';
import { SiteContainer } from '@/components/site/container';

export function SiteFooter() {
  return (
    <footer className="border-border/70 mt-12 border-t">
      <SiteContainer className="py-8">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <p className="text-foreground/50 text-sm">
            予你 · AI 陪伴产品体验
          </p>
          <p className="text-foreground/45 text-sm">
            需要账号？前往{' '}
            <Link href="/register" className="text-foreground/70 hover:text-foreground underline underline-offset-4">
              注册
            </Link>{' '}
            开始使用
          </p>
        </div>
      </SiteContainer>
    </footer>
  );
}
