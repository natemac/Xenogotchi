// ══════════════════════════════════════════
// views/inbox.js — email inbox + reader
// ══════════════════════════════════════════
import { getUnlocked, isRead, markRead, hasUnread } from '../emails.js';

const CHAR_DELAY = 26;
const LINE_DELAY = 160;

let _timers     = [];
let _readingId  = null;

export function init(container) {
  _readingId = null;
  _renderList(container);
}

export function destroy() {
  _timers.forEach(t => clearTimeout(t));
  _timers = [];
}

function _after(fn, ms) {
  const t = setTimeout(fn, ms);
  _timers.push(t);
  return t;
}

// ── INBOX LIST ───────────────────────────
function _renderList(container) {
  destroy(); // clear any active timers from reader
  const emails = getUnlocked();

  container.innerHTML = `
    <div class="term-screen">
      <div class="term-chrome">
        <span class="term-chrome-label">WY-SECCOMM v4.1 // INBOX</span>
        <span class="term-chrome-status">${emails.length} MESSAGE${emails.length !== 1 ? 'S' : ''}</span>
      </div>
      <div class="term-body" style="padding:0;">
        <div class="inbox-header">
          <span>FROM</span>
          <span>SUBJECT</span>
        </div>
        <div id="inboxList">
          ${_buildRows(emails)}
        </div>
        ${_buildLockedRows()}
      </div>
      <div class="term-footer">
        <span>ENCRYPTION: STANDARD</span>
        <span>TAP MESSAGE TO READ</span>
      </div>
    </div>
  `;

  _addInboxStyles();

  container.querySelectorAll('.inbox-row[data-id]').forEach(row => {
    row.addEventListener('click',       () => _openEmail(container, row.dataset.id));
    row.addEventListener('pointerdown', () => _openEmail(container, row.dataset.id));
  });

  const keyHandler = e => {
    if (e.key === 'Escape') document.dispatchEvent(new CustomEvent('xg:back'));
  };
  document.addEventListener('keydown', keyHandler);
  container._inboxKeyHandler = keyHandler;
}

function _buildRows(emails) {
  if (emails.length === 0) return `<div class="inbox-empty">NO MESSAGES</div>`;
  return emails.map(e => `
    <div class="inbox-row ${isRead(e.id) ? '' : 'unread'}" data-id="${e.id}">
      <div class="inbox-unread-dot"></div>
      <div class="inbox-row-content">
        <div class="inbox-from">${e.from}</div>
        <div class="inbox-subj">${e.subject}</div>
      </div>
    </div>
  `).join('');
}

function _buildLockedRows() {
  return `
    <div class="inbox-row locked">
      <div class="inbox-row-content">
        <div class="inbox-lock">▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒</div>
        <div class="inbox-lock-label">LOCKED — PHASE 2</div>
      </div>
    </div>
    <div class="inbox-row locked">
      <div class="inbox-row-content">
        <div class="inbox-lock">▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒</div>
        <div class="inbox-lock-label">LOCKED — PHASE 3</div>
      </div>
    </div>
    <div class="inbox-row locked">
      <div class="inbox-row-content">
        <div class="inbox-lock">▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒</div>
        <div class="inbox-lock-label">LOCKED — PHASE 4</div>
      </div>
    </div>
  `;
}

