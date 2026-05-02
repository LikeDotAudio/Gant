/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Handles WBS task operations such as adding, deleting, moving, and searching within the hierarchy.
 */

import { getChildren } from './getChildren.js';
import { setChildren } from './setChildren.js';
import { getWeekNumber } from './getWeekNumber.js';
import { getTaskId, setTaskId, refreshIds } from './id-manager.js';
import { flattenTasks, getFlattenedProject } from './builder.js';
import { findParentAndIndex, findTask, getFullIdOfParent, findFullId } from './search.js';
import * as add from './add.js';
import * as del from './deleteTask.js';
import * as move from './move-item.js';

export {
    getChildren,
    setChildren,
    getWeekNumber,
    getTaskId,
    setTaskId,
    refreshIds,
    flattenTasks,
    getFlattenedProject,
    findParentAndIndex,
    findTask,
    getFullIdOfParent,
    findFullId,
    add,
    del,
    move
};
