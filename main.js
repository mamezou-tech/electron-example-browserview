const { app, BrowserView, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  setupView(mainWindow, 'https://electronjs.org');
  setupViewLocal(mainWindow, 'local.html');
  mainWindow.loadFile('tabbar.html');

  ['resize'].forEach(e => {
    mainWindow.on(e, () => {
      mainWindow.getBrowserViews().forEach((view, index) => {
        resizeView(view, index);
      })
    });
  });

  createMenu();
}

function setupView(win, url) {
  const view = new BrowserView();
  win.addBrowserView(view);
  resizeView(view);
  view.webContents.loadURL(url);
}

function setupViewLocal(win, file) {
  const view = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.addBrowserView(view);
  resizeView(view);
  view.webContents.loadFile(file);
  view.setBackgroundColor('white');
  // view.webContents.openDevTools({ mode: 'detach' });
}

function resizeView(view) {
  const bound = mainWindow.getBounds();
  view.setBounds({ x: 0, y: 30, width: bound.width, height: bound.height - 30 });
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

ipcMain.on('tab1', e => {
  mainWindow.setTopBrowserView(mainWindow.getBrowserViews()[0]);
});

ipcMain.on('tab2', e => {
  mainWindow.setTopBrowserView(mainWindow.getBrowserViews()[1]);
});

ipcMain.on('switch-to-electronjs', e => {
  console.log('from local.js');
  mainWindow.setTopBrowserView(mainWindow.getBrowserViews()[0]);
});
