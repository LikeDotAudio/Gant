/**
 * js/Menu/View/setView.js
 * Handles switching between different application views (Gantt, Spreadsheet, MindMap, etc.)
 * Manages view-specific setup, cleanup, and navigation visibility.
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { parseJSONView, renderJSONView } from '../../views/viewJson.js';
import { renderSpreadsheet } from '../../views/spreadsheet.js';
import { renderPrinterView } from '../../views/printer.js';
import { renderMindMap } from '../../views/MindMap/index.js';
import { el as elements } from '../../core/elements.js';

/**
 * Switches the active application view.
 * 
 * @param {string} targetViewName - Identifier of the view to activate ('visual', 'spreadsheet', etc.)
 */
export function setView(targetViewName) {
    const previousViewName = state.currentView;
    state.currentView = targetViewName;

    // Toggle 'active' class on all view container divs
    const viewIdentifiers = ['visual', 'spreadsheet', 'printer', 'json', 'mindmap'];
    viewIdentifiers.forEach(viewId => {
        const viewContainerElement = document.getElementById(`view-${viewId}`);
        if (viewContainerElement) {
            viewContainerElement.classList.toggle('active', viewId === targetViewName);
        }
    });

    // Handle data transition when leaving the JSON editor
    if (previousViewName === 'json' && targetViewName !== 'json') {
        const parsedProjectData = parseJSONView(elements.jsonEditor.value);
        if (parsedProjectData) {
            state.projectData = parsedProjectData;
        }
        elements.jsonEditor.value = '';
    }

    // Individual view cleanup logic
    const viewToCleanupMap = {
        'visual': elements.ganttChart,
        'spreadsheet': document.getElementById('view-spreadsheet'),
        'printer': document.getElementById('view-printer'),
        'mindmap': document.getElementById('view-mindmap')
    };

    if (previousViewName !== targetViewName && viewToCleanupMap[previousViewName]) {
        viewToCleanupMap[previousViewName].innerHTML = '';
    }

    // Initialize the new view
    if (targetViewName === 'json') {
        renderJSONView(state.projectData, elements.jsonEditor);
    } else if (targetViewName === 'spreadsheet') {
        renderSpreadsheet(state.projectData, document.getElementById('view-spreadsheet'), state.flatTasks);
    } else if (targetViewName === 'printer') {
        renderPrinterView(state.projectData, document.getElementById('view-printer'));
    } else if (targetViewName === 'mindmap') {
        renderMindMap(state.projectData, document.getElementById('view-mindmap'), state.flatTasks);
    } else {
        // Default to Gantt (visual) view
        render();
    }

    // Show/Hide Navigator based on the active view
    const navigatorElement = document.getElementById('gantt-navigator');
    if (navigatorElement) {
        navigatorElement.style.display = (targetViewName === 'visual') ? 'block' : 'none';
    }
}
