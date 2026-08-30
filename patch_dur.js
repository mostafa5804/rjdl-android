const fs = require('fs');
let html = fs.readFileSync('app/src/main/assets/www/index.html', 'utf8');

// Replace the read-only duration assignment
html = html.replace('currentAudio.duration = durMs / 1000;', 'currentAudio._fakeDuration = durMs / 1000;');

// Also replace usages of currentAudio.duration with (currentAudio._fakeDuration || currentAudio.duration)
html = html.replace(/currentAudio\.duration/g, "(currentAudio._fakeDuration || currentAudio.duration)");

// Wait, the regex might replace the one I just fixed, so let's be careful.
