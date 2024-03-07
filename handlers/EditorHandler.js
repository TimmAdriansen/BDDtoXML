const DslSpecificationHandler = require("./DslSpecificationHandler.js");

class EditorHandler {

    static errorDetection(input) {
        //const tasks = [];
        //let errors = [];
        const lines = input.split('\n');

        const { scenarios, errors } = this.getScenarios(input);


        /*console.log(errors);
        console.log(scenarios);


        scenarios.forEach(scenario => {
            console.log(`Scenario: ${scenario.name}`);
            scenario.steps.forEach(step => {
                console.log(`Step: ${step.type} ${step.content}, ${step.line}`);
                let lineNumber = step.line;
                //errors.push({ lineNumber, text: `Cannot start line with cunt`, type: "error" });
            });
        });*/

        let lastMethodCalled = null;
        let errorString = null;

        scenarios.forEach(scenario => {
            scenario.steps.forEach(step => {

                switch (step.type) {
                    case "Given":
                        errorString = DslSpecificationHandler.testGiven(step.content);
                        lastMethodCalled = DslSpecificationHandler.testGiven;
                        break;
                    case "When":
                        errorString = DslSpecificationHandler.testWhen(step.content);
                        lastMethodCalled = DslSpecificationHandler.testWhen;
                        break;
                    case "Then":
                        errorString = DslSpecificationHandler.testWhen(step.content);
                        lastMethodCalled = DslSpecificationHandler.testWhen;
                        break;
                    case "And":
                        if (lastMethodCalled)  errorString = lastMethodCalled(step.content);
                        break;
                }

                if (errorString != null) {
                    errors.push({ lineNumber: step.line, text: errorString, type: "error" });
                    errorString = null;
                }
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

            // Check if the line starts a new scenario
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
}

module.exports = EditorHandler;
