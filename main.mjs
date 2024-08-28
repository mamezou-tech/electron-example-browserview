import { app, WebContentsView, BaseWindow, Menu, ipcMain } from 'electron';
import { fileURLToPath } from "node:url";
import path from 'node:path';
import { assert } from 'node:console';

let mainWindow;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow () {
  mainWindow = new BaseWindow({
    width: 800,
    height: 600,
  });
  const view = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, 'tabbar_preload.js')
    }
  });
  view.webContents.loadFile('tabbar.html');
  mainWindow.contentView.addChildView(view);
  view.setBounds({ x: 0, y: 0, width: 800, height: 40 });
  
  view.webContents.on('did-finish-load', () => {
    // view.webContents.openDevTools({ mode: 'detach' });
    setupView('https://electronjs.org');
    setupViewLocal('local.html');
  });

  mainWindow.on('resize', () => {
    const views = mainWindow.contentView.children;
    assert(views.length === 3);
    resizeViews(views[1], views[2]);
  });

  createMenu();
}

function setupView(url) {
  const view = new WebContentsView();
  resizeViews(view);
  view.webContents.loadURL(url);
  mainWindow.contentView.addChildView(view);
}

function setupViewLocal(file) {
  const view = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, 'local_preload.js')
    }
  });
  resizeViews(view);
  view.webContents.loadFile(file);
  view.setBackgroundColor('white');
  mainWindow.contentView.addChildView(view);
  // view.webContents.openDevTools({ mode: 'detach' });
}

function resizeViews(...views) {
  const bound = mainWindow.getBounds();
  const height = process.platform !== 'win32' ? 60 : 40
  views.forEach(view => view.setBounds({ x: 0, y: height, width: bound.width, height: bound.height - height }));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (mainWindow.contentView.children.length === 0) createWindow();
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
  const views = mainWindow.contentView.children.filter(view => view.webContents.getURL().includes(url));
  console.assert(views.length === 1);
  setTopWebContentsView(views[0]);
}

function setTopWebContentsView(view) {
  mainWindow.contentView.removeChildView(view);
  mainWindow.contentView.addChildView(view); 
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
