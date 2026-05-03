import { api } from '../Menu/index.js';

/**
 * Initializes the global window.app object.
 * This global object acts as the primary interface for UI-bound events (like button clicks)
 * to interact with the internal state, file system, and rendering engine.
 */
export function initAppAPI() {
    window.app = api;
}
