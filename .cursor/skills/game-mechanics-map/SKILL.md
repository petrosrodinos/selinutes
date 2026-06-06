---
name: game-mechanics-map
description: Reference map for all game mechanics in the Selinutes board game frontend and online multiplayer sync. Provides file locations for movement rules, attack validation, piece rule tables, board setup, zombie revival, Bomber narc/mine system, Warlock swaps, Mystery Box, bot AI, game state hook, online mode WebSocket sync, per-figure unit tests, game-rules documentation, and Rules page exports in app/src/pages/Game/constants/index.ts (RULES_FIGURE_ORDER, RULES_FIGURE_SECTION_TITLES, FIGURE_RULES_BULLETS). Use when modifying any game rule, piece behaviour, attack range, movement pattern, obstacle interaction, special ability, online multiplayer behaviour, game-mechanics tests, api/docs/game-rules.md, or Rules page copy. Triggers on tasks involving piece mechanics, game rules, board logic, online mode, socket sync, figure tests, rules documentation, or anything inside app/src/pages/Game/.
---

# Game Mechanics Map

Read `app/GAME_MECHANICS_MAP.md` before changing game logic.

## Quick Lookup

| Task | File |
|---|---|
| Change any piece's range, movement, or passable obstacles | `app/src/pages/Game/constants/index.ts` → `PIECE_RULES` |
| Add a new piece capability flag | `app/src/pages/Game/types/index.ts` → `PieceRules` interface, then `PIECE_RULES` |
| Move legality / attack legality | `app/src/pages/Game/utils/moveUtils.ts` |
| Attack line-of-sight | `isAttackPathClear` in `moveUtils.ts` |
| Board initialisation / obstacle placement | `app/src/pages/Game/utils/boardUtils.ts` |
| Zombie / Necromancer revival | `app/src/pages/Game/utils/zombieUtils.ts` |
| Bomber mines (Narc system) | `app/src/pages/Game/utils/narcUtils.ts` |
| Warlock position swap | `app/src/pages/Game/utils/swapUtils.ts` |
| Mystery Box state machine | `app/src/pages/Game/utils/mysteryBoxUtils.ts` |
| Bot AI / hint move | `app/src/pages/Game/utils/botUtils.ts` |
| Offline game state orchestration | `app/src/pages/Game/hooks/useGame.ts` |
| Shared game state (offline + online) | `app/src/store/gameStore.ts` |
| Online multiplayer socket sync | `app/src/hooks/useOnlineGame.ts` |
| Online/offline mode branching in UI | `app/src/pages/Game/index.tsx` |
| Game mode detection | `app/src/hooks/useGameMode.ts` |
| Socket event names | `app/src/constants/socketEvents.ts` |
| Server session relay (no rule logic) | `api/src/modules/game/game.gateway.ts`, `api/src/modules/game/game.service.ts` |
| All type definitions | `app/src/pages/Game/types/index.ts` |
| Per-figure unit tests | `app/src/pages/Game/utils/__tests__/figures/*.test.ts` |
| Shared test board helpers | `app/src/pages/Game/utils/__tests__/helpers/boardFixtures.ts` |
| Run game tests | `npm test` in `app/` (Vitest) |
| Canonical rules documentation | `api/docs/game-rules.md` |
| Rules page figure order | `app/src/pages/Game/constants/index.ts` → `RULES_FIGURE_ORDER` |
| Rules page figure headings | `app/src/pages/Game/constants/index.ts` → `RULES_FIGURE_SECTION_TITLES` |
| Rules page figure rule bullets | `app/src/pages/Game/constants/index.ts` → `FIGURE_RULES_BULLETS` |
| Rules page (consumes above exports) | `app/src/pages/Rules/index.tsx`, `app/src/pages/Rules/PieceCarousel/PieceCarousel.tsx` |

## Figure Change — Required Deliverables

Any figure mechanics change is incomplete until **all five** are updated in the same task:

1. **Code** — `app/src/pages/Game/constants/index.ts` → `PIECE_RULES` and/or `app/src/pages/Game/utils/`
2. **Tests** — `app/src/pages/Game/utils/__tests__/figures/<figure>.test.ts`
3. **Docs** — `api/docs/game-rules.md` (sections 3–5 for the affected figure)
4. **Rules page exports** — `app/src/pages/Game/constants/index.ts` → `RULES_FIGURE_ORDER`, `RULES_FIGURE_SECTION_TITLES`, `FIGURE_RULES_BULLETS`
5. **Rules page hardcoded copy** — `app/src/pages/Rules/index.tsx` when points, obstacle counts, or special rules change (section 3 points table must match `PIECE_RULES.points` / `zombiePoints`)

## Online Mode — Architecture

Online mode reuses the **same** `utils/` and `gameStore` as offline. The active player computes moves client-side; the server relays state via WebSocket (no server-side rule validation).

```
Player click → gameStore.selectSquare(pos, isOnline=true)
            → useOnlineGame emits SocketEvents.SYNC_GAME (or special event)
            → api game.gateway relays GAME_UPDATE to opponent
            → opponent gameStore.syncFromServer()
```

## Online Mode — Agent Checklist

When changing any game mechanic, **always verify online mode still works**:

1. **Utils first** — rule changes go in `app/src/pages/Game/utils/` and `PIECE_RULES`. Online inherits these automatically via `gameStore`.
2. **Store actions** — if the mechanic adds a new player action, wire it in `gameStore.ts` and pass `isOnline = true` from `useOnlineGame.ts`.
3. **Socket sync** — every state-changing action the active player performs must emit to the opponent:
   - Standard moves/attacks/swaps → `SocketEvents.SYNC_GAME` via `buildSyncGameState()` in `useOnlineGame.ts`
   - Mystery Box trigger → `SocketEvents.MYSTERY_BOX_TRIGGERED` (includes partial `gameState`)
   - Mystery Box completion → `SocketEvents.MYSTERY_BOX_COMPLETE`
   - Necromancer freeze → `SocketEvents.NECROMANCER_FREEZE` (notification; state syncs via `SYNC_GAME`)
   - Zombie revive start → `SocketEvents.NECROMANCER_REVIVE_STARTED` (notification only)
   - Zombie revive confirm → `SocketEvents.SYNC_GAME` via `requestZombieRevive()`
4. **New special events** — if a mechanic needs opponent notification beyond `SYNC_GAME`, add the event to **both** `app/src/constants/socketEvents.ts` and `api/src/modules/game/constants/socket-events.constants.ts`, then handle it in `useOnlineGame.ts` (emit + listen) and `game.gateway.ts` (relay).
5. **UI branching** — check `app/src/pages/Game/index.tsx` for `isOnline` branches. Online uses `useOnlineGame` handlers (`handleSquareClick`, `requestZombieRevive`, `notifyReviveStarted`) instead of offline store methods.
6. **Turn gating** — online moves must respect `isMyTurn` from `useOnlineGame`. Check `getZombieReviveConfirmState` and `getZombieReviveStatusMessage` for online-specific guards.
7. **Opponent receive path** — confirm the opponent's listener in `useOnlineGame.ts` calls `syncFromServer()` (or the correct handler) so the board updates without requiring a refresh.
8. **Do not add rule logic to the API** — `game.gateway.ts` and `game.service.ts` only store/relay `gameState`. All validation stays in frontend `utils/`.

## Testing — Agent Requirements

**Figure mechanics and their tests must stay in sync.** Any change to figure behaviour — `PIECE_RULES`, `moveUtils`, obstacle pass logic, attack range, special abilities, or related utils — requires updating the matching test file in the **same task**. Do not leave stale tests that assert the old behaviour.

| Code change | Test action required |
|---|---|
| New figure ability or rule | Add new test cases in `__tests__/figures/<figure>.test.ts` |
| Changed move/attack range or pattern | Update existing assertions; add cases for new limits |
| Changed `canPass` obstacles | Update pass/block tests to match new `PIECE_RULES.canPass` |
| Removed or renamed behaviour | Delete or rewrite tests that no longer apply |
| Bug fix in figure logic | Add a regression test reproducing the bug, then fix |
| Shared util change affecting multiple figures | Update every affected figure test file |

