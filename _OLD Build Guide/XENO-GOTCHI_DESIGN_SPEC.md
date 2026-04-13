# Xeno-Gotchi: A Perfect Organism
## Game Design Specification Document

**Document Type:** Design Overview & Mechanics Specification
**Companion Document:** See `Development_Roadmap.md` for implementation plan

---

## 📋 Table of Contents
1. [Core Concept](#core-concept)
2. [Art Style & Interface](#art-style--interface)
3. [Pet Lifecycle Phases](#pet-lifecycle-phases)
4. [Evolution & Lure System](#evolution--lure-system)
5. [Adult Gameplay Mechanics](#adult-gameplay-mechanics)
6. [Game Over Conditions](#game-over-conditions)
7. [Technical Overview](#technical-overview)

---

## 🎮 Core Concept

**Game Type:** R-rated, satirical-horror digital pet web game

**Inspiration:** 
- Parody of 90s Tamagotchi digital pets
- Heavily inspired by Alien, Predator, and Prometheus film franchises

**Core Objective:**
Players must "care" for a Xenomorph, guiding it from an Egg to its adult form. Player choices in "feeding" (finding hosts) determine its evolution. The ultimate goal is to raise a "perfect organism" and achieve maximum Ferocity.

---

## 🎨 Art Style & Interface

### The Handheld Device

**Shell Design:**
- Virtual handheld device styled as a leathery, ribbed Ovomorph (Xenomorph Egg)
- Fleshy, veinous "nodes" serve as buttons at the bottom
- Egg-shaped border with organic texture

**Visual Style:**
- Gritty, 16-bit pixel art (reminiscent of SNES/Genesis era)
- Dark and detailed aesthetic
- Graphic animations constrained by pixel-art style (for satirical effect)

### Display Modes

**Vibe Toggle Button** (labeled "SIGNAL: 2122"):
- **Color Mode:** Full 16-bit color palette
- **Monochrome Mode:** Classic 90s green-and-black display

---

## 🥚 Pet Lifecycle Phases

### Phase 1: The Egg (Ovomorph) - "Incubation Chamber"

**Game Style:** Breakout/Arkanoid clone (early arcade era)

**Goal:** Break thermal seal blocks to hatch an egg

**Visual Setup:**
- 3 eggs displayed in upper portion of screen
- Each egg surrounded by blocks ("thermal seal")
- Player-controlled paddle at bottom
- Bio-scanner probe (ball) bounces between paddle and blocks

**The 3 Egg Types:**

1. **CRIMSON EGG** (Red/Dark Red tones)
   - Pulsing red veins, aggressive appearance
   - Thermal seal: Tightly packed red blocks

2. **OBSIDIAN EGG** (Black/Dark Gray tones)
   - Smooth, shadowy surface
   - Thermal seal: Dense black blocks in symmetrical pattern

3. **IVORY EGG** (Pale/Cream/White tones)
   - Ancient, biomechanical appearance
   - Thermal seal: Pale blocks, more spread out

**Controls:**
- Button 1 (Left): Move paddle left
- Button 2 (Right): Move paddle right
- Alternative control scheme: Single button alternates paddle direction (classic handheld style)

**Gameplay Mechanics:**
1. Ball launches from paddle automatically
2. Ball bounces off paddle, walls, blocks, and eggs
3. Each block broken releases "warmth particles" that fall to corresponding egg
4. **Ball can hit eggs directly** - this also builds warmth/progress
5. Blocks may have different durability based on egg type
6. Cracks appear on eggs as they are hit and surrounding blocks are destroyed

**Win Condition:**
- **Break all thermal seal blocks AND hit the egg directly to hatch it into a Facehugger**
- First egg to complete both conditions (blocks destroyed + direct egg hit) wins
- Once one egg hatches, other two fade away (paths locked out)
- Player can strategically aim for specific egg by focusing ball on that area

**Failure Condition:**
- Missing the ball 3 times causes minor setback (some blocks partially regenerate)
- No permanent failure - just extends play time

**Strategic Element:**
- Players choose their evolutionary path by targeting specific eggs
- Creates replayability with 3 distinct starting branches
- Visual feedback shows progress (cracking blocks, glowing eggs)

---

### Phase 2: The Facehugger

**Goal:** Select hunting location, then find and implant a host

#### Mechanic 1: Location Selection - "Memory Match"

**Game Style:** Memory/Concentration card game with time pressure

**Visual Setup:**
- 4x3 grid (12 cards total) displayed face-down
- Cards contain 4 location types (3 of each):
  - 3x Abandoned Colony
  - 3x Company Ship
  - 3x Jungle Temple
  - 3x Ancient Tomb

**Controls:**
- D-pad/buttons to navigate cursor between cards
- Action button to flip selected card

**Gameplay Mechanics:**
1. Player selects and flips one card (reveals location icon)
2. **3-second countdown timer starts**
3. Player must select another card within 3 seconds
   - **If timer expires:** All face-up cards flip back face-down, restart
4. When second card is flipped:
   - **If cards match:** Both cards stay face-up
   - **If cards don't match:** Both flip back face-down after brief delay
5. Timer resets after each successful flip
6. Continue until 3 matching cards are revealed

**Win Condition:**
- Match all 3 cards of one location type = Location locked in
- **First triplet completed determines hunting location**
- Remaining cards fade away

**Failure/Pressure:**
- No permanent failure, but time pressure adds tension
- Missing the 3-second window resets all progress (all cards flip back)

**Strategic Element:**
- Tests memory and quick decision-making
- Forces players to remember card positions under time pressure
- Location choice affects available hosts in next phase

---

#### Mechanic 2: Bait Selection - "The Crossing"

**Game Style:** Frogger-style vertical crossing (early 80s arcade) - Mobile optimized

**Goal:** Navigate upward across 3 levels to reach and select a bait item

**Visual Setup:**
- Vertical auto-scrolling lanes (like Temple Run/Crossy Road)
- Facehugger starts at bottom of screen
- 3 vertical lanes (left, center, right)
- Obstacles move downward toward you
- 3 bait options displayed at the top of final level

**The 3 Levels:**

**Level 1 & 2: Vertical Obstacle Courses**
- Auto-scroll upward through hazards
- Obstacles fall/move downward in the 3 lanes
- Examples: debris, patrol bots, security sweeps, falling crates
- **Mobile Controls:** Swipe UP to jump forward, Swipe DOWN to drop back
- Getting hit sends Facehugger back to start of current level
- No left/right movement - only forward/back in your lane
- Pure timing-based gameplay

**Level 3: Bait Selection**
- Final level shows 3 bait items at top (one per lane):
  - **Flare** (left lane)
  - **S.O.S. Beacon** (center lane)
  - **Spilled Food** (right lane)
- At start of Level 3, facehugger locks into one of 3 lanes (random)
- Navigate through final obstacles in that lane
- Reaching top = that lane's bait is selected and locked in

**Mobile Touch Controls:**
- **Swipe UP:** Jump forward one space (dodge obstacles)
- **Swipe DOWN:** Drop back one space (avoid hazard)
- **No left/right movement** - streamlined for mobile

**Gameplay Mechanics:**
1. Screen auto-scrolls upward slowly
2. Obstacles appear ahead and move toward you
3. Swipe up to advance, down to retreat
4. Time your movements to avoid hazards
5. Reach the top to claim bait item

**Win Condition:**
- Successfully navigate all 3 levels
- Reach bait item at top of your lane
- Bait selection locked in based on which lane you were assigned

**Failure Condition:**
- Hit by obstacle = reset to start of current level (not full restart)
- 3 hits total = restart from Level 1
- No permanent game over, just extends play time

**Strategic Element:**
- Player must master timing under pressure
- Can't change lanes, must work with what you're given
- Creates replayability (different lane each time)
- Different baits affect host behavior in Hunt phase

**Visual Polish:**
- Obstacles telegraph before appearing (shadow/warning)
- Speed increases slightly in Level 2 and 3
- Screen shake when hit
- Facehugger does "scuttle" animation when moving

---

#### Mechanic 3: Hunt Minigame - "The Stalker"

**Game Style:** Reversed Pac-Man / maze chase (early 80s arcade) - Mobile optimized

**Goal:** Corner and capture the host before time runs out

**Visual Setup:**
- Top-down maze view based on selected location
- **Larger maze cells** for mobile visibility
- Facehugger (player) starts in one corner
- Host starts in opposite corner
- Simplified maze: wider corridors, fewer but larger rooms
- Camera centered on facehugger

**The Hunt Mechanics:**

**Facehugger (You):**
- **Always moving with momentum** (like Snake game)
- Faster than host
- Can hear host's footsteps (visual proximity indicator + screen vibration)
- Must get close to host to auto-latch
- **No stop button** - constantly in motion

**Host (AI):**
- Moves through maze trying to survive
- Fires weapon at you when in line of sight (shoots down corridor)
- Panics and moves faster when you get close
- Tries to reach "escape point" (glowing exit)
- **Satirical Death Animations if you get shot:**
  - Green pixel acid blood sprays in comedic fountain
  - Facehugger screams (visual "!!!" bubble)
  - Dissolves through floor leaving smoking hole
- Different hosts have different behaviors based on type:
  - **Marines/Predators:** Aggressive, hunt you back, yell "GET SOME!" (pixelated text bubble)
  - **Civilians:** Flee, hide in corners, cry visible tears, wet themselves (puddle sprite)
  - **Animals:** Erratic movement patterns, confused "?" bubbles, attack walls

**Bait Effects (from Phase 2B):**
- **Flare:** Host is distracted in one area for 5 seconds at start
- **S.O.S. Beacon:** Reveals host location on maze for 8 seconds
- **Spilled Food:** Host moves slower for entire hunt

**Mobile Touch Controls:**
- **Swipe UP:** Change direction to move up
- **Swipe DOWN:** Change direction to move down
- **Swipe LEFT:** Change direction to move left
- **Swipe RIGHT:** Change direction to move right
- **Always in motion** - swipes change direction, not position
- **Auto-latch** when you touch host (no button needed)

**Gameplay Mechanics:**
1. Facehugger constantly moves forward in current direction
2. Swipe to change direction (like Snake/Pac-Man)
3. Bounce off walls (or turn around)
4. Chase host through simplified maze
5. Get close enough = auto-latch and win

**Maze Design (Mobile-Friendly):**
- **Wider corridors** (3x normal Pac-Man width)
- **Larger rooms** for maneuverability
- **Fewer intersections** (less overwhelming)
- **Clear sight lines** so you can see host
- **No tight corners** that require precision

**Win Condition:**
- Successfully touch/latch onto host
- **Graphic 16-bit "Hug" Animation:**
  - Facehugger jumps at host's face
  - Pixelated struggle animation
  - Host falls over, facehugger wrapped tight
  - Ovipositor tube extends (visible through pixel art)
  - Screen displays: "IMPLANTATION SUCCESSFUL ♥"
  - Host lies unconscious with rhythmic chest breathing
- Advance to Phase 3

**Failure Conditions:**
- **Host shoots you 3 times** = Facehugger killed
  - Pixelated acid blood spray
  - Facehugger twitches and dies
  - Screen: "GAME OVER, MAN! GAME OVER!"
  - Show host escaping while your corpse dissolves the floor

- **Host reaches escape point** = Hunt failed
  - Host boards escape pod
  - Facehugger watches from window (comedically sad)
  - Screen: "SPECIMEN ESCAPED"
  - Weyland-Yutani logo with "PERFORMANCE REVIEW PENDING"

- **Timer runs out (90 seconds)** = Host escapes
  - Airlock opens, you get sucked into space
  - Spinning facehugger animation
  - Screen: "EXPLOSIVE DECOMPRESSION"

**Strategic Elements:**
- Plan your path ahead (momentum-based movement)
- Cut off host's escape routes
- Use wider corridors to approach safely
- Avoid line-of-sight when host has weapon
- Bait choice affects difficulty significantly

**Maze Variations by Location:**
- **Abandoned Colony:** L-shaped corridors, medium rooms
- **Company Ship:** Long straight hallways with side rooms
- **Jungle Temple:** Large open rooms connected by wide passages
- **Ancient Tomb:** Winding tunnels with dead ends (larger than Pac-Man)

**Visual Polish:**
- Proximity indicator shows host direction (pulsing arrow)
- Screen vibrates when host fires weapon
- Motion tracker "PING" sound when close
- Trail behind facehugger shows your path

---

### Phase 3: The Chestburster (Infant)

**Goal:** Survive in the vents, collect food, evade marines, and grow to adulthood

**New Features:** Repeatable stealth minigame with dual-meter progression system

---

#### Opening Animation: "The Incubation Period"

**Satirical Cutscene (16-bit pixel art):**
1. Host wakes up in medical bay, sits up
2. Doctor examines them: "You're fine! Just a headache."
3. Host walks around doing mundane tasks:
   - Eating lunch (food sprites)
   - Playing cards with crew
   - Exercising (comically cheerful)
   - Text bubble: "I feel GREAT!"
4. Calendar pages flip by (day counter: 1...2...3...)
5. Host occasionally clutches chest, shrugs it off
6. **Sudden stop** - Host doubles over
7. **BIRTH SEQUENCE:**
   - Chest bulges outward (pixel distortion)
   - Host screams (!!!! bubble)
   - Blood spray (pixelated fountain)
   - Tiny chestburster emerges with "SQUEEE!" sound effect
   - Host collapses (X_X eyes)
   - Chestburster does happy wiggle dance
   - Screen: "CONGRATULATIONS! IT'S A BABY!" with balloons 🎈

**Now the real game begins...**

---

#### Phase 3 Overview: Dual-Meter Progression

**Two Meters to Fill:**
- **Hunger Bar (Red):** Fills when you successfully feed (collect food items)
- **Life Bar (Green):** Fills when you survive without getting caught

**Progression System:**
- Play "Vent Stalker" minigame repeatedly
- Each successful round fills meters based on performance
- **Both meters must reach 100%** to trigger evolution to adult
- Meters persist between rounds (progress carries over)

**Between Rounds:**
- Return to idle screen showing chestburster in vent
- See both meter levels
- Click "Feed" button to play another round
- Meters slowly drain over time (creates urgency)

---

#### The Survival Minigame: "Vent Stalker"

**Game Style:** Stealth maze navigation with hiding mechanics (repeatable)

**Two Ways to Win Each Round:**
1. **Collect all 3 food items** (best outcome - maximizes both meters)
2. **Survive for 60 seconds** (safe outcome - smaller meter gains)

**Visual Setup:**
- Top-down view of vent network maze
- Cross-section style showing ducts, tunnels, and rooms
- You (tiny chestburster) start at central nest
- 3 food items scattered throughout maze (glowing markers)
- Colonial Marines patrol the vent system
- Hide holes scattered throughout map (safe spots)
- **60-second timer** displayed at top of screen
- **Food counter** displayed: "FOOD: 0/3"
- Phase 3 meters (Hunger & Life) are NOT shown during minigame (only on idle screen)

**One Strike System:**
- **Getting caught ONCE = round immediately ends**
- No lives, no second chances
- Instant return to idle screen
- Phase 3 Life Bar decreases by 10%

**The Food Items (3 scattered in maze):**
1. **Food Scrap #1** - Easy location (near start)
2. **Food Scrap #2** - Medium difficulty (mid-maze)
3. **Food Scrap #3** - Hard location (far from start, heavy patrol)

**Colonial Marines (Patrol AI):**
- Walk set patrol routes through vent system
- Carry flashlights (cone of vision shown)
- **If they see you:** Chase for 3 seconds
  - **Caught = ROUND OVER immediately**
  - Marines yell: "GOT IT!"
  - Screen fades to black
  - Return to idle screen
  - Phase 3 Life Bar -10%
  - Any food collected that round is still counted
- **They cannot see into hide holes**
- 3-4 Marines patrolling at once (depending on difficulty)

**Hide Holes (Safe Spots):**
- Scattered throughout vent maze (glowing alcoves)
- Can hold position inside hide hole
- Marines cannot see you when hidden
- **Hiding Mechanic:** Hold UP on hide hole entrance to enter/hide
- Can peek out to see marine positions
- Exit by releasing or moving in any direction

**Mobile Touch Controls:**
- **Hold LEFT side of screen:** Move left continuously
- **Hold RIGHT side of screen:** Move right continuously
- **Hold TOP of screen:** Move up continuously
- **Hold BOTTOM of screen:** Move down continuously
- **Hold UP near hide hole:** Enter and hide (stay still)
- **Release:** Stop moving / exit hide hole

**Gameplay Mechanics:**

1. **Navigation:**
   - Touch and hold direction to move chestburster
   - Larger vent corridors for mobile (easier navigation)
   - Top-down view, camera follows you
   - Simplified maze layout (not too complex)

2. **Stealth:**
   - Marines have vision cones (red flashlight beams)
   - If you enter their vision = spotted and chased
   - Use hide holes to avoid patrols
   - Time your movements between patrol routes

3. **Food Collection:**
   - Touch food item to collect it automatically
   - Screen flash + "NOM!" animation
   - Food counter updates: "FOOD: 1/3" → "2/3" → "3/3"
   - Can collect in any order
   - Collected food glows/disappears from maze

4. **Timer:**
   - 60 seconds to complete round
   - Timer ticks down at top of screen
   - Flashes RED at 15 seconds remaining
   - Reaching 60 seconds = Win Condition #2 (survive)

---

#### Round Win Conditions & Meter Rewards

**Win Condition #1: Collect All 3 Food Items + Survive 60 Seconds**
- Best outcome - maximum meter gains
- **Hunger Bar:** +30% (3 food items × 10% each)
- **Life Bar:** +30% (survived without getting caught)
- Screen: "FEEDING FRENZY - EXCELLENT!"
- Total: +60% meter progress per perfect round

**Win Condition #2: Survive 60 Seconds (No Food)**
- Safe outcome - Life only
- **Hunger Bar:** +0% (no food collected)
- **Life Bar:** +30% (survived without getting caught)
- Screen: "SURVIVED - WELL DONE!"
- Total: +30% meter progress per safe round

**Partial Success: 1-2 Food Items + Survive 60 Seconds**
- Mixed outcome
- **Hunger Bar:** +10% per food item collected (max +20%)
- **Life Bar:** +30% (survived without getting caught)
- Screen: "FEEDING COMPLETE"
- Total: +40-50% meter progress

**Round Failure: Getting Caught**
- **Round ends immediately** when caught by Marine
- **Hunger Bar:** +10% per food already collected (kept)
- **Life Bar:** -10% (penalty for getting caught)
- **Net result:** Usually negative to neutral progress
- Screen: "CAUGHT - TRY AGAIN"
- Examples:
  - Caught with 0 food: +0% Hunger, -10% Life = **-10% total**
  - Caught with 1 food: +10% Hunger, -10% Life = **0% total**
  - Caught with 2 food: +20% Hunger, -10% Life = **+10% total**
  - Caught with 3 food: +30% Hunger, -10% Life = **+20% total**
- Return to idle screen immediately

---

#### Between Rounds - Idle Screen

**Visual:**
- Chestburster hiding in vent (animated breathing)
- Both meters displayed prominently:
  - **Hunger Bar (Red):** Shows current % (0-100%)
  - **Life Bar (Green):** Shows current % (0-100%)
- "Feed" button glows when ready to play again
- Meters slowly drain over real-time (1% every 30 seconds)

**Meter Drain (Idle Penalty):**
- Creates urgency to keep playing
- **Hunger Bar:** Drains 1% every 30 seconds
- **Life Bar:** Drains 1% every 60 seconds
- If either meter hits 0% = Chestburster dies, Game Over

**Random Events While Idle:**
- Marines walk past vent (atmospheric)
- P.A. announcements: "SEARCHING SECTOR 7"
- Motion tracker pings
- Dripping water, sparks

---

#### Strategic Elements

**Round Strategy:**
- **Aggressive Play:** Go for all 3 food items + survive = +60% total meters (2 rounds minimum if perfect)
- **Safe Play:** Just survive 60 seconds = +30% Life only (need to fill Hunger separately)
- **Mixed Play:** Grab 1-2 foods + survive = +40-50% total meters (balanced approach)
- **Getting caught:** Round ends immediately, -10% Life (brutal punishment!)

**Route Planning:**
- Study marine patrol patterns before moving
- Plan food collection order (easy → medium → hard OR reverse)
- Identify hide holes along your route

**Hide Hole Usage:**
- Duck in when marine approaches
- Use as waypoints between food items
- Peek out to time your movements

**Risk vs. Reward:**
- Rush for all 3 foods = faster evolution but ONE mistake ends the round
- Play safe and survive = slower but guaranteed +30% Life progress
- Getting caught = instant round over, -10% Life penalty
- **Key insight:** Getting caught is VERY punishing - stealth is critical!
- Collect food before taking risks (food collected is kept even if caught)

**Meter Management:**
- **Both meters must reach 100%** to evolve
- Track which meter is lower and adjust strategy
- Low Hunger? Go aggressive for food
- Low Life? Play safe and just survive
- Meters drain while idle = keep playing regularly

**Satirical Elements:**
- Marines argue with each other: "Did you check that vent?" / "I thought YOU did!"
- Motion tracker "PING" sounds when they're close
- One marine gets scared: "What was that?!"
- If caught: Marine yells "THERE IT IS!" then shoots
- Comedic respawn: Chestburster pops back up at last hide hole, dizzy stars circling head
- Screen messages: "WEYLAND-YUTANI REMINDS: REPORT ALL INFESTATIONS"

**Visual Polish:**
- Vent walls have grime, pipes, atmospheric lighting
- Chestburster scuttles when moving (animated sprite)
- Marines have cone of vision (red gradient)
- Hide holes glow softly (green = safe, yellow = occupied)
- Food items pulse/glow to stand out
- Screen vibrates when marine is very close

---

---

#### Evolution Trigger

**Final Win Condition:**
- **Hunger Bar reaches 100%** (feed successfully across multiple rounds)
- **Life Bar reaches 100%** (survive successfully across multiple rounds)
- **Both must be full simultaneously**

**How Many Rounds to Evolve:**

**Perfect Play (never caught):**
- Collect all 3 foods + survive each round: +30% Hunger, +30% Life per round
- Round 1: 30% H, 30% L
- Round 2: 60% H, 60% L
- Round 3: 90% H, 90% L
- Round 4: 120% H, 120% L ✅ **EVOLUTION!**
- **Minimum: 4 perfect rounds**

**Realistic Play (caught occasionally):**
- Example Round 1: 3 foods, survive = +30% H, +30% L (60% H, 30% L total)
- Example Round 2: 2 foods, caught = +20% H, -10% L (80% H, 20% L total)
- Example Round 3: 1 food, survive = +10% H, +30% L (90% H, 50% L total)
- Example Round 4: 1 food, survive = +10% H, +30% L (100% H, 80% L total)
- Example Round 5: 0 food, survive = +0% H, +30% L (100% H, 110% L total) ✅ **EVOLUTION!**
- **Minimum: 5-7 rounds** with mistakes

**Safe Play (just survive, no food):**
- +30% Life only per round
- Need 4 rounds to fill Life (4 × 30% = 120%)
- Still need to fill Hunger separately (10 total foods = 100%)
- **Minimum: 7-10 rounds** (very slow, need ~4 successful food rounds)

**Bad Play (caught often):**
- Getting caught frequently tanks Life Bar
- If Life hits 0% = Chestburster dies, GAME OVER
- Could take 10+ rounds or never evolve

**When Both Meters Hit 100%:**
- Automatic evolution trigger (no button press needed)
- Cannot play another round once ready
- Evolution cutscene plays immediately

**Molting Cutscene:**
1. Screen flashes: "EVOLUTION READY"
2. Chestburster finds secluded corner of vent (nest area)
3. Curls into ball, sheds skin (pixel animation with pulsing)
4. Time-lapse: Size increases frame by frame
5. Skin splits open, larger form emerges
6. Reveals **ADULT XENOMORPH** (species from Phase 2, stats from egg choice)
7. Does signature "hiss" animation with inner jaw extension
8. Screen: "FINAL FORM ACHIEVED"
9. Display species name and stat breakdown:
   - Example: "PREDALIEN (Crimson Egg) - F10, L6, S5"
10. Transition to Phase 4

---

### Phase 4: The Adult

**Goal:** Raise Ferocity meter and survive

**Features:**
- Adult form determined by Phase 2 host choice
- Unique stats and animations per variant
- Special animations (e.g., "tail wag" after successful kill)

---

## 🧬 Evolution & Lure System

### How Evolution Works

**Phase 1 (Egg Choice)** → Determines stat modifiers
**Phase 2 (Location + Bait)** → Determines base xenomorph species (12 total)
**Result:** 12 xenomorph species × 3 egg stat variants = 36 unique combinations

---

### Egg Stat Modifiers

Each egg type applies different stat modifiers to the base xenomorph:

**CRIMSON EGG (Aggressive Build)**
- **Ferocity:** +2
- **Life:** -1
- **Speed:** Standard
- **Special Trait:** Minigames deal more damage, but take more damage when hit

**OBSIDIAN EGG (Stealth Build)**
- **Ferocity:** Standard
- **Life:** -1
- **Speed:** +2
- **Special Trait:** Faster movement in minigames, shorter attack windows

**IVORY EGG (Tank Build)**
- **Ferocity:** -1
- **Life:** +2
- **Speed:** Standard
- **Special Trait:** More forgiving health/damage, slower minigame pace

---

### Host & Evolution Table (12 Base Species)

| Location             | Bait          | Host                    | Xenomorph Type     | Film/Game Reference             |
|----------------------|---------------|-------------------------|--------------------|---------------------------------|
| **Abandoned Colony** | S.O.S. Beacon | Space Trucker (Kane)    | **Drone**          | Alien (1979)                    |
| **Abandoned Colony** | Flare         | Colonial Marine (Hicks) | **Warrior**        | Aliens (1986)                   |
| **Abandoned Colony** | Spilled Food  | Colonist                | **Burster**        | Alien: Blackout (2019)          |
| **Company Ship**     | S.O.S. Beacon | Ship Crew               | **Protomorph**     | Alien: Covenant (2017)          |
| **Company Ship**     | Flare         | Stray Cat (Jonesy)      | **Lurker**         | Aliens: Fireteam Elite (2021)   |
| **Company Ship**     | Spilled Food  | Prison Dog (Spike)      | **Runner**         | Alien³ (1992)                   |
| **Jungle Temple**    | S.O.S. Beacon | Jungle Explorer         | **Neomorph**       | Alien: Covenant (2017)          |
| **Jungle Temple**    | Flare         | Yautja (Predator)       | **Predalien**      | AvP: Requiem (2007)             |
| **Jungle Temple**    | Spilled Food  | Wild Animal             | **Crusher**        | Aliens: Colonial Marines (2013) |
| **Ancient Tomb**     | S.O.S. Beacon | Archaeologist           | **Praetorian**     | Aliens vs. Predator (1999 game) |
| **Ancient Tomb**     | Flare         | Engineer                | **Deacon**         | Prometheus (2012)               |
| **Ancient Tomb**     | Spilled Food  | Human Hybrid            | **Newborn**        | Alien: Resurrection (1997)      |

### Xenomorph Stats with Egg Modifiers

| Xenomorph Type  | Base Stats                 | Egg Modifiers Applied                                   |
|-----------------|----------------------------|---------------------------------------------------------|
| **Drone**       | Balanced: F5, L5, S5       | Crimson: F7/L4/S5, Obsidian: F5/L4/S7, Ivory: F4/L7/S5  |
| **Warrior**     | High Ferocity: F7, L4, S4  | Crimson: F9/L3/S4, Obsidian: F7/L3/S6, Ivory: F6/L6/S4  |
| **Praetorian**  | Guardian: F6, L7, S3       | Crimson: F8/L6/S3, Obsidian: F6/L6/S5, Ivory: F5/L9/S3  |
| **Protomorph**  | Evolved: F6, L5, S5        | Crimson: F8/L4/S5, Obsidian: F6/L4/S7, Ivory: F5/L7/S5  |
| **Lurker**      | Speed focus: F4, L3, S8    | Crimson: F6/L2/S8, Obsidian: F4/L2/S10, Ivory: F3/L5/S8 |
| **Runner**      | Glass cannon: F6, L2, S9   | Crimson: F8/L1/S9, Obsidian: F6/L1/S11, Ivory: F5/L4/S9 |
| **Crusher**     | Heavy: F7, L8, S2          | Crimson: F9/L7/S2, Obsidian: F7/L7/S4, Ivory: F6/L10/S2 |
| **Predalien**   | Elite: F8, L7, S5          | Crimson: F10/L6/S5, Obsidian: F8/L6/S7, Ivory: F7/L9/S5 |
| **Neomorph**    | Feral: F6, L4, S7          | Crimson: F8/L3/S7, Obsidian: F6/L3/S9, Ivory: F5/L6/S7  |
| **Burster**     | Explosive: F5, L3, S6      | Crimson: F7/L2/S6, Obsidian: F5/L2/S8, Ivory: F4/L5/S6  |
| **Deacon**      | Biomechanical: F6, L8, S4  | Crimson: F8/L7/S4, Obsidian: F6/L7/S6, Ivory: F5/L10/S4 |
| **Newborn**     | Hybrid: F7, L6, S4         | Crimson: F9/L5/S4, Obsidian: F7/L5/S6, Ivory: F6/L8/S4  |

**Note:** F = Ferocity, L = Life, S = Speed (scale of 1-10)

---

## 🎯 Adult Gameplay Mechanics

### Button Functions

#### 1. "Feed" Button
**Purpose:** Restore Life Bar

**Minigame:**
- Victim falls from top of screen
- Player times button press for inner-jaw "punch"
- Success = health restored

---

#### 2. "Play" Button
**Purpose:** Raise Ferocity meter

**Minigames (Randomly Selected):**

**a) Hunt:**
- Top-down Space Invaders style
- Dodge bullets from Marines/Predators
- Survive to increase Ferocity

**b) Cocoon:**
- Resource management game
- Tap to "secrete resin" over victims
- Must cocoon them before they escape
- Success = Ferocity increase

**c) Fight:**
- Rock-Paper-Scissors variant
- Claw-Tail-Headbite system
- Battle rival creatures (Predators, other Xenos)
- Win = Ferocity increase

---

#### 3. "Observe" Button (Satirical Mechanic)
**Purpose:** Useless "Weyland-Yutani compliance" button

**Mechanic:**
- Plays Prometheus flute melody
- "?" appears over Xenomorph's head
- Pet gains "Confused" status
- Ferocity temporarily drops

**The Satire:** Serves no purpose except to annoy your pet (corporate bureaucracy joke)

---

## 💀 Game Over Conditions

### Ways to Lose

1. **Starvation**
   - Life Bar hits zero
   - Pet dies

2. **Defeat**
   - Lose too many "Play" minigames in a row
   - Pet weakens and dies

3. **The Nuke**
   - Game neglected (web app closed) for 72+ hours
   - Return screen shows 16-bit "Game Over, Man!" over a crater

4. **Self-Destruct** (Predalien-specific)
   - Random 1-minute self-destruct timer activates
   - Must complete "disarm" minigame
   - Failure = explosion

5. **Host Hunt Failure**
   - Facehugger killed during Phase 2 hunt
   - Immediate Game Over

---

## 💻 Technical Overview

### Platform & Technology Stack

**Target Platform:** Mobile Web (HTML5)
- Primary: Touchscreen smartphones (iOS/Android)
- Secondary: Desktop browsers (with touch/mouse support)

**Core Technologies:**
- HTML5 Canvas for rendering
- JavaScript ES6+ for game logic
- CSS3 for UI/shell styling
- LocalStorage for save persistence

**Key Technical Requirements:**
- 16-bit pixel art rendering
- Touch-optimized controls (swipe, hold, tap)
- State machine for phase management
- Responsive design for various screen sizes
- Offline play capability

### Mobile Control Schemes Summary

**Phase 1 (Breakout):** Swipe/tap left-right or tilt device
**Phase 2A (Memory):** Direct tap on cards
**Phase 2B (Frogger):** Swipe up/down only (vertical movement)
**Phase 2C (Pac-Man):** Swipe directional changes (momentum-based)
**Phase 3 (Vent Stalker):** Hold screen sides to move, hold top to hide
**Phase 4 (Adult):** TBD

---

## 📝 Design Notes

### Design Philosophy
- **Satirical Horror:** Balance dark themes with absurd humor
- **Retro Aesthetic:** Commit fully to 16-bit pixel art limitations (SNES/Genesis era)
- **Player Agency:** Choices in Phase 2 meaningfully affect gameplay evolution
- **Subversive Mechanics:** "Observe" button satirizes corporate pet care games
- **Mobile-First:** All mechanics designed for touchscreen play

### Accessibility Considerations
- Large touch targets (no precision required)
- Clear visual feedback (screen shake, flash, vibration)
- Forgiving timing windows
- Optional color/monochrome mode for visibility

### Tone Balance
- R-rated horror with over-the-top comedy
- Graphic violence constrained by pixel art style
- Corporate satire (Weyland-Yutani bureaucracy)
- Film franchise fan service

### Future Enhancement Ideas
- Achievement system
- Speedrun mode
- Alternate endings based on xenomorph type
- Easter eggs referencing deep Alien lore
- Multiplayer (raise xenos together?)
- Photo mode (share your perfect organism)

---

**"Building better worlds. One Xenomorph at a time."**  
— Weyland-Yutani Corporation

---

*Document Version: 1.0*  
*Last Updated: November 2025*
