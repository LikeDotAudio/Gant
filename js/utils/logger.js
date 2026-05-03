let isEnabled = false;

export function setLoggerEnabled(enabled) {
    isEnabled = enabled;
    console.log(`[Logger] ${isEnabled ? 'Enabled' : 'Disabled'}`);
}

export function isLoggerEnabled() {
    return isEnabled;
}

export function log(fnName, action, details = {}) {
    if (isEnabled) {
        console.log(`[${fnName}] ${action}`, details);
    }
}
