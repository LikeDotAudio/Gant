import * as fs from './system.js';
import { renderJSONView } from '../views/json-view.js';
import { validateProjectData } from './validator.js';

export async function openFile(state, el, render, showStatus) {
    try {
        const file = await fs.openFile();
        if (file) {
            const projectData = JSON.parse(file.content);
            const validation = validateProjectData(projectData);
            if (!validation.valid) {
                showStatus(`Validation failed: ${validation.message}`, true);
                return;
            }
            state.currentFileHandle = file.handle;
            state.projectData = validation.data;
            renderJSONView(state.projectData, el.jsonEditor);
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
