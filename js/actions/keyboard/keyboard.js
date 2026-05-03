import { state } from '../../core/state.js';
import { handleKeyboardF2 } from './f2Keyboard.js';
import { handleKeyboardEdit } from './editKeyboard.js';
import { handleKeyboardNavigation } from './navigateKeyboard.js';
import { handleKeyboardFold } from './foldKeyboard.js';
import { handleKeyboardMove } from './moveKeyboard.js';
import { handleKeyboardCTRLEnter } from './ctrlEnterKeyboard.js';
import { handleKeyboardDel } from './deleteKeyboard.js';
import { handleKeyboardCTRLZ } from './ctrlZKeyboard.js';

/**
 * Main keyboard entry point.
 * Delegates to specialized handlers based on command type.
 * 
 * @param {Event} e - The keyboard event.
 */
export function handleKeyboard(e) {
    console.log(`[handleKeyboard] Event triggered`, { type: e.type, key: e.key, ctrl: e.ctrlKey });
    
    // Global bypass for inputs and non-visual views
    if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') return;
    if (state.currentView !== 'visual') return;

    // Handle modified commands (Ctrl/Cmd)
    if (e.ctrlKey || e.metaKey) {
        if (handleKeyboardCTRLZ(e)) return;
        if (handleKeyboardCTRLEnter(e)) return;
        if (handleKeyboardMove(e)) return;
    }

    // Handle standard commands
    if (handleKeyboardDel(e)) return;
    if (handleKeyboardF2(e)) return;
    if (handleKeyboardEdit(e)) return;
    if (handleKeyboardNavigation(e)) return;
    
    const selectedId = Array.from(state.selectedTaskFullIds)[0];
    if (selectedId) {
        handleKeyboardFold(e, state.projectData.roots, state.foldedIds, selectedId);
    }
}
