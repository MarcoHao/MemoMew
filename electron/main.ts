import { app, BrowserWindow, ipcMain, clipboard, globalShortcut, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { initDatabase, closeDatabase } from './db';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray(): void {
  // Use a simple icon - in production this would be a real icon
  const icon = nativeImage.createFromNamedImage('NSActionTemplate', [16, 16]);
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '打开 MemoMew', click: () => mainWindow?.show() },
    { label: '新建笔记', click: () => {
      mainWindow?.show();
      mainWindow?.webContents.send('new-note');
    }},
    { type: 'separator' },
    { label: '退出', click: () => {
      app.quit();
    }},
  ]);
  
  tray.setToolTip('MemoMew - 你的AI知识管家');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
    }
  });
}

// IPC handlers
ipcMain.handle('db:init', () => initDatabase());
ipcMain.handle('db:close', () => closeDatabase());

// Clipboard
ipcMain.handle('clipboard:read', () => clipboard.readText());

// App info
ipcMain.handle('app:getVersion', () => app.getVersion());

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Global shortcut: Cmd/Ctrl + Shift + O to show window
  globalShortcut.register('CommandOrControl+Shift+O', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  closeDatabase();
  globalShortcut.unregisterAll();
});
