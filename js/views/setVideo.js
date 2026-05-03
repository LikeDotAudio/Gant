import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { parseJSONView, renderJSONView } from '../../views/json-view.js';
import { renderSpreadsheet } from '../../views/spreadsheet.js';
import { renderPrinterView } from '../../views/printer.js';
import { renderMindMap } from '../../views/mindmap.js'; // <-- Add this import
import { el } from '../../core/elements.js';

export function setView(view) {
    const oldView = state.currentView;
    state.currentView = view;
    
    // Update the array to include 'mindmap'
    ['visual', 'spreadsheet', 'printer', 'json', 'mindmap'].forEach(v => {
        const div = document.getElementById(`view-${v}`);
        if (div) div.classList.toggle('active', v === view);
    });

    if (oldView === 'json' && view !== 'json') {
        const data = parseJSONView(el.jsonEditor.value);
        if (data) state.projectData = data;
        el.jsonEditor.value = '';
    } else if (oldView === 'visual' && view !== 'visual') {
        el.ganttChart.innerHTML = '';
    } else if (oldView === 'spreadsheet' && view !== 'spreadsheet') {
        const ssDiv = document.getElementById('view-spreadsheet');
        if (ssDiv) ssDiv.innerHTML = '';
    } else if (oldView === 'printer' && view !== 'printer') {
        const prDiv = document.getElementById('view-printer');
        if (prDiv) prDiv.innerHTML = '';
    }

    if (view === 'json') renderJSONView(state.projectData, el.jsonEditor);
    else if (view === 'spreadsheet') renderSpreadsheet(state.projectData, document.getElementById('view-spreadsheet'), state.flatTasks);
    else if (view === 'printer') renderPrinterView(state.projectData, document.getElementById('view-printer'));
    else if (view === 'mindmap') renderMindMap(state.projectData, document.getElementById('view-mindmap'), state.flatTasks); // <-- Add this route
    else render();
}