export type CardTheme = 'paper' | 'minimal' | 'dark' | 'matcha' | 'warm';
export type AvatarShape = 'circle' | 'squircle';
export type ImagePosition = 'float-right' | 'top-banner';
export type ImageFit = 'cover' | 'contain';
export type FontFamily = 'literata' | 'manrope' | 'source-serif' | 'lora';
export type FontWeight = 500 | 600;
export type TextureType = 'none' | 'paper' | 'linen';
export type TextureIntensity = 'light' | 'medium' | 'strong';
export type CardAspectRatio = '3:4' | '1:1' | '2:3' | '9:16';

export const ASPECT_RATIOS: {
  id: CardAspectRatio;
  name: string;
  width: number;
  height: number;
  desc: string;
}[] = [
  { id: '3:4', name: '3:4', width: 900, height: 1200, desc: '经典画册 · 平衡阅读' },
  { id: '1:1', name: '1:1', width: 900, height: 900, desc: '正方构图 · 社交方形' },
  { id: '2:3', name: '2:3', width: 900, height: 1350, desc: '海报比例 · 纵深阅读' },
  { id: '9:16', name: '9:16', width: 900, height: 1600, desc: '全屏壁纸 · 故事竖屏' },
];

export function getCardDimensions(ratio: CardAspectRatio = '3:4'): { width: number; height: number } {
  switch (ratio) {
    case '1:1':
      return { width: 900, height: 900 };
    case '2:3':
      return { width: 900, height: 1350 };
    case '9:16':
      return { width: 900, height: 1600 };
    case '3:4':
    default:
      return { width: 900, height: 1200 };
  }
}

export interface CardConfig {
  // Card heading & Volume
  cardHeading: string;
  volume: string;
  tagline: string;

  // Avatar
  showAvatar: boolean;
  avatarUrl: string;
  avatarShape: AvatarShape;
  avatarSize: number;

  // Article info
  articleTitle: string;
  articleContent: string;
  author: string;

  // Local illustration
  showImage: boolean;
  imageUrl: string;
  imagePosition: ImagePosition;
  imageFit: ImageFit;
  imageFocalY: number;
  imageFocalX: number;
  bannerHeight: number;

  // Styling
  theme: CardTheme;
  fontFamily: FontFamily;
  fontSize: number;
  lineHeight: number;
  paragraphSpacing?: number;
  fontWeight?: FontWeight;
  isBold?: boolean;
  showTexture: boolean;
  textureType?: TextureType;
  textureIntensity?: TextureIntensity;
  footerText: string;
  showFooter?: boolean;
  aspectRatio?: CardAspectRatio;
}

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export interface CardProject {
  id: string;
  name: string;
  updatedAt: number;
  isBuiltIn?: boolean;
  config: CardConfig;
}

