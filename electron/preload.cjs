/**
 * Electron preload script.
 * Exposes a minimal, secure API for persistence via contextBridge.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronStore', {
  get: (key) => ipcRenderer.invoke('store-get', key),
  set: (key, value) => ipcRenderer.invoke('store-set', key, value),
  delete: (key) => ipcRenderer.invoke('store-delete', key),
});

contextBridge.exposeInMainWorld('questionLibrary', {
  getPath: () => ipcRenderer.invoke('questionLibrary:getPath'),
  loadLibrary: () => ipcRenderer.invoke('questionLibrary:loadLibrary'),
  reloadLibrary: () => ipcRenderer.invoke('questionLibrary:reloadLibrary'),
  importPack: (opts) => ipcRenderer.invoke('questionLibrary:importPack', opts),
  deletePack: (opts) => ipcRenderer.invoke('questionLibrary:deletePack', opts),
  togglePackEnabled: (opts) => ipcRenderer.invoke('questionLibrary:togglePackEnabled', opts),
  getPackContent: (opts) => ipcRenderer.invoke('questionLibrary:getPackContent', opts),
  loadPackData: (opts) => ipcRenderer.invoke('questionLibrary:loadPackData', opts),
  showOpenDialog: (opts) => ipcRenderer.invoke('questionLibrary:showOpenDialog', opts),
  readFile: (path) => ipcRenderer.invoke('questionLibrary:readFile', path),
});
