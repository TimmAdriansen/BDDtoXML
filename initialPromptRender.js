document.getElementById('createProject').addEventListener('click', () => {
    const projectName = document.getElementById('projectName').value.trim();
    const folderPath = document.getElementById('folderPathInput').value.trim();

    if (!projectName || !folderPath) {
        alert('Both project name and folder path are required.');
        return;
    }

    window.electronAPI.sendMessage('create-new-project', projectName, folderPath);
});

document.getElementById('chooseExisting').addEventListener('click', () => {
    window.electronAPI.sendMessage('project-selection');
});

document.getElementById('folderPathInput').addEventListener('click', () => {
    window.electronAPI.sendMessage('open-folder-dialog');
});

window.electronAPI.receiveMessage('folder-selected', (path) => {
    document.getElementById('folderPathInput').value = path ? path : 'Click to choose folder';
});