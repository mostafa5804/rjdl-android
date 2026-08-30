const fs = require('fs');
let html = fs.readFileSync('app/src/main/assets/www/index.html', 'utf8');

// Replace play commands
html = html.replace(/currentAudio\.pause\(\);/g, "if(window.AndroidBridge){window.AndroidBridge.pause();}else{currentAudio.pause();}");
html = html.replace(/currentAudio\.play\(\)/g, "(window.AndroidBridge ? (window.AndroidBridge.resume(), Promise.resolve()) : currentAudio.play())");

// The tough part is the fresh play logic:
//   currentAudio.src = proxyUrl(audioUrl);
//   currentAudio.play().then(() => { ... })
// We will replace `currentAudio.src = ...` up to `currentAudio.play().then(() => {`
// Let's do it manually with a regex or simple string replacement.
