/**
 * js/Menu/File/loadFromPath.js
 * Handles loading project data from a specific storage path or localStorage.
 */

import { render } from '../../core/render.js';
import { loadFromPath as loadPersistentDataFromPath } from '../../utils/persistence.js';

/**
 * Triggers the persistent storage load operation.
 */
export function loadFromPath() { 
    loadPersistentDataFromPath(render); 
}
