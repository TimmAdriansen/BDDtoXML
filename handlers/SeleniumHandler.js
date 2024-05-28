const { By, Key, until, Builder, Actions } = require("selenium-webdriver");
const chrome = require('selenium-webdriver/chrome');
require("chromedriver");

class SeleniumHandler {

    static driver;

    static async initDriver() {
        const chromeOptions = new chrome.Options();
        //chromeOptions.addArguments("--headless");
        //chromeOptions.addArguments("window-size=500x500");
        chromeOptions.addArguments('disable-infobars'); // Disables the "Chrome is being controlled by automated test software" notification
        chromeOptions.addArguments('--disable-extensions'); // Disables extensions to avoid pop-ups from them
        chromeOptions.addArguments('--disable-popup-blocking');
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

            //await sleep(5000);

            let emailField = await this.driver.wait(until.elementLocated(By.id('email')), 10000);
            await this.driver.wait(until.elementIsVisible(emailField), 10000);
            await emailField.sendKeys(username);

            let passwordField = await this.driver.wait(until.elementLocated(By.id('current-password')), 10000);
            await this.driver.wait(until.elementIsVisible(passwordField), 10000);
            await passwordField.sendKeys(password);

            let loginButton = await this.driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Log in')]")), 10000);
            await loginButton.click();

            await this.driver.wait(until.elementLocated(By.css('[data-testid="file-import-button"]')), 20000);

            return true;
        } catch (error) {
            console.log(error);
            await this.driver.takeScreenshot().then(
                function (image, err) {
                    require('fs').writeFileSync('screenshot.png', image, 'base64');
                }
            );
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

            return true;

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
            await this.driver.takeScreenshot().then(
                function (image, err) {
                    require('fs').writeFileSync('screenshot.png', image, 'base64');
                }
            );
            return false;
        }
    }

    static async renameFile(fileName) {
        try {

            let fileNameElement = await this.driver.wait(until.elementLocated(By.xpath("//span[@data-testid='filename' and contains(text(), 'Wireframe component template (Community)')]")), 50000);
            await this.driver.wait(until.elementIsVisible(fileNameElement), 5000);

            // Ensure element is visible and enabled, which generally covers 'clickable'
            await this.driver.wait(until.elementIsEnabled(fileNameElement), 5000);

            await fileNameElement.click();

            await this.driver.switchTo().activeElement().sendKeys(fileName, Key.RETURN);

            await sleep(3000); // Wait for the action to complete

            return await this.driver.getCurrentUrl();

            /*await this.driver.get("https://www.figma.com/files");

            let bodyElement = await this.driver.wait(until.elementLocated(By.css('body')), 10000);
            let childElements = await bodyElement.findElements(By.xpath(".//*"));

            await sleep(3000);

            let element = await loopElements(childElements, "Wireframe component template (Community)");

            let actions = this.driver.actions({ bridge: true });

            await sleep(3000);

            await actions.contextClick(element).perform();

            await sleep(3000);

            bodyElement = await this.driver.wait(until.elementLocated(By.css('body')), 50000);
            childElements = await bodyElement.findElements(By.xpath(".//*"));

            await sleep(3000);

            element = await loopElements(childElements, "Rename");

            await sleep(3000);

            await element.click();

            await sleep(3000);

            await this.driver.switchTo().activeElement().sendKeys(fileName, Key.RETURN);

            await sleep(3000);*/
        } catch (error) {
            console.log(error);
            await this.driver.takeScreenshot().then(
                function (image, err) {
                    require('fs').writeFileSync('screenshot.png', image, 'base64');
                }
            );
            return null;
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
            await this.driver.takeScreenshot().then(
                function (image, err) {
                    require('fs').writeFileSync('screenshot.png', image, 'base64');
                }
            );
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
            await this.driver.takeScreenshot().then(
                function (image, err) {
                    require('fs').writeFileSync('screenshot.png', image, 'base64');
                }
            );
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
            console.log(text)
            return element
        }
    }
}

async function printElements(childElements) {
    for (let element of childElements) {
        let text = await element.getText();

        if (text === "Rename") {
            return element;
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = SeleniumHandler;