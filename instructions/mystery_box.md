# Mystery Box Game Logic (Technical Guide)

This document explains how the Mystery Box mechanic works in this codebase and how to replicate it in another project.

## 1) Core idea

When a player **moves onto a Mystery Box obstacle tile**, the tile is consumed and a temporary multi-step action starts (`mysteryBoxState.isActive = true`).

The mechanic is implemented as a **state machine** with:

- an `option` (which reward behavior is selected),
- a `phase` (which step in the flow the player is currently in),
- temporary selections (first figure, selected obstacles, selected revive piece, etc.).

Main implementation files:

- `app/src/store/gameStore.ts`
- `app/src/pages/Game/utils/mysteryBoxUtils.ts`
- `app/src/hooks/useOnlineGame.ts`
- `api/src/modules/game/game.gateway.ts`

---

## 2) Data model to replicate

Use these option IDs and phases:

```ts
export const MysteryBoxOptions = {
  FIGURE_SWAP: 1,
  HOPLITE_SACRIFICE_REVIVE: 2,
  OBSTACLE_SWAP: 3
} as const

export const MysteryBoxPhases = {
  WAITING_FIRST_FIGURE: 'waiting_first_figure',
  WAITING_SECOND_FIGURE: 'waiting_second_figure',
  WAITING_HOPLITE_SACRIFICE: 'waiting_hoplite_sacrifice',
  WAITING_REVIVE_FIGURE: 'waiting_revive_figure',
  WAITING_REVIVE_PLACEMENT: 'waiting_revive_placement',
  WAITING_OBSTACLE_SELECTION: 'waiting_obstacle_selection',
  WAITING_EMPTY_TILE_SELECTION: 'waiting_empty_tile_selection'
} as const

export interface MysteryBoxState {
  isActive: boolean
  option: number | null
  phase: string | null
  triggerPosition: { row: number; col: number } | null
  diceRoll: number | null
  firstFigurePosition: { row: number; col: number } | null
  selectedObstacles: { row: number; col: number }[]
  selectedEmptyTiles: { row: number; col: number }[]
  revivablePieces: Piece[]
  selectedRevivePiece: Piece | null
}
```

Initialization:

```ts
export const getInitialMysteryBoxState = (): MysteryBoxState => ({
  isActive: false,
  option: null,
  phase: null,
  triggerPosition: null,
  diceRoll: null,
  firstFigurePosition: null,
  selectedObstacles: [],
  selectedEmptyTiles: [],
  revivablePieces: [],
  selectedRevivePiece: null
})
```

---

## 3) Trigger flow

Mystery Box is triggered from normal move handling in `selectSquare`:

1. Player selects a piece.
2. Player clicks a valid move tile.
3. If destination is `MYSTERY_BOX` (and not an attack), then:
   - choose reward option,
   - optionally roll dice for obstacle option,
   - remove mystery box tile from board,
   - still execute the move onto that tile,
   - save updated board/captures/move history,
   - set `mysteryBoxState.isActive = true` and appropriate `phase`.

Reference snippet:

```ts
const isMysteryBox = targetCell && isObstacle(targetCell) && targetCell.type === ObstacleTypes.MYSTERY_BOX

if (isMysteryBox && !isValidAttackTarget) {
  const option = getRandomMysteryBoxOption(gameState.currentPlayer, gameState.capturedPieces)
  const diceRoll = option === MysteryBoxOptions.OBSTACLE_SWAP ? rollDice() : null

  const boardWithoutMysteryBox = removeMysteryBoxFromBoard(board, pos)
  const { newBoard: movedBoard, move, newNarcs } = makeMove(
    boardWithoutMysteryBox,
    selectedPosition,
    pos,
    boardSize,
    false,
    gameState.narcs
  )

  set({
    gameState: { ...gameState, board: movedBoard, moveHistory: [...gameState.moveHistory, move], narcs: newNarcs },
    mysteryBoxState: {
      isActive: true,
      option,
      phase: getPhaseForOption(option),
      triggerPosition: pos,
      diceRoll,
      firstFigurePosition: null,
      selectedObstacles: [],
      selectedEmptyTiles: [],
      revivablePieces,
      selectedRevivePiece: null
    }
  })
}
```

---

## 4) Option behaviors

## Option 1: Figure Swap

- Phase sequence:
  - `WAITING_FIRST_FIGURE`
  - `WAITING_SECOND_FIGURE`
- Player must select two different friendly pieces.
- Pieces swap positions.
- Turn ends and current player flips.

Core execution:

```ts
export const executeFigureSwap = (board: Board, pos1: Position, pos2: Position) => {
  const newBoard = board.map(row => [...row])
  const temp = newBoard[pos1.row][pos1.col]
  newBoard[pos1.row][pos1.col] = newBoard[pos2.row][pos2.col]
  newBoard[pos2.row][pos2.col] = temp
  return { success: true, newBoard }
}
```

## Option 2: Hoplite Sacrifice + Revive

- Phase sequence:
  - `WAITING_HOPLITE_SACRIFICE`
  - `WAITING_REVIVE_FIGURE` (piece selection in modal)
  - `WAITING_REVIVE_PLACEMENT` (select empty board tile)
