const { By, Key, until, Builder } = require("selenium-webdriver");
const chrome = require('selenium-webdriver/chrome');
require("chromedriver");
const path = require('path');
const fs = require('fs');
const jsonFile = "../setup.json";
const config = require(jsonFile);

const { clipboard } = require('electron');

class SeleniumHandler {

    static driver;

    static async initDriver() {
        const chromeOptions = new chrome.Options();
        chromeOptions.addArguments("--headless");
        this.driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
    }

    static async closeDriver() {
        if (this.driver) {
            await this.driver.quit();
        }
    }

    static async login(username, password) {
        try {
            await this.initDriver();

            await this.driver.get("https://www.figma.com/login");

            await this.driver.wait(until.elementLocated(By.id('email')), 10000);
            await this.driver.findElement(By.id('email')).sendKeys(username);

            await this.driver.wait(until.elementLocated(By.id('current-password')), 10000);
            await this.driver.findElement(By.id('current-password')).sendKeys(password);

            let loginButton = await this.driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Log in')]")), 10000);
            await loginButton.click();

            await this.driver.wait(until.elementLocated(By.css('[data-testid="file-import-button"]')), 10000);

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async startPlugin() {

    }

    async createInteractions() {

    }

    static async copyTemplate() {
        try {
            await this.driver.get("https://www.figma.com/community/file/1336027068808915351/wireframe-component-template");

            const button = this.driver.wait(until.elementLocated(By.css('[data-testid="community-duplicate-button"]')), 10000);
            await button.click();

            await this.driver.sleep(2000);

            const windowHandles = await this.driver.getAllWindowHandles();

            await this.driver.switchTo().window(windowHandles[windowHandles.length - 1]);

            return await this.driver.getCurrentUrl();

            /*

            const overlay = this.driver.wait(until.elementLocated(By.css('.fullscreen_view--filebar--FYjSm')), 10000);
            await this.driver.wait(until.stalenessOf(overlay), 10000);

            const shareButton = this.driver.wait(until.elementLocated(By.css('[data-testid="multiplayer-toolbar-share-button"]')), 10000);
            await shareButton.click();

            const copyLinkButton = this.driver.wait(until.elementLocated(By.css('.permissions_modal--copyIconBase--1h3x-')), 10000);
            await copyLinkButton.click();

            return clipboard.readText();*/
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async renameFile() {

    }

    static async exportAsPdf() {
        let bool = false;
        try {
            config.figmaSrc
            bool = true;
        } catch (error) {
            console.log(error);
            bool = false;
        } finally {
            await this.closeDriver();
            return bool;
        }
    }

    static async exportAsFig() {
        let bool = false;
        try {
            bool = true;
        } catch (error) {
            console.log(error);
            bool = false;
        } finally {
            await this.closeDriver();
            return bool;
        }
    }

    static async exportAsLink() {
        let bool = false;
        try {
            bool = true;
        } catch (error) {
            console.log(error);
            bool = false;
        } finally {
            await this.closeDriver();
            return bool;
        }
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