import { state } from '../../core/state.js';
import { el } from '../../core/elements.js';
import { showStatus } from '../../StatusBar/updateStatus.js';
import * as file from '../../file/index.js';

export async function saveFile() { 
    await file.save.saveFile(state, showStatus, (s, st) => file.save.saveFileAs(s, el, st)); 
}
