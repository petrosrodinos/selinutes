import { create } from 'zustand'
import { toast } from 'react-toastify'
import type { GameState, Position, BotDifficulty, HintMove, BoardSizeKey, PlayerColor, CellContent, SwapTarget, MysteryBoxState, Piece } from '../pages/Game/types'
import { isPiece, isObstacle, BOARD_SIZES, PlayerColors, BotDifficulties, BoardSizeKeys, PieceTypes, MysteryBoxOptions, MysteryBoxPhases, ObstacleTypes } from '../pages/Game/types'
import { DEFAULT_BOARD_SIZE } from '../pages/Game/constants'
import type { GameSession, Player } from '../features/game/interfaces'
import {
    createInitialBoard,
    getValidMoves,
    getValidAttacks,
    isChariotValidCaptureMoveTarget,
    resolveAttackModeAction,
    getCaptureMoveTargets,
    resolveInitialAttackMode,
    canUseCaptureAttackMode,
    makeMove,
    collectCapturedPiecesFromMoves,
    hasLegalMoves,
    isMonarchCaptured,
    getBotMove,
    getHintMove,
    getValidSwapTargets,
    executeSwap,
    getInitialMysteryBoxState,
    rollDice,
    getRandomMysteryBoxOption,
    executeFigureSwap,
    executeHopliteSacrifice,
    executeRevivePiece,
    executeObstacleSwap,
    getRevivablePieces,
    getPhaseForOption,
    removeMysteryBoxFromBoard,
    getNecromancerKillTargets,
    getNecromancerFreezeTargets,
    applyNecromancerFreeze,
    decrementFrozenTurnsForPlayer,
    isSelectableObstacle,
    isPositionInList,
    isObstacleSwapPlacementAllowed,
    filterZombieRevivablePieces,
    getNightModeFromBoard,
    areRevivalGuardsInPlace,
    reviveZombiePiece,
    ZOMBIE_REVIVE_ALIGNMENT_HINT
} from '../pages/Game/utils'

interface HistoryEntry {
    gameState: GameState
}

interface MysteryBoxTriggerResult {
    triggered: boolean
    option: number | null
    diceRoll: number | null
    optionName: string | null
}

interface NecromancerFreezeResult {
    freezeApplied: true
    freezeTurns: number
    target: Position
}

type AttackMode = 'ranged' | 'capture'
type NecromancerActionMode = 'move' | 'kill' | 'freeze'

interface GameStore {
    gameState: GameState
    boardSizeKey: BoardSizeKey
    gameStartTimestamp: number
    history: HistoryEntry[]
    botEnabled: boolean
    botThinking: boolean
    botDifficulty: BotDifficulty
    hintMove: HintMove | null
    devModeSelected: Position | null
    mysteryBoxState: MysteryBoxState
    selectedPosition: Position | null
    validMoves: Position[]
    validAttacks: Position[]
    validSwaps: SwapTarget[]
    attackMode: AttackMode
    necromancerActionMode: NecromancerActionMode
    setAttackMode: (mode: AttackMode) => void
    setNecromancerActionMode: (mode: NecromancerActionMode) => void
    reviveZombie: (payload: { necromancerPosition: Position; revivePiece: Piece; target: Position }) => boolean

    gameSession: GameSession | null
    currentPlayerId: string | null
    isLoading: boolean
    error: string | null

    canUndo: () => boolean
    canHint: () => boolean

    selectSquare: (pos: Position, isOnline?: boolean) => MysteryBoxTriggerResult | NecromancerFreezeResult | boolean
    devModeSelectSquare: (pos: Position) => void
    resetGame: (newBoardSizeKey?: BoardSizeKey) => void
    startGameTimer: () => void
    toggleBot: () => void
    setDifficulty: (difficulty: BotDifficulty) => void
    undoMove: () => void
    showHint: () => void
    processBotMove: () => void

    handleMysteryBoxSelection: (pos: Position, isOnline?: boolean) => boolean
    selectRevivePiece: (piece: Piece, isOnline?: boolean) => void
    confirmObstacleSelection: () => void
    cancelMysteryBox: () => void
    resetMysteryBoxState: () => void

    setGameSession: (session: GameSession) => void
    setCurrentPlayerId: (playerId: string) => void
    initializeBoard: () => void
    syncFromServer: (session: GameSession) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    reset: () => void

    getCurrentPlayer: () => Player | undefined
    getCurrentTurnPlayer: () => Player | undefined
    isMyTurn: () => boolean
    getGameStateForSync: () => GameState | null
}

const checkGameOver = (board: GameState['board'], nextPlayer: PlayerColor, boardSize: GameState['boardSize']) => {
    if (isMonarchCaptured(board, nextPlayer)) {
        return {
            gameOver: true,
            winner: nextPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
        }
    }

    if (!hasLegalMoves(board, nextPlayer, boardSize)) {
        return {
            gameOver: true,
            winner: nextPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
        }
    }

    return { gameOver: false, winner: null }
}

const createInitialGameState = (): GameState => {
    const boardSize = BOARD_SIZES[BoardSizeKeys.SMALL] || DEFAULT_BOARD_SIZE
    return {
        board: createInitialBoard(boardSize),
        boardSize: boardSize,
        currentPlayer: PlayerColors.WHITE,
        selectedPosition: null,
        validMoves: [],
        validAttacks: [],
        validSwaps: [],
        moveHistory: [],
        capturedPieces: { white: [], black: [] },
        lastMove: null,
        gameOver: false,
        winner: null,
        narcs: [],
        nightMode: false
    }
}

