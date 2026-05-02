import { state } from '../../core/state.js';
import { el } from '../../core/elements.js';
import { render } from '../../core/render.js';
import { showStatus } from '../../StatusBar/Status_update.js';
import * as file from '../../file/index.js';

/**
 * Triggers the file selection dialog and processes the loaded file.
 */
export async function openDir() {
    try { await file.load.openFile(state, el, render, showStatus); } 
    catch (err) { console.error("openFile error:", err); showStatus(err.message, true); }
}
