import type { CardConfig, CardProject } from '../types';

export const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='60' r='60' fill='%23282c34'/%3E%3Ccircle cx='60' cy='46' r='20' fill='%23f4ce45'/%3E%3Cpath d='M28 98c0-18 14-30 32-30s32 12 32 30' fill='%23f4ce45'/%3E%3C/svg%3E";

export const SAMPLE_ARTICLES: { name: string; config: Partial<CardConfig> }[] = [
  {
    name: '晨光阅读 · A Fresh Morning',
    config: {
      cardHeading: '晨读时刻 · MORNING READ',
      volume: 'VOL. 01',
      tagline: '',
      showAvatar: true,
      avatarUrl: '',
      avatarShape: 'circle',
      avatarSize: 56,
      articleTitle: 'Start Your Day with Calm',
      author: '',
      articleContent: `Every morning gives us a **fresh start** and a new chance to shape our day. Before reaching for your phone or rushing into work, take a deep breath. Give yourself a few quiet minutes to wake up gently, listen to the world around you, and feel grateful for a new day.

Pour a warm cup of coffee or tea and sit comfortably by the window. Reading just a few pages of a good book can inspire clear thoughts and awaken your mind. When you make time for simple moments, the day ahead feels much lighter and more enjoyable.

How you begin your morning often guides the rest of your day. When you start with calm and intention, you carry that **peace and confidence** into everything you do.`,
      showImage: false,
      theme: 'paper',
      fontFamily: 'literata',
      fontSize: 27,
      lineHeight: 1.75,
      paragraphSpacing: 12,
      fontWeight: 500,
      isBold: false,
      showTexture: true,
      textureType: 'paper',
      textureIntensity: 'medium',
      showFooter: true,
      footerText: 'ONE PAGE A DAY · 每日慢读一页书',
    },
  },
  {
    name: '持续成长 · Small Daily Steps',
    config: {
      cardHeading: '成长手记 · GROWTH FLOW',
      volume: 'VOL. 02',
      tagline: '',
      showAvatar: true,
      avatarUrl: '',
      avatarShape: 'squircle',
      avatarSize: 56,
      articleTitle: 'The Power of Small Steps',
      author: '',
      articleContent: `Big dreams are never built in a single afternoon. Instead, they are created by the **small habits** you choose to keep each day. It is easy to think that small actions do not matter, but real progress is always built quietly over time.

Reading for ten minutes, writing down a new thought, or practicing a skill every day might feel modest right now. However, when you repeat these small efforts consistently, they slowly compound into **remarkable achievements** that surprise even yourself. Consistency always beats temporary enthusiasm.

Do not worry about how fast other people are moving. Keep your focus on your own path, celebrate every little victory, and take the next simple step forward with patience and trust.`,
      showImage: false,
      theme: 'matcha',
      fontFamily: 'literata',
      fontSize: 26,
      lineHeight: 1.75,
      paragraphSpacing: 12,
      fontWeight: 500,
      isBold: false,
      showTexture: true,
      textureType: 'linen',
      textureIntensity: 'medium',
      showFooter: true,
      footerText: 'KEEP GROWING · 坚持微小的力量',
    },
  },
  {
    name: '生活之美 · Joy in Simple Things',
    config: {
      cardHeading: '生活随想 · SIMPLE LIFE',
      volume: 'VOL. 03',
      tagline: '',
      showAvatar: false,
      avatarUrl: '',
      avatarShape: 'circle',
      avatarSize: 56,
      articleTitle: 'Enjoy the Simple Moments',
      author: '',
      articleContent: `True happiness is rarely found in having more things. More often, it lives in the **simple moments** we tend to overlook in our busy routines. When we slow down, we begin to realize that our everyday lives are already filled with quiet beauty.

Notice the warmth of the sun on your face, the aroma of fresh coffee in the kitchen, or a sincere conversation with an old friend. These small experiences do not cost anything, yet they bring a deep sense of **comfort and gratitude** that busy days cannot buy.

You do not need an extraordinary life to feel happy. Learn to pause, breathe deeply, and appreciate where you are right now. When you live in the present, every day holds something wonderful.`,
      showImage: false,
      theme: 'minimal',
      fontFamily: 'manrope',
      fontSize: 27,
      lineHeight: 1.78,
      paragraphSpacing: 12,
      fontWeight: 500,
      isBold: false,
      showTexture: false,
      textureType: 'none',
      textureIntensity: 'light',
      showFooter: true,
      footerText: 'SLOW DOWN & SMILE · 留白与清欢',
    },
  },
];

export const INITIAL_CONFIG: CardConfig = {
  cardHeading: '请输入您的专栏标题',
  volume: 'VOL. 01',
  tagline: '',
  showAvatar: true,
  avatarUrl: '',
  avatarShape: 'circle',
  avatarSize: 56,
  articleTitle: 'Start Your Day with Calm',
  author: '',
  articleContent: `Every morning gives us a **fresh start** and a new chance to shape our day. Before reaching for your phone or rushing into work, take a deep breath. Give yourself a few quiet minutes to wake up gently, listen to the world around you, and feel grateful for a new day.

Pour a warm cup of coffee or tea and sit comfortably by the window. Reading just a few pages of a good book can inspire clear thoughts and awaken your mind. When you make time for simple moments, the day ahead feels much lighter and more enjoyable.

How you begin your morning often guides the rest of your day. When you start with calm and intention, you carry that **peace and confidence** into everything you do.`,
  showImage: false,
  imageUrl: '',
  imagePosition: 'top-banner',
  imageFit: 'cover',
  imageFocalY: 50,
  imageFocalX: 50,
  bannerHeight: 220,
  theme: 'paper',
  fontFamily: 'literata',
  fontSize: 27,
  lineHeight: 1.75,
  paragraphSpacing: 12,
  fontWeight: 500,
  isBold: false,
  showTexture: true,
  textureType: 'paper',
  textureIntensity: 'medium',
  aspectRatio: '3:4',
  showFooter: true,
  footerText: '欢迎连麦交流 · 申请上麦一起读',
};

export const BUILTIN_PROJECTS: CardProject[] = SAMPLE_ARTICLES.map((sample, idx) => ({
  id: `builtin-${idx + 1}`,
  name: sample.name,
  updatedAt: 1727800000000 + idx * 1000,
  isBuiltIn: true,
  config: { ...INITIAL_CONFIG, ...sample.config } as CardConfig,
}));

