const fs = require('fs');
let html = fs.readFileSync('app/src/main/assets/www/index.html', 'utf8');

// Remove the readonly assignment
html = html.replace('if (currentAudio) currentAudio.paused = !isPlaying;', '/* read-only, ignored */');

fs.writeFileSync('app/src/main/assets/www/index.html', html, 'utf8');
