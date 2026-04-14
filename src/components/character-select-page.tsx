'use client';

import { useRef } from 'react';
import { Character, CharacterId } from '@/types/character';
import { CHARACTERS } from '@/data/characters';
import { cn } from '@/lib/utils';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { TimelineContent } from '@/components/ui/timeline-animation';
import { DottedSeparator } from '@/components/site/dotted-separator';
import { SectionHeading } from '@/components/site/section-heading';
import { SiteContainer } from '@/components/site/container';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';

interface CharacterSelectPageProps {
  onSelectCharacter: (id: CharacterId) => void;
}

export function CharacterSelectPage({ onSelectCharacter }: Readonly<CharacterSelectPageProps>) {
  const pageRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={pageRef} className="min-h-[calc(100dvh-10rem)] py-10 md:py-14">
      <SiteContainer>
        <header className="text-left">
          <SectionHeading>Character Select</SectionHeading>
          <TimelineContent
            as="h1"
            animationNum={0}
            timelineRef={pageRef}
            className="mt-4 text-3xl leading-tight font-semibold tracking-tight md:text-4xl"
          >
            选择一位，开始今天的对话
          </TimelineContent>
          <TimelineContent
            as="p"
            animationNum={1}
            timelineRef={pageRef}
            className="text-foreground/65 mt-3 max-w-2xl text-sm leading-relaxed md:text-base"
          >
            每位角色都有独立人设、语气和关系推进节奏，选择后即可进入沉浸式互动。
          </TimelineContent>
        </header>

        <DottedSeparator className="my-8" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHARACTERS.map((character, index) => (
            <TimelineContent
              key={character.id}
              animationNum={index + 2}
              timelineRef={pageRef}
            >
              <CharacterCard
                character={character}
                index={index}
                onClick={() => onSelectCharacter(character.id)}
              />
            </TimelineContent>
          ))}
        </div>
      </SiteContainer>
    </div>
  );
}

interface CharacterCardProps {
  character: Character;
  index: number;
  onClick: () => void;
}

function CharacterCard({ character, onClick }: Readonly<CharacterCardProps>) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();

  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [shouldReduceMotion ? 0 : 5, shouldReduceMotion ? 0 : -5]),
    { stiffness: 300, damping: 30 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [shouldReduceMotion ? 0 : -5, shouldReduceMotion ? 0 : 5]),
    { stiffness: 300, damping: 30 }
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div style={{ perspective: '1000px' }}>
      <motion.button
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className={cn(
          'border-border/80 bg-card relative w-full rounded-2xl border p-4 text-left',
          'transition-[border-color,box-shadow,transform] duration-200 ease-out',
          'hover:border-foreground/35 hover:shadow-xl hover:shadow-black/5',
        )}
      >
        <GlowingEffect
          spread={36}
          glow
          disabled={false}
          proximity={70}
          inactiveZone={0.01}
          borderWidth={1.2}
        />

        <div className="flex items-center gap-3">
          <div className="bg-secondary size-14 overflow-hidden rounded-full">
            <img
              src={character.avatar}
              alt={character.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.id}`;
              }}
            />
          </div>

          <div>
            <h3 className="text-foreground text-base font-semibold tracking-tight">
              {character.name}
              <span className="text-foreground/55 ml-1 text-xs font-normal">{character.age}岁</span>
            </h3>
            <p className="text-foreground/55 mt-1 text-xs">{character.profession}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {character.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-secondary text-foreground/65 rounded-full px-2 py-0.5 text-[10px]"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="text-foreground mt-3 text-sm leading-relaxed">“{character.quote}”</p>
        <p className="text-foreground/65 mt-2 line-clamp-2 text-xs leading-relaxed">{character.background}</p>
      </motion.button>
    </div>
  );
}
