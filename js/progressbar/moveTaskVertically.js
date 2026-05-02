/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Provides functionality related to js/progressbar functionality.
 */

import * as gantt from '../Rows/index.js';

export function moveTaskVertically(projectData, sourceFullId, targetFullId, direction) {
    if (sourceFullId === targetFullId) return;
    
    // Prevent moving a parent into its own descendant
    if (targetFullId.startsWith(sourceFullId + '.')) return;

    const source = gantt.findTask(projectData.roots, sourceFullId);
    const { parent: sourceParent, index: sourceIdx } = gantt.findParentAndIndex(projectData.roots, sourceFullId);
    const { parent: targetParent, index: targetIdx } = gantt.findParentAndIndex(projectData.roots, targetFullId);

    if (source && sourceParent && targetParent) {
        sourceParent.children.splice(sourceIdx, 1);
        
        let adjustedTargetIdx = targetIdx;
        const sourceParentFullId = gantt.getFullIdOfParent(projectData.roots, sourceFullId);
        const targetParentFullId = gantt.getFullIdOfParent(projectData.roots, targetFullId);
        
        if (sourceParentFullId === targetParentFullId && sourceIdx < targetIdx) {
            adjustedTargetIdx--;
        }

        // If moving down, we generally want to place it AFTER the target task in its parent
        if (direction > 0) {
            adjustedTargetIdx++;
        }

        targetParent.children.splice(Math.max(0, adjustedTargetIdx), 0, source);
        gantt.refreshIds(projectData.roots);
    }
}
