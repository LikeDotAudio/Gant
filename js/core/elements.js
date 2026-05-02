// We cache these references during initialization to prevent repetitive DOM queries,
// which is a performance-critical step for large Gantt charts.
export const el = {
    btnOpenDir: document.getElementById('btnOpenDir'), 
    btnSaveFile: document.getElementById('btnSaveFile'),
    jsonEditor: document.getElementById('json-editor'),
    activeFilename: document.getElementById('active-filename'), 
    status: document.getElementById('status'),
    statusText: document.getElementById('status-text'),
    ganttChart: document.getElementById('gantt-chart'), 
    overlay: document.getElementById('overlay'), 
    overlayInput: document.getElementById('overlay-input'),
    overlayProgress: document.getElementById('overlay-progress'), 
    overlayColor: document.getElementById('overlay-color'),
    overlayTitle: document.getElementById('overlay-title'), 
    overlayOk: document.getElementById('overlay-ok'),
    overlayCancel: document.getElementById('overlay-cancel'),
    confirmDel: document.getElementById('confirm-del'),
    delPrompt: document.getElementById('del-prompt'),
    delYes: document.getElementById('del-yes'),
    delNo: document.getElementById('del-no')
};
