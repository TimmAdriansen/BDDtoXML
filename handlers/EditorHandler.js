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
        let result = null;
        let currentPage = null

        let i = 0;

        scenarios.forEach(scenario => {
            scenario.steps.forEach(step => {

                switch (step.type) {
                    case "Given":
                        result = DslSpecificationHandler.testGiven(step.content, currentPage);
                        lastMethodCalled = DslSpecificationHandler.testGiven;
                        break;
                    case "When":
                        result = DslSpecificationHandler.testWhen(step.content, currentPage);
                        lastMethodCalled = DslSpecificationHandler.testWhen;
                        break;
                    case "Then":
                        result = DslSpecificationHandler.testThen(step.content, currentPage);
                        lastMethodCalled = DslSpecificationHandler.testThen;
                        break;
                    case "And":
                        if (lastMethodCalled) result = lastMethodCalled(step.content, currentPage);
                        break;
                }

                if (typeof result === 'string' || result instanceof String) {
                    errors.push({ lineNumber: step.line, text: result, type: "error" });
                    result = null;
                    this.canGenerate = false;
                    return;
                }

                if (!this.tryToGenerate || !this.canGenerate) {
                    return;
                }

                let isContainerPresent = result.some(widget =>
                    widget.widget === 'FieldSet' ||
                    widget.widget === 'Menu' ||
                    widget.widget === 'ListBox' ||
                    widget.widget === 'DropdownList' ||
                    widget.widget === 'ModalWindow' ||
                    widget.widget === 'WindowDialog'
                );

                if (isContainerPresent) {
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

                    // Process all container widgets
                    result.forEach(container => {
                        if (['FieldSet', 'Menu', 'ListBox', 'DropdownList', 'ModalWindow', 'WindowDialog'].includes(container.widget)) {
                            // Filter out the current container from its own widgets list
                            let newWidgets = result.filter(widget => widget.id !== container.id);

                            // Check if the container already exists and update or add
                            const existingContainerIndex = browserWindow.widgets.findIndex(widget => widget.id === container.id);
                            if (existingContainerIndex !== -1) {
                                // Append new widgets to existing container
                                let existingContainer = browserWindow.widgets[existingContainerIndex];
                                newWidgets.forEach(newWidget => {
                                    // Ensure we're not adding duplicates
                                    let existingWidget = existingContainer.widgets.find(w => w.id === newWidget.id);
                                    if (newWidget.actions) {
                                        //console.log(newWidget.actions);
                                    }
                                    if (!existingWidget) {
                                        existingContainer.widgets.push(newWidget);
                                    } else {
                                        if (!newWidget.actions) {
                                            newWidget.actions = [];
                                        }
                                        if (!existingWidget.actions) {
                                            existingWidget.actions = [];
                                        }
                                        newWidget.actions.forEach(action => {
                                            existingWidget.actions.push(action);
                                        });
                                    }
                                });
                            } else {
                                // Add new container
                                container.widgets = newWidgets; // Assign filtered widgets to the new container
                                container.widgets.forEach(widget => {
                                    //console.log(widget);
                                    if (widget.actions) {
                                        widget.actions.forEach(action => {
                                            //console.log(action);
                                        })
                                    }
                                })
                                browserWindow.widgets.push(container);
                            }
                        }
                    });

                    return;
                }

                result.forEach(item => {
                    i++;
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

                    if (!widgetExistsInPage(item.id, browserWindow.widgets)) {
                        browserWindow.widgets.push(item);
                    } else {
                        //update the widget here!!!'
                        //console.log(item.widget);
                        //console.log(item.id);
                        //console.log(item.actions);
                    }

                    /*if (!widgetExists) {
                        browserWindow.widgets.push(item);
                    }*/
                });
            });
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
