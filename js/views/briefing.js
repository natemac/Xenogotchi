// ══════════════════════════════════════════
// views/briefing.js — onboarding terminal email
// ══════════════════════════════════════════
import { getUnlocked, markRead } from '../emails.js';

const CHAR_DELAY = 26;
const LINE_DELAY = 160;

const MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12'];

function randTs() {
  const m  = MONTHS[Math.floor(Math.random() * 12)];
  const d  = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  const h  = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const mn = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const s  = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  return `2122.${m}.${d} ${h}:${mn}:${s}`;
}

function randEmpId() {
  return 'EMP-' + String(Math.floor(Math.random() * 89999) + 10000);
}

let _timers = [];
let _done   = false;

export function init(container) {
  const emails  = getUnlocked();
  const email   = emails.find(e => e.id === 'welcome_briefing') || emails[0];
  const message = email ? email.body : 'TRANSMISSION ERROR.';
  const from    = email ? email.from : 'BIOPET.DIV@WEYLAND-YUTANI.COM';
  const subject = email ? email.subject : 'CLASSIFIED';

  _done   = false;
  _timers = [];

  container.innerHTML = `
    <div class="reader-wrap">
      <div class="email-card" id="emailCard">

        <!-- Building border segments -->
        <div class="ec-top"></div>
        <div class="ec-right"></div>
        <div class="ec-left"></div>
        <div class="ec-bottom" id="ecBottom"></div>

        <!-- Chrome bar -->
        <div class="ec-chrome" id="ecChrome">
          <span class="ec-chrome-label">WY-SECCOMM v4.1 // BIOPET DIV</span>
          <span class="ec-chrome-label">${randTs()}</span>
        </div>

        <!-- Headers -->
        <div class="ec-headers" id="ecHeaders">
          <div class="ec-header-row"><span class="ec-hkey">FROM:</span><span class="ec-hval">${from}</span></div>
          <div class="ec-header-row"><span class="ec-hkey">TO:&nbsp;&nbsp;&nbsp;</span><span class="ec-hval">${randEmpId()}</span></div>
          <div class="ec-header-row"><span class="ec-hkey">SUBJ:</span><span class="ec-hval">${subject}</span></div>
        </div>

        <!-- Body -->
        <div class="ec-body">
          <div class="term-output" id="briefOutput"></div><span class="term-cursor" id="briefCursor"></span>
          <div class="term-tap" id="briefTap">— TAP TO CONTINUE —</div>
        </div>

        <!-- Footer -->
        <div class="ec-footer">
          <span>ENCRYPTION: STANDARD</span>
          <span>CLASSIFICATION: EMPLOYEE-GRADE</span>
        </div>

      </div>
    </div>
  `;

  _ensureReaderStyles();

  // Border sequence — same timing as inbox reader
  _after(() => {
    const card = document.getElementById('emailCard');
    if (card) { card.classList.add('borders-active'); _syncH(card); }
  }, 240);

  _after(() => {
    document.getElementById('ecChrome')?.classList.add('visible');
    document.getElementById('ecHeaders')?.classList.add('visible');
  }, 320);

  _after(() => _typeNext(message, 0), 460);

  const handler = () => _skipOrContinue(message, email);
  document.addEventListener('keydown',     handler);
  document.addEventListener('pointerdown', handler);
  container._briefHandler = handler;
}

export function destroy() {
  _timers.forEach(t => clearTimeout(t));
  _timers = [];
  const h = document.querySelector('#viewport')?._briefHandler;
  if (h) {
    document.removeEventListener('keydown',     h);
    document.removeEventListener('pointerdown', h);
  }
}

function _after(fn, ms) {
  const t = setTimeout(fn, ms);
  _timers.push(t);
  return t;
}

function _syncH(card) {
  if (!card || !card.isConnected) return;
  card.style.setProperty('--card-h', card.scrollHeight + 'px');
}

function _typeNext(message, idx) {
  const output = document.getElementById('briefOutput');
  if (!output) return;
  if (idx >= message.length) { _finish(); return; }

  const ch = message[idx];
  output.textContent += ch;

  const card = document.getElementById('emailCard');
  if (card) _syncH(card);

  _after(() => _typeNext(message, idx + 1), ch === '\n' ? LINE_DELAY : CHAR_DELAY);
}

