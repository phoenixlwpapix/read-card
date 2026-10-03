import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { downloadBlob } from '../utils/file';

export interface ExportedCardImage {
  blob: Blob;
  url: string;
  filename: string;
  pageIndex: number;
}

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ExportedCardImage[];
  initialPageIndex?: number;
  onToast?: (message: string, type?: 'info' | 'success' | 'error') => void;
}

export const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  isOpen,
  onClose,
  images,
  initialPageIndex = 0,
  onToast,
}) => {
  const [currentPage, setCurrentPage] = useState(initialPageIndex);
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(Math.min(initialPageIndex, Math.max(0, images.length - 1)));
      setIsCopied(false);
      setIsSharing(false);
    }
  }, [isOpen, initialPageIndex, images.length]);

  // Clean up Object URLs when modal unmounts or images change
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        try {
          URL.revokeObjectURL(img.url);
        } catch {
          // ignore
        }
      });
    };
  }, [images]);

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentPage] || images[0];

  // Call Web Share API to trigger native "Save Image to Photos" / share sheet
  const handleSaveToAlbum = async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      const file = new File([currentImage.blob], currentImage.filename, {
        type: 'image/png',
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: '读书卡片',
          text: '我的精美读书卡片',
        });
        onToast?.('已唤起系统保存，请在弹出菜单中点击「存储图像」', 'success');
        return;
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('Web Share failed, fallback to long-press prompt:', err);
      } else {
        // User dismissed native share sheet
        return;
      }
    } finally {
      setIsSharing(false);
    }

    // Fallback prompt for browsers without Web Share files support
    onToast?.('请长按上方卡片图片，并在弹出菜单中点击「存储图像 / 保存到相册」', 'info');
  };

  // Download direct PNG file fallback
  const handleDownloadFile = () => {
    downloadBlob(currentImage.blob, currentImage.filename);
    onToast?.('卡片 PNG 文件已开始下载', 'success');
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': currentImage.blob }),
        ]);
        setIsCopied(true);
        onToast?.('卡片图片已复制到剪贴板！', 'success');
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        onToast?.('当前浏览器不支持直接复制图片，请长按图片保存', 'info');
      }
    } catch {
      onToast?.('复制失败，请直接长按图片保存到相册', 'info');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200/90 flex flex-col max-h-[94vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-zinc-50/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
                  卡片已生成
                </h3>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/40">
                  2x 高清
                </span>
              </div>
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

        {/* Mobile Highlight Notice */}
        <div className="px-4 py-2 bg-amber-50/90 border-b border-amber-200/80 text-[11.5px] text-amber-900 flex items-center gap-1.5 shrink-0">
          <span className="font-bold shrink-0">💡 存图提示：</span>
          <span className="truncate sm:whitespace-normal">
            长按图片在菜单中选择「存储图像」存入相册，或点下方按钮一键保存。
          </span>
        </div>

        {/* Image Preview Canvas Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#252824] flex items-center justify-center relative select-none">
          <img
            src={currentImage.url}
            alt={`阅读卡片 - ${currentImage.filename}`}
            className="max-h-[56vh] sm:max-h-[58vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
            style={{
              WebkitTouchCallout: 'default',
              userSelect: 'auto',
            }}
          />

          {/* Multi-page Switcher on Image if multiple pages */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white text-xs shadow-lg">
              <button
                type="button"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="p-1 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                title="上一页"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-[11px]">
                {currentPage + 1} / {images.length}
              </span>
              <button
                type="button"
                disabled={currentPage >= images.length - 1}
                onClick={() => setCurrentPage((p) => Math.min(images.length - 1, p + 1))}
                className="p-1 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                title="下一页"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-zinc-100 space-y-2.5 shrink-0">
          <div className="flex items-center gap-2">
            {/* Primary Action: Save to Album / Share */}
            <button
              type="button"
              onClick={handleSaveToAlbum}
              className="flex-1 py-2.5 px-4 bg-[#252a26] hover:bg-[#343b35] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[#f4ce45]" />
              <span>保存到手机相册</span>
            </button>

            {/* Secondary Action: Copy Image */}
            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="复制卡片图片到剪贴板"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="hidden sm:inline">复制</span>
                </>
              )}
            </button>

            {/* Secondary Action: Download File */}
            <button
              type="button"
              onClick={handleDownloadFile}
              className="py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="直接下载为 PNG 文件"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">下载文件</span>
            </button>
          </div>

          <p className="text-[10px] text-zinc-400 text-center">
            点击「保存到手机相册」可在弹出菜单中轻点「存储图像」，或直接长按上方卡片保存
          </p>
        </div>
      </div>
    </div>
  );
};
