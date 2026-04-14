'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DottedUnderline } from '@/components/site/dotted-underline';
import { SiteContainer } from '@/components/site/container';
import { useAuth } from '@/contexts/auth-context';

type NavLink = {
  title: string;
  href: string;
};

const links: NavLink[] = [
  { title: '首页', href: '/' },
  { title: '登录', href: '/login' },
  { title: '注册', href: '/register' },
];

function isActivePath(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="border-border/70 bg-theme-bg/85 sticky top-0 z-40 border-b backdrop-blur-md">
      <SiteContainer className="flex items-start justify-between gap-5 py-4 md:items-center md:py-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-md bg-black text-sm font-semibold text-white">
            予
          </span>
          <div className="space-y-0.5">
            <p className="text-foreground text-base leading-none font-semibold tracking-tight">予你</p>
            <p className="text-foreground/55 text-xs">AI 陪伴应用</p>
          </div>
        </div>

        <nav className="flex items-center gap-4 md:gap-5">
          {links.map((link) => {
            if (user && (link.href === '/login' || link.href === '/register')) {
              return null;
            }

            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'group relative pb-1 text-sm transition-colors',
                  active ? 'text-foreground' : 'text-foreground/65 hover:text-foreground',
                )}
              >
                {link.title}
                <DottedUnderline className={cn(active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')} />
              </Link>
            );
          })}
        </nav>

        <div className="flex min-w-[84px] justify-end">
          {!isLoading && user ? (
            <button
              onClick={handleLogout}
              className="text-foreground/70 hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
            >
              <LogOut className="size-4" />
              退出
            </button>
          ) : (
            <span className="text-foreground/60 inline-flex items-center gap-1.5 text-xs">
              <Sparkles className="size-3.5" />
              全新界面
            </span>
          )}
        </div>
      </SiteContainer>
    </header>
  );
}
