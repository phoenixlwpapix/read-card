import { useState, useRef, useEffect, useCallback } from 'react';
import { FileText, SlidersHorizontal, FolderKanban, Download } from 'lucide-react';
import { getCardDimensions, type CardConfig, type CardProject } from './types';
import { INITIAL_CONFIG } from './constants/samples';
import { usePagination } from './utils/pagination';
import { Sidebar } from './components/Sidebar';
import { Stage, type StageHandle } from './components/Stage';
import { Inspector } from './components/Inspector';
import { ProjectModal } from './components/ProjectModal';
import { SaveProjectModal } from './components/SaveProjectModal';
import { NewProjectModal, type NewProjectOptions } from './components/NewProjectModal';
import { ExportPreviewModal, type ExportedCardImage } from './components/ExportPreviewModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer, type ToastMessage } from './components/Toast';
import { exportFonts } from './exportFonts';
import { safeFileName, downloadBlob } from './utils/file';
import { idbGet, idbSet } from './utils/storage';

const CONFIG_KEY = 'read-card-app-config-v2';
const PROJECTS_KEY = 'read-card-app-user-projects-v2';
const ACTIVE_PROJECT_KEY = 'read-card-app-active-project-v2';
const LEGACY_CONFIG_KEY = 'read-card-app-config-v1';
const LEGACY_PROJECTS_KEY = 'read-card-app-user-projects-v1';

