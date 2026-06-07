# Game Mechanics Map

Reference for AI agents. All game logic lives under `src/pages/Game/`.

---

## Core Data Contracts

### `types/index.ts`
Single source of truth for every type and constant union used in game logic.

| Export | What it is |
|---|---|
| `Piece` | Interface — `id`, `type`, `color`, `hasMoved`, `isZombie`, `reviveCount`, `frozenTurns`, `standingOnObstacle` |
| `Obstacle` | Interface — `type: ObstacleType` |
| `Board` | `CellContent[][]` — `null \| Piece \| Obstacle` |
| `Position` | `{ row, col }` |
| `Move` | Result of a move/attack — includes `from`, `to`, `piece`, `captured?`, `isAttack?`, `isFreeze?`, `terminatedByNarc?` |
| `GameState` | Full client-side state snapshot — board, currentPlayer, validMoves/Attacks/Swaps, history, captured, narcs, nightMode |
| `PieceRules` | Shape of each piece's rule entry — `move`, `attackRange`, `canPass`, `canJumpPieces`, `shootsThroughFriendly`, `maxRiverWidth`, `points`, `zombiePoints` |
| `PlayerColors` | `'white' \| 'black'` |
| `PieceTypes` | All piece type string literals |
| `ObstacleTypes` | All obstacle type string literals |
| `MovePatterns` | `ANY \| CROSS \| SIDEWAYS \| DIAGONAL` |
| `MysteryBoxState` | State machine for mystery box interactions |
| `MysteryBoxOptions / Phases` | Enum-style constants for mystery box flow |
| `isPiece(cell)` | Type guard |
| `isObstacle(cell)` | Type guard |

---

## Piece Rules Table

### `constants/index.ts`
`PIECE_RULES: Record<PieceType, PieceRules>` — the single authoritative rule definition for every piece. **All mechanical changes (attack range, movement pattern, passable obstacles, special flags) go here first.**

| Piece | `move` | `attackRange` | `canPass` | Special flags |
|---|---|---|---|---|
| `hoplite` | `[3,2]` (first/subsequent) | `1` | CAVE, MYSTERY_BOX | `canChooseAttackMode` |
| `ramTower` | CROSS | `5` | MYSTERY_BOX | `canChooseAttackMode` |
| `chariot` | Pattern `[[2,1],[1,2],[2,2],[3,1],[1,3]]` | `4` | RIVER, MYSTERY_BOX | `canJumpPieces`, `canChooseAttackMode` |
| `bomber` | Pattern `[[1,0],[0,1],[1,1],[2,0],[0,2],[2,2]]` | `0` | CAVE, RIVER, CANYON, MYSTERY_BOX | `canJumpPieces` |
| `paladin` | DIAGONAL | `3` | CAVE, RIVER, CANYON, MYSTERY_BOX | `canChooseAttackMode`, `maxRiverWidth: 1` |
| `warlock` | Pattern `[[2,0],[0,2],[2,2]]` | `1` | CAVE, LAKE, MYSTERY_BOX | `canJumpPieces` |
| `monarch` | ANY (1 step) | `1` | MYSTERY_BOX | `canChooseAttackMode` |
| `duchess` | ANY (unlimited) | `9` | RIVER, MYSTERY_BOX | `canChooseAttackMode`, **`shootsThroughFriendly: true`** |
| `necromancer` | Pattern `[[1,0],[0,1],[1,1]]` | `1` | LAKE, MYSTERY_BOX | — |

Other constants here:
- `PIECE_SYMBOLS`, `PIECE_NAMES`, `OBSTACLE_NAMES`, `OBSTACLE_COUNTS` (per board size)
- `BACK_ROW_PIECES` — ordered list of back-row piece types (12 pieces)
- `FIGURE_RULES_BULLETS` — human-readable rule bullets used by the Rules page
- `BOT_DELAY` per difficulty
- `INITIAL_GAME_STATE`

---

## Movement & Attack Engine

### `utils/moveUtils.ts`
**All legality logic lives here.** Nothing else decides if a move or attack is valid.

