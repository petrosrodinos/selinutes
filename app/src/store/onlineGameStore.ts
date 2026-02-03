import { create } from 'zustand'
import type { Position, GameState, PlayerColor, SwapTarget, MysteryBoxState, Piece } from '../pages/Game/types'
import { isPiece, isObstacle, PlayerColors, PieceTypes, MysteryBoxOptions, MysteryBoxPhases, ObstacleTypes } from '../pages/Game/types'
import type { GameSession, Player } from '../features/game/interfaces'
import {
    getValidMoves,
    getValidAttacks,
    makeMove,
    isMonarchCaptured,
    hasLegalMoves,
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
    isSelectableObstacle,
    isPositionInList
} from '../pages/Game/utils'

interface MysteryBoxTriggerResult {
    triggered: boolean
    option: number | null
    diceRoll: number | null
    optionName: string | null
}

interface OnlineGameStore {
    gameSession: GameSession | null
    gameState: GameState | null
    currentPlayerId: string | null
    selectedPosition: Position | null
    validMoves: Position[]
    validAttacks: Position[]
    validSwaps: SwapTarget[]
    mysteryBoxState: MysteryBoxState
    isLoading: boolean
    error: string | null

    setGameSession: (session: GameSession) => void
    setCurrentPlayerId: (playerId: string) => void
    initializeBoard: () => void
    selectSquare: (pos: Position) => MysteryBoxTriggerResult | boolean
    syncFromServer: (session: GameSession) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    reset: () => void

    getCurrentPlayer: () => Player | undefined
    getCurrentTurnPlayer: () => Player | undefined
    isMyTurn: () => boolean
    getGameStateForSync: () => GameState | null

    handleMysteryBoxSelection: (pos: Position) => boolean
    selectRevivePiece: (piece: Piece) => void
    confirmObstacleSelection: () => void
    cancelMysteryBox: () => void
    resetMysteryBoxState: () => void
}

