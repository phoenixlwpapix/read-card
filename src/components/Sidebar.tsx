import React, { useRef } from 'react';
import {
  User,
  Trash2,
  Upload,
  RotateCcw,
  LayoutTemplate,
  Bold,
  Italic,
  ClipboardPaste,
  FileText,
  SlidersHorizontal,
  FolderKanban,
} from 'lucide-react';
import type { CardConfig } from '../types';
import { optimizeImageFile } from '../utils/imageOptimizer';

interface SidebarProps {
  config: CardConfig;
  onChange: (patch: Partial<CardConfig>) => void;
  onRequestClearText: () => void;
  onRequestReset: () => void;
  onOpenProjectModal: () => void;
  totalPages: number;
  currentPage: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  config,
  onChange,
  onRequestClearText,
  onRequestReset,
  onOpenProjectModal,
  totalPages,
  currentPage,
}) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Bold selected text or insert bold template
  const handleInsertBold = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = config.articleContent;
    if (start !== end) {
      const selected = text.slice(start, end);
      const replacement = `**${selected}**`;
      const updated = text.slice(0, start) + replacement + text.slice(end);
      onChange({ articleContent: updated });
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + 2, end + 2);
      }, 0);
    } else {
      const replacement = `**重点词句**`;
      const updated = text.slice(0, start) + replacement + text.slice(start);
      onChange({ articleContent: updated });
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + 2, start + 6);
      }, 0);
    }
  };

  // Italic selected text or insert italic template
  const handleInsertItalic = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = config.articleContent;
    if (start !== end) {
      const selected = text.slice(start, end);
      const replacement = `*${selected}*`;
      const updated = text.slice(0, start) + replacement + text.slice(end);
      onChange({ articleContent: updated });
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + 1, end + 1);
      }, 0);
    } else {
      const replacement = `*斜体文字*`;
      const updated = text.slice(0, start) + replacement + text.slice(start);
      onChange({ articleContent: updated });
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + 1, start + 5);
      }, 0);
    }
  };

  // Avatar file upload handler
  const handleAvatarFile = async (file?: File) => {
    if (!file) return;
    try {
      const dataUrl = await optimizeImageFile(file, 512);
      onChange({ avatarUrl: dataUrl, showAvatar: true });
    } catch (err) {
      console.error('Failed to optimize avatar:', err);
    }
  };

  // Paste from clipboard handler
  const handlePasteArticle = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange({ articleContent: text });
      }
    } catch {
      // Fallback: user can paste directly into textarea
    }
  };

  // Calculate words / characters
  const wordCount = config.articleContent.trim()
    ? config.articleContent.trim().split(/\s+/).length
    : 0;
  const charCount = config.articleContent.length;

  const avatarSizes = [40, 48, 56, 64, 72];

  return (
    <aside className="w-[380px] xl:w-[410px] h-screen bg-[#fbfcfb] border-r border-[#e2e6e3] flex flex-col shrink-0 overflow-hidden shadow-xs">
      {/* Sidebar Header */}
      <div className="h-14 px-5 border-b border-[#e5e9e4] flex items-center justify-between shrink-0 bg-white/70 backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#272c28] text-[#f4ce45] flex items-center justify-center shadow-xs">
            <LayoutTemplate className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 tracking-tight leading-none flex items-center gap-1.5">
              阅笺 <span className="text-xs font-medium text-zinc-400 font-sans tracking-normal">ReadCard</span>
            </h1>
            <p className="text-[11px] text-zinc-500 mt-0.5">美学阅读卡片工坊</p>
          </div>
        </div>

        {/* Project Library & Built-in Samples Modal Trigger */}
        <button
          type="button"
          onClick={onOpenProjectModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-800 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-300/40 rounded-lg transition-colors shadow-2xs"
          title="打开项目库与精选示例"
        >
          <FolderKanban className="w-3.5 h-3.5 text-amber-700" />
          <span>项目与示例</span>
        </button>
      </div>

      {/* Main Content Area (Spacious & Scrollable) */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 text-xs text-zinc-700">
        {/* Block 1: 卡片标题与头像 */}
        <div className="space-y-3.5 bg-white p-4 rounded-xl border border-zinc-200/90 shadow-2xs">
          <div className="flex items-center justify-between font-bold text-zinc-900">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-mono">1</span>
              卡片标识与作者头像
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <label htmlFor="card-heading-input" className="block text-[11px] font-medium text-zinc-600 mb-1">
                卡片主标题 / 专栏名
              </label>
              <input
                id="card-heading-input"
                type="text"
                value={config.cardHeading}
                onChange={(e) => onChange({ cardHeading: e.target.value })}
                placeholder="请输入您的专栏标题"
                maxLength={40}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors font-medium"
              />
            </div>
          </div>

          {/* 头像区域配置 */}
          <div className="p-3 bg-zinc-50/80 border border-zinc-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showAvatar}
                  onChange={(e) => onChange({ showAvatar: e.target.checked })}
                  className="w-3.5 h-3.5 text-amber-600 rounded border-zinc-300 focus:ring-amber-500"
                />
                <span className="text-[11px] font-semibold text-zinc-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  标题左侧显示头像
                </span>
              </label>

              {config.showAvatar && (
                <div className="flex items-center gap-1 bg-zinc-200/70 p-0.5 rounded-md">
                  <button
                    type="button"
                    onClick={() => onChange({ avatarShape: 'circle' })}
                    className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                      config.avatarShape === 'circle'
                        ? 'bg-white text-zinc-900 font-bold shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    圆形
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ avatarShape: 'squircle' })}
                    className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                      config.avatarShape === 'squircle'
                        ? 'bg-white text-zinc-900 font-bold shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    圆角
                  </button>
                </div>
              )}
            </div>

            {config.showAvatar && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {config.avatarUrl ? (
                      <img
                        src={config.avatarUrl}
                        alt="头像预览"
                        className={`w-14 h-14 object-cover border border-zinc-300 shadow-xs ${
                          config.avatarShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-14 h-14 flex items-center justify-center bg-zinc-200/70 text-zinc-500 border border-zinc-300 ${
                          config.avatarShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                        }`}
                      >
                        <User className="w-7 h-7 opacity-60" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="px-2.5 py-1 text-[11px] font-medium bg-white border border-zinc-300 hover:bg-zinc-50 rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Upload className="w-3 h-3 text-zinc-500" />
                        上传本地头像
                      </button>

                      {config.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => onChange({ avatarUrl: '' })}
                          className="p-1 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                          title="移除头像"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400">支持 JPG、PNG、WebP 正方形照片</p>
                  </div>

                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      handleAvatarFile(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </div>

                {/* Avatar Size Selector */}
                <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-zinc-500">头像显示尺寸</span>
                  <div className="flex items-center gap-1 bg-zinc-200/70 p-0.5 rounded-md">
                    {avatarSizes.map((size) => {
                      const isSelected =
                        config.avatarSize === size ||
                        (!config.avatarSize && size === 56) ||
                        (config.avatarSize === 32 && size === 40);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => onChange({ avatarSize: size })}
                          className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                            isSelected
                              ? 'bg-white text-zinc-900 font-bold shadow-xs'
                              : 'text-zinc-600 hover:text-zinc-900'
                          }`}
                        >
                          {size}px
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Block 2: 文章标题与正文创作 */}
        <div className="space-y-3.5 bg-white p-4 rounded-xl border border-zinc-200/90 shadow-2xs flex-1 flex flex-col">
          <div className="flex items-center justify-between font-bold text-zinc-900">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-mono">2</span>
              文章内容与排版
            </span>
            <span className="text-[11px] font-normal text-zinc-400">支持 Markdown 语法</span>
          </div>

          {/* 文章标题 (可选) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="article-title-input" className="block text-[11px] font-medium text-zinc-600">
                文章主标题 <span className="text-[10px] text-zinc-400 font-normal">（可选，留空则正文直接置顶）</span>
              </label>
            </div>
            <input
              id="article-title-input"
              type="text"
              value={config.articleTitle}
              onChange={(e) => onChange({ articleTitle: e.target.value })}
              placeholder="留空则不显示主标题，正文直接排版..."
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors font-medium"
            />
          </div>

          {/* 文章副标题 / 署名 (可选) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="article-author-input" className="block text-[11px] font-medium text-zinc-600">
                文章副标题 / 署名 <span className="text-[10px] text-zinc-400 font-normal">（可选，留空则彻底删除）</span>
              </label>
              {config.author?.trim() && (
                <button
                  type="button"
                  onClick={() => onChange({ author: '' })}
                  className="text-[10px] text-zinc-400 hover:text-red-600 transition-colors"
                >
                  一键清空副标题
                </button>
              )}
            </div>
            <input
              id="article-author-input"
              type="text"
              value={config.author}
              onChange={(e) => onChange({ author: e.target.value })}
              placeholder="例如：Marcel Proust 或 独家精读..."
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors font-medium"
            />
          </div>

          {/* 文章正文与工具栏 */}
          <div className="space-y-2 flex-1 flex flex-col pt-1">
            <div className="flex items-center justify-between">
              <label htmlFor="article-content-textarea" className="block text-[11px] font-medium text-zinc-600">
                文章正文
              </label>

              {/* Text editing toolbar */}
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={handleInsertBold}
                  className="text-zinc-700 hover:text-zinc-950 font-bold px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
                  title="为选中文本加粗 (**加黑**)"
                >
                  <Bold className="w-3 h-3" />
                  <span>加黑</span>
                </button>
                <button
                  type="button"
                  onClick={handleInsertItalic}
                  className="text-zinc-700 hover:text-zinc-950 italic px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
                  title="为选中文本倾斜 (*斜体*)"
                >
                  <Italic className="w-3 h-3" />
                  <span>斜体</span>
                </button>
                <span className="text-zinc-300">|</span>
                <button
                  type="button"
                  onClick={handlePasteArticle}
                  className="text-amber-800 hover:text-amber-900 px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 flex items-center gap-1 transition-colors cursor-pointer"
                  title="粘贴剪贴板内容"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span>粘贴</span>
                </button>
                <span className="text-zinc-300">|</span>
                <button
                  type="button"
                  onClick={onRequestClearText}
                  className="text-zinc-400 hover:text-red-600 px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                  title="清空文章正文"
                >
                  清空
                </button>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              id="article-content-textarea"
              rows={14}
              value={config.articleContent}
              onChange={(e) => onChange({ articleContent: e.target.value })}
              placeholder="在此粘贴或输入英文/中英文文章内容...&#10;&#10;空行分段，系统将根据所选比例自动排版与智能分页。支持 **加黑重点文字** 与 *斜体*。"
              className="w-full flex-1 min-h-[280px] px-3.5 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors leading-relaxed resize-y font-serif"
              spellCheck={false}
            />

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-zinc-400" />
                {wordCount} 词 · {charCount} 字符
              </span>
              <span className="font-medium text-zinc-600">
                {totalPages > 1
                  ? `已分为 ${totalPages} 页（第 ${currentPage + 1} 页）`
                  : '单页卡片'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick hint banner leading to the Right Inspector */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-3 h-3" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-amber-900">配图、色彩与字体设置</p>
            <p className="text-[10px] text-amber-700">在右侧视觉属性栏中实时调节与预览</p>
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3.5 border-t border-[#e2e6e3] bg-white flex items-center justify-between shrink-0 text-[11px] text-zinc-400">
        <button
          type="button"
          onClick={onRequestReset}
          className="hover:text-zinc-700 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> 重置所有设置
        </button>
        <span>阅笺 · 阅读卡片工作台</span>
      </div>
    </aside>
  );
};
