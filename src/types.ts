export type CardTheme = 'paper' | 'minimal' | 'dark' | 'matcha' | 'warm';
export type AvatarShape = 'circle' | 'squircle';
export type ImagePosition = 'float-right' | 'top-banner';
export type ImageFit = 'cover' | 'contain';
export type FontFamily = 'literata' | 'source-serif' | 'lora' | 'manrope';
export type TextureType = 'none' | 'paper' | 'linen';
export type TextureIntensity = 'light' | 'medium' | 'strong';

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
  isBold: boolean;
  showTexture: boolean;
  textureType?: TextureType;
  textureIntensity?: TextureIntensity;
  footerText: string;
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

