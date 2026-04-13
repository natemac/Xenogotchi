// ══════════════════════════════════════════
// views/phase1.js — Breakout / Egg selection
// ══════════════════════════════════════════
import { set, KEYS } from '../save.js';
import { checkTrigger } from '../emails.js';

// ── CONSTANTS ───────────────────────────
const GAME_W  = 420;
const GAME_H  = 800;
const RAIL_W  = 15;
const TOP_H   = 15;
const COLS    = 13;
const CELL_H  = 15;
const GAP     = 2;
const INNER_W = GAME_W - RAIL_W * 2;
const CELL_W  = (INNER_W - (COLS - 1) * GAP) / COLS;

const PADDLE_W      = 100;
const PADDLE_H      = 12;
const PADDLE_Y      = 685;
const BALL_R        = 5;
const BASE_SPD      = 5;
const BOTTOM_RAIL_Y = GAME_H - RAIL_W;
const ELECTRIC_Y    = PADDLE_Y + PADDLE_H + 36;
const ELECTRIC_H    = BOTTOM_RAIL_Y - ELECTRIC_Y;

// ── ELECTRIC FIELD CONFIG ───────────────
const EF_BOLT_H_MIN   = 3;
const EF_BOLT_H_MAX   = 6;
const EF_BOLT_V_MIN   = 2;
const EF_BOLT_V_MAX   = 5;
const EF_FLICKER_RATE = 4;
const EF_GLOW_BLUR    = 22;
const EF_BOLT_ALPHA   = 0.95;
const EF_JITTER_H     = 14;
const EF_JITTER_V     = 20;
const EF_GRAD_OPACITY = 0.52;
const EF_FLICKER_SKIP = 0.10;

// ── VAPORIZE CONFIG ─────────────────────
const VZ_DURATION     = 42;
const VZ_CHUNK_COUNT  = 8;
const VZ_SPARK_COUNT  = 24;
const VZ_CHUNK_SPEED  = 5.5;
const VZ_SPARK_SPEED  = 6;
const VZ_DECEL        = 0.87;
const VZ_FLASH_FRAMES = 5;

// ── BALL PHYSICS CONFIG ─────────────────
const MIN_VX         = 2.0;
const EDGE_THRESHOLD = 1.25;
const EDGE_KICK      = 2.5;

const EGG_COLORS = { crimson: '#ff3333', obsidian: '#5ce7ff', ivory: '#3cff3c' };
const EGG_SRC    = {
  crimson:  'tools/img/egg_red.png',
  obsidian: 'tools/img/egg_blue.png',
  ivory:    'tools/img/egg_green.png',
};
const EGG_NAMES  = { crimson: 'CRIMSON', obsidian: 'OBSIDIAN', ivory: 'IVORY' };

// ── MODULE STATE ────────────────────────
let canvas, ctx;
let gameBricks     = [];
let paddle         = {};
let ball           = {};
let launched       = false;
let phase          = 'loading';
let mouseX         = 0;
let flashParticles = [];
let destroyHistory = [];
let chosenEgg      = null;
let overlayNextFn  = null;
let electricTick   = 0;
let electricBolts  = [];
let explodeTimer   = 0;
let _scale = 1, _ox = 0, _oy = 0;
let _rafId = null;
const EGG_IMGS = {};

