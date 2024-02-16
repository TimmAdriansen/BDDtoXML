const cucumberApi = require('@cucumber/cucumber/api');
const fs = require('fs');
const fsPromise = require('fs').promises;
const path = require('path');
const config = require('./setup.json');

const loadConfiguration = cucumberApi.loadConfiguration;
const runCucumber = cucumberApi.runCucumber;

const featureFile = config.featureFile;
const stepsDefinitionFile = config.stepsDefintionFile;
const destinationFilePath = 'features/';

async function getFilesFromDirectory(directory) {
    try {
        const files = await fsPromise.readdir(directory);
        // Filter out directories, keep only files (optional)
        const fileOnly = [];
        for (const file of files) {
            const stat = await fsPromise.stat(path.join(directory, file));
            if (stat.isFile()) {
                fileOnly.push(path.join(directory, file));
            }
        }
        return fileOnly;
    } catch (error) {
        console.error('Error reading directory:', error);
        return [];
    }
}

async function runTests() {
    const { runConfiguration } = await loadConfiguration();

    const featureFiles = await getFilesFromDirectory(config.featureFolder);
    const stepFiles = await getFilesFromDirectory(config.stepsFolder);

    const files = [...featureFiles, ...stepFiles];

    //let files = [featureFile, stepsDefinitionFile];


    let copiedFiles = copyFiles(files, destinationFilePath);
    let success = false;
    try { success = await runCucumber(runConfiguration); }
    finally { deleteFiles(copiedFiles); }
    return success
}

function copyFiles(files, destinationFilePath) {
    let copiedFiles = [];
    files.forEach(element => {
        let sourceStream = fs.createReadStream(element);
        let destinationFile = destinationFilePath + path.basename(element)
        let destinationStream = fs.createWriteStream(destinationFile);

        // Copy the file by piping the source stream to the destination stream
        sourceStream.pipe(destinationStream);

        // Handle any errors during the copy process
        sourceStream.on('error', (err) => {
            console.error('Error reading the source file:', err);
        });

        destinationStream.on('error', (err) => {
            console.error('Error writing the destination file:', err);
        });

        // When the copying is complete, you can perform additional actions
        destinationStream.on('finish', () => {
            console.log('File copied successfully');
        });

        copiedFiles.push(destinationFile);
    });
    return copiedFiles;
}

function deleteFiles(copiedFiles) {
    copiedFiles.forEach(element => {
        fs.unlink(element, (err) => {
            if (err) {
                console.error('Error deleting the file:', err);
            } else {
                console.log('File deleted successfully');
            }
        });
    });
}

runTests()

module.exports = runTests;