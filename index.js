const electron = require('electron');
const path = require('path');
const os = require('os');
const runTests = require('./main.js');
const runServer = require('./server.js');
const XMLHandler = require("./handlers/XMLHandler.js");
const FigmaViewHandler = require("./handlers/FigmaViewHandler.js");
const SeleniumHandler = require("./handlers/SeleniumHandler.js");
const EncryptionHandler = require("./handlers/EncryptionHandler.js")
const FileHandler = require("./handlers/FileHandler.js")
const jsonFile = "./setup.json";
const config = require(jsonFile);
const secretsPath = path.join(__dirname, 'secrets.json');


const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
var width, height;
var win;
let theme = "dark";
let newProject = false;
let projectPath = "";
let projectName = "";
let figmaSrc = "";
let BDD;

let initialWindow;

const menuTemplate = [
    {
        label: 'Generate',
        click() {
            if (FileHandler.fileExists(secretsPath)) {
                runSelenium();
            } else {
                win.webContents.send('showCredentialsModal');
            }
        }
    },
    {
        label: 'test',
        click() {
            XMLHandler.updateXML();
            //console.log(XMLHandler.getXML());
            console.log('Run button clicked');
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
                    if (!FileHandler.fileExists(secretsPath)) {
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
                        FileHandler.deleteFile(secretsPath);
                        SeleniumHandler.closeDriver();
                        return;
                    }
                    await SeleniumHandler.exportAsPdf(figmaSrc);
                    openDownloadsFolder();
                },
            },
            {
                label: 'Export as .fig',
                async click() {
                    if (!FileHandler.fileExists(secretsPath)) {
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
                        FileHandler.deleteFile(secretsPath);
                        SeleniumHandler.closeDriver();
                        return;
                    }
                    await SeleniumHandler.exportAsFig(figmaSrc);
                    openDownloadsFolder();
                },
            },
            {
                label: 'Export as link',
                click() {
                    electron.clipboard.writeText(FigmaViewHandler.convertLinkToEmbed(figmaSrc))
                },
            }
        ]
    },
    {
        label: 'Save',
        click() {
            win.webContents.send('getBDD');
        }
    },
];

function createWindow() {
    if (initialWindow) {
        initialWindow.close();
        initialWindow = null;
    }

    win = new BrowserWindow({
        width: width,
        height: height,
        icon: path.join(__dirname, './resources/resumeWhite.PNG'),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            devTools: true,
        },
    });

    win.loadFile("./www/index.html");
    win.maximize();

    electron.nativeTheme.themeSource = 'dark'

    win.once('ready-to-show', () => {
        win.show();
        if (!FileHandler.fileExists(secretsPath)) {
            win.webContents.send('showCredentialsModal');
            return;
        }

        if (newProject) {
            initProject();
        } else {
            loadProject();
        }
    });
}

function createInitialPromptWindow() {
    initialWindow = new BrowserWindow({
        width: 400,
        height: 350,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            contextIsolation: true
        },
    });

    initialWindow.loadFile("./www/initialPrompt.html");

    electron.Menu.setApplicationMenu(null);

    electron.nativeTheme.themeSource = 'dark'
}


app.whenReady().then(() => {
    const { width: screenWidth, height: screenHeight } = electron.screen.getPrimaryDisplay().workAreaSize;
    width = screenWidth;
    height = screenHeight;
    createInitialPromptWindow();
    //createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createInitialPromptWindow();
            //createWindow();
        }
    });
});

app.on("window-all-closed", async () => {
    await saveProject();
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

    if (figmaSrc == "" || figmaSrc == "0") {
        return;
    }
    win.webContents.send('setFigmaSource', FigmaViewHandler.convertLinkToEmbed(figmaSrc));
    //win.webContents.send('loadPDF', '../resources/test.pdf');
});

electron.ipcMain.on("setUsernamePassword", async (event, username, password) => {

    let loginSuccess = await attemptLogin(username, password);

    if (!loginSuccess) {
        electron.dialog.showMessageBox({
            type: 'info',
            buttons: ['OK'],
            title: 'Alert',
            message: 'Error in login - try again',
        });
        win.webContents.send('showCredentialsModal');
    } else {
        EncryptionHandler.initializeSecrets(username, password);
        if (newProject) {
            initProject();
        } else {
            loadProject();
        }
    }
});

async function attemptLogin(username, password) {
    if (!await SeleniumHandler.login(username, password)) {
        FileHandler.deleteFile(secretsPath);
        SeleniumHandler.closeDriver();
        return false;
    }
    SeleniumHandler.closeDriver();
    return true;
}


