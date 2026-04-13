// ══════════════════════════════════════════
// views/options.js — options screen
// ══════════════════════════════════════════

export function init(container) {
  container.innerHTML = `
    <div class="term-screen">
      <div class="term-chrome">
        <span class="term-chrome-label">WY-SECCOMM v4.1 // OPTIONS</span>
        <button class="term-back-btn" id="optsBack">◀ BACK</button>
      </div>
      <div class="term-body" style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;">
        <div class="stub-icon">⚙</div>
        <div class="stub-title">OPTIONS</div>
        <div class="stub-body">
          OPTIONS PANEL COMING SOON.<br><br>
          PLANNED SETTINGS:<br><br>
          DISPLAY MODE (COLOR / MONO)<br>
          SOUND ON / OFF<br>
          RESET SAVE DATA<br>
          VERSION INFO
        </div>
      </div>
      <div class="term-footer">
        <span>BUILD: v0.2</span>
        <span>© 2122 WEYLAND-YUTANI</span>
      </div>
    </div>
  `;

  document.getElementById('optsBack').addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('xg:back'));
  });

  const keyHandler = e => { if (e.key === 'Escape') document.dispatchEvent(new CustomEvent('xg:back')); };
  document.addEventListener('keydown', keyHandler);
}

export function destroy() {}
