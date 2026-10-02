import { forwardRef } from 'react';
import { User, Bookmark } from 'lucide-react';
import { getCardDimensions, type CardConfig, type TextureType, type TextureIntensity } from '../types';
import { getProceduralTexture } from '../utils/textureGenerator';

interface ReadingCardProps {
  config: CardConfig;
  paragraphs: string[];
  pageIndex: number;
}

function renderMarkdownInline(text: string) {
  // Capture ***bold-italic***, **bold**, and *italic*
  const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(regex);
  return parts.map((part, pIdx) => {
    if (part.startsWith('***') && part.endsWith('***') && part.length > 6) {
      return (
        <strong key={pIdx} className="font-bold italic">
          {part.slice(3, -3)}
        </strong>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={pIdx} className="font-bold underline-offset-4">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={pIdx} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

export const ReadingCard = forwardRef<HTMLDivElement, ReadingCardProps>(
  function ReadingCard({ config, paragraphs, pageIndex }, ref) {
    const isFirstPage = pageIndex === 0;

    // Theme class
    const themeClass = `card-theme-${config.theme}`;

    // Procedural texture (paper fibers or woven linen)
    const activeTextureType: TextureType =
      config.textureType ?? (config.showTexture ? 'paper' : 'none');
    const activeIntensity: TextureIntensity = config.textureIntensity || 'medium';
    const textureDataUrl = getProceduralTexture(
      activeTextureType,
      activeIntensity,
      config.theme === 'dark'
    );

    // Font stack mapping based on digital reading optimization
    const getFontStack = (family: typeof config.fontFamily): string => {
      switch (family) {
        case 'literata':
          return "'Literata', 'Songti SC', 'Source Han Serif SC', SimSun, Georgia, serif";
        case 'source-serif':
          return "'Source Serif 4', 'Songti SC', 'Source Han Serif SC', SimSun, Georgia, serif";
        case 'lora':
          return "'Lora', 'Songti SC', 'Source Han Serif SC', SimSun, Georgia, serif";
        case 'manrope':
        default:
          return "'Manrope', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif";
      }
    };

    // Font style with typographic optimization for dense reading cards
    const activeWeight = config.fontWeight ?? (config.isBold ? 600 : 500);
    const fontStyle = {
      fontFamily: getFontStack(config.fontFamily),
      fontSize: `${config.fontSize}px`,
      lineHeight: config.lineHeight,
      letterSpacing: config.fontFamily === 'manrope' ? '0.015em' : '0.028em',
      fontOpticalSizing: 'auto' as const,
      fontWeight: activeWeight,
    };

    // Calculate heading size based on length (enlarged for prominent masthead)
    const headingText = config.cardHeading.trim() || '每日阅读 · 精读卡片';
    const headingWeight = [...headingText].reduce(
      (sum, char) => sum + (char.charCodeAt(0) > 255 ? 1 : 0.6),
      0
    );
    const headingFontSize = Math.max(26, Math.min(42, Math.floor(640 / Math.max(1, headingWeight))));

    const hasArticleTitle = Boolean(config.articleTitle?.trim());
    const hasAuthor = Boolean(config.author?.trim());
    const dimensions = getCardDimensions(config.aspectRatio);

    return (
      <div
        ref={ref}
        className={`reading-card ${themeClass} shadow-2xl select-text relative`}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      >
        {/* Procedural Canvas Paper / Linen Texture Overlay */}
        {textureDataUrl && (
          <div
            className="card-texture-overlay absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `url(${textureDataUrl})`,
              backgroundRepeat: 'repeat',
              backgroundSize: '256px 256px',
            }}
          />
        )}

        {/* Card Header */}
        <header
          className={`shrink-0 border-b card-border-line relative z-1 ${
            hasArticleTitle || hasAuthor ? 'pb-4' : 'pb-3.5'
          }`}
        >
          {/* Card Title Row with Avatar on the Left (Enlarged) */}
          <div
            className={`flex items-center justify-between gap-4 ${
              hasArticleTitle || hasAuthor ? 'mb-3' : 'mb-0'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              {/* Optional Avatar on the Left of Card Title */}
              {config.showAvatar && (() => {
                const avatarDimension =
                  config.avatarSize === 32 ? 40 : (config.avatarSize || 56);
                return (
                  <div className="shrink-0 flex items-center">
                    {config.avatarUrl ? (
                      <img
                        src={config.avatarUrl}
                        alt="用户头像"
                        style={{
                          width: `${avatarDimension}px`,
                          height: `${avatarDimension}px`,
                        }}
                        className={`object-cover border-[2.5px] shadow-sm ${
                          config.avatarShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                        }`}
                      />
                    ) : (
                      <div
                        style={{
                          width: `${avatarDimension}px`,
                          height: `${avatarDimension}px`,
                        }}
                        className={`flex items-center justify-center border-[2.5px] border-dashed shadow-sm ${
                          config.avatarShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                        } ${
                          config.theme === 'dark'
                            ? 'bg-zinc-800 border-amber-500/40 text-amber-400'
                            : 'bg-zinc-100/90 border-zinc-300 text-zinc-500'
                        }`}
                      >
                        <User
                          style={{
                            width: `${Math.round(avatarDimension * 0.52)}px`,
                            height: `${Math.round(avatarDimension * 0.52)}px`,
                          }}
                          className="opacity-70"
                        />
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Card Heading Badge / Highlight (Larger & more prominent) */}
              <div
                className="card-badge-bg px-4.5 py-2 font-black tracking-tight rounded-md leading-tight uppercase shrink-0 shadow-2xs"
                style={{ fontSize: `${headingFontSize}px` }}
              >
                {headingText}
              </div>
            </div>

            {/* Right Brand Stamp / Emblem (Scaled up to match) */}
            <div className="shrink-0 flex items-center opacity-80">
              <div className="p-2.5 rounded-xl border-2 card-border-line flex items-center justify-center">
                <Bookmark className="w-5 h-5 opacity-75" />
              </div>
            </div>
          </div>

          {/* Article Title & Author (Optional - Only rendered if provided) */}
          {(hasArticleTitle || hasAuthor) && (
            <div className="space-y-1.5 pt-1">
              {hasArticleTitle && (
                <h1
                  className="font-bold tracking-tight leading-tight line-clamp-2"
                  style={{
                    fontSize: '32px',
                    fontFamily: getFontStack(config.fontFamily),
                  }}
                >
                  {config.articleTitle.trim()}
                </h1>
              )}

              {hasAuthor && (
                <div className="text-xs tracking-wider card-eyebrow-text font-medium">
                  {config.author.trim()}
                </div>
              )}
            </div>
          )}
        </header>

        {/* Card Body */}
        <main className="flex-1 overflow-hidden pt-5 relative z-1" style={fontStyle}>
          {/* Top Banner Illustration (Only on Page 1) */}
          {isFirstPage &&
            config.showImage &&
            config.imageUrl &&
            config.imagePosition === 'top-banner' && (
              <div
                className="card-illustration-banner border card-border-line bg-black/5"
                style={{ height: `${config.bannerHeight || 220}px` }}
              >
                <img
                  src={config.imageUrl}
                  alt="文章插图"
                  style={{
                    objectPosition: `${config.imageFocalX ?? 50}% ${config.imageFocalY ?? 50}%`,
                  }}
                  className={`w-full h-full ${
                    config.imageFit === 'contain' ? 'object-contain' : 'object-cover'
                  }`}
                />
              </div>
            )}

          {/* Floating Right Illustration (Only on Page 1) */}
          {isFirstPage &&
            config.showImage &&
            config.imageUrl &&
            config.imagePosition === 'float-right' && (
              <div className="card-illustration-float border card-border-line bg-black/5">
                <img
                  src={config.imageUrl}
                  alt="文章插图"
                  style={{
                    objectPosition: `${config.imageFocalX ?? 50}% ${config.imageFocalY ?? 50}%`,
                  }}
                  className={`w-full h-full ${
                    config.imageFit === 'contain' ? 'object-contain' : 'object-cover'
                  }`}
                />
              </div>
            )}

          {/* Paragraphs */}
          {paragraphs.length > 0 ? (
            paragraphs.map((text, idx) => (
              <p
                key={idx}
                className="mb-5 last:mb-0 text-justify break-words"
                style={{ textJustify: 'inter-word', fontWeight: activeWeight }}
              >
                {renderMarkdownInline(text)}
              </p>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center card-eyebrow-text py-20">
              <p className="text-xl font-medium tracking-wide">在左侧输入或粘贴文章内容</p>
              <p className="text-sm mt-2 opacity-70">
                右侧将自动呈现精美的 {config.aspectRatio || '3:4'} 比例排版卡片
              </p>
            </div>
          )}
        </main>
      </div>
    );
  }
);
