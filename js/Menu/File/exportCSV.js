import { state } from '../../core/state.js';
import { showStatus } from '../../StatusBar/Status_update.js';
import * as file from '../../file/index.js';

export async function exportCSV() { 
    await file.saveCSV(state.projectData, showStatus); 
}
