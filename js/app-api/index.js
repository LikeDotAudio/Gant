import * as file from './file/index.js';
import * as view from './view/index.js';
import * as task from './task/index.js';
import * as ui from './ui/index.js';

export const api = {
    ...file,
    ...view,
    ...task,
    ...ui
};
