const icons = document.querySelectorAll('.icon');
icons.forEach(icon => {
  icon.addEventListener('click', () => {
    icons.forEach(i => i.classList.remove('selected'));
    icon.classList.add('selected');
  });

  icon.addEventListener('dblclick', () => {
    const appName = (icon as HTMLElement).dataset.app;
    if (appName) launchApp(appName);
  });
});


function launchApp(appName: string) {
  if (appName === 'notes') {
    launchNotesApp();
  } else if (appName === 'system-info') {
    launchSystemInfoApp();
  }
}

function launchNotesApp() {
  const app = document.getElementById('notes-app');
  const test = "Notes app";
  if (app) {
    app.classList.remove('hidden');
    focusApp(app, test);
  }
  console.log("Notes app openned")
}

function launchSystemInfoApp() {
  const test = "Info App";
  const app = document.getElementById('system-info-app');
  if (app) {
    app.classList.remove('hidden');
    const osInfo = document.getElementById('os-info');
    if (osInfo) osInfo.innerText = `
      OS Name: Mini OS
      Version: 1.0.0
      Uptime: ${Math.floor(performance.now() / 1000)} seconds
      User Agent: ${navigator.userAgent}
    `;
    focusApp(app, test);
  }
}


function closeApp(id: string) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}


function focusApp(app: HTMLElement, test: string) {
  console.log(`App openned:` + test)
  document.querySelectorAll('.app-window').forEach(win => {
    (win as HTMLElement).style.zIndex = '0';
  });
  app.style.zIndex = '10';
}

let offsetX: number, offsetY: number, currentDrag: HTMLElement | null;

document.querySelectorAll('.app-header').forEach(header => {
  header.addEventListener('mousedown', (e) => {
    const mouseEvent = e as MouseEvent;
    currentDrag = header.parentElement as HTMLElement;
    offsetX = mouseEvent.clientX - currentDrag.offsetLeft;
    offsetY = mouseEvent.clientY - currentDrag.offsetTop;
    const test = 'drag';
    focusApp(currentDrag, test);

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', onDrag);
      currentDrag = null;
    });
  });
});

function onDrag(e: MouseEvent) {
  if (currentDrag) {
    currentDrag.style.left = `${e.clientX - offsetX}px`;
    currentDrag.style.top = `${e.clientY - offsetY}px`;
  }
}

function updateClock() {
  const clock = document.getElementById('clock');
  if (clock) {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString();
  }
}
setInterval(updateClock, 1000);
updateClock();


const startBtn = document.querySelector('.start');
if (startBtn) startBtn.addEventListener('click', () => {
  console.log("pressed")
});
