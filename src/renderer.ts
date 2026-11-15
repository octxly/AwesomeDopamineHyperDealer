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

const IPM_PER_ITEM = 100; // placeholder, tune while testing
const MAX_ITEMS = 10; // safety cap

let current = 0;

const container = document.getElementById("container");

const randomRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

// @ts-ignore
const videos: string[] = await window.api.getVideos();

const openVideos: HTMLVideoElement[] = [];

const spawn = () => {
    const video = document.createElement("video");
    video.className = "absolute";
    video.style.width = `${randomRange(100, 500)}px`;
    video.controls = false;
    video.autoplay = true;
    video.loop = true;
    video.src = `media://${encodeURIComponent(videos[randomRange(0, videos.length - 1)])}`;

    openVideos.push(video);

    switch (randomRange(0, 3)) {
        case 0: //top
            video.style.top = "0";
            video.style.left = randomRange(0, 85) + "%";
            break;
        case 1: //left
            video.style.left = "0";
            video.style.top = randomRange(0, 85) + "%";
            break;
        case 2: //bottom
            video.style.bottom = "0";
            video.style.left = randomRange(0, 85) + "%";
            break;
        case 3: //right
            video.style.right = "0";
            video.style.top = randomRange(0, 85) + "%";
            break;
    }

    container?.appendChild(video);
}

window.input.onIpm((ipm) => {
    const target = Math.min(Math.floor(ipm / IPM_PER_ITEM), MAX_ITEMS);
    if (target !== current) {
        current = target;

        if (openVideos.length < current) {
            for (let i = 0; i < current - openVideos.length; i++) {
                spawn();
            }
        } else {
            for (let i = 0; i < openVideos.length - current; i++) {
                let vid = openVideos.pop();
                if (vid) {
                    container?.removeChild(vid);
                }
            }
        }
    }
});