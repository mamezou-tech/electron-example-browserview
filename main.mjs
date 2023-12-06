import { app, BrowserView, BrowserWindow, Menu, ipcMain } from 'electron';
import { fileURLToPath } from "node:url";
import path from 'node:path';

let mainWindow;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs')
    }
  });
  mainWindow.loadFile('tabbar.html');

  mainWindow.webContents.on('did-finish-load', () => {
    setupView('https://electronjs.org');
    setupViewLocal('local.html');
  });

  mainWindow.on('resize', () => {
    mainWindow.getBrowserViews().forEach((view) => {
      resizeView(view);
    })
  });

  createMenu();
}

function setupView(url) {
  const view = new BrowserView();
  mainWindow.addBrowserView(view);
  resizeView(view);
  view.webContents.loadURL(url);
}

function setupViewLocal(file) {
  const view = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, 'local_preload.mjs')
    }
  });
  mainWindow.addBrowserView(view);
  resizeView(view);
  view.webContents.loadFile(file);
  view.setBackgroundColor('white');
  // view.webContents.openDevTools({ mode: 'detach' });
}

function resizeView(view) {
  const bound = mainWindow.getBounds();
  const height = process.platform !== 'win32' ? 60 : 40
  view.setBounds({ x: 0, y: height, width: bound.width, height: bound.height - height });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

function createMenu() {
  const template = [
    {
      label: 'View',
      submenu: [
        {
          label: 'open dev tool',
          click() {
            mainWindow.webContents.openDevTools({ mode: 'detach' });
          }
        },
        { role: 'quit' }
      ]
    }
  ];
  if (!app.isPackaged) {
    template.unshift({
      label: 'Debug',
      submenu: [
        { role: 'forceReload' }
      ]
    });
  }
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function switchView(url) {
  const views = mainWindow.getBrowserViews().filter(view => view.webContents.getURL().includes(url));
  console.assert(views.length === 1);
  mainWindow.setTopBrowserView(views[0]);
}

ipcMain.handle('tab1', e => {
  console.log('tab1');
  switchView('electronjs');
});

ipcMain.handle('tab2', e => {
  console.log('tab2');
  switchView('local.html');
});

ipcMain.handle('switch-to-electronjs', (e, message) => {
  console.log('from local.mjs', message);
  switchView('electronjs');
});
