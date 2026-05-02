import { render } from '../../core/render.js';
import { loadFromPath as LFP } from '../../utils/persistence.js';

export function loadFromPath() { 
    LFP(render); 
}
