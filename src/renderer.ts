/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 */

import './index.css';
import { setItemCount } from './spawner'; // set from to the file you're making :D

const IPM_PER_ITEM = 100; // placeholder, tune while testing
const MAX_ITEMS = 100; // safety cap

let current = 0;

window.input.onIpm((ipm) => {
  console.log(ipm); // log

  const target = Math.min(Math.floor(ipm / IPM_PER_ITEM), MAX_ITEMS);
  if (target !== current) {
    current = target;
    setItemCount(target); // only called when the number changes
  }
});

console.log(
  '👋 This message is being logged by the renderer process, included via Vite',
);
