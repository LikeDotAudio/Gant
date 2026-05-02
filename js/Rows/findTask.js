import { findParentAndIndex } from './findParentAndIndex.js';
export function findTask(tasks, fullId) { 
    const { parent, index } = findParentAndIndex(tasks, fullId); 
    return (parent && index !== -1) ? parent.children[index] : null; 
}
