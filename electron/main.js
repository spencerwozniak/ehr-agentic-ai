// main.js
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 300,
    height: 100,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    title: '',
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'), // This now works
    }
  });

  win.setMenuBarVisibility(false);
  win.setAutoHideMenuBar(true);

  win.loadURL('http://localhost:3000');

  // Send focus/blur events to renderer
  win.on('focus', () => {
    win.webContents.send('window-focus', true);
  });
  win.on('blur', () => {
    win.webContents.send('window-focus', false);
  });

}

ipcMain.on('set-window-size', (event, width, height) => {
  if (win) {
    const bounds = win.getBounds();
    // Calculate new Y position so the BOTTOM stays fixed
    const newY = bounds.y + (bounds.height - Math.round(height));
    win.setBounds({
      x: bounds.x,
      y: newY,
      width: Math.round(width),
      height: Math.round(height)
    }, true); // animate = true for smoothness
  }
});


app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
