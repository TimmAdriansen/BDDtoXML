const electron = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs').promises;
const runTests = require('./main.js');
const runServer = require('./server.js');
const XMLHandler = require("./handlers/XMLHandler.js");
const FigmaViewHandler = require("./handlers/FigmaViewHandler.js");
const SeleniumHandler = require("./handlers/SeleniumHandler.js");
const EncryptionHandler = require("./handlers/EncryptionHandler.js")
const FileHandler = require("./handlers/FileHandler.js")
const WidgetHandler = require("./handlers/WidgetHandler.js")
const EditorHandler = require("./handlers/EditorHandler.js")
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
                EditorHandler.tryToGenerate = true;
                win.webContents.send('generateJSON');
            } else {
                win.webContents.send('showCredentialsModal');
            }
        }
    },
    {
        label: 'File',
        submenu: [
            {
                label: 'New page file',
                async click() {
                    win.webContents.send('showNewFileModal');
                },
            },
            {
                label: 'Open page file',
                async click() {
                    const projectFolder = path.resolve(projectPath); // Resolves to the absolute path of the project folder

                    const result = await electron.dialog.showOpenDialog({
                        title: 'Open Page File',
                        defaultPath: projectFolder, // Set the default directory to the project folder
                        filters: [
                            { name: 'Text Files', extensions: ['txt'] }, // Allow only .txt files
                        ],
                        properties: ['openFile']
                    });

                    // If the user selects a file
                    if (!result.canceled && result.filePaths.length > 0) {
                        const filePath = path.resolve(result.filePaths[0]); // Get the absolute path of the selected file

                        // Validate that the file is within the project folder
                        if (!filePath.startsWith(projectFolder)) {
                            console.error('The selected file is outside the allowed project folder.');
                            electron.dialog.showErrorBox(
                                'Invalid File Selection',
                                `Please select a file from the project folder: ${projectFolder}`
                            );
                            return; // Exit the function
                        }
                        const fileName = path.basename(filePath); // Get the file name (e.g., 'example.txt')

                        // Send the file name to the renderer process
                        win.webContents.send('addTab', fileName);
                    } else {
                        console.log('File selection canceled.');
                    }
                },
            },
        ]
    },
    {
        label: 'PrintAllActions',
        click() {
            /*XMLHandler.updateXML();
            //console.log(XMLHandler.getXML());
            console.log('Run button clicked');
            // Assuming the functions are imported correctly

            // Example for lookupByProperty
            console.log(WidgetHandler.lookupByProperty('option')); // Finds widgets with the 'option' property
            console.log(WidgetHandler.lookupByProperty('value')); // Finds widgets with the 'value' property
            console.log(WidgetHandler.lookupByProperty('date')); // Finds widgets with the 'date' property

            // Example for lookupByAction
            console.log(WidgetHandler.lookupByAction('click')); // Finds widgets that can be clicked
            console.log(WidgetHandler.lookupByAction('select')); // Finds widgets that can be selected
            console.log(WidgetHandler.lookupByAction('type')); // Finds widgets where you can type

            // Example for lookupByState
            console.log(WidgetHandler.lookupByState('selected')); // Finds widgets that can have a 'selected' state
            console.log(WidgetHandler.lookupByState('clicked')); // Finds widgets that can have a 'clicked' state
            console.log(WidgetHandler.lookupByState('typed')); // Finds widgets that can have a 'typed' state*/
            /*console.log("test")
            EditorHandler.generate = true;
            win.webContents.send('generateJSON');*/
            XMLHandler.printAllActions();
        }
    },
    {
        label: 'PrintSelectedActions',
        click() {
            XMLHandler.printSelectedActions();
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
                //win.setIcon(path.join(__dirname, './resources/resumeWhite.PNG'));
                win.webContents.send('toggleTheme', 'dark');
            }
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
        icon: path.join(__dirname, './resources/resume.png'),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            devTools: true,
        },
    });

    win.loadFile("./www/index.html");
    win.maximize();

    win.webContents.openDevTools();


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
        icon: path.join(__dirname, './resources/resume.png'),
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
    //XMLHandler.updateXML();
    //console.log(XMLHandler.getXML());

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
    projectPath = filePath + "\\" + projectN;
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

    /*let figma = await SeleniumHandler.renameFile(projectName);
    if (figma == null) {
        electron.dialog.showMessageBox({
            type: 'info',
            buttons: ['OK'],
            title: 'Alert',
            message: 'Error in renaming file',
        });
        SeleniumHandler.closeDriver();
        return;
    }*/

    //FileHandler.createAndSaveJson(projectPath + "\\" + projectName, figma, "")
    FileHandler.createAndSaveProject(projectPath + "\\" + projectName, figma);

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

