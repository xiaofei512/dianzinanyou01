"use client";

import { cn } from "@/lib/utils";

interface ProgressiveBlurProps {
  className?: string;
  blurIntensity?: number;
}

export function ProgressiveBlur({ className, blurIntensity = 0.5 }: ProgressiveBlurProps) {
  return (
    <div
      className={cn("pointer-events-none", className)}
      style={{
        background: `linear-gradient(to top, rgba(0,0,0,${Math.min(blurIntensity * 1.2, 0.8)}), transparent)`,
      }}
    />
  );
}
