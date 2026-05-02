import { log } from "./../utils/logger.js";
export function getChildren(t) { log("getChildren", "Retrieving children", { t });
    if (!t) return null;
    return t.roots || t.parents || t.children || t.siblings || null;
}
