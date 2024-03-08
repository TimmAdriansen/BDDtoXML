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
                        result = DslSpecificationHandler.testGiven(step.content);
                        lastMethodCalled = DslSpecificationHandler.testGiven;
                        break;
                    case "When":
                        result = DslSpecificationHandler.testWhen(step.content);
                        lastMethodCalled = DslSpecificationHandler.testWhen;
                        break;
                    case "Then":
                        result = DslSpecificationHandler.testGiven(step.content);
                        lastMethodCalled = DslSpecificationHandler.testGiven;
                        break;
                    case "And":
                        if (lastMethodCalled) result = lastMethodCalled(step.content);
                        break;
                }

                if (typeof result === 'string' || result instanceof String) {
                    errors.push({ lineNumber: step.line, text: result, type: "error" });
                    result = null;
                    this.canGenerate = false;
                    return;
                }

                if(!this.tryToGenerate || !this.canGenerate){
                    return;
                }

                result.forEach(item => {
                    i++;
                    console.log(i);
                    if (item.widget === 'BrowserWindow') {
                        //currentPage = item.id;
                        //console.log(currentPage);
                        if (!this.browserWindowExists(item.id)) {
                            this.pages.BrowserWindows.push({
                                page: item.id, // Use item.id as the name of the BrowserWindow
                                widgets: [] // Initialize an empty array for widgets
                            });
                        }
                        if (step.type === "Given") {
                            currentPage = item.id;
                        }
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

                    const widgetExists = browserWindow.widgets.some(widget => widget.id === item.id);

                    if (!widgetExists) {
                        browserWindow.widgets.push(item);
                    }
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

    static browserWindowExists(name) {
        return this.pages.BrowserWindows.some(browserWindow => browserWindow.name === name);
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
