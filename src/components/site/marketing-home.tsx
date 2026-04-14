import Link from 'next/link';
import {
  ArrowRight,
  AudioLines,
  HeartHandshake,
  ImageIcon,
  MessageCircleHeart,
  ShieldCheck,
} from 'lucide-react';
import { CHARACTERS } from '@/data/characters';
import { SiteContainer } from '@/components/site/container';
import { SectionHeading } from '@/components/site/section-heading';
import { DottedSeparator } from '@/components/site/dotted-separator';
import { IconBox } from '@/components/site/icon-box';

const features = [
  {
    title: '沉浸式文字互动',
    description: '多角色人格设定，关系随互动逐步推进，保留故事感和连贯性。',
    icon: MessageCircleHeart,
    boxClassName: 'from-neutral-500 to-neutral-700 ring-offset-neutral-600',
  },
  {
    title: '语音回复',
    description: '支持对话语音生成与播放，兼顾情绪表达和陪伴临场感。',
    icon: AudioLines,
    boxClassName: 'from-emerald-400 to-emerald-600 ring-offset-emerald-500',
  },
  {
    title: '图片互动',
    description: '聊天中可触发图像内容，进一步丰富交流场景与氛围。',
    icon: ImageIcon,
    boxClassName: 'from-amber-400 to-amber-600 ring-offset-amber-500',
  },
  {
    title: '关系进展机制',
    description: '好感度与阶段成长可视化，让陪伴体验更有节奏与反馈。',
    icon: HeartHandshake,
    boxClassName: 'from-rose-400 to-rose-600 ring-offset-rose-500',
  },
  {
    title: '安全登录体系',
    description: '注册登录与会话管理清晰可靠，专注体验同时保障账户安全。',
    icon: ShieldCheck,
    boxClassName: 'from-sky-400 to-sky-600 ring-offset-sky-500',
  },
];

export function MarketingHome() {
  const topCharacters = CHARACTERS.slice(0, 6);

  return (
    <SiteContainer className="py-10 md:py-16">
      <section>
        <SectionHeading>AI Companion</SectionHeading>
        <h1 className="mt-4 max-w-4xl text-3xl leading-tight font-semibold tracking-tight text-balance md:text-5xl">
          把你购买的高级模板语言，迁移为
          <span className="from-foreground to-foreground/55 bg-linear-to-r bg-clip-text text-transparent">
            {' '}“予你”专属界面
          </span>
        </h1>
        <p className="text-foreground/70 mt-4 max-w-3xl text-base leading-relaxed md:text-lg">
          当前版本已升级为模板化的信息层级、点状分割线、极简导航与卡片系统，并保留你现有的角色陪伴核心流程。
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/85"
          >
            立即开始
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/login"
            className="border-border text-foreground/85 hover:text-foreground inline-flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm transition"
          >
            我已有账号
          </Link>
        </div>
      </section>

      <DottedSeparator className="my-10 md:my-12" />

      <section>
        <SectionHeading>可选角色</SectionHeading>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topCharacters.map((character) => (
            <article
              key={character.id}
              className="border-border/80 bg-card/65 hover:border-foreground/35 rounded-xl border p-4 transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="size-11 rounded-full object-cover"
                />
                <div>
                  <p className="text-foreground text-sm font-semibold">{character.name}</p>
                  <p className="text-foreground/60 text-xs">{character.profession}</p>
                </div>
              </div>
              <p className="text-foreground/70 mt-3 text-sm leading-relaxed">“{character.quote}”</p>
            </article>
          ))}
        </div>
      </section>

      <DottedSeparator className="my-10 md:my-12" />

      <section>
        <SectionHeading>核心能力</SectionHeading>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <IconBox className={item.boxClassName}>
                <item.icon className="size-4" />
              </IconBox>
              <div>
                <p className="text-foreground font-medium">{item.title}</p>
                <p className="text-foreground/65 mt-1 text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteContainer>
  );
}
