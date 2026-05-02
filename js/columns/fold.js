import * as gantt from '../Rows/index.js';

/**
 * Folds or unfolds the entire tree to a specific depth.
 * It clears existing folds and then folds all nodes at or below the target depth.
 * @param {Array} roots 
 * @param {Set} foldedIds 
 * @param {number} targetDepth 
 */
export function foldToLevel(roots, foldedIds, targetDepth) {
    // Flatten everything (ignoring current folded state) to find all possible nodes
    const allTasks = gantt.flattenTasks(roots, 0, "", { foldedIds: new Set() });
    
    // We want to fold nodes that are AT the targetDepth to hide their children.
    // e.g., if targetDepth is 0 (Root), we fold level 0 to hide levels 1, 2, 3...
    const nodesToFold = allTasks.filter(t => t.depth >= targetDepth && t.hasChildren);
    
    if (nodesToFold.length === 0) {
        // If no nodes to fold at this level, maybe we want to unfold everything?
        // But usually, clicking "Root" should at least hide children if they exist.
        foldedIds.clear();
        return true;
    }

    // Check if this specific state is already applied
    const isAlreadyFolded = nodesToFold.every(t => foldedIds.has(t.fullId));
    const isExactMatch = foldedIds.size === nodesToFold.length && isAlreadyFolded;

    foldedIds.clear();

    if (!isExactMatch) {
        nodesToFold.forEach(t => foldedIds.add(t.fullId));
    }
    
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
        return '<span style="width:37px; display:inline-block;"></span>';
    }
    
    // We use a single character and let CSS handle the rotation animation
    return `<span class="fold-toggle ${isFolded ? 'folded' : ''}" 
                  data-action="toggleFold" 
                  data-id="${task.fullId}">▼</span>`;
}
