const fs = require('fs');

const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl" id="htmlRoot">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#090D16" id="themeMeta">
<meta name="color-scheme" content="light dark">
<title>رادیوجوان دانلودر | RJ Studio v1.1</title>

<!-- Fonts & Scripts -->
<link rel="manifest" href="./manifest.json">
<link rel="apple-touch-icon" href="./icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
<script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script>

<style>
:root {
  --radius-xs: 8px;
  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 24px;
  --radius-pill: 9999px;

  --bg: #090D16;
  --surface: #111827;
  --surface-tonal: #182234;
  --surface-tonal-hover: #222F47;
  --surface-glass: rgba(17, 24, 39, 0.92);
  --line: rgba(255, 255, 255, 0.08);
  --line-strong: rgba(255, 255, 255, 0.16);

  --text: #F8FAFC;
  --muted: #94A3B8;
  --title-slate: #CBD5E1;

  --primary: #3B82F6;
  --primary-hover: #2563EB;
  --primary-glow: rgba(59, 130, 246, 0.28);
  --primary-container: rgba(59, 130, 246, 0.16);
  --on-primary-container: #93C5FD;

  --secondary: #6366F1;
  --danger: #EF4444;
  --danger-container: rgba(239, 68, 68, 0.16);
  --warn: #F59E0B;

  --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.25);
  --shadow-md: 0 12px 32px rgba(0, 0, 0, 0.4);
  --shadow-player: 0 -10px 35px rgba(0, 0, 0, 0.55);

  --shimmer-base: #182234;
  --shimmer-highlight: #24334D;
}

[data-theme="light"] {
  --bg: #F1F5F9;
  --surface: #FFFFFF;
  --surface-tonal: #F8FAFC;
  --surface-tonal-hover: #EEF2F6;
  --surface-glass: rgba(255, 255, 255, 0.95);
  --line: #E2E8F0;
  --line-strong: #CBD5E1;

  --text: #0F172A;
  --muted: #64748B;
  --title-slate: #475569;

  --primary: #2563EB;
  --primary-hover: #1D4ED8;
  --primary-glow: rgba(37, 99, 235, 0.2);
  --primary-container: #EFF6FF;
  --on-primary-container: #1D4ED8;

  --secondary: #4F46E5;
  --danger: #DC2626;
  --danger-container: #FEF2F2;

  --shadow-sm: 0 4px 12px rgba(148, 163, 184, 0.12);
  --shadow-md: 0 12px 30px rgba(148, 163, 184, 0.18);
  --shadow-player: 0 -8px 30px rgba(148, 163, 184, 0.22);

  --shimmer-base: #E2E8F0;
  --shimmer-highlight: #F8FAFC;
}

* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
html { font-size: 16px; }
body {
  font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, Tahoma, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  padding-bottom: 90px;
  transition: background-color 0.25s ease, color 0.25s ease;
  background-image:
    radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.08) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(99, 102, 241, 0.06) 0px, transparent 50%);
}

button, input, select { font: inherit; color: inherit; border: none; background: none; }
button { cursor: pointer; }
img { display: block; }
a { color: var(--on-primary-container); text-decoration: none; }
:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: var(--radius-sm); }

.wrap { max-width: 640px; margin: auto; padding: 18px 16px 30px; }

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0 4px;
}
.header-left { display: flex; align-items: center; gap: 12px; width: 100%; justify-content: space-between; }
.header-brand { display: flex; align-items: center; gap: 12px; }
.logo-container {
  width: 48px; height: 48px; border-radius: var(--radius-md); display: grid; place-items: center; flex: none;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35); overflow: hidden;
}
.logo-container svg { width: 100%; height: 100%; }
header h1 { font-size: 1.15rem; font-weight: 900; letter-spacing: -0.3px; }
header small { display: block; color: var(--muted); font-size: 0.74rem; margin-top: 2px; font-weight: 600; }

.card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 20px;
  border: 1px solid var(--line);
  position: relative;
}
.card + .card { margin-top: 18px; }

.section-label {
  font-size: 0.8rem; font-weight: 800; letter-spacing: 0.3px; color: var(--title-slate);
  margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;
}