// ── EMAIL READER ─────────────────────────
function _openEmail(container, id) {
  const emails = getUnlocked();
  const email  = emails.find(e => e.id === id);
  if (!email) return;

  markRead(id);
  _readingId = id;
  document.dispatchEvent(new CustomEvent('xg:mailFlash', { detail: { active: hasUnread() } }));

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
          <span class="ec-chrome-label">WY-SECCOMM v4.1 // MESSAGE</span>
          <button class="ec-back" id="inboxBack">◀ BACK</button>
        </div>

        <!-- Headers -->
        <div class="ec-headers" id="ecHeaders">
          <div class="ec-header-row"><span class="ec-hkey">FROM:</span><span class="ec-hval">${email.from}</span></div>
          <div class="ec-header-row"><span class="ec-hkey">TO:&nbsp;&nbsp;&nbsp;</span><span class="ec-hval">${email.to_label || 'EMPLOYEE'}</span></div>
          <div class="ec-header-row"><span class="ec-hkey">SUBJ:</span><span class="ec-hval">${email.subject}</span></div>
        </div>

        <!-- Body -->
        <div class="ec-body">
          <div class="term-output" id="readerOutput"></div><span class="term-cursor" id="readerCursor"></span>
        </div>

        <!-- Footer -->
        <div class="ec-footer">
          <span>ENCRYPTION: STANDARD</span>
          <span>CLASSIFICATION: EMPLOYEE-GRADE</span>
        </div>

      </div>
    </div>
  `;

  _addReaderStyles();

  // Step 1 — top border draws (CSS animation, ~250ms)
  // Step 2 — left/right borders appear and start tracking height
  _after(() => {
    const card = document.getElementById('emailCard');
    if (card) {
      card.classList.add('borders-active');
      _syncBorderHeight(card);
    }
  }, 240);

  // Step 3 — chrome + headers fade in
  _after(() => {
    const chrome  = document.getElementById('ecChrome');
    const headers = document.getElementById('ecHeaders');
    if (chrome)  chrome.classList.add('visible');
    if (headers) headers.classList.add('visible');
  }, 320);

  // Step 4 — typing starts
  _after(() => _typeNext(email.body, 0, container), 460);

  // Back button
  document.getElementById('inboxBack').addEventListener('click', () => {
    destroy();
    _renderList(container);
  });
  document.getElementById('inboxBack').addEventListener('pointerdown', e => e.stopPropagation());

  const keyHandler = e => {
    if (e.key === 'Escape') { destroy(); _renderList(container); }
  };
  document.addEventListener('keydown', keyHandler);
  container._readerKeyHandler = keyHandler;
}

function _syncBorderHeight(card) {
  if (!card || !card.isConnected) return;
  card.style.setProperty('--card-h', card.scrollHeight + 'px');
}

function _typeNext(message, idx, container) {
  const output = document.getElementById('readerOutput');
  if (!output) return;

  if (idx >= message.length) {
    const cursor = document.getElementById('readerCursor');
    if (cursor) cursor.style.display = 'none';
    return;
  }

  const ch = message[idx];
  output.textContent += ch;

  // Keep border height in sync as card grows
  const card = document.getElementById('emailCard');
  if (card) _syncBorderHeight(card);

  const delay = ch === '\n' ? LINE_DELAY : CHAR_DELAY;
  _after(() => _typeNext(message, idx + 1, container), delay);
}

// ── STYLES ───────────────────────────────
function _addInboxStyles() {
  if (document.getElementById('inbox-styles')) return;
  const s = document.createElement('style');
  s.id = 'inbox-styles';
  s.textContent = `
    .inbox-header {
      background: #050505;
      border-bottom: 1px solid var(--green-dim);
      padding: 6px 12px;
      display: flex;
      justify-content: space-between;
      font-size: 5px;
      color: var(--green-dim);
      letter-spacing: 2px;
    }
    .inbox-row {
      border-bottom: 1px solid #0a0a0a;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: background 0.05s;
    }
    .inbox-row:hover { background: #050f05; }
    .inbox-row.unread { background: #030903; }
    .inbox-row.locked { opacity: 0.3; cursor: default; }
    .inbox-row.locked:hover { background: transparent; }
    .inbox-unread-dot {
      width: 5px; height: 5px;
      background: var(--green-dim);
      flex-shrink: 0;
    }
    .inbox-row.unread .inbox-unread-dot {
      background: var(--yellow);
      box-shadow: 0 0 4px rgba(255,255,0,0.6);
    }
    .inbox-row-content { flex: 1; min-width: 0; }
    .inbox-from {
      font-size: 5px; color: var(--green-dim);
      letter-spacing: 1px; margin-bottom: 3px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .inbox-row.unread .inbox-from { color: var(--yellow); }
    .inbox-subj {
      font-size: 5px; color: var(--green-dim);
      letter-spacing: 1px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .inbox-row.unread .inbox-subj { color: var(--green); }
    .inbox-lock { font-size: 5px; color: #333; letter-spacing: 1px; margin-bottom: 3px; }
    .inbox-lock-label { font-size: 5px; color: #333; letter-spacing: 1px; }
    .inbox-empty {
      font-size: 7px; color: var(--green-dim);
      letter-spacing: 2px; padding: 24px; text-align: center;
    }
  `;
  document.head.appendChild(s);
}

function _addReaderStyles() {
  if (document.getElementById('reader-styles')) return;
  const s = document.createElement('style');
  s.id = 'reader-styles';
  s.textContent = `
    /* ── Reader outer wrap ── */
    .reader-wrap {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 32px 20px 48px;
      overflow-y: auto;
    }

    /* ── Email card — grows with content ── */
    .email-card {
      position: relative;
      width: 100%;
      max-width: 560px;
      --card-h: 0px;
      padding: 20px 20px 16px;
    }

    /* ── Border segments ── */
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

    /* ── Card internals ── */
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
