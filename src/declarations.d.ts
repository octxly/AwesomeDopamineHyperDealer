/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />
declare module '*.css';

interface InputEvent2 {
  type: 'keydown' | 'keyup' | 'mousedown' | 'mouseup' | 'mousemove';
  keycode?: number;
  button?: number;
  x?: number;
  y?: number;
}

interface Window {
  input: {
    onIpm: (cb: (ipm: number) => void) => void;
  };
}