- Player sacrifices one friendly hoplite (removed from board).
- Player revives one piece from their captured list onto an empty tile.
- Revived piece is removed from captured list.
- Turn ends.

Core execution:

```ts
export const executeHopliteSacrifice = (board: Board, hoplitePos: Position) => {
  const newBoard = board.map(row => [...row])
  newBoard[hoplitePos.row][hoplitePos.col] = null
  return { success: true, newBoard }
}

export const executeRevivePiece = (board: Board, piece: Piece, position: Position) => {
  const newBoard = board.map(row => [...row])
  newBoard[position.row][position.col] = { ...piece }
  return { success: true, newBoard }
}
```

## Option 3: Obstacle Swap (dice-based)

- Dice roll determines how many obstacles to relocate (`1..6`).
- Phase sequence:
  - `WAITING_OBSTACLE_SELECTION`
  - `WAITING_EMPTY_TILE_SELECTION`
- Player picks N eligible obstacles (not Mystery Boxes).
- Player picks N empty destination tiles.
- Obstacles and empties are swapped pairwise by index.
- Placement guard: row `2` and row `rows - 3` are disallowed.
- Turn ends.

Core execution:

```ts
export const rollDice = (): number => Math.floor(Math.random() * 6) + 1

export const isObstacleSwapPlacementRowDisabled = (row: number, rows: number): boolean => {
  return row === 2 || row === rows - 3
}

export const executeObstacleSwap = (board: Board, obstaclePositions: Position[], emptyPositions: Position[]) => {
  if (obstaclePositions.length !== emptyPositions.length) {
    return { success: false, newBoard: board }
  }

  const rows = board.length
  const hasDisabledPlacement = emptyPositions.some(pos => isObstacleSwapPlacementRowDisabled(pos.row, rows))
  if (hasDisabledPlacement) return { success: false, newBoard: board }

  const newBoard = board.map(row => [...row])
  for (let i = 0; i < obstaclePositions.length; i++) {
    const obstaclePos = obstaclePositions[i]
    const emptyPos = emptyPositions[i]
    const temp = newBoard[obstaclePos.row][obstaclePos.col]
    newBoard[obstaclePos.row][obstaclePos.col] = newBoard[emptyPos.row][emptyPos.col]
    newBoard[emptyPos.row][emptyPos.col] = temp
  }
  return { success: true, newBoard }
}
```

---

## 5) Online synchronization model

Mystery Box uses **dedicated socket events** in addition to normal game sync:

- `game:mystery_box_triggered`
- `game:mystery_box_complete`

Frontend flow (`useOnlineGame.ts`):

1. Trigger event sent after a box is activated:
   - includes `option`, `optionName`, `diceRoll`, and synced `gameState`.
2. Opponent receives trigger event:
   - board updates immediately,
   - UI shows toast describing selected option.
3. After player completes mystery action, complete event sent with final `gameState`.
4. Opponent applies final state and shows completion feedback.

Backend relay (`game.gateway.ts`):

- on `MYSTERY_BOX_TRIGGERED`:
  - persists optional `gameState` via `updateGameState`,
  - emits event to opponent room.
- on `MYSTERY_BOX_COMPLETE`:
  - persists final state,
  - emits completion payload to opponent.

Minimal backend handlers:

```ts
@SubscribeMessage(SocketEvents.MYSTERY_BOX_TRIGGERED)
async handleMysteryBoxTriggered(@ConnectedSocket() client: Socket, @MessageBody() payload: TriggerPayload) {
  if (payload.gameState) await this.gameService.updateGameState(payload.code, payload.gameState)
  client.to(payload.code).emit(SocketEvents.MYSTERY_BOX_TRIGGERED, payload)
}

@SubscribeMessage(SocketEvents.MYSTERY_BOX_COMPLETE)
async handleMysteryBoxComplete(@ConnectedSocket() client: Socket, @MessageBody() payload: SyncGameDto) {
  const gameSession = await this.gameService.updateGameState(payload.code, payload.gameState as any)
  client.to(gameSession.code).emit(SocketEvents.MYSTERY_BOX_COMPLETE, { code: gameSession.code, gameState: gameSession.gameState })
}
```

---

## 6) Replication checklist

To port this mechanic to another game/service:

1. Add `MysteryBoxState` with option+phase finite-state control.
2. Intercept move resolution and detect movement onto mystery-box tile.
3. Remove box tile before applying move.
4. Start state machine with selected option and phase.
5. Implement all phase transitions for all 3 options.
6. End each option by resetting mystery state and passing turn.
7. Re-run `checkGameOver` after final option action.
8. For multiplayer, emit trigger/complete socket events and persist each state transition.

---

## 7) Important implementation note

In current code (`mysteryBoxUtils.ts`), `getRandomMysteryBoxOption` contains:

```ts
return options[1]
```

before the random return, which means option selection is currently deterministic (always the second option in the built list).  
If you want true randomness in your implementation, remove that line and keep only:

```ts
return options[Math.floor(Math.random() * options.length)]
```

