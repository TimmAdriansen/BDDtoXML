var editor = ace.edit("editor");
const tabsContainer = document.querySelector('.tabs-container');
const tabs = [];
let previousTab = null;
let activeTab = null;

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

window.electronAPI.receiveMessage('showNewFileModal', (arg) => {
    document.getElementById('newFileModal').style.display = 'block';
});

function closeNewFileModal() {
    document.getElementById('newFileModal').style.display = 'none';
}

document.getElementById('createFileNameButton').addEventListener('click', function () {
    const fileName = document.getElementById('pageNameInput').value;
    window.electronAPI.sendMessage("createFile", fileName)
    closeNewFileModal();
});

document.getElementById('pageNameInput').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default action (form submission, if any)
        document.getElementById('createFileNameButton').click(); // Trigger the button click programmatically
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
    window.electronAPI.sendMessage("saveBDD", activeTab, editor.getValue());
});

window.electronAPI.receiveMessage('setTitle', (arg) => {
    document.title = arg;
});

window.onbeforeunload = (e) => {
    window.electronAPI.sendMessage("saveBDD", activeTab, editor.getValue());
};

let timeoutId;
editor.getSession().on('change', function () {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => window.electronAPI.sendMessage("errorDetection", editor.getValue()), 500); // Update after a 500ms pause
});

window.electronAPI.receiveMessage('generateJSON', () => {
    window.electronAPI.sendMessage("saveBeforeGenerating", activeTab, editor.getValue())
});

window.electronAPI.receiveMessage('setErrorAnnotations', (arg) => {
    editor.getSession().setAnnotations(arg);
});

window.electronAPI.receiveMessage('addTab', (arg) => {
    addTab(arg);
});

// Function to add a new tab
function addTab(fileName) {
    // Check if the tab already exists
    if (tabs.includes(fileName)) {
        // If the tab exists, switch to it
        setActiveTab(fileName);
        return; // Exit the function since the tab already exists
    }

    // If the tab doesn't exist, create a new tab
    const tab = document.createElement('div');
    tab.classList.add('tab');
    tab.textContent = fileName;

    // Add close button
    const closeButton = document.createElement('span');
    closeButton.classList.add('close');
    closeButton.textContent = '×';
    closeButton.onclick = (event) => {
        event.stopPropagation(); // Prevent activating the tab when closing
        removeTab(fileName);
    };
    tab.appendChild(closeButton);

    // Click to activate the tab
    tab.onclick = () => setActiveTab(fileName);

    // Append the tab to the container
    tabsContainer.appendChild(tab);

    // Add the tab to the tabs array
    tabs.push(fileName);

    // Automatically activate the new tab
    setActiveTab(fileName);
    updateEditorState();
}


// Function to remove a tab
function removeTab(fileName) {
    const index = tabs.indexOf(fileName);
    if (index > -1) {
        tabs.splice(index, 1); // Remove the tab from the list

        // Remove the tab element from the DOM
        const tabElement = Array.from(tabsContainer.children).find(
            (child) => child.textContent.includes(fileName)
        );
        if (tabElement) {
            tabElement.remove();
        }

        // Check if the removed tab was the currently active tab
        if (activeTab === fileName) {
            saveTabState(activeTab);
            // Set the next available tab as active
            if (tabs.length > 0) {
                setActiveTab(tabs[tabs.length - 1]); // Activate the last remaining tab
            } else {
                // No tabs left
                previousTab = activeTab;
                activeTab = null;
                editor.setValue(""); // Clear editor
                console.log(`Closed ${fileName}. No tabs remain.`);
            }
        } else {
            // The removed tab was not the active tab
            console.log(`Closed ${fileName}. Active tab remains: ${activeTab}`);
        }
        updateEditorState();
    }
}

// Function to set a tab as active
function setActiveTab(fileName) {
    if (activeTab === fileName) return; // Do nothing if the clicked tab is already active

    // Save the current active tab as the previous tab
    previousTab = activeTab;

    // Set the new active tab
    activeTab = fileName;

    // Update the UI: Add the 'active' class to the current tab and remove it from others
    Array.from(tabsContainer.children).forEach((tab) => {
        tab.classList.remove('active');
        if (tab.textContent.includes(fileName)) {
            tab.classList.add('active');
        }
    });

    // Example: Save the previous tab's state before switching
    if (previousTab) {
        saveTabState(previousTab);
    }

    // Load the new tab's content
    loadTabContent(fileName);
}

// Example function to save the state of a tab (customize as needed)
function saveTabState(tabName) {
    console.log(`Saving state for ${tabName} before switching.`);
    window.electronAPI.sendMessage("saveBDD", tabName, editor.getValue());
}

// Example function to load tab content
function loadTabContent(fileName) {
    window.electronAPI.sendMessage("getTabContent", fileName);
}

// Function to update the editor's state
function updateEditorState() {
    if (tabs.length === 0) {
        editor.setReadOnly(true);
    } else {
        editor.setReadOnly(false);
    }
}