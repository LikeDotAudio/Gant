import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { addBelow } from '../../Rows/addBelow.js';
import { refreshIds } from '../../Rows/refreshIds.js';
import { findParentAndIndex } from '../../Rows/findParentAndIndex.js';
import { getFullIdOfParent } from '../../Rows/getFullIdOfParent.js';
import { findTask } from '../../Rows/findTask.js';
import { getChildren } from '../../Rows/getChildren.js';

export function handleMindMapKeyDown(event) {
    if (state.selectedTaskFullIds.size !== 1) {
        // If no node is selected, select the first one on key down
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            if (state.projectData.roots.length > 0) {
                const firstTask = state.projectData.roots[0];
                if (firstTask) {
                    // Ensure the first task has a fullId
                    if (!firstTask.fullId) {
                        refreshIds(state.projectData.roots);
                    }
                    state.selectedTaskFullIds.add(firstTask.fullId);
                    render(false);
                }
            }
        }
        return;
    }
    
    const [selectedId] = state.selectedTaskFullIds;

    if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        const { changed } = addBelow(state.projectData.roots, selectedId);
        if (changed) {
            refreshIds(state.projectData.roots);
            render(true);
        }
        return;
    }

    let newSelectedId = null;

    switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown': {
            event.preventDefault();
            const { parent, index } = findParentAndIndex(state.projectData.roots, selectedId);
            if (parent && parent.children) {
                const newIndex = event.key === 'ArrowUp' ? index - 1 : index + 1;
                if (newIndex >= 0 && newIndex < parent.children.length) {
                    newSelectedId = parent.children[newIndex].fullId;
                }
            }
            break;
        }
        case 'ArrowLeft': {
            event.preventDefault();
            const parentId = getFullIdOfParent(state.projectData.roots, selectedId);
            if (parentId) {
                newSelectedId = parentId;
            }
            break;
        }
        case 'ArrowRight': {
            event.preventDefault();
            const task = findTask(state.projectData.roots, selectedId);
            const children = getChildren(task);
            if (children && children.length > 0) {
                newSelectedId = children[0].fullId;
            }
            break;
        }
    }

    if (newSelectedId) {
        state.selectedTaskFullIds.clear();
        state.selectedTaskFullIds.add(newSelectedId);
        render(false);
    }
}
