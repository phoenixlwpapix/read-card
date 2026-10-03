import React, { useState, useEffect } from 'react';
import {
  FilePlus2,
  X,
  Palette,
  Image as ImageIcon,
  MessageSquareQuote,
  Heading,
  FileText,
  BadgeCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export interface NewProjectOptions {
  keepIdentity: boolean; // 专栏标识与头像
  keepVisual: boolean; // 视觉风格与主题
  keepImage: boolean; // 卡片配图与排版
  keepFooter: boolean; // 底部引流页脚
  keepTitle: boolean; // 文章标题与作者
  keepContent: boolean; // 文章正文内容
}

export const DEFAULT_NEW_PROJECT_OPTIONS: NewProjectOptions = {
  keepIdentity: true,
  keepVisual: true,
  keepImage: true,
  keepFooter: true,
  keepTitle: false,
  keepContent: false,
};

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: NewProjectOptions) => void;
}

interface OptionConfig {
  key: keyof NewProjectOptions;
  label: string;
  badge?: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const OPTION_ITEMS: OptionConfig[] = [
  {
    key: 'keepIdentity',
    label: '卡片标识区',
    badge: '推荐保留',
    desc: '专栏标题（如“荒哥精读”）、头像及形状尺寸、卷号副标',
    icon: BadgeCheck,
  },
  {
    key: 'keepVisual',
    label: '视觉排版属性',
    badge: '推荐保留',
    desc: '主题配色、字体、字重（500/600）、字号、行高、段落间距与卡片比例',
    icon: Palette,
  },
  {
    key: 'keepImage',
    label: '卡片配图',
    badge: '通用图推荐',
    desc: '当前本地插图与展示位置，方便同系列卡片共用通用插画',
    icon: ImageIcon,
  },
  {
    key: 'keepFooter',
    label: '底部页脚引流',
    badge: '直播间常驻',
    desc: '直播间观众互动与上麦引流文案及展示开关',
    icon: MessageSquareQuote,
  },
  {
    key: 'keepTitle',
    label: '文章标题与作者',
    desc: '保留当前卡片的大标题与作者署名（关闭则清空）',
    icon: Heading,
  },
  {
    key: 'keepContent',
    label: '文章正文内容',
    desc: '保留当前画布中的长文本与重点词底色标记（关闭则清空）',
    icon: FileText,
  },
];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [options, setOptions] = useState<NewProjectOptions>(DEFAULT_NEW_PROJECT_OPTIONS);

  // Reset to default options every time modal opens
  useEffect(() => {
    if (isOpen) {
      setOptions(DEFAULT_NEW_PROJECT_OPTIONS);
    }
  }, [isOpen]);

  // Keyboard shortcut listener (Escape to close, Enter to submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        // Prevent enter if target is a button to avoid double triggering
        if ((e.target as HTMLElement)?.tagName !== 'BUTTON') {
          e.preventDefault();
          onConfirm(options);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, options, onClose, onConfirm]);

  if (!isOpen) return null;

  const toggleOption = (key: keyof NewProjectOptions) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleApplyPreset = (type: 'recommended' | 'all' | 'none') => {
    if (type === 'recommended') {
      setOptions(DEFAULT_NEW_PROJECT_OPTIONS);
    } else if (type === 'all') {
      setOptions({
        keepIdentity: true,
        keepVisual: true,
        keepImage: true,
        keepFooter: true,
        keepTitle: true,
        keepContent: true,
      });
    } else {
      setOptions({
        keepIdentity: false,
        keepVisual: false,
        keepImage: false,
        keepFooter: false,
        keepTitle: false,
        keepContent: false,
      });
    }
  };

  const selectedCount = Object.values(options).filter(Boolean).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(options);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-project-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="px-6 py-4.5 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <FilePlus2 className="w-5 h-5 text-[#f4ce45]" />
            </div>
            <div>
              <h2
                id="new-project-modal-title"
                className="text-base font-bold text-zinc-900 tracking-tight leading-tight"
              >
                新建卡片项目
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                勾选您希望保留的内容与排版规范，未勾选的项将被清空
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors cursor-pointer"
            aria-label="关闭弹窗"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Preset quick actions */}
        <div className="px-6 pt-3.5 pb-2 bg-white flex items-center justify-between border-b border-zinc-100/80 shrink-0">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            快速预设
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleApplyPreset('recommended')}
              className="text-xs px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>推荐预设</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('all')}
              className="text-xs px-2.5 py-1 rounded-md hover:bg-zinc-100 text-zinc-600 font-medium transition-colors cursor-pointer"
            >
              全选保留
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('none')}
              className="text-xs px-2.5 py-1 rounded-md hover:bg-zinc-100 text-zinc-500 font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>全不保留</span>
            </button>
          </div>
        </div>

        {/* Options list */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-3.5 space-y-2.5">
          {OPTION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isChecked = options[item.key];

            return (
              <div
                key={item.key}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
                onClick={() => toggleOption(item.key)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggleOption(item.key);
                  }
                }}
                className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                  isChecked
                    ? 'bg-zinc-50/90 border-zinc-300 shadow-2xs'
                    : 'bg-white border-zinc-200 hover:border-zinc-300 opacity-60 hover:opacity-90'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isChecked
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-400 group-hover:text-zinc-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold tracking-tight transition-colors ${
                          isChecked ? 'text-zinc-900' : 'text-zinc-500'
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.badge && isChecked && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-snug line-clamp-1">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* iOS-style toggle */}
                <div className="shrink-0 flex items-center">
                  <div
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                      isChecked ? 'bg-[#252a26]' : 'bg-zinc-200'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        isChecked ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </form>

        {/* Footer */}
        <footer className="px-6 py-3.5 border-t border-zinc-100 bg-zinc-50/70 flex items-center justify-between shrink-0">
          <span className="text-xs text-zinc-500">
            已选择保留 <strong className="font-semibold text-zinc-800">{selectedCount}</strong>{' '}
            / {OPTION_ITEMS.length} 项
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-[#252a26] hover:bg-[#343b35] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <FilePlus2 className="w-3.5 h-3.5 text-[#f4ce45]" />
              <span>确认新建</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
