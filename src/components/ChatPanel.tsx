import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Bot, User, Sparkles } from 'lucide-react';
import { Note } from '../db';
import { kimiAPI } from '../api/kimi';
import { speechService } from '../api/speech';

interface ChatPanelProps {
  notes: Note[];
  onPetSpeak: (text: string) => void;
  onPetListen: (listening: boolean) => void;
}

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  noteRefs?: number[];
}

const ChatPanel: React.FC<ChatPanelProps> = ({ notes, onPetSpeak, onPetListen }) => {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: '你好呀！我是 MemoMew，你的AI知识管家。有什么我可以帮你的吗？可以问我关于你笔记里的任何问题哦~' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildContext = (): string => {
    if (notes.length === 0) return '';
    return notes
      .slice(0, 10)
      .map(n => `笔记《${n.title}》：${n.summary || n.content.slice(0, 200)}`)
      .join('\n\n');
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const context = buildContext();
      const response = await kimiAPI.askWithContext(userMsg, context);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      
      const firstSentence = response.split(/[。！？.!?]/)[0];
      if (firstSentence) {
        onPetSpeak(firstSentence);
      }
    } catch (error: any) {
      const errorMsg = error.message?.includes('API Key') 
        ? '请先设置 Kimi API Key 哦~'
        : '抱歉，我暂时有点卡壳了，请稍后再试。';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
      onPetListen(false);
    } else {
      const started = speechService.startListening(
        (text, isFinal) => {
          if (isFinal) {
            setInput(prev => prev + text);
            setIsRecording(false);
            onPetListen(false);
          }
        },
        () => {
          setIsRecording(false);
          onPetListen(false);
        }
      );
      if (started) {
        setIsRecording(true);
        onPetListen(true);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-80 bg-white border-l border-cream-200 flex flex-col">
      <div className="px-4 py-3 border-b border-cream-200 flex items-center gap-2">
        <Bot size={18} className="text-orange-500" />
        <span className="font-semibold text-slate-700">AI 助手</span>
        <Sparkles size={14} className="text-orange-400" />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-teal-100 text-teal-600'
            }`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' ? 'bg-orange-500 text-white rounded-tr-sm' : 'bg-cream-100 text-slate-700 rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center">
              <Bot size={14} className="text-teal-600" />
            </div>
            <div className="px-3 py-2 bg-cream-100 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-cream-200">
        <div className="flex gap-2">
          <button onClick={handleVoiceInput} className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
            isRecording ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-cream-100 text-slate-500 hover:bg-cream-200'
          }`}>
            <Mic size={16} />
          </button>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={isRecording ? '正在听你说...' : '问我关于笔记的问题...'}
            className="flex-1 px-3 py-2 bg-cream-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button onClick={handleSend} disabled={!input.trim() || isLoading}
            className="p-2 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white rounded-lg transition-colors flex-shrink-0">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
