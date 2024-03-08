var editor = ace.edit("editor");
window.init = () => {
    window.electronAPI.sendMessage("init");
};

window.electronAPI.receiveMessage('loadPDF', (arg) => {
    loadPDF(arg)
});

function loadPDF(pdfPath) {
    const iframe = document.getElementById('pdfViewer');
    iframe.src = pdfPath;
};

window.electronAPI.receiveMessage('toggleTheme', (arg) => {
    if (arg === "light") {
        editor.setTheme("ace/theme/crimson_editor");
    } else {
        editor.setTheme("ace/theme/dracula");
    }
});

window.electronAPI.receiveMessage('setFigmaSource', (arg) => {
    let iframe = document.getElementById('figmaView');
    iframe.src = arg;
});

window.electronAPI.receiveMessage('showCredentialsModal', (arg) => {
    document.getElementById('credentialsModal').style.display = 'block';
});

function closeCredentialsModal() {
    document.getElementById('credentialsModal').style.display = 'none';
}

document.getElementById('loginButton').addEventListener('click', function () {
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    window.electronAPI.sendUsernamePassword(username, password);
    closeCredentialsModal();
});

document.getElementById('passwordInput').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default action (form submission, if any)
        document.getElementById('loginButton').click(); // Trigger the button click programmatically
    }
});

function showOverlay() {
    document.getElementById('overlay').style.display = 'block';
}

function hideOverlay() {
    document.getElementById('overlay').style.display = 'none';
}

function updateStatusBar(progress) {
    document.getElementById('statusBar').style.width = progress + '%';
}

window.electronAPI.receiveMessage('updateStatusBar', (arg) => {
    updateStatusBar(arg);
});

window.electronAPI.receiveMessage('hideOverlay', (arg) => {
    hideOverlay();
});

window.electronAPI.receiveMessage('showOverlay', (arg) => {
    showOverlay();
});

window.electronAPI.receiveMessage('setBDD', (arg) => {
    editor.setValue(arg);
});

window.electronAPI.receiveMessage('getBDD', (arg) => {
    window.electronAPI.sendMessage("saveBDD", editor.getValue());
});

window.electronAPI.receiveMessage('setTitle', (arg) => {
    document.title = arg;
});

window.onbeforeunload = (e) => {
    window.electronAPI.sendMessage("saveBDD", editor.getValue());
};

let timeoutId;
editor.getSession().on('change', function () {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => window.electronAPI.sendMessage("errorDetection", editor.getValue()), 500); // Update after a 500ms pause
});

window.electronAPI.receiveMessage('generateJSON', () => {
    window.electronAPI.sendMessage("errorDetection", editor.getValue())
});

window.electronAPI.receiveMessage('setErrorAnnotations', (arg) => {
    editor.getSession().setAnnotations(arg);
});