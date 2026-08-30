const fs = require('fs');
let html = fs.readFileSync('app/src/main/assets/www/index.html', 'utf8');

const oldBp = `bpProgress.oninput = e => {
  e.stopPropagation();
  if (currentAudio && currentAudio.duration) {
    currentAudio.currentTime = (bpProgress.value / 100) * currentAudio.duration;
  }
};`;
const newBp = `bpProgress.oninput = e => {
  e.stopPropagation();
  if (window.AndroidBridge && currentAudio && currentAudio.duration) {
    window.AndroidBridge.seekTo(Math.floor((bpProgress.value / 100) * currentAudio.duration * 1000));
  } else if (currentAudio && currentAudio.duration) {
    currentAudio.currentTime = (bpProgress.value / 100) * currentAudio.duration;
  }
};`;
html = html.replace(oldBp, newBp);

const oldFp = `fpProgress.oninput = () => {
  if (currentAudio && currentAudio.duration) {
    currentAudio.currentTime = (fpProgress.value / 100) * currentAudio.duration;
  }
};`;
const newFp = `fpProgress.oninput = () => {
  if (window.AndroidBridge && currentAudio && currentAudio.duration) {
    window.AndroidBridge.seekTo(Math.floor((fpProgress.value / 100) * currentAudio.duration * 1000));
  } else if (currentAudio && currentAudio.duration) {
    currentAudio.currentTime = (fpProgress.value / 100) * currentAudio.duration;
  }
};`;
html = html.replace(oldFp, newFp);

fs.writeFileSync('app/src/main/assets/www/index.html', html, 'utf8');
