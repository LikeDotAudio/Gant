// Central state object tracks the application's runtime data.
// It is separate from the DOM to allow business logic to run independently of UI changes.
export const state = {
    currentFileHandle: null,
    projectData: { roots: [], baseDate: new Date().toISOString().split('T')[0] },
    flatTasks: [], // Cached flattened tasks list for virtualized rendering
    foldedIds: new Set(),
    selectedTaskFullIds: new Set(),
    zoomLevel: 70, // Horizontal zoom scale for timeline bars
    dragMode: null,
    draggedTask: null,
    draggedRowFullId: null,
    currentView: 'visual',
    projectPath: localStorage.getItem('gantt_project_path') || 'default', // Identifier for auto-save slots
    changeCount: 0, // Counter to trigger persistent storage writes
    isResizingCol: false,
    projectMin: null,
    projectMax: null
};
