'use client';

import { Character, CharacterId } from '@/types/character';
import { CHARACTERS } from '@/data/characters';
import { cn } from '@/lib/utils';
import { GlowingEffect } from '@/components/ui/glowing-effect';
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
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      {/* 头部 */}
      <header className="pt-12 pb-8 text-center">
        <h1 className="text-3xl font-medium text-[#1A1612] tracking-wider" style={{ fontFamily: 'Noto Serif SC, serif' }}>
          予你
        </h1>
        <p className="text-sm text-[#7A6E64] mt-2">选择一位开始对话</p>
      </header>

      {/* 角色卡片网格 */}
      <div className="flex-1 px-6 pb-8">
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          {CHARACTERS.map((character, index) => (
            <CharacterCard
              key={character.id}
              character={character}
              index={index}
              onClick={() => onSelectCharacter(character.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CharacterCardProps {
  character: Character;
  index: number;
  onClick: () => void;
}

function CharacterCard({ character, index, onClick }: Readonly<CharacterCardProps>) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();

  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [shouldReduceMotion ? 0 : 6, shouldReduceMotion ? 0 : -6]),
    { stiffness: 300, damping: 30 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [shouldReduceMotion ? 0 : -6, shouldReduceMotion ? 0 : 6]),
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
          animationDelay: `${index * 50}ms`,
          animationFillMode: 'both',
        }}
        className={cn(
          'relative bg-white rounded-[20px] p-4 text-left w-full',
          'border border-[#EDE5D8] hover:border-[#C9A96E]',
          'transition-[border-color,box-shadow] duration-200 ease-out',
          'hover:shadow-lg hover:shadow-[#C9A96E]/10',
          'animate-fade-in-up'
        )}
      >
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={1.5}
        />
        {/* 头像 */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-[#F4EFE6]">
          <img
            src={character.avatar}
            alt={character.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.id}`;
            }}
          />
        </div>

        {/* 角色名和年龄 */}
        <h3
          className="text-center text-lg font-medium text-[#1A1612]"
          style={{ fontFamily: 'Noto Serif SC, serif' }}
        >
          {character.name}
          <span className="text-sm font-normal text-[#7A6E64] ml-1">{character.age}岁</span>
        </h3>

        {/* 职业 */}
        <p className="text-center text-xs text-[#7A6E64] mt-1">{character.profession}</p>

        {/* 三个性格标签 */}
        <div className="flex justify-center gap-1.5 mt-3 flex-wrap">
          {character.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-[#7A6E64] bg-[#F4EFE6] px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 代表性话语 */}
        <p className="text-center text-xs text-[#C9A96E] mt-3 italic line-clamp-2 font-medium">
          "{character.quote}"
        </p>

        {/* 背景介绍 */}
        <p className="text-[10px] text-[#7A6E64] mt-3 line-clamp-2 leading-relaxed">
          {character.background}
        </p>

        {/* 与用户的关系 */}
        <p className="text-[10px] text-[#B0A89E] mt-2 line-clamp-2 leading-relaxed">
          {character.relationship}
        </p>
      </motion.button>
    </div>
  );
}
