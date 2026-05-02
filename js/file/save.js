import * as fs from './system.js';

export async function saveFile(state, showStatus, saveFileAs) {
    if (!state.currentFileHandle) {
        return saveFileAs(state, showStatus);
    }
    try {
        await fs.writeFile(state.currentFileHandle, JSON.stringify(state.projectData, null, 2));
        showStatus(`Saved ${new Date().toLocaleTimeString()}`);
    } catch (err) {
        console.error(err);
        showStatus("Failed to save: " + err.message, true);
    }
}

export async function saveFileAs(state, el, showStatus) {
    try {
        const file = await fs.saveFileAs(JSON.stringify(state.projectData, null, 2));
        if (file) {
            state.currentFileHandle = file.handle;
            el.activeFilename.innerText = file.name;
            showStatus(`Saved as: ${file.name}`);
        }
    } catch (err) {
        console.error(err);
        showStatus(err.message, true);
    }
}
