import React, { useState } from 'react';
import { X, Key, Volume2, Trash2 } from 'lucide-react';
import { kimiAPI } from '../api/kimi';
import { db } from '../db';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState(kimiAPI.getApiKey());
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    kimiAPI.setApiKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearData = async () => {
    if (confirm('确定要清空所有数据吗？此操作不可撤销。')) {
      await db.clearAll();
      alert('数据已清空');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[480px] max-w-[90vw] shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
          <h2 className="text-lg font-semibold text-slate-700">设置</h2>
          <button onClick={onClose} className="p-1 hover:bg-cream-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Key size={14} /> Kimi API Key
            </label>
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 bg-cream-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <p className="text-xs text-slate-400 mt-1">在 <a href="https://platform.moonshot.cn" target="_blank" className="text-orange-500 hover:underline">platform.moonshot.cn</a> 获取 API Key</p>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Volume2 size={14} /> 语音设置
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={voiceEnabled} onChange={e => setVoiceEnabled(e.target.checked)}
                className="rounded border-slate-300 text-orange-500 focus:ring-orange-400" />
              <span className="text-sm text-slate-600">启用语音播报</span>
            </label>
            <p className="text-xs text-slate-400 mt-1">使用浏览器内置 Web Speech API，无需额外配置</p>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Trash2 size={14} /> 数据管理
            </label>
            <button onClick={handleClearData} className="px-3 py-2 bg-red-50 text-red-500 text-sm rounded-lg hover:bg-red-100 transition-colors">
              清空所有数据
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-cream-200">
          {saved && <span className="text-sm text-teal-600">✓ 已保存</span>}
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-cream-100 rounded-lg transition-colors">取消</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">保存</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
