/**
 * js/Menu/File/importBlob.js
 * Triggers the BLOB import overlay for pasting unstructured task lists.
 */

import { state } from '../../core/state.js';
import { el as elements } from '../../core/elements.js';
import { render } from '../../core/render.js';
import * as fileOperations from '../../file/index.js';

/**
 * Opens the specialized BLOB import overlay.
 */
export function importBlob() {
    fileOperations.showBlobImportOverlay(state.projectData, elements, render);
}
