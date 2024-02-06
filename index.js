const electron = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const url = require('url');
const runTests = require('./main.js');
const runServer = require('./server.js');
const XMLHandler = require("./handlers/XMLHandler.js");
const FigmaViewHandler = require("./handlers/FigmaViewHandler.js");
const SeleniumHandler = require("./handlers/SeleniumHandler.js");
const EncryptionHandler = require("./handlers/EncryptionHandler.js")
const jsonFile = "./setup.json";
const config = require(jsonFile);
const secretsPath = path.join(__dirname, 'secrets.json');


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
            nodeIntegration: true,
            devTools: true, // Enable DevTools
        },
    });

    win.loadFile("./www/index.html");
    win.maximize();

    const menuTemplate = [
        {
            label: 'Generate',
            click() {
                XMLHandler.updateXML();
                console.log(XMLHandler.getXML());
                console.log('Run button clicked');
                if (fs.existsSync(secretsPath)) {
                    runSelenium();
                } else {
                    win.webContents.send('showCredentialsModal');
                }
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
        },
        {
            label: 'Export',
            submenu: [
                {
                    label: 'Export as .pdf',
                    async click() {
                        if (!fs.existsSync(secretsPath)) {
                            win.webContents.send('showCredentialsModal');
                            return;
                        }
                        const decryptedValues = decrypted();
                        username = decryptedValues.decryptedUsername;
                        password = decryptedValues.decryptedPassword;
                        if (!await SeleniumHandler.login(username, password)) {
                            electron.dialog.showMessageBox({
                                type: 'info',
                                buttons: ['OK'],
                                title: 'Alert',
                                message: 'Error in login - try again',
                            });
                            fs.unlink('./secrets.json', (err) => {
                                if (err) {
                                    console.error("Error deleting 'secrets.json':", err);
                                } else {
                                    console.log("'secrets.json' deleted.");
                                }
                            });
                            SeleniumHandler.closeDriver();
                            return;
                        }
                        await SeleniumHandler.exportAsPdf(config.figmaSrc);
                        openDownloadsFolder();
                    },
                },
                {
                    label: 'Export as .fig',
                    async click() {
                        if (!fs.existsSync(secretsPath)) {
                            win.webContents.send('showCredentialsModal');
                            return;
                        }
                        const decryptedValues = decrypted();
                        username = decryptedValues.decryptedUsername;
                        password = decryptedValues.decryptedPassword;
                        if (!await SeleniumHandler.login(username, password)) {
                            electron.dialog.showMessageBox({
                                type: 'info',
                                buttons: ['OK'],
                                title: 'Alert',
                                message: 'Error in login - try again',
                            });
                            fs.unlink('./secrets.json', (err) => {
                                if (err) {
                                    console.error("Error deleting 'secrets.json':", err);
                                } else {
                                    console.log("'secrets.json' deleted.");
                                }
                            });
                            SeleniumHandler.closeDriver();
                            return;
                        }
                        await SeleniumHandler.exportAsFig(config.figmaSrc);
                        openDownloadsFolder();
                    },
                },
                {
                    label: 'Export as link',
                    click() {
                        electron.clipboard.writeText(FigmaViewHandler.convertLinkToEmbed(config.figmaSrc))
                    },
                }
            ]
        },
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

electron.ipcMain.on("init", (event, data) => {
    runServer();

    if (config.figmaSrc == "" || config.figmaSrc == "0") {
        return;
    }
    win.webContents.send('setFigmaSource', FigmaViewHandler.convertLinkToEmbed(config.figmaSrc));
    //win.webContents.send('loadPDF', '../resources/test.pdf');
});

electron.ipcMain.on("setUsernamePassword", (event, username, password) => {
    EncryptionHandler.initializeSecrets(username, password);
    electron.dialog.showMessageBox({
        type: 'info',
        buttons: ['OK'],
        title: 'Info',
        message: 'Credentials stored - perform action again.',
    });
});

function decrypted() {
    const secretsContent = fs.readFileSync(secretsPath, 'utf8');
    const secrets = JSON.parse(secretsContent);

    const secretKey = secrets.secretKey;
    const encryptedUsername = secrets.encryptedUsername;
    const encryptedPassword = secrets.encryptedPassword;

    decryptedUsername = EncryptionHandler.decrypt(encryptedUsername, secretKey);
    decryptedPassword = EncryptionHandler.decrypt(encryptedPassword, secretKey);

    return { decryptedUsername, decryptedPassword };
}

async function runSelenium() {
    const decryptedValues = decrypted();
    username = decryptedValues.decryptedUsername;
    password = decryptedValues.decryptedPassword;
    if (!await SeleniumHandler.login(username, password)) {
        electron.dialog.showMessageBox({
            type: 'info',
            buttons: ['OK'],
            title: 'Alert',
            message: 'Error in login - try again',
        });
        fs.unlink('./secrets.json', (err) => {
            if (err) {
                console.error("Error deleting 'secrets.json':", err);
            } else {
                console.log("'secrets.json' deleted.");
            }
        });
        SeleniumHandler.closeDriver();
        return;
    }

    let figmaSrc = await SeleniumHandler.copyTemplate();
    if (figmaSrc == null) {
        electron.dialog.showMessageBox({
            type: 'info',
            buttons: ['OK'],
            title: 'Alert',
            message: 'Error in copying template',
        });
        SeleniumHandler.closeDriver();
        return;
    }

    config.figmaSrc = figmaSrc;
    fs.writeFile(jsonFile, JSON.stringify(config, null, 2), function writeJSON(err) {
        if (err) return console.log(err);
    });
    console.log(config.figmaSrc);
    win.webContents.send('setFigmaSource', FigmaViewHandler.convertLinkToEmbed(config.figmaSrc));

    SeleniumHandler.closeDriver();
}

function openDownloadsFolder() {
    const homeDir = os.homedir();
    const downloadsPath = path.join(homeDir, 'Downloads'); // This might need adjustment based on the OS or user settings
    electron.shell.openPath(downloadsPath)
        .then(() => console.log('Downloads folder opened'))
        .catch(err => console.error('Error opening downloads folder:', err));
}

// Define __filename and __dirname as they are not available when using 'require'
global.__filename = __filename;
global.__dirname = __dirname;