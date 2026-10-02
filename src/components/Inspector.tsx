import React, { useRef } from 'react';
import {
  Upload,
  Trash2,
  Download,
  Copy,
  Layers,
  Bold,
  Image as ImageIcon,
  Palette,
  Type,
  SlidersHorizontal,
  Ratio,
} from 'lucide-react';
import {
  ASPECT_RATIOS,
  type CardConfig,
  type CardTheme,
  type FontFamily,
  type TextureType,
  type TextureIntensity,
} from '../types';
import { optimizeImageFile } from '../utils/imageOptimizer';

interface InspectorProps {
  config: CardConfig;
  onChange: (patch: Partial<CardConfig>) => void;
  onExportPng: (allPages?: boolean) => void;
  onCopyImage: () => void;
  onRequestReset: () => void;
  isExporting: boolean;
  isCopying: boolean;
  totalPages: number;
}

export const Inspector: React.FC<InspectorProps> = ({
  config,
  onChange,
  onExportPng,
  onCopyImage,
  onRequestReset,
  isExporting,
  isCopying,
  totalPages,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = async (file?: File) => {
    if (!file) return;
    try {
      const dataUrl = await optimizeImageFile(file);
      onChange({ imageUrl: dataUrl, showImage: true });
    } catch (err) {
      console.error('Failed to optimize image:', err);
    }
  };

  const themes: { id: CardTheme; name: string; bg: string; dot: string }[] = [
    { id: 'paper', name: '经典纸张', bg: 'bg-[#faf6ec]', dot: 'bg-[#f8d447]' },
    { id: 'minimal', name: '现代极简', bg: 'bg-[#ffffff]', dot: 'bg-zinc-900' },
    { id: 'dark', name: '暮色暗夜', bg: 'bg-[#16181d]', dot: 'bg-amber-400' },
    { id: 'matcha', name: '抹茶松柏', bg: 'bg-[#f3f6f1]', dot: 'bg-[#3b5c3d]' },
    { id: 'warm', name: '温暖晨光', bg: 'bg-[#fbf6f0]', dot: 'bg-[#ea580c]' },
  ];

  const fonts: {
    id: FontFamily;
    name: string;
    tag: string;
    desc: string;
    fontClass: string;
  }[] = [
    {
      id: 'literata',
      name: 'Literata',
      tag: '经典衬线',
      desc: '电子书级 · 典雅衬线体',
      fontClass: 'font-serif',
    },
    {
      id: 'manrope',
      name: 'Manrope',
      tag: '现代几何',
      desc: '清晰理智 · 现代无衬线体',
      fontClass: 'font-sans',
    },
  ];

  const textureTypes: { id: TextureType; name: string }[] = [
    { id: 'none', name: '无纹理' },
    { id: 'paper', name: '纸质纤维' },
    { id: 'linen', name: '亚麻经纬' },
  ];

  const intensityLevels: { id: TextureIntensity; name: string }[] = [
    { id: 'light', name: '弱 (轻柔)' },
    { id: 'medium', name: '中 (自然)' },
    { id: 'strong', name: '强 (鲜明)' },
  ];

  return (
    <aside className="w-[380px] xl:w-[400px] h-screen bg-[#fbfcfb] border-l border-[#e2e6e3] flex flex-col shrink-0 overflow-hidden shadow-xs z-10">
      {/* Inspector Header */}
      <div className="h-14 px-4 border-b border-[#e5e9e4] flex items-center justify-between shrink-0 bg-white/70 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-zinc-900 tracking-tight">视觉与属性检查器</h2>
            <p className="text-[10px] text-zinc-400">配图构图 · 色彩排版 · 导出</p>
          </div>
        </div>
      </div>

      {/* Main Inspector Scroll Area - Displaying all controls seamlessly */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 text-xs text-zinc-700">
        {/* Section 1: 文章配图设置 */}
        <div className="space-y-3.5 bg-white p-3.5 rounded-xl border border-zinc-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                文章配图设置
              </span>
              <label className="flex items-center gap-1.5 text-[11px] cursor-pointer text-zinc-600 font-medium">
                <input
                  type="checkbox"
                  checked={config.showImage}
                  onChange={(e) => onChange({ showImage: e.target.checked })}
                  className="w-3.5 h-3.5 text-amber-600 rounded border-zinc-300 focus:ring-amber-500"
                />
                <span>开启配图</span>
              </label>
            </div>

            {config.showImage ? (
              <div className="space-y-3 pt-1">
                {config.imageUrl ? (
                  <div className="space-y-3">
                    {/* Live Crop Focal Preview */}
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-zinc-100 border border-zinc-300 flex items-center justify-center group shadow-2xs">
                      <img
                        src={config.imageUrl}
                        alt="文章配图"
                        style={{
                          objectPosition: `${config.imageFocalX ?? 50}% ${config.imageFocalY ?? 50}%`,
                        }}
                        className={`w-full h-full transition-all ${
                          config.imageFit === 'contain' ? 'object-contain' : 'object-cover'
                        }`}
                      />

                      {/* Image Action Buttons */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 p-1 rounded-md backdrop-blur-xs">
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="p-1 hover:bg-white/20 text-white rounded transition-colors"
                          title="更换图片"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onChange({ imageUrl: '' })}
                          className="p-1 hover:bg-red-500/80 text-white rounded transition-colors"
                          title="删除配图"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Focal Indicator Badge */}
                      {config.imageFit !== 'contain' && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-[10px] text-white rounded backdrop-blur-xs font-mono">
                          焦点高度: {config.imageFocalY ?? 50}%
                        </div>
                      )}
                    </div>

                    {/* Layout and Fit Mode Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-zinc-500 mb-1">
                          排版布局
                        </label>
                        <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
                          <button
                            type="button"
                            onClick={() => onChange({ imagePosition: 'top-banner' })}
                            className={`flex-1 py-1 text-[11px] rounded-md transition-colors ${
                              config.imagePosition === 'top-banner'
                                ? 'bg-white text-zinc-900 font-bold shadow-xs'
                                : 'text-zinc-600 hover:text-zinc-900'
                            }`}
                          >
                            顶部通栏
                          </button>
                          <button
                            type="button"
                            onClick={() => onChange({ imagePosition: 'float-right' })}
                            className={`flex-1 py-1 text-[11px] rounded-md transition-colors ${
                              config.imagePosition === 'float-right'
                                ? 'bg-white text-zinc-900 font-bold shadow-xs'
                                : 'text-zinc-600 hover:text-zinc-900'
                            }`}
                          >
                            右侧环绕
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-zinc-500 mb-1">
                          裁剪模式
                        </label>
                        <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
                          <button
                            type="button"
                            onClick={() => onChange({ imageFit: 'cover' })}
                            className={`flex-1 py-1 text-[11px] rounded-md transition-colors ${
                              config.imageFit === 'cover'
                                ? 'bg-white text-zinc-900 font-bold shadow-xs'
                                : 'text-zinc-600 hover:text-zinc-900'
                            }`}
                          >
                            裁切填满
                          </button>
                          <button
                            type="button"
                            onClick={() => onChange({ imageFit: 'contain' })}
                            className={`flex-1 py-1 text-[11px] rounded-md transition-colors ${
                              config.imageFit === 'contain'
                                ? 'bg-white text-zinc-900 font-bold shadow-xs'
                                : 'text-zinc-600 hover:text-zinc-900'
                            }`}
                          >
                            完整留白
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Vertical Focal Position Controls (for Cover mode) */}
                    {config.imageFit !== 'contain' && (
                      <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-zinc-700">
                            显示区域（垂直焦点）
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onChange({ imageFocalY: 0 })}
                              className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                                config.imageFocalY === 0
                                  ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                                  : 'border-zinc-200 text-zinc-600 hover:bg-white'
                              }`}
                            >
                              顶部
                            </button>
                            <button
                              type="button"
                              onClick={() => onChange({ imageFocalY: 50 })}
                              className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                                (config.imageFocalY ?? 50) === 50
                                  ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                                  : 'border-zinc-200 text-zinc-600 hover:bg-white'
                              }`}
                            >
                              居中
                            </button>
                            <button
                              type="button"
                              onClick={() => onChange({ imageFocalY: 100 })}
                              className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                                config.imageFocalY === 100
                                  ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                                  : 'border-zinc-200 text-zinc-600 hover:bg-white'
                              }`}
                            >
                              底部
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-zinc-400">
                            <span>0% (显示上部)</span>
                            <span className="font-mono text-zinc-800 font-bold">
                              {config.imageFocalY ?? 50}%
                            </span>
                            <span>100% (显示下部)</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={config.imageFocalY ?? 50}
                            onChange={(e) => onChange({ imageFocalY: Number(e.target.value) })}
                            className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                          />
                        </div>
                      </div>
                    )}

                    {/* Banner Height Slider */}
                    {config.imagePosition === 'top-banner' && (
                      <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="block text-[11px] text-zinc-700 font-medium">
                            通栏横幅高度
                          </span>
                          <span className="text-[10px] text-zinc-400">动态重算文字分页</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={160}
                            max={360}
                            step={10}
                            value={config.bannerHeight || 220}
                            onChange={(e) => onChange({ bannerHeight: Number(e.target.value) })}
                            className="w-28 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                          />
                          <span className="font-mono text-zinc-900 font-bold text-xs w-11 text-right">
                            {config.bannerHeight || 220}px
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-300 hover:border-amber-500 rounded-xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer bg-zinc-50 hover:bg-amber-50/20 transition-all group"
                  >
                    <div className="w-11 h-11 rounded-full bg-zinc-100 group-hover:bg-amber-100 text-zinc-500 group-hover:text-amber-700 flex items-center justify-center transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-zinc-800">点击上传本地文章配图</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        支持方形/宽屏 PNG, JPG, WebP
                      </p>
                    </div>
                  </div>
                )}

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    handleImageFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </div>
            ) : (
              <p className="text-[11px] text-zinc-400 py-1">
                配图已关闭。开启后可上传本地插画并自由配置通栏构图与焦点。
              </p>
            )}
          </div>

          {/* Section: 卡片画幅比例选择 */}
          <div className="bg-white p-3.5 rounded-xl border border-zinc-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                <Ratio className="w-4 h-4 text-indigo-600" />
                卡片画幅比例
              </span>
              <span className="text-[10px] text-zinc-400 font-mono font-medium">
                默认 3:4
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {ASPECT_RATIOS.map((item) => {
                const isSelected = (config.aspectRatio || '3:4') === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChange({ aspectRatio: item.id })}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100 hover:border-zinc-300 text-zinc-700'
                    }`}
                  >
                    <div className="h-6 flex items-center justify-center mb-1">
                      <div
                        className={`rounded-[2px] border transition-colors ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-200/80'
                            : 'border-zinc-400/80 bg-zinc-200/70'
                        }`}
                        style={{
                          width: `${Math.max(10, Math.round((item.width / item.height) * 20))}px`,
                          height: '20px',
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold leading-tight">{item.name}</span>
                    <span className="text-[9px] text-zinc-400 mt-0.5 leading-tight truncate w-full text-center">
                      {item.desc.split(' · ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] text-zinc-600 bg-zinc-50 px-2.5 py-1.5 rounded-lg border border-zinc-100 flex items-center justify-between">
              <span className="truncate">
                {ASPECT_RATIOS.find((r) => r.id === (config.aspectRatio || '3:4'))?.desc}
              </span>
              <span className="font-mono text-[10px] text-zinc-400 shrink-0 ml-2">
                {ASPECT_RATIOS.find((r) => r.id === (config.aspectRatio || '3:4'))?.width} ×{' '}
                {ASPECT_RATIOS.find((r) => r.id === (config.aspectRatio || '3:4'))?.height}
              </span>
            </div>
          </div>

          {/* Section 2: 配色与排版风格 */}
          <div className="space-y-4">
            {/* Theme selection */}
            <div className="bg-white p-3.5 rounded-xl border border-zinc-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-emerald-600" />
                  卡片配色风格
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {themes.map((t) => {
                  const isSelected = config.theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onChange({ theme: t.id })}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border text-center transition-all ${
                        isSelected
                          ? 'border-amber-600 ring-2 ring-amber-500/20 shadow-xs'
                          : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border border-black/10 flex items-center justify-center ${t.bg}`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${t.dot}`} />
                      </div>
                      <span className="text-[10px] font-medium text-zinc-700">
                        {t.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Texture Selection (Paper & Linen with 3 Intensity Levels) */}
              <div className="pt-2.5 border-t border-zinc-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-zinc-700">卡片底纹质感</span>
                  <span className="text-[10px] text-zinc-400">纸纹 / 麻纹物理仿真</span>
                </div>

                {/* Texture Type Selector */}
                <div className="grid grid-cols-3 gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
                  {textureTypes.map((t) => {
                    const isSelected =
                      (config.textureType ?? (config.showTexture ? 'paper' : 'none')) === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() =>
                          onChange({
                            textureType: t.id,
                            showTexture: t.id !== 'none',
                          })
                        }
                        className={`py-1.5 px-1 text-[11px] rounded-md transition-all ${
                          isSelected
                            ? 'bg-white text-zinc-900 font-bold shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>

                {/* 3-Level Intensity (Weak, Medium, Strong) */}
                {(config.textureType ?? (config.showTexture ? 'paper' : 'none')) !== 'none' && (
                  <div className="p-2 bg-zinc-50 border border-zinc-200/90 rounded-lg flex items-center justify-between animate-in fade-in duration-100">
                    <span className="text-[10px] font-medium text-zinc-500">
                      纹理强度
                    </span>
                    <div className="flex items-center gap-1 bg-zinc-200/70 p-0.5 rounded-md">
                      {intensityLevels.map((lvl) => {
                        const isSelected = (config.textureIntensity || 'medium') === lvl.id;
                        return (
                          <button
                            key={lvl.id}
                            type="button"
                            onClick={() => onChange({ textureIntensity: lvl.id })}
                            className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                              isSelected
                                ? 'bg-white text-zinc-900 font-bold shadow-xs'
                                : 'text-zinc-600 hover:text-zinc-900'
                            }`}
                          >
                            {lvl.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Typography selection */}
            <div className="bg-white p-3.5 rounded-xl border border-zinc-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-indigo-600" />
                  正文字体（长文密集阅读优化）
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {fonts.map((f) => {
                  const isSelected = config.fontFamily === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onChange({ fontFamily: f.id })}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/60 ring-1 ring-amber-500/30 shadow-xs'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold text-zinc-900 ${f.fontClass}`}>
                          {f.name}
                        </span>
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-medium ${
                            isSelected
                              ? 'bg-amber-200 text-amber-900 font-semibold'
                              : 'bg-zinc-100 text-zinc-500'
                          }`}
                        >
                          {f.tag}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1 leading-tight">{f.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Bold & Spacing controls */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-600 font-medium">字重选择</span>
                  <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
                    {([500, 600] as const).map((w) => {
                      const activeWeight = config.fontWeight ?? (config.isBold ? 600 : 500);
                      const isSelected = activeWeight === w;
                      return (
                        <button
                          key={w}
                          type="button"
                          onClick={() => onChange({ fontWeight: w, isBold: w === 600 })}
                          className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-white text-zinc-900 font-bold shadow-xs border border-zinc-200/80'
                              : 'text-zinc-500 hover:text-zinc-800 font-medium'
                          }`}
                        >
                          <Bold className={`w-3 h-3 ${isSelected ? 'text-amber-700' : 'text-zinc-400'}`} />
                          <span>{w}</span>
                          <span className="text-[10px] text-zinc-400 font-normal">
                            {w === 500 ? '(中黑)' : '(加粗)'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-600 font-medium">正文字号</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={20}
                      max={36}
                      value={config.fontSize}
                      onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
                      className="w-24 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <span className="font-mono text-zinc-900 font-semibold text-xs w-9 text-right">
                      {config.fontSize}px
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-600 font-medium">行距倍数</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1.5}
                      max={2.1}
                      step={0.05}
                      value={config.lineHeight}
                      onChange={(e) => onChange({ lineHeight: Number(e.target.value) })}
                      className="w-24 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <span className="font-mono text-zinc-900 font-semibold text-xs w-9 text-right">
                      {config.lineHeight}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* Pinned Inspector Footer - Quick Export & Actions */}
      <div className="p-4 border-t border-[#e2e6e3] bg-white space-y-2 shrink-0 shadow-lg">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isCopying}
            onClick={onCopyImage}
            className="w-full py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{isCopying ? '复制中…' : '复制卡片'}</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={() => onExportPng(false)}
            className="w-full py-2.5 px-3 bg-[#242924] hover:bg-[#323932] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-[#f4ce45]" />
            <span>{isExporting ? '导出中…' : '下载高清卡片'}</span>
          </button>
        </div>

        {totalPages > 1 && (
          <button
            type="button"
            disabled={isExporting}
            onClick={() => onExportPng(true)}
            className="w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300/40 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-amber-700" />
            <span>批量导出全部 {totalPages} 页卡片</span>
          </button>
        )}

        <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
          <button
            type="button"
            onClick={onRequestReset}
            className="hover:text-zinc-600 transition-colors"
          >
            恢复初始默认
          </button>
          <span>{config.aspectRatio || '3:4'} 比例超清输出</span>
        </div>
      </div>
    </aside>
  );
};
