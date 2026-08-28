import React from 'react';
import { Plus, Trash2, Search, GitGraph, Settings, FileText } from 'lucide-react';
import { Note } from '../db';

interface SidebarProps {
  notes: Note[];
  activeNoteId: number | null;
  onSelectNote: (id: number) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: number) => void;
  onToggleGraph: () => void;
  onOpenSettings: () => void;
  viewMode: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onToggleGraph,
  onOpenSettings,
  viewMode,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredNotes = searchQuery
    ? notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : notes;

  return (
    <div className="w-64 bg-white border-r border-cream-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-cream-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-bold">M</span>
          </div>
          <span className="font-bold text-slate-700">MemoMew</span>
        </div>
        <button
          onClick={onCreateNote}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <Plus size={16} />
          新建笔记
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索笔记..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-cream-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            {searchQuery ? '未找到匹配的笔记' : '还没有笔记，新建一个吧！'}
          </div>
        ) : (
          filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`group relative p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                activeNoteId === note.id
                  ? 'bg-orange-100 border border-orange-200'
                  : 'hover:bg-cream-100 border border-transparent'
              }`}
            >
              <div className="flex items-start justify-between">
                <h3 className={`font-medium text-sm truncate pr-6 ${
                  activeNoteId === note.id ? 'text-orange-700' : 'text-slate-700'
                }`}>
                  {note.title || '未命名笔记'}
                </h3>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteNote(note.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                >
                  <Trash2 size={12} className="text-red-400" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {note.summary || note.content.slice(0, 60) || '暂无内容'}
              </p>
              {note.tags && note.tags.length > 0 && (
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {note.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-cream-200 text-slate-500 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-cream-200 flex gap-2">
        <button
          onClick={onToggleGraph}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm transition-colors ${
            viewMode === 'graph'
              ? 'bg-teal-100 text-teal-600'
              : 'bg-cream-100 text-slate-500 hover:bg-cream-200'
          }`}
        >
          <GitGraph size={14} />
          知识图谱
        </button>
        <button
          onClick={onOpenSettings}
          className="p-2 bg-cream-100 text-slate-500 hover:bg-cream-200 rounded-lg transition-colors"
        >
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