export default function App() {
  const [config, setConfig] = useState<CardConfig>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_KEY) || localStorage.getItem(LEGACY_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.cardHeading === '奇幻画布 · 英语精读') {
          parsed.cardHeading = '请输入您的专栏标题';
        }
        return {
          ...INITIAL_CONFIG,
          ...parsed,
          paragraphSpacing: parsed.paragraphSpacing ?? INITIAL_CONFIG.paragraphSpacing,
        };
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_CONFIG;
  });

  const [userProjects, setUserProjects] = useState<CardProject[]>(() => {
    try {
      const saved = localStorage.getItem(PROJECTS_KEY) || localStorage.getItem(LEGACY_PROJECTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback to empty
    }
    return [];
  });

  const [activeProject, setActiveProject] = useState<{
    id: string;
    name: string;
    savedConfig?: CardConfig;
  } | null>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_PROJECT_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null;
  });

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [exportedImages, setExportedImages] = useState<ExportedCardImage[]>([]);
  const [isExportPreviewOpen, setIsExportPreviewOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isCopying, setIsCopying] = useState<boolean>(false);
  const [mobileDrawer, setMobileDrawer] = useState<'sidebar' | 'inspector' | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const stageRef = useRef<StageHandle>(null);

  // Pagination calculation based on 3:4 card body space
  const pages = usePagination(config);

  // Keep currentPage within bounds when pages change
  useEffect(() => {
    if (currentPage >= pages.length) {
      setCurrentPage(Math.max(0, pages.length - 1));
    }
  }, [pages.length, currentPage]);

  // Hydrate from IndexedDB on initial mount (handles large images & robust project storage)
  useEffect(() => {
    let isMounted = true;
    async function hydrate() {
      try {
        // 1. Projects
        const idbProjects = await idbGet<CardProject[]>(PROJECTS_KEY);
        if (idbProjects && Array.isArray(idbProjects) && idbProjects.length > 0) {
          if (isMounted) setUserProjects(idbProjects);
        } else {
          // Migrate legacy localStorage if exists
          const legacy = localStorage.getItem(LEGACY_PROJECTS_KEY);
          if (legacy) {
            try {
              const parsed = JSON.parse(legacy);
              if (Array.isArray(parsed) && parsed.length > 0) {
                if (isMounted) setUserProjects(parsed);
                await idbSet(PROJECTS_KEY, parsed);
              }
            } catch {}
          }
        }

        // 2. Active Project
        const idbActive = await idbGet<{ id: string; name: string }>(ACTIVE_PROJECT_KEY);
        if (idbActive && isMounted) {
          setActiveProject(idbActive);
        }

        // 3. Current Workspace Config
        const idbConfig = await idbGet<CardConfig>(CONFIG_KEY);
        if (idbConfig && isMounted) {
          if (idbConfig.cardHeading === '奇幻画布 · 英语精读') {
            idbConfig.cardHeading = '请输入您的专栏标题';
          }
          setConfig((prev) => ({
            ...prev,
            ...idbConfig,
            paragraphSpacing: idbConfig.paragraphSpacing ?? INITIAL_CONFIG.paragraphSpacing,
          }));
        } else {
          const legacyConf = localStorage.getItem(LEGACY_CONFIG_KEY);
          if (legacyConf) {
            try {
              const parsed = JSON.parse(legacyConf);
              if (parsed && typeof parsed === 'object') {
                if (parsed.cardHeading === '奇幻画布 · 英语精读') {
                  parsed.cardHeading = '请输入您的专栏标题';
                }
                if (isMounted) {
                  setConfig((prev) => ({
                    ...prev,
                    ...parsed,
                    paragraphSpacing: parsed.paragraphSpacing ?? INITIAL_CONFIG.paragraphSpacing,
                  }));
                }
                await idbSet(CONFIG_KEY, parsed);
              }
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Hydration warning:', err);
      }
    }

    hydrate();
    return () => {
      isMounted = false;
    };
  }, []);

  // Continuous reliable persistence of active workspace draft to IndexedDB
  useEffect(() => {
    idbSet(CONFIG_KEY, config);
  }, [config]);

  // Window beforeunload safeguard: flush latest state synchronously
  useEffect(() => {
    const handleUnload = () => {
      idbSet(CONFIG_KEY, config);
      idbSet(
        ACTIVE_PROJECT_KEY,
        activeProject ? { id: activeProject.id, name: activeProject.name } : null
      );
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [config, activeProject]);

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleConfigChange = useCallback((patch: Partial<CardConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  // Request clear text confirmation
  const handleRequestClearText = useCallback(() => {
    setConfirmModal({
      isOpen: true,
      title: '清空文章文本？',
      description: '确定要清空当前输入的文章文本吗？此操作无法撤销。',
      confirmLabel: '清空文本',
      variant: 'danger',
      onConfirm: () => {
        handleConfigChange({ articleContent: '' });
        setConfirmModal((m) => ({ ...m, isOpen: false }));
        addToast('文章正文已清空', 'info');
      },
    });
  }, [handleConfigChange, addToast]);

  // Handle new project creation with customized keep/reset options
  const handleConfirmNewProject = useCallback(
    (options: NewProjectOptions) => {
      setConfig((prev) => {
        const next: CardConfig = { ...prev };

        // 1. Identity (cardHeading, volume, tagline, avatar)
        if (!options.keepIdentity) {
          next.cardHeading = INITIAL_CONFIG.cardHeading;
          next.volume = INITIAL_CONFIG.volume;
          next.tagline = INITIAL_CONFIG.tagline;
          next.showAvatar = INITIAL_CONFIG.showAvatar;
          next.avatarUrl = '';
          next.avatarShape = INITIAL_CONFIG.avatarShape;
          next.avatarSize = INITIAL_CONFIG.avatarSize;
        }

        // 2. Visual & Layout (theme, fontFamily, fontWeight, fontSize, lineHeight, aspectRatio, texture)
        if (!options.keepVisual) {
          next.theme = INITIAL_CONFIG.theme;
          next.fontFamily = INITIAL_CONFIG.fontFamily;
          next.fontWeight = INITIAL_CONFIG.fontWeight;
          next.fontSize = INITIAL_CONFIG.fontSize;
          next.lineHeight = INITIAL_CONFIG.lineHeight;
          next.paragraphSpacing = INITIAL_CONFIG.paragraphSpacing;
          next.showTexture = INITIAL_CONFIG.showTexture;
          next.textureType = INITIAL_CONFIG.textureType;
          next.textureIntensity = INITIAL_CONFIG.textureIntensity;
          next.aspectRatio = INITIAL_CONFIG.aspectRatio;
        }

        // 3. Card Image (imageUrl, showImage)
        if (!options.keepImage) {
          next.imageUrl = '';
          next.showImage = false;
        }

        // 4. Footer (showFooter, footerText)
        if (!options.keepFooter) {
          next.showFooter = false;
          next.footerText = '';
        }

        // 5. Title & Author (articleTitle, author)
        if (!options.keepTitle) {
          next.articleTitle = '';
          next.author = '';
        }

        // 6. Content (articleContent)
        if (!options.keepContent) {
          next.articleContent = '';
        }

        return next;
      });

      // Reset project binding
      setActiveProject(null);
      idbSet(ACTIVE_PROJECT_KEY, null);
      setCurrentPage(0);

      const keptCount = Object.values(options).filter(Boolean).length;
      addToast(
        keptCount === 0
          ? '已新建纯净空白卡片项目'
          : `已新建卡片项目（已保留选中的 ${keptCount} 项配置）`,
        'success'
      );
    },
    [addToast]
  );

  // Request reset all configuration confirmation
  const handleRequestReset = useCallback(() => {
    setConfirmModal({
      isOpen: true,
      title: '重置所有设置？',
      description: '确定要将所有卡片标题、文本、配图和样式恢复为初始预设吗？',
      confirmLabel: '恢复预设',
      variant: 'warning',
      onConfirm: () => {
        setConfig(INITIAL_CONFIG);
        setActiveProject(null);
        idbSet(CONFIG_KEY, INITIAL_CONFIG);
        idbSet(ACTIVE_PROJECT_KEY, null);
        setCurrentPage(0);
        setConfirmModal((m) => ({ ...m, isOpen: false }));
        addToast('已重置为初始卡片设置', 'success');
      },
    });
  }, [addToast]);

  // Save current card configuration as a new user project
  const handleSaveAsNewProject = useCallback(
    (name: string) => {
      const newProject: CardProject = {
        id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name,
        updatedAt: Date.now(),
        isBuiltIn: false,
        config: { ...config },
      };

      const previousActiveName = activeProject?.name;
      const wasExistingUserProject = Boolean(
        activeProject &&
          !activeProject.id.startsWith('builtin-') &&
          userProjects.some((p) => p.id === activeProject.id)
      );

      // If saving as new project while editing an existing project, restore the original project's initial config
      let updatedUserProjects = [...userProjects];
      if (wasExistingUserProject && activeProject?.savedConfig) {
        const origIdx = updatedUserProjects.findIndex((p) => p.id === activeProject.id);
        if (origIdx !== -1) {
          updatedUserProjects[origIdx] = {
            ...updatedUserProjects[origIdx],
            config: activeProject.savedConfig,
          };
        }
      }

      const next = [newProject, ...updatedUserProjects];
      setUserProjects(next);
      idbSet(PROJECTS_KEY, next);

      const active = {
        id: newProject.id,
        name: newProject.name,
        savedConfig: JSON.parse(JSON.stringify(config)),
      };
      setActiveProject(active);
      idbSet(ACTIVE_PROJECT_KEY, { id: newProject.id, name: newProject.name });

      addToast(
        wasExistingUserProject
          ? `已另存为新项目「${name}」！原项目「${previousActiveName}」保持不变。`
          : `项目「${name}」已保存到本地项目库！`,
        'success'
      );
    },
    [config, userProjects, activeProject, addToast]
  );

  // Overwrite & update current active user project
  const handleUpdateCurrentProject = useCallback(
    (updatedName?: string) => {
      if (!activeProject || activeProject.id.startsWith('builtin-')) return;
      const idx = userProjects.findIndex((p) => p.id === activeProject.id);
      if (idx === -1) return;

      const finalName = updatedName?.trim() || activeProject.name;
      const next = [...userProjects];
      next[idx] = {
        ...next[idx],
        name: finalName,
        config: { ...config },
        updatedAt: Date.now(),
      };

      setUserProjects(next);
      idbSet(PROJECTS_KEY, next);

      const active = {
        id: activeProject.id,
        name: finalName,
        savedConfig: JSON.parse(JSON.stringify(config)),
      };
      setActiveProject(active);
      idbSet(ACTIVE_PROJECT_KEY, { id: activeProject.id, name: finalName });

      addToast(`项目「${finalName}」已更新保存！`, 'success');
    },
    [activeProject, config, userProjects, addToast]
  );

  // Load a project into current workspace
  const handleLoadProject = useCallback(
    (project: CardProject) => {
      setConfig({ ...project.config });
      const active = {
        id: project.id,
        name: project.name,
        savedConfig: JSON.parse(JSON.stringify(project.config)),
      };
      setActiveProject(active);
      idbSet(ACTIVE_PROJECT_KEY, { id: project.id, name: project.name });
      idbSet(CONFIG_KEY, project.config);
      setCurrentPage(0);
      addToast(`已成功载入项目「${project.name}」`, 'success');
    },
    [addToast]
  );

  // Request delete a user-saved project
  const handleRequestDeleteProject = useCallback(
    (project: CardProject) => {
      setConfirmModal({
        isOpen: true,
        title: `删除项目「${project.name}」？`,
        description: '此操作将从本地存储中永久删除该卡片项目，无法恢复。',
        confirmLabel: '确认删除',
        variant: 'danger',
        onConfirm: () => {
          const next = userProjects.filter((p) => p.id !== project.id);
          setUserProjects(next);
          idbSet(PROJECTS_KEY, next);

          if (activeProject?.id === project.id) {
            setActiveProject(null);
            idbSet(ACTIVE_PROJECT_KEY, null);
          }

          setConfirmModal((m) => ({ ...m, isOpen: false }));
          addToast(`已删除项目「${project.name}」`, 'info');
        },
      });
    },
    [userProjects, activeProject, addToast]
  );

  // Export card as PNG (single page or all pages)
  const handleExportPng = useCallback(
    async (allPages = false) => {
      if (isExporting) return;
      setIsExporting(true);
      const originalPage = currentPage;

      try {
        const [{ toBlob }, fontEmbedCSS] = await Promise.all([
          import('html-to-image'),
          exportFonts(),
        ]);

        await document.fonts.ready;

        const count = allPages ? pages.length : 1;
        const baseName = safeFileName(config.articleTitle || config.cardHeading || 'reading-card');

        const exportedList: ExportedCardImage[] = [];

        for (let i = 0; i < count; i++) {
          const targetIndex = allPages ? i : currentPage;
          if (allPages) {
            setCurrentPage(targetIndex);
            // Allow DOM render to finish
            await new Promise((r) => setTimeout(r, 120));
          }

          const cardEl = stageRef.current?.getCardElement();
          if (!cardEl) continue;

          const dimensions = getCardDimensions(config.aspectRatio);
          const blob = await toBlob(cardEl, {
            pixelRatio: 2,
            width: dimensions.width,
            height: dimensions.height,
            fontEmbedCSS,
            style: {
              transform: 'none',
              margin: '0',
              boxShadow: 'none',
            },
          });

          if (blob) {
            const pageSuffix = `P${String(targetIndex + 1).padStart(2, '0')}`;
            const filename = `${baseName}-${pageSuffix}.png`;
            const url = URL.createObjectURL(blob);
            exportedList.push({
              blob,
              url,
              filename,
              pageIndex: targetIndex,
            });
          }
        }

        const isMobile = window.innerWidth < 1024 || 'ontouchstart' in window;

        if (isMobile && exportedList.length > 0) {
          // On mobile: open full-size preview & save to album modal
          setExportedImages(exportedList);
          setIsExportPreviewOpen(true);
        } else {
          // On desktop: trigger direct file download
          exportedList.forEach((item) => {
            downloadBlob(item.blob, item.filename);
          });
          addToast(
            allPages
              ? `已成功导出全部 ${count} 页 ${config.aspectRatio || '3:4'} 阅读卡片！`
              : '卡片图片已成功下载！',
            'success'
          );
        }
      } catch (err) {
        addToast(
          `导出图片失败: ${err instanceof Error ? err.message : '未知错误'}`,
          'error'
        );
      } finally {
        if (allPages) {
          setCurrentPage(originalPage);
        }
        setIsExporting(false);
      }
    },
    [isExporting, currentPage, pages.length, config.articleTitle, config.cardHeading, config.aspectRatio, addToast]
  );

  // Copy card image to clipboard
  const handleCopyImage = useCallback(async () => {
    if (isCopying) return;
    setIsCopying(true);

    try {
      const [{ toBlob }, fontEmbedCSS] = await Promise.all([
        import('html-to-image'),
        exportFonts(),
      ]);

      await document.fonts.ready;
      const cardEl = stageRef.current?.getCardElement();
      if (!cardEl) throw new Error('未找到卡片元素');

      const dimensions = getCardDimensions(config.aspectRatio);
      const blob = await toBlob(cardEl, {
        pixelRatio: 2,
        width: dimensions.width,
        height: dimensions.height,
        fontEmbedCSS,
        style: {
          transform: 'none',
          margin: '0',
          boxShadow: 'none',
        },
      });

      if (!blob) throw new Error('生成图片失败');

      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        addToast('卡片图片已复制到剪贴板，可直接在聊天或文档中粘贴！', 'success');
      } else {
        // Fallback: download instead
        downloadBlob(blob, `${safeFileName(config.articleTitle || 'card')}.png`);
        addToast('当前浏览器不支持直接复制图片，已为您自动下载 PNG', 'info');
      }
    } catch (err) {
      addToast(
        `复制图片失败: ${err instanceof Error ? err.message : '未知错误'}`,
        'error'
      );
    } finally {
      setIsCopying(false);
    }
  }, [isCopying, config.articleTitle, config.aspectRatio, addToast]);

  const isExistingUserProject = Boolean(
    activeProject &&
      !activeProject.id.startsWith('builtin-') &&
      userProjects.some((p) => p.id === activeProject.id)
  );

  return (
    <div className="flex h-screen h-[100dvh] w-screen overflow-hidden bg-[#eef1ee] relative">
      {/* Mobile Drawer Backdrop */}
      {mobileDrawer && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileDrawer(null)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar: Content & Text Studio */}
      <Sidebar
        config={config}
        onChange={handleConfigChange}
        onRequestClearText={handleRequestClearText}
        onRequestReset={handleRequestReset}
        onOpenProjectModal={() => {
          setMobileDrawer(null);
          setIsProjectModalOpen(true);
        }}
        totalPages={pages.length}
        currentPage={currentPage}
        onToast={addToast}
        isOpenOnMobile={mobileDrawer === 'sidebar'}
        onClose={() => setMobileDrawer(null)}
      />

      {/* Middle: Canvas Stage */}
      <Stage
        ref={stageRef}
        config={config}
        pages={pages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onSaveProject={() => setIsSaveModalOpen(true)}
        onNewProject={() => setIsNewProjectModalOpen(true)}
        activeProjectName={activeProject?.name}
      />

      {/* Right Sidebar: Visual & Properties Inspector */}
      <Inspector
        config={config}
        onChange={handleConfigChange}
        onExportPng={(allPages) => {
          setMobileDrawer(null);
          handleExportPng(allPages);
        }}
        onCopyImage={() => {
          setMobileDrawer(null);
          handleCopyImage();
        }}
        onRequestReset={handleRequestReset}
        isExporting={isExporting}
        isCopying={isCopying}
        totalPages={pages.length}
        isOpenOnMobile={mobileDrawer === 'inspector'}
        onClose={() => setMobileDrawer(null)}
      />

      {/* Mobile Bottom Navigation Dock */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-zinc-200/90 z-30 lg:hidden flex items-center justify-around px-2 sm:px-4 shadow-lg pb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          onClick={() => setMobileDrawer(mobileDrawer === 'sidebar' ? null : 'sidebar')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
            mobileDrawer === 'sidebar'
              ? 'text-amber-800 bg-amber-50 font-bold'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px] leading-tight font-medium">正文与头像</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileDrawer(mobileDrawer === 'inspector' ? null : 'inspector')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
            mobileDrawer === 'inspector'
              ? 'text-amber-800 bg-amber-50 font-bold'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-[10px] leading-tight font-medium">视觉与排版</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMobileDrawer(null);
            setIsProjectModalOpen(true);
          }}
          className="flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
        >
          <FolderKanban className="w-4 h-4 text-zinc-500" />
          <span className="text-[10px] leading-tight font-medium">项目与示例</span>
        </button>

        <button
          type="button"
          disabled={isExporting}
          onClick={() => handleExportPng(false)}
          className="flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-lg font-semibold bg-[#252a26] text-white hover:bg-[#343b35] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-[#f4ce45]" />
          <span className="text-[10px] leading-tight font-medium">{isExporting ? '生成中…' : '保存卡片'}</span>
        </button>
      </nav>

      {/* Mobile Card Export Preview & Save to Album Modal */}
      <ExportPreviewModal
        isOpen={isExportPreviewOpen}
        onClose={() => setIsExportPreviewOpen(false)}
        images={exportedImages}
        initialPageIndex={currentPage}
        onToast={addToast}
      />

      {/* New Project Customizer Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onConfirm={handleConfirmNewProject}
      />

      {/* Quick Save Project Modal */}
      <SaveProjectModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSaveAsNew={handleSaveAsNewProject}
        onUpdateCurrent={handleUpdateCurrentProject}
        activeProjectName={activeProject?.name}
        isExistingUserProject={isExistingUserProject}
        defaultName={activeProject?.name || config.articleTitle || config.cardHeading || '我的新卡片项目'}
        onOpenProjectLibrary={() => {
          setIsSaveModalOpen(false);
          setIsProjectModalOpen(true);
        }}
      />

      {/* Project Library & Built-in Samples Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        currentConfig={config}
        userProjects={userProjects}
        onLoadProject={handleLoadProject}
        onSaveProject={handleSaveAsNewProject}
        onRequestDeleteProject={handleRequestDeleteProject}
      />

      {/* Reusable Confirm Modal (Rule 12 compliant) */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((m) => ({ ...m, isOpen: false }))}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
