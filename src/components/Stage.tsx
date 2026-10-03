import { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ChevronLeft, ChevronRight, FolderKanban, FilePlus2 } from 'lucide-react';
import { getCardDimensions, type CardConfig } from '../types';
import { ReadingCard } from './ReadingCard';

interface StageProps {
  config: CardConfig;
  pages: string[][];
  currentPage: number;
  onPageChange: (page: number) => void;
  onSaveProject: () => void;
  onNewProject?: () => void;
  activeProjectName?: string | null;
}

export interface StageHandle {
  getCardElement: () => HTMLDivElement | null;
}

export const Stage = forwardRef<StageHandle, StageProps>(function Stage(
  {
    config,
    pages,
    currentPage,
    onPageChange,
    onSaveProject,
    onNewProject,
    activeProjectName,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardElementRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState<number>(0.55);

  const dimensions = getCardDimensions(config.aspectRatio);

  useImperativeHandle(ref, () => ({
    getCardElement: () => cardElementRef.current,
  }));

  // Auto calculate fit scale based on viewport size and card dimensions
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 1024;
      const paddingX = isMobile ? 20 : 64;
      const paddingY = isMobile ? 28 : 64;
      const availableW = Math.max(120, rect.width - paddingX);
      const availableH = Math.max(120, rect.height - paddingY);

      const scaleX = availableW / dimensions.width;
      const scaleY = availableH / dimensions.height;
      const scale = Math.min(scaleX, scaleY);
      setFitScale(Math.max(0.12, Math.min(1.0, scale)));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [dimensions.width, dimensions.height]);

  const totalPages = Math.max(1, pages.length);
  const safeCurrentPage = Math.min(currentPage, totalPages - 1);
  const currentParagraphs = pages[safeCurrentPage] ?? [];

  return (
    <main className="flex-1 h-screen flex flex-col min-w-0 bg-[#eef1ee] overflow-hidden relative">
      {/* Top Workbench Stage Toolbar */}
      <header className="h-14 px-3 sm:px-6 border-b border-[#e1e6e0] bg-[#fbfcfb] flex items-center justify-between shrink-0 shadow-2xs z-20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-xs font-bold text-zinc-800 tracking-tight shrink-0">
            卡片画板
          </span>
          <span className="text-[10px] font-mono font-medium px-1.5 sm:px-2 py-0.5 rounded-full bg-zinc-200/70 text-zinc-700 shrink-0">
            {config.aspectRatio || '3:4'}
          </span>
          {activeProjectName && (
            <span
              className="text-[11px] text-zinc-600 hidden sm:flex items-center gap-1.5 font-medium truncate max-w-[200px] border-l border-zinc-200 pl-3"
              title={`当前正在编辑的项目: ${activeProjectName}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate font-semibold text-zinc-800">{activeProjectName}</span>
            </span>
          )}
        </div>

        {/* Top Right: New Project & Save Project Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onNewProject && (
            <button
              type="button"
              onClick={onNewProject}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200/90 text-zinc-700 hover:text-zinc-900 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer hover:border-zinc-300"
              title="新建空白卡片（保留专栏、头像与排版风格）"
            >
              <FilePlus2 className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">新建项目</span>
              <span className="sm:hidden">新建</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSaveProject}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-[#252a26] hover:bg-[#343b35] text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <FolderKanban className="w-3.5 h-3.5 text-[#f4ce45]" />
            <span className="hidden sm:inline">保存项目</span>
            <span className="sm:hidden">保存</span>
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-center justify-center p-3 sm:p-8 pb-20 lg:pb-8 relative select-none"
        style={{
          backgroundImage:
            'radial-gradient(#c5ccc4 1px, transparent 1px), radial-gradient(#d3dbd2 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      >
        {/* Scale Container wrapping the reading card */}
        <div
          className="relative transition-transform duration-150 ease-out shrink-0"
          style={{
            width: `${dimensions.width * fitScale}px`,
            height: `${dimensions.height * fitScale}px`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              transform: `scale(${fitScale})`,
              transformOrigin: 'top left',
            }}
          >
            <ReadingCard
              ref={cardElementRef}
              config={config}
              paragraphs={currentParagraphs}
              pageIndex={safeCurrentPage}
              totalPages={totalPages}
            />
          </div>
        </div>

        {/* Floating Multi-page Switcher on Mobile */}
        {totalPages > 1 && (
          <div className="lg:hidden absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-zinc-200/90 text-xs select-none">
            <button
              type="button"
              disabled={safeCurrentPage === 0}
              onClick={() => onPageChange(Math.max(0, safeCurrentPage - 1))}
              className="p-1 rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="上一页"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-zinc-800">
              {safeCurrentPage + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safeCurrentPage >= totalPages - 1}
              onClick={() => onPageChange(Math.min(totalPages - 1, safeCurrentPage + 1))}
              className="p-1 rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="下一页"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Status Bar - Desktop only */}
      <footer className="h-9 px-6 bg-[#fbfcfb] border-t border-[#e1e6e0] hidden lg:flex items-center justify-between text-[11px] text-zinc-500 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>工作台就绪 · 渲染比例 {Math.round(fitScale * 100)}%</span>
        </div>

        {/* Multi-page switcher in status bar */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 bg-zinc-100 p-0.5 rounded-md border border-zinc-200 shadow-2xs">
            <button
              type="button"
              disabled={safeCurrentPage === 0}
              onClick={() => onPageChange(Math.max(0, safeCurrentPage - 1))}
              className="p-1 rounded text-zinc-600 hover:text-zinc-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="上一页"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-semibold px-2 text-zinc-800">
              第 {safeCurrentPage + 1} / {totalPages} 页
            </span>
            <button
              type="button"
              disabled={safeCurrentPage >= totalPages - 1}
              onClick={() => onPageChange(Math.min(totalPages - 1, safeCurrentPage + 1))}
              className="p-1 rounded text-zinc-600 hover:text-zinc-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="下一页"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 text-zinc-400">
          <span>
            高保真 2× 超清导出 ({dimensions.width * 2} × {dimensions.height * 2})
          </span>
          <span>按 {config.aspectRatio || '3:4'} 比例精准排版</span>
        </div>
      </footer>
    </main>
  );
});
