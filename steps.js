import { Given, When, Then } from '@cucumber/cucumber'
import { XMLHandler } from '../XMLHandler.js';
import { OntologyHandler } from '../OntologyHandler.js';
import config from '../setup.json' assert { type: 'json' };

const XMLHandlerInstance = new XMLHandler();
const OntologyHandlerInstance = new OntologyHandler(config.ontologyFile);

Given('I go to {string}', function (string) {
    console.log(OntologyHandlerInstance.getUIElements("#goTo"));
});

When('I select {string}', function (string) {
    console.log(OntologyHandlerInstance.getUIElements("#choose"));
});

When('I inform {string} and choose {string} in the field {string}', function (string, string2, string3) {
    console.log(OntologyHandlerInstance.getUIElements("#typeAndChooseInTheField"));
});

When('I set {string} in the field {string}', function (string, string2) {
    console.log(OntologyHandlerInstance.getUIElements("#setInTheField"));
});

When('I submit {string}', function (string) {
    console.log(OntologyHandlerInstance.getUIElements("#clickOn"));
});

Then('will be displayed {string}', function (string) {
    console.log(OntologyHandlerInstance.getUIElements("#willBeDisplayed"));
});

When('I choose {string}', function (string) {
    console.log(OntologyHandlerInstance.getUIElements("#choose"));
});

When('I choose the option of value {string} in the field {string}', function (string, string2) {
    console.log(OntologyHandlerInstance.getUIElements("#chooseTheOptionOfValueInTheField"));
});

Given('{string} is displayed', function (string) {
    console.log(OntologyHandlerInstance.getUIElements("#isDisplayed"));
});

When('I click on {string}', function (string) {
    console.log(OntologyHandlerInstance.getUIElements("#clickOn"));
});

Then('will be displayed {string} in the dialog box', function (string) {
    console.log(OntologyHandlerInstance.getUIElements("#willBeDisplayedInTheDialogBox"));
});

When('I confirm the dialog box', function () {
    console.log(OntologyHandlerInstance.getUIElements("#confirmTheDialogBox"));
});

When('I click on {string} referring to {string}', function (string, string2) {
    console.log(OntologyHandlerInstance.getUIElements("#clickOnReferringTo"));
});