import { Given, When, Then } from '@cucumber/cucumber'
import { XMLHandler } from '../XMLHandler.js';
import { OntologyHandler } from '../OntologyHandler.js';
import config from '../setup.json' assert { type: 'json' };

const OntologyHandlerInstance = new OntologyHandler(config.ontologyFile);

Given('the user is on the {string} page', function (string) {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});

When('the user enters a valid username and password', function () {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});

When('the user clicks on the login button', function () {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});

Then('the user should be redirected to their dashboard', function () {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});