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

  const allProjects: CardProject[] = [...BUILTIN_PROJECTS, ...userProjects];

  const filteredProjects = allProjects.filter((p) => {
    if (filterTab === 'builtin' && !p.isBuiltIn) return false;
    if (filterTab === 'user' && p.isBuiltIn) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.config.cardHeading.toLowerCase().includes(query) ||
      p.config.articleTitle.toLowerCase().includes(query)
    );
  });

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'paper':
        return { bg: 'bg-[#faf6ec]', border: 'border-[#e6deca]', text: 'text-[#8c734b]' };
      case 'minimal':
        return { bg: 'bg-[#ffffff]', border: 'border-zinc-200', text: 'text-zinc-700' };
      case 'dark':
        return { bg: 'bg-[#181a20]', border: 'border-zinc-700', text: 'text-amber-400' };
      case 'matcha':
        return { bg: 'bg-[#f3f6f1]', border: 'border-[#cfdacd]', text: 'text-[#416844]' };
      case 'warm':
        return { bg: 'bg-[#fbf6f0]', border: 'border-[#e7d8c7]', text: 'text-[#c2410c]' };
      default:
        return { bg: 'bg-zinc-50', border: 'border-zinc-200', text: 'text-zinc-600' };
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="h-16 px-6 border-b border-zinc-200 flex items-center justify-between shrink-0 bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shadow-2xs">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                项目库与示例
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700">
                  {allProjects.length} 个项目
                </span>
              </h2>
              <p className="text-xs text-zinc-500">
                内置精选 3 套官方范例 · 支持保存并管理属于您的个性化卡片工程
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isSavingNew && (
              <button
                type="button"
                onClick={handleOpenSaveDrawer}
                className="px-3.5 py-1.5 bg-[#252a26] hover:bg-[#343b35] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Plus className="w-4 h-4 text-[#f4ce45]" />
                <span>保存当前卡片为项目</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors"
              title="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Save Current Card Drawer (Revealed on click) */}
        {isSavingNew && (
          <form
            onSubmit={handleConfirmSave}
            className="p-4 bg-amber-50/80 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3 shrink-0 animate-in slide-in-from-top-2 duration-150"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-bold text-amber-900">保存当前卡片工程</span>
            </div>

            <div className="flex-1 min-w-[280px] max-w-md flex items-center gap-2">
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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSavingNew(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!newProjectName.trim()}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>保存到我的项目</span>
              </button>
            </div>
          </form>
        )}

        {/* Filter and Search Bar */}
        <div className="px-6 py-3 border-b border-zinc-100 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
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
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterTab === 'builtin'
                  ? 'bg-white text-zinc-900 font-bold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              内置范例 (3)
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('user')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterTab === 'user'
                  ? 'bg-white text-zinc-900 font-bold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              我的保存 ({userProjects.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50">
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => {
                const colors = getThemeColor(project.config.theme);
                const wordCount = project.config.articleContent.trim()
                  ? project.config.articleContent.trim().split(/\s+/).length
                  : 0;

                return (
                  <div
                    key={project.id}
                    className="bg-white border border-zinc-200/90 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-amber-400/70"
                  >
                    {/* Visual Card Banner Preview */}
                    <div
                      className={`h-24 p-3.5 border-b flex flex-col justify-between relative ${colors.bg} ${colors.border}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            project.isBuiltIn
                              ? 'bg-amber-100/90 text-amber-900 border border-amber-300/40'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300/40'
                          }`}
                        >
                          {project.isBuiltIn ? '官方内置范例' : '我的卡片项目'}
                        </span>

                        <span className="text-[10px] font-mono text-zinc-400 font-medium">
                          3:4 卡片
                        </span>
                      </div>

                      <div>
                        <p className={`text-xs font-bold truncate ${colors.text}`}>
                          {project.config.cardHeading}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                          {project.config.articleTitle || '（无文章标题）'}
                        </p>
                      </div>
                    </div>

                    {/* Card Content Info */}
                    <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 line-clamp-1 group-hover:text-amber-800 transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1 leading-relaxed font-serif">
                          {project.config.articleContent.slice(0, 100)}...
                        </p>
                      </div>

                      {/* Metadata tags */}
                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {wordCount} 词 · {project.config.fontFamily}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {project.isBuiltIn
                            ? '精选'
                            : new Date(project.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-3.5 py-2.5 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between gap-2">
                      {!project.isBuiltIn && (
                        <button
                          type="button"
                          onClick={() => onRequestDeleteProject(project)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="删除此项目"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onLoadProject(project);
                          onClose();
                        }}
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                          project.isBuiltIn
                            ? 'w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                            : 'flex-1 bg-amber-600/10 hover:bg-amber-600 text-amber-900 hover:text-white'
                        }`}
                      >
                        <span>载入项目</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
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
