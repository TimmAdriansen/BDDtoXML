const DslSpecificationHandler = require("./DslSpecificationHandler.js");

class EditorHandler {

    static pages = {
        "BrowserWindows": []
    };

    static tryToGenerate = false;
    static canGenerate = false;

    static errorDetection(input) {
        const lines = input.split('\n');

        const { scenarios, errors } = this.getScenarios(input);

        this.pages = {
            "BrowserWindows": []
        };


        /*console.log(errors);
        console.log(scenarios);


        scenarios.forEach(scenario => {
            console.log(`Scenario: ${scenario.name}`);
            scenario.steps.forEach(step => {
                console.log(`Step: ${step.type} ${step.content}, ${step.line}`);
                let lineNumber = step.line;
                //errors.push({ lineNumber, text: `Cannot start line with j`, type: "error" });
            });
        });*/

        let lastMethodCalled = null;
        let item = null;
        let currentPage = null
        let hasGivens = false;
        let hasWhens = false;
        let hasThens = false;

        scenarios.forEach(scenario => {
            DslSpecificationHandler.resetConditions();
            let stepCount = 0;
            scenario.steps.forEach(step => {
                stepCount++;
                switch (step.type) {
                    case "Given":
                        if (hasWhens || hasThens) {
                            errors.push({ lineNumber: step.line, text: "Given statements must be before When and Then", type: "error" });
                            return;
                        }
                        item = DslSpecificationHandler.testGiven(step.content, currentPage);
                        lastMethodCalled = DslSpecificationHandler.testGiven;
                        hasGivens = true;
                        break;
                    case "When":
                        if (!hasGivens) {
                            errors.push({ lineNumber: step.line, text: "Missing Given statements", type: "error" });
                            return;
                        }
                        if (hasWhens) {
                            errors.push({ lineNumber: step.line, text: "Only one When statement is allowed", type: "error" });
                            return;
                        }
                        if (hasThens) {
                            errors.push({ lineNumber: step.line, text: "When statements must be before Then", type: "error" });
                            return;
                        }
                        item = DslSpecificationHandler.testWhen(step.content, currentPage);
                        lastMethodCalled = DslSpecificationHandler.testWhen;
                        hasWhens = true;
                        break;
                    case "Then":
                        if (!hasGivens || !hasWhens) {
                            errors.push({ lineNumber: step.line, text: "Missing Given or When statements", type: "error" });
                            return;
                        }
                        item = DslSpecificationHandler.testThen(step.content, currentPage);
                        lastMethodCalled = DslSpecificationHandler.testThen;
                        hasThens = true;
                        break;
                    case "And":
                        if (lastMethodCalled) {
                            if (lastMethodCalled == DslSpecificationHandler.testGiven) {
                                if (hasWhens || hasThens) {
                                    errors.push({ lineNumber: step.line, text: "Given statements must be before When and Then", type: "error" });
                                    return;
                                }
                            }
                            if (lastMethodCalled == DslSpecificationHandler.testWhen) {
                                if (!hasGivens) {
                                    errors.push({ lineNumber: step.line, text: "Missing Given statements", type: "error" });
                                    return;
                                }
                                if (hasWhens) {
                                    errors.push({ lineNumber: step.line, text: "Only one When statement is allowed", type: "error" });
                                    return;
                                }
                                if (hasThens) {
                                    errors.push({ lineNumber: step.line, text: "When statements must be before Then", type: "error" });
                                    return;
                                }
                            }
                            if (lastMethodCalled == DslSpecificationHandler.testThen) {
                                if (!hasGivens || !hasWhens) {
                                    errors.push({ lineNumber: step.line, text: "Missing Given or When statements", type: "error" });
                                    return;
                                }
                            }
                            item = lastMethodCalled(step.content, currentPage);
                        }
                        break;
                }

                /*if(stepCount == 1){
                    if(item.widget !== 'BrowserWindow' || item.widget !== 'ModalWindow' || item.widget !== 'WindowDialog' || item.widget !== 'Notification'){
                        errors.push({lineNumber: step.line, text: "First step has to define BrowserWindow or type of ModalWindow", type: "error"});
                        return;
                    }
                }*/

                if (typeof item === 'string' || item instanceof String) {
                    errors.push({ lineNumber: step.line, text: item, type: "error" });
                    item = null;
                    this.canGenerate = false;
                    return;
                }

                if (!this.tryToGenerate || !this.canGenerate) {
                    return;
                }

                //console.log(step.content);
                //console.log(item);

                if (item.widget === 'BrowserWindow') {
                    //currentPage = item.id;
                    //console.log(this.pages);
                    /*if (!item.actions) {
                        //console.log(item.id)
                        item.actions = [];
                    }*/
                    let browserWindow = this.browserWindowExists(item.id)
                    if (!browserWindow) {
                        //console.log(item.id);
                        this.pages.BrowserWindows.push({
                            page: item.id, // Use item.id as the name of the BrowserWindow
                            widgets: [], // Initialize an empty array for widgets
                            actions: item.actions
                        });
                    } else {
                        item.actions.forEach(action => {
                            browserWindow.actions.push(action);
                        })
                    }
                    if (step.type === "Given" || step.type === "Then") {
                        currentPage = item.id;
                    }
                    //console.log(item.id);
                    //console.log(item.actions);
                    return;
                }

                if (currentPage === null) {
                    if (!this.browserWindowExists('Name Not Specified')) {
                        this.pages.BrowserWindows.push({
                            page: 'Name Not Specified', // Use item.id as the name of the BrowserWindow
                            widgets: [] // Initialize an empty array for widgets
                        });
                        currentPage = 'Name Not Specified';
                    }
                }

                const browserWindow = this.pages.BrowserWindows.find(bw => bw.page === currentPage);

                //console.log(item);
                /*if (item.actions) {
                    item.actions.forEach(action => {
                        console.log(action.conditions);
                        action.conditions.forEach(condition => {
                            condition.params.id = currentPage + ":" + condition.params.id;
                        })
                    })
                }*/

                //const widgetExists = browserWindow.widgets.some(widget => widget.id === item.id);

                let idToCheck = item.id;

                if (item.widgets != null && item.widgets.length > 0) {
                    idToCheck = item.widgets[0].id;
                }
                //console.log(idToCheck);

                let existingWidget = findWidgetById(idToCheck, browserWindow.widgets);

                if (item.id != idToCheck && !existingWidget) {
                    existingWidget = findWidgetById(item.id, browserWindow.widgets);
                }
                if (!existingWidget) {
                    browserWindow.widgets.push(item);
                    //console.log(item.widget);
                    //console.log(item.id);
                    //console.log(item.actions);
                } else {
                    if (existingWidget.id == item.id) {
                        updateWidget(existingWidget, item);
                    } else{
                        updateWidget(existingWidget, item.widgets[0]);
                    }
                    //update the widget here!!!
                    /*for (const key in item) {
                        if (key === "actions") {
                            existingWidget[key] = existingWidget[key].concat(...item[key]);
                        } else if (key === "widgets") {
                            item[key].forEach(widget => {
                                let nestedWidget = findWidgetById(widget.id, existingWidget[key]);
                                if (!nestedWidget) {
                                    existingWidget[key].push(widget);
                                } else {
                                    for (const key2 in widget) {
                                        if (key2 === "actions") {
                                            nestedWidget[key2] = nestedWidget[key2].concat(...widget[key2]);
                                        } else {
                                            nestedWidget[key2] = widget[key2];
                                        }
                                    }
                                }
                            })
                        } else {
                            existingWidget[key] = item[key];
                        }
                    }*/
                    //console.log(item.widget);
                    //console.log(item.id);
                    //console.log(item.actions);
                }

                /*if (!widgetExists) {
                    browserWindow.widgets.push(item);
                }*/
            });

            lastMethodCalled = null;
            item = null;
            currentPage = null
            hasGivens = false;
            hasWhens = false;
            hasThens = false;

        });

        /*lines.forEach((line, lineNumber) => {
            line = line.trim();
            let words = line.split(/\s+/);

            if (words[0] == "Scenario:") {
                errors.push({ lineNumber, text: "mega fejl bror", type: "error" });
            }
            if (line.startsWith('#') || line.length === 0) return;

            if (line.startsWith('task ')) {
                const taskDescription = line.substring(5).trim();
                if (taskDescription.length === 0) {
                    errors.push({ lineNumber, text: "Task description is empty", type: "error" });
                } else {
                    tasks.push({ description: taskDescription, lineNumber });
                }
            } else {
                errors.push({ lineNumber, text: "Line does not start with expected 'task ' keyword", type: "error" });
            }
        });*/

        //logPagesAndWidgets(this.pages);

        return { scenarios, errors };
    }

