document.getElementById('newProject').addEventListener('click', () => {
    // Hide project selection buttons and show project name input
    document.querySelector('button#newProject').style.display = 'none';
    document.querySelector('button#existingProject').style.display = 'none';
    document.getElementById('newProjectName').style.display = 'block';
});

document.getElementById('createProject').addEventListener('click', () => {
    const projectName = document.getElementById('projectName').value;
    window.electronAPI.sendMessage('create-new-project', projectName);
});

document.getElementById('existingProject').addEventListener('click', () => {
    window.electronAPI.sendMessage('project-selection');
});