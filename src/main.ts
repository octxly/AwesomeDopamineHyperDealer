import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { uIOhook } from 'uiohook-napi';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  const WINDOW_MS = 10_000; // count the last 10s
  const hits: number[] = []; // timestamps of inputs

  uIOhook.on('keydown', () => hits.push(Date.now()));
  uIOhook.on('mousedown', () => hits.push(Date.now()));

  setInterval(() => {
    const now = Date.now();
    while (hits.length && now - hits[0] > WINDOW_MS) hits.shift(); // drop old
    const ipm = hits.length * 6; // 10 s * 6 per minute

    // Send to every open window
    for (const w of BrowserWindow.getAllWindows()) {
      w.webContents.send('ipm', ipm);
    }
  }, 1000);
  
  uIOhook.start(); // begin listening
});

app.on('will-quit', () => uIOhook.stop()); // stop OS hook before exit

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.