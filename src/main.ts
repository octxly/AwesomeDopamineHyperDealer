import { app, BrowserWindow, ipcMain, protocol, net } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { uIOhook } from 'uiohook-napi';

import {screen} from "electron";
import * as fs from "node:fs";
import {pathToFileURL} from "url";
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: "media",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true
    }
  }
])

const createWindow = () => {
  // const {width, height} = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      // nodeIntegration: true,
      // contextIsolation: false,
      // webSecurity: false
    },
    focusable: false,
    resizable: false,
    fullscreen: true,
  });

  mainWindow.setBounds(screen.getPrimaryDisplay().bounds);

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setIgnoreMouseEvents(true, {forward: true});

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  mainWindow.webContents.on("console-message", ev => {
    console.log("[renderer]", ev.message);
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
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

ipcMain.handle("get-videos", () => {
  const videoDir = path.join(app.getAppPath(), "video");
  const files = fs.readdirSync(videoDir);

  return files.map(file => path.join(videoDir, file));
})

app.whenReady().then(() => {
  protocol.handle("media", (request) => {
      const filename = decodeURIComponent(new URL(request.url).pathname);

      console.log(pathToFileURL(filename).href)
      return net.fetch(pathToFileURL(filename).href);
  })
})
