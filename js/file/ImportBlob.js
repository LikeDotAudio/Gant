/**
 * js/file/ImportBlob.js
 * Handles the "Import BLOB" feature which allows users to paste unstructured text 
 * (tabs, lists, colon-separated) and converts it into a task hierarchy.
 * Includes a live preview and staging area.
 */

import { state } from '../core/state.js';
import { refreshIds, findTask, findParentAndIndex, getTaskId } from '../Rows/index.js';
import { Z_INDEX, COLORS } from '../core/constants.js';

let stagedTasksForImport = [];

/**
 * Entry point to display the BLOB import overlay.
 * 
 * @param {Object} projectData - The current project structure.
 * @param {Object} uiElements - Global UI elements.
 * @param {Function} renderViewCallback - Function to trigger a view refresh.
 */
export function showBlobImportOverlay(projectData, uiElements, renderViewCallback) {
    let importOverlayElement = document.getElementById('blob-import-overlay');
    if (!importOverlayElement) {
        importOverlayElement = createImportOverlay(uiElements, renderViewCallback);
    }
    
    importOverlayElement.style.display = 'flex';
    stagedTasksForImport = [];
    
    const pasteInputArea = document.getElementById('blob-paste-area');
    const previewDisplayArea = document.getElementById('blob-preview-area');
    
    if (pasteInputArea) {
        pasteInputArea.innerHTML = "";
    }
    
    if (previewDisplayArea) {
        previewDisplayArea.innerHTML = '<div style="color:#666; font-style:italic;">Live preview will appear here...</div>';
    }
    
    updateStagedTasksCountDisplay();
}

/**
 * Creates the DOM structure for the import overlay with all its sub-components.
 */
