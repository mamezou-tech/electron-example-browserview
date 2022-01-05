const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'localApi', {
    switchPage: async () => {
      await ipcRenderer.invoke('switch-to-electronjs', 'switch');
    }
  }
);
