import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  FolderKanban,
  Search,
  Check,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import type { CardConfig, CardProject } from '../types';
import { BUILTIN_PROJECTS } from '../constants/samples';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: CardConfig;
  userProjects: CardProject[];
  onLoadProject: (project: CardProject) => void;
  onSaveProject: (name: string) => void;
  onRequestDeleteProject: (project: CardProject) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  userProjects,
  onLoadProject,
  onSaveProject,
  onRequestDeleteProject,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'builtin' | 'user'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  if (!isOpen) return null;

  const handleOpenSaveDrawer = () => {
    const defaultName =
      currentConfig.articleTitle || currentConfig.cardHeading || '我的新卡片项目';
    setNewProjectName(defaultName);
    setIsSavingNew(true);
  };

  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newProjectName.trim();
    if (!trimmed) return;
    onSaveProject(trimmed);
    setIsSavingNew(false);
    setFilterTab('user');
  };

  // 用户创建的项目优先排在最前（按最近更新时间排序），随后展示官方内置范例
  const sortedUserProjects = [...userProjects].sort(
    (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
  );
  const allProjects: CardProject[] = [...sortedUserProjects, ...BUILTIN_PROJECTS];

  const filteredProjects = allProjects.filter((p) => {
    if (filterTab === 'builtin' && !p.isBuiltIn) return false;
    if (filterTab === 'user' && p.isBuiltIn) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.config.cardHeading?.toLowerCase().includes(query) ||
      p.config.articleTitle?.toLowerCase().includes(query) ||
      p.config.articleContent?.toLowerCase().includes(query)
    );
  });

function cleanMarkdownSnippet(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/___([^_]+)___/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/(^|[^\w])_([^_]+)_(?=[^\w]|$)/g, '$1$2')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/==([^=]+)==/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[#>-]+\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface ThemeCardStyle {
  label: string;
  cardBg: string;
  cardBorder: string;
  titleColor: string;
  subtextColor: string;
  metaColor: string;
  badgeBg: string;
  dividerColor: string;
}

const THEME_STYLES: Record<string, ThemeCardStyle> = {
  paper: {
    label: '温润纸质',
    cardBg: 'bg-[#faf6ec]',
    cardBorder: 'border-[#e8dfce]',
    titleColor: 'text-[#2a241e]',
    subtextColor: 'text-[#635545]',
    metaColor: 'text-[#8e7e6a]',
    badgeBg: 'bg-[#eee5d3] text-[#6d5b3e]',
    dividerColor: 'border-[#ede3d0]',
  },
  minimal: {
    label: '冷白极简',
    cardBg: 'bg-white',
    cardBorder: 'border-zinc-200/90',
    titleColor: 'text-zinc-900',
    subtextColor: 'text-zinc-600',
    metaColor: 'text-zinc-400',
    badgeBg: 'bg-zinc-100 text-zinc-600',
    dividerColor: 'border-zinc-100',
  },
  dark: {
    label: '曜黑暗夜',
    cardBg: 'bg-[#181a20]',
    cardBorder: 'border-zinc-700/80',
    titleColor: 'text-zinc-100',
    subtextColor: 'text-zinc-400',
    metaColor: 'text-zinc-500',
    badgeBg: 'bg-zinc-800 text-amber-400',
    dividerColor: 'border-zinc-800',
  },
  matcha: {
    label: '清爽抹茶',
    cardBg: 'bg-[#f3f6f1]',
    cardBorder: 'border-[#d0dfcd]',
    titleColor: 'text-[#1c291d]',
    subtextColor: 'text-[#485c49]',
    metaColor: 'text-[#6c856e]',
    badgeBg: 'bg-[#e2ebe0] text-[#3d5a3f]',
    dividerColor: 'border-[#e0ebe0]',
  },
  warm: {
    label: '暖杏微光',
    cardBg: 'bg-[#fcf7f1]',
    cardBorder: 'border-[#ecdcc8]',
    titleColor: 'text-[#2e2118]',
    subtextColor: 'text-[#6b5546]',
    metaColor: 'text-[#967963]',
    badgeBg: 'bg-[#faebd9] text-[#9a4d1a]',
    dividerColor: 'border-[#eee0ce]',
  },
};