function createImportOverlay(uiElements, renderViewCallback) {
    const overlayShield = document.createElement('div');
    overlayShield.id = 'blob-import-overlay';
    overlayShield.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.85); display: none;
        justify-content: center; align-items: center; z-index: ${Z_INDEX.BLOB_IMPORT_OVERLAY};
        font-family: 'Segoe UI', sans-serif;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: #242629; padding: 25px; border-radius: 8px;
        border: 1px solid #33363a; display: flex; flex-direction: column;
        gap: 15px; width: 800px; color: #e1e2e5; box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    `;

    const modalTitle = document.createElement('h3');
    modalTitle.innerText = "📋 Import BLOB (with Live Preview)";
    modalTitle.style.margin = "0";
    modalTitle.style.color = COLORS.ACCENT;
    modalContent.appendChild(modalTitle);

    const splitLayoutContainer = document.createElement('div');
    splitLayoutContainer.style.display = "flex";
    splitLayoutContainer.style.gap = "20px";
    splitLayoutContainer.style.height = "400px";

    const leftInputColumn = document.createElement('div');
    leftInputColumn.style.flex = "1";
    leftInputColumn.style.display = "flex";
    leftInputColumn.style.flexDirection = "column";
    leftInputColumn.style.gap = "10px";

    const helpInstruction = document.createElement('p');
    helpInstruction.innerHTML = `Paste items below. Supports Tabs, [ ], Parent: Child, and Formatting.`;
    helpInstruction.style.cssText = "font-size: 11px; color: #888; margin: 0;";
    leftInputColumn.appendChild(helpInstruction);

    const pasteInputArea = document.createElement('div');
    pasteInputArea.id = 'blob-paste-area';
    pasteInputArea.contentEditable = true;
    pasteInputArea.style.cssText = `
        background: #1a1c1e; border: 1px solid #444; flex-grow: 1;
        overflow-y: auto; padding: 12px; border-radius: 4px;
        outline: none; color: #fff; font-size: 13px; line-height: 1.4; white-space: pre-wrap;
    `;
    
    const previewDisplayArea = document.createElement('div');
    previewDisplayArea.id = 'blob-preview-area';
    previewDisplayArea.style.cssText = `
        background: #111; border: 1px solid #333; flex: 1;
        overflow-y: auto; padding: 12px; border-radius: 4px;
        font-size: 12px; color: #ccc; font-family: monospace;
    `;

    // Real-time parsing as user types or pastes
    pasteInputArea.oninput = () => {
        const parsedTasks = parseRawInputText(pasteInputArea);
        renderHierarchyPreview(parsedTasks, previewDisplayArea);
    };

    leftInputColumn.appendChild(pasteInputArea);

    const rightPreviewColumn = document.createElement('div');
    rightPreviewColumn.style.flex = "1";
    rightPreviewColumn.style.display = "flex";
    rightPreviewColumn.style.flexDirection = "column";
    rightPreviewColumn.style.gap = "10px";

    const previewSectionLabel = document.createElement('div');
    previewSectionLabel.innerText = "PARSED HIERARCHY PREVIEW:";
    previewSectionLabel.style.fontSize = "10px";
    previewSectionLabel.style.fontWeight = "bold";
    previewSectionLabel.style.color = "#666";
    rightPreviewColumn.appendChild(previewSectionLabel);
    rightPreviewColumn.appendChild(previewDisplayArea);

    splitLayoutContainer.appendChild(leftInputColumn);
    splitLayoutContainer.appendChild(rightPreviewColumn);
    modalContent.appendChild(splitLayoutContainer);

    const appendToStagingButton = document.createElement('button');
    appendToStagingButton.innerText = "➕ Append to Staging List";
    appendToStagingButton.style.cssText = "background: #2d7a4b; color: #fff; border: none; padding: 10px; cursor: pointer; border-radius: 4px; font-weight: bold;";
    appendToStagingButton.onclick = () => {
        const newlyParsedTasks = parseRawInputText(pasteInputArea);
        if (newlyParsedTasks.length > 0) {
            stagedTasksForImport.push(...newlyParsedTasks);
            pasteInputArea.innerHTML = "";
            previewDisplayArea.innerHTML = '<div style="color:#666; font-style:italic;">Live preview will appear here...</div>';
            updateStagedTasksCountDisplay();
        }
    };
    modalContent.appendChild(appendToStagingButton);

    const stagingStatusDisplay = document.createElement('div');
    stagingStatusDisplay.id = 'staged-tasks-status';
    stagingStatusDisplay.style.cssText = `font-size: 13px; color: #aaa; background: #1a1c1e; padding: 8px; border-radius: 4px; border-left: 3px solid ${COLORS.ACCENT};`;
    stagingStatusDisplay.innerText = "Staged: 0 tasks";
    modalContent.appendChild(stagingStatusDisplay);

    const actionFooter = document.createElement('div');
    actionFooter.style.cssText = "display: flex; align-items: center; gap: 12px; margin-top: 5px;";

    const targetLocationSelect = document.createElement('select');
    targetLocationSelect.id = 'blob-target-select';
    targetLocationSelect.style.cssText = "background: #1a1c1e; color: #fff; border: 1px solid #444; padding: 8px; border-radius: 4px; outline: none; flex-grow: 1;";
    
    const targetLocationOptions = [
        { value: "root", text: "Append as new Roots" },
        { value: "child", text: "As Children of selected" },
        { value: "below", text: "As Siblings below selected" }
    ];
    
    targetLocationOptions.forEach(optionConfig => {
        const optionElement = document.createElement('option');
        optionElement.value = optionConfig.value; 
        optionElement.innerText = optionConfig.text; 
        targetLocationSelect.appendChild(optionElement);
    });
    actionFooter.appendChild(targetLocationSelect);

    const cancelButton = document.createElement('button');
    cancelButton.innerText = "Cancel";
    cancelButton.style.cssText = "padding: 8px 16px; cursor: pointer; background: #3e444a; border: none; color: #ccc; border-radius: 4px;";
    cancelButton.onclick = () => { 
        overlayShield.style.display = 'none'; 
    };
    actionFooter.appendChild(cancelButton);

    const finalizeImportButton = document.createElement('button');
    finalizeImportButton.innerText = "🚀 Finalize Import";
    finalizeImportButton.style.cssText = `background: ${COLORS.ACCENT}; color: #fff; border: none; padding: 8px 20px; cursor: pointer; border-radius: 4px; font-weight: bold;`;
    finalizeImportButton.onclick = () => {
        finalizeStagedImport(targetLocationSelect.value, renderViewCallback);
        overlayShield.style.display = 'none';
    };
    actionFooter.appendChild(finalizeImportButton);

    modalContent.appendChild(actionFooter);
    overlayShield.appendChild(modalContent);
    document.body.appendChild(overlayShield);
    
    return overlayShield;
}

/**
 * Renders a hierarchical text representation of the parsed tasks for the user.
 */
