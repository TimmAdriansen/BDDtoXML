const monaco = require('monaco-editor');

function init() {
    monaco.editor.create(document.getElementById('editor'), {
        value: 'console.log("Hello, world!")',
        language: 'javascript'
    });
}

module.exports = init;