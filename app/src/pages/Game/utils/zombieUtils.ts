import type { Board, BoardSize, Piece, PieceType, PlayerColor, Position } from '../types'
import { isPiece, PieceTypes, PlayerColors } from '../types'
import { cloneBoard, getBackRowForBoardSize } from './boardUtils'

export const ZOMBIE_REVIVE_ALIGNMENT_HINT =
  'Necromancer, Monarch, Duchess, and Warlock must be on the same horizontal line.'

const ZOMBIE_ELIGIBLE_TYPES: PieceType[] = [
  PieceTypes.RAM_TOWER,
  PieceTypes.CHARIOT,
  PieceTypes.BOMBER,
  PieceTypes.PALADIN
]

export const isZombieEligibleType = (pieceType: PieceType): boolean => {
  return ZOMBIE_ELIGIBLE_TYPES.includes(pieceType)
}

export const filterZombieRevivablePieces = (pieces: Piece[]): Piece[] => {
  return pieces.filter(piece => isZombieEligibleType(piece.type))
}

export const getNightModeFromBoard = (board: Board): boolean => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const cell = board[row][col]
      if (cell && isPiece(cell) && cell.isZombie) {
        return true
      }
    }
  }
  return false
}

export const getAdjustedAttackRange = (piece: Piece, baseRange: number): number => {
  let range = baseRange

  if (piece.type === PieceTypes.NECROMANCER) {
    const reviveCount = piece.reviveCount ?? 0
    range = Math.max(0, range - reviveCount * 2)
  }

  if (piece.isZombie && piece.type === PieceTypes.BOMBER) {
    return 1
  }

  if (piece.isZombie && piece.type !== PieceTypes.BOMBER) {
    range = Math.min(range, 1)
  }

  return range
}

export const getStartingPositionForPieceType = (
  boardSize: BoardSize,
  pieceType: PieceType,
  color: PlayerColor,
  startCol?: number
): Position | null => {
  const row = color === PlayerColors.WHITE ? boardSize.rows - 1 : 0
  if (startCol !== undefined) {
    if (startCol < 0 || startCol >= boardSize.cols) return null
    return { row, col: startCol }
  }
  const backRow = getBackRowForBoardSize(boardSize.cols)
  const col = backRow.indexOf(pieceType)
  if (col === -1) return null
  return { row, col }
}

export const getStartingPositionForPiece = (
  boardSize: BoardSize,
  piece: Pick<Piece, 'type' | 'color' | 'startCol'>
): Position | null => {
  return getStartingPositionForPieceType(boardSize, piece.type, piece.color, piece.startCol)
}

export const areRevivalGuardsInPlace = (board: Board, _boardSize: BoardSize, color: PlayerColor): boolean => {
  const necromancerPos = findPiecePosition(board, PieceTypes.NECROMANCER, color)
  const monarchPos = findPiecePosition(board, PieceTypes.MONARCH, color)
  const duchessPos = findPiecePosition(board, PieceTypes.DUCHESS, color)
  const warlockPos = findPiecePosition(board, PieceTypes.WARLOCK, color)
  if (!necromancerPos || !monarchPos || !duchessPos || !warlockPos) return false
  return (
    necromancerPos.row === monarchPos.row &&
    necromancerPos.row === duchessPos.row &&
    necromancerPos.row === warlockPos.row
  )
}

export const findPiecePosition = (board: Board, pieceType: PieceType, color: PlayerColor): Position | null => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const cell = board[row][col]
      if (cell && isPiece(cell) && cell.type === pieceType && cell.color === color) {
        return { row, col }
      }
    }
  }
  return null
}

export const reviveZombiePiece = (
  board: Board,
  necromancerPosition: Position,
  revivePiece: Piece,
  target: Position,
  currentPlayer: PlayerColor
): Board => {
  const newBoard = cloneBoard(board)
  const necromancer = newBoard[necromancerPosition.row][necromancerPosition.col]
  if (necromancer && isPiece(necromancer) && necromancer.type === PieceTypes.NECROMANCER) {
    newBoard[necromancerPosition.row][necromancerPosition.col] = {
      ...necromancer,
      reviveCount: (necromancer.reviveCount ?? 0) + 1
    }
  }
  newBoard[target.row][target.col] = {
    ...revivePiece,
    color: currentPlayer,
    isZombie: true,
    hasMoved: false
  }
  return newBoard
}

