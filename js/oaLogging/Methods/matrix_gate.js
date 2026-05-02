export function is_debug_allowed(system, element) {
    // Basic implementation: allow everything by default for now.
    // Future: check localStorage or app state for specific matrix rules.
    return true;
}
export function matrix_log(system, element, func_name, message, level = 'DEBUG') {
    if (is_debug_allowed(system, element)) {
        const timestamp = new Date().toISOString();
        const formatted = `[${timestamp}] [${level}] [${system}:${element}] (${func_name}) -> ${message}`;
        switch(level.toUpperCase()) {
            case 'ERROR': console.error(formatted); break;
            case 'WARN': console.warn(formatted); break;
            case 'INFO': console.info(formatted); break;
            default: console.debug(formatted);
        }
    }
}
