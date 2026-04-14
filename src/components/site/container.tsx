import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SiteContainerProps = ComponentPropsWithoutRef<'div'> & {
  children: ReactNode;
};

export function SiteContainer({ children, className, ...rest }: SiteContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-5xl px-4 md:px-6', className)} {...rest}>
      {children}
    </div>
  );
}
