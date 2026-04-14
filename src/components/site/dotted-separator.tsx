'use client';

import { cn } from '@/lib/utils';
import { DottedUnderline, type DottedUnderlineProps } from '@/components/site/dotted-underline';

type DottedSeparatorProps = Omit<DottedUnderlineProps, 'className'> & {
  className?: string;
  svgClassName?: string;
};

export function DottedSeparator({
  className,
  svgClassName,
  ...dottedProps
}: DottedSeparatorProps) {
  return (
    <div aria-hidden className={cn('w-full shrink-0', className)}>
      <DottedUnderline
        {...dottedProps}
        className={cn(
          'relative right-auto bottom-auto left-auto block w-full opacity-50',
          svgClassName,
        )}
      />
    </div>
  );
}
