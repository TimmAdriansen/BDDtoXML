const electron = require('electron');
const path = require('path');
const url = require('url');
const runTests = require('./main.js')

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
var width, height;

function createWindow() {
    const win = new BrowserWindow({
        width: width,
        height: height,
        icon: path.join(__dirname, './resources/resume.PNG'),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true
        },
    });

    win.loadFile("./www/index.html");
    win.maximize();
}

app.whenReady().then(() => {
    const { width: screenWidth, height: screenHeight } = electron.screen.getPrimaryDisplay().workAreaSize;
    width = screenWidth;
    height = screenHeight;
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

electron.ipcMain.on("testFunction", (event, data) => {
    runTests();
});

// Define __filename and __dirname as they are not available when using 'require'
global.__filename = __filename;
global.__dirname = __dirname;
