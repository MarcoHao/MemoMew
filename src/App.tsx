import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import ChatPanel from './components/ChatPanel';
import PetAvatar from './components/PetAvatar';
import GraphView from './components/GraphView';
import SettingsModal from './components/SettingsModal';
import { db, Note } from './db';
import { kimiAPI } from './api/kimi';
import { speechService } from './api/speech';

type ViewMode = 'editor' | 'graph';
type PetState = 'idle' | 'listen' | 'think' | 'speak' | 'happy';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [petState, setPetState] = useState<PetState>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const loaded = await db.getNotes();
    setNotes(loaded);
  };

  const activeNote = notes.find(n => n.id === activeNoteId);

  const handleCreateNote = useCallback(async (title: string, content: string) => {
    setIsProcessing(true);
    setPetState('think');

    try {
      // AI 摘要和标签
      const { summary, tags } = await kimiAPI.summarizeNote(content);
      
      // 保存笔记
      const note = await db.createNote(title, content, summary, tags);
      
      // AI 抽取实体和关系
      try {
        const { entities, relations } = await kimiAPI.extractEntities(content);
        
        for (const entity of entities) {
          await db.createEntity(entity.name, entity.type, entity.description, [note.id]);
        }
        
        for (const relation of relations) {
          await db.createRelation(relation.source, relation.target, relation.type, [note.id]);
        }
      } catch (e) {
        console.warn('实体抽取失败:', e);
      }

      await loadNotes();
      setActiveNoteId(note.id);
      setPetState('happy');
      setTimeout(() => setPetState('idle'), 2000);
    } catch (error: any) {
      // 如果API失败，仍然保存笔记
      const note = await db.createNote(title, content);
      await loadNotes();
      setActiveNoteId(note.id);
      setPetState('idle');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleUpdateNote = useCallback(async (id: number, title: string, content: string) => {
    await db.updateNote(id, { title, content });
    await loadNotes();
  }, []);

  const handleDeleteNote = useCallback(async (id: number) => {
    await db.deleteNote(id);
    if (activeNoteId === id) setActiveNoteId(null);
    await loadNotes();
  }, [activeNoteId]);

  const handleNewNoteShortcut = useCallback(() => {
    setActiveNoteId(null);
    setViewMode('editor');
  }, []);

  // Pet feedback for chat
  const handlePetSpeak = useCallback((text: string) => {
    setPetState('speak');
    speechService.speak(text, () => setPetState('idle'));
  }, []);

  const handlePetListen = useCallback((listening: boolean) => {
    setPetState(listening ? 'listen' : 'idle');
  }, []);

  return (
    <div className="flex h-screen w-screen bg-cream-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={setActiveNoteId}
        onCreateNote={handleNewNoteShortcut}
        onDeleteNote={handleDeleteNote}
        onToggleGraph={() => setViewMode(viewMode === 'graph' ? 'editor' : 'graph')}
        onOpenSettings={() => setShowSettings(true)}
        viewMode={viewMode}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar with Pet */}
        <div className="h-16 border-b border-cream-200 flex items-center px-4 gap-4 bg-white/50">
          <PetAvatar state={petState} size="md" />
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-700">
              {viewMode === 'graph' ? '知识图谱' : (activeNote?.title || 'MemoMew · 新建笔记')}
            </h1>
            <p className="text-xs text-slate-400">
              {isProcessing ? '正在思考...' : '按 Cmd/Ctrl+Shift+O 快速唤起'}
            </p>
          </div>
          {activeNote?.tags && (
            <div className="flex gap-1 flex-wrap">
              {activeNote.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-teal-100 text-teal-600 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex min-h-0">
          {viewMode === 'graph' ? (
            <GraphView />
          ) : (
            <>
              {/* Editor */}
              <div className="flex-1 min-w-0">
                <NoteEditor
                  note={activeNote}
                  onSave={handleCreateNote}
                  onUpdate={handleUpdateNote}
                  isNew={!activeNoteId}
                />
              </div>
              {/* Chat Panel */}
              <ChatPanel
                notes={notes}
                onPetSpeak={handlePetSpeak}
                onPetListen={handlePetListen}
              />
            </>
          )}
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App;
