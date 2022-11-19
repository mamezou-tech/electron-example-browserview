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
  setupView('https://electronjs.org');
  setupViewLocal('local.html');
  mainWindow.loadFile('tabbar.html');

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
      preload: path.join(__dirname, 'local_preload.js')
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
  view.setBounds({ x: 0, y: 90, width: bound.width, height: bound.height - 90 });
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

ipcMain.handle('tab1', e => {
  mainWindow.setTopBrowserView(mainWindow.getBrowserViews()[0]);
});

ipcMain.handle('tab2', e => {
  mainWindow.setTopBrowserView(mainWindow.getBrowserViews()[1]);
});

ipcMain.handle('switch-to-electronjs', (e, message) => {
  console.log('from local.js', message);
  mainWindow.setTopBrowserView(mainWindow.getBrowserViews()[0]);
});
