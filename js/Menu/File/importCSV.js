import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { showStatus } from '../../StatusBar/updateStatus.js';
import * as file from '../../file/index.js';

export async function importCSV() { 
    await file.loadCSV(state, render, showStatus); 
}
