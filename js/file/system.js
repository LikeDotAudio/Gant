export async function openFile() {
    // Modern API (HTTPS or localhost only)
    if (typeof window.showOpenFilePicker === 'function') {
        try {
            const [handle] = await window.showOpenFilePicker({
                types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
                multiple: false
            });
            const file = await handle.getFile();
            return {
                content: await file.text(),
                handle: handle,
                name: file.name
            };
        } catch (err) {
            if (err.name === 'AbortError') return null;
            throw err;
        }
    }

    // Fallback for HTTP / non-secure contexts
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) { resolve(null); return; }
            resolve({
                content: await file.text(),
                handle: null, // No handle available in fallback mode
                name: file.name
            });
        };
        input.click();
    });
}

export async function writeFile(fileHandle, content) {
    if (fileHandle && typeof fileHandle.createWritable === 'function') {
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
    } else {
        // If no handle or API, we must use a download fallback
        const name = prompt("Enter filename to save:", "project.json") || "project.json";
        downloadFile(content, name, 'application/json');
    }
}

export async function saveFileAs(content, suggestedName = "project.json") {
    if (typeof window.showSaveFilePicker === 'function') {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: suggestedName,
                types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
            });
            await writeFile(handle, content);
            return {
                handle: handle,
                name: (await handle.getFile()).name
            };
        } catch (err) {
            if (err.name === 'AbortError') return null;
            throw err;
        }
    }

    // Fallback: Trigger a download
    downloadFile(content, suggestedName, 'application/json');
    return { handle: null, name: suggestedName };
}

export function downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}
