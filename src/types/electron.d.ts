interface ElectronAPI {
  dbInit: () => Promise<void>;
  dbClose: () => Promise<void>;
  readClipboard: () => Promise<string>;
  getVersion: () => Promise<string>;
  onNewNote: (callback: () => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
