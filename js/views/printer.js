export function renderPrinterView(projectData, container) {
    if (!container) {
        console.error("Printer view container not found!");
        return;
    }
    // Force clear and add a simple header first to prove rendering is happening
    container.innerHTML = '<div class="printer-view-content" style="border: 2px solid blue !important;">' +
                          '<h1 style="color: black !important;">Printer Friendly View (Loading...)</h1>' +
                          '</div>';
    if (!projectData || !projectData.roots || projectData.roots.length === 0) {
        container.innerHTML = `
            <div class="printer-view-content" style="border: 2px solid red !important;">
                <h1 style="color: black !important;">Printer Friendly View</h1>
                <p style="color: red !important; font-weight: bold;">Error: No project data available.</p>
                <p style="color: black !important;">State check: ${projectData ? 'Object exists' : 'Object is null'}</p>
                <button onclick="window.app.setView('visual')" style="background: #3e444a; color: white; padding: 10px;">Return to Visual View</button>
            </div>`;
        return;
    }
    let html = '<div class="printer-view-content" style="background: white !important; color: black !important; padding: 40px; min-height: 100vh;">';
    // Add Print Button
    html += `
        <div class="no-print" style="display: flex; justify-content: center; margin-bottom: 20px;">
            <button onclick="window.print()" style="background: #2d7a4b; color: white; padding: 12px 24px; font-size: 16px; border-radius: 8px; cursor: pointer; border: none; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                🖨️ Print to Paper or PDF
            </button>
        </div>
    `;
    html += `<h1 style="text-align:center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 5px; color: black !important;">${projectData.project || 'Gantt Project'}</h1>`;
    html += `<p style="text-align:center; margin-bottom:40px; font-style: italic; color: #333 !important;">Reference Date: ${projectData.baseDate || 'Not set'}</p>`;
    projectData.roots.forEach((root, rIdx) => {
        html += `<h1 class="p-root" style="color: black !important; text-decoration: underline; font-weight: bold; font-size: 24pt;">${root.RootID || (rIdx + 1)} : ${root.name}</h1>`;
        const parents = root.parents || [];
        parents.forEach(parent => {
            html += `<h2 class="p-parent" style="color: black !important; font-weight: bold; font-size: 18pt; margin-left: 20px;">${parent.ParentID || ''} : ${parent.name}</h2>`;
            const children = parent.children || [];
            children.forEach(child => {
                html += `<h3 class="p-child" style="color: black !important; font-weight: bold; font-size: 14pt; margin-left: 40px;">${child.CHILDID || ''} : ${child.name}</h3>`;
                const siblings = child.siblings || [];
                siblings.forEach(sibling => {
                    html += `<div class="p-sibling" style="color: black !important; font-size: 12pt; margin-left: 60px;">${sibling.siblingID || ''} : ${sibling.name}</div>`;
                });
            });
        });
    });
    html += '</div>';
    container.innerHTML = html;
    console.log("Printer view rendered with " + projectData.roots.length + " roots.");
}
