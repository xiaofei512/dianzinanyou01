// 角色类型定义

export type CharacterId = 'shen' | 'lin' | 'gu' | 'fang' | 'jiang' | 'pei';

export type StageLevel = 0 | 1 | 2; // 0: 初识, 1: 熟悉, 2: 亲密

export interface Stage {
  level: StageLevel;
  name: string; // 阶段名称
  icon: string; // 阶段图标
  minAffection: number;
  maxAffection: number;
  themeColor: string;
  delay: number; // 回复延迟基数
  delayRandom: number; // 回复延迟随机范围
}

export interface CharacterStage {
  pool: string[]; // 语料库
  unlockMsg: string; // 解锁消息
}

export interface Character {
  id: CharacterId;
  name: string;
  age: number; // 年龄
  englishName: string;
  profession: string;
  type: string;
  tags: string[]; // 性格标签（三个）
  quote: string; // 代表性话语
  background: string; // 角色背景介绍
  relationship: string; // 与用户的关系
  avatar: string;
  avatarIcon: string; // 头像图标（emoji或图片URL）
  referenceImage: string; // 角色三视图URL（用于图生图参考）
  themeColor: string; // 主题色（用于卡片背景）
  voiceId: string;
  systemPrompt: string;
  stages: {
    0: CharacterStage; // 初识
    1: CharacterStage; // 熟悉
    2: CharacterStage; // 亲密
  };
  unlockMsg: string[]; // 各阶段解锁消息 [初识->熟悉, 熟悉->亲密]
  quickReplies: string[]; // 快捷回复建议
}

// 消息类型
export type MessageType = 'text' | 'voice' | 'image';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: MessageType;
  audioUrl?: string;
  imageUrl?: string;
  cachedAudioUrl?: string; // 缓存的语音 URL（会话级）
  timestamp: number;
}

// 好感度状态
export interface AffectionState {
  value: number;
  stage: StageLevel;
  msgCount: number;
}

// 聊天会话状态
export interface ChatSession {
  characterId: CharacterId;
  messages: Message[];
  affection: AffectionState;
}
