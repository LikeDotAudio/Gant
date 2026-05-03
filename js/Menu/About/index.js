import { setLoggerEnabled, isLoggerEnabled } from '../../utils/logger.js';

export function openWebsite() {
    window.open('https://www.Like.audio', '_blank');
}

export function openGithub() {
    window.open('https://github.com/LikeDotAudio/GantDoIt', '_blank');
}

export function toggleLogger(enabled) {
    setLoggerEnabled(enabled);
}

export { isLoggerEnabled };