| Function | Purpose |
|---|---|
| `getPieceMoves(board, pos, boardSize)` | Returns all legal move destinations for the piece at `pos`. Dispatches to per-pattern helpers. |
| `getValidMoves(board, pos, boardSize)` | Public alias for `getPieceMoves`. |
| `getValidAttacks(board, pos, boardSize)` | Returns all legal attack targets for the piece at `pos`. Handles special cases per piece type before the general loop. |
| `canAttack(piece, start, target, board, boardSize)` | Boolean wrapper over `getValidAttacks`. |
| `isValidMove(piece, start, end, board, boardSize)` | Boolean wrapper over `getPieceMoves`. |
| `makeMove(board, from, to, boardSize, isAttack, narcs)` | Applies a move/attack immutably. Returns `{ newBoard, move, newNarcs }`. Handles cave teleport, narc net trigger, bomber narc creation/removal. |
| `hasLegalMoves(board, color, boardSize)` | Returns `false` when the player has no moves, attacks, or freeze targets — used for stalemate/game-over detection. |
| `findMonarch(board, color)` | Finds monarch position; returns `null` if captured. |
| `isMonarchCaptured(board, color)` | Boolean check for game-over condition. |
| `getNecromancerKillTargets(board, pos, boardSize)` | Adjacent enemy targets for Necromancer melee kill. |
| `getNecromancerFreezeTargets(board, pos, boardSize)` | Enemy targets in freeze range with line-of-sight check (blocked only by TREE obstacles). |
| `applyNecromancerFreeze(board, from, to, boardSize)` | Applies freeze to target; returns `{ newBoard, move }`. `freezeTurns` scales with distance. |
| `decrementFrozenTurnsForPlayer(board, color)` | Called at the start of each turn to tick down freeze counters. |

**Internal helpers (not exported):**

| Helper | Notes |
|---|---|
| `isAttackPathClear(board, from, to, piece, boardSize)` | Walks the straight line between two cells. Returns `false` if any obstacle blocks or any piece is in the way — **except** if `PIECE_RULES[piece.type].shootsThroughFriendly` is `true`, friendly pieces in the path are skipped (Duchess). |
| `canPassObstacle(pieceType, obstacleType)` | Reads `PIECE_RULES[pieceType].canPass`. Special case: DUCHESS cannot pass TREE. |
| `isPathClear(board, from, to, piece, boardSize)` | Movement path check — blocks on any piece or impassable obstacle. |
| `getHopliteMoves / getCrossMoves / getSidewaysMoves / getDiagonalMoves / getAnyDirectionMoves / getPatternMoves` | Per-pattern move generators. |
| `getRamTowerValidAttacks / getPaladinValidAttacks / getChariotValidAttacks` | Per-piece attack generators with their own logic. |
| `isChariotGammaAttack / isChariotGammaPathClear` | Chariot's L-shaped attack path validation. |
| `isFreezePathClear` | Line-of-sight for Necromancer freeze; only TREE blocks. |

---

## Board Initialisation & Utilities

### `utils/boardUtils.ts`

| Function | Purpose |
|---|---|
| `createInitialBoard(boardSize)` | Builds a fresh board: places pieces in start positions then calls `placeObstacles`. |
| `cloneBoard(board)` | Shallow-clones every cell (required before any mutation). |
| `isInBounds(row, col, boardSize)` | Bounds check used throughout. |
| `getObstacleType(board, row, col)` | Returns `ObstacleType \| null`. |
| `findPiecePositions(board, pieceType)` | All positions of a given piece type on the board. |
| `findAllCaves(board)` | All cave positions — used for teleport logic. |
| `getBackRowForBoardSize(cols)` | Returns the ordered back-row piece array for 12/16/20-col boards. |
| `movePiece / attackPiece` | Simple board mutations (used outside the main move engine). |

**Obstacle placement (all internal):** `placeCaves`, `placeLake`, `placeLinearObstacle` (rivers/canyons), `placeClusteredObstacles` (trees/rocks), `placeMysteryBoxes`, `placeGroupedObstacle`. All respect a 3-row protected zone at each end of the board.

---

## Zombie / Necromancer Revival System

### `utils/zombieUtils.ts`

| Function | Purpose |
|---|---|
| `isZombieEligibleType(pieceType)` | `true` for RAM_TOWER, CHARIOT, BOMBER, PALADIN. |
| `areRevivalGuardsInPlace(board, boardSize, color)` | Necromancer, Monarch, and Duchess must all be on the board on the same row. Gate for any revival. |
| `getAdjustedAttackRange(piece, baseRange)` | Zombie pieces get `min(range, 1)`. Zombie BOMBER gets `1`. Necromancer loses 2 range per revival (`reviveCount`). |
| `reviveZombiePiece(board, necromancerPos, revivePiece, target, currentPlayer)` | Places zombie piece, increments `reviveCount` on Necromancer. |
| `getZombieRevivePlacementTarget` | Finds placement cell — prefers original start position, otherwise nearest empty cell. |
| `getNightModeFromBoard(board)` | Returns `true` if any zombie piece exists on the board. |
| `getZombieReviveOpenState / getZombieReviveConfirmState / getZombieReviveStatusMessage` | UI-state helpers for the zombie revive modal. |

