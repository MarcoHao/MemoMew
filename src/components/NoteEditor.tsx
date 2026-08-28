import React, { useState, useEffect, useCallback } from 'react';
import { Save, Wand2, Mic } from 'lucide-react';
import { Note } from '../db';
import { speechService } from '../api/speech';

interface NoteEditorProps {
  note?: Note;
  onSave: (title: string, content: string) => void;
  onUpdate: (id: number, title: string, content: string) => void;
  isNew: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onUpdate, isNew }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else if (isNew) {
      setTitle('');
      setContent('');
    }
  }, [note?.id, isNew]);

  const handleSave = useCallback(() => {
    if (!title.trim() && !content.trim()) return;
    const finalTitle = title.trim() || content.trim().slice(0, 20) || '未命名笔记';
    if (isNew) {
      onSave(finalTitle, content);
      setTitle('');
      setContent('');
    } else if (note) {
      onUpdate(note.id, finalTitle, content);
    }
  }, [title, content, isNew, note, onSave, onUpdate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
      setInterimText('');
    } else {
      const started = speechService.startListening(
        (text, isFinal) => {
          if (isFinal) {
            setContent(prev => prev + (prev ? ' ' : '') + text);
            setInterimText('');
          } else {
            setInterimText(text);
          }
        },
        (error) => {
          console.error(error);
          setIsRecording(false);
        }
      );
      if (started) {
        setIsRecording(true);
      }
    }
  };

  const handleBlur = () => {
    if (!isNew && note && (title !== note.title || content !== note.content)) {
      handleSave();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-cream-200">
        <input
          type="text"
          placeholder="笔记标题..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="flex-1 text-lg font-semibold bg-transparent outline-none placeholder-slate-300 text-slate-700"
        />
        <button
          onClick={toggleRecording}
          className={`p-2 rounded-lg transition-colors ${
            isRecording
              ? 'bg-red-100 text-red-500 animate-pulse'
              : 'bg-cream-100 text-slate-500 hover:bg-cream-200'
          }`}
          title="语音输入"
        >
          <Mic size={16} />
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm transition-colors"
        >
          <Save size={14} />
          {isNew ? '保存' : '更新'}
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="开始记录你的想法..."
          className="flex-1 w-full p-4 resize-none outline-none bg-transparent text-slate-700 leading-relaxed"
          style={{ fontFamily: 'inherit' }}
        />
        {interimText && (
          <div className="px-4 py-2 bg-cream-100 text-slate-400 text-sm italic border-t border-cream-200">
            {interimText}...
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-cream-200 text-xs text-slate-400 flex justify-between">
        <span>{content.length} 字符</span>
        <span>{isNew ? '新笔记' : `更新于 ${note?.updated_at ? new Date(note.updated_at).toLocaleString('zh-CN') : ''}`}</span>
      </div>
    </div>
  );
};

export default NoteEditor;
