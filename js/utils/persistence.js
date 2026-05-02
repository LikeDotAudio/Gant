/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Core application utility/init module.
 */

import { state } from '../core/state.js';
import { el } from '../core/elements.js';
import { showStatus } from './status.js';
import { renderJSONView } from '../views/json-view.js';
import * as gantt from '../Rows/index.js';

export function persistState(force = false) {
    state.changeCount++;
    if (force || state.changeCount >= 4) {
        try {
            const key = `gantt_autosave_${state.projectPath}`;
            localStorage.setItem(key, JSON.stringify(state.projectData));
            localStorage.setItem('gantt_project_path', state.projectPath);
            state.changeCount = 0;
            showStatus(`Auto-saved to "${state.projectPath}"`);
        } catch (e) {
            console.warn("Auto-save failed:", e);
        }
    } else {
        showStatus(`Change tracked (${state.changeCount}/4 to save)`);
    }
}

export function loadFromPath(renderCallback) {
    const key = `gantt_autosave_${state.projectPath}`;
    const savedData = localStorage.getItem(key);
    if (savedData) {
        try {
            state.projectData = JSON.parse(savedData);
            gantt.refreshIds(state.projectData.roots);
            renderJSONView(state.projectData, el.jsonEditor);
            el.activeFilename.innerText = `Project: ${state.projectPath}`;
            renderCallback(true);
            showStatus(`Loaded "${state.projectPath}" from local storage.`);
        } catch (e) {
            console.error("Failed to parse auto-save:", e);
            loadSampleData(renderCallback);
        }
    } else {
        loadSampleData(renderCallback);
    }
}

export function loadSampleData(renderCallback) {
    fetch('sample.json')
        .then(response => response.json())
        .then(data => {
            state.projectData = data;
            gantt.refreshIds(state.projectData.roots);
            renderJSONView(data, el.jsonEditor);
            el.activeFilename.innerText = "sample.json (Default)";
            renderCallback(true);
        })
        .catch(err => {
            console.warn("Could not load sample.json:", err);
            renderCallback();
        });
}