export async function init(container) {
  // Inject HTML
  container.innerHTML = `
    <div class="phase1-wrap">
      <div class="hud-bar">
        <div class="hud-title">PHASE 1 — INCUBATION</div>
        <div class="stat">BRICKS <span id="hudBricks">—</span></div>
        <div class="stat">EGGS <span id="hudEggs">—</span></div>
      </div>
      <div class="game-wrap">
        <div class="game-frame">
          <canvas id="gameCanvas"></canvas>
          <div id="msgOverlay">
            <div class="overlay-title" id="overlayTitle"></div>
            <img class="overlay-egg" id="overlayEgg" src="" alt="" style="display:none;">
            <div class="overlay-sub" id="overlaySub"></div>
            <button class="overlay-btn" id="overlayBtn"></button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Notify shell of phase
  document.dispatchEvent(new CustomEvent('xg:setPhase', { detail: { label: 'PHASE I' } }));

  // Preload egg images
  for (const type of ['crimson', 'obsidian', 'ivory']) {
    if (!EGG_IMGS[type]) {
      const img = new Image();
      img.src = EGG_SRC[type];
      EGG_IMGS[type] = img;
    }
  }

  canvas = document.getElementById('gameCanvas');
  ctx    = canvas.getContext('2d');

  document.getElementById('overlayBtn').addEventListener('click', overlayAction);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('keydown',     onKey);
  window.addEventListener('touchmove',   _preventDefault, { passive: false });
  window.addEventListener('resize',      scaleCanvas);

  await loadLevel();
}

export function destroy() {
  if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerdown', onPointerDown);
  window.removeEventListener('keydown',     onKey);
  window.removeEventListener('touchmove',   _preventDefault);
  window.removeEventListener('resize',      scaleCanvas);
  phase = 'loading';
}

function _preventDefault(e) { e.preventDefault(); }

// ── LEVEL ────────────────────────────────
async function loadLevel() {
  const resp = await fetch('tools/level.json');
  const data = await resp.json();
  buildBricks(data);
  initGame();
}

function buildBricks(data) {
  gameBricks = [];
  for (const item of data.items) {
    const { r, c } = item;
    const x = RAIL_W + c * (CELL_W + GAP);
    const y = TOP_H  + r * (CELL_H + GAP);
    gameBricks.push({
      x, y, w: CELL_W, h: CELL_H,
      color:   item.type === 'egg' ? EGG_COLORS[item.eggType] : item.color,
      str:     item.type === 'egg' ? 1 : item.str,
      health:  item.type === 'egg' ? 1 : (item.str === 0 ? Infinity : item.str),
      isEgg:   item.type === 'egg',
      eggType: item.eggType || null,
      flash: 0, alive: true,
    });
  }
}

function initGame() {
  canvas.width  = GAME_W;
  canvas.height = GAME_H;
  scaleCanvas();

  paddle         = { x: GAME_W / 2 - PADDLE_W / 2, y: PADDLE_Y, w: PADDLE_W, h: PADDLE_H };
  flashParticles = [];
  destroyHistory = [];
  chosenEgg      = null;
  electricTick   = 0;
  electricBolts  = [];
  explodeTimer   = 0;
  generateBolts();
  resetBall();

  phase = 'ready';
  updateHUD();

  showOverlay('INCUBATION CHAMBER', '', 'TAP TO LAUNCH', () => {
    hideOverlay();
    phase = 'ready';
  });

  _rafId = requestAnimationFrame(gameLoop);
}

// ── CANVAS SCALING ───────────────────────
function scaleCanvas() {
  if (!canvas) return;
  const wrap = canvas.parentElement;
  if (!wrap) return;
  const aw = wrap.clientWidth;
  const ah = wrap.clientHeight;
  _scale = Math.min(aw / GAME_W, ah / GAME_H);
  _ox    = Math.round((aw - GAME_W * _scale) / 2);
  _oy    = Math.max(0, Math.round((ah - GAME_H * _scale) / 2));
  canvas.style.transform = `translate(${_ox}px, ${_oy}px) scale(${_scale})`;
}

function toCanvas(clientX, clientY) {
  const wrap = canvas.parentElement;
  const rect = wrap.getBoundingClientRect();
  return {
    x: (clientX - rect.left - _ox) / _scale,
    y: (clientY - rect.top  - _oy) / _scale,
  };
}

// ── OVERLAY ──────────────────────────────
function showOverlay(title, sub, btnLabel, nextFn, eggType = null, titleClass = 'yellow') {
  document.getElementById('overlayTitle').textContent = title;
  document.getElementById('overlayTitle').className   = 'overlay-title ' + titleClass;
  document.getElementById('overlaySub').innerHTML     = sub;
  document.getElementById('overlayBtn').textContent   = btnLabel;
  const eggEl = document.getElementById('overlayEgg');
  eggEl.style.display = eggType ? 'block' : 'none';
  if (eggType) eggEl.src = EGG_SRC[eggType];
  overlayNextFn = nextFn;
  document.getElementById('msgOverlay').classList.add('visible');
}

function hideOverlay() {
  document.getElementById('msgOverlay').classList.remove('visible');
  overlayNextFn = null;
}

function overlayAction() {
  if (overlayNextFn) overlayNextFn();
}

// ── CONTROLS ─────────────────────────────
function _gameInputBlocked(e) {
  if (document.getElementById('overlay')?.classList.contains('open')) return true;
  if (e.target.closest('#taskbar')) return true;
  if (e.target.closest('#overlay')) return true;
  return false;
}

function onPointerMove(e) {
  if (_gameInputBlocked(e)) return;
  const { x } = toCanvas(e.clientX, e.clientY);
  mouseX   = x;
  paddle.x = Math.max(RAIL_W, Math.min(GAME_W - RAIL_W - PADDLE_W, mouseX - PADDLE_W / 2));
  if (!launched) ball.x = paddle.x + PADDLE_W / 2;
}

function onPointerDown(e) {
  if (_gameInputBlocked(e)) return;
  if (e.target.closest('#msgOverlay')) return;
  if (phase === 'ready')  { launched = true; phase = 'play'; }
  if (phase === 'gutter') { resetBall(); phase = 'ready'; }
}

function onKey(e) {
  if (document.getElementById('overlay')?.classList.contains('open')) return;
  if (e.key === 'Escape') {
    document.dispatchEvent(new CustomEvent('xg:navigate', { detail: { to: 'title' } }));
    return;
  }
  if ((e.key === ' ' || e.key === 'Enter') && phase !== 'exploding') {
    if (phase === 'ready')  { launched = true; phase = 'play'; }
    if (phase === 'gutter') { resetBall(); phase = 'ready'; }
  }
  const step = 18;
  if (e.key === 'ArrowLeft')  paddle.x = Math.max(RAIL_W, paddle.x - step);
  if (e.key === 'ArrowRight') paddle.x = Math.min(GAME_W - RAIL_W - PADDLE_W, paddle.x + step);
  if (!launched) ball.x = paddle.x + PADDLE_W / 2;
}

function resetBall() {
  ball = {
    x:  paddle.x + PADDLE_W / 2,
    y:  paddle.y - BALL_R - 1,
    vx: (Math.random() > 0.5 ? 1 : -1) * BASE_SPD * 0.6,
    vy: -BASE_SPD,
    r:  BALL_R,
  };
  launched = false;
}

// ── ELECTRIC FIELD ───────────────────────
function generateBolts() {
  electricBolts = [];
  const numH = EF_BOLT_H_MIN + Math.floor(Math.random() * (EF_BOLT_H_MAX - EF_BOLT_H_MIN + 1));
  for (let i = 0; i < numH; i++) {
    const baseY = ELECTRIC_Y + 4 + Math.random() * (ELECTRIC_H - 8);
    const bolt  = [];
    let x = RAIL_W;
    while (x < GAME_W - RAIL_W) {
      bolt.push({ x, y: baseY + (Math.random() - 0.5) * EF_JITTER_H });
      x += 5 + Math.random() * 11;
    }
    bolt.push({ x: GAME_W - RAIL_W, y: baseY });
    electricBolts.push({ points: bolt, alpha: (0.4 + Math.random() * 0.6) * EF_BOLT_ALPHA });
  }
  const numV = EF_BOLT_V_MIN + Math.floor(Math.random() * (EF_BOLT_V_MAX - EF_BOLT_V_MIN + 1));
  for (let i = 0; i < numV; i++) {
    const baseX = RAIL_W + Math.random() * (GAME_W - RAIL_W * 2);
    const bolt  = [];
    let y = ELECTRIC_Y;
    while (y < BOTTOM_RAIL_Y) {
      bolt.push({ x: baseX + (Math.random() - 0.5) * EF_JITTER_V, y });
      y += 4 + Math.random() * 8;
    }
    electricBolts.push({ points: bolt, alpha: (0.3 + Math.random() * 0.55) * EF_BOLT_ALPHA });
  }
}

// ── GAME LOOP ────────────────────────────
function gameLoop() {
  update();
  draw();
  _rafId = requestAnimationFrame(gameLoop);
}

function update() {
  if (phase === 'exploding') {
    explodeTimer++;
    flashParticles = flashParticles.filter(p => p.life > 0);
    flashParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.chunk) { p.vx *= VZ_DECEL; p.vy *= VZ_DECEL; }
      p.vy += 0.12;
      p.life--;
    });
    if (explodeTimer >= VZ_DURATION) {
      const toRestore = destroyHistory.splice(-2);
      for (const b of toRestore) { b.alive = true; b.health = b.str; b.flash = 0; }
      paddle.x = GAME_W / 2 - PADDLE_W / 2;
      resetBall();
      phase = 'gutter';
      updateHUD();
    }
    return;
  }

  if (phase !== 'play') return;

  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall collisions
  if (ball.x - ball.r < RAIL_W)          { ball.x = RAIL_W + ball.r;          ball.vx =  Math.abs(ball.vx); }
  if (ball.x + ball.r > GAME_W - RAIL_W) { ball.x = GAME_W - RAIL_W - ball.r; ball.vx = -Math.abs(ball.vx); }
  if (ball.y - ball.r < TOP_H)           { ball.y = TOP_H + ball.r;            ball.vy =  Math.abs(ball.vy); }

  // Electric field
  if (ball.y + ball.r >= ELECTRIC_Y) {
    ball.y = ELECTRIC_Y - ball.r;
    ball.vx = 0; ball.vy = 0;
    explodeTimer = 0;
    spawnExplosion(ball.x, ELECTRIC_Y);
    phase = 'exploding';
    return;
  }

  // Paddle
  if (circleRect(ball, paddle)) {
    ball.vy = -Math.abs(ball.vy);
    const rel = (ball.x - (paddle.x + PADDLE_W / 2)) / (PADDLE_W / 2);
    ball.vx = rel * BASE_SPD;
    const spd = Math.hypot(ball.vx, ball.vy);
    ball.vx = ball.vx / spd * BASE_SPD;
    ball.vy = ball.vy / spd * BASE_SPD;
    ball.y  = paddle.y - ball.r - 1;
  }

  // Bricks
  for (const b of gameBricks) {
    if (!b.alive) continue;
    if (!circleRect(ball, b)) continue;

    const nx  = Math.max(b.x, Math.min(ball.x, b.x + b.w));
    const ny  = Math.max(b.y, Math.min(ball.y, b.y + b.h));
    const dx  = ball.x - nx;
    const dy  = ball.y - ny;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    if      (adx > ady * EDGE_THRESHOLD) { ball.vx *= -1; }
    else if (ady > adx * EDGE_THRESHOLD) { ball.vy *= -1; }
    else { ball.vx *= -1; ball.vy *= -1; ball.vx += (dx >= 0 ? 1 : -1) * EDGE_KICK; }

    if (Math.abs(ball.vx) < MIN_VX) {
      ball.vx = MIN_VX * (ball.vx !== 0 ? Math.sign(ball.vx) : (Math.random() > 0.5 ? 1 : -1));
    }
    const spd2 = Math.hypot(ball.vx, ball.vy);
    if (spd2 > 0) { ball.vx = ball.vx / spd2 * BASE_SPD; ball.vy = ball.vy / spd2 * BASE_SPD; }

    b.flash = 8;
    if (b.health !== Infinity) {
      b.health--;
      if (b.health <= 0) {
        b.alive = false;
        spawnParticles(b);
        if (b.isEgg) {
          phase     = 'chosen';
          chosenEgg = b.eggType;
          set(KEYS.egg, b.eggType);
          set(KEYS.phase, 'phase1_complete');
          checkTrigger('phase1_complete');
          checkTrigger('egg_' + b.eggType);
          updateHUD();
          const name      = EGG_NAMES[b.eggType];
          const titleClass = b.eggType === 'crimson' ? 'red' : b.eggType === 'obsidian' ? '' : 'green';
          showOverlay(
            name + ' EGG',
            'YOUR EGG HAS BEEN CHOSEN.<br><br>THE XENOMORPH STIRS<br>WITHIN THE SHELL.',
            '► CONTINUE',
            () => document.dispatchEvent(new CustomEvent('xg:navigate', { detail: { to: 'phase2a' } })),
            b.eggType,
            titleClass
          );
          return;
        } else {
          destroyHistory.push(b);
          if (destroyHistory.length > 2) destroyHistory.shift();
        }
      }
    }
    break;
  }

  for (const b of gameBricks) if (b.flash > 0) b.flash--;
  flashParticles = flashParticles.filter(p => p.life > 0);
  flashParticles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life--; });

  updateHUD();
}

function circleRect(c, r) {
  const nx = Math.max(r.x, Math.min(c.x, r.x + r.w));
  const ny = Math.max(r.y, Math.min(c.y, r.y + r.h));
  return Math.hypot(c.x - nx, c.y - ny) < c.r;
}

function spawnParticles(b) {
  for (let i = 0; i < 6; i++) {
    flashParticles.push({
      x: b.x + b.w / 2, y: b.y + b.h / 2,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 1.5) * 3,
      color: b.color, life: 20 + Math.random() * 10, size: 4,
    });
  }
}

function spawnExplosion(x, y) {
  const chunkCols = ['#00ffff','#88bbff','#cc66ff','#ffffff','#aaffff'];
  for (let i = 0; i < VZ_CHUNK_COUNT; i++) {
    const angle = (i / VZ_CHUNK_COUNT) * Math.PI * 2;
    const spd   = VZ_CHUNK_SPEED * (0.7 + Math.random() * 0.6);
    flashParticles.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      color: chunkCols[Math.floor(Math.random() * chunkCols.length)],
      life: 32 + Math.floor(Math.random() * 14),
      size: 3 + Math.floor(Math.random() * 4),
      chunk: true,
    });
  }
  const sparkCols = ['#ff8800','#ffee00','#00ddff','#ff44ff','#ffffff','#66ffff'];
  for (let i = 0; i < VZ_SPARK_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd   = 0.8 + Math.random() * VZ_SPARK_SPEED;
    flashParticles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 4,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 1.5,
      color: sparkCols[Math.floor(Math.random() * sparkCols.length)],
      life: 14 + Math.floor(Math.random() * 22),
      size: 1 + Math.random() * 2.5,
      chunk: false,
    });
  }
}

// ── DRAW ─────────────────────────────────
function draw() {
  ctx.clearRect(0, 0, GAME_W, GAME_H);

  ctx.fillStyle = '#00152b';
  ctx.fillRect(0, 0, GAME_W, GAME_H);
  drawGrid();

  drawRailV(0);
  drawRailV(GAME_W - RAIL_W);
  drawRailH();
  drawRailHBottom();
  drawElectricField();

  for (const b of gameBricks) {
    if (!b.alive) continue;
    const flash = b.flash > 0;
    if (b.isEgg) {
      const img = EGG_IMGS[b.eggType];
      const iw  = b.w * 1.1;
      const ih  = b.h * 2.125;
      if (flash) {
        ctx.save(); ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#fff'; ctx.fillRect(b.x, b.y, b.w, ih);
        ctx.restore();
      }
      if (img && img.complete) ctx.drawImage(img, b.x + b.w / 2 - iw / 2, b.y, iw, ih);
      else { ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.w, b.h); }
    } else {
      ctx.fillStyle = flash ? '#fff' : b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(b.x, b.y, b.w, 3);
      if (b.health === Infinity) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
        for (let i = -b.h; i < b.w + b.h; i += 5) {
          ctx.beginPath(); ctx.moveTo(b.x + i, b.y); ctx.lineTo(b.x + i + b.h, b.y + b.h); ctx.stroke();
        }
        ctx.restore();
      } else if (b.str > 1) {
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = '6px monospace';
        ctx.fillText('●'.repeat(Math.min(b.health, 3)), b.x + b.w - 10, b.y + b.h - 1);
      }
    }
  }

  for (const p of flashParticles) {
    ctx.globalAlpha = Math.min(p.life / 30, 1);
    ctx.fillStyle   = p.color;
    const sz = p.size || 4;
    ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
  }
  ctx.globalAlpha = 1;

  // Paddle
  const pr = PADDLE_H / 2;
  const pg = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + PADDLE_H);
  pg.addColorStop(0, '#ffa65c'); pg.addColorStop(1, '#e86615');
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, PADDLE_W, PADDLE_H, pr);
  ctx.fill();
  ctx.fillStyle = '#d6eefb';
  ctx.fillRect(paddle.x + pr, paddle.y + 2, 8, PADDLE_H - 4);
  ctx.fillRect(paddle.x + PADDLE_W - pr - 8, paddle.y + 2, 8, PADDLE_H - 4);

  // Ball / vaporize
  if (phase !== 'exploding') {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle  = '#fff';
    ctx.shadowBlur = 8; ctx.shadowColor = '#fff';
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    const t       = explodeTimer;
    const visible = Math.floor(t / 2) % 2 === 0;
    const radius  = ball.r * Math.max(0, 1 - t / 18);
    if (visible && radius > 0.5) {
      const ballCol = (Math.floor(t / 3) % 2 === 0) ? '#ffffff' : '#00ffff';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, radius, 0, Math.PI * 2);
      ctx.fillStyle  = ballCol;
      ctx.shadowBlur = 24; ctx.shadowColor = '#0ff';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    if (t < 22) {
      const ringR = (t / 22) * 28;
      const alpha = 1 - t / 22;
      ctx.beginPath();
      ctx.arc(ball.x, ELECTRIC_Y, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(100,180,255,${alpha})`;
      ctx.lineWidth   = 2.5 - t * 0.1;
      ctx.shadowBlur  = 14; ctx.shadowColor = '#0af';
      ctx.stroke();
      ctx.shadowBlur  = 0;
    }
    if (t < VZ_FLASH_FRAMES) {
      const fa = (1 - t / VZ_FLASH_FRAMES) * 0.35;
      ctx.fillStyle = `rgba(160,200,255,${fa})`;
      ctx.fillRect(0, 0, GAME_W, GAME_H);
    }
  }

  // In-canvas prompts
  if (phase === 'ready') {
    ctx.fillStyle = 'rgba(255,230,0,0.85)';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('— TAP TO LAUNCH —', GAME_W / 2, paddle.y - 18);
    ctx.textAlign = 'left';
  }
  if (phase === 'gutter') {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, paddle.y - 40, GAME_W, 36);
    ctx.fillStyle = '#5ce7ff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('THERMAL SEAL RESEALED', GAME_W / 2, paddle.y - 26);
    ctx.fillStyle = '#ffe600';
    ctx.font = '9px monospace';
    ctx.fillText('TAP TO RETRY', GAME_W / 2, paddle.y - 12);
    ctx.textAlign = 'left';
  }
}