Run `npm test` in `app/` before finishing. All tests must pass with the new behaviour — failing tests mean the test file was not updated to match the code change.

### Test setup

The app uses **Vitest**. If no test runner exists yet, add it before writing tests:

- Install: `vitest` as a dev dependency in `app/`
- Config: `vitest.config.ts` with `environment: 'node'`, alias `@` → `src/`
- Script: `"test": "vitest run"`, `"test:watch": "vitest"` in `app/package.json`

### File layout

```
app/src/pages/Game/utils/__tests__/
  helpers/
    boardFixtures.ts          # createEmptyBoard, placePiece, placeObstacle
  figures/
    hoplite.test.ts
    ramTower.test.ts
    chariot.test.ts
    bomber.test.ts
    paladin.test.ts
    warlock.test.ts
    monarch.test.ts
    duchess.test.ts
    necromancer.test.ts
  narcUtils.test.ts
  swapUtils.test.ts
  zombieUtils.test.ts
  mysteryBoxUtils.test.ts
```

One test file per figure. System-level utils (narc, swap, zombie, mystery box) get their own files when the mechanic is touched.

### What to test per figure

Build minimal boards with `boardFixtures` helpers — never depend on `createInitialBoard` unless testing full-board integration. Each figure file must cover **moves**, **attacks** (if applicable), **obstacle pass/block**, and **special abilities**:

| Figure | Required test cases |
|---|---|
| **Hoplite** | First move 3 forward, subsequent move 2 forward, sideways attack range 1, passes cave, blocked by river/lake/canyon/tree/rock |
| **Ram Tower** | Cross-pattern unlimited move, cross-pattern attack up to 5, blocked by impassable obstacles, `canChooseAttackMode` paths |
| **Chariot** | L/corner pattern moves `[[2,1],[1,2],[2,2],[3,1],[1,3]]`, jumps over pieces, gamma attack path, passes river (2-wide), blocked by lake/canyon/cave |
| **Bomber** | Cross/X pattern moves 1–2 steps, `attackRange: 0` (no direct attack), passes cave/river/canyon, blocked by lake, narc creation via `createNarcsForBomber`, narc net trigger via `checkNarcNetTrigger` |
| **Paladin** | Diagonal unlimited move, sideways attack up to 3, `maxRiverWidth: 1`, passes cave/river/canyon |
| **Warlock** | Corner pattern `[[2,0],[0,2],[2,2]]`, jumps pieces, attack range 1, passes lake/cave, swap initiation and targets via `swapUtils` |
| **Monarch** | 1-step any direction move, 1-step any direction attack, passes cave only |
| **Duchess** | Unlimited any-direction move, attack up to 9, `shootsThroughFriendly` (attacks through friendly pieces), passes river, blocked by lake/canyon/cave/tree |
| **Necromancer** | Pattern move `[[1,0],[0,1],[1,1]]`, melee attack range 1, freeze targets via `getNecromancerFreezeTargets`, freeze blocked by tree only, revival guards via `areRevivalGuardsInPlace`, `getAdjustedAttackRange` penalty per `reviveCount` |

### Test patterns

```typescript
import { describe, it, expect } from 'vitest'
import { getValidMoves, getValidAttacks } from '../../moveUtils'
import { createEmptyBoard, placePiece } from '../helpers/boardFixtures'
import { PieceTypes, PlayerColors } from '../../../types'

describe('Hoplite', () => {
  it('moves 3 steps on first move', () => {
    const board = createEmptyBoard({ rows: 12, cols: 12 })
    placePiece(board, { row: 8, col: 5 }, { type: PieceTypes.HOPLITE, color: PlayerColors.WHITE, hasMoved: false })
    const moves = getValidMoves(board, { row: 8, col: 5 }, { rows: 12, cols: 12 })
    expect(moves).toContainEqual({ row: 5, col: 5 })
  })
})
```