    static getScenarios(input) {
        const lines = input.split('\n');
        let scenarios = [];
        let currentScenario = null;
        let errors = [];

        lines.forEach((line, lineNumber) => {
            line = line.trim();
            let words = line.split(/\s+/);

            if (words[0] === 'Scenario:') {
                if (words.length < 2) {
                    errors.push({ lineNumber, text: "Scenario name missing", type: "error" });
                } else {
                    // Start a new scenario
                    currentScenario = {
                        name: words.slice(1).join(' '),
                        steps: [],
                        startLine: lineNumber
                    };
                    scenarios.push(currentScenario);
                }
            } else if (DslSpecificationHandler.scenarioKeywords.includes(words[0])) {
                if (currentScenario === null) {
                    errors.push({ lineNumber, text: `'${words[0]}' statement outside a scenario`, type: "error" });
                } else if (currentScenario.steps.length == 0 && words[0] === "And") {
                    errors.push({ lineNumber, text: `Can't start with '${words[0]}'`, type: "error" });
                } else {
                    currentScenario.steps.push({
                        type: words[0],
                        content: words.slice(1).join(' '),
                        line: lineNumber
                    });
                }
            } else if ([''].includes(words[0].toLowerCase())) {
                currentScenario = null;
            } else {
                errors.push({ lineNumber, text: `Cannot start line with '${words[0]}' `, type: "error" });
            }
        });

        return { scenarios, errors };
    }


