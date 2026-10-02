import { useState, useRef, useEffect, useCallback } from 'react';
import { getCardDimensions, type CardConfig, type CardProject } from './types';
import { INITIAL_CONFIG } from './constants/samples';
import { usePagination } from './utils/pagination';
import { Sidebar } from './components/Sidebar';
import { Stage, type StageHandle } from './components/Stage';
import { Inspector } from './components/Inspector';
import { ProjectModal } from './components/ProjectModal';
import { SaveProjectModal } from './components/SaveProjectModal';
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
        return { ...INITIAL_CONFIG, ...parsed };
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

  const [activeProject, setActiveProject] = useState<{ id: string; name: string } | null>(() => {
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
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isCopying, setIsCopying] = useState<boolean>(false);
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
          setConfig((prev) => ({ ...prev, ...idbConfig }));
        } else {
          const legacyConf = localStorage.getItem(LEGACY_CONFIG_KEY);
          if (legacyConf) {
            try {
              const parsed = JSON.parse(legacyConf);
              if (parsed && typeof parsed === 'object') {
                if (parsed.cardHeading === '奇幻画布 · 英语精读') {
                  parsed.cardHeading = '请输入您的专栏标题';
                }
                if (isMounted) setConfig((prev) => ({ ...prev, ...parsed }));
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

  // Continuous reliable persistence to IndexedDB whenever config or activeProject changes
  useEffect(() => {
    idbSet(CONFIG_KEY, config);

    // If currently editing an existing user project, auto-sync modifications back to the project library!
    if (activeProject && !activeProject.id.startsWith('builtin-')) {
      setUserProjects((prev) => {
        const idx = prev.findIndex((p) => p.id === activeProject.id);
        if (idx !== -1) {
          // Only update if changed
          if (JSON.stringify(prev[idx].config) !== JSON.stringify(config)) {
            const next = [...prev];
            next[idx] = {
              ...next[idx],
              config: { ...config },
              updatedAt: Date.now(),
            };
            idbSet(PROJECTS_KEY, next);
            return next;
          }
        }
        return prev;
      });
    }
  }, [config, activeProject]);

  // Window beforeunload safeguard: flush latest state synchronously
  useEffect(() => {
    const handleUnload = () => {
      idbSet(CONFIG_KEY, config);
      if (activeProject) {
        idbSet(ACTIVE_PROJECT_KEY, activeProject);
      }
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

      const next = [newProject, ...userProjects];
      setUserProjects(next);
      idbSet(PROJECTS_KEY, next);

      const active = { id: newProject.id, name: newProject.name };
      setActiveProject(active);
      idbSet(ACTIVE_PROJECT_KEY, active);

      addToast(`项目「${name}」已保存到本地项目库！`, 'success');
    },
    [config, userProjects, addToast]
  );

  // Overwrite & update current active user project
  const handleUpdateCurrentProject = useCallback(() => {
    if (!activeProject || activeProject.id.startsWith('builtin-')) return;
    const idx = userProjects.findIndex((p) => p.id === activeProject.id);
    if (idx === -1) return;

    const next = [...userProjects];
    next[idx] = {
      ...next[idx],
      config: { ...config },
      updatedAt: Date.now(),
    };

    setUserProjects(next);
    idbSet(PROJECTS_KEY, next);
    addToast(`项目「${activeProject.name}」已更新保存！`, 'success');
  }, [activeProject, config, userProjects, addToast]);

  // Load a project into current workspace
  const handleLoadProject = useCallback(
    (project: CardProject) => {
      setConfig({ ...project.config });
      const active = { id: project.id, name: project.name };
      setActiveProject(active);
      idbSet(ACTIVE_PROJECT_KEY, active);
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
            },
          });

          if (blob) {
            const pageSuffix = `P${String(targetIndex + 1).padStart(2, '0')}`;
            downloadBlob(blob, `${baseName}-${pageSuffix}.png`);
          }
        }

        addToast(
          allPages
            ? `已成功导出全部 ${count} 页 ${config.aspectRatio || '3:4'} 阅读卡片！`
            : '卡片图片已成功下载！',
          'success'
        );
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#eef1ee]">
      {/* Left Sidebar: Content & Text Studio */}
      <Sidebar
        config={config}
        onChange={handleConfigChange}
        onRequestClearText={handleRequestClearText}
        onRequestReset={handleRequestReset}
        onOpenProjectModal={() => setIsProjectModalOpen(true)}
        totalPages={pages.length}
        currentPage={currentPage}
        onToast={addToast}
      />

      {/* Middle: Canvas Stage */}
      <Stage
        ref={stageRef}
        config={config}
        pages={pages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onSaveProject={() => setIsSaveModalOpen(true)}
        activeProjectName={activeProject?.name}
      />

      {/* Right Sidebar: Visual & Properties Inspector (Always open by default) */}
      <Inspector
        config={config}
        onChange={handleConfigChange}
        onExportPng={handleExportPng}
        onCopyImage={handleCopyImage}
        onRequestReset={handleRequestReset}
        isExporting={isExporting}
        isCopying={isCopying}
        totalPages={pages.length}
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