function renderHierarchyPreview(tasksToPreview, displayAreaElement) {
    if (!tasksToPreview || tasksToPreview.length === 0) {
        displayAreaElement.innerHTML = '<div style="color:#666; font-style:italic;">No tasks detected yet...</div>';
        return;
    }

    function generatePreviewHtml(taskList, indentationLevel = 0) {
        let concatenatedHtml = "";
        taskList.forEach(task => {
            const indentationPrefix = "&nbsp;".repeat(indentationLevel * 4);
            const labelColorHex = indentationLevel === 0 ? COLORS.ACCENT : (indentationLevel === 1 ? "#fff" : "#888");
            const labelFontWeight = indentationLevel === 0 ? "bold" : "normal";
            
            concatenatedHtml += `
                <div style="margin-bottom: 2px;">
                    <span style="color:#444">${indentationPrefix}</span>
                    <span style="color:${labelColorHex}; font-weight:${labelFontWeight}">${task.name}</span>
                </div>`;
            
            // Check for children in any of the possible property names
            const childTasks = task.roots || task.parents || task.children || task.siblings;
            if (childTasks && childTasks.length > 0) {
                concatenatedHtml += generatePreviewHtml(childTasks, indentationLevel + 1);
            }
        });
        return concatenatedHtml;
    }
    
    displayAreaElement.innerHTML = generatePreviewHtml(tasksToPreview);
}

/**
 * Updates the footer status label with the current number of staged items.
 */
function updateStagedTasksCountDisplay() {
    const statusDisplayElement = document.getElementById('staged-tasks-status');
    if (statusDisplayElement) {
        statusDisplayElement.innerText = `Staged for import: ${stagedTasksForImport.length} top-level items (plus nested content)`;
    }
}

/**
 * Main parser dispatcher. Detects indentation to choose the parsing strategy.
 */
function parseRawInputText(pasteAreaElement) {
    const rawTextContent = pasteAreaElement.innerText;
    const individualLines = rawTextContent.split(/\r?\n/).filter(line => line.trim());
    
    // Heuristic: If any line starts with a tab or multiple spaces, use the hierarchical tab parser.
    const detectedIndentation = individualLines.some(line => line.startsWith('\t') || line.startsWith('    '));
    
    if (detectedIndentation) {
        return parseTabIndentedContent(individualLines);
    }
    
    return parseInformalListContent(individualLines);
}

/**
 * Parses content where hierarchy is defined by leading tabs or 4-space groups.
 */
function parseTabIndentedContent(textLines) {
    const parsedHierarchy = [];
    const levelStack = [];

    textLines.forEach(line => {
        let indentationDepth = 0;
        const leadingWhitespaceMatch = line.match(/^(\t|    )+/);
        if (leadingWhitespaceMatch) {
            indentationDepth = leadingWhitespaceMatch[0].replace(/    /g, '\t').length;
        }

        const taskName = line.trim().replace(/^\[\s*\]\s*/, '');
        const newTaskObject = { name: taskName, duration: 1, progress: 0 };

        if (indentationDepth === 0) {
            parsedHierarchy.push(newTaskObject); 
            levelStack[0] = newTaskObject; 
            levelStack.length = 1;
        } else {
            let parentTask = levelStack[indentationDepth - 1] || levelStack[levelStack.length - 1];
            if (!parentTask) {
                parentTask = { name: "Imported Root", duration: 1, progress: 0 };
                parsedHierarchy.push(parentTask); 
                levelStack[0] = parentTask;
            }

            // Assign as child based on the current system's expected schema properties
            if (indentationDepth === 1) { 
                if (!parentTask.parents) parentTask.parents = []; 
                parentTask.parents.push(newTaskObject); 
            } else if (indentationDepth === 2) { 
                if (!parentTask.children) parentTask.children = []; 
                parentTask.children.push(newTaskObject); 
            } else { 
                if (!parentTask.siblings) parentTask.siblings = []; 
                parentTask.siblings.push(newTaskObject); 
            }

            levelStack[indentationDepth] = newTaskObject; 
            levelStack.length = indentationDepth + 1;
        }
    });

    return parsedHierarchy;
}

/**
 * Parses content with informal markers like [ ], Colon prefixes, or SCREAMING_CAPS headers.
 */
