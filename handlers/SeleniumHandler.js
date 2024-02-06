const { By, Key, until, Builder, Actions } = require("selenium-webdriver");
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
        //chromeOptions.addArguments("--headless");
        //chromeOptions.addArguments("window-size=500x500");
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

            await this.driver.wait(until.elementLocated(By.id('email')), 20000);
            await this.driver.findElement(By.id('email')).sendKeys(username);

            await this.driver.wait(until.elementLocated(By.id('current-password')), 20000);
            await this.driver.findElement(By.id('current-password')).sendKeys(password);

            let loginButton = await this.driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Log in')]")), 20000);
            await loginButton.click();

            await this.driver.wait(until.elementLocated(By.css('[data-testid="file-import-button"]')), 20000);

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async startPlugin() {

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

    static async renameFile(fileName) {
        try {
            await this.driver.get("https://www.figma.com/files");

            let bodyElement = await this.driver.wait(until.elementLocated(By.css('body')), 10000);
            let childElements = await bodyElement.findElements(By.xpath(".//*"));

            let element = await loopElements(childElements, "Wireframe component template (Community)");

            let actions = this.driver.actions({ bridge: true });

            await actions.contextClick(element).perform();

            bodyElement = await this.driver.wait(until.elementLocated(By.css('body')), 10000);
            childElements = await bodyElement.findElements(By.xpath(".//*"));

            element = await loopElements(childElements, "Rename");

            await element.click();

            await sleep(1000);

            await this.driver.switchTo().activeElement().sendKeys(fileName, Key.RETURN);

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    static async exportAsPdf(url) {
        let bool = false;
        try {
            await this.driver.get(url);

            const button = await this.driver.wait(until.elementLocated(By.id("toggle-menu-button")), 10000);
            await button.click();

            let parentDiv = await this.driver.wait(
                until.elementLocated(By.xpath('//div[@role="none"]')),
                10000
            );

            let childElements = await parentDiv.findElements(By.xpath(".//*"));

            let element = await loopElements(childElements, "File");

            await element.click();

            const bodyElement = await this.driver.wait(until.elementLocated(By.css('body')), 10000);
            childElements = await bodyElement.findElements(By.xpath(".//*"));

            element = await loopElements(childElements, "Export frames to PDF…");

            await element.click();

            await sleep(5000);

            bool = true;
        } catch (error) {
            console.log(error);
            bool = false;
        } finally {
            await this.closeDriver();
            return bool;
        }
    }

    static async exportAsFig(url) {
        let bool = false;
        try {
            await this.driver.get(url);

            const button = await this.driver.wait(until.elementLocated(By.id("toggle-menu-button")), 10000);
            await button.click();

            let parentDiv = await this.driver.wait(
                until.elementLocated(By.xpath('//div[@role="none"]')),
                10000
            );

            let childElements = await parentDiv.findElements(By.xpath(".//*"));

            let element = await loopElements(childElements, "File");

            await element.click();

            const bodyElement = await this.driver.wait(until.elementLocated(By.css('body')), 10000);
            childElements = await bodyElement.findElements(By.xpath(".//*"));

            element = await loopElements(childElements, "Save local copy…");

            await element.click();

            await sleep(5000);

            /*let printElement = await printElements(childElements);

            console.log(await printElement.getText())

            printElement.click();*/
            /*
            parentDiv = await this.driver.wait(
                until.elementLocated(By.xpath('//div[@role="none"]')),
                10000
            );

            childElements = await parentDiv.findElements(By.xpath(".//*"));

            element = await loopElements(childElements, "Save local copy");

            await element.click();

            /*

            parentDiv = await this.driver.wait(
                until.elementLocated(By.xpath('//div[@role="none"]')),
                10000
            );

            childElements = await parentDiv.findElements(By.xpath(".//*"));

            element = await loopElements(childElements, "Save local copy...");

            await element.click();*/

            bool = true;
        } catch (error) {
            console.log(error);
            bool = false;
        } finally {
            await this.closeDriver();
            return bool;
        }
    }

}

async function loopElements(childElements, searchString) {
    for (let element of childElements) {
        let text = await element.getText();

        if (text === searchString) {
            return element
        }
    }
}

async function printElements(childElements) {
    for (let element of childElements) {
        let text = await element.getText();

        if (text === "Wireframe component template (Community)") {
            return element;
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = SeleniumHandler;