export const useGameStore = create<GameStore>((set, get) => ({
    gameState: createInitialGameState(),
    boardSizeKey: BoardSizeKeys.SMALL,
    gameStartTimestamp: 0,
    history: [],
    botEnabled: false,
    botThinking: false,
    botDifficulty: BotDifficulties.MEDIUM,
    hintMove: null,
    devModeSelected: null,
    mysteryBoxState: getInitialMysteryBoxState(),
    selectedPosition: null,
    validMoves: [],
    validAttacks: [],
    validSwaps: [],
    attackMode: 'ranged',
    necromancerActionMode: 'move',

    gameSession: null,
    currentPlayerId: null,
    isLoading: false,
    error: null,
    setAttackMode: (mode: AttackMode) => {
        const state = get()
        if (mode === state.attackMode) return

        if (mode === 'capture') {
            const piecePos = state.gameState.selectedPosition ?? state.selectedPosition
            if (piecePos) {
                const cell = state.gameState.board[piecePos.row]?.[piecePos.col]
                if (cell && isPiece(cell)) {
                    if (!canUseCaptureAttackMode(cell)) {
                        return
                    }
                    const moves = state.gameState.selectedPosition ? state.gameState.validMoves : state.validMoves
                    const captureTargets = getCaptureMoveTargets(
                        state.gameState.board,
                        moves,
                        cell,
                        piecePos,
                        state.gameState.boardSize
                    )
                    if (captureTargets.length === 0) {
                        return
                    }
                }
            }
        }

        const hasSelection = Boolean(state.gameState.selectedPosition ?? state.selectedPosition)
        if (hasSelection && state.gameState.selectedPosition) {
            set({
                attackMode: mode,
                gameState: { ...state.gameState }
            })
            return
        }

        set({ attackMode: mode })
    },
    setNecromancerActionMode: (mode: NecromancerActionMode) => {
        set({ necromancerActionMode: mode })
    },

    canUndo: () => {
        const { history, gameState, botThinking } = get()
        return history.length > 0 && gameState.currentPlayer === PlayerColors.WHITE && !botThinking
    },

    canHint: () => {
        const { gameState, botThinking } = get()
        return gameState.currentPlayer === PlayerColors.WHITE && !gameState.gameOver && !botThinking
    },

    selectSquare: (pos: Position, isOnline = false): MysteryBoxTriggerResult | NecromancerFreezeResult | boolean => {
        const { gameState, botEnabled, history, mysteryBoxState, gameSession, currentPlayerId, selectedPosition, validMoves, validAttacks, validSwaps, attackMode, necromancerActionMode } = get()
        const getSelectionData = (board: GameState['board'], boardSize: GameState['boardSize'], piecePos: Position) => {
            const selectedCell = board[piecePos.row][piecePos.col]
            if (!selectedCell || !isPiece(selectedCell)) {
                return { moves: [], attacks: [], swaps: [] as SwapTarget[] }
            }
            const isFrozen = (selectedCell.frozenTurns ?? 0) > 0
            let moves = isFrozen ? [] : getValidMoves(board, piecePos, boardSize)
            if (selectedCell.type === PieceTypes.CHARIOT) {
                moves = moves.filter(move => {
                    const targetCell = board[move.row]?.[move.col]
                    if (targetCell && isPiece(targetCell) && targetCell.color !== selectedCell.color) {
                        return isChariotValidCaptureMoveTarget(board, piecePos, move, selectedCell, boardSize)
                    }
                    return true
                })
            }
            const attacks = getValidAttacks(board, piecePos, boardSize)
            const swaps: SwapTarget[] = !isFrozen && selectedCell.type === PieceTypes.WARLOCK
                ? getValidSwapTargets(board, piecePos).map(s => ({
                    position: s.position,
                    swapType: s.swapType
                }))
                : []
            if (selectedCell.type !== PieceTypes.NECROMANCER) {
                return { moves, attacks, swaps }
            }
            const closeTargets = getNecromancerKillTargets(board, piecePos, boardSize)
            const freezeTargets = isFrozen ? [] : getNecromancerFreezeTargets(board, piecePos, boardSize)
            const mergedAttacks = [...closeTargets, ...freezeTargets].filter((target, index, arr) =>
                index === arr.findIndex(item => item.row === target.row && item.col === target.col)
            )
            return { moves, attacks: mergedAttacks, swaps }
        }

        const canSelectPiece = (board: GameState['board'], boardSize: GameState['boardSize'], piecePos: Position, piece: Piece) => {
            if ((piece.frozenTurns ?? 0) <= 0) return true
            return getSelectionData(board, boardSize, piecePos).attacks.length > 0
        }

        if (isOnline) {
            if (!gameSession || !gameState) return false
            if (!currentPlayerId) return false

            const myPlayer = gameSession.players.find(p => p.id === currentPlayerId)
            if (!myPlayer) return false
            if (myPlayer.color !== gameState.currentPlayer) return false
            if (gameState.gameOver) return false

            if (mysteryBoxState.isActive) {
                return false
            }

            const { board, boardSize } = gameState
            const cell = board[pos.row][pos.col]

            if (selectedPosition) {
                const isValidMoveTarget = validMoves.some(
                    m => m.row === pos.row && m.col === pos.col
                )
                const isValidAttackTarget = validAttacks.some(
                    a => a.row === pos.row && a.col === pos.col
                )
                const swapTarget = validSwaps.find(
                    s => s.position.row === pos.row && s.position.col === pos.col
                )

                if (swapTarget) {
                    const swapResult = executeSwap(board, selectedPosition, pos)

                    if (swapResult.success) {
                        const nextPlayer = gameState.currentPlayer === PlayerColors.WHITE
                            ? PlayerColors.BLACK
                            : PlayerColors.WHITE
                        const { gameOver, winner } = checkGameOver(swapResult.board, nextPlayer, boardSize)

                        set({
                            gameState: {
                                ...gameState,
                                board: swapResult.board,
                                currentPlayer: nextPlayer,
                                selectedPosition: null,
                                validMoves: [],
                                validAttacks: [],
                                validSwaps: [],
                                lastMove: null,
                                gameOver,
                                winner,
                                nightMode: getNightModeFromBoard(swapResult.board)
                            },
                            selectedPosition: null,
                            validMoves: [],
                            validAttacks: [],
                            validSwaps: []
                        })

                        return true
                    }
                }

                if (isValidMoveTarget || isValidAttackTarget) {
                    const targetCell = board[pos.row][pos.col]
                    const isMysteryBox = targetCell && isObstacle(targetCell) && targetCell.type === ObstacleTypes.MYSTERY_BOX

                    if (isMysteryBox && !isValidAttackTarget) {
                        const option = getRandomMysteryBoxOption(gameState.currentPlayer, gameState.capturedPieces)
                        const diceRoll = option === MysteryBoxOptions.OBSTACLE_SWAP ? rollDice() : null

                        const optionNames: Record<number, string> = {
                            [MysteryBoxOptions.FIGURE_SWAP]: 'Figure Swap',
                            [MysteryBoxOptions.HOPLITE_SACRIFICE_REVIVE]: 'Hoplite Sacrifice & Revive',
                            [MysteryBoxOptions.OBSTACLE_SWAP]: 'Obstacle Swap'
                        }

                        const boardWithoutMysteryBox = removeMysteryBoxFromBoard(board, pos)
                        const { newBoard: movedBoard, moves, newNarcs } = makeMove(
                            boardWithoutMysteryBox,
                            selectedPosition,
                            pos,
                            boardSize,
                            false,
                            gameState.narcs,
                            gameState.capturedPieces
                        )

                        const newCaptured = collectCapturedPiecesFromMoves(moves, gameState.capturedPieces)

                        const revivablePieces = option === MysteryBoxOptions.HOPLITE_SACRIFICE_REVIVE
                            ? getRevivablePieces(gameState.currentPlayer, newCaptured)
                            : []

                        const mysteryBoxMoves = moves.map((historyMove, index) =>
                            index === moves.length - 1 ? { ...historyMove, mysteryBoxOption: option } : historyMove
                        )
                        const mysteryBoxMove = mysteryBoxMoves[mysteryBoxMoves.length - 1]

                        set({
                            gameState: {
                                ...gameState,
                                board: movedBoard,
                                selectedPosition: null,
                                validMoves: [],
                                validAttacks: [],
                                validSwaps: [],
                                moveHistory: [...gameState.moveHistory, ...mysteryBoxMoves],
                                capturedPieces: newCaptured,
                                lastMove: mysteryBoxMove,
                                narcs: newNarcs,
                                nightMode: getNightModeFromBoard(movedBoard)
                            },
                            selectedPosition: null,
                            validMoves: [],
                            validAttacks: [],
                            validSwaps: [],
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

                        return {
                            triggered: true,
                            option,
                            diceRoll,
                            optionName: optionNames[option]
                        }
                    }

                    const selectedCell = board[selectedPosition.row][selectedPosition.col]
                    if (!selectedCell || !isPiece(selectedCell)) return false

                    const closeTargets = selectedCell.type === PieceTypes.NECROMANCER
                        ? getNecromancerKillTargets(board, selectedPosition, boardSize)
                        : []
                    const freezeTargets = selectedCell.type === PieceTypes.NECROMANCER
                        ? getNecromancerFreezeTargets(board, selectedPosition, boardSize)
                        : []
                    const isCloseKillTarget = closeTargets.some(target => target.row === pos.row && target.col === pos.col)
                    const isFreezeTarget = freezeTargets.some(target => target.row === pos.row && target.col === pos.col)
                    const isNecromancerMoveCapture = selectedCell.type === PieceTypes.NECROMANCER &&
                        necromancerActionMode === 'move' &&
                        isCloseKillTarget

                    if (selectedCell.type === PieceTypes.NECROMANCER && necromancerActionMode === 'freeze') {
                        if (!isFreezeTarget) return false
                        const { newBoard, move } = applyNecromancerFreeze(board, selectedPosition, pos, boardSize)
                        const nextPlayer = gameState.currentPlayer === PlayerColors.WHITE
                            ? PlayerColors.BLACK
                            : PlayerColors.WHITE
                        const boardAfterTurn = decrementFrozenTurnsForPlayer(newBoard, gameState.currentPlayer)
                        const { gameOver, winner } = checkGameOver(boardAfterTurn, nextPlayer, boardSize)
                        toast.info(`❄️ Freeze applied for ${move.freezeTurns} turn(s).`, { autoClose: 3000 })
                        set({
                            gameState: {
                                ...gameState,
                                board: boardAfterTurn,
                                currentPlayer: nextPlayer,
                                selectedPosition: null,
                                validMoves: [],
                                validAttacks: [],
                                validSwaps: [],
                                moveHistory: [...gameState.moveHistory, move],
                                capturedPieces: gameState.capturedPieces,
                                lastMove: move,
                                gameOver,
                                winner,
                                nightMode: getNightModeFromBoard(boardAfterTurn)
                            },
                            selectedPosition: null,
                            validMoves: [],
                            validAttacks: [],
                            validSwaps: [],
                            attackMode: 'ranged',
                            necromancerActionMode: 'move'
                        })
                        return {
                            freezeApplied: true,
                            freezeTurns: move.freezeTurns || 0,
                            target: pos
                        }
                    }

                    if (selectedCell.type === PieceTypes.NECROMANCER && necromancerActionMode === 'kill' && !isCloseKillTarget) {
                        return false
                    }
                    if (
                        selectedCell.type === PieceTypes.NECROMANCER &&
                        necromancerActionMode === 'move' &&
                        !isValidMoveTarget &&
                        !isCloseKillTarget
                    ) {
                        return false
                    }

                    const attackAction = selectedCell.type === PieceTypes.NECROMANCER
                        ? {
                            allowed: true,
                            shouldUseRangedAttack: necromancerActionMode === 'kill' && isCloseKillTarget,
                            shouldUseMoveCapture: isNecromancerMoveCapture
                          }
                        : resolveAttackModeAction(
                            selectedCell,
                            targetCell,
                            isValidMoveTarget,
                            isValidAttackTarget,
                            attackMode,
                            { board, from: selectedPosition, to: pos, boardSize }
                          )
                    if (!attackAction.allowed) return false
                    const { newBoard, moves, move, newNarcs } = makeMove(
                        board,
                        selectedPosition,
                        pos,
                        boardSize,
                        attackAction.shouldUseRangedAttack && !attackAction.shouldUseMoveCapture,
                        gameState.narcs,
                        gameState.capturedPieces
                    )
                    const boardAfterTurn = decrementFrozenTurnsForPlayer(newBoard, gameState.currentPlayer)

                    const nextPlayer = gameState.currentPlayer === PlayerColors.WHITE
                        ? PlayerColors.BLACK
                        : PlayerColors.WHITE
                    const { gameOver, winner } = checkGameOver(boardAfterTurn, nextPlayer, boardSize)

                    const newCaptured = collectCapturedPiecesFromMoves(moves, gameState.capturedPieces)

                    set({
                        gameState: {
                            ...gameState,
                            board: boardAfterTurn,
                            currentPlayer: nextPlayer,
                            selectedPosition: null,
                            validMoves: [],
                            validAttacks: [],
                            validSwaps: [],
                            moveHistory: [...gameState.moveHistory, ...moves],
                            capturedPieces: newCaptured,
                            lastMove: move,
                            gameOver,
                            winner,
                            narcs: newNarcs,
                            nightMode: getNightModeFromBoard(boardAfterTurn)
                        },
                        selectedPosition: null,
                        validMoves: [],
                        validAttacks: [],
                        validSwaps: [],
                        attackMode: 'ranged',
                        necromancerActionMode: 'move'
                    })

                    return true
                }

                if (cell && isPiece(cell) && cell.color === myPlayer.color) {
                    if (pos.row === selectedPosition.row && pos.col === selectedPosition.col) {
                        set({
                            selectedPosition: null,
                            validMoves: [],
                            validAttacks: [],
                            validSwaps: [],
                            attackMode: 'ranged',
                            necromancerActionMode: 'move'
                        })
                        return false
                    }
                    if (!canSelectPiece(board, boardSize, pos, cell)) return false
                    const { moves, attacks, swaps } = getSelectionData(board, boardSize, pos)
                    set({
                        selectedPosition: pos,
                        validMoves: moves,
                        validAttacks: attacks,
                        validSwaps: swaps,
                        attackMode: resolveInitialAttackMode(board, cell, pos, moves, attacks, boardSize),
                        necromancerActionMode: 'move'
                    })
                    return false
                }

                set({
                    selectedPosition: null,
                    validMoves: [],
                    validAttacks: [],
                    validSwaps: [],
                    attackMode: 'ranged',
                    necromancerActionMode: 'move'
                })
                return false
            }

            if (cell && isPiece(cell) && cell.color === myPlayer.color) {
                if (!canSelectPiece(board, boardSize, pos, cell)) return false
                const { moves, attacks, swaps } = getSelectionData(board, boardSize, pos)
                set({
                    selectedPosition: pos,
                    validMoves: moves,
                    validAttacks: attacks,
                    validSwaps: swaps,
                    attackMode: resolveInitialAttackMode(board, cell, pos, moves, attacks, boardSize),
                    necromancerActionMode: 'move'
                })
            }

            return false
        }

        if (botEnabled && gameState.currentPlayer === PlayerColors.BLACK) return false
        if (gameState.gameOver) return false

        set({ hintMove: null })

        if (mysteryBoxState.isActive) {
            return false
        }

        const cell = gameState.board[pos.row][pos.col]

        if (gameState.selectedPosition) {
            const isValidMoveTarget = gameState.validMoves.some(
                m => m.row === pos.row && m.col === pos.col
            )
            const isValidAttackTarget = gameState.validAttacks.some(
                a => a.row === pos.row && a.col === pos.col
            )
            const swapTarget = gameState.validSwaps.find(
                s => s.position.row === pos.row && s.position.col === pos.col
            )

            if (swapTarget) {
                const swapResult = executeSwap(gameState.board, gameState.selectedPosition, pos)

                if (swapResult.success) {
                    const newHistory = [...history, { gameState }]
                    const nextPlayer = gameState.currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
                    const { gameOver, winner } = checkGameOver(swapResult.board, nextPlayer, gameState.boardSize)

                    set({
                        gameState: {
                            ...gameState,
                            board: swapResult.board,
                            currentPlayer: nextPlayer,
                            selectedPosition: null,
                            validMoves: [],
                            validAttacks: [],
                            validSwaps: [],
                            lastMove: null,
                            gameOver,
                            winner,
                            nightMode: getNightModeFromBoard(swapResult.board)
                        },
                        history: newHistory
                    })
                    return true
                }
            }

            if (isValidMoveTarget || isValidAttackTarget) {
                const targetCell = gameState.board[pos.row][pos.col]
                const isMysteryBox = targetCell && isObstacle(targetCell) && targetCell.type === ObstacleTypes.MYSTERY_BOX

                if (isMysteryBox && !isValidAttackTarget) {
                    const option = getRandomMysteryBoxOption(gameState.currentPlayer, gameState.capturedPieces)
                    const diceRoll = option === MysteryBoxOptions.OBSTACLE_SWAP ? rollDice() : null

                    const optionDescriptions = {
                        [MysteryBoxOptions.FIGURE_SWAP]: '✨ Swap positions of any two of your pieces!',
                        [MysteryBoxOptions.HOPLITE_SACRIFICE_REVIVE]: '⚔️ Sacrifice a Hoplite to revive one of your captured pieces as your own!',
                        [MysteryBoxOptions.OBSTACLE_SWAP]: `🎲 Roll: ${diceRoll}! Swap ${diceRoll} obstacle(s) with empty tiles!`
                    }

                    toast.info(`🎁 Mystery Box Activated!`, { autoClose: 2500 })
                    toast.success(`${optionDescriptions[option]}`, { autoClose: 5000 })

                    const boardWithoutMysteryBox = removeMysteryBoxFromBoard(gameState.board, pos)
                    const { newBoard: movedBoard, moves, newNarcs } = makeMove(
                        boardWithoutMysteryBox,
                        gameState.selectedPosition,
                        pos,
                        gameState.boardSize,
                        false,
                        gameState.narcs,
                        gameState.capturedPieces
                    )

                    const newCaptured = collectCapturedPiecesFromMoves(moves, gameState.capturedPieces)

                    const revivablePieces = option === MysteryBoxOptions.HOPLITE_SACRIFICE_REVIVE
                        ? getRevivablePieces(gameState.currentPlayer, newCaptured)
                        : []

                    const mysteryBoxMoves = moves.map((historyMove, index) =>
                        index === moves.length - 1 ? { ...historyMove, mysteryBoxOption: option } : historyMove
                    )
                    const mysteryBoxMove = mysteryBoxMoves[mysteryBoxMoves.length - 1]

                    set({
                        gameState: {
                            ...gameState,
                            board: movedBoard,
                            selectedPosition: null,
                            validMoves: [],
                            validAttacks: [],
                            validSwaps: [],
                            moveHistory: [...gameState.moveHistory, ...mysteryBoxMoves],
                            capturedPieces: newCaptured,
                            lastMove: mysteryBoxMove,
                            narcs: newNarcs,
                            nightMode: getNightModeFromBoard(movedBoard)
                        },
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
                    return true
                }

                const newHistory = [...history, { gameState }]

                const selectedCell = gameState.board[gameState.selectedPosition.row][gameState.selectedPosition.col]
                if (!selectedCell || !isPiece(selectedCell)) return false

                const closeTargets = selectedCell.type === PieceTypes.NECROMANCER
                    ? getNecromancerKillTargets(gameState.board, gameState.selectedPosition, gameState.boardSize)
                    : []
                const freezeTargets = selectedCell.type === PieceTypes.NECROMANCER
                    ? getNecromancerFreezeTargets(gameState.board, gameState.selectedPosition, gameState.boardSize)
                    : []
                const isCloseKillTarget = closeTargets.some(target => target.row === pos.row && target.col === pos.col)
                const isFreezeTarget = freezeTargets.some(target => target.row === pos.row && target.col === pos.col)
                const isNecromancerMoveCapture = selectedCell.type === PieceTypes.NECROMANCER &&
                    necromancerActionMode === 'move' &&
                    isCloseKillTarget

                if (selectedCell.type === PieceTypes.NECROMANCER && necromancerActionMode === 'freeze') {
                    if (!isFreezeTarget) return false
                    const { newBoard, move } = applyNecromancerFreeze(gameState.board, gameState.selectedPosition, pos, gameState.boardSize)
                    let nextPlayer = gameState.currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
                    if (move.terminatedByNarc) {
                        nextPlayer = gameState.currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
                    }
                    const boardAfterTurn = decrementFrozenTurnsForPlayer(newBoard, gameState.currentPlayer)
                    const { gameOver, winner } = checkGameOver(boardAfterTurn, nextPlayer, gameState.boardSize)
                    toast.info(`❄️ Freeze applied for ${move.freezeTurns} turn(s).`, { autoClose: 3000 })
                    set({
                        gameState: {
                            ...gameState,
                            board: boardAfterTurn,
                            currentPlayer: nextPlayer,
                            selectedPosition: null,
                            validMoves: [],
                            validAttacks: [],
                            validSwaps: [],
                            moveHistory: [...gameState.moveHistory, move],
                            capturedPieces: gameState.capturedPieces,
                            lastMove: move,
                            gameOver,
                            winner,
                            narcs: gameState.narcs,
                            nightMode: getNightModeFromBoard(boardAfterTurn)
                        },
                        history: newHistory,
                        attackMode: 'ranged',
                        necromancerActionMode: 'move'
                    })
                    return true
                }

                if (selectedCell.type === PieceTypes.NECROMANCER && necromancerActionMode === 'kill' && !isCloseKillTarget) {
                    return false
                }
                if (
                    selectedCell.type === PieceTypes.NECROMANCER &&
                    necromancerActionMode === 'move' &&
                    !isValidMoveTarget &&
                    !isCloseKillTarget
                ) {
                    return false
                }

                const attackAction = selectedCell.type === PieceTypes.NECROMANCER
                    ? {
                        allowed: true,
                        shouldUseRangedAttack: necromancerActionMode === 'kill' && isCloseKillTarget,
                        shouldUseMoveCapture: isNecromancerMoveCapture
                      }
                    : resolveAttackModeAction(
                        selectedCell,
                        targetCell,
                        isValidMoveTarget,
                        isValidAttackTarget,
                        attackMode,
                        {
                            board: gameState.board,
                            from: gameState.selectedPosition,
                            to: pos,
                            boardSize: gameState.boardSize
                        }
                    )
                if (!attackAction.allowed) return false
                const { newBoard, moves, move, newNarcs } = makeMove(
                    gameState.board,
                    gameState.selectedPosition,
                    pos,
                    gameState.boardSize,
                    attackAction.shouldUseRangedAttack && !attackAction.shouldUseMoveCapture,
                    gameState.narcs,
                    gameState.capturedPieces
                )
                const boardAfterTurn = decrementFrozenTurnsForPlayer(newBoard, gameState.currentPlayer)

                let nextPlayer = gameState.currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE

                if (move.terminatedByNarc) {
                    nextPlayer = gameState.currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
                }

                const { gameOver, winner } = checkGameOver(boardAfterTurn, nextPlayer, gameState.boardSize)

                const newCaptured = collectCapturedPiecesFromMoves(moves, gameState.capturedPieces)

                set({
                    gameState: {
                        ...gameState,
                        board: boardAfterTurn,
                        currentPlayer: nextPlayer,
                        selectedPosition: null,
                        validMoves: [],
                        validAttacks: [],
                        validSwaps: [],
                        moveHistory: [...gameState.moveHistory, ...moves],
                        capturedPieces: newCaptured,
                        lastMove: move,
                        gameOver,
                        winner,
                        narcs: newNarcs,
                        nightMode: getNightModeFromBoard(boardAfterTurn)
                    },
                    history: newHistory,
                    attackMode: 'ranged',
                    necromancerActionMode: 'move'
                })
                return true
            }

            if (cell && isPiece(cell) && cell.color === gameState.currentPlayer) {
                if (gameState.selectedPosition && pos.row === gameState.selectedPosition.row && pos.col === gameState.selectedPosition.col) {
                    set({
                        gameState: {
                            ...gameState,
                            selectedPosition: null,
                            validMoves: [],
                            validAttacks: [],
                            validSwaps: []
                        },
                        attackMode: 'ranged',
                        necromancerActionMode: 'move'
                    })
                    return false
                }
                if (!canSelectPiece(gameState.board, gameState.boardSize, pos, cell)) {
                    toast.warning('❄️ This piece is frozen and cannot move.', { autoClose: 2500 })
                    return false
                }
                const { moves, attacks, swaps } = getSelectionData(gameState.board, gameState.boardSize, pos)
                set({
                    gameState: {
                        ...gameState,
                        selectedPosition: pos,
                        validMoves: moves,
                        validAttacks: attacks,
                        validSwaps: swaps
                    },
                    attackMode: resolveInitialAttackMode(gameState.board, cell, pos, moves, attacks, gameState.boardSize),
                    necromancerActionMode: 'move'
                })
                return false
            }

            set({
                gameState: {
                    ...gameState,
                    selectedPosition: null,
                    validMoves: [],
                    validAttacks: [],
                    validSwaps: []
                },
                attackMode: 'ranged',
                necromancerActionMode: 'move'
            })
            return false
        }

        if (cell && isPiece(cell) && cell.color === gameState.currentPlayer) {
            if (!canSelectPiece(gameState.board, gameState.boardSize, pos, cell)) {
                toast.warning('❄️ This piece is frozen and cannot move.', { autoClose: 2500 })
                return false
            }
            const { moves, attacks, swaps } = getSelectionData(gameState.board, gameState.boardSize, pos)
            set({
                gameState: {
                    ...gameState,
                    selectedPosition: pos,
                    validMoves: moves,
                    validAttacks: attacks,
                    validSwaps: swaps
                },
                attackMode: resolveInitialAttackMode(gameState.board, cell, pos, moves, attacks, gameState.boardSize),
                necromancerActionMode: 'move'
            })
        }

        return false
    },

    devModeSelectSquare: (pos: Position) => {
        const { gameState, devModeSelected } = get()
        const cell = gameState.board[pos.row][pos.col]

        if (devModeSelected) {
            const selectedCell = gameState.board[devModeSelected.row][devModeSelected.col]

            if (cell === null && selectedCell !== null) {
                const newBoard = gameState.board.map(row => [...row])
                newBoard[pos.row][pos.col] = selectedCell
                newBoard[devModeSelected.row][devModeSelected.col] = null as CellContent

                set({
                    gameState: {
                        ...gameState,
                        board: newBoard,
                        selectedPosition: null,
                        validMoves: [],
                        validAttacks: []
                    },
                    devModeSelected: null
                })
                return
            }

            if (cell !== null && (isPiece(cell) || isObstacle(cell))) {
                set({ devModeSelected: pos })
                return
            }

            set({ devModeSelected: null })
            return
        }

        if (cell !== null && (isPiece(cell) || isObstacle(cell))) {
            set({ devModeSelected: pos })
        }
    },

    resetGame: (newBoardSizeKey?: BoardSizeKey) => {
        const { boardSizeKey: currentSizeKey } = get()
        const sizeKey = newBoardSizeKey || currentSizeKey
        const newBoardSize = BOARD_SIZES[sizeKey] || DEFAULT_BOARD_SIZE

        set({
            gameState: {
                board: createInitialBoard(newBoardSize),
                boardSize: newBoardSize,
                currentPlayer: PlayerColors.WHITE,
                selectedPosition: null,
                validMoves: [],
                validAttacks: [],
                validSwaps: [],
                moveHistory: [],
                capturedPieces: { white: [], black: [] },
                lastMove: null,
                gameOver: false,
                winner: null,
                narcs: [],
                nightMode: false
            },
            boardSizeKey: newBoardSizeKey ? newBoardSizeKey : currentSizeKey,
            gameStartTimestamp: Date.now(),
            history: [],
            botThinking: false,
            hintMove: null,
            mysteryBoxState: getInitialMysteryBoxState(),
            attackMode: 'ranged',
            necromancerActionMode: 'move'
        })
    },

    startGameTimer: () => {
        const { gameStartTimestamp } = get()
        if (gameStartTimestamp === 0) {
            set({ gameStartTimestamp: Date.now() })
        }
    },

    toggleBot: () => {
        set(state => ({
            botEnabled: !state.botEnabled,
            botThinking: false
        }))
    },

    setDifficulty: (difficulty: BotDifficulty) => {
        set({ botDifficulty: difficulty })
    },

    undoMove: () => {
        const { history, botThinking } = get()
        if (history.length === 0 || botThinking) return

        const newHistory = [...history]
        const lastEntry = newHistory.pop()
        if (lastEntry) {
            set({
                gameState: {
                    ...lastEntry.gameState,
                    selectedPosition: null,
                    validMoves: [],
                    validAttacks: [],
                    validSwaps: []
                },
                history: newHistory,
                attackMode: 'ranged',
                necromancerActionMode: 'move'
            })
        }
    },

    showHint: () => {
        const { gameState } = get()
        if (gameState.currentPlayer !== PlayerColors.WHITE) return
        if (gameState.gameOver) return

        const hint = getHintMove(gameState.board, gameState.lastMove, gameState.boardSize)
        set({ hintMove: hint })
    },

    processBotMove: () => {
        const { gameState, botDifficulty, botEnabled } = get()

        if (!botEnabled) return
        if (gameState.currentPlayer !== PlayerColors.BLACK) return
        if (gameState.gameOver) return

        set({ botThinking: true })

        const botMove = getBotMove(gameState.board, gameState.lastMove, botDifficulty, gameState.boardSize)

        if (!botMove) {
            set({ botThinking: false })
            return
        }

        const { newBoard, moves, move, newNarcs } = makeMove(
            gameState.board,
            botMove.from,
            botMove.to,
            gameState.boardSize,
            botMove.isAttack || false,
            gameState.narcs,
            gameState.capturedPieces
        )
        const boardAfterTurn = decrementFrozenTurnsForPlayer(newBoard, gameState.currentPlayer)

        const nextPlayer = PlayerColors.WHITE
        const { gameOver, winner } = checkGameOver(boardAfterTurn, nextPlayer, gameState.boardSize)

        const newCaptured = collectCapturedPiecesFromMoves(moves, gameState.capturedPieces)

        set({
            gameState: {
                ...gameState,
                board: boardAfterTurn,
                currentPlayer: nextPlayer,
                selectedPosition: null,
                validMoves: [],
                validAttacks: [],
                moveHistory: [...gameState.moveHistory, ...moves],
                capturedPieces: newCaptured,
                lastMove: move,
                gameOver,
                winner,
                narcs: newNarcs,
                nightMode: getNightModeFromBoard(boardAfterTurn)
            },
            botThinking: false,
            attackMode: 'ranged',
            necromancerActionMode: 'move'
        })
    },

    handleMysteryBoxSelection: (pos: Position, isOnline = false): boolean => {
        const { gameState, mysteryBoxState } = get()
        if (!mysteryBoxState.isActive || !gameState) return false

        const { board, boardSize, capturedPieces, currentPlayer } = gameState
        const { option, phase, diceRoll, firstFigurePosition, selectedObstacles, selectedEmptyTiles, selectedRevivePiece } = mysteryBoxState

        if (option === MysteryBoxOptions.FIGURE_SWAP) {
            if (phase === MysteryBoxPhases.WAITING_FIRST_FIGURE) {
                const cell = board[pos.row][pos.col]
                if (!cell || !isPiece(cell) || cell.color !== currentPlayer) {
                    if (!isOnline) {
                        toast.warning('❌ Invalid Selection - Please click on one of YOUR pieces to begin the swap.', { autoClose: 3000 })
                    }
                    return false
                }

                if (!isOnline) {
                    toast.success(`✅ First Piece Selected! Now click on ANOTHER piece of yours to swap positions with.`, { autoClose: 4000 })
                } else {
                    toast.info('✨ Now select another piece to swap positions with!', { autoClose: 4000 })
                }

                set({
                    mysteryBoxState: {
                        ...mysteryBoxState,
                        phase: MysteryBoxPhases.WAITING_SECOND_FIGURE,
                        firstFigurePosition: pos
                    }
                })
                return false
            }

            if (phase === MysteryBoxPhases.WAITING_SECOND_FIGURE && firstFigurePosition) {
                const cell = board[pos.row][pos.col]
                if (!cell || !isPiece(cell) || cell.color !== currentPlayer) {
                    if (!isOnline) {
                        toast.warning('❌ Invalid Selection - Select a DIFFERENT piece of yours to complete the swap.', { autoClose: 3000 })
                    }
                    return false
                }
                if (pos.row === firstFigurePosition.row && pos.col === firstFigurePosition.col) {
                    if (!isOnline) {
                        toast.warning('❌ Cannot swap a piece with itself! Select a DIFFERENT piece.', { autoClose: 3000 })
                    }
                    return false
                }

                const { success, newBoard } = executeFigureSwap(board, firstFigurePosition, pos)
                if (!success) {
                    if (!isOnline) {
                        toast.error('❌ Swap failed! Please try again.', { autoClose: 2000 })
                    }
                    return false
                }

                if (!isOnline) {
                    toast.success('🎉 Pieces swapped successfully! Your turn is complete.', { autoClose: 3000 })
                }

                const nextPlayer = currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
                const { gameOver, winner } = checkGameOver(newBoard, nextPlayer, boardSize)

                set({
                    gameState: {
                        ...gameState,
                        board: newBoard,
                        currentPlayer: nextPlayer,
                        gameOver,
                        winner,
                        nightMode: getNightModeFromBoard(newBoard)
                    },
                    mysteryBoxState: getInitialMysteryBoxState()
                })
                return true
            }
        }

        if (option === MysteryBoxOptions.HOPLITE_SACRIFICE_REVIVE) {
            if (phase === MysteryBoxPhases.WAITING_HOPLITE_SACRIFICE) {
                const cell = board[pos.row][pos.col]
                if (!cell || !isPiece(cell) || cell.type !== PieceTypes.HOPLITE || cell.color !== currentPlayer) {
                    if (!isOnline) {
                        toast.warning('❌ Invalid Selection - You must select one of YOUR HOPLITES (⚔️) to sacrifice!', { autoClose: 3500 })
                    }
                    return false
                }

                const { success, newBoard } = executeHopliteSacrifice(board, pos)
                if (!success) {
                    if (!isOnline) {
                        toast.error('❌ Sacrifice failed! Please try again.', { autoClose: 2000 })
                    }
                    return false
                }

                const revivablePieces = getRevivablePieces(currentPlayer, capturedPieces)

                if (!isOnline) {
                    toast.success('⚔️ Hoplite sacrificed! A modal will appear - select one of your captured pieces to revive.', { autoClose: 5000 })
                } else {
                    toast.info('⚔️ Hoplite sacrificed! Now select a captured piece to revive from the modal.', { autoClose: 4000 })
                }

                set({
                    gameState: {
                        ...gameState,
                        board: newBoard
                    },
                    mysteryBoxState: {
                        ...mysteryBoxState,
                        phase: MysteryBoxPhases.WAITING_REVIVE_FIGURE,
                        firstFigurePosition: pos,
                        revivablePieces
                    }
                })
                return false
            }

            if (phase === MysteryBoxPhases.WAITING_REVIVE_PLACEMENT && selectedRevivePiece && firstFigurePosition) {
                if (selectedRevivePiece.chariotHeldBy) return false

                if (board[pos.row][pos.col] !== null) {
                    if (!isOnline) {
                        toast.warning('❌ Invalid Placement - You must select an EMPTY tile to place the revived piece!', { autoClose: 3000 })
                    }
                    return false
                }

                const { success, newBoard } = executeRevivePiece(board, selectedRevivePiece, pos)
                if (!success) {
                    if (!isOnline) {
                        toast.error('❌ Revival failed! Please try again.', { autoClose: 2000 })
                    }
                    return false
                }

                const newCaptured = { ...capturedPieces }
                newCaptured[currentPlayer] = newCaptured[currentPlayer].filter(
                    p => !(p.id === selectedRevivePiece.id && p.type === selectedRevivePiece.type && p.color === selectedRevivePiece.color)
                )

                if (!isOnline) {
                    toast.success('🎉 Enemy piece revived as yours! Your turn is complete.', { autoClose: 3000 })
                }

                const nextPlayer = currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
                const { gameOver, winner } = checkGameOver(newBoard, nextPlayer, boardSize)

                const reviveMove = {
                    from: firstFigurePosition,
                    to: pos,
                    piece: { ...selectedRevivePiece, color: currentPlayer },
                    revivedPiece: selectedRevivePiece,
                    isMysteryBoxRevive: true,
                }

                set({
                    gameState: {
                        ...gameState,
                        board: newBoard,
                        currentPlayer: nextPlayer,
                        capturedPieces: newCaptured,
                        moveHistory: [...gameState.moveHistory, reviveMove],
                        lastMove: reviveMove,
                        gameOver,
                        winner,
                        nightMode: getNightModeFromBoard(newBoard)
                    },
                    mysteryBoxState: getInitialMysteryBoxState()
                })
                return true
            }
        }

        if (option === MysteryBoxOptions.OBSTACLE_SWAP && diceRoll) {
            if (phase === MysteryBoxPhases.WAITING_OBSTACLE_SELECTION) {
                if (!isSelectableObstacle(board, pos)) {
                    if (!isOnline) {
                        toast.warning('❌ Invalid Selection - You can select any OBSTACLE except Mystery Boxes (❓)!', { autoClose: 3500 })
                    }
                    return false
                }
                if (isPositionInList(pos, selectedObstacles)) {
                    const newSelectedObstacles = selectedObstacles.filter(p => p.row !== pos.row || p.col !== pos.col)
                    if (!isOnline) {
                        toast.info(`🔄 Obstacle deselected. ${newSelectedObstacles.length}/${diceRoll} obstacles selected.`, { autoClose: 2500 })
                    }
                    set({
                        mysteryBoxState: {
                            ...mysteryBoxState,
                            selectedObstacles: newSelectedObstacles
                        }
                    })
                    return false
                }

                if (selectedObstacles.length >= diceRoll) {
                    if (!isOnline) {
                        toast.warning(`❌ Maximum ${diceRoll} obstacles already selected! Deselect one first or proceed to empty tile selection.`, { autoClose: 3500 })
                    }
                    return false
                }

                const newSelectedObstacles = [...selectedObstacles, pos]

                if (newSelectedObstacles.length === diceRoll) {
                    if (!isOnline) {
                        toast.success(`✅ Selected ${diceRoll}/${diceRoll} obstacles! Now click on ${diceRoll} EMPTY tiles where you want to move these obstacles.`, { autoClose: 5000 })
                    } else {
                        toast.info(`🎯 Now select ${diceRoll} empty tile(s) to swap the obstacles to!`, { autoClose: 4000 })
                    }
                    set({
                        mysteryBoxState: {
                            ...mysteryBoxState,
                            selectedObstacles: newSelectedObstacles,
                            phase: MysteryBoxPhases.WAITING_EMPTY_TILE_SELECTION
                        }
                    })
                } else {
                    if (!isOnline) {
                        toast.info(`📍 Obstacle selected! ${newSelectedObstacles.length}/${diceRoll} selected. Select ${diceRoll - newSelectedObstacles.length} more obstacle(s).`, { autoClose: 3000 })
                    }
                    set({
                        mysteryBoxState: {
                            ...mysteryBoxState,
                            selectedObstacles: newSelectedObstacles
                        }
                    })
                }
                return false
            }

            if (phase === MysteryBoxPhases.WAITING_EMPTY_TILE_SELECTION) {
                if (board[pos.row][pos.col] !== null) {
                    if (!isOnline) {
                        toast.warning('❌ Invalid Selection - You must select EMPTY tiles (no pieces or obstacles)!', { autoClose: 3000 })
                    }
                    return false
                }
                if (!isObstacleSwapPlacementAllowed(board, pos)) {
                    if (!isOnline) {
                        toast.warning('❌ Invalid Selection - The 3rd row from each side is disabled for obstacle placement.', { autoClose: 3000 })
                    }
                    return false
                }
                if (isPositionInList(pos, selectedEmptyTiles)) {
                    const newSelectedEmptyTiles = selectedEmptyTiles.filter(p => p.row !== pos.row || p.col !== pos.col)
                    if (!isOnline) {
                        toast.info(`🔄 Empty tile deselected. ${newSelectedEmptyTiles.length}/${selectedObstacles.length} selected.`, { autoClose: 2500 })
                    }
                    set({
                        mysteryBoxState: {
                            ...mysteryBoxState,
                            selectedEmptyTiles: newSelectedEmptyTiles
                        }
                    })
                    return false
                }

                if (selectedEmptyTiles.length >= selectedObstacles.length) {
                    if (!isOnline) {
                        toast.warning(`❌ Maximum ${selectedObstacles.length} empty tiles already selected! Deselect one first.`, { autoClose: 3000 })
                    }
                    return false
                }

                const newSelectedEmptyTiles = [...selectedEmptyTiles, pos]

                if (newSelectedEmptyTiles.length === selectedObstacles.length) {
                    const { success, newBoard } = executeObstacleSwap(board, selectedObstacles, newSelectedEmptyTiles)
                    if (!success) {
                        if (!isOnline) {
                            toast.error('❌ Obstacle swap failed! Please try again.', { autoClose: 2000 })
                        }
                        return false
                    }

                    if (!isOnline) {
                        toast.success('🎉 Obstacles swapped with empty tiles! Your turn is complete.', { autoClose: 3000 })
                    }

                    const nextPlayer = currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
                    const { gameOver, winner } = checkGameOver(newBoard, nextPlayer, boardSize)

                    set({
                        gameState: {
                            ...gameState,
                            board: newBoard,
                            currentPlayer: nextPlayer,
                            gameOver,
                            winner,
                            nightMode: getNightModeFromBoard(newBoard)
                        },
                        mysteryBoxState: getInitialMysteryBoxState()
                    })
                    return true
                } else {
                    if (!isOnline) {
                        toast.info(`📍 Empty tile selected! ${newSelectedEmptyTiles.length}/${selectedObstacles.length} selected. Select ${selectedObstacles.length - newSelectedEmptyTiles.length} more.`, { autoClose: 3000 })
                    }
                    set({
                        mysteryBoxState: {
                            ...mysteryBoxState,
                            selectedEmptyTiles: newSelectedEmptyTiles
                        }
                    })
                }
                return false
            }
        }

        return false
    },

    selectRevivePiece: (piece: Piece, isOnline = false) => {
        const { mysteryBoxState } = get()
        if (!mysteryBoxState.isActive) return
        if (mysteryBoxState.phase !== MysteryBoxPhases.WAITING_REVIVE_FIGURE) return

        if (!isOnline) {
            toast.info(`✅ Piece selected! Now click on an EMPTY tile on the board to place your revived ${piece.type}.`, { autoClose: 4000 })
        } else {
            toast.info('📍 Now click on an empty tile to place the revived piece!', { autoClose: 4000 })
        }

        set({
            mysteryBoxState: {
                ...mysteryBoxState,
                phase: MysteryBoxPhases.WAITING_REVIVE_PLACEMENT,
                selectedRevivePiece: piece
            }
        })
    },

    confirmObstacleSelection: () => {
        const { mysteryBoxState } = get()
        if (!mysteryBoxState.isActive) return
        if (mysteryBoxState.phase !== MysteryBoxPhases.WAITING_OBSTACLE_SELECTION) return
        if (mysteryBoxState.selectedObstacles.length === 0) return

        set({
            mysteryBoxState: {
                ...mysteryBoxState,
                phase: MysteryBoxPhases.WAITING_EMPTY_TILE_SELECTION
            }
        })
    },

    cancelMysteryBox: () => {
        toast.info('❌ Mystery Box action cancelled.', { autoClose: 2000 })
        set({
            mysteryBoxState: getInitialMysteryBoxState()
        })
    },

    resetMysteryBoxState: () => {
        set({
            mysteryBoxState: getInitialMysteryBoxState()
        })
    },

    setGameSession: (session: GameSession) => {
        set({ gameSession: session, error: null })
    },

    setCurrentPlayerId: (playerId: string) => {
        set({ currentPlayerId: playerId })
    },

    initializeBoard: () => {
        const { gameSession } = get()
        if (!gameSession || !gameSession.gameState) return

        set({
            gameState: {
                board: gameSession.gameState.board,
                boardSize: gameSession.boardSize,
                currentPlayer: gameSession.gameState.currentPlayer,
                selectedPosition: null,
                validMoves: [],
                validAttacks: [],
                validSwaps: [],
                moveHistory: gameSession.gameState.moveHistory || [],
                capturedPieces: gameSession.gameState.capturedPieces || { white: [], black: [] },
                lastMove: gameSession.gameState.lastMove || null,
                gameOver: gameSession.gameState.gameOver || false,
                winner: gameSession.gameState.winner || null,
                narcs: gameSession.gameState.narcs || [],
                nightMode: gameSession.gameState.nightMode ?? getNightModeFromBoard(gameSession.gameState.board)
            }
        })
    },

    syncFromServer: (session: GameSession) => {
        if (!session.gameState) return

        set({
            gameSession: session,
            gameState: {
                board: session.gameState.board,
                boardSize: session.boardSize,
                currentPlayer: session.gameState.currentPlayer,
                selectedPosition: null,
                validMoves: [],
                validAttacks: [],
                validSwaps: [],
                moveHistory: session.gameState.moveHistory || [],
                capturedPieces: session.gameState.capturedPieces || { white: [], black: [] },
                lastMove: session.gameState.lastMove || null,
                gameOver: session.gameState.gameOver || false,
                winner: session.gameState.winner || null,
                narcs: session.gameState.narcs || [],
                nightMode: session.gameState.nightMode ?? getNightModeFromBoard(session.gameState.board)
            },
            selectedPosition: null,
            validMoves: [],
            validAttacks: [],
            validSwaps: [],
            attackMode: 'ranged',
            necromancerActionMode: 'move'
        })
    },

    setLoading: (loading: boolean) => {
        set({ isLoading: loading })
    },

    setError: (error: string | null) => {
        set({ error })
    },

    reset: () => {
        set({
            gameSession: null,
            currentPlayerId: null,
            isLoading: false,
            error: null,
            selectedPosition: null,
            validMoves: [],
            validAttacks: [],
            validSwaps: [],
            mysteryBoxState: getInitialMysteryBoxState(),
            attackMode: 'ranged',
            necromancerActionMode: 'move',
            botEnabled: false,
            botThinking: false,
        })
    },
    reviveZombie: (payload) => {
        const { gameState, history, botEnabled } = get()
        if (botEnabled && gameState.currentPlayer === PlayerColors.BLACK) return false
        if (gameState.gameOver) return false

        const { necromancerPosition, revivePiece, target } = payload
        const board = gameState.board
        const boardSize = gameState.boardSize
        const currentPlayer = gameState.currentPlayer

        if (!areRevivalGuardsInPlace(board, boardSize, currentPlayer)) {
            toast.error(ZOMBIE_REVIVE_ALIGNMENT_HINT, { autoClose: 3000 })
            return false
        }

        const targetCell = board[target.row][target.col]
        if (targetCell !== null) return false

        const eligiblePieces = filterZombieRevivablePieces([revivePiece])
        if (eligiblePieces.length === 0) return false

        const available = gameState.capturedPieces[currentPlayer] || []
        const match = available.find(p => p.id === revivePiece.id && p.type === revivePiece.type && p.color === revivePiece.color)
        if (!match || match.chariotHeldBy) return false

        const necromancerCell = board[necromancerPosition.row][necromancerPosition.col]
        if (!necromancerCell || !isPiece(necromancerCell)) return false
        if (necromancerCell.type !== PieceTypes.NECROMANCER || necromancerCell.color !== currentPlayer) return false

        const newBoard = reviveZombiePiece(board, necromancerPosition, match, target, currentPlayer)
        const newCaptured = { ...gameState.capturedPieces }
        newCaptured[currentPlayer] = newCaptured[currentPlayer].filter(
            p => !(p.id === match.id && p.type === match.type && p.color === match.color)
        )

        const nextPlayer = currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
        const { gameOver, winner } = checkGameOver(newBoard, nextPlayer, boardSize)
        const newHistory = [...history, { gameState }]

        const reviveMove = {
            from: necromancerPosition,
            to: target,
            piece: necromancerCell,
            revivedPiece: match,
            isZombieRevive: true,
        }

        set({
            gameState: {
                ...gameState,
                board: newBoard,
                currentPlayer: nextPlayer,
                selectedPosition: null,
                validMoves: [],
                validAttacks: [],
                validSwaps: [],
                moveHistory: [...gameState.moveHistory, reviveMove],
                lastMove: reviveMove,
                capturedPieces: newCaptured,
                gameOver,
                winner,
                nightMode: getNightModeFromBoard(newBoard)
            },
            history: newHistory,
            attackMode: 'ranged',
            necromancerActionMode: 'move'
        })

        return true
    },

    getCurrentPlayer: () => {
        const { gameSession, currentPlayerId } = get()
        if (!gameSession || !currentPlayerId) return undefined
        return gameSession.players.find(p => p.id === currentPlayerId)
    },

    getCurrentTurnPlayer: () => {
        const { gameSession, gameState } = get()
        if (!gameSession || !gameState) return undefined
        return gameSession.players.find(p => p.color === gameState.currentPlayer)
    },

    isMyTurn: () => {
        const { gameSession, gameState, currentPlayerId } = get()
        if (!gameSession || !gameState || !currentPlayerId) return false
        const myPlayer = gameSession.players.find(p => p.id === currentPlayerId)
        if (!myPlayer) return false
        return myPlayer.color === gameState.currentPlayer
    },

    getGameStateForSync: () => {
        const { gameState } = get()
        return gameState
    }
}))

export const useBotEffect = () => {
    const { botEnabled, botDifficulty, gameState, processBotMove } = useGameStore()
    return { botEnabled, botDifficulty, gameState, processBotMove }
}
