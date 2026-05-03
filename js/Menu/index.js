import * as file from './File/index.js';
import * as edit from './Edit/index.js';
import * as view from './View/index.js';

export const api = {
    ...file,
    ...edit,
    ...view
};
