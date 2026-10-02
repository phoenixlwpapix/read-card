import { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ChevronLeft, ChevronRight, FolderKanban } from 'lucide-react';
import type { CardConfig } from '../types';
import { ReadingCard } from './ReadingCard';

interface StageProps {
  config: CardConfig;
  pages: string[][];
  currentPage: number;
  onPageChange: (page: number) => void;
  onSaveProject: () => void;
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
    activeProjectName,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardElementRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState<number>(0.55);

  useImperativeHandle(ref, () => ({
    getCardElement: () => cardElementRef.current,
  }));

  // Auto calculate fit scale based on viewport size
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const paddingX = 64;
      const paddingY = 64;
      const availableW = Math.max(200, rect.width - paddingX);
      const availableH = Math.max(200, rect.height - paddingY);

      // Card is 900 x 1200 (3:4)
      const scaleX = availableW / 900;
      const scaleY = availableH / 1200;
      const scale = Math.min(scaleX, scaleY);
      setFitScale(Math.max(0.2, Math.min(1.0, scale)));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const totalPages = Math.max(1, pages.length);
  const safeCurrentPage = Math.min(currentPage, totalPages - 1);
  const currentParagraphs = pages[safeCurrentPage] ?? [];

  return (
    <main className="flex-1 h-screen flex flex-col min-w-0 bg-[#eef1ee] overflow-hidden">
      {/* Top Workbench Stage Toolbar */}
      <header className="h-14 px-6 border-b border-[#e1e6e0] bg-[#fbfcfb] flex items-center justify-between shrink-0 shadow-2xs z-20">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-bold text-zinc-800 tracking-tight shrink-0">
            卡片画板
          </span>
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-200/70 text-zinc-700 shrink-0">
            3:4 · 900 × 1200 px
          </span>
          {activeProjectName && (
            <span className="text-[11px] text-zinc-600 flex items-center gap-1.5 font-medium truncate max-w-[260px] border-l border-zinc-200 pl-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">{activeProjectName}</span>
            </span>
          )}
        </div>

        {/* Top Right: Only the Save Project Button */}
        <button
          type="button"
          onClick={onSaveProject}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#252a26] hover:bg-[#343b35] text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
        >
          <FolderKanban className="w-3.5 h-3.5 text-[#f4ce45]" />
          <span>保存项目</span>
        </button>
      </header>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-center justify-center p-8 relative"
        style={{
          backgroundImage:
            'radial-gradient(#c5ccc4 1px, transparent 1px), radial-gradient(#d3dbd2 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      >
        {/* Scale Container wrapping the 900x1200 reading card */}
        <div
          className="relative transition-transform duration-150 ease-out shrink-0"
          style={{
            width: `${900 * fitScale}px`,
            height: `${1200 * fitScale}px`,
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
            />
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-9 px-6 bg-[#fbfcfb] border-t border-[#e1e6e0] flex items-center justify-between text-[11px] text-zinc-500 shrink-0 select-none">
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
          <span>高保真 2× 超清导出 (1800 × 2400)</span>
          <span>按 3:4 比例精准排版</span>
        </div>
      </footer>
    </main>
  );
});