### Testing checklist (run on every figure change)

1. **Open the figure's test file** in `__tests__/figures/` — do not only change production code.
2. **Update existing tests first** — find assertions that encode the old rule (ranges, allowed squares, blocked obstacles) and change them to match the new behaviour.
3. **Add tests for new behaviour** — at least one test per new rule or edge case introduced by the change.
4. **Remove obsolete tests** — delete or rewrite tests that describe behaviour you removed; do not skip or comment them out.
5. **Add regression tests for bug fixes** — reproduce the broken case, then confirm the fix makes it pass.
6. **Sync obstacle tests with `PIECE_RULES.canPass`** — if `canPass` changed, update both pass and block tests for that figure.
7. **Sync zombie tests** — if the figure is zombie-eligible (RAM_TOWER, CHARIOT, BOMBER, PALADIN), update `isZombie` and `getAdjustedAttackRange` tests when attack/move rules change.
8. **Do not test UI or sockets** — figure tests target `utils/` only. Online sync is validated manually or via separate integration tests, not per-figure unit tests.
9. **Run `npm test`** in `app/` — green tests must reflect the new mechanics, not the old ones.

## Documentation — Agent Requirements

**`api/docs/game-rules.md` must stay in sync with implemented figure mechanics.** Update it in the same task as code and tests — do not leave outdated player-facing rules.

| Code change | Doc action required |
|---|---|
| Move or attack range/pattern change | Update section 4 bullet(s) for that figure in `api/docs/game-rules.md` |
| Points or zombie points change | Update section 3 for that figure |
| `canPass` obstacle change | Update pass/block lines in section 4; check section 5 if global (e.g. caves) |
| New special ability (swap, narc, freeze, revive) | Update section 4 for the figure and section 5 if it affects special rules |
| Removed behaviour | Delete or rewrite the matching bullets — do not leave stale rules |
| Board/obstacle counts | Update section 1 |

Name mapping in docs vs code:

| Doc name | Code `PieceTypes` |
|---|---|
| Hoplite | `hoplite` |
| Ram-Tower | `ramTower` |
| Chariot | `chariot` |
| Saboteur / Bomber | `bomber` |
| Paladin | `paladin` |
| Vezier / Warlock | `warlock` |
| Monarch | `monarch` |
| Duchess | `duchess` |
| Druid / Necromancer | `necromancer` |

### `app/src/pages/Game/constants/index.ts` — Rules page exports

`app/src/pages/Rules/index.tsx` and `app/src/pages/Rules/PieceCarousel/PieceCarousel.tsx` import these from `app/src/pages/Game/constants/index.ts`:

```typescript
import { RULES_FIGURE_ORDER, RULES_FIGURE_SECTION_TITLES, FIGURE_RULES_BULLETS } from "../Game/constants";
```

**Update all affected exports in `app/src/pages/Game/constants/index.ts` when figure functionality changes** — same task as code and tests.

| Export in `app/src/pages/Game/constants/index.ts` | Consumed by | When to update |
|---|---|---|
| `RULES_FIGURE_ORDER` | `Rules/index.tsx` section 4 numbering; `PieceCarousel.tsx` slide order | New/removed figure; reordering figures on the Rules page |
| `RULES_FIGURE_SECTION_TITLES` | `Rules/index.tsx` section 4 headings; `PieceCarousel.tsx` labels | Rename or retitle a figure on the Rules page |
| `FIGURE_RULES_BULLETS` | `Rules/index.tsx` section 4 bullet list | **Any** move, attack, obstacle, or ability change for that figure |