function parseInformalListContent(textLines) {
    const parsedHierarchy = [];
    let currentLastRoot = null;
    let currentLastParent = null;

    textLines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        // Check for checkbox style: [ ] Task Name
        if (trimmedLine.startsWith('[ ]') || trimmedLine.startsWith('[]')) {
            const taskName = trimmedLine.replace(/^\[\s*\]\s*/, '');
            if (!currentLastRoot) { 
                currentLastRoot = { name: "Imported Root", duration: 1, progress: 0 }; 
                parsedHierarchy.push(currentLastRoot); 
            }
            if (!currentLastParent) { 
                currentLastParent = { name: "Imported Parent", duration: 1, progress: 0 }; 
                if (!currentLastRoot.parents) currentLastRoot.parents = []; 
                currentLastRoot.parents.push(currentLastParent); 
            }
            if (!currentLastParent.children) currentLastParent.children = [];
            currentLastParent.children.push({ name: taskName, duration: 1, progress: 0 });
            return;
        }

        // Check for colon style: Parent Name: Child Name
        if (trimmedLine.includes(':') && !trimmedLine.startsWith('http')) {
            const [parentPart, childPart] = trimmedLine.split(':').map(part => part.trim());
            if (parentPart && childPart) {
                if (!currentLastRoot) { 
                    currentLastRoot = { name: "Imported Root", duration: 1, progress: 0 }; 
                    parsedHierarchy.push(currentLastRoot); 
                }
                const newParentTask = { name: parentPart, duration: 1, progress: 0 };
                if (!currentLastRoot.parents) currentLastRoot.parents = [];
                currentLastRoot.parents.push(newParentTask);
                newParentTask.children = [{ name: childPart, duration: 1, progress: 0 }];
                currentLastParent = newParentTask;
                return;
            }
        }

        // Check for header style: ALL CAPS NAME (likely a root/phase)
        if (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 2) {
            const newRootTask = { name: trimmedLine, duration: 1, progress: 0 };
            parsedHierarchy.push(newRootTask); 
            currentLastRoot = newRootTask; 
            currentLastParent = null;
            return;
        }

        // Fallback for plain text lines
        if (!currentLastRoot) { 
            currentLastRoot = { name: trimmedLine, duration: 1, progress: 0 }; 
            parsedHierarchy.push(currentLastRoot); 
            currentLastParent = null; 
        } else if (!currentLastParent) { 
            currentLastParent = { name: trimmedLine, duration: 1, progress: 0 }; 
            if (!currentLastRoot.parents) currentLastRoot.parents = []; 
            currentLastRoot.parents.push(currentLastParent); 
        } else { 
            // Also treat as a parent/summary if nested deep
            const genericTask = { name: trimmedLine, duration: 1, progress: 0 }; 
            if (!currentLastRoot.parents) currentLastRoot.parents = []; 
            currentLastRoot.parents.push(genericTask); 
            currentLastParent = genericTask;
        }
    });

    return parsedHierarchy;
}

/**
 * Finalizes the import by merging the staged items into the active project structure.
 * 
 * @param {string} targetMode - 'root', 'child', or 'below'.
 * @param {Function} renderViewCallback - Function to refresh the Gantt chart.
 */
function finalizeStagedImport(targetMode, renderViewCallback) {
    if (stagedTasksForImport.length === 0) return;

    const currentlySelectedTaskFullId = Array.from(state.selectedTaskFullIds)[0];

    if (targetMode === 'root' || !currentlySelectedTaskFullId) {
        // APPEND AS NEW ROOTS
        let lastUsedRootId = 0;
        if (state.projectData.roots.length > 0) {
            const lastRootTask = state.projectData.roots[state.projectData.roots.length - 1];
            const lastRootShortId = getTaskId(lastRootTask);
            lastUsedRootId = parseInt(lastRootShortId) || 0;
        }
        
        // Manual refresh for these new roots to use a +10 increment for better spacing
        stagedTasksForImport.forEach((task, index) => {
            const newRootShortId = (lastUsedRootId + (index + 1) * 10).toString();
            task.RootID = newRootShortId;
            
            // Nested items within these new roots use standard refreshIds (1, 2, 3...)
            const nestedCollections = task.roots || task.parents || task.children || task.siblings;
            if (nestedCollections) {
                refreshIds(nestedCollections, 1);
            }
        });

        state.projectData.roots.push(...stagedTasksForImport);
    } else {
        // NEST WITHIN OR NEXT TO SELECTED
        if (targetMode === 'child') {
            const targetTask = findTask(state.projectData.roots, currentlySelectedTaskFullId);
            if (targetTask) {
                // Determine which children property to use based on target's existing schema
                if (targetTask.id && !targetTask.RootID && !targetTask.ParentID && !targetTask.CHILDID) {
                     if (!targetTask.parents) targetTask.parents = []; 
                     targetTask.parents.push(...stagedTasksForImport);
                } else if (targetTask.ParentID) {
                     if (!targetTask.children) targetTask.children = []; 
                     targetTask.children.push(...stagedTasksForImport);
                } else {
                     if (!targetTask.children) targetTask.children = []; 
                     targetTask.children.push(...stagedTasksForImport);
                }
            }
        } else if (targetMode === 'below') {
            const { parent: targetParent, index: targetIndex } = findParentAndIndex(state.projectData.roots, currentlySelectedTaskFullId);
            if (targetParent && targetIndex !== -1) {
                targetParent.children.splice(targetIndex + 1, 0, ...stagedTasksForImport);
            }
        }
        
        // Refresh the whole tree to ensure dot-notated full IDs are updated
        refreshIds(state.projectData.roots);
    }

    renderViewCallback();
}
