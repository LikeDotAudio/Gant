/**
 * js/Menu/File/saveFileAs.js
 * Triggers the "Save As" dialog to create or overwrite a project file.
 */

import { state } from '../../core/state.js';
import { el as elements } from '../../core/elements.js';
import { showStatus } from '../../StatusBar/updateStatus.js';
import * as fileOperations from '../../file/index.js';

/**
 * Opens the native file picker to save the current project data to a new location.
 */
export async function saveFileAs() { 
    await fileOperations.save.saveFileAs(state, elements, showStatus); 
}
