import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { generateFiles, generateRanks } from '../../constants'
import { Square } from '../Square'
import { AnimatedPiece } from '../Piece/AnimatedPiece'
import { useGameStore } from '../../../../store/gameStore'
import { useUIStore } from '../../../../store/uiStore'
import { useIsAdmin } from '../../../../hooks'
import { getValidMoves, getValidAttacks, getAllNarcNetPositions, getDisplayedMoveTargets, getDisplayedAttackTargets } from '../../utils'
import { isPiece } from '../../types'
import type { Board as BoardType, BoardSize, Position, Move, SwapTarget, MysteryBoxState } from '../../types'

/** Rank/file label width/height for a given square size (must stay in sync with layout). */
const boardLabelInsetPx = (squareSize: number) => Math.max(16, Math.round(squareSize * 0.45))

interface BoardProps {
    isOnline?: boolean
    attackMode?: 'ranged' | 'capture'
    onlineBoard?: BoardType
    onlineBoardSize?: BoardSize
    onlineSelectedPosition?: Position | null
    onlineValidMoves?: Position[]
    onlineValidAttacks?: Position[]
    onlineValidSwaps?: SwapTarget[]
    onlineLastMove?: Move | null
    onlineMysteryBoxState?: MysteryBoxState
    onSquareClick?: (pos: Position) => void
    onMysteryBoxClick?: () => void
}

