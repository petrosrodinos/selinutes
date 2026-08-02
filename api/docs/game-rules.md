# Selinutes — Game Rules (AI Support Agent Knowledge Base)

This document is the authoritative reference for an AI support agent answering player
questions about **Selinutes**, a turn-based tactical board game. It describes the rules
exactly as the game currently behaves. Use it to explain mechanics, resolve "is this a
bug or a rule?" questions, and walk players through figures, terrain, and special systems.

> **Naming note:** Some figures have two names. The agent should recognise both.
>
>
> | Primary name | Alternate name |
> | ------------ | -------------- |
> | Hoplite      | Legionnaire    |
> | Bomber       | Saboteur       |
> | Warlock      | Vezier         |
> | Necromancer  | Druid          |
>

---

## 1. Objective and turn flow

- **Goal:** Capture the opponent's **Monarch**. The moment a player's Monarch is removed
from the board, that player loses.
- **Secondary loss condition:** A player also loses if, at the start of their turn, they
have **no legal moves, attacks, or freezes** available (a stalemate counts as a loss for
the stuck player).
- **First move:** White always moves first. White's figures start at the bottom of the
board and advance upward; Black starts at the top and advances downward.
- **One action per turn:** On a turn a player performs a single action with one figure:
  - **Move** to an empty tile, or
  - **Attack** (ranged or melee) to remove an enemy figure, or
  - **Warlock swap**, **Necromancer freeze**, or **Necromancer revive** (special actions).

---

## 2. Combat basics

Understanding how captures work prevents most "why didn't my attack work?" tickets.

- **Ranged / standing attacks (most figures):** The attacker **stays on its tile** and
removes the targeted enemy from range. The attacker does **not** move onto the enemy's
square. This applies to Hoplite, Ram-Tower, Chariot, Paladin, Warlock, Monarch, Duchess,
and the Necromancer's melee kill.
- **Move-capture (Ram-Tower, Paladin, Duchess, Monarch, Hoplite, Chariot, and Zombies):**
Figures with attack-mode choice — and any revived **Zombie** figure — can capture by
**moving onto** the enemy's square along a clear movement path (unlimited distance for
Ram-Tower, Paladin, and Duchess when the path is clear; adjacent only for Monarch).
- **Line of sight:** Ranged attacks shoot through **friendly figures** but can capture only
the **first enemy** in each attack line. Further enemies behind that target are out of
range. Which obstacles block the shot depends on the figure — see the range-attack matrix
in Section 3.4.
- **Frozen figures cannot move:** A frozen figure cannot move, swap, capture-and-move, or use
special actions until the freeze wears off, but it **can still use its normal ranged attacks**
(see Necromancer freeze).

---

## 3. The board and terrain

### 3.1 Board sizes and obstacle counts


| Board  | Dimensions | Total obstacles | Breakdown                                                        |
| ------ | ---------- | --------------- | ---------------------------------------------------------------- |
| Small  | 12 × 12    | 18              | 2 Cave, 2 Tree, 2 Rock, 4 Lake, 3 River, 3 Canyon, 2 Mystery Box |
| Medium | 12 × 16    | 20              | 2 Cave, 3 Tree, 3 Rock, 4 Lake, 3 River, 3 Canyon, 2 Mystery Box |
| Large  | 12 × 20    | 24              | 2 Cave, 3 Tree, 3 Rock, 5 Lake, 4 River, 4 Canyon, 3 Mystery Box |


Obstacles are placed randomly each game, kept clear of the starting figure rows.

### 3.2 Terrain types

- **Cave** — Acts as a **teleporter**. A figure that enters a cave can emerge from **any
other cave** on the board (it appears on an empty tile next to a destination cave; if no
cave has an empty neighbour, the teleport is unavailable). Only figures that can enter
caves may use them.
- **Tree** — Blocks movement and blocks most ranged shots. See Section 3.4 for which figures
can shoot or freeze over trees on the attack path.
- **Rock** — Solid. No figure can move through or stop on a rock.
- **River** — Passable by some figures. Linear obstacle, can be several tiles wide.
- **Lake** — A clustered body of water. Passable only by a few figures.
- **Canyon** — Linear obstacle. Only the **Paladin** can pass through canyons.
- **Mystery Box** — A special interactive tile. The figure that lands on it triggers a
Mystery Box effect (see Section 7). Any figure can land on a Mystery Box.

