// ══════════════════════════════════════════
// shell.js — taskbar + starfield
// ══════════════════════════════════════════

// ── STARFIELD ────────────────────────────
let _starCanvas, _starCtx, _stars = [], _starRaf;

function _initStarfield() {
  _starCanvas = document.getElementById('stars');
  _starCtx    = _starCanvas.getContext('2d');
  _resizeStars();
  _spawnStars();
  _drawStars();
  window.addEventListener('resize', () => { _resizeStars(); _spawnStars(); });
}

function _resizeStars() {
  _starCanvas.width  = window.innerWidth;
  _starCanvas.height = window.innerHeight;
}

function _spawnStars() {
  _stars = [];
  for (let i = 0; i < 120; i++) {
    _stars.push({
      x:      Math.random() * _starCanvas.width,
      y:      Math.random() * _starCanvas.height,
      size:   Math.random() < 0.8 ? 1 : 2,
      speed:  Math.random() * 0.3 + 0.05,
      bright: Math.random(),
    });
  }
}

function _drawStars() {
  _starCtx.clearRect(0, 0, _starCanvas.width, _starCanvas.height);
  for (const s of _stars) {
    _starCtx.fillStyle = `rgba(255,255,255,${(0.3 + s.bright * 0.7).toFixed(2)})`;
    _starCtx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
    s.y += s.speed;
    if (s.y > _starCanvas.height) { s.y = 0; s.x = Math.random() * _starCanvas.width; }
  }
  _starRaf = requestAnimationFrame(_drawStars);
}

// ── TASKBAR ──────────────────────────────
export function init() {
  _initStarfield();

  const taskbar = document.getElementById('taskbar');
  taskbar.innerHTML = `
    <nav class="tb-bar">
      <div class="tb-left">
        <img class="tb-wl-logo" src="tools/img/weyland_pixel logo_green.png" alt="W-Y">
        <span class="tb-title">XENOGOTCHI</span>
        <span class="tb-phase" id="tbPhase"></span>
      </div>
      <div class="tb-right">
        <button class="tb-btn" id="tbMail" title="Mail">
          <div class="tb-icon"><div class="icon-mail"></div></div>
          <div class="tb-notify" id="tbNotify"></div>
          <span class="tb-label">MAIL</span>
        </button>
        <div class="tb-divider"></div>
        <button class="tb-btn" id="tbVitals" title="Vitals">
          <div class="tb-icon"><i class="icon-vitals">♥</i></div>
          <span class="tb-label">VITALS</span>
        </button>
        <div class="tb-divider"></div>
        <button class="tb-btn" id="tbCodex" title="Codex">
          <div class="tb-icon"><div class="icon-codex"></div></div>
          <span class="tb-label">CODEX</span>
        </button>
        <div class="tb-divider"></div>
        <button class="tb-btn" id="tbOpts" title="Options">
          <div class="tb-icon"><div class="icon-gear"></div></div>
          <span class="tb-label">OPTS</span>
        </button>
        <div class="tb-divider"></div>
        <button class="tb-btn" id="tbSave" title="Save & Exit">
          <div class="tb-icon"><div class="icon-save"></div></div>
          <span class="tb-label">SAVE</span>
        </button>
      </div>
    </nav>
  `;

  // Wire buttons → custom events that app.js handles
  document.getElementById('tbMail').addEventListener('click',   () => document.dispatchEvent(new CustomEvent('xg:navigate', { detail: { to: 'inbox'   } })));
  document.getElementById('tbVitals').addEventListener('click', () => document.dispatchEvent(new CustomEvent('xg:navigate', { detail: { to: 'vitals'  } })));
  document.getElementById('tbCodex').addEventListener('click',  () => document.dispatchEvent(new CustomEvent('xg:navigate', { detail: { to: 'codex'   } })));
  document.getElementById('tbOpts').addEventListener('click',   () => document.dispatchEvent(new CustomEvent('xg:navigate', { detail: { to: 'options' } })));
  document.getElementById('tbSave').addEventListener('click',   () => document.dispatchEvent(new CustomEvent('xg:saveExit')));

  // Listen for phase label updates from views
  document.addEventListener('xg:setPhase', e => setPhaseLabel(e.detail.label));

  // Listen for mail flash updates
  document.addEventListener('xg:mailFlash', e => setMailFlash(e.detail.active));
}

export function showTaskbar() {
  document.getElementById('taskbar').classList.remove('hidden');
}

export function hideTaskbar() {
  document.getElementById('taskbar').classList.add('hidden');
}

export function setPhaseLabel(label) {
  const el = document.getElementById('tbPhase');
  if (el) el.textContent = label;
}

export function setMailFlash(active) {
  const dot = document.getElementById('tbNotify');
  if (dot) dot.classList.toggle('active', active);
}
