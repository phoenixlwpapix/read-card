import type { CardConfig, CardProject } from '../types';

export const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='60' r='60' fill='%23282c34'/%3E%3Ccircle cx='60' cy='46' r='20' fill='%23f4ce45'/%3E%3Cpath d='M28 98c0-18 14-30 32-30s32 12 32 30' fill='%23f4ce45'/%3E%3C/svg%3E";

export const SAMPLE_ARTICLES: { name: string; config: Partial<CardConfig> }[] = [
  {
    name: '慢读之美 · The Art of Slow Reading',
    config: {
      cardHeading: 'READFLOW · 每日精读',
      volume: 'VOL. 01',
      tagline: 'READFLOW / DAILY PERSPECTIVE',
      showAvatar: true,
      avatarUrl: '',
      avatarShape: 'circle',
      avatarSize: 56,
      articleTitle: 'The Art of Slow Reading in a Hurried World',
      author: 'Marcel Proust & Henry David Thoreau',
      articleContent: `In an era of relentless speed and endless scrolling, slow reading has become an act of quiet rebellion. It is not merely about deciphering words at a leisurely pace, but about dwelling within them.

When we read slowly, we listen not just to what the author is saying, but to the pauses between thoughts. We allow ideas to resonate, finding echoes in our own lived experience.

"To read well, that is, to read true books in a true spirit, is a noble exercise," wrote Thoreau in Walden. Books are not commodities to be consumed in haste; they are sanctuaries waiting to be explored with deliberate care.`,
      showImage: false,
      theme: 'paper',
      fontFamily: 'literata',
      fontSize: 27,
      lineHeight: 1.75,
      fontWeight: 500,
      isBold: false,
      showTexture: true,
      textureType: 'paper',
      textureIntensity: 'medium',
      footerText: 'ONE ARTICLE. A NEW PERSPECTIVE.',
    },
  },
  {
    name: '深度学习与心流 · Deep Work',
    config: {
      cardHeading: '思维漫步 · THINKING FLOW',
      volume: 'VOL. 02',
      tagline: 'FOCUS DESK / COGNITIVE NOTES',
      showAvatar: true,
      avatarUrl: '',
      avatarShape: 'squircle',
      avatarSize: 56,
      articleTitle: 'Deep Work: Cultivating Focus in a Distracted Age',
      author: 'Cal Newport',
      articleContent: `The ability to perform deep work is becoming increasingly rare at exactly the same time it is becoming increasingly valuable in our economy. As a consequence, the few who cultivate this skill, and then make it the core of their working life, will thrive.

Deep work is not a nostalgic luxury; it is a pragmatic necessity. To produce at your peak level you need to work for extended periods with full concentration on a single task free from distraction.

True craft requires calm waters. Give your mind the stillness it deserves, and extraordinary ideas will follow naturally.`,
      showImage: false,
      theme: 'matcha',
      fontFamily: 'literata',
      fontSize: 26,
      lineHeight: 1.75,
      fontWeight: 500,
      isBold: false,
      showTexture: true,
      textureType: 'linen',
      textureIntensity: 'medium',
      footerText: 'DEPTH OVER SPEED · CLARITY OVER NOISE',
    },
  },
  {
    name: '极简生活笔记 · Minimalism',
    config: {
      cardHeading: 'ESSENTIALS · 极简读本',
      volume: 'VOL. 03',
      tagline: 'CURATED ESSAYS / MINIMALISM',
      showAvatar: false,
      avatarUrl: '',
      avatarShape: 'circle',
      avatarSize: 56,
      articleTitle: 'The Beauty of Subtracting the Non-Essential',
      author: 'Antoine de Saint-Exupéry',
      articleContent: `Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.

In life, as in design, we often burden ourselves with clutter under the illusion of enrichment. But true elegance lies in the courage to strip away the superfluous until only the essential remains.

When you remove the noise, the melody of your life finally becomes audible. Every paragraph you read, every object you keep, should earn its place by serving either truth or joy.`,
      showImage: false,
      theme: 'minimal',
      fontFamily: 'manrope',
      fontSize: 27,
      lineHeight: 1.78,
      fontWeight: 500,
      isBold: false,
      showTexture: false,
      textureType: 'none',
      textureIntensity: 'light',
      footerText: 'LESS IS MORE · SIMPLICITY IS SOPHISTICATION',
    },
  },
];

export const INITIAL_CONFIG: CardConfig = {
  cardHeading: '请输入您的专栏标题',
  volume: 'VOL. 01',
  tagline: 'READFLOW / DAILY READING',
  showAvatar: true,
  avatarUrl: '',
  avatarShape: 'circle',
  avatarSize: 56,
  articleTitle: 'The Art of Slow Reading in a Hurried World',
  author: 'Editorial Team',
  articleContent: `In an era of relentless speed and endless scrolling, slow reading has become an act of quiet rebellion. It is not merely about deciphering words at a leisurely pace, but about dwelling within them.

When we read slowly, we listen not just to what the author is saying, but to the pauses between sentences. We allow ideas to resonate, finding echoes in our own memories and convictions.

"To read well, that is, to read true books in a true spirit, is a noble exercise," wrote Thoreau in Walden. Books are not information feeds to be skimmed; they are sanctuaries waiting to be explored with patient, undivided attention.`,
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
  fontWeight: 500,
  isBold: false,
  showTexture: true,
  textureType: 'paper',
  textureIntensity: 'medium',
  aspectRatio: '3:4',
  footerText: 'ONE ARTICLE. A NEW PERSPECTIVE.',
};

export const BUILTIN_PROJECTS: CardProject[] = SAMPLE_ARTICLES.map((sample, idx) => ({
  id: `builtin-${idx + 1}`,
  name: sample.name,
  updatedAt: 1727800000000 + idx * 1000,
  isBuiltIn: true,
  config: { ...INITIAL_CONFIG, ...sample.config } as CardConfig,
}));

