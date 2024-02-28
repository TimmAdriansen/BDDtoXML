const WidgetHandler = require("./WidgetHandler.js")

class EditorHandler {

    static errorDetection(input) {
        const tasks = [];
        const errors = [];
        const lines = input.split('\n');

        lines.forEach((line, lineNumber) => {
            line = line.trim();
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
        });

        return { tasks, errors };
    }

    static updateEditorAnnotations(input) {
        const { tasks, errors } = this.errorDetection(input);

        /*const annotations = errors.map(error => ({
            row: error.lineNumber,
            column: 0, // You can adjust this based on actual error position if available
            text: error.text, // Error message
            type: error.type // Also can be "warning" or "info"
        }));*/

        const annotations = [{
            row: 0, // The zero-based row index where the annotation should appear
            column: 0, // The column index where the annotation should start
            text: "Example error message", // The message for the annotation
            type: "error" // The type of the annotation (can also be "warning" or "info")
        }];

        return annotations;
    }
}

module.exports = EditorHandler;
