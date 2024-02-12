const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendUsernamePassword: (username,password) => ipcRenderer.send('setUsernamePassword', username, password),
    receiveMessage: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    sendMessage: (channel, ...args) => {
        ipcRenderer.send(channel, ...args);
    }
});