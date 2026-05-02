import { state } from '../../core/state.js';
import { render } from '../../core/render.js';

export function selectTask(fullId) { 
    console.log(`[apiName] State change`, { fullId, action: 'selectTask' });
    state.selectedTaskFullId = (state.selectedTaskFullId === fullId) ? null : fullId; 
    render(); 
}
