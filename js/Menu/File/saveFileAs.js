import { state } from '../../core/state.js';
import { el } from '../../core/elements.js';
import { showStatus } from '../../StatusBar/updateStatus.js';
import * as file from '../../file/index.js';

export async function saveFileAs() { 
    await file.save.saveFileAs(state, el, showStatus); 
}
