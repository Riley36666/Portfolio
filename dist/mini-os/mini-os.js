"use strict";
const icons = document.querySelectorAll('.icon');
icons.forEach(icon => {
    icon.addEventListener('click', () => {
        icons.forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');
    });
    icon.addEventListener('dblclick', () => {
        const appName = icon.dataset.app;
        launchApp(appName);
    });
});
function launchApp(appName) {
    if (appName === 'notes') {
        launchNotesApp();
    }
    else if (appName === 'system-info') {
        launchSystemInfoApp();
    }
}
function launchNotesApp() {
    const app = document.getElementById('notes-app');
    const test = "Notes app";
    app.classList.remove('hidden');
    console.log("Notes app openned");
    focusApp(app, test);
}
function launchSystemInfoApp() {
    const test = "Info App";
    const app = document.getElementById('system-info-app');
    app.classList.remove('hidden');
    document.getElementById('os-info').innerText = `
    OS Name: Mini OS
    Version: 1.0.0
    Uptime: ${Math.floor(performance.now() / 1000)} seconds
    User Agent: ${navigator.userAgent}
  `;
    focusApp(app, test);
}
function closeApp(id) {
    document.getElementById(id).classList.add('hidden');
}
function focusApp(app, test) {
    console.log(`App openned:` + test);
    document.querySelectorAll('.app-window').forEach(win => {
        win.style.zIndex = 0;
    });
    app.style.zIndex = 10;
}
let offsetX, offsetY, currentDrag;
document.querySelectorAll('.app-header').forEach(header => {
    header.addEventListener('mousedown', (e) => {
        currentDrag = header.parentElement;
        offsetX = e.clientX - currentDrag.offsetLeft;
        offsetY = e.clientY - currentDrag.offsetTop;
        focusApp(currentDrag, test);
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', onDrag);
            currentDrag = null;
        });
    });
});
function onDrag(e) {
    if (currentDrag) {
        currentDrag.style.left = `${e.clientX - offsetX}px`;
        currentDrag.style.top = `${e.clientY - offsetY}px`;
    }
}
function updateClock() {
    const clock = document.getElementById('clock');
    const now = new Date();
    clock.textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();
document.querySelector('.start').addEventListener('click', () => {
    console.log("pressed");
});
