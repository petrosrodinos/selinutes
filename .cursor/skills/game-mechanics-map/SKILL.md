---
name: game-mechanics-map
description: Reference map for all game mechanics in the Selinutes board game frontend and online multiplayer sync. Provides file locations for movement rules, attack validation, piece rule tables, board setup, zombie revival, Bomber narc/mine system, Warlock swaps, Mystery Box, bot AI, game state hook, and online mode WebSocket sync. Use when modifying any game rule, piece behaviour, attack range, movement pattern, obstacle interaction, special ability, or online multiplayer behaviour. Triggers on tasks involving piece mechanics, game rules, board logic, online mode, socket sync, or anything inside app/src/pages/Game/.
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

## Invariants Every Agent Must Follow

- **`PIECE_RULES`** in `constants/index.ts` is the single source of truth for every piece capability. Change the rule there first, never in logic directly.
- **Board is immutable** — always `cloneBoard` before writing. All utils return new boards.
- **`isAttackPathClear`** is the chokepoint for line-of-sight. To let a piece shoot through friendly pieces, add `shootsThroughFriendly: true` to its `PIECE_RULES` entry (and the matching field to `PieceRules` in `types/index.ts` if not already there).
- **`getAdjustedAttackRange(piece, baseRange)`** — never read `attackRange` directly; call this wrapper to account for zombie and Necromancer modifiers.
- **Narc net** is checked inside `makeMove`; no separate call needed.
- **Revival** requires `areRevivalGuardsInPlace` to return `true` (WARLOCK, MONARCH, DUCHESS on starting squares, `hasMoved === false`).
- **Night mode** is derived (`getNightModeFromBoard`) — never stored as state directly.
- **No game rules inside components** — all logic goes in `utils/`, offline orchestration in `hooks/useGame.ts`, shared state in `gameStore.ts`, online sync in `useOnlineGame.ts`.
- **Online = same rules, extra sync** — never duplicate rule logic for online. If offline works but online does not, the bug is in the sync/event path, not the utils.
