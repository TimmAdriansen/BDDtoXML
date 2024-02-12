const fs = require('fs');
const fsPromises = require('fs').promises;

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