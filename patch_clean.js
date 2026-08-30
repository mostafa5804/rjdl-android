const fs = require('fs');
let html = fs.readFileSync('app/src/main/assets/www/index.html', 'utf8');

const hooks = `
let nativeDuration = 0;
// --- NATIVE BRIDGE HOOKS ---
window.onNativePlaybackStateChanged = function(isPlaying) {
  if (currentAudio) currentAudio.paused = !isPlaying;
  if (isPlaying) {
    setPlayState(currentPlayBtn, true); setPlayState(bpPlayBtn, true); setPlayState(fpPlayBtn, true);
    bottomPlayer.classList.add('active');
    updateEqualizers();
  } else {
    setPlayState(currentPlayBtn, false); setPlayState(bpPlayBtn, false); setPlayState(fpPlayBtn, false);
    updateEqualizers();
  }
};
window.onNativeProgress = function(posMs, durMs) {
  if (!durMs) return;
  nativeDuration = durMs / 1000;
  if (currentAudio) {
      currentAudio.currentTime = posMs / 1000;
  }
  const pct = (posMs / durMs) * 100;
  bpProgress.value = pct; fpProgress.value = pct;
  const cTime = fmtTime(posMs / 1000);
  const tTime = fmtTime(durMs / 1000);
  $('#bpTime').textContent = cTime + ' / ' + tTime;
  $('#fpTime').textContent = cTime + ' / ' + tTime;
};
window.onNativeTrackChanged = function(jsonStr) {
  try {
     const json = JSON.parse(jsonStr);
     const coverSrc = json.coverUrl || '';
     $('#bpCover').src = coverSrc;
     $('#bpTitle').textContent = json.title;
     $('#bpArtist').textContent = json.artist || '—';
     $('#fpCover').src = coverSrc;
     $('#fpArtGlow').style.backgroundImage = 'url("' + coverSrc + '")';
     $('#fpTitle').textContent = json.title;
     $('#fpArtist').textContent = json.artist || '—';
  } catch(e){}
};
window.onNativePlaybackEnded = function() {
  playNextInQueue();
};

function getDuration() {
    return window.AndroidBridge ? nativeDuration : (currentAudio.duration || 0);
}
`;

html = html.replace('function stopAudio() {', hooks + '\nfunction stopAudio() {');

// Replace fresh play
const oldFreshPlay = `currentAudio.pause();
  currentAudio.src = proxyUrl(audioUrl);`;
const newFreshPlay = `currentAudio.pause();
  if (window.AndroidBridge) {
    window.AndroidBridge.playMedia(item.permlink || item.id, item.title, item.artist || '—', proxyUrl(item.cover), proxyUrl(audioUrl));
  } else {
    currentAudio.src = proxyUrl(audioUrl);
  }`;
html = html.replace(oldFreshPlay, newFreshPlay);

// Replace currentAudio.play() inside fresh load
const oldPlay1 = `currentAudio.play().then(() => {
    setPlayState(btn, true); setPlayState(bpPlayBtn, true); setPlayState(fpPlayBtn, true);`;
const newPlay1 = `(window.AndroidBridge ? Promise.resolve() : currentAudio.play()).then(() => {
    setPlayState(btn, true); setPlayState(bpPlayBtn, true); setPlayState(fpPlayBtn, true);`;
html = html.replace(oldPlay1, newPlay1);

// Replace pause inside toggle
const oldPauseToggle = `if (!currentAudio.paused) {
      currentAudio.pause();`;
const newPauseToggle = `if (!currentAudio.paused) {
      if (window.AndroidBridge) window.AndroidBridge.pause(); else currentAudio.pause();`;
html = html.replace(oldPauseToggle, newPauseToggle);

// Replace play inside toggle
const oldPlayToggle = `} else {
      currentAudio.play().then(() => {`;
const newPlayToggle = `} else {
      (window.AndroidBridge ? (window.AndroidBridge.resume(), Promise.resolve()) : currentAudio.play()).then(() => {`;
html = html.replace(oldPlayToggle, newPlayToggle);

// Replace pause inside stopAudio
const oldStopAudio = `if (currentAudio) currentAudio.pause();`;
const newStopAudio = `if (window.AndroidBridge) window.AndroidBridge.pause(); else if (currentAudio) currentAudio.pause();`;
html = html.replace(oldStopAudio, newStopAudio);

// Replace duration usage in seeking
const oldBp = `bpProgress.oninput = e => {
  e.stopPropagation();
  if (currentAudio && currentAudio.duration) {
    currentAudio.currentTime = (bpProgress.value / 100) * currentAudio.duration;
  }
};`;
const newBp = `bpProgress.oninput = e => {
  e.stopPropagation();
  const d = getDuration();
  if (window.AndroidBridge && d) {
    window.AndroidBridge.seekTo(Math.floor((bpProgress.value / 100) * d * 1000));
  } else if (currentAudio && d) {
    currentAudio.currentTime = (bpProgress.value / 100) * d;
  }
};`;
html = html.replace(oldBp, newBp);

const oldFp = `fpProgress.oninput = () => {
  if (currentAudio && currentAudio.duration) {
    currentAudio.currentTime = (fpProgress.value / 100) * currentAudio.duration;
  }
};`;
const newFp = `fpProgress.oninput = () => {
  const d = getDuration();
  if (window.AndroidBridge && d) {
    window.AndroidBridge.seekTo(Math.floor((fpProgress.value / 100) * d * 1000));
  } else if (currentAudio && d) {
    currentAudio.currentTime = (fpProgress.value / 100) * d;
  }
};`;
html = html.replace(oldFp, newFp);

fs.writeFileSync('app/src/main/assets/www/index.html', html, 'utf8');
