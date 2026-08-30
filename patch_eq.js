const fs = require('fs');
let html = fs.readFileSync('app/src/main/assets/www/index.html', 'utf8');

const oldEq = 'if (currentAudio && !currentAudio.paused && currentItem) {';
const newEq = 'if (currentItem && (window.AndroidBridge ? nativeIsPlaying : (currentAudio && !currentAudio.paused))) {';
html = html.replace(oldEq, newEq);

fs.writeFileSync('app/src/main/assets/www/index.html', html, 'utf8');