const getThemeCardStyle = (theme?: string): ThemeCardStyle => {
  return THEME_STYLES[theme || 'paper'] || THEME_STYLES.paper;
};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-zinc-200 flex items-center justify-between shrink-0 bg-zinc-50/80">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shadow-2xs shrink-0">
              <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight shrink-0">
                  项目库与示例
                </h2>
                <span className="text-[10px] sm:text-xs font-mono font-medium px-1.5 sm:px-2 py-0.5 rounded-full bg-zinc-200/80 text-zinc-700 shrink-0">
                  {allProjects.length} 个项目
                </span>
              </div>
              <p className="text-xs text-zinc-500 hidden sm:block mt-0.5 truncate">
                内置精选 3 套官方范例 · 支持保存并管理属于您的个性化卡片项目
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!isSavingNew && (
              <button
                type="button"
                onClick={handleOpenSaveDrawer}
                className="px-2.5 sm:px-3.5 py-1.5 bg-[#252a26] hover:bg-[#343b35] text-white text-xs font-semibold rounded-lg flex items-center gap-1 sm:gap-1.5 transition-colors shadow-2xs cursor-pointer shrink-0 whitespace-nowrap"
                title="保存当前卡片为新项目"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f4ce45]" />
                <span className="hidden sm:inline">保存当前卡片为项目</span>
                <span className="sm:hidden">保存当前</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer shrink-0"
              title="关闭"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Save Current Card Drawer (Revealed on click) */}
        {isSavingNew && (
          <form
            onSubmit={handleConfirmSave}
            className="p-3 sm:p-4 bg-amber-50/80 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0 animate-in slide-in-from-top-2 duration-150"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700 shrink-0" />
              <span className="text-xs font-bold text-amber-900 whitespace-nowrap">保存当前卡片项目</span>
            </div>

            <div className="flex-1 w-full sm:max-w-md flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="请输入项目名称..."
                maxLength={50}
                className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsSavingNew(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!newProjectName.trim()}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
              >
                <Check className="w-3.5 h-3.5" />
                <span>保存到我的项目</span>
              </button>
            </div>
          </form>
        )}

        {/* Filter and Search Bar */}
        <div className="px-3.5 py-2.5 sm:px-6 sm:py-3 border-b border-zinc-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          {/* Tabs - Equal width on mobile */}
          <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`flex-1 sm:flex-initial text-center px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filterTab === 'all'
                  ? 'bg-white text-zinc-900 font-bold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              全部 ({allProjects.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('builtin')}
              className={`flex-1 sm:flex-initial text-center px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filterTab === 'builtin'
                  ? 'bg-white text-zinc-900 font-bold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <span className="sm:hidden">范例 (3)</span>
              <span className="hidden sm:inline">内置范例 (3)</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('user')}
              className={`flex-1 sm:flex-initial text-center px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filterTab === 'user'
                  ? 'bg-white text-zinc-900 font-bold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <span className="sm:hidden">我的 ({userProjects.length})</span>
              <span className="hidden sm:inline">我的保存 ({userProjects.length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-60 shrink-0">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索项目标题或内容..."
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 bg-zinc-50/50">
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => {
                const theme = getThemeCardStyle(project.config.theme);
                const wordCount = project.config.articleContent.trim()
                  ? project.config.articleContent.trim().split(/\s+/).length
                  : 0;
                const hasArticleTitle = Boolean(project.config.articleTitle?.trim());
                const primaryTitle = hasArticleTitle
                  ? project.config.articleTitle.trim()
                  : project.name || '无标题卡片';
                const columnName = project.config.cardHeading?.trim();
                const volume = project.config.volume?.trim();
                const cleanSnippet = cleanMarkdownSnippet(project.config.articleContent).slice(0, 105);

                return (
                  <div
                    key={project.id}
                    className={`rounded-2xl border ${theme.cardBorder} ${theme.cardBg} p-4 sm:p-4.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-0.5 relative overflow-hidden`}
                  >
                    {/* Top Eyebrow row: Column & Volume + Theme Pill */}
                    <div
                      className={`flex items-center justify-between gap-2 shrink-0 pb-3 border-b ${theme.dividerColor}`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            project.isBuiltIn
                              ? 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
                          }`}
                        >
                          {project.isBuiltIn ? '官方范例' : '我的项目'}
                        </span>

                        {columnName && (
                          <span
                            className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 truncate"
                            title={`专栏: ${columnName}${volume ? ` · ${volume}` : ''}`}
                          >
                            {columnName}
                            {volume ? ` · ${volume}` : ''}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${theme.badgeBg}`}>
                          {theme.label}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {project.config.aspectRatio || '3:4'}
                        </span>
                      </div>
                    </div>

                    {/* Main Content Area: Hero Article Title + Clean Excerpt */}
                    <div className="py-3.5 flex-1 flex flex-col justify-start">
                      {/* Article Title: Prominent, bold, high contrast */}
                      <h3
                        className={`text-[15px] sm:text-base font-bold tracking-tight leading-snug line-clamp-2 ${theme.titleColor} group-hover:text-amber-700 transition-colors`}
                        title={primaryTitle}
                      >
                        {primaryTitle}
                      </h3>

                      {/* Clean Article Excerpt */}
                      {cleanSnippet ? (
                        <p
                          className={`text-xs ${theme.subtextColor} leading-relaxed font-serif line-clamp-2 mt-2 opacity-90`}
                        >
                          “{cleanSnippet}...”
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-400 italic mt-2">（正文暂无内容）</p>
                      )}

                      {/* Project Name (shown only if it differs from the article title, to avoid repetition) */}
                      {hasArticleTitle && project.name && project.name !== primaryTitle && (
                        <div className={`mt-3 flex items-center gap-1.5 text-[10.5px] ${theme.metaColor} truncate`}>
                          <FolderKanban className="w-3 h-3 shrink-0 opacity-70" />
                          <span className="truncate">项目名: {project.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Info & Actions */}
                    <div className={`pt-3 border-t ${theme.dividerColor} space-y-2.5 shrink-0`}>
                      {/* Stats */}
                      <div className={`flex items-center justify-between text-[10.5px] ${theme.metaColor}`}>
                        <span className="flex items-center gap-1 font-medium">
                          <Layers className="w-3 h-3 opacity-70" />
                          {wordCount} 词 · {project.config.fontFamily || 'literata'}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 opacity-70" />
                          {project.isBuiltIn
                            ? '精选'
                            : new Date(project.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-0.5">
                        {!project.isBuiltIn && (
                          <button
                            type="button"
                            onClick={() => onRequestDeleteProject(project)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="删除此项目"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            onLoadProject(project);
                            onClose();
                          }}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                            project.isBuiltIn
                              ? 'bg-[#252a26] hover:bg-[#343b35] text-white'
                              : 'bg-amber-600 hover:bg-amber-700 text-white'
                          }`}
                        >
                          <span>载入项目</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#f4ce45]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white border border-dashed border-zinc-300 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mb-3">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-zinc-800">未找到匹配的项目</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                {filterTab === 'user'
                  ? '您还没有保存过自定义项目。点击右上角【保存当前卡片为项目】，随时存留您的排版作品。'
                  : '尝试调整搜索关键词或选择不同筛选标签。'}
              </p>
              {filterTab === 'user' && (
                <button
                  type="button"
                  onClick={handleOpenSaveDrawer}
                  className="mt-4 px-3.5 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>立即保存当前卡片</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
