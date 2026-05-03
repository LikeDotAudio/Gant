/**
 * js/actions/keyboard/keyboard.js
 * Main entry point for keyboard event handling in the Gantt application.
 * Delegates events to specialized handlers.
 */

import { state } from '../../core/state.js';
import { f2Keyboard } from './f2Keyboard.js';
import { editKeyboard } from './editKeyboard.js';
import { navigateKeyboard } from './navigateKeyboard.js';
import { foldKeyboard } from './foldKeyboard.js';
import { moveKeyboard } from './moveKeyboard.js';
import { ctrlEnterKeyboard } from './ctrlEnterKeyboard.js';
import { deleteKeyboard } from './deleteKeyboard.js';
import { ctrlZKeyboard } from './ctrlZKeyboard.js';

/**
 * Main keyboard event handler.
 * Delegates to specialized handlers based on the keyboard event properties.
 * 
 * @param {KeyboardEvent} event - The native keyboard event.
 */
export function handleKeyboard(event) {
    console.log(`[handleKeyboard] Event triggered`, { type: event.type, key: event.key, ctrl: event.ctrlKey });
    
    // Global bypass for inputs and non-visual views
    const activeElement = document.activeElement;
    if (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') {
        return;
    }
    
    if (state.currentView !== 'visual') {
        return;
    }

    // Handle modified commands (Ctrl/Cmd)
    if (event.ctrlKey || event.metaKey) {
        if (ctrlZKeyboard(event)) {
            return;
        }
        if (ctrlEnterKeyboard(event)) {
            return;
        }
        if (moveKeyboard(event)) {
            return;
        }
    }

    // Handle standard commands
    if (deleteKeyboard(event)) {
        return;
    }
    if (f2Keyboard(event)) {
        return;
    }
    if (editKeyboard(event)) {
        return;
    }
    if (navigateKeyboard(event)) {
        return;
    }
    
    const selectedFullId = Array.from(state.selectedTaskFullIds)[0];
    if (selectedFullId) {
        foldKeyboard(event, state.projectData.roots, state.foldedIds, selectedFullId);
    }
}
