const { Given, When, Then } = require('@cucumber/cucumber');
const XMLHandler = require('../XMLHandler.js');
const OntologyHandler = require('../OntologyHandler.js');
const config = require('../setup.json');
const OntologyHandlerInstance = new OntologyHandler(config.ontologyFile);

Given('I go to {string}', function (string) {
    XMLHandler.addPage(OntologyHandlerInstance.getUIElements("#goTo"), string);
});

When('I select {string}', function (string) {
    console.log("I select string");
    console.log(OntologyHandlerInstance.getUIElements("#choose"));
});

When('I inform {string} and choose {string} in the field {string}', function (string, string2, string3) {
    console.log("I inform {string} and choose {string} in the field {string}");
    console.log(OntologyHandlerInstance.getUIElements("#typeAndChooseInTheField"));
});

When('I set {string} in the field {string}', function (string, string2) {
    console.log("I set {string} in the field {string}");
    console.log(OntologyHandlerInstance.getUIElements("#setInTheField"));
});

When('I submit {string}', function (string) {
    console.log("I submit {string}");
    console.log(OntologyHandlerInstance.getUIElements("#clickOn"));
});

Then('will be displayed {string}', function (string) {
    console.log("will be displayed {string}");
    console.log(OntologyHandlerInstance.getUIElements("#willBeDisplayed"));
});

When('I choose {string}', function (string) {
    console.log("I choose {string}");
    console.log(OntologyHandlerInstance.getUIElements("#choose"));
});

When('I choose the option of value {string} in the field {string}', function (string, string2) {
    console.log("I choose the option of value {string} in the field {string}");
    console.log(OntologyHandlerInstance.getUIElements("#chooseTheOptionOfValueInTheField"));
});

Given('{string} is displayed', function (string) {
    console.log("{string} is displayed");
    console.log(OntologyHandlerInstance.getUIElements("#isDisplayed"));
});

When('I click on {string}', function (string) {
    console.log("I click on {string}");
    console.log(OntologyHandlerInstance.getUIElements("#clickOn"));
});

Then('will be displayed {string} in the dialog box', function (string) {
    console.log("will be displayed {string} in the dialog box");
    console.log(OntologyHandlerInstance.getUIElements("#willBeDisplayedInTheDialogBox"));
});

When('I confirm the dialog box', function () {
    console.log("I confirm the dialog box");
    console.log(OntologyHandlerInstance.getUIElements("#confirmTheDialogBox"));
});

When('I click on {string} referring to {string}', function (string, string2) {
    console.log("I click on {string} referring to {string}");
    console.log(OntologyHandlerInstance.getUIElements("#clickOnReferringTo"));
});