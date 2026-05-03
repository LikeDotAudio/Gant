import * as file from './File/index.js';
import * as edit from './Edit/index.js';
import * as view from './View/index.js';
import { openWebsite, openGithub, toggleLogger, isLoggerEnabled } from './About/index.js';

export const api = {
    ...file,
    ...edit,
    ...view,
    openWebsite,
    openGithub,
    toggleLogger,
    isLoggerEnabled
};
