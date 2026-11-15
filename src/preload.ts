// oxlint-disable eslint-plugin-unicorn/no-empty-file
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// contextBridge: safely exposes things from the preload to the renderer.
// ipcRenderer: the renderer-side end of the main <-> renderer message channel.
import { contextBridge, ipcRenderer } from 'electron';

// Connect cb to main's inputs
contextBridge.exposeInMainWorld('input', {
  onIpm: (cb: (ipm: number) => void) =>
    ipcRenderer.on('ipm', (_evt, ipm) => cb(ipm)),
});

contextBridge.exposeInMainWorld("api", {
    getVideos: () => ipcRenderer.invoke("get-videos")
})
