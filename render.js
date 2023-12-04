window.testFunction = () => {
    window.electronAPI.sendTestFunction();
};

window.init = () => {
    window.electronAPI.sendInit();
};

window.electronAPI.receiveMessage('loadPDF', (arg) => {
    loadPDF(arg)
});

function loadPDF(pdfPath) {
    const iframe = document.getElementById('pdfViewer');
    iframe.src = pdfPath;
};

document.addEventListener('DOMContentLoaded', () => {
    var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
        lineNumbers: true,
        mode: "javascript",
        extraKeys: { "Ctrl-Space": "autocomplete" },
    });
    editor.on("inputRead", function (cm, change) {
        if (!cm.state.completionActive && change.origin !== "+input") { // avoid opening autocomplete on every input
            cm.showHint({ completeSingle: false });
        }
    });
});