### 3.3 Terrain pass-through matrix

"YES" means the figure can move **through** that terrain without stopping. Trees and Rocks block
every figure. **Every figure** can pass over a Mystery Box tile to reach a square beyond it —
passing over does **not** trigger the box (see Section 7). Any figure may **land** on a Mystery
Box tile to trigger its effect.
The Chariot and Bomber can **jump over** intervening figures (and obstacles for those
pieces), but they still cannot **land** on terrain marked "NO".


| Figure                | Cave           | River            | Lake | Canyon | Tree | Rock | Mystery Box |
| --------------------- | -------------- | ---------------- | ---- | ------ | ---- | ---- | ----------- |
| Monarch               | NO             | NO               | NO   | NO     | NO   | NO   | YES         |
| Duchess               | NO             | YES              | NO   | NO     | NO   | NO   | YES         |
| Ram-Tower             | NO             | NO               | NO   | NO     | NO   | NO   | YES         |
| Chariot               | NO             | YES              | NO   | NO     | NO   | NO   | YES         |
| Paladin               | NO             | YES (max 1 wide) | NO   | YES    | NO   | NO   | YES         |
| Bomber (Saboteur)     | YES (teleport) | YES (1 block)    | NO   | NO     | NO   | NO   | YES         |
| Necromancer (Druid)   | YES            | NO               | NO   | NO     | NO   | NO   | YES         |
| Warlock (Vezier)      | YES            | NO               | YES  | NO     | NO   | NO   | YES         |
| Hoplite (Legionnaire) | YES (teleport) | NO               | NO   | NO     | NO   | NO   | YES         |


> **Cave teleport detail:** Only the **Hoplite** and **Bomber** actually teleport between
> caves when they move onto one. Other cave-capable figures (Necromancer, Warlock) can pass over
> or rest on a cave tile but do not teleport.

### 3.4 Range attack line-of-sight matrix

