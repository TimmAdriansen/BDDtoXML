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

var editor = ace.edit("editor");
editor.setTheme("ace/theme/dracula");
editor.session.setMode("ace/mode/javascript");

window.electronAPI.receiveMessage('toggleTheme', (arg) => {
    if (arg === "light") {
        editor.setTheme("ace/theme/crimson_editor");
    } else {
        editor.setTheme("ace/theme/dracula");
    }
});