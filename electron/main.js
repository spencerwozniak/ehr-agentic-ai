// electron/main.ts
import { app, BrowserWindow } from 'electron';
import path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 400,
    frame: false,          // no system chrome
    transparent: true,     // for custom shapes/translucency
    resizable: true,       // optional
    alwaysOnTop: true,     // optional
    webPreferences: {
      contextIsolation: true,
    }
  });
  

  // For development:
  win.loadURL('http://localhost:3000');

  // Optional: Open DevTools
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
