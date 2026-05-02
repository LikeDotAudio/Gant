/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Core application utility/init module.
 */

/**
 * Gantt WBS Workspace - Entry Point
 * 
 * This file is kept minimal. Most logic is moved to core/ and utils/
 */

import { initializeApp } from './app-init.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});