electron.ipcMain.on('create-new-project', async (event, projectN, filePath) => {
    newProject = true;
    projectName = projectN;
    projectPath = filePath;
    createWindow();
});

electron.ipcMain.on('project-selection', (event) => {
    electron.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'JSON Files', extensions: ['json'] }
        ]
    }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            const fileContent = FileHandler.readFileSync(result.filePaths[0]);
            const jsonVars = JSON.parse(fileContent);
            BDD = jsonVars.BDD;
            figmaSrc = jsonVars.figmaSrc;
            const fileExtension = path.extname(result.filePaths[0]);
            projectPath = path.dirname(result.filePaths[0]);
            projectName = path.basename(result.filePaths[0], fileExtension);
            createWindow();
        }
    }).catch(err => {
        console.log('Error opening file dialog:', err);
    });
});

function decrypted() {
    const secretsContent = FileHandler.readFileSync(secretsPath);
    const secrets = JSON.parse(secretsContent);

    const secretKey = secrets.secretKey;
    const encryptedUsername = secrets.encryptedUsername;
    const encryptedPassword = secrets.encryptedPassword;

    decryptedUsername = EncryptionHandler.decrypt(encryptedUsername, secretKey);
    decryptedPassword = EncryptionHandler.decrypt(encryptedPassword, secretKey);

    return { decryptedUsername, decryptedPassword };
}

async function initProject() {
    win.webContents.send('showOverlay');
    win.webContents.send('setBDD', BDD);
    win.webContents.send('updateStatusBar', 10);
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
        FileHandler.deleteFile(secretsPath);
        SeleniumHandler.closeDriver();
    }

    win.webContents.send('updateStatusBar', 33);

    let figma = await SeleniumHandler.copyTemplate();
    if (figma == null) {
        electron.dialog.showMessageBox({
            type: 'info',
            buttons: ['OK'],
            title: 'Alert',
            message: 'Error in copying template',
        });
        SeleniumHandler.closeDriver();
        return;
    }

    win.webContents.send('updateStatusBar', 66);

    if (!await SeleniumHandler.renameFile(projectName)) {
        electron.dialog.showMessageBox({
            type: 'info',
            buttons: ['OK'],
            title: 'Alert',
            message: 'Error in renaming file',
        });
        SeleniumHandler.closeDriver();
        return;
    }

    FileHandler.createAndSaveJson(projectPath + "\\" + projectName, figma, "")

    win.webContents.send('setFigmaSource', FigmaViewHandler.convertLinkToEmbed(figma));

    figmaSrc = figma;

    SeleniumHandler.closeDriver();

    win.webContents.send('updateStatusBar', 100);
    win.webContents.send('hideOverlay');


    const menu = electron.Menu.buildFromTemplate(menuTemplate);

    electron.Menu.setApplicationMenu(menu);
    
    win.webContents.send('setTitle', "BDDFigmaBuilder\t - \t" + projectName);
}

function loadProject() {
    win.webContents.send('setBDD', BDD);
    win.webContents.send('setFigmaSource', FigmaViewHandler.convertLinkToEmbed(figmaSrc));

    win.webContents.send('updateStatusBar', 100);

    const menu = electron.Menu.buildFromTemplate(menuTemplate);

    electron.Menu.setApplicationMenu(menu);
    win.webContents.send('setTitle', "BDDFigmaBuilder\t - \t" + projectName);
}

function openDownloadsFolder() {
    const homeDir = os.homedir();
    const downloadsPath = path.join(homeDir, 'Downloads'); // This might need adjustment based on the OS or user settings
    electron.shell.openPath(downloadsPath)
        .then(() => console.log('Downloads folder opened'))
        .catch(err => console.error('Error opening downloads folder:', err));
}

electron.ipcMain.on('open-folder-dialog', async (event) => {
    const { filePaths } = await electron.dialog.showOpenDialog({
        title: 'Choose a directory to save the new project',
        properties: ['openDirectory', 'createDirectory']
    });

    if (filePaths && filePaths.length > 0) {
        const selectedDirectoryPath = filePaths[0];
        initialWindow.webContents.send('folder-selected', selectedDirectoryPath);


    } else {
        console.log('Project creation cancelled');
    }
});

electron.ipcMain.on('saveBDD', (event,newBDD) => {
    BDD = newBDD;
    saveProject();
});

async function saveProject() {
    await FileHandler.updateBddInJsonFile(projectPath + "\\" + projectName, BDD);
}

function runSelenium(){
    console.log("hello");
}

// Define __filename and __dirname as they are not available when using 'require'
global.__filename = __filename;
global.__dirname = __dirname;