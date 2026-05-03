/**
 * js/Menu/File/importCSV.js
 * Triggers the process to load a project from a CSV file.
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { showStatus } from '../../StatusBar/updateStatus.js';
import * as fileOperations from '../../file/index.js';

/**
 * Opens the file picker for CSV files and loads the data into the application state.
 */
export async function importCSV() { 
    await fileOperations.loadCSV(state, render, showStatus); 
}
