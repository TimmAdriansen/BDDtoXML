const { By, Key, until, Builder } = require("selenium-webdriver");
require("chromedriver");
const path = require('path');

class SeleniumHandler {

    static async login(username, password) {
        let driver = await new Builder().forBrowser('chrome').build();
        try {
            // Open Figma login page
            await driver.get("https://www.figma.com/login");

            // Wait for the email input to be present and visible
            await driver.wait(until.elementLocated(By.id('email')), 10000); // Waits up to 10 seconds
            await driver.findElement(By.id('email')).sendKeys(username); // Replace with your actual email

            // Wait for the password input to be present and visible
            await driver.wait(until.elementLocated(By.id('current-password')), 10000); // Waits up to 10 seconds
            await driver.findElement(By.id('current-password')).sendKeys(password); // Replace with your actual password

            // Wait for the login button to be clickable and then click it
            let loginButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Log in')]")), 10000);
            await loginButton.click();

            // Optionally, add a wait here to ensure the login has been processed and you've navigated to the next page or a login confirmation element is visible

            console.log("Login successful.");
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        }
    }

    async startPlugin() {

    }

    async createInteractions() {

    }

    async copyTemplate() {
        await driver.get("https://www.figma.com/community/file/1336027068808915351/wireframe-component-template");
    }

    async renameFile() {

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



//import_base_file();