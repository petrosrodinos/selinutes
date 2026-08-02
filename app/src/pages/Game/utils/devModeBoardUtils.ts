import type { Board, BoardSize, CellContent, Position } from '../types'
import { isObstacle, isPiece } from '../types'
import { cloneBoard, isInBounds } from './boardUtils'

export const normalizeRect = (a: Position, b: Position): { minRow: number; maxRow: number; minCol: number; maxCol: number } => ({
  minRow: Math.min(a.row, b.row),
  maxRow: Math.max(a.row, b.row),
  minCol: Math.min(a.col, b.col),
  maxCol: Math.max(a.col, b.col)
})

export const getSelectionBounds = (
  positions: readonly Position[]
): { minRow: number; maxRow: number; minCol: number; maxCol: number } | null => {
  if (positions.length === 0) return null

  let minRow = positions[0].row
  let maxRow = positions[0].row
  let minCol = positions[0].col
  let maxCol = positions[0].col

  for (let i = 1; i < positions.length; i++) {
    const { row, col } = positions[i]
    if (row < minRow) minRow = row
    if (row > maxRow) maxRow = row
    if (col < minCol) minCol = col
    if (col > maxCol) maxCol = col
  }

  return { minRow, maxRow, minCol, maxCol }
}

export const getDevModeContentsInRect = (board: Board, from: Position, to: Position): Position[] => {
  const { minRow, maxRow, minCol, maxCol } = normalizeRect(from, to)
  const selected: Position[] = []

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const cell = board[row]?.[col]
      if (cell && (isPiece(cell) || isObstacle(cell))) {
        selected.push({ row, col })
      }
    }
  }

  return selected
}

const positionKey = (pos: Position): string => `${pos.row},${pos.col}`

export const isSamePosition = (a: Position, b: Position): boolean => a.row === b.row && a.col === b.col

export const isPositionSelected = (selected: readonly Position[], pos: Position): boolean =>
  selected.some((item) => isSamePosition(item, pos))

export const moveDevModeSelection = (
  board: Board,
  selected: readonly Position[],
  destAnchor: Position,
  boardSize: BoardSize
): Board | null => {
  if (selected.length === 0) return null

  const bounds = getSelectionBounds(selected)
  if (!bounds) return null

  const deltaRow = destAnchor.row - bounds.minRow
  const deltaCol = destAnchor.col - bounds.minCol

  if (deltaRow === 0 && deltaCol === 0) return null

  const selectedKeys = new Set(selected.map(positionKey))
  const moves: { from: Position; to: Position; cell: CellContent }[] = []

  for (const from of selected) {
    const to = { row: from.row + deltaRow, col: from.col + deltaCol }
    if (!isInBounds(to.row, to.col, boardSize)) return null

    const target = board[to.row][to.col]
    if (target && !selectedKeys.has(positionKey(to))) return null

    moves.push({ from, to, cell: board[from.row][from.col] })
  }

  const newBoard = cloneBoard(board)

  for (const move of moves) {
    newBoard[move.from.row][move.from.col] = null
  }

  for (const move of moves) {
    newBoard[move.to.row][move.to.col] = move.cell
  }

  return newBoard
}

export const clientPointToBoardPosition = (
  clientX: number,
  clientY: number,
  boardRect: DOMRect,
  squareSize: number,
  boardSize: BoardSize
): Position | null => {
  const x = clientX - boardRect.left
  const y = clientY - boardRect.top

  if (x < 0 || y < 0 || x >= boardSize.cols * squareSize || y >= boardSize.rows * squareSize) {
    return null
  }

  const col = Math.min(boardSize.cols - 1, Math.floor(x / squareSize))
  const row = Math.min(boardSize.rows - 1, Math.floor(y / squareSize))

  return { row, col }
}
