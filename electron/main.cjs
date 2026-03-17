/**
 * Electron main process for Olympiad Mock Exam desktop app.
 * Uses CommonJS for compatibility with Electron runtime.
 */

const path = require('path');
const Store = require('electron-store');

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { registerQuestionLibraryHandlers } = require('./questionLibrary.cjs');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow = null;

const store = new Store({
  name: 'olympiad-exam',
  defaults: {
    olympiad_completed_tests: [],
    olympiad_best_scores: {},
    olympiad_in_progress: null,
    olympiad_dark_mode: null,
    olympiad_settings: { shuffleQuestions: false, shuffleOptions: false },
  },
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Olympiad Mock Exam - Grade 3',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.webContents.once('did-fail-load', (_, code) => {
      if (code === -2 || code === -3) {
        const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
        const fs = require('fs');
        if (fs.existsSync(indexPath)) {
          mainWindow.loadFile(indexPath);
        }
      }
    });
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerQuestionLibraryHandlers(ipcMain, app, dialog);
  createWindow();

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

ipcMain.handle('store-get', (_, key) => {
  return store.get(key);
});

ipcMain.handle('store-set', (_, key, value) => {
  store.set(key, value);
});

ipcMain.handle('store-delete', (_, key) => {
  store.delete(key);
});