    static updateEditorAnnotations(input) {
        const { scenarios, errors } = this.errorDetection(input);

        const annotations = errors.map(error => ({
            row: error.lineNumber,
            column: 0, // You can adjust this based on actual error position if available
            text: error.text, // Error message
            type: error.type // Also can be "warning" or "info"
        }));

        /*const annotations = [{
            row: 0, // The zero-based row index where the annotation should appear
            column: 0, // The column index where the annotation should start
            text: "Example error message", // The message for the annotation
            type: "error" // The type of the annotation (can also be "warning" or "info")
        }];*/

        return annotations;
    }

    static browserWindowExists(pageName) {
        return this.pages.BrowserWindows.find(browserWindow => browserWindow.page === pageName);
    }
}

function widgetExistsInPage(widgetId, widgets) {
    // Check if the widget ID exists in the current level of widgets
    for (const widget of widgets) {
        if (widget.id === widgetId) {
            return true;
        }
        // If the current widget has nested widgets, recursively search within them
        if (widget.widgets && widgetExistsInPage(widgetId, widget.widgets)) {
            return true;
        }
    }
    // If we reach here, it means the widget ID does not exist at this level or any nested level
    return false;
}

function findWidgetById(widgetId, widgets) {
    // Search for the widget by ID in the current list of widgets
    for (const widget of widgets) {
        //console.log(widget);
        // If the widget ID matches, return the widget object
        if (widget.id === widgetId) {
            console.log(widget)
            return widget;
        }
        // If the current widget has nested widgets, recursively search within them
        if (widget.widgets) {
            const foundWidget = findWidgetById(widgetId, widget.widgets);
            if (foundWidget) {
                return foundWidget;
            }
        }
    }
    // If we reach here, it means the widget ID does not exist at this level or any nested level
    return null;
}

function updateWidget(existingWidget, newWidget) {
    for (const key in newWidget) {
        if (key === "actions") {
            // Concatenate actions
            existingWidget[key] = existingWidget[key].concat(...newWidget[key]);
        } else if (key === "widgets" && newWidget[key]) {
            // Recursively update nested widgets
            newWidget[key].forEach(widget => {
                let nestedWidget = findWidgetById(widget.id, existingWidget[key]);
                if (!nestedWidget) {
                    existingWidget[key].push(widget);
                } else {
                    updateWidget(nestedWidget, widget);
                }
            });
        } else if (key === "properties" && newWidget[key]) {
            // Update or add properties
            newWidget[key].forEach(newProp => {
                let propFound = false;
                for (let i = 0; i < existingWidget[key].length; i++) {
                    let existingProp = existingWidget[key][i];
                    if (Object.keys(existingProp)[0] === Object.keys(newProp)[0]) {
                        // Update existing property
                        //existingWidget[key][i] = newProp;
                        propFound = true;
                        break;
                    }
                }
                if (!propFound) {
                    // Add new property if not found
                    existingWidget[key].push(newProp);
                }
            });
        } else {
            // Update other properties
            existingWidget[key] = newWidget[key];
        }
    }
}

function logPagesAndWidgets(pages) {
    console.log(pages);
    pages.BrowserWindows.forEach((browserWindow) => {
        console.log(`Page: ${browserWindow.name}`);
        if (browserWindow.widgets.length > 0) {
            browserWindow.widgets.forEach((widget, index) => {
                console.log(` Widget ${index + 1}: Type - ${widget.widget}, ID - ${widget.id}`);
            });
        } else {
            console.log(' No widgets');
        }
    });
}


module.exports = EditorHandler;