---

## Bomber Narc (Mine) System

### `utils/narcUtils.ts`

| Function | Purpose |
|---|---|
| `getNarcPositions(bomberPos)` | The 12 fixed offsets a Bomber seeds narcs to (diagonal ±1/±2 and orthogonal ±2). |
| `createNarcsForBomber(bomberPos, ownerColor, bomberId, board, boardSize, existingNarcs)` | Creates `Narc[]` for a newly placed Bomber — only on currently empty cells. |
| `removeNarcsForBomber(narcs, bomberId)` | Called when Bomber moves or is captured. |
| `checkNarcNetTrigger(board, boardSize, pos, movingPieceColor)` | Called in `makeMove`; if the destination sits in an enemy narc net, the piece is destroyed instead of moving. |
| `findNarcAtPosition / checkNarcTrigger` | Lower-level helpers. |

---

## Warlock Swap System

### `utils/swapUtils.ts`

| Function | Purpose |
|---|---|
| `canInitiateSwap(board, pos)` | `true` only if piece at `pos` is WARLOCK. |
| `getValidSwapTargets(board, warlockPos)` | Returns all friendly MONARCHs and HOPLITEs as swap targets. |
| `isValidSwap(board, initiatorPos, targetPos)` | Validates: initiator is WARLOCK, same color, target is MONARCH or HOPLITE. |
| `executeSwap(board, initiatorPos, targetPos)` | `warlock-monarch`: swap positions directly. `hoplite-monarch`: Hoplite takes Monarch's square, Monarch takes Hoplite's square (Warlock stays). |

---

## Mystery Box System

### `utils/mysteryBoxUtils.ts`

Three options rolled by `getRandomMysteryBoxOption`:
1. `FIGURE_SWAP` — swap two friendly figures
2. `HOPLITE_SACRIFICE_REVIVE` — sacrifice a Hoplite to revive a captured piece
3. `OBSTACLE_SWAP` — swap two obstacles on the board

State machine phases live in `MysteryBoxPhases` (types). Key functions:
- `rollDice()` — random 1–6
- `getRandomMysteryBoxOption(currentPlayerColor, capturedPieces)` — picks option; HOPLITE_SACRIFICE_REVIVE only available when player has capturable pieces
- Phase-transition and validation helpers for each option step

---

## Bot AI

### `utils/botUtils.ts`
Minimax-based bot. Reads `PIECE_RULES` for piece values.

| Function | Purpose |
|---|---|
| `getBotMove(board, difficulty, boardSize, narcs)` | Entry point — returns `HintMove \| null`. |
| `getHintMove(board, color, boardSize, narcs)` | Same logic, used for the hint feature for human players. |
| `evaluateBoard(board)` | Material score ± center bonus. Zombie pieces use `zombiePoints`. |

Difficulty controls minimax depth (EASY/MEDIUM/HARD → shallower/deeper).

---

## Game State Orchestration

### `hooks/useGame.ts`
The main hook wiring all utilities into React state. Contains:
- `handleSquareClick` — dispatch to move, attack, swap, mystery-box, or freeze based on selected piece and click target
- `handleBotTurn` — triggers bot move after a delay
- Undo history (`HistoryEntry[]`)
- Freeze turn decrement on turn change
- Game-over detection (`isMonarchCaptured`, `hasLegalMoves`)

**Does not contain any rules logic** — all decisions delegate to `utils/`.

---

## Key Invariants for Agents

- **Board is immutable** — always `cloneBoard` before writing. `makeMove` and all utils return new boards.
- **`PIECE_RULES` is the single source of truth** for any piece capability. Change the rule there first.
- **`isAttackPathClear`** is the chokepoint for range-attack line-of-sight. The `shootsThroughFriendly` flag on a piece's rules entry makes it skip friendly pieces in the path.
- **`getAdjustedAttackRange`** wraps the base `attackRange` — always call it rather than reading `attackRange` directly when a piece may be a zombie or Necromancer.
- **Narc net is checked inside `makeMove`** before the move is applied — no separate call needed.
- **Revival guard check** (`areRevivalGuardsInPlace`) must pass before any zombie revival is offered.
- **Night mode** is a derived value (`getNightModeFromBoard`) — never stored directly.
