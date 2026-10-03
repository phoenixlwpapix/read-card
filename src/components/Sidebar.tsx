import React, { useRef } from 'react';
import {
  User,
  Trash2,
  Upload,
  RotateCcw,
  LayoutTemplate,
  Italic,
  Highlighter,
  RemoveFormatting,
  ClipboardPaste,
  FileText,
  SlidersHorizontal,
  FolderKanban,
  X,
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
  onToast?: (text: string, type?: 'success' | 'error' | 'info') => void;
  isOpenOnMobile?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  config,
  onChange,
  onRequestClearText,
  onRequestReset,
  onOpenProjectModal,
  totalPages,
  currentPage,
  onToast,
  isOpenOnMobile = false,
  onClose,
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
      let selStart = start;
      let selEnd = end;

      // Automatically trim trailing and leading spaces (browser double-click selects trailing space by default)
      while (selEnd > selStart && /\s/.test(text[selEnd - 1])) {
        selEnd--;
      }
      while (selStart < selEnd && /\s/.test(text[selStart])) {
        selStart++;
      }

      if (selStart !== selEnd) {
        const selected = text.slice(selStart, selEnd);
        const replacement = `**${selected}**`;
        const updated = text.slice(0, selStart) + replacement + text.slice(selEnd);
        onChange({ articleContent: updated });
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(selStart + 2, selStart + 2 + selected.length);
        }, 0);
      }
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
      let selStart = start;
      let selEnd = end;

      // Automatically trim trailing and leading spaces
      while (selEnd > selStart && /\s/.test(text[selEnd - 1])) {
        selEnd--;
      }
      while (selStart < selEnd && /\s/.test(text[selStart])) {
        selStart++;
      }

      if (selStart !== selEnd) {
        const selected = text.slice(selStart, selEnd);
        const replacement = `*${selected}*`;
        const updated = text.slice(0, selStart) + replacement + text.slice(selEnd);
        onChange({ articleContent: updated });
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(selStart + 1, selStart + 1 + selected.length);
        }, 0);
      }
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

  // Clear formatting from selected text or from entire text if nothing selected
  const handleClearFormatting = () => {
    const el = textareaRef.current;
    const text = config.articleContent;
    if (!text) return;

    const stripMarkers = (str: string) => {
      return str
        .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/___([^_]+)___/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/(^|[^\w])_([^_]+)_(?=[^\w]|$)/g, '$1$2')
        .replace(/~~([^~]+)~~/g, '$1')
        .replace(/==([^=]+)==/g, '$1')
        .replace(/`([^`]+)`/g, '$1');
    };

    if (!el) {
      const cleaned = stripMarkers(text);
      if (cleaned !== text) {
        onChange({ articleContent: cleaned });
        onToast?.('已一键清空全文排版格式', 'success');
      } else {
        onToast?.('当前文本无格式标记', 'info');
      }
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start !== end) {
      let selStart = start;
      let selEnd = end;

      // Automatically trim trailing/leading spaces before checking markers
      while (selEnd > selStart && /\s/.test(text[selEnd - 1])) {
        selEnd--;
      }
      while (selStart < selEnd && /\s/.test(text[selStart])) {
        selStart++;
      }

      let selected = text.slice(selStart, selEnd);

      // Check if formatting markers are wrapped immediately around the selection
      // e.g. user double-clicked word inside **word**
      if (
        selStart >= 3 &&
        selEnd + 3 <= text.length &&
        text.slice(selStart - 3, selStart) === '***' &&
        text.slice(selEnd, selEnd + 3) === '***'
      ) {
        selStart -= 3;
        selEnd += 3;
        selected = text.slice(selStart, selEnd);
      } else if (
        selStart >= 2 &&
        selEnd + 2 <= text.length &&
        text.slice(selStart - 2, selStart) === '**' &&
        text.slice(selEnd, selEnd + 2) === '**'
      ) {
        selStart -= 2;
        selEnd += 2;
        selected = text.slice(selStart, selEnd);
      } else if (
        selStart >= 1 &&
        selEnd + 1 <= text.length &&
        text.slice(selStart - 1, selStart) === '*' &&
        text.slice(selEnd, selEnd + 1) === '*' &&
        text.slice(selStart - 2, selStart) !== '**'
      ) {
        selStart -= 1;
        selEnd += 1;
        selected = text.slice(selStart, selEnd);
      }

      const stripped = stripMarkers(selected);
      if (stripped === selected) {
        onToast?.('所选文本未包含排版格式', 'info');
        return;
      }

      const updated = text.slice(0, selStart) + stripped + text.slice(selEnd);
      onChange({ articleContent: updated });
      onToast?.('已清空选中文字排版格式', 'success');

      setTimeout(() => {
        el.focus();
        el.setSelectionRange(selStart, selStart + stripped.length);
      }, 0);
    } else {
      // No text selected: clear formatting across the whole article
      const cleaned = stripMarkers(text);
      if (cleaned === text) {
        onToast?.('当前正文无排版格式', 'info');
        return;
      }

      onChange({ articleContent: cleaned });
      onToast?.('已一键清空全文格式（保留纯文本）', 'success');
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start);
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
        onToast?.('已从剪贴板粘贴正文', 'success');
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
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[400px] xl:w-[410px] h-screen bg-[#fbfcfb] border-r border-[#e2e6e3] flex flex-col shrink-0 overflow-hidden shadow-2xl lg:shadow-xs transition-transform duration-300 ease-out
        lg:static lg:w-[380px] lg:translate-x-0
        ${isOpenOnMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Sidebar Header */}
      <div className="h-14 px-4 sm:px-5 border-b border-[#e5e9e4] flex items-center justify-between shrink-0 bg-white/70 backdrop-blur-xs">
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

        <div className="flex items-center gap-1.5">
          {/* Project Library & Built-in Samples Modal Trigger */}
          <button
            type="button"
            onClick={onOpenProjectModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-zinc-800 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-300/40 rounded-lg transition-colors shadow-2xs cursor-pointer"
            title="打开项目库与精选示例"
          >
            <FolderKanban className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">项目与示例</span>
            <span className="sm:hidden">项目</span>
          </button>

          {/* Mobile Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
              title="收起并查看预览"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
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
          <div className="space-y-1.5 flex-1 flex flex-col pt-1">
            {/* Header row: Label on left, Paste & Clear on right */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="article-content-textarea"
                className="text-[11px] font-medium text-zinc-700 flex items-center gap-1.5"
              >
                <span>文章正文</span>
                <span className="text-[10px] text-zinc-400 font-normal">（自动排版分页）</span>
              </label>

              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={handlePasteArticle}
                  className="text-amber-800 hover:text-amber-950 px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100/80 border border-amber-200/70 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  title="从剪贴板粘贴内容"
                >
                  <ClipboardPaste className="w-3 h-3 text-amber-700" />
                  <span>粘贴</span>
                </button>

                <span className="text-zinc-300">|</span>

                <button
                  type="button"
                  onClick={onRequestClearText}
                  className="text-zinc-400 hover:text-red-600 px-1.5 py-0.5 rounded hover:bg-red-50 flex items-center gap-1 transition-colors cursor-pointer"
                  title="清空文章全部正文"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>清空</span>
                </button>
              </div>
            </div>

            {/* Unified Editor Card Box */}
            <div className="flex-1 flex flex-col rounded-lg border border-zinc-200 overflow-hidden focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-colors bg-white shadow-2xs">
              {/* Text formatting toolbar strip */}
              <div className="bg-zinc-100/75 border-b border-zinc-200/80 px-2.5 py-1.5 flex items-center justify-between gap-1 select-none">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleInsertBold}
                    className="text-amber-900 hover:text-amber-950 font-bold px-2 py-1 rounded-md bg-amber-100/80 hover:bg-amber-100 border border-amber-300/60 flex items-center gap-1 text-[11px] transition-colors cursor-pointer shadow-2xs"
                    title="为选中文本添加主题底色重点高亮 (**重点文字**)"
                  >
                    <Highlighter className="w-3.5 h-3.5 text-amber-700" />
                    <span>重点高亮</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleInsertItalic}
                    className="text-zinc-700 hover:text-zinc-950 italic px-2 py-1 rounded-md bg-white hover:bg-zinc-50 border border-zinc-200/80 flex items-center gap-1 text-[11px] transition-colors cursor-pointer shadow-2xs"
                    title="为选中文本倾斜 (*斜体*)"
                  >
                    <Italic className="w-3.5 h-3.5 text-zinc-600" />
                    <span>斜体</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearFormatting}
                    className="text-zinc-700 hover:text-zinc-950 px-2 py-1 rounded-md bg-white hover:bg-zinc-50 border border-zinc-200/80 flex items-center gap-1 text-[11px] transition-colors cursor-pointer shadow-2xs"
                    title="一键清除选中文字或全文的所有重点高亮与斜体排版格式"
                  >
                    <RemoveFormatting className="w-3.5 h-3.5 text-zinc-500" />
                    <span>清空格式</span>
                  </button>
                </div>

                <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline" title="支持 Markdown 语法">
                  Markdown
                </span>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                id="article-content-textarea"
                rows={14}
                value={config.articleContent}
                onChange={(e) => onChange({ articleContent: e.target.value })}
                placeholder="在此粘贴或输入英文/中英文文章内容...&#10;&#10;回车或空行即可自动分段，系统将根据所选比例自动排版与智能分页。支持 **重点高亮文字**（主题匹配底色）与 *斜体*。"
                className="w-full flex-1 min-h-[280px] p-3 text-xs text-zinc-800 focus:outline-hidden leading-relaxed resize-y font-serif border-0 bg-transparent"
                spellCheck={false}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
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

        {/* Block 3: 卡片页脚与标语 */}
        <div className="space-y-3 bg-white p-4 rounded-xl border border-zinc-200/90 shadow-2xs">
          <div className="flex items-center justify-between font-bold text-zinc-900">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-mono">3</span>
              卡片页脚与标语
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.showFooter ?? true}
                onChange={(e) => onChange({ showFooter: e.target.checked })}
                className="w-3.5 h-3.5 text-amber-600 rounded border-zinc-300 focus:ring-amber-500 cursor-pointer"
              />
              <span className="text-[11px] font-semibold text-zinc-800">
                {(config.showFooter ?? true) ? '已开启' : '已关闭'}
              </span>
            </label>
          </div>

          {(config.showFooter ?? true) ? (
            <div className="space-y-2 pt-0.5">
              <div>
                <label htmlFor="card-footer-input" className="block text-[11px] font-medium text-zinc-600 mb-1">
                  底部互动标语 / 连麦文案
                </label>
                <input
                  id="card-footer-input"
                  type="text"
                  value={config.footerText ?? ''}
                  onChange={(e) => onChange({ footerText: e.target.value })}
                  placeholder="如：欢迎连麦交流 · 申请上麦一起读"
                  maxLength={60}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors font-medium"
                />
              </div>

              {/* Quick Live Stream Presets */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400">直播间常用预设：</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '欢迎连麦交流 · 申请上麦一起读',
                    '连麦精读中 · 点击申请上麦',
                    '欢迎上麦领读 · 沉浸式慢读',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onChange({ footerText: preset })}
                      className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 hover:bg-amber-100 hover:text-amber-900 text-zinc-600 transition-colors cursor-pointer border border-zinc-200/60"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5">
                <span>底端文字已居中加粗放大（24px），手机端直播格外醒目</span>
                {config.footerText && (
                  <button
                    type="button"
                    onClick={() => onChange({ footerText: '' })}
                    className="hover:text-zinc-600 cursor-pointer ml-2 shrink-0"
                  >
                    清空文案
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-zinc-400 py-0.5">
              页脚已关闭，卡片正文底部可多容纳约 3~5 行文字。
            </p>
          )}
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
