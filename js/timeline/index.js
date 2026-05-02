/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Provides functionality related to js/timeline functionality.
 */

import { renderGantt } from './renderGantt.js';
import { initNavigator } from './initNavigator.js';
import { addMilestone } from './addMilestone.js';
import { startMilestoneDrag } from './startMilestoneDrag.js';
import { renderAxis } from './renderAxis.js';

export {
    renderGantt,
    initNavigator,
    addMilestone,
    startMilestoneDrag,
    renderAxis
};

// Bundle milestones for backward compatibility if needed
export const milestones = { addMilestone, startMilestoneDrag };
