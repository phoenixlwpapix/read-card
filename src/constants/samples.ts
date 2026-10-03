import type { CardConfig, CardProject } from '../types';

export const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='60' r='60' fill='%23282c34'/%3E%3Ccircle cx='60' cy='46' r='20' fill='%23f4ce45'/%3E%3Cpath d='M28 98c0-18 14-30 32-30s32 12 32 30' fill='%23f4ce45'/%3E%3C/svg%3E";

export const SAMPLE_ARTICLES: { name: string; config: Partial<CardConfig> }[] = [
  {
    name: '晨光阅读 · A Fresh Morning',
    config: {
      cardHeading: '晨读时刻 · MORNING READ',
      volume: 'VOL. 01',
      tagline: 'DAILY INSPIRATION / 每日晨读',
      showAvatar: true,
      avatarUrl: '',
      avatarShape: 'circle',
      avatarSize: 56,
      articleTitle: 'Start Your Day with Calm',
      author: 'Daily Notes',
      articleContent: `Every morning gives us a **fresh start**. Before looking at your phone, take a deep breath and enjoy a quiet moment.

Make a warm cup of coffee or tea. Read a few pages of a good book, or simply look out the window.

When you begin your morning with calm, you bring that **peace and focus** into the rest of your day.`,
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
      tagline: 'LITTLE BY LITTLE / 积微成著',
      showAvatar: true,
      avatarUrl: '',
      avatarShape: 'squircle',
      avatarSize: 56,
      articleTitle: 'The Power of Small Steps',
      author: 'Growth Diary',
      articleContent: `Big dreams are not built in a single day. They are created by the **small habits** you keep every day.

Reading for ten minutes, writing down a new thought, or taking a short walk might feel simple. But day after day, they bring **real change**.

Do not worry about moving fast. Just focus on taking the next small step forward.`,
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
      tagline: 'SLOW DOWN / 感知当下',
      showAvatar: false,
      avatarUrl: '',
      avatarShape: 'circle',
      avatarSize: 56,
      articleTitle: 'Enjoy the Simple Moments',
      author: 'Mindful Life',
      articleContent: `Happiness is often found in the **simplest things** we tend to overlook.

A warm cup of tea in the afternoon, a friendly chat with someone you care about, or a quiet walk under the trees.

When you slow down and live in the **present moment**, everyday life becomes full of gentle joy.`,
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
  tagline: 'DAILY INSPIRATION / 每日晨读',
  showAvatar: true,
  avatarUrl: '',
  avatarShape: 'circle',
  avatarSize: 56,
  articleTitle: 'Start Your Day with Calm',
  author: 'Daily Notes',
  articleContent: `Every morning gives us a **fresh start**. Before looking at your phone, take a deep breath and enjoy a quiet moment.

Make a warm cup of coffee or tea. Read a few pages of a good book, or simply look out the window.

When you begin your morning with calm, you bring that **peace and focus** into the rest of your day.`,
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

