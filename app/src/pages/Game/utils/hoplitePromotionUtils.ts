import type { Board, BoardSize, Piece, PlayerColor, Position } from '../types'
import { isPiece, PieceTypes, PlayerColors } from '../types'

export const HOPLITE_PROMOTION_MAX = 3

export const getEnemyBackRow = (color: PlayerColor, boardSize: BoardSize): number => {
  return color === PlayerColors.WHITE ? 0 : boardSize.rows - 1
}

export const isOnEnemyBackRow = (
  position: Position,
  color: PlayerColor,
  boardSize: BoardSize
): boolean => position.row === getEnemyBackRow(color, boardSize)

export const countHoplitePromotions = (
  board: Board,
  capturedPieces: { white: Piece[]; black: Piece[] }
): number => {
  let count = 0

  const countIfPromoted = (piece: Piece) => {
    if (piece.promotedFromHoplite) {
      count++
    }
  }

  for (const row of board) {
    for (const cell of row) {
      if (cell && isPiece(cell)) {
        countIfPromoted(cell)
      }
    }
  }

  for (const piece of capturedPieces.white) {
    countIfPromoted(piece)
  }
  for (const piece of capturedPieces.black) {
    countIfPromoted(piece)
  }

  return count
}

export const canPromoteHoplite = (
  piece: Piece,
  finalPosition: Position,
  boardSize: BoardSize,
  board: Board,
  capturedPieces: { white: Piece[]; black: Piece[] }
): boolean => {
  if (piece.type !== PieceTypes.HOPLITE || piece.isZombie) {
    return false
  }

  if (!isOnEnemyBackRow(finalPosition, piece.color, boardSize)) {
    return false
  }

  return countHoplitePromotions(board, capturedPieces) < HOPLITE_PROMOTION_MAX
}

export const promoteHopliteToDuchess = (piece: Piece): Piece => ({
  ...piece,
  type: PieceTypes.DUCHESS,
  promotedFromHoplite: true,
  hasMoved: true
})
