import { el } from '../core/elements.js';

/**
 * Centralized handler for all status updates.
 * Updates the UI status text and appearance.
 * 
 * @param {string} msg - The status message.
 * @param {boolean} [isError=false] - Whether the status is an error.
 */
export function showStatus(msg, isError = false) {
    if (!el.statusText) return;
    el.statusText.innerText = msg;
    el.status.className = isError ? 'error' : '';
    el.statusText.style.display = 'block';
    
    // Ensure the confirmation dialog is hidden if a status update is shown
    if (el.confirmDel) {
        el.confirmDel.style.display = 'none';
    }
}