function drawElectricField() {
  electricTick++;
  if (electricTick % EF_FLICKER_RATE === 0) generateBolts();
  const grad = ctx.createLinearGradient(0, ELECTRIC_Y, 0, BOTTOM_RAIL_Y);
  grad.addColorStop(0,   'rgba(20,0,80,0)');
  grad.addColorStop(0.4, 'rgba(40,10,150,0.22)');
  grad.addColorStop(1,   `rgba(90,20,230,${EF_GRAD_OPACITY})`);
  ctx.fillStyle = grad;
  ctx.fillRect(RAIL_W, ELECTRIC_Y, GAME_W - RAIL_W * 2, ELECTRIC_H);
  ctx.save();
  ctx.shadowBlur = EF_GLOW_BLUR; ctx.shadowColor = '#80f';
  ctx.lineWidth  = 1.5; ctx.lineCap = 'round';
  for (const bolt of electricBolts) {
    if (Math.random() < EF_FLICKER_SKIP) continue;
    const r = 100 + Math.floor(Math.random() * 110);
    const g = 40  + Math.floor(Math.random() * 60);
    ctx.strokeStyle = `rgba(${r},${g},255,${bolt.alpha})`;
    ctx.beginPath();
    ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
    for (let i = 1; i < bolt.points.length; i++) ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawGrid() {
  ctx.strokeStyle = '#0060ff'; ctx.lineWidth = 0.5; ctx.globalAlpha = 0.3;
  for (let x = 0; x < GAME_W; x += 28) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,GAME_H); ctx.stroke(); }
  for (let y = 0; y < GAME_H; y += 28) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(GAME_W,y); ctx.stroke(); }
  ctx.globalAlpha = 1;
}

