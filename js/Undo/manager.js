import { state } from '../core/state.js';
import { render } from '../core/render.js';
import { showStatus } from '../StatusBar/Status_update.js';

const MAX_UNDO = 5;
const UNDO_KEY = 'gantt_undo_history';

class UndoManager {
    constructor() {
        this.history = [];
        this.loadFromStorage();
    }

    /**
     * Captures a snapshot of the current project data and view state.
     * Should be called BEFORE a modification is made.
     */
    pushState() {
        const snapshot = {
            projectData: JSON.parse(JSON.stringify(state.projectData)),
            foldedIds: Array.from(state.foldedIds) // Convert Set to Array for JSON
        };
        
        this.history.push(snapshot);
        
        if (this.history.length > MAX_UNDO) {
            this.history.shift();
        }
        
        this.saveToStorage();
        console.log(`[UndoManager] State pushed. History size: ${this.history.length}`);
    }

    /**
     * Reverts to the last captured state.
     */
    undo() {
        if (this.history.length === 0) {
            showStatus("Nothing to undo.", true);
            return;
        }

        const previous = this.history.pop();
        state.projectData = previous.projectData;
        state.foldedIds = new Set(previous.foldedIds);
        
        // Refresh UI
        render(true);
        this.saveToStorage();
        showStatus("Undo successful.");
        console.log(`[UndoManager] Undo performed. Remaining history: ${this.history.length}`);
    }

    saveToStorage() {
        try {
            localStorage.setItem(UNDO_KEY, JSON.stringify(this.history));
        } catch (e) {
            console.warn("Failed to save undo history to storage:", e);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem(UNDO_KEY);
            if (saved) {
                this.history = JSON.parse(saved);
                // Ensure we don't exceed the limit if storage was tampered with
                if (this.history.length > MAX_UNDO) {
                    this.history = this.history.slice(-MAX_UNDO);
                }
            }
        } catch (e) {
            console.warn("Failed to load undo history from storage:", e);
            this.history = [];
        }
    }
    
    clear() {
        this.history = [];
        localStorage.removeItem(UNDO_KEY);
    }
}

export const undoManager = new UndoManager();