const initialState = {
    gameSession: null,
    gameState: null,
    currentPlayerId: null,
    selectedPosition: null,
    validMoves: [] as Position[],
    validAttacks: [] as Position[],
    validSwaps: [] as SwapTarget[],
    mysteryBoxState: getInitialMysteryBoxState(),
    isLoading: false,
    error: null
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

export const useOnlineGameStore = create<OnlineGameStore>((set, get) => ({
    ...initialState,

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
                narcs: gameSession.gameState.narcs || []
            }
        })
    },

    selectSquare: (pos: Position): MysteryBoxTriggerResult | boolean => {
        const { gameSession, gameState, currentPlayerId, selectedPosition, validMoves, validAttacks, validSwaps, mysteryBoxState } = get()

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
                            winner
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
                    const { newBoard: movedBoard, move, newNarcs } = makeMove(
                        boardWithoutMysteryBox,
                        selectedPosition,
                        pos,
                        boardSize,
                        false,
                        gameState.narcs
                    )

                    const newCaptured = { ...gameState.capturedPieces }
                    if (move.captured) {
                        if (move.captured.color === PlayerColors.WHITE) {
                            newCaptured.white = [...newCaptured.white, move.captured]
                        } else {
                            newCaptured.black = [...newCaptured.black, move.captured]
                        }
                    }

                    const revivablePieces = option === MysteryBoxOptions.HOPLITE_SACRIFICE_REVIVE
                        ? getRevivablePieces(gameState.currentPlayer, newCaptured)
                        : []

                    set({
                        gameState: {
                            ...gameState,
                            board: movedBoard,
                            selectedPosition: null,
                            validMoves: [],
                            validAttacks: [],
                            validSwaps: [],
                            moveHistory: [...gameState.moveHistory, move],
                            capturedPieces: newCaptured,
                            lastMove: move,
                            narcs: newNarcs
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

                const { newBoard, move, newNarcs } = makeMove(
                    board,
                    selectedPosition,
                    pos,
                    boardSize,
                    isValidAttackTarget,
                    gameState.narcs
                )

                const nextPlayer = gameState.currentPlayer === PlayerColors.WHITE
                    ? PlayerColors.BLACK
                    : PlayerColors.WHITE
                const { gameOver, winner } = checkGameOver(newBoard, nextPlayer, boardSize)

                const newCaptured = { ...gameState.capturedPieces }
                if (move.captured) {
                    if (move.captured.color === PlayerColors.WHITE) {
                        newCaptured.white = [...newCaptured.white, move.captured]
                    } else {
                        newCaptured.black = [...newCaptured.black, move.captured]
                    }
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
                        moveHistory: [...gameState.moveHistory, move],
                        capturedPieces: newCaptured,
                        lastMove: move,
                        gameOver,
                        winner,
                        narcs: newNarcs
                    },
                    selectedPosition: null,
                    validMoves: [],
                    validAttacks: [],
                    validSwaps: []
                })

                return true
            }

            if (cell && isPiece(cell) && cell.color === myPlayer.color) {
                const moves = getValidMoves(board, pos, boardSize)
                const attacks = getValidAttacks(board, pos, boardSize)
                const swaps: SwapTarget[] = cell.type === PieceTypes.WARLOCK
                    ? getValidSwapTargets(board, pos).map(s => ({
                        position: s.position,
                        swapType: s.swapType
                    }))
                    : []
                set({
                    selectedPosition: pos,
                    validMoves: moves,
                    validAttacks: attacks,
                    validSwaps: swaps
                })
                return false
            }

            set({
                selectedPosition: null,
                validMoves: [],
                validAttacks: [],
                validSwaps: []
            })
            return false
        }

        if (cell && isPiece(cell) && cell.color === myPlayer.color) {
            const moves = getValidMoves(board, pos, boardSize)
            const attacks = getValidAttacks(board, pos, boardSize)
            const swaps: SwapTarget[] = cell.type === PieceTypes.WARLOCK
                ? getValidSwapTargets(board, pos).map(s => ({
                    position: s.position,
                    swapType: s.swapType
                }))
                : []
            set({
                selectedPosition: pos,
                validMoves: moves,
                validAttacks: attacks,
                validSwaps: swaps
            })
        }

        return false
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
                narcs: session.gameState.narcs || []
            },
            selectedPosition: null,
            validMoves: [],
            validAttacks: [],
            validSwaps: []
        })
    },

    setLoading: (loading: boolean) => {
        set({ isLoading: loading })
    },

    setError: (error: string | null) => {
        set({ error })
    },

    reset: () => {
        set(initialState)
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
    },

    handleMysteryBoxSelection: (pos: Position): boolean => {
        const { gameState, mysteryBoxState } = get()
        console.log('🔍 handleMysteryBoxSelection called:', { pos, isActive: mysteryBoxState.isActive, hasGameState: !!gameState })
        if (!mysteryBoxState.isActive || !gameState) return false

        const { board, boardSize, capturedPieces, currentPlayer } = gameState
        const { option, phase, diceRoll, firstFigurePosition, selectedObstacles, selectedEmptyTiles, selectedRevivePiece } = mysteryBoxState
        console.log('🔍 Mystery Box State:', { option, phase, diceRoll, selectedObstacles: selectedObstacles.length })

        if (option === MysteryBoxOptions.FIGURE_SWAP) {
            if (phase === MysteryBoxPhases.WAITING_FIRST_FIGURE) {
                const cell = board[pos.row][pos.col]
                if (!cell || !isPiece(cell) || cell.color !== currentPlayer) {
                    return false
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
                    return false
                }
                if (pos.row === firstFigurePosition.row && pos.col === firstFigurePosition.col) {
                    return false
                }

                const { success, newBoard } = executeFigureSwap(board, firstFigurePosition, pos)
                if (!success) return false

                const nextPlayer = currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
                const { gameOver, winner } = checkGameOver(newBoard, nextPlayer, boardSize)

                set({
                    gameState: {
                        ...gameState,
                        board: newBoard,
                        currentPlayer: nextPlayer,
                        gameOver,
                        winner
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
                    return false
                }

                const { success, newBoard } = executeHopliteSacrifice(board, pos)
                if (!success) return false

                const revivablePieces = getRevivablePieces(currentPlayer, capturedPieces)

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
                if (board[pos.row][pos.col] !== null) {
                    return false
                }

                const { success, newBoard } = executeRevivePiece(board, selectedRevivePiece, pos)
                if (!success) return false

                const newCaptured = { ...capturedPieces }
                const opponentColor = currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE

                newCaptured[opponentColor] = newCaptured[opponentColor].filter(
                    p => !(p.id === selectedRevivePiece.id && p.type === selectedRevivePiece.type && p.color === selectedRevivePiece.color)
                )

                const nextPlayer = currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
                const { gameOver, winner } = checkGameOver(newBoard, nextPlayer, boardSize)

                set({
                    gameState: {
                        ...gameState,
                        board: newBoard,
                        currentPlayer: nextPlayer,
                        capturedPieces: newCaptured,
                        gameOver,
                        winner
                    },
                    mysteryBoxState: getInitialMysteryBoxState()
                })
                return true
            }
        }

        if (option === MysteryBoxOptions.OBSTACLE_SWAP && diceRoll) {
            console.log('🎲 Obstacle Swap option detected, diceRoll:', diceRoll)
            if (phase === MysteryBoxPhases.WAITING_OBSTACLE_SELECTION) {
                console.log('🎲 In WAITING_OBSTACLE_SELECTION phase')
                const isSelectable = isSelectableObstacle(board, pos)
                console.log('🎲 isSelectableObstacle:', isSelectable, 'at pos:', pos)
                if (!isSelectable) {
                    return false
                }
                if (isPositionInList(pos, selectedObstacles)) {
                    const newSelectedObstacles = selectedObstacles.filter(p => p.row !== pos.row || p.col !== pos.col)
                    set({
                        mysteryBoxState: {
                            ...mysteryBoxState,
                            selectedObstacles: newSelectedObstacles
                        }
                    })
                    return false
                }

                if (selectedObstacles.length >= diceRoll) {
                    return false
                }

                const newSelectedObstacles = [...selectedObstacles, pos]

                if (newSelectedObstacles.length === diceRoll) {
                    set({
                        mysteryBoxState: {
                            ...mysteryBoxState,
                            selectedObstacles: newSelectedObstacles,
                            phase: MysteryBoxPhases.WAITING_EMPTY_TILE_SELECTION
                        }
                    })
                } else {
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
                    return false
                }
                if (isPositionInList(pos, selectedEmptyTiles)) {
                    const newSelectedEmptyTiles = selectedEmptyTiles.filter(p => p.row !== pos.row || p.col !== pos.col)
                    set({
                        mysteryBoxState: {
                            ...mysteryBoxState,
                            selectedEmptyTiles: newSelectedEmptyTiles
                        }
                    })
                    return false
                }

                if (selectedEmptyTiles.length >= selectedObstacles.length) {
                    return false
                }

                const newSelectedEmptyTiles = [...selectedEmptyTiles, pos]

                if (newSelectedEmptyTiles.length === selectedObstacles.length) {
                    const { success, newBoard } = executeObstacleSwap(board, selectedObstacles, newSelectedEmptyTiles)
                    if (!success) return false

                    const nextPlayer = currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
                    const { gameOver, winner } = checkGameOver(newBoard, nextPlayer, boardSize)

                    set({
                        gameState: {
                            ...gameState,
                            board: newBoard,
                            currentPlayer: nextPlayer,
                            gameOver,
                            winner
                        },
                        mysteryBoxState: getInitialMysteryBoxState()
                    })
                    return true
                } else {
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

    selectRevivePiece: (piece: Piece) => {
        const { mysteryBoxState } = get()
        if (!mysteryBoxState.isActive) return
        if (mysteryBoxState.phase !== MysteryBoxPhases.WAITING_REVIVE_FIGURE) return

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
        set({
            mysteryBoxState: getInitialMysteryBoxState()
        })
    },

    resetMysteryBoxState: () => {
        set({
            mysteryBoxState: getInitialMysteryBoxState()
        })
    }
}))
