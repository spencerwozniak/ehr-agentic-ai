// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setWindowSize: (width, height) => ipcRenderer.send('set-window-size', width, height),

  // New: Listen for focus changes
  onWindowFocus: (callback) => {
    // Remove previous listeners for safety in HMR/dev
    ipcRenderer.removeAllListeners('window-focus');
    ipcRenderer.on('window-focus', (_event, isFocused) => {
      callback(isFocused);
    });
  }
});
