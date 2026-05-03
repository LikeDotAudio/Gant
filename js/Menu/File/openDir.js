/**
 * js/Menu/File/openDir.js
 * Handles the "Open" action for project files.
 */

import { state } from '../../core/state.js';
import { el as elements } from '../../core/elements.js';
import { render } from '../../core/render.js';
import { showStatus } from '../../StatusBar/updateStatus.js';
import * as fileOperations from '../../file/index.js';

/**
 * Triggers the file selection dialog and processes the loaded project file.
 */
export async function openDir() {
    try { 
        await fileOperations.load.openFile(state, elements, render, showStatus); 
    } catch (operationError) { 
        console.error("Failed to open file:", operationError); 
        showStatus(operationError.message, true); 
    }
}
