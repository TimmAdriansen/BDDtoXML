const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendTestFunction: () => ipcRenderer.send('testFunction', 'test'),
    sendInit: () => ipcRenderer.send('init'),
    sendSetUrl: (url) => ipcRenderer.send('setUrl', url),
    sendUsernamePassword: (username,password) => ipcRenderer.send('setUsernamePassword', username,password),
    receiveMessage: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
});