.pwa-popup {
  position: fixed; bottom: 84px; left: 16px; right: 16px; max-width: 480px; margin: 0 auto;
  z-index: 500; background: var(--surface-glass); backdrop-filter: blur(16px);
  border: 1px solid var(--line-strong); border-radius: var(--radius-md); padding: 12px 16px;
  box-shadow: var(--shadow-md); animation: slideUpPopup 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUpPopup { from { transform: translateY(80px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.pwa-popup-content { display: flex; align-items: center; gap: 12px; }
.pwa-popup-icon { font-size: 1.6rem; flex: none; }
.pwa-popup-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.pwa-popup-text b { font-size: 0.85rem; }
.pwa-popup-text span { font-size: 0.74rem; color: var(--muted); line-height: 1.4; }
.pwa-popup-btns { display: flex; align-items: center; gap: 6px; flex: none; }

.tab-page { display: none; }
.tab-page.active { display: block; animation: tabFade 0.2s ease forwards; }
@keyframes tabFade { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

.field label { display: block; font-size: 0.8rem; color: var(--title-slate); margin-bottom: 8px; font-weight: 700; }
.field-input-wrap { position: relative; width: 100%; }
.field input {
  width: 100%; padding: 12px 16px 12px 40px; background: var(--surface-tonal); border: 1px solid var(--line);
  border-radius: var(--radius-md); color: var(--text); font-size: 0.88rem; font-weight: 500; transition: all 0.2s ease;
}
.field input:focus { border-color: var(--primary); background: var(--surface); box-shadow: 0 0 0 4px var(--primary-container); }
.field input::placeholder { color: var(--muted); opacity: 0.7; font-size: 0.84rem; font-weight: 400; }
.field .clear-btn {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted);
  width: 26px; height: 26px; border-radius: var(--radius-pill); display: none; place-items: center;
  font-size: 13px; background: var(--line); transition: 0.2s;
}
.field .clear-btn:hover { color: var(--text); }
.field .clear-btn.show { display: grid; }

.history-wrap { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.history-chip {
  background: var(--surface-tonal); border: 1px solid var(--line); border-radius: var(--radius-pill);
  padding: 6px 14px; font-size: 0.74rem; font-weight: 600; color: var(--muted); cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s ease;
}
.history-chip:hover { background: var(--surface-tonal-hover); color: var(--text); border-color: var(--line-strong); }

.btn {
  padding: 12px 22px; border-radius: var(--radius-pill); font-weight: 800; font-size: 0.88rem;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease; white-space: nowrap;
}
.btn.primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #ffffff; box-shadow: 0 6px 20px var(--primary-glow);
}
.btn.primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
.btn.ghost { background: var(--surface-tonal); color: var(--text); border: 1px solid var(--line); }
.btn.ghost:hover { background: var(--surface-tonal-hover); border-color: var(--line-strong); }
.btn.sm { padding: 7px 16px; font-size: 0.78rem; }
.btn.block { width: 100%; margin-top: 14px; height: 48px; }
.btn[disabled] { opacity: 0.55; pointer-events: none; }

.btn-play-sm {
  width: 42px; height: 42px; border-radius: var(--radius-pill); display: grid; place-items: center; flex: none;
  background: var(--primary-container); color: var(--primary); transition: all 0.2s ease; border: 1px solid var(--line); font-size: 15px;
}
.btn-play-sm:hover { transform: scale(1.06); background: var(--primary); color: #ffffff; }
.btn-play-sm.playing { background: var(--secondary); color: #ffffff; animation: pulsePlay 1.6s infinite; }
@keyframes pulsePlay {
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
}

.btn-action {
  display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px;
  border-radius: var(--radius-pill); color: var(--text); background: var(--surface); border: 1px solid var(--line);
  flex: none; box-shadow: var(--shadow-sm); transition: all 0.15s ease; font-size: 14px;
}
.btn-action:hover { background: var(--primary-container); color: var(--primary); border-color: var(--primary); transform: scale(1.08); }
.btn-action.fav.active { color: var(--danger); border-color: var(--danger); }

.equalizer-wrap {
  position: absolute; inset: 0; background: rgba(0, 0, 0, 0.55); border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center; gap: 3px; backdrop-filter: blur(2px);
}
.eq-bar {
  width: 3px; height: 14px; background: #ffffff; border-radius: 2px; animation: eqBounce 0.9s ease-in-out infinite alternate;
}
.eq-bar:nth-child(1) { animation-delay: 0.1s; height: 8px; }
.eq-bar:nth-child(2) { animation-delay: 0.3s; height: 16px; }
.eq-bar:nth-child(3) { animation-delay: 0.2s; height: 11px; }
@keyframes eqBounce { 0% { transform: scaleY(0.3); } 100% { transform: scaleY(1); } }

.skeleton-row { display: flex; flex-direction: column; gap: 10px; padding: 14px; border-bottom: 1px solid var(--line); }
.skeleton-top { display: flex; align-items: center; gap: 12px; }
.skeleton-box {
  background: linear-gradient(90deg, var(--shimmer-base) 25%, var(--shimmer-highlight) 50%, var(--shimmer-base) 75%);
  background-size: 200% 100%; animation: shimmerAnim 1.5s infinite; border-radius: var(--radius-xs);
}
.skeleton-img { width: 48px; height: 48px; border-radius: var(--radius-sm); flex: none; }
.skeleton-btn { width: 40px; height: 40px; border-radius: var(--radius-pill); flex: none; }
.skeleton-text-1 { width: 55%; height: 14px; margin-bottom: 6px; }
.skeleton-text-2 { width: 35%; height: 10px; }
.skeleton-actions { display: flex; justify-content: flex-end; gap: 8px; }
.skeleton-action-btn { width: 34px; height: 34px; border-radius: var(--radius-pill); }
@keyframes shimmerAnim { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

.hint { font-size: 0.78rem; color: var(--muted); margin-top: 12px; line-height: 1.6; font-weight: 500; }
.hint b { color: var(--text); }
#status { font-size: 0.82rem; color: var(--muted); margin-top: 10px; display: none; font-weight: 700; }
#status.show { display: block; }
#status.err { color: var(--danger); }
#status.warn { color: var(--warn); }
#result { display: none; margin-bottom: 18px; }
#result.show { display: block; }

.featured-box {
  display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: var(--radius-md);
  background: var(--primary-container); border: 1px solid rgba(59, 130, 246, 0.35); margin-bottom: 16px;
}
.featured-box img { width: 60px; height: 60px; border-radius: var(--radius-sm); object-fit: cover; flex: none; border: 2px solid var(--surface); box-shadow: var(--shadow-sm); }
.featured-box.artist-type img { border-radius: var(--radius-pill); }
.featured-box .f-meta { flex: 1; min-width: 0; }
.featured-box .f-badge {
  font-size: 0.68rem; font-weight: 800; color: var(--primary); background: var(--surface); padding: 2px 8px; border-radius: var(--radius-pill); display: inline-block; margin-bottom: 4px;
}
.featured-box .f-title { font-size: 0.98rem; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.pl-head { display: flex; gap: 16px; align-items: center; }
.pl-head img { width: 78px; height: 78px; border-radius: var(--radius-md); object-fit: cover; flex: none; box-shadow: var(--shadow-sm); border: 2px solid var(--surface); }
.pl-head .meta { min-width: 0; flex: 1; }
.pl-head .title { font-size: 1.08rem; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pl-head .sub { font-size: 0.78rem; color: var(--muted); margin-top: 3px; font-weight: 600; }
.pl-actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.pl-actions .btn { flex: 1; }

.dl-progress {
  display: none; align-items: center; gap: 10px; margin-top: 14px; padding: 10px 14px;
  border-radius: var(--radius-md); background: var(--surface-tonal); border: 1px solid var(--line); font-size: 0.76rem; font-weight: 700;
}
.dl-progress.show { display: flex; }
.dl-progress .track { flex: 1; height: 6px; border-radius: var(--radius-pill); background: var(--line-strong); overflow: hidden; }
.dl-progress .fill { height: 100%; width: 0; background: linear-gradient(90deg, var(--secondary), var(--primary)); transition: width 0.2s; }
.dl-progress .lbl { flex: none; color: var(--muted); min-width: 60px; text-align: center; }

.tracks {
  margin-top: 14px; max-height: 520px; overflow-y: auto; border: 1px solid var(--line);
  border-radius: var(--radius-md); background: var(--surface-tonal); scrollbar-width: none;
}
.tracks::-webkit-scrollbar { display: none; }

.trow {
  display: flex; flex-direction: column; gap: 10px; padding: 12px 14px; border-bottom: 1px solid var(--line); transition: background 0.15s ease;
}
.trow:last-child { border-bottom: none; }
.trow:hover { background: var(--surface-tonal-hover); }

.trow-top { display: flex; align-items: center; gap: 12px; }
.trow-cb { accent-color: var(--primary); width: 18px; height: 18px; flex: none; cursor: pointer; }
.trow-img-wrap { position: relative; width: 48px; height: 48px; flex: none; }
.trow-top img {
  width: 100%; height: 100%; border-radius: var(--radius-sm); object-fit: cover; background: var(--surface-tonal); box-shadow: var(--shadow-sm);
}
.trow-top .tmeta { flex: 1; min-width: 0; cursor: pointer; }
.trow-top .tt { font-size: 0.88rem; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
.trow-top .ta { font-size: 0.76rem; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; margin-top: 2px; font-weight: 600; }
.trow-bottom { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }

.single { display: flex; gap: 16px; align-items: center; }
.single img { width: 84px; height: 84px; border-radius: var(--radius-md); object-fit: cover; flex: none; box-shadow: var(--shadow-sm); }
.single .meta { min-width: 0; flex: 1; }
.badge {
  display: inline-block; font-size: 0.7rem; font-weight: 800; color: var(--on-primary-container);
  background: var(--primary-container); padding: 3px 10px; border-radius: var(--radius-pill); margin-bottom: 5px;
}
.single .title { font-size: 1.05rem; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.single .artist { font-size: 0.84rem; color: var(--muted); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.single .dur { font-size: 0.74rem; color: var(--title-slate); margin-top: 3px; font-weight: 700; }
.single-actions { display: flex; align-items: center; gap: 8px; margin-top: 16px; flex-wrap: wrap; }

.settings-group { display: flex; flex-direction: column; gap: 16px; }
.setting-item {
  display: flex; align-items: center; justify-content: space-between; padding: 12px 14px;
  background: var(--surface-tonal); border: 1px solid var(--line); border-radius: var(--radius-md);
}
.setting-info b { display: block; font-size: 0.86rem; font-weight: 800; }
.setting-info span { display: block; font-size: 0.74rem; color: var(--muted); margin-top: 2px; }
.setting-ctrl {
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-pill);
  padding: 6px 12px; font-size: 0.8rem; font-weight: 700; color: var(--text); outline: none;
}

.modal-backdrop {
  position: fixed; inset: 0; z-index: 600; background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px); display: none; align-items: flex-end; justify-content: center;
}
.modal-backdrop.show { display: flex; }
.modal-sheet {
  background: var(--surface); border-radius: var(--radius-lg) var(--radius-lg) 0 0; width: 100%; max-width: 640px;
  max-height: 82vh; display: flex; flex-direction: column; padding: 22px; box-shadow: var(--shadow-player);
  animation: slideUpModal 0.3s cubic-bezier(0.16, 1, 0.3, 1); border-top: 1px solid var(--line);
}
@keyframes slideUpModal { from { transform: translateY(100%); } to { transform: translateY(0); } }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.modal-header h3 { font-size: 1.05rem; font-weight: 900; }
.lyrics-body {
  flex: 1; overflow-y: auto; font-size: 0.92rem; line-height: 2; white-space: pre-line;
  text-align: center; color: var(--text); padding: 16px; background: var(--surface-tonal);
  border-radius: var(--radius-md); margin-bottom: 14px; border: 1px solid var(--line);
}

.bottom-player {
  position: fixed; bottom: 72px; left: 14px; right: 14px; max-width: 612px; margin: 0 auto;
  z-index: 120; background: var(--surface-glass); backdrop-filter: blur(20px);
  border: 1px solid var(--line-strong); border-radius: var(--radius-md); box-shadow: var(--shadow-player);
  padding: 10px 14px; transform: translateY(200%); opacity: 0; pointer-events: none;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
  direction: ltr !important; text-align: left;
}
.bottom-player.active { transform: translateY(0); opacity: 1; pointer-events: auto; }
.bp-content { display: flex; flex-direction: column; gap: 6px; }
.bp-main { display: flex; align-items: center; gap: 10px; }
.bp-cover { width: 44px; height: 44px; border-radius: var(--radius-sm); object-fit: cover; flex: none; box-shadow: var(--shadow-sm); }
.bp-meta { flex: 1; min-width: 0; cursor: pointer; }
.bp-title { font-size: 0.86rem; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bp-artist { font-size: 0.74rem; color: var(--muted); margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bp-controls { display: flex; align-items: center; gap: 6px; flex: none; }
.bp-btn-ctrl {
  width: 36px; height: 36px; border-radius: var(--radius-pill); display: grid; place-items: center;
  background: var(--surface-tonal); color: var(--text); border: 1px solid var(--line); transition: all 0.15s ease; font-size: 13px;
}
.bp-btn-ctrl:hover { background: var(--surface-tonal-hover); color: var(--primary); }
.bp-btn-ctrl.active { color: var(--danger); }
.bp-slider-wrap { display: flex; align-items: center; gap: 8px; font-size: 0.72rem; font-weight: 700; color: var(--muted); }
.bp-slider-wrap input[type=range] { flex: 1; height: 5px; accent-color: var(--primary); cursor: pointer; }

.full-player-sheet {
  position: fixed; inset: 0; z-index: 400; background: var(--bg); display: flex; flex-direction: column;
  justify-content: space-between; padding: calc(env(safe-area-inset-top, 16px) + 12px) 24px calc(env(safe-area-inset-bottom, 16px) + 20px);
  transform: translateY(100%); transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  overflow-y: auto; direction: ltr !important; text-align: left;
}
.full-player-sheet.show { transform: translateY(0); }

.fp-top-bar { display: flex; align-items: center; justify-content: space-between; width: 100%; max-width: 460px; margin: 0 auto 10px; }
.fp-icon-btn {
  width: 44px; height: 44px; border-radius: var(--radius-pill); display: grid; place-items: center;
  background: var(--surface-tonal); color: var(--text); border: 1px solid var(--line); transition: all 0.2s ease; font-size: 16px;
}
.fp-icon-btn:hover { background: var(--surface-tonal-hover); transform: scale(1.05); }
.fp-icon-btn.active { color: var(--danger); border-color: var(--danger); }

.fp-header-title { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.fp-header-sub { font-size: 0.72rem; font-weight: 800; color: var(--muted); letter-spacing: 1px; }
.fp-header-badge { font-size: 0.65rem; font-weight: 800; background: var(--primary-container); color: var(--primary); padding: 2px 10px; border-radius: var(--radius-pill); }

.fp-art-container {
  position: relative; width: 100%; max-width: 290px; margin: auto auto 14px; aspect-ratio: 1/1;
  display: flex; align-items: center; justify-content: center;
}
.fp-art-glow {
  position: absolute; inset: 12px; border-radius: var(--radius-lg); background-size: cover;
  background-position: center; filter: blur(32px); opacity: 0.45; z-index: 1;
}
.fp-cover-img {
  position: relative; z-index: 2; width: 100%; height: 100%; border-radius: var(--radius-lg); object-fit: cover;
  box-shadow: var(--shadow-md); border: 2px solid var(--line);
}

.fp-info-section { text-align: center; width: 100%; max-width: 460px; margin: 0 auto 12px; }
.fp-title { font-size: 1.25rem; font-weight: 900; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fp-artist { font-size: 0.88rem; font-weight: 600; color: var(--muted); margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.fp-seek-section { width: 100%; max-width: 440px; margin: 0 auto 14px; display: flex; flex-direction: column; gap: 6px; }
.fp-range-wrap input[type=range] {
  width: 100%; height: 6px; accent-color: var(--primary); cursor: pointer; border-radius: var(--radius-pill); background: var(--line-strong);
}
.fp-time-row { display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 700; color: var(--muted); }

.fp-main-controls { display: flex; align-items: center; justify-content: space-between; width: 100%; max-width: 420px; margin: 0 auto 14px; }
.fp-ctrl-btn {
  width: 46px; height: 46px; border-radius: var(--radius-pill); display: grid; place-items: center;
  background: var(--surface-tonal); color: var(--text); border: 1px solid var(--line); transition: all 0.2s ease; position: relative; font-size: 17px;
}
.fp-ctrl-btn:hover { background: var(--surface-tonal-hover); color: var(--primary); transform: scale(1.06); }
.fp-ctrl-btn.active { color: var(--primary); border-color: var(--primary); background: var(--primary-container); }
.fp-badge-repeat {
  position: absolute; top: -4px; right: -4px; font-size: 0.6rem; font-weight: 800; background: var(--primary);
  color: #fff; width: 16px; height: 16px; border-radius: var(--radius-pill); display: none; place-items: center;
}
.fp-badge-repeat.show { display: grid; }

.fp-ctrl-play {
  width: 68px; height: 68px; border-radius: var(--radius-pill); display: grid; place-items: center;
  background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #ffffff; box-shadow: 0 8px 24px var(--primary-glow);
  transition: all 0.2s ease; font-size: 24px;
}
.fp-ctrl-play:hover { transform: scale(1.06); filter: brightness(1.1); }

.fp-volume-section {
  display: flex; align-items: center; gap: 12px; width: 100%; max-width: 420px; margin: 0 auto 16px;
  background: var(--surface-tonal); padding: 8px 16px; border-radius: var(--radius-pill); border: 1px solid var(--line);
}
.fp-vol-btn { width: 30px; height: 30px; display: grid; place-items: center; color: var(--muted); flex: none; font-size: 15px; }
.fp-vol-btn:hover { color: var(--primary); }
.fp-vol-btn.active { color: var(--danger); }
.fp-vol-slider-wrap { flex: 1; display: flex; align-items: center; }
.fp-vol-slider-wrap input[type=range] {
  width: 100%; height: 5px; accent-color: var(--primary); cursor: pointer; border-radius: var(--radius-pill); background: var(--line-strong);
}

.fp-actions-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; width: 100%; max-width: 440px; margin: 0 auto; }
.fp-action-pill {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 12px 8px;
  border-radius: var(--radius-pill); font-size: 0.78rem; font-weight: 800; color: var(--text);
  background: var(--surface-tonal); border: 1px solid var(--line); transition: all 0.2s ease;
}
.fp-action-pill:hover { background: var(--surface-tonal-hover); transform: translateY(-1px); }
.fp-action-pill.primary { background: var(--primary-container); color: var(--primary); border-color: rgba(59, 130, 246, 0.35); }

/* Bottom Navigation Dock */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
  background: var(--surface-glass); backdrop-filter: blur(20px);
  border-top: 1px solid var(--line); box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.12);
  display: flex; justify-content: space-around; align-items: center;
  height: 66px; max-width: 640px; margin: 0 auto;
  border-top-left-radius: var(--radius-lg); border-top-right-radius: var(--radius-lg);
}
.nav-item {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  color: var(--muted); font-size: 0.74rem; font-weight: 800; width: 33.333%; padding: 6px 0; transition: all 0.2s ease;
}
.nav-item i { font-size: 19px; }
.nav-item.active { color: var(--primary); }

#toasts {
  position: fixed; bottom: 78px; inset-inline-end: 18px; z-index: 700; display: flex; flex-direction: column; gap: 8px; max-width: 320px;
}
.toast {
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 10px 16px;
  font-size: 0.82rem; font-weight: 700; box-shadow: var(--shadow-md); animation: toastIn 0.25s ease-out; color: var(--text);
}
.toast.err { border-color: rgba(239, 68, 68, 0.4); background: var(--danger-container); color: var(--danger); }
.toast.warn { border-color: rgba(245, 158, 11, 0.4); color: #B45309; }
.toast.out { opacity: 0; transform: translateX(-16px); transition: all 0.25s; }
@keyframes toastIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: none; } }

.app-footer {
  text-align: center; padding: 24px 16px 6px; font-size: 0.74rem; color: var(--muted); line-height: 1.8;
}
.app-footer a { color: var(--primary); font-weight: 800; display: inline-flex; align-items: center; gap: 4px; }
.app-footer span { display: inline-block; margin: 0 4px; }
</style>
</head>
<body>

<div class="wrap">
  <div class="pwa-popup" id="pwaPopup" style="display:none;">
    <div class="pwa-popup-content">
      <div class="pwa-popup-icon">📲</div>
      <div class="pwa-popup-text">
        <b data-i18n="pwaTitle">نصب وب‌اپلیکیشن رادیوجوان</b>
        <span data-i18n="pwaDesc">برای استفاده آفلاین و دسترسی سریع‌تر، اپلیکیشن را نصب کنید.</span>
      </div>
      <div class="pwa-popup-btns">
        <button type="button" class="btn primary sm" id="pwaInstallBtn" data-i18n="pwaBtn">نصب</button>
        <button type="button" class="btn ghost sm" id="pwaCloseBtn" title="بستن">✕</button>
      </div>
    </div>
  </div>

  <header>
    <div class="header-left">
      <div class="header-brand">
        <div class="logo-container">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
            <defs>
              <linearGradient id="rjBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#2563eb" />
                <stop offset="50%" stop-color="#3b82f6" />
                <stop offset="100%" stop-color="#4f46e5" />
              </linearGradient>
              <linearGradient id="glyphGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="100%" stop-color="#e0e7ff" />
              </linearGradient>
            </defs>
            <rect width="512" height="512" rx="128" fill="url(#rjBgGrad)" />
            <g fill="url(#glyphGrad)">
              <rect x="110" y="140" width="46" height="170" rx="23" />
              <rect x="356" y="140" width="46" height="170" rx="23" />
              <path d="M 185 145 C 198 145 208 153 213 164 L 236 215 V 155 C 236 144 245 135 256 135 C 267 135 276 144 276 155 V 215 L 299 164 C 304 153 314 145 327 145 C 342 145 353 158 350 173 L 272 312 C 264 326 248 326 240 312 L 162 173 C 159 158 170 145 185 145 Z" />
              <path d="M 224 280 L 256 325 L 288 280 Z" />
              <path d="M 125 355 C 175 400 337 400 387 355 C 397 346 413 348 421 359 C 430 370 427 386 416 395 C 348 450 164 450 96 395 C 85 386 82 370 91 359 C 99 348 115 346 125 355 Z" />
            </g>
          </svg>
        </div>
        <div>
          <h1>رادیوجوان دانلودر | RJ Studio</h1>
          <small>v1.1 · <span data-i18n="headerSub">دانلود و پخش آنلاین بدون محدودیت</span></small>
        </div>
      </div>
    </div>
  </header>

  <!-- TAB 1: Search, Download & Trending -->
  <div class="tab-page active" id="tabSearch">
    <div class="card">
      <span class="section-label" data-i18n="lblSearchTitle">جستجو و دریافت لینک مستقیم</span>
      <div class="field">
        <label for="rjUrl" data-i18n="lblInputLabel">لینک یا نام آهنگ / خواننده / پادکست</label>
        <div class="field-input-wrap">
          <input type="text" id="rjUrl" placeholder="مثلاً: Mar-Mari یا هایده یا پیوند rj.app...">
          <button class="clear-btn" id="clearBtn" title="پاک کردن">✕</button>
        </div>
      </div>

      <div class="history-wrap" id="historyChips"></div>

      <button class="btn primary block" id="fetchBtn" style="margin-top: 16px;">
        <i class="fa-solid fa-bolt"></i> <span data-i18n="btnFetch">دریافت اطلاعات و جستجو</span>
      </button>
      <div id="status"></div>
      <div class="hint" data-i18n="hintText">پشتیبانی کامل از <b>نام فارسی/انگلیسی</b>، <b>شوهای پادکست</b>، <b>صفحه خواننده</b> و <b>پیوندهای کوتاه</b>.</div>
    </div>

    <div id="result">
      <div class="card" id="singleCard" style="display:none">
        <span class="section-label" data-i18n="lblSingleTrack">موزیک انتخابی</span>
        <div class="single">
          <img id="sCover" alt="Cover">
          <div class="meta">
            <span class="badge" id="sBadge">آهنگ</span>
            <div class="title" id="sTitle"></div>
            <div class="artist" id="sArtist"></div>
            <div class="dur" id="sDur"></div>
          </div>
        </div>
        <div class="single-actions">
          <button type="button" class="btn-play-sm" id="sPlayBtn" title="پخش آنلاین"><i class="fa-solid fa-play"></i></button>
          <button class="btn primary" id="sDownload"><i class="fa-solid fa-download"></i> <span data-i18n="btnDownload">دانلود فایل</span></button>
          <button class="btn-action" id="sCopyLink" title="کپی لینک مستقیم"><i class="fa-solid fa-link"></i></button>
          <button class="btn-action" id="sLyrics" title="متن ترانه"><i class="fa-solid fa-align-right"></i></button>
          <button class="btn-action" id="sFav" title="نشان کردن"><i class="fa-solid fa-heart"></i></button>
        </div>
      </div>

      <div class="card" id="plCard" style="display:none">
        <div id="featuredBoxContainer" style="display:none;"></div>

        <div class="pl-head" id="plHead">
          <img id="plCover" alt="Collection Cover">
          <div class="meta">
            <div class="title" id="plTitle"></div>
            <div class="sub" id="plSub"></div>
          </div>
        </div>
        <div class="pl-actions" id="plActions">
          <button type="button" class="btn ghost sm" id="plSelectAll" data-i18n="btnSelectAll">انتخاب همه</button>
          <button type="button" class="btn ghost sm" id="plSelectNone" data-i18n="btnSelectNone">هیچ‌کدام</button>
          <button type="button" class="btn primary sm" id="plDlZip"><i class="fa-solid fa-file-zipper"></i> <span data-i18n="btnDlZip">دانلود انتخابی (ZIP)</span></button>
        </div>
        <div class="dl-progress" id="dlProgress">
          <span class="lbl" id="dlLbl">۰ / ۰</span>
          <div class="track"><div class="fill" id="dlFill"></div></div>
          <button type="button" class="btn ghost sm" id="dlCancel" data-i18n="btnCancel">لغو</button>
        </div>
        <div class="tracks" id="plTracks"></div>
      </div>
    </div>
    
      <div class="card">
        <span class="section-label">
          <span data-i18n="lblTrendingSongs">🔥 داغ‌ترین تک‌آهنگ‌های هفته</span>
          <small id="songsCount" style="color:var(--muted); font-weight:700;"></small>
        </span>
        <div class="tracks" id="songsTracks"></div>
        <button class="btn ghost block" id="songsLoadMore" data-i18n="btnLoadMore">بارگذاری موارد بیشتر</button>
      </div>
      <div class="card">
        <span class="section-label">
          <span data-i18n="lblTrendingPodcasts">🎙 تازه‌ترین قسمت‌های پادکست</span>
          <small id="podcastsCount" style="color:var(--muted); font-weight:700;"></small>
        </span>
        <div class="tracks" id="podcastsTracks"></div>
        <button class="btn ghost block" id="podcastsLoadMore" data-i18n="btnLoadMore">بارگذاری موارد بیشتر</button>
      </div>
    </div>
  </div>

  <!-- TAB 2: Favorites -->
  <div class="tab-page" id="tabFavs">
    <div class="card">
      <span class="section-label" data-i18n="lblFavTitle">❤️ آرشیو قطعات نشان‌شده</span>
      <div class="tracks" id="favTracks"></div>
    </div>
  </div>

  <!-- TAB 3: Settings -->
  <div class="tab-page" id="tabSettings">
    <div class="card">
      <span class="section-label" data-i18n="lblSettingsTitle">تنظیمات سامانه</span>
      <div class="settings-group">
        <div class="setting-item">
          <div class="setting-info">
            <b data-i18n="setQualityTitle">کیفیت پیش‌فرض دانلود</b>
            <span data-i18n="setQualityDesc">کیفیت پیش‌فرشتی که برای فایل‌های صوتی بارگیری می‌شود.</span>
          </div>
          <select id="cfgQualitySelect" class="setting-ctrl">
            <option value="128">۱۲۸ (Standard)</option>
            <option value="320">۳۲۰ (Master)</option>
          </select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <b data-i18n="setThemeTitle">پوسته ظاهری</b>
            <span data-i18n="setThemeDesc">حالت تاریک، روشن یا هماهنگ با سیستم‌عامل.</span>
          </div>
          <select id="cfgThemeSelect" class="setting-ctrl">
            <option value="dark">تاریک (Dark)</option>
            <option value="light">روشن (Light)</option>
            <option value="system">سیستم (Auto)</option>
          </select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <b data-i18n="setLangTitle">زبان برنامه</b>
            <span data-i18n="setLangDesc">زبان محیط کاربری سامانه (فارسی / انگلیسی).</span>
          </div>
          <select id="cfgLangSelect" class="setting-ctrl">
            <option value="fa">فارسی (Persian)</option>
            <option value="en">English (US)</option>
          </select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <b data-i18n="setHistoryTitle">تاریخچه جستجو</b>
            <span data-i18n="setHistoryDesc">پاک کردن عبارات ثبت شده در حافظه دستگاه.</span>
          </div>
          <button type="button" class="btn ghost sm" style="color:var(--danger);" onclick="clearSearchHistoryManual()">
            <i class="fa-solid fa-trash"></i> <span data-i18n="btnClearHistory">پاک‌سازی</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="app-footer">
    <div>
      ساخته شده توسط مصطفی
      <span>·</span>
      <a href="https://github.com/mostafa5804/rjdownloader" target="_blank" rel="noopener">
        <i class="fa-brands fa-github"></i> گیت‌هاب وب
      </a>
      <span>·</span>
      <a href="https://github.com/mostafa5804/rjdl-android" target="_blank" rel="noopener">
        <i class="fa-brands fa-android"></i> نسخه اندروید (v1.1)
      </a>
    </div>
  </div>
</div>

<!-- Modal Drawer for Lyrics -->
<div class="modal-backdrop" id="lyricsModal">
  <div class="modal-sheet">
    <div class="modal-header">
      <h3 id="lyricsTitle">متن ترانه</h3>
      <button type="button" class="btn ghost sm" id="closeLyrics">✕</button>
    </div>
    <div class="lyrics-body" id="lyricsBody">در حال دریافت لیریکس ترانه...</div>
    <button class="btn primary block" id="copyLyricsBtn"><i class="fa-solid fa-copy"></i> <span data-i18n="btnCopyLyrics">کپی کردن متن ترانه</span></button>
  </div>
</div>

<!-- Sticky Capsule Mini Player -->
<div class="bottom-player" id="bottomPlayer">
  <div class="bp-content">
    <div class="bp-main">
      <img id="bpCover" class="bp-cover" src="" alt="">
      <div class="bp-meta" id="bpMetaArea">
        <div class="bp-title" id="bpTitle">Now Playing...</div>
        <div class="bp-artist" id="bpArtist">—</div>
      </div>
      <div class="bp-controls">
        <button type="button" class="bp-btn-ctrl" id="bpPrevBtn" title="Previous"><i class="fa-solid fa-backward-step"></i></button>
        <button type="button" class="btn-play-sm" id="bpPlayBtn" title="Play / Pause"><i class="fa-solid fa-play"></i></button>
        <button type="button" class="bp-btn-ctrl" id="bpNextBtn" title="Next"><i class="fa-solid fa-forward-step"></i></button>
        <button type="button" class="bp-btn-ctrl" id="bpMuteBtn" title="Mute / Unmute"><i class="fa-solid fa-volume-high"></i></button>
        <button type="button" class="bp-btn-ctrl" id="bpCloseBtn" title="Close">✕</button>
      </div>
    </div>
    <div class="bp-slider-wrap">
      <span id="bpCurrTime">00:00</span>
      <input type="range" id="bpProgress" value="0" min="0" max="100">
      <span id="bpTotTime">00:00</span>
    </div>
  </div>
</div>

<!-- Full-Screen Studio Player -->
<div class="full-player-sheet" id="fullPlayerSheet">
  <div class="fp-top-bar">
    <button type="button" class="fp-icon-btn" id="fpCloseBtn" title="Close"><i class="fa-solid fa-chevron-down"></i></button>
    <div class="fp-header-title">
      <span class="fp-header-sub">NOW PLAYING</span>
      <span class="fp-header-badge" id="fpQualityBadge">128 KBPS</span>
    </div>
    <button type="button" class="fp-icon-btn" id="fpFavBtn" title="Favorite"><i class="fa-solid fa-heart"></i></button>
  </div>

  <div class="fp-art-container">
    <div class="fp-art-glow" id="fpArtGlow"></div>
    <img id="fpCover" class="fp-cover-img" src="" alt="Album Artwork">
  </div>

  <div class="fp-info-section">
    <div class="fp-title" id="fpTitle">—</div>
    <div class="fp-artist" id="fpArtist">—</div>
  </div>

  <div class="fp-seek-section">
    <div class="fp-range-wrap">
      <input type="range" id="fpProgress" value="0" min="0" max="100">
    </div>
    <div class="fp-time-row">
      <span id="fpCurrTime">00:00</span>
      <span id="fpTotTime">00:00</span>
    </div>
  </div>

  <div class="fp-main-controls">
    <button type="button" class="fp-ctrl-btn" id="fpShuffleBtn" title="Shuffle Mode"><i class="fa-solid fa-shuffle"></i></button>
    <button type="button" class="fp-ctrl-btn" id="fpPrevBtn" title="Previous"><i class="fa-solid fa-backward-step"></i></button>
    <button type="button" class="fp-ctrl-play" id="fpPlayBtn" title="Play / Pause"><i class="fa-solid fa-play"></i></button>
    <button type="button" class="fp-ctrl-btn" id="fpNextBtn" title="Next"><i class="fa-solid fa-forward-step"></i></button>
    <button type="button" class="fp-ctrl-btn" id="fpRepeatBtn" title="Repeat Mode">
      <span class="fp-badge-repeat" id="fpRepeatBadge">1</span>
      <i class="fa-solid fa-repeat"></i>
    </button>
  </div>

  <div class="fp-volume-section">
    <button type="button" class="fp-vol-btn" id="fpMuteBtn" title="Mute"><i class="fa-solid fa-volume-high"></i></button>
    <div class="fp-vol-slider-wrap">
      <input type="range" id="fpVolume" min="0" max="1" step="0.01" value="1">
    </div>
  </div>

  <div class="fp-actions-grid">
    <button type="button" class="fp-action-pill" id="fpLyricsBtn"><i class="fa-solid fa-align-right"></i><span>Lyrics</span></button>
    <button type="button" class="fp-action-pill" id="fpCopyBtn"><i class="fa-solid fa-link"></i><span>Copy Link</span></button>
    <button type="button" class="fp-action-pill primary" id="fpDownloadBtn"><i class="fa-solid fa-download"></i><span>Download</span></button>
  </div>
</div>

<!-- Bottom Navigation Dock -->
<div class="bottom-nav">
  <button class="nav-item active" id="navBtnSearch">
    <i class="fa-solid fa-magnifying-glass"></i>
    <span data-i18n="navSearch">جستجو</span>
  </button>
  <button class="nav-item" id="navBtnFavs">
    <i class="fa-solid fa-heart"></i>
    <span data-i18n="navFavs">نشان‌شده‌ها</span>
  </button>
  <button class="nav-item" id="navBtnSettings">
    <i class="fa-solid fa-gear"></i>
    <span data-i18n="navSettings">تنظیمات</span>
  </button>
</div>

<div id="toasts"></div>

<script>
'use strict';
const $ = s => document.querySelector(s);
const CF_WORKER_URL = 'https://player.foadtoonak.workers.dev';
const DEFAULT_COVER = 'https://image.qwenlm.ai/public_source/e65c539b-21b0-4d51-a3dc-04fdb44f3766/1b687daa5-7a77-44b3-9c54-a87811103bb5.png';
const FA_DIGITS = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];

const i18n = {
  fa: {
    headerSub: "دانلود و پخش آنلاین بدون محدودیت",
    lblSearchTitle: "جستجو و دریافت لینک مستقیم",
    lblInputLabel: "لینک یا نام آهنگ / خواننده / پادکست",
    placeholderInput: "مثلاً: Mar-Mari یا هایده یا پیوند rj.app...",
    btnFetch: "دریافت اطلاعات و جستجو",
    hintText: "پشتیبانی کامل از <b>نام فارسی/انگلیسی</b>، <b>شوهای پادکست</b>، <b>صفحه خواننده</b> و <b>پیوندهای کوتاه</b>.",
    lblSingleTrack: "موزیک انتخابی",
    badgeSong: "آهنگ",
    badgePodcast: "پادکست",
    btnDownload: "دانلود فایل",
    btnSelectAll: "انتخاب همه",
    btnSelectNone: "هیچ‌کدام",
    btnDlZip: "دانلود انتخابی (ZIP)",
    btnCancel: "لغو",
    lblTrendingSongs: "🔥 داغ‌ترین تک‌آهنگ‌های هفته",
    lblTrendingPodcasts: "🎙 تازه‌ترین قسمت‌های پادکست",
    btnLoadMore: "بارگذاری موارد بیشتر",
    lblFavTitle: "❤️ آرشیو قطعات نشان‌شده",
    lblSettingsTitle: "تنظیمات سامانه",
    setQualityTitle: "کیفیت پیش‌فرض دانلود",
    setQualityDesc: "کیفیت پیش‌فرشتی که برای فایل‌های صوتی بارگیری می‌شود.",
    setThemeTitle: "پوسته ظاهری",
    setThemeDesc: "حالت تاریک، روشن یا هماهنگ با سیستم‌عامل.",
    setLangTitle: "زبان برنامه",
    setLangDesc: "زبان محیط کاربری سامانه (فارسی / انگلیسی).",
    setHistoryTitle: "تاریخچه جستجو",
    setHistoryDesc: "پاک کردن عبارات ثبت شده در حافظه دستگاه.",
    btnClearHistory: "پاک‌سازی",
    btnCopyLyrics: "کپی کردن متن ترانه",
    navSearch: "جستجو",
    navTrending: "داغ‌ترین‌ها",
    navFavs: "نشان‌شده‌ها",
    navSettings: "تنظیمات",
    emptyFavs: "هنوز هیچ اثری نشان نشده است ❤️",
    toastQuality: "کیفیت روی",
    toastTheme: "پوسته ظاهری تغییر یافت",
    toastLang: "زبان سامانه روی فارسی تنظیم شد",
    toastHistory: "تاریخچه جستجو کاملاً پاک‌سازی شد 🗑️",
    toastDownloading: "دانلود آغاز شد"
  },
  en: {
    headerSub: "Unlimited Online Streaming & Downloading",
    lblSearchTitle: "Search & Direct Link Fetcher",
    lblInputLabel: "URL or Track Name / Artist / Podcast",
    placeholderInput: "e.g., Mar-Mari, Hayedeh or rj.app link...",
    btnFetch: "Fetch Details & Search",
    hintText: "Full support for <b>Persian/English names</b>, <b>Podcast shows</b>, <b>Artist pages</b> & <b>Short links</b>.",
    lblSingleTrack: "Selected Track",
    badgeSong: "Song",
    badgePodcast: "Podcast",
    btnDownload: "Download File",
    btnSelectAll: "Select All",
    btnSelectNone: "Deselect All",
    btnDlZip: "Download Selected (ZIP)",
    btnCancel: "Cancel",
    lblTrendingSongs: "🔥 Trending Singles of the Week",
    lblTrendingPodcasts: "🎙 Latest Podcast Episodes",
    btnLoadMore: "Load More",
    lblFavTitle: "❤️ Favorite Saved Tracks",
    lblSettingsTitle: "System Settings",
    setQualityTitle: "Default Download Quality",
    setQualityDesc: "Preferred audio stream bitrate for downloads.",
    setThemeTitle: "App Theme",
    setThemeDesc: "Dark, Light, or System match mode.",
    setLangTitle: "Language",
    setLangDesc: "User interface language (Persian / English).",
    setHistoryTitle: "Search History",
    setHistoryDesc: "Clear recent search queries from device storage.",
    btnClearHistory: "Clear",
    btnCopyLyrics: "Copy Lyrics Text",
    navSearch: "Search",
    navTrending: "Trending",
    navFavs: "Favorites",
    navSettings: "Settings",
    emptyFavs: "No favorite tracks saved yet ❤️",
    toastQuality: "Quality set to",
    toastTheme: "Theme updated successfully",
    toastLang: "Language changed to English",
    toastHistory: "Search history cleared completely 🗑️",
    toastDownloading: "Download started"
  }
};

let currentLang = localStorage.getItem('mosi_lang') || 'fa';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('mosi_lang', lang);
  const html = $('#htmlRoot');
  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang][key]) {
      el.innerHTML = i18n[lang][key];
    }
  });

  const input = $('#rjUrl');
  if (input) input.placeholder = lang === 'fa' ? i18n.fa.placeholderInput : i18n.en.placeholderInput;

  const cfgLang = $('#cfgLangSelect');
  if (cfgLang) cfgLang.value = lang;
}

const PLAY_ICON = '<i class="fa-solid fa-play"></i>';
const PAUSE_ICON = '<i class="fa-solid fa-pause"></i>';
const SPINNER_ICON = '<i class="fa-solid fa-circle-notch fa-spin"></i>';

let selectedQuality = localStorage.getItem('mosi_quality') || '128';
let currentQueue = [];
let currentQueueIndex = -1;
let currentPlaylistTracks = [];

let isShuffle = false;
let repeatMode = 'off';
let lastVolume = 1;

function toFa(n) {
  if (currentLang !== 'fa') return String(n);
  return String(n).replace(/[0-9]/g, d => FA_DIGITS[d]);
}
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

function fmtTime(s) {
  if (!s && s !== 0) return '00:00';
  s = Math.round(s);
  const m = Math.floor(s / 60), ss = s % 60;
  return String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
}
function proxyUrl(url) {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  return \`\${CF_WORKER_URL}/?kind=file&url=\${encodeURIComponent(url)}\`;
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isDismissed = localStorage.getItem('mosi_pwa_dismissed') === 'true';
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

let deferredPrompt = null;
const pwaPopup = $('#pwaPopup');
const pwaInstallBtn = $('#pwaInstallBtn');
const pwaCloseBtn = $('#pwaCloseBtn');
const pwaDesc = $('#pwaDesc');

if (!isStandalone && !isDismissed) {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    pwaPopup.style.display = 'block';
  });

  if (isIOS) {
    pwaDesc.textContent = 'دکمه Share در پایین سافاری و سپس Add to Home Screen را بزنید.';
    pwaInstallBtn.textContent = 'راهنما';
    pwaPopup.style.display = 'block';
  }
}

pwaInstallBtn.onclick = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') pwaPopup.style.display = 'none';
    deferredPrompt = null;
  } else if (isIOS) {
    toast('در مرورگر سافاری: دکمه Share را زده و Add to Home Screen را انتخاب کنید.', 'ok', 6000);
  }
};

pwaCloseBtn.onclick = () => {
  pwaPopup.style.display = 'none';
  localStorage.setItem('mosi_pwa_dismissed', 'true');
};

function initTheme() {
  const saved = localStorage.getItem('mosi_theme') || 'dark';
  applyTheme(saved);
}

function applyTheme(mode) {
  let isDark = true;
  if (mode === 'light') isDark = false;
  else if (mode === 'system') isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  $('#themeMeta').content = isDark ? '#090D16' : '#F1F5F9';
  localStorage.setItem('mosi_theme', mode);
  const cfgTheme = $('#cfgThemeSelect');
  if (cfgTheme) cfgTheme.value = mode;
}

initTheme();
setLanguage(currentLang);

function toast(msg, type = 'ok', ms = 3200) {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = (type === 'err' ? '⛔ ' : type === 'warn' ? '⚠️ ' : '✅ ') + msg;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 280); }, ms);
}

function setStatus(msg, type) {
  const el = $('#status');
  el.textContent = msg || '';
  el.className = msg ? ('show' + (type ? ' ' + type : '')) : '';
}

function syncQualityUI(q) {
  selectedQuality = q;
  localStorage.setItem('mosi_quality', q);
  $('#fpQualityBadge').textContent = \`\${q} KBPS\`;
  const cfgQ = $('#cfgQualitySelect');
  if (cfgQ) cfgQ.value = q;
}

$('#cfgQualitySelect').onchange = e => {
  syncQualityUI(e.target.value);
  toast(\`\${i18n[currentLang].toastQuality} \${toFa(e.target.value)}\`, 'ok');
};

$('#cfgThemeSelect').onchange = e => {
  applyTheme(e.target.value);
  toast(i18n[currentLang].toastTheme, 'ok');
};

$('#cfgLangSelect').onchange = e => {
  setLanguage(e.target.value);
  toast(i18n[currentLang].toastLang, 'ok');
};

function clearSearchHistoryManual() {
  localStorage.removeItem('mosi_history');
  renderHistory();
  toast(i18n[currentLang].toastHistory, 'ok');
}

function getHistory() { try { return JSON.parse(localStorage.getItem('mosi_history') || '[]'); } catch(e) { return []; } }
function addHistory(q) {
  if (!q || q.startsWith('http')) return;
  let h = getHistory().filter(x => x !== q);
  h.unshift(q);
  localStorage.setItem('mosi_history', JSON.stringify(h.slice(0, 6)));
  renderHistory();
}
function renderHistory() {
  const h = getHistory();
  const wrap = $('#historyChips');
  if (!h.length) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = h.map(x => \`<span class="history-chip" data-q="\${esc(x)}"><i class="fa-solid fa-magnifying-glass" style="font-size:10px;"></i> \${esc(x)}</span>\`).join('');
}
$('#historyChips').addEventListener('click', e => {
  const chip = e.target.closest('.history-chip');
  if (chip) { $('#rjUrl').value = chip.dataset.q; processInput(); }
});
renderHistory();

function getFavs() { try { return JSON.parse(localStorage.getItem('mosi_favs') || '[]'); } catch(e) { return []; } }
function isFav(id) { return getFavs().some(x => (x.permlink || x.id) === id); }
function toggleFav(item) {
  let favs = getFavs();
  const id = item.permlink || item.id;
  if (isFav(id)) {
    favs = favs.filter(x => (x.permlink || x.id) !== id);
    toast(currentLang === 'fa' ? 'از قطعات نشان‌شده حذف شد' : 'Removed from favorites', 'warn');
  } else {
    favs.unshift(item);
    toast(currentLang === 'fa' ? 'به نشان‌شده‌ها اضافه شد' : 'Added to favorites', 'ok');
  }
  localStorage.setItem('mosi_favs', JSON.stringify(favs));
  renderFavorites();
  if (currentItem && (currentItem.permlink || currentItem.id) === id) {
    $('#fpFavBtn').classList.toggle('active', isFav(id));
  }
}

function renderFavorites() {
  const favs = getFavs();
  const wrap = $('#favTracks');
  if (!favs.length) {
    wrap.innerHTML = \`<div style="padding:28px; text-align:center; color:var(--muted); font-size:0.86rem; font-weight:700;">\${i18n[currentLang].emptyFavs}</div>\`;
    return;
  }
  wrap.innerHTML = renderTrackList(favs, 'fav', false);
}

let currentAudio = new Audio();
currentAudio.preload = 'auto';

const savedVol = localStorage.getItem('mosi_volume');
if (savedVol !== null) {
  currentAudio.volume = parseFloat(savedVol);
  lastVolume = currentAudio.volume || 1;
}

let currentPlayBtn = null;
let currentItem = null;

const bottomPlayer = $('#bottomPlayer');
const bpPlayBtn = $('#bpPlayBtn');
const bpProgress = $('#bpProgress');
const fullPlayerSheet = $('#fullPlayerSheet');
const fpPlayBtn = $('#fpPlayBtn');
const fpProgress = $('#fpProgress');

function stopAudio() {
  if (currentAudio) currentAudio.pause();
  if (currentPlayBtn) { setPlayState(currentPlayBtn, false); currentPlayBtn = null; }
  setPlayState(bpPlayBtn, false);
  setPlayState(fpPlayBtn, false);
  bottomPlayer.classList.remove('active');
  fullPlayerSheet.classList.remove('show');
  updateEqualizers();
}

function setPlayState(btn, state) {
  if (!btn) return;
  if (state === 'loading') {
    btn.innerHTML = SPINNER_ICON;
    btn.classList.add('playing');
  } else if (state === true) {
    btn.innerHTML = PAUSE_ICON;
    btn.classList.add('playing');
  } else {
    btn.innerHTML = PLAY_ICON;
    btn.classList.remove('playing');
  }
}

function updateEqualizers() {
  document.querySelectorAll('.trow').forEach(row => {
    const eq = row.querySelector('.equalizer-wrap');
    if (eq) eq.remove();
  });
  if (currentAudio && !currentAudio.paused && currentItem) {
    const targetRows = document.querySelectorAll(\`.trow[data-id="\${currentItem.permlink || currentItem.id}"]\`);
    targetRows.forEach(row => {
      const imgWrap = row.querySelector('.trow-img-wrap');
      if (imgWrap && !imgWrap.querySelector('.equalizer-wrap')) {
        const eq = document.createElement('div');
        eq.className = 'equalizer-wrap';
        eq.innerHTML = '<span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span>';
        imgWrap.appendChild(eq);
      }
    });
  }
}

function getItemAudioUrl(item) {
  if (selectedQuality === '128') return item.lqUrl || item.hqUrl || item.audioUrl || null;
  return item.hqUrl || item.audioUrl || item.lqUrl || null;
}

function updateVolumeUI() {
  const isMuted = currentAudio.muted || currentAudio.volume === 0;
  const vol = currentAudio.muted ? 0 : currentAudio.volume;
  $('#fpVolume').value = vol;

  const volIcon = isMuted ? '<i class="fa-solid fa-volume-xmark"></i>' : (vol < 0.4 ? '<i class="fa-solid fa-volume-low"></i>' : '<i class="fa-solid fa-volume-high"></i>');
  $('#bpMuteBtn').innerHTML = isMuted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
  $('#fpMuteBtn').innerHTML = volIcon;
  $('#bpMuteBtn').classList.toggle('active', isMuted);
  $('#fpMuteBtn').classList.toggle('active', isMuted);
}

function toggleMute() {
  if (currentAudio.muted) {
    currentAudio.muted = false;
    if (currentAudio.volume === 0) currentAudio.volume = lastVolume || 1;
  } else {
    lastVolume = currentAudio.volume || 1;
    currentAudio.muted = true;
  }
  updateVolumeUI();
  toast(currentAudio.muted ? (currentLang === 'fa' ? 'صدا قطع شد' : 'Muted') : (currentLang === 'fa' ? 'صدا وصل شد' : 'Unmuted'), 'ok', 1200);
}

updateVolumeUI();

currentAudio.addEventListener('timeupdate', () => {
  if (!currentAudio || !currentAudio.duration) return;
  const pct = (currentAudio.currentTime / currentAudio.duration) * 100;
  bpProgress.value = pct;
  fpProgress.value = pct;
  const cTime = fmtTime(currentAudio.currentTime);
  const tTime = fmtTime(currentAudio.duration);
  $('#bpCurrTime').textContent = cTime;
  $('#bpTotTime').textContent = tTime;
  $('#fpCurrTime').textContent = cTime;
  $('#fpTotTime').textContent = tTime;
});

currentAudio.addEventListener('ended', () => {
  if (repeatMode === 'one') {
    currentAudio.currentTime = 0;
    currentAudio.play().catch(() => {});
    return;
  }
  playNextInQueue();
});

currentAudio.addEventListener('error', () => {
  toast(currentLang === 'fa' ? 'خطا در بارگذاری استریم صوتی' : 'Audio stream load error', 'err');
  setPlayState(currentPlayBtn, false);
  setPlayState(bpPlayBtn, false);
  setPlayState(fpPlayBtn, false);
});

async function togglePlay(item, btn, queueList = [], qIndex = -1) {
  if (currentItem && (currentItem.permlink || currentItem.id) === (item.permlink || item.id) && currentAudio.src) {
    if (!currentAudio.paused) {
      currentAudio.pause();
      setPlayState(btn || currentPlayBtn, false);
      setPlayState(bpPlayBtn, false);
      setPlayState(fpPlayBtn, false);
    } else {
      currentAudio.play().then(() => {
        setPlayState(btn || currentPlayBtn, true);
        setPlayState(bpPlayBtn, true);
        setPlayState(fpPlayBtn, true);
      }).catch(() => {});
    }
    updateEqualizers();
    return;
  }

  if (currentPlayBtn) setPlayState(currentPlayBtn, false);

  if (queueList && queueList.length > 0) {
    currentQueue = queueList;
    currentQueueIndex = (qIndex >= 0) ? qIndex : queueList.findIndex(x => (x.permlink || x.id) === (item.permlink || item.id));
  } else if (!currentQueue.length) {
    currentQueue = [item];
    currentQueueIndex = 0;
  }

  setPlayState(btn, 'loading');
  setPlayState(bpPlayBtn, 'loading');
  setPlayState(fpPlayBtn, 'loading');

  let audioUrl = getItemAudioUrl(item);
  if (!audioUrl) {
    try {
      const raw = await rjFetch(item.type === 'podcast' ? 'podcast' : 'song', item.permlink || item.id || item.title);
      const norm = normalizeItem(raw);
      item.hqUrl = norm.hqUrl; item.lqUrl = norm.lqUrl; item.audioUrl = norm.audioUrl;
      audioUrl = getItemAudioUrl(item);
    } catch(e) {
      toast(currentLang === 'fa' ? 'دریافت لینک پخش ناموفق بود' : 'Failed to retrieve playback link', 'err');
      setPlayState(btn, false); setPlayState(bpPlayBtn, false); setPlayState(fpPlayBtn, false);
      return;
    }
  }

  if (!audioUrl) {
    toast(currentLang === 'fa' ? 'لینک پخش برای این قطعه یافت نشد' : 'No playback link found', 'err');
    setPlayState(btn, false); setPlayState(bpPlayBtn, false); setPlayState(fpPlayBtn, false);
    return;
  }

  currentItem = item;
  currentPlayBtn = btn;
  currentAudio.pause();
  currentAudio.src = proxyUrl(audioUrl);

  const coverSrc = proxyUrl(item.cover);
  $('#bpCover').src = coverSrc;
  $('#bpTitle').textContent = item.title;
  $('#bpArtist').textContent = item.artist || '—';

  $('#fpCover').src = coverSrc;
  $('#fpArtGlow').style.backgroundImage = \`url("\${coverSrc}")\`;
  $('#fpTitle').textContent = item.title;
  $('#fpArtist').textContent = item.artist || '—';
  $('#fpFavBtn').classList.toggle('active', isFav(item.permlink || item.id));
  $('#fpQualityBadge').textContent = \`\${selectedQuality} KBPS\`;

  updateVolumeUI();

  currentAudio.play().then(() => {
    setPlayState(btn, true); setPlayState(bpPlayBtn, true); setPlayState(fpPlayBtn, true);
    bottomPlayer.classList.add('active');
    updateEqualizers();

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: item.title,
        artist: item.artist || 'Radio Javan',
        artwork: [{ src: coverSrc, sizes: '512x512', type: 'image/jpeg' }]
      });
      navigator.mediaSession.setActionHandler('play', () => currentAudio.play());
      navigator.mediaSession.setActionHandler('pause', () => currentAudio.pause());
      navigator.mediaSession.setActionHandler('previoustrack', playPrevInQueue);
      navigator.mediaSession.setActionHandler('nexttrack', playNextInQueue);
    }
  }).catch((err) => {
    console.error('Playback Error', err);
    toast(currentLang === 'fa' ? 'خطا در پخش استریم' : 'Stream playback error', 'err');
    setPlayState(btn, false); setPlayState(bpPlayBtn, false); setPlayState(fpPlayBtn, false);
  });
}

function playNextInQueue() {
  if (!currentQueue || !currentQueue.length) return;
  let nextIdx = currentQueueIndex;
  if (isShuffle) {
    if (currentQueue.length > 1) {
      do {
        nextIdx = Math.floor(Math.random() * currentQueue.length);
      } while (nextIdx === currentQueueIndex);
    }
  } else {
    if (currentQueueIndex < currentQueue.length - 1) {
      nextIdx = currentQueueIndex + 1;
    } else if (repeatMode === 'all') {
      nextIdx = 0;
    } else {
      stopAudio();
      toast(currentLang === 'fa' ? 'به پایان صف پخش رسیدید' : 'End of queue reached', 'ok', 2000);
      return;
    }
  }
  currentQueueIndex = nextIdx;
  const nextItem = currentQueue[nextIdx];
  togglePlay(nextItem, null, currentQueue, nextIdx);
}

function playPrevInQueue() {
  if (!currentQueue || !currentQueue.length) return;
  if (currentAudio && currentAudio.currentTime > 3) {
    currentAudio.currentTime = 0;
    return;
  }
  let prevIdx = currentQueueIndex;
  if (isShuffle) {
    if (currentQueue.length > 1) {
      do {
        prevIdx = Math.floor(Math.random() * currentQueue.length);
      } while (prevIdx === currentQueueIndex);
    }
  } else {
    if (currentQueueIndex > 0) {
      prevIdx = currentQueueIndex - 1;
    } else if (repeatMode === 'all') {
      prevIdx = currentQueue.length - 1;
    } else {
      if (currentAudio) currentAudio.currentTime = 0;
      return;
    }
  }
  currentQueueIndex = prevIdx;
  const prevItem = currentQueue[prevIdx];
  togglePlay(prevItem, null, currentQueue, prevIdx);
}

$('#fpShuffleBtn').onclick = () => {
  isShuffle = !isShuffle;
  $('#fpShuffleBtn').classList.toggle('active', isShuffle);
  toast(currentLang === 'fa' ? (isShuffle ? 'پخش تصادفی فعال شد' : 'پخش تصادفی غیرفعال شد') : (isShuffle ? 'Shuffle enabled' : 'Shuffle disabled'), 'ok', 1400);
};

$('#fpRepeatBtn').onclick = () => {
  const badge = $('#fpRepeatBadge');
  const btn = $('#fpRepeatBtn');
  if (repeatMode === 'off') {
    repeatMode = 'all';
    btn.classList.add('active');
    badge.classList.remove('show');
    toast(currentLang === 'fa' ? 'تکرار کل لیست فعال شد' : 'Repeat all enabled', 'ok', 1400);
  } else if (repeatMode === 'all') {
    repeatMode = 'one';
    btn.classList.add('active');
    badge.classList.add('show');
    toast(currentLang === 'fa' ? 'تکرار همین قطعه فعال شد' : 'Repeat one enabled', 'ok', 1400);
  } else {
    repeatMode = 'off';
    btn.classList.remove('active');
    badge.classList.remove('show');
    toast(currentLang === 'fa' ? 'تکرار غیرفعال شد' : 'Repeat disabled', 'ok', 1400);
  }
};

$('#bpPlayBtn').onclick = e => { e.stopPropagation(); if (currentItem) togglePlay(currentItem, currentPlayBtn); };
$('#bpNextBtn').onclick = e => { e.stopPropagation(); playNextInQueue(); };
$('#bpPrevBtn').onclick = e => { e.stopPropagation(); playPrevInQueue(); };
$('#bpMuteBtn').onclick = e => { e.stopPropagation(); toggleMute(); };
$('#bpCloseBtn').onclick = e => { e.stopPropagation(); stopAudio(); };
$('#bpMetaArea').onclick = () => { if (currentItem) fullPlayerSheet.classList.add('show'); };

$('#fpPlayBtn').onclick = () => { if (currentItem) togglePlay(currentItem, currentPlayBtn); };
$('#fpNextBtn').onclick = playNextInQueue;
$('#fpPrevBtn').onclick = playPrevInQueue;
$('#fpCloseBtn').onclick = () => fullPlayerSheet.classList.remove('show');

$('#fpMuteBtn').onclick = toggleMute;
$('#fpVolume').oninput = e => {
  const val = parseFloat(e.target.value);
  currentAudio.volume = val;
  currentAudio.muted = (val === 0);
  if (val > 0) lastVolume = val;
  localStorage.setItem('mosi_volume', val);
  updateVolumeUI();
};

bpProgress.oninput = e => {
  e.stopPropagation();
  if (currentAudio && currentAudio.duration) {
    currentAudio.currentTime = (bpProgress.value / 100) * currentAudio.duration;
  }
};
fpProgress.oninput = () => {
  if (currentAudio && currentAudio.duration) {
    currentAudio.currentTime = (fpProgress.value / 100) * currentAudio.duration;
  }
};

$('#fpFavBtn').onclick = () => { if (currentItem) toggleFav(currentItem); };
$('#fpLyricsBtn').onclick = () => { if (currentItem) openLyrics(currentItem); };
$('#fpCopyBtn').onclick = () => { if (currentItem) copyDirectLink(currentItem); };
$('#fpDownloadBtn').onclick = () => { if (currentItem) downloadOne(currentItem, $('#fpDownloadBtn')); };

function renderSkeletons(count = 4) {
  return Array.from({ length: count }, () => \`
    <div class="skeleton-row">
      <div class="skeleton-top">
        <div class="skeleton-box skeleton-img"></div>
        <div class="skeleton-box skeleton-btn"></div>
        <div style="flex:1;">
          <div class="skeleton-box skeleton-text-1"></div>
          <div class="skeleton-box skeleton-text-2"></div>
        </div>
      </div>
      <div class="skeleton-actions">
        <div class="skeleton-box skeleton-action-btn"></div>
        <div class="skeleton-box skeleton-action-btn"></div>
        <div class="skeleton-box skeleton-action-btn"></div>
      </div>
    </div>
  \`).join('');
}

function toAbsoluteUrl(raw) {
  const trimmed = raw.trim();
  if (/^https?:\\/\\//i.test(trimmed)) return trimmed;
  if (/^[a-z0-9-]+(\\.[a-z0-9-]+)+\\//i.test(trimmed) || /^[a-z0-9-]+(\\.[a-z0-9-]+)+$/i.test(trimmed)) {
    return 'https://' + trimmed;
  }
  return trimmed;
}
function isShortRJLink(raw) { try { return /^rj\\.app$/i.test(new URL(toAbsoluteUrl(raw)).hostname); } catch(e) { return false; } }
async function resolveShortLink(raw) {
  const r = await fetch(\`\${CF_WORKER_URL}/?kind=resolve&url=\${encodeURIComponent(toAbsoluteUrl(raw))}\`);
  if (!r.ok) throw new Error('Short link resolution failed');
  const d = await r.json(); return d.url;
}

function detectRJ(raw) {
  let u; try { u = new URL(toAbsoluteUrl(raw)); } catch(e) { return null; }
  if (!/radiojavan/i.test(u.hostname)) return null;
  const p = u.pathname.toLowerCase();
  const segs = u.pathname.split('/').filter(Boolean);
  const last = segs[segs.length - 1];
  if (!last) return null;
  if (p.includes('/playlist/mp3/') || p.includes('/playlist/')) return { kind: 'playlist', id: last };
  if (p.includes('/podcast/show/') || p.includes('/podcasts/show/') || p.includes('/show/')) return { kind: 'podcast_show', id: last };
  if (p.includes('/podcast/') || p.includes('/podcasts/')) return { kind: 'podcast', id: last };
  if (p.includes('/song/') || p.includes('/mp3s/mp3/') || p.includes('/mp3/')) return { kind: 'song', id: last };
  if (p.includes('/artist/')) return { kind: 'artist', id: last };
  return null;
}

async function rjFetch(kind, id) {
  const encId = encodeURIComponent(id);
  const r = await fetch(\`\${CF_WORKER_URL}/?kind=\${kind}&id=\${encId}\`, { cache: 'no-store' });
  if (r.ok) {
    const json = await r.json();
    if (json && json.success !== false) return json;
  }
  throw new Error('API fetch failed.');
}

async function searchRJ(query) {
  const qEnc = encodeURIComponent(query);
  const r = await fetch(\`\${CF_WORKER_URL}/?kind=search&query=\${qEnc}\`);
  if (r.ok) return await r.json();
  return null;
}

async function fetchArtist(name) {
  const r = await fetch(\`\${CF_WORKER_URL}/?kind=artist&query=\${encodeURIComponent(name)}\`);
  if (!r.ok) throw new Error('Artist fetch failed');
  const data = await r.json();
  if (!data || data.success === false) throw new Error(data?.msg || 'Artist not found');
  return data;
}

async function fetchPodcastShow(id) {
  const endpoints = [
    \`https://rj-deskcloud.com/api2/podcast_show?id=\${encodeURIComponent(id)}\`,
    \`https://rj-deskcloud.com/api2/podcast?id=\${encodeURIComponent(id)}\`,
    \`https://rj-deskcloud.com/api2/podcast?show=\${encodeURIComponent(id)}\`
  ];
  for (const apiUrl of endpoints) {
    try {
      const r = await fetch(\`\${CF_WORKER_URL}/?kind=file&url=\${encodeURIComponent(apiUrl)}\`);
      if (r.ok) {
        const d = await r.json();
        if (d && (Array.isArray(d.podcasts) && d.podcasts.length > 0)) return d;
        if (d && d.type === 'show') return d;
      }
    } catch(e) { console.warn('Endpoint error:', e); }
  }
  const sData = await searchRJ(id);
  if (sData && Array.isArray(sData.podcasts) && sData.podcasts.length > 0) {
    return {
      title: id.replace(/-/g, ' '),
      photo_large: sData.podcasts[0].photo || DEFAULT_COVER,
      podcast_artist: sData.podcasts[0].podcast_artist || '',
      podcasts: sData.podcasts
    };
  }
  throw new Error('Podcast episodes not found.');
}

function normalizeItem(raw) {
  let perm = raw.permlink || raw.id || '';
  if (typeof perm === 'string' && perm.includes('/')) perm = perm.split('/').filter(Boolean).pop();
  if (typeof perm === 'string' && perm.startsWith('http')) perm = raw.id || '';

  const hq = raw.hq_link || (typeof raw.link === 'string' && raw.link.startsWith('http') ? raw.link : null) || raw.audio_url || null;
  let lq = raw.lq_link || (hq && hq.includes('/320/') ? hq.replace('/320/', '/128/') : hq);
  return {
    id: perm || raw.id || null,
    title: raw.title || raw.song || raw.name || 'Untitled',
    artist: raw.podcast_artist || raw.artist || raw.artist_name || raw.date || '',
    cover: raw.photo_player || raw.photo_large || raw.photo || raw.thumbnail || raw.thumb || DEFAULT_COVER,
    duration: raw.duration != null ? Math.round(raw.duration) : null,
    hqUrl: hq, lqUrl: lq, audioUrl: hq || lq, permlink: perm || null,
    lyric: raw.lyric || raw.lyrics || '',
    type: raw.type || (raw.podcast_artist ? 'podcast' : 'song')
  };
}

function suggestFileName(title, artist, quality = '320') {
  return \`\${artist ? artist + ' - ' : ''}\${title} (\${quality}kbps).mp3\`.replace(/[\\/:*?"<>|]+/g, ' ').trim();
}

async function downloadOne(item, btn) {
  let downloadUrl = getItemAudioUrl(item);
  if (!downloadUrl) {
    if (btn) { btn.disabled = true; btn.innerHTML = SPINNER_ICON; }
    try {
      const raw = await rjFetch(item.type === 'podcast' ? 'podcast' : 'song', item.permlink || item.id);
      const norm = normalizeItem(raw);
      item.hqUrl = norm.hqUrl; item.lqUrl = norm.lqUrl; downloadUrl = getItemAudioUrl(item);
    } catch(e) {
      toast(currentLang === 'fa' ? 'لینک دانلود یافت نشد' : 'Download link not found', 'err');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-download"></i>'; }
      return;
    }
  }

  if (btn) { btn.disabled = true; btn.innerHTML = SPINNER_ICON; }
  try {
    const r = await fetch(proxyUrl(downloadUrl));
    if (!r.ok) throw new Error();
    const blob = await r.blob();
    triggerBlobDownload(blob, suggestFileName(item.title, item.artist, selectedQuality));
    toast(i18n[currentLang].toastDownloading, 'ok');
  } catch(e) {
    toast(currentLang === 'fa' ? 'خطا در دانلود فایل' : 'Download error', 'err');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-download"></i>'; }
  }
}

async function copyDirectLink(item) {
  let url = getItemAudioUrl(item);
  if (!url) {
    try {
      const raw = await rjFetch(item.type === 'podcast' ? 'podcast' : 'song', item.permlink || item.id);
      const norm = normalizeItem(raw);
      item.hqUrl = norm.hqUrl; item.lqUrl = norm.lqUrl; url = getItemAudioUrl(item);
    } catch(e) { console.warn('Copy fetch error:', e); }
  }
  if (url) {
    navigator.clipboard.writeText(proxyUrl(url));
    toast(currentLang === 'fa' ? 'لینک مستقیم در کلیپ‌بورد کپی شد' : 'Direct link copied to clipboard', 'ok');
  } else {
    toast(currentLang === 'fa' ? 'لینک مستقیم در دسترس نیست' : 'Direct link unavailable', 'err');
  }
}

let bulkCancel = false;
let bulkRunning = false;
async function bulkDownloadZip(items, label) {
  if (!items.length) { toast(currentLang === 'fa' ? 'هیچ موردی انتخاب نشده است' : 'No items selected', 'warn'); return; }
  if (bulkRunning) { toast(currentLang === 'fa' ? 'یک عملیات دانلود فشرده در حال اجراست' : 'Bulk download already running', 'warn'); return; }
  bulkRunning = true;
  bulkCancel = false;
  const zipBtn = $('#plDlZip');
  if (zipBtn) zipBtn.disabled = true;
  const prog = $('#dlProgress');
  prog.classList.add('show');
  let done = 0, fails = 0, part = 1, zip = new JSZip(), bytesInPart = 0;
  const PART_LIMIT = 150 * 1024 * 1024;
  const CONCURRENCY = 3;
  const queue = [...items];

  async function worker() {
    while (queue.length && !bulkCancel) {
      const item = queue.shift();
      try {
        let dlUrl = getItemAudioUrl(item);
        if (!dlUrl) {
          const raw = await rjFetch(item.type === 'podcast' ? 'podcast' : 'song', item.permlink || item.id);
          const norm = normalizeItem(raw);
          item.hqUrl = norm.hqUrl; item.lqUrl = norm.lqUrl; dlUrl = getItemAudioUrl(item);
        }
        const r = await fetch(proxyUrl(dlUrl));
        if (!r.ok) throw new Error();
        const blob = await r.blob();
        zip.file(suggestFileName(item.title, item.artist, selectedQuality), blob);
        bytesInPart += blob.size;
      } catch(e) { fails++; }
      done++;
      $('#dlLbl').textContent = toFa(done) + ' / ' + toFa(items.length);
      $('#dlFill').style.width = (done / items.length * 100) + '%';
      if (bytesInPart >= PART_LIMIT && queue.length) {
        const finished = zip; zip = new JSZip(); bytesInPart = 0;
        const zblob = await finished.generateAsync({ type: 'blob' });
        triggerBlobDownload(zblob, \`\${label}-part\${part++}.zip\`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker));
  if (bulkCancel) {
    toast(currentLang === 'fa' ? 'دانلود لغو شد' : 'Download cancelled', 'warn');
  } else {
    const zblob = await zip.generateAsync({ type: 'blob' });
    triggerBlobDownload(zblob, part > 1 ? \`\${label}-part\${part}.zip\` : \`\${label}.zip\`);
    toast(fails ? (currentLang === 'fa' ? \`پایان یافت (\${toFa(fails)} ناموفق)\` : \`Finished with \${fails} failures\`) : (currentLang === 'fa' ? 'دانلود فایل ZIP با موفقیت کامل شد' : 'ZIP downloaded successfully'), fails ? 'warn' : 'ok');
  }
  prog.classList.remove('show');
  bulkRunning = false;
  if (zipBtn) zipBtn.disabled = false;
}
$('#dlCancel').onclick = () => { bulkCancel = true; };

async function openLyrics(item) {
  $('#lyricsModal').classList.add('show');
  $('#lyricsTitle').textContent = (currentLang === 'fa' ? 'متن ترانه: ' : 'Lyrics: ') + item.title;
  $('#lyricsBody').innerHTML = SPINNER_ICON + ' ' + (currentLang === 'fa' ? 'در حال دریافت لیریکس...' : 'Fetching lyrics...');

  let text = item.lyric;
  if (!text) {
    try {
      const raw = await rjFetch(item.type === 'podcast' ? 'podcast' : 'song', item.permlink || item.id || item.title);
      text = raw.lyric || raw.lyrics;
    } catch(e) { console.warn('Lyrics fetch error:', e); }
  }

  if (text) {
    $('#lyricsBody').textContent = text;
    $('#copyLyricsBtn').onclick = () => {
      navigator.clipboard.writeText(text);
      toast(currentLang === 'fa' ? 'متن ترانه در حافظه کپی شد' : 'Lyrics copied to clipboard', 'ok');
    };
  } else {
    $('#lyricsBody').textContent = currentLang === 'fa' ? 'متن ترانه‌ای برای این اثر ثبت نشده است.' : 'No lyrics available for this track.';
    $('#copyLyricsBtn').onclick = () => toast(currentLang === 'fa' ? 'متنی برای کپی وجود ندارد' : 'No lyrics to copy', 'warn');
  }
}
$('#closeLyrics').onclick = () => $('#lyricsModal').classList.remove('show');

function renderTrackList(items, context = 'pl', showCheckboxes = false) {
  return items.map((s, i) => {
    const itemId = s.permlink || s.id;
    const favActive = isFav(itemId) ? 'active' : '';
    const cbHtml = showCheckboxes ? \`<input type="checkbox" checked data-i="\${i}" class="trow-cb">\` : '';
    return \`
      <div class="trow" data-i="\${i}" data-id="\${esc(itemId)}" data-ctx="\${context}">
        <div class="trow-top">
          \${cbHtml}
          <div class="trow-img-wrap">
            <img src="\${esc(proxyUrl(s.cover))}" alt="\${esc(s.title)}" loading="lazy" onerror="this.src='\${DEFAULT_COVER}'">
          </div>
          <button type="button" class="btn-play-sm tplay" title="پخش">\${PLAY_ICON}</button>
          <div class="tmeta">
            <span class="tt">\${esc(s.title)}</span>
            <span class="ta">\${esc(s.artist || '—')}\${s.duration ? ' · ' + fmtTime(s.duration) : ''}</span>
          </div>
        </div>
        <div class="trow-bottom">
          <button type="button" class="btn-action tdl" title="دانلود"><i class="fa-solid fa-download"></i></button>
          <button type="button" class="btn-action tcopy" title="کپی لینک"><i class="fa-solid fa-link"></i></button>
          <button type="button" class="btn-action tlyric" title="متن ترانه"><i class="fa-solid fa-align-right"></i></button>
          <button type="button" class="btn-action fav \${favActive} tfav" title="نشان"><i class="fa-solid fa-heart"></i></button>
        </div>
      </div>
    \`;
  }).join('');
}

function renderSingle(kind, item) {
  $('#plCard').style.display = 'none';
  $('#singleCard').style.display = 'block';
  $('#sBadge').textContent = kind === 'podcast' ? i18n[currentLang].badgePodcast : i18n[currentLang].badgeSong;
  $('#sCover').src = proxyUrl(item.cover);
  $('#sCover').onerror = () => { $('#sCover').src = DEFAULT_COVER; };
  $('#sTitle').textContent = item.title;
  $('#sArtist').textContent = item.artist || '—';
  $('#sDur').textContent = item.duration ? fmtTime(item.duration) : '';

  setPlayState($('#sPlayBtn'), false);
  $('#sPlayBtn').onclick = () => togglePlay(item, $('#sPlayBtn'), [item], 0);
  $('#sDownload').onclick = () => downloadOne(item, $('#sDownload'));
  $('#sCopyLink').onclick = () => copyDirectLink(item);
  $('#sLyrics').onclick = () => openLyrics(item);
  $('#sFav').onclick = () => toggleFav(item);
}

function renderPlaylist(pl, isSearch = false, featuredEntity = null) {
  $('#singleCard').style.display = 'none';
  $('#plCard').style.display = 'block';
  currentPlaylistTracks = pl.songs;

  const fContainer = $('#featuredBoxContainer');
  if (isSearch && featuredEntity) {
    const isArtist = featuredEntity.type === 'artist';
    fContainer.innerHTML = \`
      <div class="featured-box \${isArtist ? 'artist-type' : 'show-type'}">
        <img src="\${esc(proxyUrl(featuredEntity.photo || DEFAULT_COVER))}" alt="\${esc(featuredEntity.name || featuredEntity.title || '')}" onerror="this.src='\${DEFAULT_COVER}'">
        <div class="f-meta">
          <span class="f-badge">\${isArtist ? (currentLang === 'fa' ? '🎤 صفحه اختصاصی هنرمند' : '🎤 Artist Official Page') : (currentLang === 'fa' ? '🎙 صفحه اختصاصی شو پادکست' : '🎙 Podcast Show Page')}</span>
          <div class="f-title">\${esc(featuredEntity.name || featuredEntity.title)}</div>
        </div>
        <button type="button" class="btn primary sm f-btn" id="openFeaturedBtn">\${currentLang === 'fa' ? 'مشاهده تمام آثار ➔' : 'View All ➔'}</button>
      </div>
    \`;
    fContainer.style.display = 'block';
    $('#openFeaturedBtn').onclick = () => {
      if (isArtist) {
        $('#rjUrl').value = \`https://play.radiojavan.com/artist/\${featuredEntity.query || featuredEntity.name}\`;
      } else {
        $('#rjUrl').value = \`https://play.radiojavan.com/podcast/show/\${featuredEntity.permlink || featuredEntity.id}\`;
      }
      processInput();
    };
  } else {
    fContainer.innerHTML = '';
    fContainer.style.display = 'none';
  }

  if (isSearch) {
    $('#plHead').style.display = 'none';
    $('#plActions').style.display = 'none';
  } else {
    $('#plHead').style.display = 'flex';
    $('#plActions').style.display = 'flex';
    $('#plCover').src = proxyUrl(pl.cover);
    $('#plCover').onerror = () => { $('#plCover').src = DEFAULT_COVER; };
    $('#plTitle').textContent = pl.title;
    $('#plSub').textContent = \`\${toFa(pl.songs.length)} \${currentLang === 'fa' ? 'اثر' : 'tracks'}\${pl.creator ? ' · ' + pl.creator : ''}\`;
  }

  $('#plTracks').innerHTML = renderTrackList(pl.songs, 'pl', !isSearch);
  updateEqualizers();
}

function handleTrackClick(e, getList) {
  const row = e.target.closest('.trow');
  if (!row) return;
  const idx = +row.dataset.i;
  const list = getList();
  const item = list[idx];
  if (!item) return;

  if (e.target.closest('.tplay')) { togglePlay(item, row.querySelector('.tplay'), list, idx); }
  else if (e.target.closest('.tdl')) { downloadOne(item, row.querySelector('.tdl')); }
  else if (e.target.closest('.tcopy')) { copyDirectLink(item); }
  else if (e.target.closest('.tlyric')) { openLyrics(item); }
  else if (e.target.closest('.tfav')) {
    toggleFav(item);
    row.querySelector('.tfav').classList.toggle('active', isFav(item.permlink || item.id));
  } else if (e.target.closest('.tmeta')) {
    const cb = row.querySelector('.trow-cb');
    if (cb && e.target.tagName !== 'INPUT') cb.checked = !cb.checked;
  }
}

$('#plTracks').addEventListener('click', e => handleTrackClick(e, () => currentPlaylistTracks));
$('#favTracks').addEventListener('click', e => handleTrackClick(e, () => getFavs()));

$('#plSelectAll').onclick = () => $('#plTracks').querySelectorAll('.trow-cb').forEach(c => c.checked = true);
$('#plSelectNone').onclick = () => $('#plTracks').querySelectorAll('.trow-cb').forEach(c => c.checked = false);
$('#plDlZip').onclick = () => {
  const boxes = [...$('#plTracks').querySelectorAll('.trow-cb')];
  const items = boxes.filter(c => c.checked).map(c => currentPlaylistTracks[+c.dataset.i]);
  const safeName = $('#plTitle').textContent.replace(/[\\/:*?"<>|]+/g, ' ').trim() || 'rj-playlist';
  bulkDownloadZip(items, safeName);
};

const browseState = {
  songs: { endpoint: 'mp3s', type: 'featured', items: [], page: 1, done: false },
  podcasts: { endpoint: 'podcasts', type: 'featured', items: [], page: 1, done: false }
};

async function fetchBrowse(endpoint, type, page) {
  const url = \`https://rj-deskcloud.com/api2/\${endpoint}?url=\${endpoint}&type=\${type}&page=\${page}&_t=\${Date.now()}\`;
  const r = await fetch(\`\${CF_WORKER_URL}/?kind=file&url=\${encodeURIComponent(url)}\`, { cache: 'no-store' });
  if (r.ok) {
    const d = await r.json();
    return Array.isArray(d) ? d : (d.items || d.mp3s || d.podcasts || []);
  }
  return [];
}

async function loadBrowseMore(key) {
  const st = browseState[key];
  if (st.done) return;
  const btn = $('#' + key + 'LoadMore');
  btn.disabled = true;
  if (!st.items.length) {
    $('#' + key + 'Tracks').innerHTML = renderSkeletons(3);
  }
  try {
    const batch = await fetchBrowse(st.endpoint, st.type, st.page);
    if (!batch.length) {
      st.done = true;
      btn.style.display = 'none';
    } else {
      st.items.push(...batch.map(normalizeItem));
      st.page++;
      $('#' + key + 'Tracks').innerHTML = renderTrackList(st.items, key, false);
      $('#' + key + 'Count').textContent = toFa(st.items.length) + (currentLang === 'fa' ? ' مورد' : ' items');
      updateEqualizers();
    }
  } catch(e) {
    toast(currentLang === 'fa' ? 'خطا در دریافت لیست داغ‌ترین‌ها' : 'Error loading trending list', 'err');
  } finally {
    btn.disabled = false;
  }
}

['songs', 'podcasts'].forEach(key => {
  $('#' + key + 'Tracks').addEventListener('click', e => handleTrackClick(e, () => browseState[key].items));
  $('#' + key + 'LoadMore').addEventListener('click', () => loadBrowseMore(key));
});

function loadTrendingItems() {
  if (!browseState.songs.items.length) loadBrowseMore('songs');
  if (!browseState.podcasts.items.length) loadBrowseMore('podcasts');
}

$('#navBtnFavs').onclick = () => { switchTab('Favs'); renderFavorites(); };
$('#navBtnSettings').onclick = () => switchTab('Settings');

function switchTab(name) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
  $(\`#navBtn\${name}\`).classList.add('active');
  $(\`#tab\${name}\`).classList.add('active');
}

async function processInput() {
  let raw = $('#rjUrl').value.trim();
  setStatus('');
  $('#result').classList.remove('show');

  if (!raw) { setStatus(currentLang === 'fa' ? 'لطفاً نام قطعه یا لینک رادیوجوان را وارد کنید' : 'Please enter track name or Radio Javan link', 'warn'); return; }

  const btn = $('#fetchBtn');
  btn.disabled = true;

  if (isShortRJLink(raw)) {
    setStatus(currentLang === 'fa' ? 'در حال باز کردن لینک کوتاه...' : 'Resolving short link...');
    try { raw = await resolveShortLink(raw); }
    catch(e) { setStatus(currentLang === 'fa' ? '❌ لینک کوتاه باز نشد' : '❌ Failed to resolve short link', 'err'); btn.disabled = false; return; }
  }

  const info = detectRJ(raw);
  if (info) {
    setStatus(currentLang === 'fa' ? 'در حال دریافت اطلاعات از رادیوجوان...' : 'Fetching data from Radio Javan...');
    try {
      if (info.kind === 'playlist') {
        const d = await rjFetch('playlist', info.id);
        const songs = (d.items || d.songs || []).map(normalizeItem);
        renderPlaylist({ title: d.title || 'Playlist', cover: d.photo_player || d.photo || DEFAULT_COVER, creator: d.created_by || '', songs }, false);
      } else if (info.kind === 'podcast_show') {
        const d = await fetchPodcastShow(info.id);
        const songs = (d.podcasts || d.items || []).map(normalizeItem);
        renderPlaylist({ title: d.title || \`Podcast Show \${info.id}\`, cover: d.photo_large || d.photo || DEFAULT_COVER, creator: d.podcast_artist || '', songs }, false);
      } else if (info.kind === 'artist') {
        const d = await fetchArtist(info.id);
        const songs = [...(d.mp3s || []), ...(d.podcasts || [])].map(normalizeItem);
        if (!songs.length) throw new Error(currentLang === 'fa' ? 'اثری برای این هنرمند پیدا نشد' : 'No tracks found for this artist');
        const artistName = d.name || d.query || info.id.replace(/-/g, ' ');
        renderPlaylist({ title: \`🎤 \${artistName}\`, cover: d.photo || DEFAULT_COVER, creator: \`\${toFa(songs.length)} tracks\`, songs }, false);
      } else {
        const d = await rjFetch(info.kind, info.id);
        if (d.type === 'show' || Array.isArray(d.podcasts)) {
          const songs = (d.podcasts || []).map(normalizeItem);
          renderPlaylist({ title: d.title || 'Podcast Show', cover: d.photo_large || d.photo || DEFAULT_COVER, creator: d.podcast_artist || '', songs }, false);
        } else {
          renderSingle(info.kind, normalizeItem(d));
        }
      }
      $('#result').classList.add('show');
      setStatus('');
    } catch(e) { setStatus('❌ ' + e.message, 'err'); }
    finally { btn.disabled = false; }
  } else {
    setStatus(currentLang === 'fa' ? \`در حال جستجوی «\${raw}»...\` : \`Searching for "\${raw}"...\`);
    addHistory(raw);
    $('#result').classList.add('show');
    $('#singleCard').style.display = 'none';
    $('#plCard').style.display = 'block';
    $('#plHead').style.display = 'none';
    $('#plActions').style.display = 'none';
    $('#featuredBoxContainer').style.display = 'none';
    $('#plTracks').innerHTML = renderSkeletons(4);

    try {
      const data = await searchRJ(raw);
      if (!data) throw new Error();

      let featured = null;
      if (Array.isArray(data.shows) && data.shows.length > 0) {
        featured = { type: 'show', ...data.shows[0] };
      } else if (Array.isArray(data.artists) && data.artists.length > 0) {
        featured = { type: 'artist', ...data.artists[0] };
      }

      const rawItems = [...(data.podcasts || []), ...(data.mp3s || []), ...(data.songs || [])];
      if (!rawItems.length && !featured) {
        $('#result').classList.remove('show');
        setStatus(currentLang === 'fa' ? 'هیچ موردی یافت نشد' : 'No results found', 'warn');
        btn.disabled = false;
        return;
      }

      renderPlaylist({ title: raw, songs: rawItems.map(normalizeItem) }, true, featured);
      setStatus('');
    } catch(e) {
      $('#result').classList.remove('show');
      setStatus(currentLang === 'fa' ? '❌ خطا در جستجو' : '❌ Search error', 'err');
    } finally {
      btn.disabled = false;
    }
  }
}

const inputEl = $('#rjUrl');
const clearBtn = $('#clearBtn');
inputEl.oninput = () => clearBtn.classList.toggle('show', inputEl.value.length > 0);
clearBtn.onclick = () => { inputEl.value = ''; clearBtn.classList.remove('show'); inputEl.focus(); };
$('#fetchBtn').onclick = processInput;
inputEl.onkeydown = e => { if (e.key === 'Enter') processInput(); };

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW registration failed:', err));
  });
}

// Ensure trending loads when we load the first time
window.addEventListener('DOMContentLoaded', () => {
  loadTrendingItems();
});

</script>
</body>
</html>
`

fs.writeFileSync('./app/src/main/assets/www/index.html', html, 'utf-8');
console.log('HTML updated successfully.');