export const getZombieRevivePieces = (
  capturedPieces: { white: Piece[]; black: Piece[] },
  currentPlayer: PlayerColor
): Piece[] => {
  const pieces = capturedPieces?.[currentPlayer] || []
  return filterZombieRevivablePieces(pieces)
}

export const isZombieReviveTargetEmpty = (board: Board, target: Position | null): boolean => {
  if (!target) return false
  return board[target.row][target.col] === null
}

export const getZombieRevivePlacementTarget = (
  board: Board,
  boardSize: BoardSize,
  revivePiece: Piece,
  currentPlayer: PlayerColor
): Position | null => {
  const originalPosition = getStartingPositionForPiece(boardSize, {
    type: revivePiece.type,
    color: currentPlayer,
    startCol: revivePiece.startCol
  })
  if (!originalPosition) return null
  if (board[originalPosition.row][originalPosition.col] === null) return originalPosition

  let nearest: Position | null = null
  let nearestDistance = Number.POSITIVE_INFINITY

  for (let row = 0; row < boardSize.rows; row++) {
    for (let col = 0; col < boardSize.cols; col++) {
      if (board[row][col] !== null) continue
      const distance = Math.abs(row - originalPosition.row) + Math.abs(col - originalPosition.col)
      if (distance < nearestDistance) {
        nearest = { row, col }
        nearestDistance = distance
        continue
      }
      if (distance === nearestDistance && nearest) {
        if (row < nearest.row || (row === nearest.row && col < nearest.col)) {
          nearest = { row, col }
        }
      }
    }
  }

  return nearest
}

export const getZombieReviveOpenState = (params: {
  gameOver: boolean
  mysteryBoxActive: boolean
  revivableCount: number
  necromancerPosition: Position | null
  isOnline: boolean
  isMyTurn: boolean
}): boolean => {
  const { gameOver, mysteryBoxActive, revivableCount, necromancerPosition, isOnline, isMyTurn } = params
  if (gameOver || mysteryBoxActive) return false
  if (revivableCount === 0) return false
  if (!necromancerPosition) return false
  if (isOnline && !isMyTurn) return false
  return true
}

export const getZombieReviveConfirmState = (params: {
  board: Board
  boardSize: BoardSize
  revivePlayerColor: PlayerColor
  necromancerPosition: Position | null
  selectedZombiePiece: Piece | null
  reviveTarget: Position | null
  isOnline: boolean
  isMyTurn: boolean
}): boolean => {
  const {
    board,
    boardSize,
    revivePlayerColor,
    necromancerPosition,
    selectedZombiePiece,
    reviveTarget,
    isOnline,
    isMyTurn
  } = params

  if (!necromancerPosition || !selectedZombiePiece || !reviveTarget) return false
  if (!areRevivalGuardsInPlace(board, boardSize, revivePlayerColor)) return false
  if (isOnline && !isMyTurn) return false
  return true
}

export const getZombieReviveStatusMessage = (params: {
  isOnline: boolean
  isMyTurn: boolean
  necromancerPosition: Position | null
  revivableCount: number
  selectedZombiePiece: Piece | null
  reviveTarget: Position | null
}): string | null => {
  const {
    isOnline,
    isMyTurn,
    necromancerPosition,
    revivableCount,
    selectedZombiePiece,
    reviveTarget
  } = params

  if (isOnline && !isMyTurn) return 'Wait for your turn to revive a Zombie.'
  if (!necromancerPosition) return 'Your Necromancer must be on the board.'
  if (revivableCount === 0) return 'No eligible captured pieces available.'
  if (selectedZombiePiece && !reviveTarget) return 'No empty tiles available to place the Zombie.'
  return null
}
