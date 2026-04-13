# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Xeno-Gotchi** is a satirical horror digital pet web game — a Tamagotchi parody set in the Alien/Prometheus franchise universe. Players raise a Xenomorph from egg to adult through a series of arcade minigames.

The living design spec is at `DESIGN_SPEC.md`. Always consult it for game mechanics, UI text, and feature intent before implementing anything. The old reference spec lives in `_OLD Build Guide/XENO-GOTCHI_DESIGN_SPEC.md` (historical context only).

## Tech Stack

- **Rendering:** HTML5 Canvas
- **Logic:** JavaScript ES6+ (no build tools, no framework — vanilla JS)
- **Styling:** CSS3 for the device shell/UI chrome
- **Persistence:** `localStorage` for save state
- **Target:** Mobile-first web (iOS/Android touchscreen primary, desktop secondary)

## Actual File Structure

```
index.html              — Title screen + main menu (START / CONTINUE / OPTIONS)
phase1.html             — Phase 1 Breakout game (loads tools/level.json via fetch)
DESIGN_SPEC.md          — Living design document (update this as decisions are made)
tools/
  level-editor.html     — Backend-only level editor (not for players)
  level.json            — Phase 1 level data (designed in level editor)
  img/
    egg_red.png         — Crimson egg sprite
    egg_blue.png        — Obsidian egg sprite
    egg_green.png       — Ivory egg sprite
    weyland_pixel logo.png — Weyland-Yutani pixel art logo (title screen)
sprites/                — (future pixel art assets)
_OLD Build Guide/       — Original design docs (reference only, do not modify)
```

## Development in the Browser

**Important:** `phase1.html` uses `fetch('tools/level.json')` which requires an HTTP server — it will fail on the `file://` protocol.

```bash
# Simple local server (Python) — run from project root
python3 -m http.server 8080

# Or use Node
npx serve .
```

Then open `http://localhost:8080` in the browser.

## Architecture

### State Machine (Core Pattern)

The entire game is driven by a phase state machine. Each phase is a distinct gameplay mode:

| Phase | Name | Game Style | Status |
|---|---|---|---|
| 1 | Egg (Ovomorph) | Breakout/Arkanoid clone | **Built** |
| 2A | Facehugger – Location | Memory/Concentration card game | Designed |
| 2B | Facehugger – Bait | Frogger-style vertical runner | Designed |
| 2C | Facehugger – Hunt | Pac-Man/maze chase (reversed) | Designed |
| 3 | Chestburster | Stealth maze (repeatable, dual-meter) | Designed |
| 4 | Adult | Idle pet with action minigames | Designed |

State transitions are deterministic and driven by player performance/choices. Choices in Phase 1 (egg type) and Phase 2 (location + bait) combine to determine the final xenomorph species (12 base × 3 egg variants = 36 combinations — see `DESIGN_SPEC.md`).

### Phase 1 Implementation Details

- Level loaded from `tools/level.json` via `fetch()` — 13 columns × 30 rows of bricks
- Three eggs embedded in the level (row 2): ivory at col 2, crimson at col 6, obsidian at col 10
- Eggs are PNG sprites (`egg_red/blue/green.png`) sized to cover 2 bricks tall in the canvas
- **Canvas approach:** Fixed internal resolution `420×800`. CSS `transform: scale()` with `Math.min(scaleX, scaleY)` for uniform scaling — guarantees round ball. `canvas.parentElement` is `.game-frame` (5% inset + silver border). `toCanvas(clientX, clientY)` converts screen coords back to canvas space.
- Ball angle controlled by relative hit position on paddle
- **Setback mechanic (no lives):** When ball hits the electric field barrier, it plays a vaporize animation (Mega Man-style 8-way particle burst + expanding ring), reseals the last 2 destroyed bricks (`destroyHistory` ring buffer, max 2), then resets ball to center paddle. No permanent failure.
- **Electric field:** Animated lightning barrier at the bottom of the play area (`ELECTRIC_Y = 733`, above bottom rail at `785`). Config block at top of script (`EF_*` constants) controls bolt count, glow, jitter, flicker rate.
- **Vaporize animation:** Ball flickers white→cyan and shrinks over ~18 frames, expanding electric ring at impact, then 8 primary chunks + 24 sparks fly outward. Config block (`VZ_*` constants) controls duration, particle counts, speeds.
- **Ball physics:** `MIN_VX` enforces minimum horizontal speed after every brick hit to prevent vertical trapping. `EDGE_THRESHOLD` / `EDGE_KICK` control corner-hit behavior for sharp ricochets.
- **Phase states:** `loading → ready → play → exploding → gutter → chosen`
- Win: hitting an egg triggers the chosen overlay, saves `xg_egg` to `localStorage`, transitions to next phase
- ESC returns to `index.html`
- Moving starfield background (separate fixed `<canvas id="starsBg">`, same system as title screen)

### Key Systems

**Evolution/Lure System:** The combination of egg type + hunting location + bait determines the adult xenomorph species and its stat loadout (Ferocity, Life, Speed). Egg type applies stat modifiers to base species stats.

**Phase 3 Dual-Meter:** Hunger Bar (red) and Life Bar (green) both must reach 100% simultaneously to trigger evolution. Meters drain over real-time idle and are filled by the repeatable Vent Stalker minigame. Getting caught applies a -10% Life penalty and ends the round immediately.

**Canvas Rendering:** 16-bit pixel art aesthetic (SNES/Genesis era). Two display modes: full color and monochrome (green-on-black). The "SIGNAL: 2122" vibe toggle switches between them.

**Save State:** `localStorage` stores current phase, xenomorph species/stats, and meter values. Currently only `xg_egg` (egg choice from Phase 1) is written.

### Egg Types

| Key | Name | Color | Sprite | Stat Bias |
|---|---|---|---|---|
| `crimson` | Crimson Egg | Red | `egg_red.png` | Ferocity +2, Life -1 |
| `obsidian` | Obsidian Egg | Blue/Black | `egg_blue.png` | Speed +2, Life -1 |
| `ivory` | Ivory Egg | Green/Pale | `egg_green.png` | Life +2, Ferocity -1 |

### Mobile Controls by Phase

- **Phase 1:** Mouse/touch left-right to move paddle (scale-corrected for canvas)
- **Phase 2A:** Direct tap to flip cards
- **Phase 2B:** Swipe UP/DOWN only (no left/right)
- **Phase 2C:** Swipe to change direction (momentum-based, always moving)
- **Phase 3:** Hold screen edges to move continuously; hold UP near hide hole to hide
- **Phase 4:** Tap-timed minigames

## Design Constraints

- **Pixel art only** — all sprites must be 16-bit style; no smooth gradients in game canvas
- **Mobile-first** — touch targets must be large; no precision input required
- **Satirical tone** — in-game text, death messages, and animations lean into corporate/horror parody (Weyland-Yutani branding, "GAME OVER, MAN!", etc.)
- **No permanent failure in Phases 1–2** — mistakes extend play time, not end the game (Phase 2C hunt is the exception: host killed = Game Over)
- **Phase 3 one-strike rule** — getting caught once ends the round immediately (no lives)
- **Setback not penalty in Phase 1** — gutter reseals 2 bricks, not a lives system
