/**
 * js/Menu/File/exportCSV.js
 * Triggers the process to export the current project data to a CSV file.
 */

import { state } from '../../core/state.js';
import { showStatus } from '../../StatusBar/updateStatus.js';
import * as fileOperations from '../../file/index.js';

/**
 * Initiates the CSV export by passing the current project data to the file system utility.
 */
export async function exportCSV() { 
    await fileOperations.saveCSV(state.projectData, showStatus); 
}
