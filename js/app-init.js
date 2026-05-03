import { state } from './core/state.js';
import { setupEventListeners } from './core/events.js';
import { initAppAPI } from './core/app-api.js';
import { loadFromPath } from './utils/persistence.js';
import { render } from './core/render.js';
import { setupMobile } from './Mobile/setup.js';

export function initializeApp() {
    try {
        setupMobile();
        initAppAPI();
        setupEventListeners();
        window.app.loadFromPath();
        console.log("Gan't Do it initialized successfully.");
    } catch (err) {

        console.error("Initialization error:", err);
    }
}
