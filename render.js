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

const modal = document.getElementById("urlModal");
const span = document.getElementsByClassName("close")[0];
const url = document.getElementById('urlInput');
const setUrlButton = document.getElementById('setUrlButton');

url.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default action (form submission, if any)
        setUrlButton.click(); // Trigger the button click programmatically
    }
});

span.onclick = function() {
    modal.style.display = "none";
}

document.getElementById('setUrlButton').addEventListener('click', () => {
    window.electronAPI.sendSetUrl(url.value);
    modal.style.display = "none";
});

window.electronAPI.receiveMessage('showUrlModal', (arg) => {
    modal.style.display = "block";
});

window.electronAPI.receiveMessage('setFigmaSource', (arg) => {
    let iframe = document.getElementById('figmaView');
    iframe.src = arg;
});