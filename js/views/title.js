// ══════════════════════════════════════════
// views/title.js — title splash + main menu
// ══════════════════════════════════════════
import { hasSave } from '../save.js';

export function init(container) {
  const canContinue = hasSave();

  container.innerHTML = `
    <div class="title-screen" id="titleScreen">
      <div class="title-inner">
        <img class="weyland-logo" src="tools/img/weyland_pixel logo.png" alt="Weyland-Yutani">
        <div class="presents">PRESENTS</div>

        <div class="title-block">
          <div class="title-main">XENOGOTCHI</div>
          <div class="title-tagline">BIOWEAPONS CAN BE PETS TOO</div>
        </div>

        <!-- Bottom section: swaps between splash and menu -->
        <div class="title-bottom" id="titleBottom">
          <div class="title-splash" id="titleSplash">
            <div class="tagline">RAISE IT.<br>FEED IT.<br>FEAR IT.</div>
            <div class="press-start" id="pressStart">— PRESS START —</div>
          </div>

          <div class="title-menu" id="titleMenu" style="display:none;">
            <div class="menu" id="menu">
              <div class="menu-item selected" data-action="start">
                <span class="cursor">▶</span><span>START</span>
              </div>
              <div class="menu-item ${canContinue ? '' : 'disabled'}" data-action="continue">
                <span class="cursor">▶</span><span>CONTINUE</span>
              </div>
              <div class="menu-item" data-action="options">
                <span class="cursor">▶</span><span>OPTIONS</span>
              </div>
            </div>

            <div class="menu-footer">
              © 2122 WEYLAND-YUTANI CORPORATION<br>
              "BUILDING BETTER WORLDS"<br>
              &nbsp;<br>
              ↑↓ MOVE &nbsp; ENTER SELECT
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  _addStyles();
  _bindEvents(container);
}

export function destroy() {
  document.removeEventListener('keydown', _onKey);
}

// ── STYLES ──────────────────────────────
function _addStyles() {
  if (document.getElementById('title-styles')) return;
  const s = document.createElement('style');
  s.id = 'title-styles';
  s.textContent = `
    .title-screen {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .title-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 480px;
      padding: 0 16px;
    }
    .weyland-logo {
      width: 200px; height: auto;
      image-rendering: pixelated;
      margin-bottom: 8px;
    }
    .presents {
      font-size: 6px; color: var(--gray);
      letter-spacing: 4px; text-transform: uppercase;
      margin-bottom: 18px;
    }
    .title-block { text-align: center; margin-bottom: 10px; }
    .title-main {
      font-size: 26px; line-height: 1.3; letter-spacing: 2px;
      color: var(--yellow);
      text-shadow: 4px 4px 0 #7a6e00, 0 0 20px rgba(255,230,0,0.4);
    }
    .title-tagline {
      font-size: 6px; color: var(--gray);
      letter-spacing: 2px; margin-top: 8px;
    }
    .title-bottom {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      margin-top: 20px;
    }
    .title-splash {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .tagline {
      font-size: 7px; color: var(--cyan);
      letter-spacing: 2px; text-align: center;
      margin-bottom: 36px; line-height: 2;
    }
    .press-start {
      font-size: 8px; color: var(--white);
      letter-spacing: 2px;
      animation: blink 1s step-end infinite;
      margin-bottom: 48px;
    }
    .title-menu {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      animation: fadeIn 0.15s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .menu {
      display: flex; flex-direction: column;
      gap: 18px; align-items: flex-start;
      width: 200px; margin-bottom: 48px;
    }
    .menu-item {
      font-size: 11px; letter-spacing: 2px;
      color: var(--gray); cursor: pointer;
      display: flex; align-items: center; gap: 12px;
      transition: color 0.05s; user-select: none;
    }
    .menu-item .cursor { color: var(--yellow); visibility: hidden; width: 12px; }
    .menu-item.selected { color: var(--white); }
    .menu-item.selected .cursor { visibility: visible; }
    .menu-item.disabled { color: var(--darkgray); cursor: default; }
    .menu-footer {
      font-size: 6px; color: var(--darkgray);
      letter-spacing: 2px; text-align: center; line-height: 2.2;
    }
  `;
  document.head.appendChild(s);
}

// ── EVENTS ──────────────────────────────
let _menuIdx = 0;
const _menuItems = () => Array.from(document.querySelectorAll('.menu-item:not(.disabled)'));

let _onKey;

function _bindEvents(container) {
  const splash    = container.querySelector('#titleSplash');
  const menu      = container.querySelector('#titleMenu');

  function showMenu() {
    splash.style.display = 'none';
    menu.style.display   = 'flex';
  }

  splash.addEventListener('click',       showMenu);
  splash.addEventListener('pointerdown', showMenu);

  container.querySelector('#menu').addEventListener('click', e => {
    const item = e.target.closest('.menu-item');
    if (!item || item.classList.contains('disabled')) return;
    const items = _menuItems();
    const idx = items.indexOf(item);
    if (idx !== -1) { _menuIdx = idx; _updateSel(); }
    _activate(item.dataset.action);
  });

  _onKey = function(e) {
    if (menu.style.display === 'none') { showMenu(); return; }
    const items = _menuItems();
    if (e.key === 'ArrowUp')   { _menuIdx = (_menuIdx - 1 + items.length) % items.length; _updateSel(); }
    if (e.key === 'ArrowDown') { _menuIdx = (_menuIdx + 1) % items.length; _updateSel(); }
    if (e.key === 'Enter' || e.key === ' ') _activate(items[_menuIdx]?.dataset.action);
  };

  document.addEventListener('keydown', _onKey);
}

function _updateSel() {
  const items = _menuItems();
  document.querySelectorAll('.menu-item').forEach(el => {
    el.classList.toggle('selected', el === items[_menuIdx]);
  });
}

function _activate(action) {
  if (action === 'start')    document.dispatchEvent(new CustomEvent('xg:navigate', { detail: { to: 'briefing' } }));
  if (action === 'continue') document.dispatchEvent(new CustomEvent('xg:navigate', { detail: { to: 'resume'   } }));
  if (action === 'options')  document.dispatchEvent(new CustomEvent('xg:navigate', { detail: { to: 'options'  } }));
}