export const Board = ({
    isOnline = false,
    attackMode: attackModeProp,
    onlineBoard,
    onlineBoardSize,
    onlineSelectedPosition,
    onlineValidMoves = [],
    onlineValidAttacks = [],
    onlineValidSwaps = [],
    onlineLastMove,
    onlineMysteryBoxState,
    onSquareClick,
    onMysteryBoxClick
}: BoardProps) => {
    const { gameState, hintMove, devModeSelectSquare, devModeSelected, mysteryBoxState: offlineMysteryBoxState, handleMysteryBoxSelection } = useGameStore()
    const attackModeFromStore = useGameStore(state => state.attackMode)
    const attackMode = attackModeProp ?? attackModeFromStore
    const { helpEnabled, devMode } = useUIStore()
    const isAdmin = useIsAdmin()
    const effectiveDevMode = devMode && isAdmin
    
    const mysteryBoxState = isOnline && onlineMysteryBoxState ? onlineMysteryBoxState : offlineMysteryBoxState

    const board = isOnline && onlineBoard ? onlineBoard : gameState.board
    const boardSize = isOnline && onlineBoardSize ? onlineBoardSize : gameState.boardSize
    const selectedPosition = (isOnline ? onlineSelectedPosition : gameState.selectedPosition) ?? null
    const validMoves = isOnline ? onlineValidMoves : gameState.validMoves
    const validAttacks = isOnline ? onlineValidAttacks : gameState.validAttacks
    const validSwaps = isOnline ? onlineValidSwaps : gameState.validSwaps
    const lastMove = gameState.lastMove ?? onlineLastMove ?? null
    const currentHintMove = isOnline ? null : hintMove
    const selectedCell = selectedPosition ? board[selectedPosition.row]?.[selectedPosition.col] : null
    const selectedPiece = selectedCell && isPiece(selectedCell) ? selectedCell : null
    const displayedValidMoves = useMemo(
        () => getDisplayedMoveTargets(board, validMoves, selectedPiece),
        [board, validMoves, selectedPiece]
    )
    const displayedValidAttacks = useMemo(
        () => getDisplayedAttackTargets(board, validMoves, validAttacks, selectedPiece, selectedPosition, attackMode, boardSize),
        [board, validMoves, validAttacks, selectedPiece, selectedPosition, attackMode, boardSize]
    )

    const narcNetPositions = useMemo(() => {
        if (!board || board.length === 0) return []
        return getAllNarcNetPositions(board, boardSize)
    }, [board, boardSize])

    const [helpPosition, setHelpPosition] = useState<{ row: number; col: number } | null>(null)
    const helpMoves = helpPosition && helpEnabled && !isOnline
        ? getValidMoves(board, helpPosition, boardSize)
        : []
    const helpAttacks = helpPosition && helpEnabled && !isOnline
        ? getValidAttacks(board, helpPosition, boardSize)
        : []

    const files = generateFiles(boardSize.cols)
    const ranks = generateRanks(boardSize.rows)
    const [viewportWidth, setViewportWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1280
    )

    useEffect(() => {
        if (typeof window === 'undefined') return

        const handleResize = () => setViewportWidth(window.innerWidth)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const squareSize = useMemo(() => {
        const isXs = viewportWidth < 390
        // Game page horizontal padding (e.g. p-2) plus a little buffer for safe area / scrollbar
        const pageHorizontalPadding = viewportWidth < 640 ? 20 : 40
        const safeBuffer = isXs ? 6 : 0
        const innerWidth = Math.max(0, viewportWidth - pageHorizontalPadding - safeBuffer)
        const cols = boardSize.cols
        const borderReserve = 4 // matches border-2 on the grid wrapper
        const maxSq = 48

        for (let sq = maxSq; sq >= 12; sq--) {
            const rankW = boardLabelInsetPx(sq)
            const totalWidth = cols * sq + 2 * rankW + borderReserve
            if (totalWidth <= innerWidth) {
                return sq
            }
        }

        return 12
    }, [viewportWidth, boardSize.cols])

    const rankLabelWidth = boardLabelInsetPx(squareSize)
    const fileLabelHeight = boardLabelInsetPx(squareSize)

    const isSelected = (row: number, col: number) => {
        if (!isOnline && effectiveDevMode && devModeSelected) {
            return devModeSelected.row === row && devModeSelected.col === col
        }
        return selectedPosition?.row === row && selectedPosition?.col === col
    }

    const isDevModeTarget = (row: number, col: number) => {
        if (isOnline || !effectiveDevMode || !devModeSelected) return false
        const cell = board[row][col]
        return cell === null
    }

    const isValidMove = (row: number, col: number) =>
        displayedValidMoves.some(m => m.row === row && m.col === col)

    const isValidAttack = (row: number, col: number) =>
        displayedValidAttacks.some(a => a.row === row && a.col === col)

    const isValidSwap = (row: number, col: number) =>
        validSwaps.some(s => s.position.row === row && s.position.col === col)

    const isPreviousMoveFromSquare = (row: number, col: number) =>
        lastMove != null &&
        lastMove.from.row === row &&
        lastMove.from.col === col

    const isLastKillSquare = (row: number, col: number) =>
        lastMove != null &&
        lastMove.captured != null &&
        lastMove.to.row === row &&
        lastMove.to.col === col

    const isHint = (row: number, col: number) =>
        currentHintMove !== null && !currentHintMove.isAttack &&
        ((currentHintMove.from.row === row && currentHintMove.from.col === col) ||
            (currentHintMove.to.row === row && currentHintMove.to.col === col))

    const isHintAttack = (row: number, col: number) =>
        currentHintMove !== null && currentHintMove.isAttack === true &&
        ((currentHintMove.from.row === row && currentHintMove.from.col === col) ||
            (currentHintMove.to.row === row && currentHintMove.to.col === col))

    const isHelpMove = (row: number, col: number) =>
        !isOnline && helpEnabled && helpMoves.some(m => m.row === row && m.col === col)

    const isHelpAttack = (row: number, col: number) =>
        !isOnline && helpEnabled && helpAttacks.some(a => a.row === row && a.col === col)

    const getNarcOwner = (row: number, col: number) => {
        const narcNet = narcNetPositions.find(n => n.position.row === row && n.position.col === col)
        return narcNet ? narcNet.ownerColor : null
    }

    const isMysteryBoxSelectedObstacle = (row: number, col: number) => {
        if (!mysteryBoxState.isActive) return false
        return mysteryBoxState.selectedObstacles.some(p => p.row === row && p.col === col)
    }

    const isMysteryBoxSelectedEmptyTile = (row: number, col: number) => {
        if (!mysteryBoxState.isActive) return false
        return mysteryBoxState.selectedEmptyTiles.some(p => p.row === row && p.col === col)
    }

    const isMysteryBoxSelectedFigure = (row: number, col: number) => {
        if (!mysteryBoxState.isActive) return false
        if (!mysteryBoxState.firstFigurePosition) return false
        return mysteryBoxState.firstFigurePosition.row === row && mysteryBoxState.firstFigurePosition.col === col
    }

    const handleSquareClick = (row: number, col: number) => {
        if (onSquareClick) {
            if (!isOnline && offlineMysteryBoxState.isActive) {
                onMysteryBoxClick?.()
                handleMysteryBoxSelection({ row, col }, false)
                return
            }
            
            if (!isOnline && effectiveDevMode) {
                devModeSelectSquare({ row, col })
                return
            }
            
            if (!isOnline && helpEnabled) {
                const cell = board[row][col]
                if (cell && isPiece(cell)) {
                    setHelpPosition({ row, col })
                } else {
                    setHelpPosition(null)
                }
            }
            
            onSquareClick({ row, col })
            return
        }
    }

    if (!board || board.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-amber-200 text-lg">Loading board...</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center overflow-x-auto overflow-y-hidden max-w-full">
            <div className="flex">
                <div style={{ width: rankLabelWidth }} />
                {files.map(file => (
                    <div
                        key={file}
                        className="flex items-center justify-center font-mono text-xs text-amber-100/95"
                        style={{ width: squareSize, height: fileLabelHeight }}
                    >
                        {file}
                    </div>
                ))}
            </div>

            <div className="flex">
                <div className="flex flex-col">
                    {ranks.map(rank => (
                        <div
                            key={rank}
                            className="flex items-center justify-center font-mono text-xs text-amber-100/95"
                            style={{ width: rankLabelWidth, height: squareSize }}
                        >
                            {rank}
                        </div>
                    ))}
                </div>

                <div className="border-2 border-stone-800 rounded shadow-2xl relative">
                    {board.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex">
                            {row.map((cell, colIndex) => (
<Square
                                                    key={`${rowIndex}-${colIndex}`}
                                                    cell={cell}
                                                    squareSize={squareSize}
                                                    position={{ row: rowIndex, col: colIndex }}
                                                    isSelected={isSelected(rowIndex, colIndex) || (!isOnline && helpEnabled && helpPosition?.row === rowIndex && helpPosition?.col === colIndex)}
                                                    isValidMove={isValidMove(rowIndex, colIndex) || isHelpMove(rowIndex, colIndex) || isDevModeTarget(rowIndex, colIndex)}
                                                    isValidAttack={isValidAttack(rowIndex, colIndex) || isHelpAttack(rowIndex, colIndex)}
                                                    isValidSwap={isValidSwap(rowIndex, colIndex)}
                                                    isPreviousMoveFrom={isPreviousMoveFromSquare(rowIndex, colIndex)}
                                                    isLastKillSquare={isLastKillSquare(rowIndex, colIndex)}
                                                    isHint={isHint(rowIndex, colIndex)}
                                                    isHintAttack={isHintAttack(rowIndex, colIndex)}
                                                    hasNarc={getNarcOwner(rowIndex, colIndex)}
                                                    isMysteryBoxSelectedObstacle={isMysteryBoxSelectedObstacle(rowIndex, colIndex)}
                                                    isMysteryBoxSelectedEmptyTile={isMysteryBoxSelectedEmptyTile(rowIndex, colIndex)}
                                                    isMysteryBoxSelectedFigure={isMysteryBoxSelectedFigure(rowIndex, colIndex)}
                                                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                                                />
                            ))}
                        </div>
                    ))}
                    <AnimatePresence>
                        {board.map((row, rowIndex) =>
                            row.map((c, colIndex) => {
                                if (c && isPiece(c)) {
                                    return (
                                        <AnimatedPiece
                                            key={c.id}
                                            piece={c}
                                            position={{ row: rowIndex, col: colIndex }}
                                            squareSize={squareSize}
                                            onClick={() => handleSquareClick(rowIndex, colIndex)}
                                        />
                                    )
                                }
                                return null
                            })
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex flex-col">
                    {ranks.map(rank => (
                        <div
                            key={rank}
                            className="flex items-center justify-center font-mono text-xs text-amber-100/95"
                            style={{ width: rankLabelWidth, height: squareSize }}
                        >
                            {rank}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex">
                <div style={{ width: rankLabelWidth }} />
                {files.map(file => (
                    <div
                        key={file}
                        className="flex items-center justify-center font-mono text-xs text-amber-100/95"
                        style={{ width: squareSize, height: fileLabelHeight }}
                    >
                        {file}
                    </div>
                ))}
            </div>
        </div>
    )
}
