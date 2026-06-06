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
- **Move-capture (Ram-Tower and Zombies only):** The **Ram-Tower** — and any revived
**Zombie** figure — captures by **moving onto** the enemy's square along its normal path.
- **Line of sight:** Ranged attacks need a clear path. Enemy figures, friendly figures, and
most obstacles block the shot. Exceptions are noted per figure (e.g. Chariot shoots over
trees, Duchess shoots through friendly figures).
- **Frozen figures cannot act:** A frozen figure can neither move nor attack until the
freeze wears off (see Necromancer freeze).

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
- **Tree** — Blocks movement and blocks most shots. Notable exceptions: the **Chariot can
shoot over all obstacles and friendly figures** on its gamma path, and the
**Necromancer's freeze is blocked only by trees**.
- **Rock** — Solid. No figure can move through or stop on a rock.
- **River** — Passable by some figures. Linear obstacle, can be several tiles wide.
- **Lake** — A clustered body of water. Passable only by a few figures.
- **Canyon** — Linear obstacle. Passable by some figures.
- **Mystery Box** — A special interactive tile. The figure that lands on it triggers a
Mystery Box effect (see Section 7). Any figure can land on a Mystery Box.

### 3.3 Terrain pass-through matrix

"YES" means the figure can move through and/or stop on that terrain. Trees and Rocks block
every figure. The Chariot, Bomber, and Warlock can **jump over** intervening figures (and
the Chariot/Bomber over obstacles), but they still cannot **land** on terrain marked "NO".


| Figure                | Cave           | River            | Lake | Canyon | Tree | Rock |
| --------------------- | -------------- | ---------------- | ---- | ------ | ---- | ---- |
| Hoplite (Legionnaire) | YES (teleport) | NO               | NO   | NO     | NO   | NO   |
| Ram-Tower             | NO             | NO               | NO   | NO     | NO   | NO   |
| Chariot               | NO             | YES              | NO   | NO     | NO   | NO   |
| Bomber (Saboteur)     | YES (teleport) | YES              | NO   | YES    | NO   | NO   |
| Paladin               | YES            | YES (max 1 wide) | NO   | YES    | NO   | NO   |
| Warlock (Vezier)      | YES            | NO               | YES  | NO     | NO   | NO   |
| Monarch               | YES            | NO               | NO   | NO     | NO   | NO   |
| Duchess               | NO             | YES              | NO   | NO     | NO   | NO   |
| Necromancer (Druid)   | YES            | NO               | YES  | NO     | NO   | NO   |


> **Cave teleport detail:** Only the **Hoplite** and **Bomber** actually teleport between
> caves when they move onto one. Other cave-capable figures (Paladin, Warlock, Monarch,
> Necromancer) can pass over or rest on a cave tile but do not teleport.

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
| Ram-Tower           | 20     | –                  |
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
- **Attack:** Captures **one tile diagonally forward** (front-left or front-right). It
cannot capture the tile straight ahead.
- **Terrain:** Can pass through caves (teleporting). Cannot pass river, lake, canyon, tree,
or rock.

### 6.2 Ram-Tower — 20 pts

- **Move:** Cross / orthogonal (up, down, left, right) any number of tiles, until blocked.
- **Attack (Catapult):** Ranged cross-shaped attack up to **5 tiles** away.
- **Move-capture:** Unusually, the Ram-Tower can also **move onto an enemy in its path** to
capture it directly.
- **Terrain:** Cannot pass any terrain (cave, river, lake, canyon, tree, rock).

### 6.3 Chariot — 16 pts (Zombie 13)

- **Move:** Corner / L-shaped jumps of **2-1, 1-2, 2-2, 3-1, or 1-3** tiles (all rotations).
- **Jumping:** Jumps over any figures or obstacles in its path; only the **landing tile**
matters. It cannot land on cave, lake, canyon, tree, or rock (it can land on river or
empty tiles).
- **Attack:** Gamma-shaped (L) ranged attack at **1–4 tiles** along the path (not only at
maximum range). It **shoots over friendly figures and all obstacles**; only **enemy
figures** block the shot. In capture-and-move mode, only enemies on a **clear** gamma
path (no friendly figure or obstacle in the way) can be captured by moving onto them.
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
- **Terrain:** Can pass river, cave (teleporting), and canyon. Cannot pass lake.

### 6.5 Paladin — 15 pts (Zombie 12)

- **Move:** Diagonal, any number of tiles, until blocked.
- **Attack:** Ranged diagonal attack up to **3 tiles**.
- **Terrain:** Can pass cave, river (max **1 tile wide**), and canyon. Cannot pass lake.

### 6.6 Warlock (Vezier) — 11 pts

- **Move:** 2-tile corner patterns (2 orthogonal or 2 diagonal). Jumps over figures.
- **Attack:** Captures **one tile diagonally** (adjacent diagonals).
- **Swap (special action):** The Warlock can rearrange the friendly back line:
  - **Swap with the Monarch** — the Warlock and its own Monarch trade places.
  - **Swap a Hoplite with the Monarch** — the Warlock selects a friendly Hoplite, and that
  Hoplite trades places with the Monarch.
- **Terrain:** Can pass lake and cave. Cannot pass river or canyon.

### 6.7 Monarch — 210 pts

- **Move:** One tile in any direction.
- **Attack:** Removes an adjacent enemy (1 tile, any direction).
- **Terrain:** Can pass cave only. Cannot pass river, lake, or canyon.
- **Critical:** Losing the Monarch loses the game. Protect it.

