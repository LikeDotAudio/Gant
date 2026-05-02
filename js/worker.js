/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Core application utility/init module.
 */

import * as gantt from './Rows/index.js';

self.onmessage = (e) => {
    const { action, payload } = e.data;
    
    if (action === 'flatten') {
        try {
            const result = gantt.getFlattenedProject(payload.roots, payload.options);
            self.postMessage({ action: 'flattened', result, requestId: payload.requestId });
        } catch (err) {
            self.postMessage({ action: 'error', error: err.message, requestId: payload.requestId });
        }
    }
 else if (action === 'refreshIds') {
        try {
            gantt.refreshIds(payload.roots);
            self.postMessage({ action: 'refreshed', result: payload.roots, requestId: payload.requestId });
        } catch (err) {
            self.postMessage({ action: 'error', error: err.message, requestId: payload.requestId });
        }
    }
};
