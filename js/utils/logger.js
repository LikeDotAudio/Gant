export function log(fnName, action, details = {}) {
    console.log(`[${fnName}] ${action}`, details);
}
