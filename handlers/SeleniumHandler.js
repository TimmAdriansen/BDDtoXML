const { By, Key, until, Builder } = require("selenium-webdriver");
require("chromedriver");
const path = require('path');

class SeleniumHandler {

    async login(username, password){

    }

    async startPlugin(){

    }

    async createInteractions(){

    }

    async copyTemplate(){

    }

    async renameFile(){

    }

    async import_base_file(filename) {
        let driver = await new Builder().forBrowser("chrome").build();
    
        try {
            // Open Figma login page
            await driver.get("https://www.figma.com/files");
            console.log('Please log in to Figma using your preferred method.');
    
            // Wait for the user to log in
            // This example waits for an element that's only visible when logged in, adjust the selector as needed
            await driver.wait(until.elementLocated(By.css('[data-testid="file-import-button"]')), 60000); // Waits up to 60 seconds
    
            // Proceed with automation tasks
            console.log('Login detected. Proceeding with automation tasks...');
            // Your automation code here
    
            //await driver.get("https://www.figma.com/files");
            await driver.findElement(By.css('[data-testid="file-import-button"]')).click();
    
            const buttons = await driver.findElements(By.className("file_import_options--optionButton--IKg0M"));
            if (buttons.length > 0) {
                // Click the first button
                await buttons[0].click();
            } else {
                console.log("Button not found.");
            }
    
            //I WANT TO CLOSE DIALOG HERE!!!
    
            const fileInput = await driver.wait(until.elementLocated(By.xpath('/html/body/input')), 10000); // waits up to 10 seconds
    
            const filePath = "./test.fig"; // Adjust paths accordingly
            const absoluteFilePath = path.resolve(filePath);
    
            await fileInput.sendKeys(absoluteFilePath);
    
        } catch (error) {
            console.error('An error occurred:', error);
        }
    
    }

}

module.exports = SeleniumHandler;



import_base_file();