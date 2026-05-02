/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Core application utility/init module.
 */

import { el } from '../core/elements.js';

export function showStatus(msg, isError = false) {
    if (!el.statusText) return;
    el.statusText.innerText = msg;
    el.status.className = isError ? 'error' : '';
    el.statusText.style.display = 'block';
    el.confirmDel.style.display = 'none';
}
