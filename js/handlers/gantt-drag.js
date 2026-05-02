export function handleGanttDragStart(e) {
    const row = e.target.closest('.gantt-row');
    if (row && row.dataset.id) {
        window.app.rowDragStart(e, row.dataset.id);
    }
}

export function handleGanttDragOver(e) {
    window.app.rowDragOver(e);
}

export function handleGanttDragLeave(e) {
    window.app.rowDragLeave(e);
}

export function handleGanttDrop(e) {
    const row = e.target.closest('.gantt-row');
    if (row && row.dataset.id) {
        window.app.rowDrop(e, row.dataset.id);
    }
}
