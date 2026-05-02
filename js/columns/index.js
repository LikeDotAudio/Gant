/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Provides functionality related to js/columns functionality.
 */

import * as manager from './manager.js';
import * as fold from './fold.js';

export {
    manager,
    fold
};

export const toggleCol = manager.toggleCol;
export const keyboardFold = fold.keyboardFold;
export const getTriangle = fold.getTriangle;
