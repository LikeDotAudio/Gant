/**
 * js/Menu/File/newFile.js
 * Resets the application state to create a fresh project.
 */

import { state } from '../../core/state.js';
import { el as elements } from '../../core/elements.js';
import { render } from '../../core/render.js';
import { showStatus } from '../../StatusBar/updateStatus.js';
import { renderJSONView } from '../../views/viewJson.js';

/**
 * Clears current project data and initializes a new project with a default root task.
 */
export function newFile() {
    state.currentFileHandle = null;
    state.projectData = {
        project: "New Project",
        baseDate: new Date().toISOString().split('T')[0],
        roots: [
            { 
                RootID: "1", 
                name: "New Root Task", 
                progress: 0, 
                type: "summary", 
                parents: [] 
            }
        ],
        milestones: []
    };
    
    state.foldedIds.clear();
    state.selectedTaskFullIds.clear();
    
    // Update UI labels
    elements.activeFilename.innerText = "Gan't Do It: Unsaved Project";
    
    // Sync the JSON editor view if it exists
    renderJSONView(state.projectData, elements.jsonEditor);
    
    render();
    showStatus("New project created.");
}