function _finish() {
  _done = true;
  const cursor = document.getElementById('briefCursor');
  const tap    = document.getElementById('briefTap');
  if (cursor) cursor.style.display = 'none';
  if (tap)    tap.classList.add('visible');
}

function _skipOrContinue(message, email) {
  if (!_done) {
    _timers.forEach(t => clearTimeout(t));
    _timers = [];
    const output = document.getElementById('briefOutput');
    if (output) output.textContent = message;
    // Sync height after full text is set
    const card = document.getElementById('emailCard');
    if (card) _syncH(card);
    _finish();
  } else {
    if (email) markRead(email.id);
    document.dispatchEvent(new CustomEvent('xg:navigate', { detail: { to: 'phase1' } }));
  }
}

// ── Ensure reader styles are injected (shared with inbox reader) ──
function _ensureReaderStyles() {
  if (document.getElementById('reader-styles')) return;
  const s = document.createElement('style');
  s.id = 'reader-styles';
  s.textContent = `
    .reader-wrap {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 32px 20px 48px;
      overflow-y: auto;
    }

    .email-card {
      position: relative;
      width: 100%;
      max-width: 560px;
      --card-h: 0px;
      padding: 20px 20px 16px;
    }

    .ec-top {
      position: absolute;
      top: 0; left: 0;
      height: 1px;
      background: var(--green);
      box-shadow: 0 0 6px rgba(60,255,60,0.5);
      width: 0;
      animation: ec-draw-h 0.22s ease-out 0.04s forwards;
    }

    .ec-right {
      position: absolute;
      top: 0; right: 0;
      width: 1px;
      height: var(--card-h);
      background: var(--green);
      box-shadow: 0 0 6px rgba(60,255,60,0.5);
      opacity: 0;
      transition: opacity 0.08s;
    }

    .ec-left {
      position: absolute;
      top: 0; left: 0;
      width: 1px;
      height: var(--card-h);
      background: var(--green);
      box-shadow: 0 0 6px rgba(60,255,60,0.5);
      opacity: 0;
      transition: opacity 0.08s;
    }

    .email-card.borders-active .ec-right,
    .email-card.borders-active .ec-left {
      opacity: 1;
    }

    .ec-bottom {
      position: absolute;
      left: 0;
      top: calc(var(--card-h) - 1px);
      height: 1px;
      width: 100%;
      background: var(--green);
      box-shadow: 0 0 6px rgba(60,255,60,0.5);
      opacity: 0;
      transition: opacity 0.08s;
    }

    .email-card.borders-active .ec-bottom {
      opacity: 1;
    }

    @keyframes ec-draw-h {
      from { width: 0; }
      to   { width: 100%; }
    }

    .ec-chrome {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--green-dim);
      margin-bottom: 10px;
      opacity: 0;
      transition: opacity 0.12s;
    }

    .ec-chrome.visible { opacity: 1; }

    .ec-chrome-label {
      font-size: 5px;
      color: var(--green-dim);
      letter-spacing: 2px;
    }

    .ec-back {
      font-family: 'Press Start 2P', monospace;
      font-size: 5px;
      color: var(--green-dim);
      background: none;
      border: none;
      cursor: pointer;
      letter-spacing: 1px;
    }
    .ec-back:hover { color: var(--green); }

    .ec-headers {
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 1px solid #0d1f0d;
      opacity: 0;
      transition: opacity 0.12s;
    }

    .ec-headers.visible { opacity: 1; }

    .ec-header-row {
      font-size: 5px;
      letter-spacing: 1px;
      color: var(--green-dim);
      line-height: 2.6;
      display: flex;
      gap: 8px;
    }

    .ec-hkey { color: var(--green-dim); white-space: pre; }
    .ec-hval { color: var(--green); opacity: 0.8; }

    .ec-body {
      min-height: 16px;
      padding-bottom: 4px;
    }

    .ec-footer {
      margin-top: 16px;
      padding-top: 8px;
      border-top: 1px solid #0a180a;
      font-size: 4px;
      color: #1a3a1a;
      letter-spacing: 2px;
      display: flex;
      justify-content: space-between;
    }
  `;
  document.head.appendChild(s);
}
