const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendTestFunction: () => ipcRenderer.send('testFunction', 'test'),
    sendInit: () => ipcRenderer.send('init')
});
