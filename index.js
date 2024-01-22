const electron = require('electron');
const fs = require('fs');
const path = require('path');
const url = require('url');
const runTests = require('./main.js');
const runServer = require('./server.js');
const XMLHandler = require("./handlers/XMLHandler.js");
const FigmaViewHandler = require("./handlers/FigmaViewHandler.js");
const jsonFile = "./setup.json";
const config = require(jsonFile);

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
var width, height;
var win;
let theme = "dark";

function createWindow() {
    win = new BrowserWindow({
        width: width,
        height: height,
        icon: path.join(__dirname, './resources/resumeWhite.PNG'),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true
        },
    });

    win.loadFile("./www/index.html");
    win.maximize();

    const menuTemplate = [
        {
            label: 'Run',
            click() {
                console.log('Run button clicked');
            }
        },
        {
            label: 'Set URL',
            click() {
                win.webContents.send('showUrlModal');
            }
        },
        {
            label: 'Theme',
            click() {
                if (theme === "dark") {
                    theme = "light";
                    electron.nativeTheme.themeSource = "light";
                    win.setIcon(path.join(__dirname, './resources/resume.PNG'));
                    win.webContents.send('toggleTheme', 'light');
                } else {
                    theme = "dark";
                    electron.nativeTheme.themeSource = "dark";
                    win.setIcon(path.join(__dirname, './resources/resumeWhite.PNG'));
                    win.webContents.send('toggleTheme', 'dark');
                }
                console.log('Theme button clicked');
                //win.webContents.send('toggle-theme');
            }
        }
    ];

    const menu = electron.Menu.buildFromTemplate(menuTemplate);

    electron.Menu.setApplicationMenu(menu);

    electron.nativeTheme.themeSource = 'dark'
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
    //runTests();
    XMLHandler.updateXML();
    console.log(XMLHandler.getXML());
});

electron.ipcMain.on("setUrl", (event, data) => {
    config.figmaSrc = FigmaViewHandler.convertLinkToEmbed(data);
    fs.writeFile(jsonFile, JSON.stringify(config, null, 2), function writeJSON(err) {
        if (err) return console.log(err);
    });
    win.webContents.send('setFigmaSource', config.figmaSrc);
});


electron.ipcMain.on("init", (event, data) => {
    runServer();

    if (config.figmaSrc == "" || config.figmaSrc == "0" ) {
        win.webContents.send('showUrlModal');
        return;
    }
    win.webContents.send('setFigmaSource', config.figmaSrc);
    //win.webContents.send('loadPDF', '../resources/test.pdf');
});

// Define __filename and __dirname as they are not available when using 'require'
global.__filename = __filename;
global.__dirname = __dirname;