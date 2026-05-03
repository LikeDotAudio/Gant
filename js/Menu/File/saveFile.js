/**
 * js/Menu/File/saveFile.js
 * Handles the primary "Save" operation, delegating to "Save As" if no file handle exists.
 */

import { state } from '../../core/state.js';
import { el as elements } from '../../core/elements.js';
import { showStatus } from '../../StatusBar/updateStatus.js';
import * as fileOperations from '../../file/index.js';

/**
 * Attempts to save the current project data. 
 * If the project hasn't been saved to a file yet, it triggers the "Save As" dialog.
 */
export async function saveFile() { 
    await fileOperations.save.saveFile(
        state, 
        showStatus, 
        (activeState, uiElements) => fileOperations.save.saveFileAs(activeState, uiElements, showStatus)
    ); 
}
