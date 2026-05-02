/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Core application utility/init module.
 */

import { state } from './core/state.js';
import { setupEventListeners } from './core/events.js';
import { initAppAPI } from './core/app-api.js';
import { loadFromPath } from './utils/persistence.js';
import { render } from './core/render.js';

export function initializeApp() {
    try {
        initAppAPI();
        setupEventListeners();
        
        // Create Project Path Input in UI
        const controls = document.querySelector('.col-toggles');
        if (controls) {
            const pathWrap = document.createElement('div');
            pathWrap.className = 'toggle-item';
            pathWrap.innerHTML = `
                <span>Path:</span>
                <input type="text" id="project-path" value="${state.projectPath}" 
                       style="background:#1a1c1e; border:1px solid #444; color:#888; padding:2px 5px; width:80px; font-size:10px; border-radius:3px;">
            `;
            controls.prepend(pathWrap);
            document.getElementById('project-path').onchange = (e) => {
                state.projectPath = e.target.value;
                localStorage.setItem('gantt_project_path', state.projectPath);
                window.app.loadFromPath();
            };
        }

        window.app.loadFromPath();
        console.log("Gantt App initialized successfully.");
    } catch (err) {
        console.error("Initialization error:", err);
    }
}
