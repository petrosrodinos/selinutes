---
name: game-mechanics-map
description: Reference map for all game mechanics in the Selinutes board game frontend. Provides file locations for movement rules, attack validation, piece rule tables, board setup, zombie revival, Bomber narc/mine system, Warlock swaps, Mystery Box, bot AI, and the game state hook. Use when modifying any game rule, piece behaviour, attack range, movement pattern, obstacle interaction, or special ability. Triggers on tasks involving piece mechanics, game rules, board logic, or anything inside app/src/pages/Game/.
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
| Game state orchestration | `app/src/pages/Game/hooks/useGame.ts` |
| All type definitions | `app/src/pages/Game/types/index.ts` |

## Invariants Every Agent Must Follow

- **`PIECE_RULES`** in `constants/index.ts` is the single source of truth for every piece capability. Change the rule there first, never in logic directly.
- **Board is immutable** — always `cloneBoard` before writing. All utils return new boards.
- **`isAttackPathClear`** is the chokepoint for line-of-sight. To let a piece shoot through friendly pieces, add `shootsThroughFriendly: true` to its `PIECE_RULES` entry (and the matching field to `PieceRules` in `types/index.ts` if not already there).
- **`getAdjustedAttackRange(piece, baseRange)`** — never read `attackRange` directly; call this wrapper to account for zombie and Necromancer modifiers.
- **Narc net** is checked inside `makeMove`; no separate call needed.
- **Revival** requires `areRevivalGuardsInPlace` to return `true` (WARLOCK, MONARCH, DUCHESS on starting squares, `hasMoved === false`).
- **Night mode** is derived (`getNightModeFromBoard`) — never stored as state directly.
- **No game rules inside components** — all logic goes in `utils/`, all orchestration in `hooks/useGame.ts`.
