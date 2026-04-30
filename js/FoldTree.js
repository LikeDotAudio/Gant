import * as gantt from './gantt.js';

/**
 * Folds or unfolds the entire tree to a specific depth.
 * If all items at that depth are already folded, it unfolds everything.
 * @param {Array} roots 
 * @param {Set} foldedIds 
 * @param {number} targetDepth 
 */
export function foldToLevel(roots, foldedIds, targetDepth) {
    // Flatten everything (ignoring current folded state) to find all possible nodes
    const allTasks = gantt.flattenTasks(roots, 0, "", { foldedIds: new Set() });
    
    const targetNodes = allTasks.filter(t => t.depth === targetDepth && (gantt.getChildren(t)?.length > 0));
    
    if (targetNodes.length === 0) return false;

    // Check if this level is already the exclusive fold
    const isAlreadyFolded = targetNodes.every(t => foldedIds.has(t.fullId));
    const isOnlyTargetFolded = foldedIds.size === targetNodes.length && isAlreadyFolded;

    foldedIds.clear();

    if (!isOnlyTargetFolded) {
        // Apply fold to this level
        targetNodes.forEach(t => foldedIds.add(t.fullId));
    }
    // else: we already cleared it, which is the "unfold all" state
    
    return true;
}

/**
 * Smart folding for keyboard navigation.
 * ArrowLeft: Fold selected item. If already folded or no children, select parent.
 * ArrowRight: Unfold selected item.
 */
export function keyboardFold(roots, foldedIds, selectedId, direction) {
    const task = gantt.findTask(roots, selectedId);
    if (!task) return { changed: false, newSelection: null };

    const hasChildren = gantt.getChildren(task)?.length > 0;

    if (direction === 'left') {
        if (hasChildren && !foldedIds.has(selectedId)) {
            foldedIds.add(selectedId);
            return { changed: true, newSelection: null };
        } else {
            // Select parent
            const parentId = gantt.getFullIdOfParent(roots, selectedId);
            return { changed: false, newSelection: parentId };
        }
    } else if (direction === 'right') {
        if (hasChildren && foldedIds.has(selectedId)) {
            foldedIds.delete(selectedId);
            return { changed: true, newSelection: null };
        }
    }

    return { changed: false, newSelection: null };
}

/**
 * Toggles an individual item's folded state.
 */
export function toggleItem(foldedIds, fullId) {
    if (foldedIds.has(fullId)) {
        foldedIds.delete(fullId);
    } else {
        foldedIds.add(fullId);
    }
    return true;
}

/**
 * Returns the HTML for the fold toggle triangle.
 */
export function getTriangle(task, isFolded) {
    const hasChildren = task.hasChildren ?? (gantt.getChildren(task)?.length > 0);
    
    if (!hasChildren) {
        return '<span style="width:21px; display:inline-block;"></span>';
    }
    
    // We use a single character and let CSS handle the rotation animation
    return `<span class="fold-toggle ${isFolded ? 'folded' : ''}" 
                  data-action="toggleFold" 
                  data-id="${task.fullId}">▼</span>`;
}
