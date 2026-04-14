"use client";

import { ElementType, ComponentPropsWithoutRef, RefObject } from "react";
import { motion, Variants } from "framer-motion";

const defaultVariants: Variants = {
  hidden: { filter: "blur(10px)", y: -20, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.15,
      duration: 0.5,
    },
  }),
};

type TimelineContentProps<C extends ElementType = "div"> = {
  as?: C;
  animationNum?: number;
  timelineRef?: RefObject<HTMLElement | null>;
  customVariants?: Variants;
  children?: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<C>, "as">;

export function TimelineContent<C extends ElementType = "div">({
  as,
  animationNum = 0,
  timelineRef,
  customVariants,
  children,
  className,
  ...props
}: TimelineContentProps<C>) {
  const Tag = (as ?? "div") as ElementType;
  const MotionTag = motion(Tag);

  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, root: timelineRef as RefObject<Element> }}
      variants={customVariants ?? defaultVariants}
      custom={animationNum}
      className={className}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </MotionTag>
  );
}
