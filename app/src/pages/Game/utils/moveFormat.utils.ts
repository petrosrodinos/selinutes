import type { BoardSize, GameLogEntry, Move, Position } from '../types'
import { generateFiles, PIECE_NAMES } from '../constants'

export const formatBoardSquare = (position: Position, boardSize: BoardSize): string => {
  const files = generateFiles(boardSize.cols)
  return `${files[position.col]}${boardSize.rows - position.row}`
}

export const formatMoveAction = (move: Move): string => {
  if (move.isFreeze) {
    const turns = move.freezeTurns ? ` (${move.freezeTurns} turns)` : ''
    return `Freeze${turns}`
  }
  if (move.terminatedByNarc) return 'Narc trap'
  if (move.promotedTo) return `Promoted to ${PIECE_NAMES[move.promotedTo]}`
  if (move.isAttack || move.captured) {
    return move.captured ? `Capture · ${PIECE_NAMES[move.captured.type]}` : 'Attack'
  }
  return 'Move'
}

export const formatMoveDescription = (move: Move, boardSize: BoardSize): string => {
  const from = formatBoardSquare(move.from, boardSize)
  const to = formatBoardSquare(move.to, boardSize)
  const pieceLabel = PIECE_NAMES[move.piece.type]
  const action = formatMoveAction(move)
  return `${pieceLabel} · ${from} → ${to} · ${action}`
}

export const buildGameLogs = (moveHistory: Move[], boardSize: BoardSize): GameLogEntry[] => {
  return moveHistory.map((move, index) => ({
    turn: index + 1,
    player: move.piece.color,
    description: formatMoveDescription(move, boardSize),
  }))
}