| Code change | Action in `app/src/pages/Game/constants/index.ts` |
|---|---|
| Move/attack/obstacle/ability change | Rewrite `FIGURE_RULES_BULLETS[<pieceType>]` bullets to match new behaviour |
| Figure renamed in docs | Update `RULES_FIGURE_SECTION_TITLES[<pieceType>]` |
| New figure type added | Add entry to `RULES_FIGURE_ORDER`, `RULES_FIGURE_SECTION_TITLES`, `FIGURE_RULES_BULLETS`; add `PieceTypes` + `PIECE_RULES` first |
| Figure removed | Remove from `RULES_FIGURE_ORDER`; delete keys from `RULES_FIGURE_SECTION_TITLES` and `FIGURE_RULES_BULLETS` |
| Points / zombie points change | Update section 3 table in `app/src/pages/Rules/index.tsx` to match `PIECE_RULES.points` / `zombiePoints` |

Do not edit rule bullets inline in `app/src/pages/Rules/index.tsx` section 4 — that section maps over `FIGURE_RULES_BULLETS`. Edit `FIGURE_RULES_BULLETS` in `app/src/pages/Game/constants/index.ts`.

### Documentation checklist (run on every figure change)

1. **Open `api/docs/game-rules.md`** — edit the affected figure in section 4 (and section 3 if points changed).
2. **Rewrite outdated bullets** — ranges, movement descriptions, obstacle pass/block, and special abilities must match `PIECE_RULES` and `moveUtils` behaviour after your change.
3. **Update section 5** when the change affects cross-figure rules (caves, explosions, revival, zombie mode).
4. **Open `app/src/pages/Game/constants/index.ts`** — update `FIGURE_RULES_BULLETS[<pieceType>]`; update `RULES_FIGURE_SECTION_TITLES` / `RULES_FIGURE_ORDER` if the figure was renamed, added, or removed.
5. **Open `app/src/pages/Rules/index.tsx`** — sync hardcoded points table (section 3) and special-rules copy (section 5) when those values change.
6. **Keep all three in agreement** — `PIECE_RULES` ↔ `FIGURE_RULES_BULLETS` ↔ `api/docs/game-rules.md` must describe the same behaviour.
7. **Do not document unimplemented behaviour** — docs and `FIGURE_RULES_BULLETS` describe what the code does, not aspirational rules.

## Invariants Every Agent Must Follow

- **`PIECE_RULES`** in `app/src/pages/Game/constants/index.ts` is the single source of truth for every piece capability. Change the rule there first, never in logic directly.
- **Board is immutable** — always `cloneBoard` before writing. All utils return new boards.
- **`isAttackPathClear`** is the chokepoint for line-of-sight. To let a piece shoot through friendly pieces, add `shootsThroughFriendly: true` to its `PIECE_RULES` entry (and the matching field to `PieceRules` in `types/index.ts` if not already there).
- **`getAdjustedAttackRange(piece, baseRange)`** — never read `attackRange` directly; call this wrapper to account for zombie and Necromancer modifiers.
- **Narc net** is checked inside `makeMove`; no separate call needed.
- **Revival** requires `areRevivalGuardsInPlace` to return `true` (NECROMANCER, MONARCH, DUCHESS on the same row).
- **Night mode** is derived (`getNightModeFromBoard`) — never stored as state directly.
- **No game rules inside components** — all logic goes in `utils/`, offline orchestration in `hooks/useGame.ts`, shared state in `gameStore.ts`, online sync in `useOnlineGame.ts`.
- **Online = same rules, extra sync** — never duplicate rule logic for online. If offline works but online does not, the bug is in the sync/event path, not the utils.
- **Tests must change with figure mechanics** — code and tests are one unit of work. Changing `PIECE_RULES`, `moveUtils`, or any figure util without updating the corresponding `__tests__/figures/*.test.ts` (and affected system util tests) is incomplete. Stale passing tests that assert removed behaviour are as bad as no tests.
- **Docs and Rules page exports must change with figure mechanics** — update `api/docs/game-rules.md` and `app/src/pages/Game/constants/index.ts` (`FIGURE_RULES_BULLETS`, `RULES_FIGURE_SECTION_TITLES`, `RULES_FIGURE_ORDER`) whenever figure behaviour changes. Also sync `app/src/pages/Rules/index.tsx` when points or global special rules change. Outdated `FIGURE_RULES_BULLETS` or doc text are as bad as stale tests.
