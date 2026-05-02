// js/Mobile/setup.js

function isMobile() {
    return /Mobi/i.test(navigator.userAgent);
}

function loadMobileCSS() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/mobile.css';
    document.head.appendChild(link);
}

export function setupMobile() {
    if (isMobile()) {
        loadMobileCSS();
    }
}