### 6.8 Duchess — 27 pts

- **Move:** Any direction, any number of tiles, until blocked.
- **Attack:** Ranged, up to **9 tiles** in any direction — and it can **shoot through
friendly figures** to hit an enemy behind them.
- **Terrain:** Can pass river. Cannot pass lake, canyon, cave, or tree.

### 6.9 Necromancer (Druid) — 13 pts

The Necromancer is a support/control figure with three distinct actions.

- **Move:** One tile in any direction.
- **Melee attack:** Kills an adjacent enemy (1 tile, any direction).
- **Freeze-stun (special action):** Stuns an enemy figure in a **straight line** (orthogonal
or diagonal) up to **8 tiles** away. Only **trees** block the freeze; other obstacles and
figures do not. The maximum freeze range **drops by 2 for each revival the Necromancer has
performed** (minimum range 2). A frozen figure cannot move or attack; **longer-distance
freezes last more turns** (roughly half the distance used, rounded down, minimum 1 turn).
A figure that is already frozen cannot be frozen again.
- **Revive (special action):** See Section 6.10.
- **Terrain:** Can pass lake and cave. Cannot pass river or canyon.

### 6.10 Revival and Zombie ("Night") mode

The Necromancer can bring back fallen figures as Zombies.

- **Eligible figures:** Only **Ram-Tower, Chariot, Bomber, and Paladin** can be revived, and
only from the pieces the reviving player has lost.
- **Revival guards (requirement):** Revival is allowed **only while the player's Warlock,
Monarch, and Duchess are all still on their original starting squares and have never
moved.** If any of the three has moved or been lost, revival is locked.
- **Placement:** The revived figure appears on its own original starting square if that tile
is empty; otherwise on the nearest empty tile.
- **Zombie attack penalty:** Revived figures attack at **range 1 only**. A revived Bomber
becomes able to attack at range 1 (it gains a melee attack as a Zombie, which it never had
while alive).
- **Necromancer cost:** Each revival permanently **reduces the Necromancer's freeze range by
2** (down to the minimum of 2).
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
and at least one captured figure to bring back.
- **Option 3 — Obstacle Swap:** Roll a die; you may then relocate up to that many obstacle
blocks, swapping them with an equal number of empty tiles. You can move individual blocks
(Cave, Tree, Rock) or a whole obstacle set (Canyon, River, Lake) when the roll allows.
Obstacles cannot be placed directly in front of either player's starting ranks.

---

## 8. Special rules summary

- **Caves:** Entering one cave allows exit from any other cave that has an empty adjacent
tile (Hoplite and Bomber teleport; other cave-capable figures simply pass/rest).
- **Bomber explosions:** A Bomber's explosive net destroys any enemy figure that steps onto
a net tile (diagonals 1-2 away, orthogonals 2 away).
- **Warlock swaps:** Reposition the Monarch with the Warlock or with a friendly Hoplite.
- **Necromancer freeze:** Straight-line stun up to 8 tiles, blocked only by trees, weakened
by 2 per revival.
- **Revival / Zombie mode:** Ram-Tower, Chariot, Bomber, or Paladin can return as Zombies
while the Warlock, Monarch, and Duchess remain on their starting squares unmoved; Zombies
attack at range 1 and are worth fewer points.
- **Mystery Box:** Figure Swap, Hoplite Sacrifice & Revive, or Obstacle Swap.

---

## 9. Game modes

- **Vs. Bot (single player):** The player controls White; the AI controls Black. Bot
difficulty (Easy / Medium / Hard) affects its thinking time and decisions.
- **Local / pass-and-play:** Two players share one device.
- **Online multiplayer:** Two players on separate devices play in real time. Both clients
use identical rules; the same rules in this document apply. Moves are synced over the
network, and each player may only act on their own turn.

---

## 10. Support-agent quick answers (FAQ)

- **"How do I win?"** — Capture the opponent's Monarch. You also win if your opponent has no
legal action on their turn.
- **"Why can't my Hoplite capture the figure directly in front of it?"** — Hoplites only
capture diagonally forward; they move straight but cannot capture straight ahead.
- **"My figure attacked but stayed in place — is that a bug?"** — No. Most attacks are
ranged: the attacker stays put and removes the target. Only the Ram-Tower and Zombie
figures capture by moving onto the enemy.
- **"Why did my figure die just by moving there?"** — It stepped onto an enemy Bomber's
explosive-net tile. Net tiles sit on the diagonals 1-2 away and the orthogonal tiles 2
away from an enemy Bomber.
- **"Why can't my Necromancer revive anyone?"** — Revival requires your Warlock, Monarch,
and Duchess to all be on their original starting squares and to have never moved, plus an
eligible captured figure (Ram-Tower, Chariot, Bomber, or Paladin).
- **"Why is my Necromancer's freeze so short-ranged now?"** — Each revival it performs
reduces its freeze range by 2 (minimum 2 tiles).
- **"Can the Duchess shoot past my own pieces?"** — Yes, the Duchess shoots through friendly
figures (up to 9 tiles), but trees still block her.
- **"My figure entered a cave and reappeared elsewhere."** — Caves are teleporters. Hoplites
and Bombers emerge next to another cave on the board.
- **"What is night mode?"** — A visual state that appears while Zombie (revived) figures are
on the board. It changes no rules by itself.

