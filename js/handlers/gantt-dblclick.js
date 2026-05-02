/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Handles double-click events, enabling specific actions like adding milestones or editing tasks.
 */

/**
 * Event handler for double-click events in the Gantt chart.
 * This triggers specific interactions depending on the clicked element, such as 
 * creating milestones or opening task editing interfaces.
 * 
 * @param {Event} e - The DOM double-click event.
 * @returns {void}
 */
export function handleGanttDblClick(e) {
    const target = e.target;
    // Identify if the double-click targeted an action element (like a specific button or area).
    const actionEl = target.dataset.action ? target : target.closest('[data-action]');
    const action = actionEl?.dataset.action;

    // Handle milestone creation if that is the triggered action.
    if (action === 'addMilestone') {
        window.app.addMilestone(e, actionEl.dataset.minDate);
        return;
    }

    // Attempt to identify a targetable task from the row or the bar itself.
    const row = e.target.closest('.gantt-row');
    const bar = e.target.closest('.bar');
    const id = row?.dataset.id || bar?.dataset.id;
    
    // If a task ID is successfully resolved, trigger the application's edit task flow.
    if (id) {
        window.app.editTask(id, e);
    }
}
