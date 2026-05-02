export function renderJSONView(projectData, container) {
    if (!container) return;
    container.value = JSON.stringify(projectData, null, 2);
}

export function parseJSONView(value) {
    try {
        return JSON.parse(value);
    } catch (e) {
        console.error("JSON Parse error:", e);
        return null;
    }
}
