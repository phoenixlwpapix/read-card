import React, { useState, useEffect } from 'react';
import { FolderKanban, X, Sparkles, Check, ArrowRight, RotateCw, PlusCircle } from 'lucide-react';

interface SaveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAsNew: (name: string) => void;
  onUpdateCurrent?: (name?: string) => void;
  activeProjectName?: string | null;
  isExistingUserProject?: boolean;
  defaultName: string;
  onOpenProjectLibrary?: () => void;
}

export const SaveProjectModal: React.FC<SaveProjectModalProps> = ({
  isOpen,
  onClose,
  onSaveAsNew,
  onUpdateCurrent,
  activeProjectName,
  isExistingUserProject,
  defaultName,
  onOpenProjectLibrary,
}) => {
  const [saveMode, setSaveMode] = useState<'update' | 'new'>(
    isExistingUserProject ? 'update' : 'new'
  );
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (isOpen) {
      setSaveMode(isExistingUserProject ? 'update' : 'new');
      setName(defaultName || '我的卡片项目');
    }
  }, [isOpen, isExistingUserProject, defaultName]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveMode === 'update' && onUpdateCurrent) {
      onUpdateCurrent(name.trim() || undefined);
      onClose();
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) return;
    onSaveAsNew(trimmed);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shadow-2xs shrink-0">
              <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight">保存卡片项目</h2>
              <p className="text-xs text-zinc-500 hidden sm:block mt-0.5 truncate">将卡片文本与排版安全存入数据库，刷新不丢失</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer shrink-0"
            title="关闭"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-6 space-y-4">
            {/* If user is editing an existing project, allow choosing Update or Save As New */}
            {isExistingUserProject && activeProjectName && (
              <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-xl border border-zinc-200 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSaveMode('update');
                    if (activeProjectName) setName(activeProjectName);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    saveMode === 'update'
                      ? 'bg-white text-zinc-900 font-bold shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>更新已有项目</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSaveMode('new');
                    setName(
                      activeProjectName
                        ? `${activeProjectName} (副本)`
                        : defaultName || '我的新卡片项目'
                    );
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    saveMode === 'new'
                      ? 'bg-white text-zinc-900 font-bold shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>另存为新项目</span>
                </button>
              </div>
            )}

            {saveMode === 'update' && isExistingUserProject ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1">
                  <p className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>覆盖更新已有项目</span>
                  </p>
                  <p className="text-[11px] text-emerald-700/90 leading-relaxed">
                    将当前画布上的最新排版与文本内容更新保存至该项目。
                  </p>
                </div>

                <div>
                  <label htmlFor="save-project-name" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    项目名称
                  </label>
                  <input
                    id="save-project-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入项目名称..."
                    maxLength={50}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="save-project-name" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  新项目名称
                </label>
                <input
                  id="save-project-name"
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入新项目名称..."
                  maxLength={50}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
                {isExistingUserProject && activeProjectName && (
                  <p className="text-[11px] text-amber-800/80 mt-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>原项目「{activeProjectName}」将原封不动保留，本次改动将保存为独立的新项目。</span>
                  </p>
                )}
              </div>
            )}

            <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                数据安全持久化于本地数据库（无容量限制），支持大图与长文，刷新浏览器永久保留。
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
            {onOpenProjectLibrary ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProjectLibrary();
                }}
                className="text-xs font-medium text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>打开项目库</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saveMode === 'new' && !name.trim()}
                className="px-4 py-1.5 bg-[#252a26] hover:bg-[#343b35] disabled:opacity-40 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-[#f4ce45]" />
                <span>{saveMode === 'update' ? '确认更新' : '确认保存'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
