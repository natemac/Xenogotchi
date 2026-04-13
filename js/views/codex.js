// ══════════════════════════════════════════
// views/codex.js — species/lore database
// ══════════════════════════════════════════

export function init(container) {
  container.innerHTML = `
    <div class="term-screen">
      <div class="term-chrome">
        <span class="term-chrome-label">WY-SECCOMM v4.1 // SPECIMEN CODEX</span>
        <button class="term-back-btn" id="codexBack">◀ BACK</button>
      </div>
      <div class="term-body" style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;">
        <div class="stub-icon">▤</div>
        <div class="stub-title">SPECIMEN DATABASE</div>
        <div class="stub-body">
          CLASSIFICATION: RESTRICTED<br><br>
          CODEX ENTRIES UNLOCK AS<br>
          YOUR SPECIMEN PROGRESSES.<br><br>
          CURRENT ENTRIES: 0 / 36<br><br>
          CONTINUE OPERATIONS TO<br>
          EXPAND YOUR ARCHIVE.
        </div>
      </div>
      <div class="term-footer">
        <span>ACCESS LEVEL: EMPLOYEE</span>
        <span>ENTRIES: LOCKED</span>
      </div>
    </div>
  `;

  _addStyles();

  document.getElementById('codexBack').addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('xg:back'));
  });

  const keyHandler = e => { if (e.key === 'Escape') document.dispatchEvent(new CustomEvent('xg:back')); };
  document.addEventListener('keydown', keyHandler);
}

export function destroy() {}

function _addStyles() {
  if (document.getElementById('stub-styles')) return;
  const s = document.createElement('style');
  s.id = 'stub-styles';
  s.textContent = `
    .stub-icon {
      font-size: 32px; color: var(--green-dim);
      letter-spacing: 0;
    }
    .stub-title {
      font-size: 8px; color: var(--green);
      letter-spacing: 3px;
    }
    .stub-body {
      font-size: 6px; color: var(--green-dim);
      letter-spacing: 1px; line-height: 2.4;
      text-align: center;
    }
    .term-back-btn {
      font-family: 'Press Start 2P', monospace;
      font-size: 5px; color: var(--green-dim);
      background: none; border: none; cursor: pointer;
      letter-spacing: 1px;
    }
    .term-back-btn:hover { color: var(--green); }
  `;
  document.head.appendChild(s);
}
