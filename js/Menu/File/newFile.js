import { state } from '../../core/state.js';
import { el } from '../../core/elements.js';
import { render } from '../../core/render.js';
import { showStatus } from '../../StatusBar/updateStatus.js';
import { renderJSONView } from '../../views/viewJson.js';

export function newFile() {
    state.currentFileHandle = null;
    state.projectData = {
        project: "New Project",
        baseDate: new Date().toISOString().split('T')[0],
        roots: [{ RootID: "1", name: "New Root Task", progress: 0, type: "summary", parents: [] }],
        milestones: []
    };
    state.foldedIds.clear();
    state.selectedTaskFullId = null;
    el.activeFilename.innerText = "Gan't Do It: Unsaved Project";
    renderJSONView(state.projectData, el.jsonEditor);
    render();
    showStatus("New project created.");
}
