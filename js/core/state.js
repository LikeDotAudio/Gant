/**
 * js/core/state.js
 * Central application state container.
 * Manages the "source of truth" for the application's runtime data, separate from DOM state.
 */

export const state = {
    /** @type {FileSystemFileHandle|null} Current file handle if using the File System Access API */
    currentFileHandle: null,

    /** @type {Object} The raw hierarchical project data */
    projectData: { 
        roots: [], 
        baseDate: new Date().toISOString().split('T')[0],
        milestones: [] 
    },

    /** @type {Array<Object>} Flat list of tasks for high-performance virtualized rendering */
    flatTasks: [], 

    /** @type {Set<string>} Set of task full IDs that are currently collapsed/folded */
    foldedIds: new Set(),

    /** @type {Set<string>} Set of task full IDs that are currently selected by the user */
    selectedTaskFullIds: new Set(),

    /** @type {number} Horizontal zoom scale representing pixels per day in the timeline */
    zoomLevel: 70, 

    /** @type {string|null} Current interaction mode (e.g., 'resize-left', 'bar-drag') */
    dragMode: null,

    /** @type {Object|null} The task object currently being dragged or manipulated */
    draggedTask: null,

    /** @type {string|null} The full ID of the row currently being dragged (for reordering) */
    draggedRowFullId: null,

    /** @type {string} The active view identifier ('visual', 'spreadsheet', 'printer', 'json', 'mindmap') */
    currentView: 'visual',

    /** @type {string} Storage key for identifying auto-save slots in localStorage */
    projectPath: localStorage.getItem('gantt_project_path') || 'default', 

    /** @type {number} Counter incremented on every change to trigger periodic background saves */
    changeCount: 0, 

    /** @type {boolean} Flag indicating if a column is currently being resized */
    isResizingCol: false,

    /** @type {string|null} The full ID of the task from which a dependency connection is being dragged */
    dependencyDragSource: null, 

    /** @type {string|null} ISO date string for the calculated earliest start of the project */
    projectMin: null,

    /** @type {string|null} ISO date string for the calculated latest end of the project */
    projectMax: null
};
