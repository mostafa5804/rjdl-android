const fs = require('fs');
let html = fs.readFileSync('app/src/main/assets/www/index.html', 'utf8');

// Replace the condition
const oldCond = 'if (currentItem && (currentItem.permlink || currentItem.id) === (item.permlink || item.id) && currentAudio.src) {';
const newCond = 'if (currentItem && (currentItem.permlink || currentItem.id) === (item.permlink || item.id) && (currentAudio.src || window.AndroidBridge)) {';
html = html.replace(oldCond, newCond);

// We also need to fix `!currentAudio.paused`.
// If Native is playing, we need a way to know if it's paused or not.
// We can use a global variable `nativeIsPlaying` updated by `onNativePlaybackStateChanged`.
const oldNativeHooks = 'window.onNativePlaybackStateChanged = function(isPlaying) {';
const newNativeHooks = 'let nativeIsPlaying = false;\nwindow.onNativePlaybackStateChanged = function(isPlaying) {\n  nativeIsPlaying = isPlaying;';
html = html.replace(oldNativeHooks, newNativeHooks);

// Now change `if (!currentAudio.paused)` to `if (window.AndroidBridge ? nativeIsPlaying : !currentAudio.paused)`
const oldPausedCheck = 'if (!currentAudio.paused) {';
const newPausedCheck = 'if (window.AndroidBridge ? nativeIsPlaying : !currentAudio.paused) {';
html = html.replace(oldPausedCheck, newPausedCheck);

fs.writeFileSync('app/src/main/assets/www/index.html', html, 'utf8');