function drawRailV(x) {
  const g = ctx.createLinearGradient(x,0,x+RAIL_W,0);
  g.addColorStop(0,'#666'); g.addColorStop(0.3,'#d8d8d8'); g.addColorStop(0.5,'#9a9a9a'); g.addColorStop(0.7,'#d8d8d8'); g.addColorStop(1,'#666');
  ctx.fillStyle = g; ctx.fillRect(x,0,RAIL_W,GAME_H);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
  for (let y=0; y<GAME_H; y+=30) { ctx.beginPath(); ctx.moveTo(x,y+14); ctx.lineTo(x+RAIL_W,y+14); ctx.stroke(); }
}

function drawRailH() {
  const g = ctx.createLinearGradient(0,0,0,TOP_H);
  g.addColorStop(0,'#666'); g.addColorStop(0.3,'#d8d8d8'); g.addColorStop(0.5,'#9a9a9a'); g.addColorStop(0.7,'#d8d8d8'); g.addColorStop(1,'#666');
  ctx.fillStyle = g; ctx.fillRect(0,0,GAME_W,TOP_H);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
  for (let x=0; x<GAME_W; x+=30) { ctx.beginPath(); ctx.moveTo(x+14,0); ctx.lineTo(x+14,TOP_H); ctx.stroke(); }
}

function drawRailHBottom() {
  const g = ctx.createLinearGradient(0,BOTTOM_RAIL_Y,0,GAME_H);
  g.addColorStop(0,'#555'); g.addColorStop(0.3,'#c8c8c8'); g.addColorStop(0.5,'#888'); g.addColorStop(0.7,'#c8c8c8'); g.addColorStop(1,'#555');
  ctx.fillStyle = g; ctx.fillRect(0,BOTTOM_RAIL_Y,GAME_W,RAIL_W);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
  for (let x=0; x<GAME_W; x+=30) { ctx.beginPath(); ctx.moveTo(x+14,BOTTOM_RAIL_Y); ctx.lineTo(x+14,GAME_H); ctx.stroke(); }
}

function updateHUD() {
  const bricksEl = document.getElementById('hudBricks');
  const eggsEl   = document.getElementById('hudEggs');
  if (!bricksEl || !eggsEl) return;
  bricksEl.textContent = gameBricks.filter(b => b.alive && !b.isEgg && b.health !== Infinity).length;
  eggsEl.textContent   = gameBricks.filter(b => b.alive && b.isEgg).length;
}
