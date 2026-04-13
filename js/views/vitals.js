// ══════════════════════════════════════════
// views/vitals.js — quick-view pet stats
// ══════════════════════════════════════════
import { get, KEYS } from '../save.js';

export function init(container) {
  const phase   = get(KEYS.phase)   || '—';
  const egg     = get(KEYS.egg)     || '—';
  const hunger  = get(KEYS.hunger)  || '—';
  const life    = get(KEYS.life)    || '—';

  const eggLabel = { crimson: 'CRIMSON', obsidian: 'OBSIDIAN', ivory: 'IVORY' }[egg] || '—';
  const phaseLbl = _phaseLabel(phase);

  container.innerHTML = `
    <div class="term-screen">
      <div class="term-chrome">
        <span class="term-chrome-label">WY-SECCOMM v4.1 // VITALS</span>
        <button class="term-back-btn" id="vitalsBack">◀ BACK</button>
      </div>
      <div class="term-body">
        <div class="vitals-grid">
          <div class="vital-row">
            <div class="vital-label">CURRENT PHASE</div>
            <div class="vital-value">${phaseLbl}</div>
          </div>
          <div class="vital-row">
            <div class="vital-label">SPECIMEN TYPE</div>
            <div class="vital-value">${eggLabel} EGG</div>
          </div>
          <div class="vital-divider"></div>
          <div class="vital-row">
            <div class="vital-label">HUNGER</div>
            <div class="vital-value ${hunger === '—' ? 'dim' : ''}">${hunger === '—' ? '— N/A —' : hunger + '%'}</div>
          </div>
          <div class="vital-row">
            <div class="vital-label">LIFE BAR</div>
            <div class="vital-value ${life === '—' ? 'dim' : ''}">${life === '—' ? '— N/A —' : life + '%'}</div>
          </div>
          <div class="vital-divider"></div>
          <div class="vital-note">
            HUNGER AND LIFE METRICS<br>
            AVAILABLE FROM PHASE 3.
          </div>
        </div>
      </div>
      <div class="term-footer">
        <span>SPECIMEN STATUS: ACTIVE</span>
        <span>AUTO-REFRESH: OFF</span>
      </div>
    </div>
  `;

  _addStyles();

  document.getElementById('vitalsBack').addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('xg:back'));
  });

  const keyHandler = e => { if (e.key === 'Escape') document.dispatchEvent(new CustomEvent('xg:back')); };
  document.addEventListener('keydown', keyHandler);
  container._vitalsKey = keyHandler;
}

export function destroy() {
  const h = document.querySelector('#viewport')?._vitalsKey;
  if (h) document.removeEventListener('keydown', h);
}

function _phaseLabel(p) {
  const map = {
    title: 'TITLE SCREEN', briefing: 'ONBOARDING',
    phase1: 'PHASE I — INCUBATION', phase1_complete: 'PHASE I — COMPLETE',
    phase2a: 'PHASE II — LOCATION', phase2b: 'PHASE II — BAIT',
    phase2c: 'PHASE II — HUNT',   phase3: 'PHASE III — VENT STALKER',
    phase4: 'PHASE IV — ADULT',
  };
  return map[p] || p.toUpperCase();
}

function _addStyles() {
  if (document.getElementById('vitals-styles')) return;
  const s = document.createElement('style');
  s.id = 'vitals-styles';
  s.textContent = `
    .vitals-grid { display: flex; flex-direction: column; gap: 0; }
    .vital-row {
      display: flex; justify-content: space-between;
      padding: 10px 0; border-bottom: 1px solid #0a1a0a;
    }
    .vital-label {
      font-size: 6px; color: var(--green-dim);
      letter-spacing: 1px;
    }
    .vital-value {
      font-size: 6px; color: var(--green);
      letter-spacing: 1px; text-align: right;
    }
    .vital-value.dim { color: var(--green-dim); }
    .vital-divider {
      height: 1px; background: var(--green-dim);
      margin: 8px 0; opacity: 0.4;
    }
    .vital-note {
      font-size: 5px; color: var(--green-dim);
      letter-spacing: 1px; line-height: 2.2;
      margin-top: 8px; text-align: center;
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
