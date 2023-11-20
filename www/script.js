let dropArea = document.getElementById('drop_area');

dropArea.addEventListener('dragover', (event) => {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    dropArea.classList.add('over');
});

dropArea.addEventListener('dragleave', (event) => {
    dropArea.classList.remove('over');
});

dropArea.addEventListener('drop', (event) => {
    event.stopPropagation();
    event.preventDefault();
    dropArea.classList.remove('over');

    let files = event.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
        console.log(files[i].type);
        if (files[i].type !== 'text/plain') {
            alert('Only Cucumber feature files are allowed!');
            continue;
        }

        // Process the file here. For example, read its contents or upload it to a server.
        // ...
    }
});
