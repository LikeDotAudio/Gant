import * as fs from './file-system.js';

export async function openFile(state, el, render, showStatus) {
    try {
        const file = await fs.openFile();
        if (file) {
            state.currentFileHandle = file.handle;
            el.jsonEditor.value = file.content;
            state.projectData = JSON.parse(file.content);
            if (!state.projectData.baseDate) {
                state.projectData.baseDate = new Date().toISOString().split('T')[0];
            }
            el.activeFilename.innerText = file.name;
            render();
            showStatus(`Loaded: ${file.name}`);
        }
    } catch (err) {
        console.error(err);
        showStatus(err.message, true);
    }
}
