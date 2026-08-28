import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  // Database
  dbInit: () => Promise<void>;
  dbClose: () => Promise<void>;
  // Clipboard
  readClipboard: () => Promise<string>;
  // App
  getVersion: () => Promise<string>;
  // Events
  onNewNote: (callback: () => void) => void;
}

const api: ElectronAPI = {
  dbInit: () => ipcRenderer.invoke('db:init'),
  dbClose: () => ipcRenderer.invoke('db:close'),
  readClipboard: () => ipcRenderer.invoke('clipboard:read'),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  onNewNote: (callback: () => void) => {
    ipcRenderer.on('new-note', callback);
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
