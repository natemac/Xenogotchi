# Xeno-Gotchi: A Perfect Organism
## Game Design Specification — Living Document

**Status:** Active development  
**Last Updated:** 2026-04-12 (session 2)  
**Historical Reference:** `_OLD Build Guide/XENO-GOTCHI_DESIGN_SPEC.md`

---

## Table of Contents

1. [Core Concept](#core-concept)
2. [Art Style & Tone](#art-style--tone)
3. [Game Flow Overview](#game-flow-overview)
4. [Phase 1 — The Egg (Ovomorph)](#phase-1--the-egg-ovomorph) ✅ Built
5. [Phase 2 — The Facehugger](#phase-2--the-facehugger) _(Designed)_
6. [Phase 3 — The Chestburster](#phase-3--the-chestburster) _(Designed)_
7. [Phase 4 — The Adult](#phase-4--the-adult) _(Designed)_
8. [Evolution & Lure System](#evolution--lure-system)
9. [Save State & Persistence](#save-state--persistence)
10. [UI Screens](#ui-screens)

---

## Core Concept

**Type:** R-rated satirical-horror digital pet web game  
**Inspiration:** 90s Tamagotchi × Alien / Predator / Prometheus franchise universe  
**Tone:** Corporate horror parody — Weyland-Yutani bureaucracy meets B-movie gore, played entirely straight within the pixel-art aesthetic

**Core Loop:** Player choices across phases determine their xenomorph's species and stat loadout. The game is never permanently punishing in the early phases — setbacks extend play time, not end runs. Phase 2C (Hunt) and Phase 3 (Chestburster death) are the only true game-over conditions in the lifecycle arc.

---

## Art Style & Tone

- **Visual:** Gritty 16-bit pixel art (SNES/Genesis era). No smooth gradients inside the game canvas.
- **Font:** Press Start 2P (Google Fonts) for all UI text.
- **Display modes:** Full color OR monochrome green-on-black ("SIGNAL: 2122" vibe toggle).
- **Shell concept:** Virtual handheld device styled as a leathery, ribbed Ovomorph — fleshy "nodes" as buttons at bottom. (Planned for CSS shell framing around canvas.)
- **Satirical copy:** All in-game text, death messages, and system messages lean into Weyland-Yutani corporate voice + horror B-movie parody.
  - Examples: "GAME OVER, MAN!", "SPECIMEN ESCAPED — PERFORMANCE REVIEW PENDING", "CONGRATULATIONS! IT'S A BABY!" (with balloons), "BUILDING BETTER WORLDS. ONE XENOMORPH AT A TIME."

### Writing Style Guide

The game's writing style should be grounded in a cold, corporate tone inspired by Weyland-Yutani internal communications, treating extreme biological horror as routine operational procedure. All text should feel like sterile system output or HR-approved messaging layered over a retro 80s sci-fi interface — featuring concise phrasing, status readouts, and occasional ALL-CAPS alerts.

The satire comes from contrast: upbeat, performance-driven corporate language applied to violent or unethical outcomes, without acknowledging the absurdity. Humor is never explicit; instead, it emerges through this deadpan delivery.

Classic B-movie horror lines are used sparingly at key moments (failures, deaths, major transitions) for impact. The player is implicitly framed as a disposable employee evaluated on results, not morality, reinforcing a tone that is procedural, detached, and quietly hostile rather than comedic or self-aware.

---

## Game Flow Overview

```
index.html (Title + Menu)
    │
    └─► phase1.html  — Phase 1: Breakout / Egg selection
            │
            └─► [Phase 2A] — Memory match: location selection
                    │
                    └─► [Phase 2B] — Frogger: bait selection
                            │
                            └─► [Phase 2C] — Pac-Man hunt: implantation
                                    │
                                    └─► [Phase 3] — Vent Stalker: chestburster growth
                                            │
                                            └─► [Phase 4] — Adult idle pet + minigames
```

Each phase transition saves relevant state to `localStorage`. The `xg_egg` key is written at Phase 1 completion.

---

## Phase 1 — The Egg (Ovomorph)

**Status: BUILT** (`phase1.html`)  
**Game Style:** Breakout / Arkanoid clone

### Summary

Player controls a paddle at the bottom of the screen. A ball bounces through brick "thermal seals." Three eggs are embedded in the level — hitting one directly wins the phase and locks in the player's xenomorph branch.

### The Three Eggs

| Name | Key | Sprite | Color Theme | Stat Bias |
|---|---|---|---|---|
| Crimson Egg | `crimson` | `tools/img/egg_red.png` | Red / dark red veins | Ferocity +2, Life -1 |
| Obsidian Egg | `obsidian` | `tools/img/egg_blue.png` | Black / dark gray, shadowy | Speed +2, Life -1 |
| Ivory Egg | `ivory` | `tools/img/egg_green.png` | Pale / cream / biomechanical | Life +2, Ferocity -1 |

Eggs are PNG sprites covering 2 bricks tall in the canvas (the clicked brick + one below). They are embedded in row 2 of the level at columns 2 (ivory), 6 (crimson), and 10 (obsidian).

### Level Structure (`tools/level.json`)

13 columns × 30 rows. Key zones:
- **Rows 0–1:** Full yellow bricks (str=1) — outermost thermal seal
- **Row 2:** Orange bricks (str=2) with three egg placements (c2, c6, c10)
- **Rows 3–5:** Orange bricks with gaps around egg columns
- **Row 6:** Full gray bricks (str=2)
- **Row 8:** Gray indestructible bricks (str=0) at c0, 3, 6, 9, 12 — structural pillars
- **Rows 9–14:** Five colored columns (red/pink/blue/teal/darkred) at pillar positions (str=3)
- **Row 15:** Gray indestructible bricks at pillar positions
- **Rows 17–18:** Cyan/green checkerboard full width (str=3)

Level is designed in `tools/level-editor.html` (backend tool, not for players) and loaded by `phase1.html` via `fetch('tools/level.json')`.

### Setback Mechanic (No Lives System)

No lives. When the ball reaches the electric field barrier at the bottom:
1. **Vaporize animation plays** — ball flickers white→cyan and shrinks; Mega Man-style 8-way chunk burst + spark particles; expanding electric ring at impact. ~42 frames total.
2. The **last 2 bricks destroyed** are restored to full health and marked alive again
3. Ball and paddle reset to center — "THERMAL SEAL RESEALED / TAP TO RETRY"
4. Player taps to serve from center

This is tracked via a `destroyHistory` ring buffer (max 2 entries). Egg hits do not enter the destroy history.

**Phase state during vaporize:** `play → exploding → gutter → ready`. Input is blocked during `exploding`.

**Design rationale:** Phase 1 should never permanently block the player. Setbacks add texture and tension without frustration. The player will always eventually reach an egg.

### Win Condition

Ball collides with an egg brick → phase transitions to `chosen`:
- Overlay shows egg name and flavor text: "YOUR EGG HAS BEEN CHOSEN. THE XENOMORPH STIRS WITHIN THE SHELL."
- `localStorage.setItem('xg_egg', eggType)` saves the choice
- "CONTINUE" button navigates to Phase 2 (currently placeholder back to `index.html`)

### Technical Notes

- **Canvas:** Fixed internal resolution `420×800`. CSS `transform: scale(Math.min(scaleX, scaleY))` for uniform scaling from `.game-frame` (canvas parent). Guarantees round ball at all screen sizes.
- **Layout:** `.game-wrap` has 5% horizontal crop via padding. `.game-frame` provides silver metallic border. Moving starfield on a fixed `<canvas id="starsBg">` behind the frame.
- **Electric field:** `ELECTRIC_Y = 733` (top of zone), `BOTTOM_RAIL_Y = 785` (bottom rail). A closing silver rail at the bottom matches the top/side rails, completing the chamber frame.
- **Ball physics:** `MIN_VX` constant enforces minimum horizontal speed post-brick-hit. `EDGE_THRESHOLD` + `EDGE_KICK` handle corner collisions to prevent vertical trapping.
- Brick coords: `x = RAIL_W + c * (CELL_W + GAP)`, `y = TOP_H + r * (CELL_H + GAP)`
- `CELL_W = (INNER_W - (COLS - 1) * GAP) / COLS` where `INNER_W = 420 - 15*2 = 390`
- Touch input via `window.addEventListener('pointermove')` — drag anywhere on screen moves paddle. `toCanvas(clientX, clientY)` converts screen → canvas coords.
- Phase states: `loading → ready → play → exploding → gutter → chosen`
- Requires HTTP server (fetch won't work on `file://`)
- ESC key returns to `index.html`

---

## Phase 2 — The Facehugger

**Status: DESIGNED** (not yet built)

Three sequential sub-phases. Together they determine the xenomorph's base species (12 possibilities).

### Phase 2A — Location Selection ("Memory Match")

**Game Style:** Memory/Concentration card game with time pressure

**Setup:** 4×3 grid (12 cards), face-down. Cards contain 4 location types × 3 cards each:
- Abandoned Colony
- Company Ship
- Jungle Temple
- Ancient Tomb

**Mechanic:**
1. Player flips one card — 3-second countdown starts
2. Must flip a second card before timer expires or all face-up cards reset
3. Match = both stay revealed; mismatch = both flip back
4. First triplet of matching cards locked in = **hunting location selected**
5. Remaining cards fade away

**Failure:** No permanent failure — timer expiry resets all progress. Tension only.

---

### Phase 2B — Bait Selection ("The Crossing")

**Game Style:** Frogger-style vertical crossing

**Setup:** Vertical auto-scrolling screen, facehugger starts at bottom, 3 vertical lanes.

**Levels:**
1. & 2. Vertical obstacle courses — obstacles fall downward, swipe UP to advance / DOWN to retreat. Hit = reset to level start.
2. Level 3 locks facehugger into one of 3 lanes (random), each containing one bait item at the top:
   - Left lane: **Flare**
   - Center lane: **S.O.S. Beacon**
   - Right lane: **Spilled Food**

**Controls:** Swipe UP / DOWN only. No left/right movement.  
**Failure:** 3 total hits = restart from Level 1 (no permanent game over).

---

### Phase 2C — The Hunt ("The Stalker")

**Game Style:** Reversed Pac-Man / maze chase

**Setup:** Top-down maze based on selected location. Facehugger always moving with momentum (Snake-style). Host starts in opposite corner.

**Facehugger:** Faster than host. Always moving. Swipe to change direction. Auto-latches when touching host.

**Host AI behavior:**
- **Marines/Predators:** Hunt back, fire weapon in line-of-sight
- **Civilians:** Flee, hide, visible panic animations
- **Animals:** Erratic movement, confused behavior

**Bait effects (from Phase 2B):**
- **Flare:** Host distracted in one area for 5 seconds
- **S.O.S. Beacon:** Reveals host position for 8 seconds
- **Spilled Food:** Host moves slower for entire hunt

**Win:** Touch host = implantation animation → Phase 3

**Game Over conditions (true failure):**
- Host shoots facehugger 3 times → "GAME OVER, MAN! GAME OVER!"
- Host reaches escape point → "SPECIMEN ESCAPED"
- Timer (90 seconds) runs out → "EXPLOSIVE DECOMPRESSION"

**Maze layouts by location:**
- Abandoned Colony: L-shaped corridors, medium rooms
- Company Ship: Long straight hallways with side rooms
- Jungle Temple: Large open rooms, wide passages
- Ancient Tomb: Winding tunnels with dead ends

---

## Phase 3 — The Chestburster

**Status: DESIGNED** (not yet built)

### Opening Cutscene ("The Incubation Period")

16-bit pixel art satirical sequence:
1. Host wakes in medical bay — "You're fine! Just a headache."
2. Days pass (calendar pages flip: 1…2…3…)
3. Host does mundane tasks (eating, playing cards, exercising) — "I feel GREAT!"
4. Host doubles over → birth sequence
5. Chest bulge, blood spray, chestburster emerges with "SQUEEE!"
6. Screen: "CONGRATULATIONS! IT'S A BABY!" (with balloons)

### Dual-Meter System

Two meters must **both reach 100% simultaneously** to trigger evolution:
- **Hunger Bar (Red):** Filled by collecting food items in Vent Stalker rounds
- **Life Bar (Green):** Filled by surviving rounds without getting caught

Meters persist between rounds. Both drain over real-time idle (1%/30s Hunger, 1%/60s Life). If either hits 0% → Chestburster dies → **Game Over**.

### The Vent Stalker Minigame (Repeatable)

**Game Style:** Top-down stealth maze

**Each round:**
- 60-second timer
- 3 food items scattered at easy/medium/hard positions
- Colonial Marines patrol with vision cones (flashlights)
- Hide holes scattered throughout (hold UP near entrance to hide)

**One-strike rule:** Getting caught once ends the round immediately. No lives.

**Win conditions per round:**

| Outcome | Hunger | Life |
|---|---|---|
| All 3 foods + survive 60s | +30% | +30% |
| Survive 60s, no food | +0% | +30% |
| 1–2 foods + survive 60s | +10–20% | +30% |
| Caught (0 food) | +0% | -10% |
| Caught (1 food) | +10% | -10% |
| Caught (2 food) | +20% | -10% |

**Minimum rounds to evolve (perfect play):** 4 (each: +30% H, +30% L)

### Evolution Trigger

When both meters hit 100% simultaneously → molting cutscene → adult xenomorph revealed (species from Phase 2, stats from Phase 1 egg choice).

---

## Phase 4 — The Adult

**Status: DESIGNED** (not yet built)

Idle pet screen with tap-triggered minigames. Adult form determined by Phase 2 host choice.

### Buttons

| Button | Purpose | Minigame |
|---|---|---|
| **Feed** | Restore Life Bar | Victim falls from top; time inner-jaw punch |
| **Play** | Raise Ferocity | Randomly: Hunt (Space Invaders), Cocoon (resin management), Fight (Claw/Tail/Headbite RPS) |
| **Observe** | Satirical useless button | Plays Prometheus flute; pet gets "Confused" status; Ferocity drops |

### Game Over Conditions (Phase 4)

- Life Bar hits zero (starvation)
- Too many Play minigame losses in a row
- App neglected 72+ hours → "GAME OVER, MAN!" crater screen
- Predalien-specific: random 1-minute self-destruct timer (must disarm)

---

## Evolution & Lure System

**Phase 1 egg** → stat modifiers  
**Phase 2A location + Phase 2B bait** → base xenomorph species (12 total)  
**Result:** 12 species × 3 egg variants = **36 unique xenomorph combinations**

### Egg Stat Modifiers

| Egg | Ferocity | Life | Speed | Special |
|---|---|---|---|---|
| Crimson | +2 | -1 | — | More damage dealt and taken |
| Obsidian | — | -1 | +2 | Faster movement, shorter attack windows |
| Ivory | -1 | +2 | — | More forgiving health, slower pace |

### Host / Species Table

| Location | Bait | Host | Xenomorph | Reference |
|---|---|---|---|---|
| Abandoned Colony | S.O.S. Beacon | Space Trucker (Kane) | **Drone** | Alien (1979) |
| Abandoned Colony | Flare | Colonial Marine (Hicks) | **Warrior** | Aliens (1986) |
| Abandoned Colony | Spilled Food | Colonist | **Burster** | Alien: Blackout (2019) |
| Company Ship | S.O.S. Beacon | Ship Crew | **Protomorph** | Alien: Covenant (2017) |
| Company Ship | Flare | Stray Cat (Jonesy) | **Lurker** | Aliens: Fireteam Elite (2021) |
| Company Ship | Spilled Food | Prison Dog (Spike) | **Runner** | Alien³ (1992) |
| Jungle Temple | S.O.S. Beacon | Jungle Explorer | **Neomorph** | Alien: Covenant (2017) |
| Jungle Temple | Flare | Yautja (Predator) | **Predalien** | AvP: Requiem (2007) |
| Jungle Temple | Spilled Food | Wild Animal | **Crusher** | Aliens: Colonial Marines (2013) |
| Ancient Tomb | S.O.S. Beacon | Archaeologist | **Praetorian** | AvP (1999 game) |
| Ancient Tomb | Flare | Engineer | **Deacon** | Prometheus (2012) |
| Ancient Tomb | Spilled Food | Human Hybrid | **Newborn** | Alien: Resurrection (1997) |

### Base Stats + Egg Modifiers (F/L/S, scale 1–10)

| Species | Base | Crimson | Obsidian | Ivory |
|---|---|---|---|---|
| Drone | F5/L5/S5 | F7/L4/S5 | F5/L4/S7 | F4/L7/S5 |
| Warrior | F7/L4/S4 | F9/L3/S4 | F7/L3/S6 | F6/L6/S4 |
| Praetorian | F6/L7/S3 | F8/L6/S3 | F6/L6/S5 | F5/L9/S3 |
| Protomorph | F6/L5/S5 | F8/L4/S5 | F6/L4/S7 | F5/L7/S5 |
| Lurker | F4/L3/S8 | F6/L2/S8 | F4/L2/S10 | F3/L5/S8 |
| Runner | F6/L2/S9 | F8/L1/S9 | F6/L1/S11 | F5/L4/S9 |
| Crusher | F7/L8/S2 | F9/L7/S2 | F7/L7/S4 | F6/L10/S2 |
| Predalien | F8/L7/S5 | F10/L6/S5 | F8/L6/S7 | F7/L9/S5 |
| Neomorph | F6/L4/S7 | F8/L3/S7 | F6/L3/S9 | F5/L6/S7 |
| Burster | F5/L3/S6 | F7/L2/S6 | F5/L2/S8 | F4/L5/S6 |
| Deacon | F6/L8/S4 | F8/L7/S4 | F6/L7/S6 | F5/L10/S4 |
| Newborn | F7/L6/S4 | F9/L5/S4 | F7/L5/S6 | F6/L8/S4 |

---

## Save State & Persistence

All state stored in `localStorage`. Keys:

| Key | Written | Value |
|---|---|---|
| `xg_egg` | Phase 1 complete | `"crimson"` / `"obsidian"` / `"ivory"` |
| `xg_location` | Phase 2A complete | Location string (TBD) |
| `xg_bait` | Phase 2B complete | Bait string (TBD) |
| `xg_phase` | Each transition | Phase number (TBD) |
| `xg_hunger` | Phase 3 rounds | 0–100 (TBD) |
| `xg_life` | Phase 3 rounds | 0–100 (TBD) |

**CONTINUE** on the main menu should be unlocked when `xg_phase` exists in localStorage.

---

## UI Screens

### Title Screen (`index.html`) — BUILT

- Press Start 2P font, black background, CSS CRT scanline overlay
- Canvas starfield (120 pixel dots drifting down, `position: fixed` behind everything)
- Layout top-to-bottom:
  1. **Weyland-Yutani pixel logo** — `tools/img/weyland_pixel logo.png`, centered, 200px wide
  2. **PRESENTS** — small gray text, wide letter-spacing
  3. **XENOGOTCHI** — large title (XENO = red `#f33`, GOTCHI = yellow `#ffff00`), no hyphen
  4. **"BIOWEAPONS CAN BE PETS TOO"** — small gray subtitle
  5. Three egg PNGs with floating animation (staggered 0 / 0.4 / 0.8s)
  6. "RAISE IT. FEED IT. FEAR IT." tagline
  7. Blinking "— PRESS START —" prompt → advances to menu

### Main Menu (`index.html`) — BUILT

- START (active) → `phase1.html`
- CONTINUE (disabled — no save state detection yet) → TBD
- OPTIONS → TBD (screen not implemented)
- Arrow key navigation, Enter to select

### Phase 1 Overlay (Egg Chosen) — BUILT

- Shows egg type name + flavor text
- "CONTINUE" button → Phase 2 (currently placeholder back to `index.html`)

---

_"Building better worlds. One xenomorph at a time."_  
— Weyland-Yutani Corporation

---

_Version: 0.2 — Phase 1 complete, Phases 2–4 designed not built_