electron.ipcMain.on('saveBDD', (event, fileName, newBDD) => {
    BDD = newBDD;
    saveProject(fileName);
});

electron.ipcMain.on('getTabContent', async (event, fileName) => {
    const fileContents = await fs.readFile(projectPath + "\\" + fileName, 'utf-8');
    console.log(`Loaded content for ${fileName}:\n${fileContents}`);
    win.webContents.send('setBDD', fileContents);
});

electron.ipcMain.on('saveBeforeGenerating', async (event, fileName, newBDD) => {
    try {

        BDD = newBDD;
        await saveProject(fileName);



        //foreach txt file in project folder, do the stuff below, if the length is bigger than 0, set canGenerate and tryToGenerate to false, break loop
        const files = await fs.readdir(projectPath);
        const txtFiles = files.filter((file) => path.extname(file) === '.txt');

        let scenarios = ""

        for (const txtFile of txtFiles) {
            // Read and process each .txt file
            const filePath = path.join(projectPath, txtFile);
            const fileContent = await fs.readFile(filePath, 'utf-8');

            // Update annotations
            const annotations = EditorHandler.updateEditorAnnotations(fileContent);

            // If any annotations exist, stop the process
            if (annotations.length > 0) {
                EditorHandler.canGenerate = false;
                // Stop further processing
                break;
            }
            EditorHandler.canGenerate = true;
            scenarios += fileContent + "\n";
        }

        if (EditorHandler.tryToGenerate && EditorHandler.canGenerate) {
            //lets just add all the texts together EASY - editor value doesnt exist here
            console.log(scenarios);
            annotations = EditorHandler.updateEditorAnnotations(scenarios);
            EditorHandler.tryToGenerate = false;
            XMLHandler.updateXML(EditorHandler.pages);
        } else if (EditorHandler.tryToGenerate && !EditorHandler.canGenerate) {
            EditorHandler.tryToGenerate = false;
            electron.dialog.showMessageBox({
                type: 'info',
                title: 'Alert',
                message: "Please fix all errors before generating",
                buttons: ['OK']
            });
        }
    } catch (error) {
        console.error('Error during saveBeforeGenerating:', error);

        // Show an error popup if something fails
        electron.dialog.showMessageBox({
            type: 'error',
            buttons: ['OK'],
            title: 'Error',
            message: 'An error occurred while processing files.',
            detail: error.message,
        });
    }

});

electron.ipcMain.on('errorDetection', (event, editor) => {
    let annotations = EditorHandler.updateEditorAnnotations(editor);
    win.webContents.send('setErrorAnnotations', annotations);
});

electron.ipcMain.on('createFile', async (event, fileName) => {
    try {
        const filePath = path.join(projectPath, `${fileName}.txt`); // Append .txt extension

        await fs.writeFile(filePath, '', 'utf-8');

        fileName = path.basename(filePath);

        win.webContents.send('addTab', fileName);

    } catch (error) {
        // Show a popup only if file creation failed
        dialog.showMessageBox({
            type: 'error',
            buttons: ['OK'],
            title: 'File Creation Failed',
            message: 'An error occurred while creating the file.',
            detail: error.message // Include error details in the popup
        });
    }
});

async function saveProject(fileName) {
    //await FileHandler.updateBddInJsonFile(projectPath + "\\" + fileName, BDD);
    if (fileName == null) {
        return;
    }
    await FileHandler.updateBddInFile(projectPath + "\\" + fileName, BDD);
}

function runSelenium() {
    //console.log("hello");
}

// Define __filename and __dirname as they are not available when using 'require'
global.__filename = __filename;
global.__dirname = __dirname;