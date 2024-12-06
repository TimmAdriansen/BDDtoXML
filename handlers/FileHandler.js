const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

class FileHandler {
    static async createAndSaveJson(filename, figmaSrc, BDD) {
        // Create the JSON object
        const jsonObj = {
            figmaSrc: figmaSrc,
            BDD: BDD
        };

        filename = filename + ".json";

        try {
            const jsonString = JSON.stringify(jsonObj, null, 2);

            await fsPromises.writeFile(filename, jsonString, 'utf8');
            console.log(`${filename} has been successfully saved.`);
        } catch (error) {
            console.error('An error occurred:', error);
        }
    }

    static async createAndSaveProject(filename, figmaSrc) {

        const folderPath = path.resolve(filename); // Ensures the path is absolute
        const projectFilePath = path.join(folderPath, 'project.json'); // Path for project.json

        // Create the JSON object
        const jsonObj = {
            figmaSrc: figmaSrc,
            files: []
        };

        try {
            // Create the folder (if it doesn't exist)
            await fsPromises.mkdir(folderPath, { recursive: true });

            // Write the project.json file inside the folder
            const jsonString = JSON.stringify(jsonObj, null, 2);
            await fsPromises.writeFile(projectFilePath, jsonString, 'utf8');

            console.log(`Project folder created: ${folderPath}`);
            console.log(`project.json created successfully at ${projectFilePath}`);
        } catch (error) {
            console.error('An error occurred while creating the project:', error);
        }
    }

    static async updateBddInJsonFile(filename, newBDD) {
        filename = filename + ".json";

        try {
            const data = await fsPromises.readFile(filename, 'utf8');
            const jsonObj = JSON.parse(data);

            jsonObj.BDD = newBDD;

            const updatedJsonString = JSON.stringify(jsonObj, null, 2);

            await fsPromises.writeFile(filename, updatedJsonString, 'utf8');
            console.log(`${filename} has been successfully updated with new BDD.`);
        } catch (error) {
            console.error('An error occurred while updating BDD:', error);
        }
    }

    static async updateBddInFile(filename, newBDD) {
        try {
            // Write the new content to the file
            await fsPromises.writeFile(filename, newBDD, 'utf8');
    
            console.log(`Updated BDD in file: ${filename}`);
        } catch (error) {
            console.error(`Failed to update BDD in file ${filename}:`, error);
        }
    }

    static fileExists(path) {
        if (fs.existsSync(path)) {
            return true;
        } else {
            return false;
        }
    }

    static readFileSync(path) {
        return fs.readFileSync(path, 'utf8');
    }

    static deleteFile(path) {
        fs.unlink(path, (err) => {
            if (err) {
                console.error("Error deleting 'secrets.json':", err);
            } else {
                console.log("'secrets.json' deleted.");
            }
        });
    }

    static writeConfig(jsonFile, config) {
        fs.writeFile(jsonFile, JSON.stringify(config, null, 2), function writeJSON(err) {
            if (err) return console.log(err);
        });
    }


}

module.exports = FileHandler;