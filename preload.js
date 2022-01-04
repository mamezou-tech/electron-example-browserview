const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'api', {
    tab1: () => ipcRenderer.send('tab1'),
    tab2: () => ipcRenderer.send('tab2'),
    switchPage: () => {
      ipcRenderer.send('switch-to-electronjs');
      return 'fuga';
    }
  }
);