"YES" means a ranged attack (or the Necromancer's stun/freeze) can pass **over** that
obstacle type on the path to the target. This is separate from movement pass-through
(Section 3.3).


| Figure                            | Over Cave | Over River | Over Lake | Over Canyon | Over Tree | Over Rock | Over Mystery Box |
| --------------------------------- | --------- | ---------- | --------- | ----------- | --------- | --------- | ---------------- |
| Duchess                           | YES       | YES        | YES       | YES         | NO        | YES       | YES              |
| Ram-Tower                         | YES       | YES        | YES       | YES         | NO        | YES       | YES              |
| Chariot                           | YES       | YES        | YES       | YES         | YES       | NO        | YES              |
| Paladin                           | YES       | YES        | YES       | YES         | NO        | YES       | YES              |
| Necromancer (Druid) (Stun/Freeze) | YES       | YES        | YES       | YES         | YES       | NO        | YES              |


The Chariot uses this matrix on its gamma attack path. All other listed figures use it on
straight or diagonal attack lines. The Necromancer's melee kill (range 1) does not use
this matrix — only its stun/freeze ability does. Passing over a Mystery Box on an attack
path does **not** trigger it; only **landing** on a Mystery Box tile does.

---

## 4. Starting setup and figure roster

Each player controls two full rows of figures:

- **Back rank** — the line of special figures. On a 12-wide board the order is:
**Ram-Tower, Chariot, Bomber, Paladin, Warlock, Monarch, Duchess, Necromancer, Paladin,
Bomber, Chariot, Ram-Tower.** On wider boards the 12 special figures stay centred and the
ends of the rank are padded with extra Hoplites.
- **Front rank** — a full row of **Hoplites**.

White occupies the bottom two rows; Black occupies the top two rows.

---

## 5. Figure point values

Points represent a figure's value (used for scoring and to gauge what is worth trading).
"Zombie points" apply after a figure is revived as a Zombie (see Section 6.4).


| Figure              | Points | Zombie-mode points |
| ------------------- | ------ | ------------------ |
| Monarch             | 210    | –                  |
| Duchess             | 27     | –                  |
| Ram-Tower           | 20     | 15                 |
| Chariot             | 16     | 13                 |
| Paladin             | 15     | 12                 |
| Bomber (Saboteur)   | 12     | 9                  |
| Necromancer (Druid) | 13     | –                  |
| Warlock (Vezier)    | 11     | –                  |
| Hoplite             | 3      | –                  |


The lowest possible value on the board is a revived Bomber at **9** points.

---

## 6. Figures — movement, attacks, and abilities

### 6.1 Hoplite (Legionnaire) — 3 pts

- **Move:** Straight forward. **3 tiles on its very first move**, then **2 tiles** on every
move after that. It cannot move backward or sideways.
- **Attack (range):** Kills an enemy **one tile diagonally forward** (front-left or
front-right) without moving. Cannot kill the tile straight ahead.
- **Attack (capture and move):** Can **move onto** an enemy on a front diagonal to capture
it. Cannot capture the tile straight ahead unless the Hoplite is a zombie.
- **Promotion:** When a Hoplite reaches the opponent's **back rank** (their first row), it
is promoted to a **Duchess**. Only **3** Hoplites may promote in the **entire game**
(both players combined), for a maximum of **5** Duchesses on the board if none have been
captured (2 starting + 3 promoted).
- **Terrain:** Can pass through caves (teleporting). Cannot pass river, lake, canyon, tree,
or rock.

### 6.2 Ram-Tower — 20 pts (Zombie 15)

- **Move:** Cross / orthogonal (up, down, left, right) any number of tiles, until blocked.
- **Attack (Catapult):** Ranged cross-shaped attack up to **5 tiles** away. Shoots through
friendly figures; only the **first enemy** in each line can be captured. Range attacks pass
over rock, cave, river, lake, and canyon; **trees block the shot** (see Section 3.4).
- **Move-capture:** Unusually, the Ram-Tower can also **move onto an enemy in its path** to
capture it directly. This requires a clear movement path — impassable terrain blocks
move-capture the same way it blocks normal movement (unlike the catapult attack, which can
shoot over some obstacles).
- **Terrain:** Cannot pass any terrain (cave, river, lake, canyon, tree, rock).

### 6.3 Chariot — 16 pts (Zombie 13)

- **Move:** Corner / L-shaped jumps of **2-1, 1-2, 2-2, 3-1, or 1-3** tiles (all rotations).
- **Jumping:** Jumps over any figures or obstacles in its path; only the **landing tile**
matters. It cannot land on cave, lake, canyon, tree, or rock (it can land on river or
empty tiles).
- **Attack:** Gamma-shaped (L) ranged kill **only at gamma range 4** (3+1 or 1+3 — not at
shorter distances). It **shoots over friendly figures**; range attacks pass over tree, cave,
river, lake, and canyon but **rock blocks the shot**; only **enemy figures** block the shot
(see Section 3.4). In capture-and-move mode, only enemies on a **clear** gamma path up to
**gamma range 3** (2+1 or 1+2) can be captured by moving onto them — not at gamma range 4
(3+1 or 1+3). Victims taken by capture-and-move **cannot be revived** (Necromancer Zombie
revival or Mystery Box Hoplite Sacrifice & Revive) until **that specific Chariot** is removed
from the board. Gamma range-4 ranged kills do not bind souls.
- **Terrain:** Can pass/land on river. Cannot land on lake, canyon, or cave.

### 6.4 Bomber (Saboteur) — 12 pts (Zombie 9)

- **Move:** 1 or 2 tiles in cross (orthogonal) or X (diagonal) patterns. Jumps over figures
in its path.
- **Attack:** **None.** The Bomber cannot shoot or capture directly.
- **Explosive net:** After the Bomber moves, it lays a hidden net of explosives on nearby
tiles — the **diagonals 1 and 2 tiles away** and the **orthogonal tiles 2 away**. **Any
enemy figure that moves onto a net tile is destroyed** (the moving figure dies). The net
belongs to the Bomber's owner and never harms its own side. Capturing the Bomber clears
its net.
- **Terrain:** Can pass river and cave (teleporting). Cannot pass lake, canyon, tree, or rock.

### 6.5 Paladin — 15 pts (Zombie 12)

- **Move:** Diagonal, any number of tiles, until blocked.
- **Attack:** Ranged diagonal attack up to **3 tiles**. Shoots through friendly figures;
only the **first enemy** in each diagonal line can be captured. Range attacks pass over
rock, cave, river, lake, and canyon; **trees block the shot** (see Section 3.4).
- **Move-capture:** Can also **move onto an enemy** along a clear diagonal path to capture
it directly (any distance, not limited to the 3-tile ranged attack).
- **Terrain:** Can pass cave, river (max **1 tile wide**), and canyon — the **only** figure that can pass canyon. Cannot pass lake.

### 6.6 Warlock (Vezier) — 11 pts

- **Move:** One tile in any direction (horizontal, vertical, or diagonal).
- **Attack:** Captures **one tile diagonally** (adjacent diagonals).
- **Swap (special action):** The Warlock can rearrange the friendly back line:
  - **Swap with the Monarch** — the Warlock and its own Monarch trade places.
  - **Swap a Hoplite with the Monarch** — the Warlock selects a friendly Hoplite, and that
  Hoplite trades places with the Monarch.
- **Terrain:** Can pass lake and cave. Cannot pass river or canyon.

### 6.7 Monarch — 210 pts

- **Move:** One tile in any direction.
- **Attack:** Removes an adjacent enemy (1 tile, any direction) without moving, or
**move-capture** by stepping onto an adjacent enemy.
- **Terrain:** Cannot pass cave, river, lake, or canyon.
- **Critical:** Losing the Monarch loses the game. Protect it.

### 6.8 Duchess — 27 pts

- **Move:** Any direction, any number of tiles, until blocked.
- **Attack:** Ranged, up to **9 tiles** in any direction. Shoots through friendly figures;
only the **first enemy** in each line can be captured. Range attacks pass over rock, cave,
river, lake, and canyon; **trees block the shot** (see Section 3.4).
- **Move-capture:** Can also **move onto an enemy in its path** to capture it directly.
Requires a clear movement path — impassable terrain and friendly figures block move-capture
the same way they block normal movement (unlike the ranged shot, which can pass friendlies
and some obstacles).
- **Terrain:** Can pass river. Cannot pass lake, canyon, cave, or tree.

### 6.9 Necromancer (Druid) — 13 pts

The Necromancer is a support/control figure with three distinct actions.

- **Move:** One tile in any direction.
- **Melee attack:** Kills an adjacent enemy (1 tile, any direction).
- **Freeze-stun (special action):** Stuns an enemy figure in a **straight line** (orthogonal
or diagonal) up to **8 tiles** away. **Rock blocks the freeze**; tree, cave, river, lake,
and canyon do not (see Section 3.4). Figures do not block the freeze. The maximum freeze
range **drops by 2 for each revival the Necromancer has performed** (8 → 6 → 4 → 2 → 0; at
**0** the Necromancer can no longer freeze). A frozen figure **cannot move** or
capture-and-move, but **can still attack** using its normal range and attack rules. **Freeze
duration = maximum freeze range ÷ 2** (rounded down): at full power (range 8) every freeze
lasts **4 turns** regardless of how far away the target is. Each revival reduces maximum
freeze range by 2, which also lowers duration (6 → 3 turns, 4 → 2, 2 → 1). Adjacent targets
(1 tile) cannot be frozen — use melee kill instead. A figure that is already frozen cannot
be frozen again.
- **Revive (special action):** See Section 6.10.
- **Terrain:** Cannot pass cave, river, lake, or canyon.

### 6.10 Revival and Zombie ("Night") mode

The Necromancer can bring back fallen figures as Zombies.

- **Eligible figures:** Only **Ram-Tower, Chariot, Bomber, and Paladin** can be revived, and
only from the pieces the reviving player has lost. Captures taken by an enemy Chariot
**capture-and-move** cannot be revived until that Chariot is killed.
- **Revival guards (requirement):** Revival is allowed **only while the player's Necromancer,
Monarch, Duchess, and Warlock are all on the board on the same horizontal line (same row).**
If any of the four is missing or on a different row, revival is locked.
- **Placement:** The revived figure appears on its own original starting square if that tile
is empty; otherwise on the nearest empty tile.
- **Zombie attack penalty:** Revived figures attack at **range 1 only**. A revived Bomber
becomes able to attack at range 1 (it gains a melee attack as a Zombie, which it never had
while alive).
- **Necromancer cost:** Each revival permanently **reduces the Necromancer's maximum freeze
range by 2** (8 → 6 → 4 → 2 → 0) and **lowers freeze duration by 1 turn** (4 → 3 → 2 → 1).
After four revivals freeze is disabled entirely.
- **Night mode:** While any Zombie is on the board the game is in "night mode" (a visual
state). It carries no extra rule beyond the presence of Zombies.

---

## 7. Mystery Box

When a figure lands on a Mystery Box tile, the owning player is offered a special effect.
The three possible effects are:

- **Option 1 — Figure Swap:** Pick one of your figures and swap its position with another of
your figures.
- **Option 2 — Hoplite Sacrifice & Revive:** Sacrifice (remove) one of your Hoplites to
revive any one figure the opponent previously captured from you. The revived figure
returns with **full ranged-attack capabilities** (unlike a Necromancer Zombie). It must be
placed on an **empty** tile. This option is only available if you have at least one Hoplite
and at least one captured figure to bring back. Figures bound by an enemy Chariot
capture-and-move cannot be revived until that Chariot is killed.
- **Option 3 — Obstacle Swap:** Roll a die (1–6). You may then relocate up to that many
obstacle **tiles**, each swapped onto an empty tile. **Cave, Tree, and Rock** are moved one
tile at a time (each tile counts toward the roll). **River, Lake, and Canyon** must always be
moved as a **whole connected set** — clicking any tile in the set selects or deselects the
entire set, and the set is placed in one piece with the same shape on empty tiles. If a whole
set has more tiles than your remaining roll allows (e.g. a 3-tile river when you rolled 2),
you cannot select that set. Click a selected obstacle again to deselect it; during placement,
clicking a highlighted source obstacle also deselects it and returns you to obstacle
selection. Obstacles cannot be placed on the 3rd row from either player's starting rank.

---

## 8. Special rules summary

- **Caves:** Entering one cave allows exit from any other cave that has an empty adjacent
tile (Hoplite and Bomber teleport; other cave-capable figures simply pass/rest).
- **Bomber explosions:** A Bomber's explosive net destroys any enemy figure that steps onto
a net tile (diagonals 1-2 away, orthogonals 2 away).
- **Warlock swaps:** Reposition the Monarch with the Warlock or with a friendly Hoplite.
- **Hoplite promotion:** A Hoplite that reaches the opponent's back rank becomes a Duchess
(only 3 promotions allowed in the entire game).
- **Necromancer freeze:** Straight-line stun up to 8 tiles; rock blocks it, but tree, cave,
river, lake, and canyon do not; maximum range and duration both drop with each revival (range
8 / duration 4 at start → 0 after four revivals). Stunned figures cannot move or
capture-and-move but can still use normal ranged attacks.
- **Revival / Zombie mode:** Ram-Tower, Chariot, Bomber, or Paladin can return as Zombies
while the Necromancer, Monarch, Duchess, and Warlock share the same row; Zombies attack at range 1
and are worth fewer points. Chariot capture-and-move binds victims until that Chariot dies.
- **Mystery Box:** Figure Swap, Hoplite Sacrifice & Revive, or Obstacle Swap (individual
Cave/Tree/Rock tiles or whole River/Lake/Canyon sets within the die roll; deselect by
clicking again).

---

## 9. Player levels and figure skins

Your **player level** (1–45) tracks how much you have played and how well you perform. You
earn **SEL points** from completed games; as your total points grow, your level rises. Higher
levels are a badge of experience — and they unlock richer **3D figure skins** on the board.

### How levels are organised

There are **45 levels** in total, split into **five tiers of nine levels each**. Every tier
has its own look for your in-game figures:


| Tier    | Levels | What you unlock                                      |
| ------- | ------ | ---------------------------------------------------- |
| Bronze  | 1–9    | Starter 3D figure skins (Tier 1)                     |
| Silver  | 10–18  | Silver-tier 3D skins (Tier 2)                        |
| Ruby    | 19–27  | Ruby-tier 3D skins (Tier 3)                          |
| Gold    | 28–36  | Gold-tier 3D skins (Tier 4)                          |
| Diamond | 37–45  | Diamond-tier 3D skins (Tier 5 — the highest look) |


Within each tier, individual levels spotlight a different figure on your profile badge (for
example Hoplite at level 1, Necromancer at level 2, and so on through Monarch at level 9 in
Bronze). **Reaching level 10 — the first level of a new tier — is what unlocks the next skin
set for all your pieces in 3D view.**

### In-game behaviour

- **Offline and vs. Bot:** Your figures use the 3D skin for your current tier.
- **Online multiplayer:** Each player sees their **own** tier skins on their side; your
opponent's figures use **their** level. Game rules are identical — only the cosmetics differ.
- **2D board:** Figure art stays the same across tiers; skin upgrades apply to the **3D board**.

You can browse every level, tier, and figure preview from your profile on the home screen.

---

## 10. Game modes

- **Vs. Bot (single player):** The player controls White; the AI controls Black. Bot
difficulty (Easy / Medium / Hard) affects its thinking time and decisions.
- **Local / pass-and-play:** Two players share one device.
- **Online multiplayer:** Two players on separate devices play in real time. Both clients
use identical rules; the same rules in this document apply. Moves are synced over the
network, and each player may only act on their own turn.

---

## 11. Support-agent quick answers (FAQ)

- **"How do I win?"** — Capture the opponent's Monarch. You also win if your opponent has no
legal action on their turn.
- **"Why can't my Hoplite capture the figure directly in front of it?"** — Hoplites only
attack diagonally forward; they move straight but cannot capture straight ahead (unless the
Hoplite is a zombie).
- **"My figure attacked but stayed in place — is that a bug?"** — No. In **range attack**
mode the attacker stays put and removes the target. Switch to **capture and move** (or use
a zombie) to land on the enemy square after killing it.
- **"Why did my figure die just by moving there?"** — It stepped onto an enemy Bomber's
explosive-net tile. Net tiles sit on the diagonals 1-2 away and the orthogonal tiles 2
away from an enemy Bomber.
- **"Why can't my Necromancer revive anyone?"** — Revival requires your Necromancer, Monarch,
Duchess, and Warlock to all be on the same horizontal line, plus an eligible captured figure
(Ram-Tower, Chariot, Bomber, or Paladin).
- **"Why is my Necromancer's freeze weaker now?"** — Each revival it performs reduces its
maximum freeze range by 2 (8 → 6 → 4 → 2 → 0) and shortens freeze duration by 1 turn (4 → 3
→ 2 → 1). After four revivals it cannot freeze at all.
- **"Can ranged figures shoot past my own pieces?"** — Yes. All ranged attacks shoot through
friendly figures but can capture only the **first enemy** in each line. Obstacle blocking
still depends on the figure (e.g. trees block the Duchess).
- **"My figure entered a cave and reappeared elsewhere."** — Caves are teleporters. Hoplites
and Bombers emerge next to another cave on the board.
- **"What is night mode?"** — A visual state that appears while Zombie (revived) figures are
on the board. It changes no rules by itself.
- **"How do player levels and figure skins work?"** — There are 45 levels grouped into five
tiers (Bronze, Silver, Ruby, Gold, Diamond), nine levels per tier. You gain levels by
earning SEL points from games. Each new tier unlocks upgraded 3D figure skins on the board;
in online play everyone uses their own tier. The 2D board is unchanged.
- **"Why do my opponent's figures look different from mine online?"** — 3D skins follow each
player's level and tier. That is cosmetic only; movement and combat rules are the same.

