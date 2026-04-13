// ══════════════════════════════════════════
// app.js — entry point and view router
// ══════════════════════════════════════════
import { init as shellInit, showTaskbar, hideTaskbar, setMailFlash } from './shell.js';
import { init as emailsInit, hasUnread, checkTrigger } from './emails.js';
import { get, set, KEYS, hasSave } from './save.js';

const VIEWS_WITHOUT_TASKBAR = new Set(['title']);

// Views that overlay the game — rendered into #overlay, game stays alive
const OVERLAY_VIEWS = new Set(['inbox', 'vitals', 'codex', 'options']);

let currentView  = null;   // { name, module } — active game/phase view in #viewport
let overlayView  = null;   // { name, module } — active overlay in #overlay
let gameView     = null;   // last non-overlay view name, for restoring after overlay

const viewport   = document.getElementById('viewport');
const overlayEl  = document.getElementById('overlay');

// ── BOOT ─────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  shellInit();
  await emailsInit();
  setMailFlash(hasUnread());
  await switchView('title');
});

// ── NAVIGATION EVENTS ────────────────────
document.addEventListener('xg:navigate', async e => {
  const { to } = e.detail;

  if (to === 'resume') {
    const saved = get(KEYS.phase);
    await switchView(saved || 'title');
    return;
  }

  if (to === 'phase2a') {
    await switchView('title');
    return;
  }

  await switchView(to);
});

document.addEventListener('xg:back', async () => {
  if (overlayView) {
    _closeOverlay();
    return;
  }
  await switchView('title');
});

document.addEventListener('xg:saveExit', async () => {
  if (overlayView) _closeOverlay();
  await switchView('title');
});

// ── VIEW SWITCHER ─────────────────────────
export async function switchView(name) {
  if (OVERLAY_VIEWS.has(name)) {
    await _openOverlay(name);
    return;
  }

  // Close any open overlay first
  if (overlayView) _closeOverlay();

  // Destroy current viewport view
  if (currentView?.module?.destroy) {
    try { currentView.module.destroy(); } catch {}
  }
  viewport.innerHTML = '';

  const mod = await _loadView(name);
  if (!mod) return;

  gameView    = name;
  currentView = { name, module: mod };

  if (VIEWS_WITHOUT_TASKBAR.has(name)) {
    hideTaskbar();
  } else {
    showTaskbar();
  }

  if (name !== 'title') {
    set(KEYS.phase, name);
  }

  await mod.init(viewport);
  setMailFlash(hasUnread());
}

// ── OVERLAY OPEN / CLOSE ──────────────────
async function _openOverlay(name) {
  // Same icon clicked again — toggle closed
  if (overlayView?.name === name) {
    _closeOverlay();
    return;
  }

  // Swap to a different overlay
  if (overlayView?.module?.destroy) {
    try { overlayView.module.destroy(); } catch {}
  }
  overlayEl.innerHTML = '';

  const mod = await _loadView(name);
  if (!mod) return;

  overlayView = { name, module: mod };
  overlayEl.classList.add('open');
  await mod.init(overlayEl);
  setMailFlash(hasUnread());
}

function _closeOverlay() {
  if (overlayView?.module?.destroy) {
    try { overlayView.module.destroy(); } catch {}
  }
  overlayView = null;
  overlayEl.innerHTML = '';
  overlayEl.classList.remove('open');
}

// ── DYNAMIC IMPORT MAP ────────────────────
async function _loadView(name) {
  const map = {
    title:    () => import('./views/title.js'),
    briefing: () => import('./views/briefing.js'),
    phase1:   () => import('./views/phase1.js'),
    inbox:    () => import('./views/inbox.js'),
    vitals:   () => import('./views/vitals.js'),
    codex:    () => import('./views/codex.js'),
    options:  () => import('./views/options.js'),
  };

  const loader = map[name];
  if (!loader) {
    console.warn(`[app] Unknown view: "${name}"`);
    return null;
  }

  try {
    return await loader();
  } catch (err) {
    console.error(`[app] Failed to load view "${name}":`, err);
    viewport.innerHTML = `<div style="color:#f33;font-family:monospace;padding:40px;font-size:12px;">
      ERROR LOADING MODULE: ${name}<br>${err.message}
    </div>`;
    return null;
  }
}
