import type { Board, Piece, Position, Move, PlayerColor, PieceType, BoardSize, ObstacleType, Narc, CellContent } from '../types'
import { isPiece, isObstacle, PlayerColors, PieceTypes, ObstacleTypes, MovePatterns } from '../types'
import { isInBounds, cloneBoard, getObstacleType, findAllCaves } from './boardUtils'
import { PIECE_RULES } from '../constants'
import { createNarcsForBomber, checkNarcNetTrigger, removeNarcsForBomber } from './narcUtils'
import { canPromoteHoplite, promoteHopliteToDuchess } from './hoplitePromotionUtils'
import { getAdjustedAttackRange } from './zombieUtils'

const canPassObstacle = (pieceType: PieceType, obstacleType: ObstacleType): boolean => {
  const rules = PIECE_RULES[pieceType]
  return rules.canPass.includes(obstacleType)
}

const canPassRangeAttackObstacle = (pieceType: PieceType, obstacleType: ObstacleType): boolean => {
  const rules = PIECE_RULES[pieceType]
  if (!rules.rangeAttackCanPass) return false
  return rules.rangeAttackCanPass.includes(obstacleType)
}

const canPassFreezeObstacle = (obstacleType: ObstacleType): boolean => {
  const rules = PIECE_RULES[PieceTypes.NECROMANCER]
  if (!rules.freezeCanPass) return false
  return rules.freezeCanPass.includes(obstacleType)
}

const canLandOnObstacle = (pieceType: PieceType, obstacleType: ObstacleType): boolean => {
  if (obstacleType === ObstacleTypes.MYSTERY_BOX) return true
  return canPassObstacle(pieceType, obstacleType)
}

const canStopOnObstacle = (obstacleType: ObstacleType): boolean => {
  return obstacleType === ObstacleTypes.CAVE
}

const getMaxRiverWidth = (pieceType: PieceType): number => {
  const rules = PIECE_RULES[pieceType]
  return rules.maxRiverWidth ?? Infinity
}

const canTeleportThroughCave = (pieceType: PieceType): boolean => {
  return pieceType === PieceTypes.BOMBER || pieceType === PieceTypes.HOPLITE
}

const getAdjacentEmptyPositions = (board: Board, pos: Position, boardSize: BoardSize): Position[] => {
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ]
  const emptyPositions: Position[] = []

  for (const [rowDir, colDir] of directions) {
    const newRow = pos.row + rowDir
    const newCol = pos.col + colDir

    if (!isInBounds(newRow, newCol, boardSize)) continue

    const cell = board[newRow][newCol]
    if (cell === null) {
      emptyPositions.push({ row: newRow, col: newCol })
    }
  }

  return emptyPositions
}

const canEnterCave = (board: Board, cavePos: Position, boardSize: BoardSize): boolean => {
  const caves = findAllCaves(board)
  const otherCaves = caves.filter(c => c.row !== cavePos.row || c.col !== cavePos.col)

  for (const cave of otherCaves) {
    const adjacentEmpty = getAdjacentEmptyPositions(board, cave, boardSize)
    if (adjacentEmpty.length > 0) return true
  }

  return false
}

const isPathClear = (
  board: Board,
  from: Position,
  to: Position,
  piece: Piece,
  boardSize: BoardSize
): boolean => {
  const rules = PIECE_RULES[piece.type]
  const maxRiver = getMaxRiverWidth(piece.type)

  if (rules.canJumpPieces) {
    const targetObstacle = getObstacleType(board, to.row, to.col)
    if (targetObstacle && !canLandOnObstacle(piece.type, targetObstacle)) {
      return false
    }
    return true
  }

  const rowDir = to.row === from.row ? 0 : (to.row > from.row ? 1 : -1)
  const colDir = to.col === from.col ? 0 : (to.col > from.col ? 1 : -1)

  let row = from.row + rowDir
  let col = from.col + colDir
  let riverRun = 0

  while (row !== to.row || col !== to.col) {
    if (!isInBounds(row, col, boardSize)) return false

    const cell = board[row][col]
    if (cell) {
      if (isPiece(cell)) return false
      if (isObstacle(cell)) {
        if (cell.type === ObstacleTypes.MYSTERY_BOX) {
          if (!canPassObstacle(piece.type, ObstacleTypes.MYSTERY_BOX)) return false
        } else if (!canPassObstacle(piece.type, cell.type)) {
          return false
        }
        if (cell.type === ObstacleTypes.RIVER) {
          if (riverRun >= maxRiver) return false
          riverRun++
        } else {
          riverRun = 0
        }
      }
    } else {
      riverRun = 0
    }

    row += rowDir
    col += colDir
  }

  const targetCell = board[to.row][to.col]
  if (targetCell && isObstacle(targetCell)) {
    if (!canLandOnObstacle(piece.type, targetCell.type)) return false
  }

  return true
}

const getHopliteMoves = (board: Board, pos: Position, piece: Piece, boardSize: BoardSize): Position[] => {
  const moves: Position[] = []
  const rules = PIECE_RULES[PieceTypes.HOPLITE]
  const maxSteps = piece.hasMoved ? (rules.move as number[])[1] : (rules.move as number[])[0]
  const direction = piece.color === PlayerColors.WHITE ? -1 : 1

  for (let steps = 1; steps <= maxSteps; steps++) {
    const newRow = pos.row + (direction * steps)
    if (!isInBounds(newRow, pos.col, boardSize)) break

    const targetCell = board[newRow][pos.col]
    if (targetCell) {
      if (isPiece(targetCell)) {
        if (piece.isZombie && targetCell.color !== piece.color) {
          moves.push({ row: newRow, col: pos.col })
        }
        break
      }
      if (isObstacle(targetCell)) {
        if (targetCell.type === ObstacleTypes.MYSTERY_BOX) {
          moves.push({ row: newRow, col: pos.col })
          if (!canPassObstacle(piece.type, ObstacleTypes.MYSTERY_BOX)) break
          continue
        }
        if (canPassObstacle(piece.type, targetCell.type)) {
          if (canStopOnObstacle(targetCell.type)) {
            const obstaclePos = { row: newRow, col: pos.col }
            if (targetCell.type === ObstacleTypes.CAVE) {
              if (canTeleportThroughCave(piece.type)) {
                if (canEnterCave(board, obstaclePos, boardSize)) {
                  moves.push(obstaclePos)
                }
              } else {
                moves.push(obstaclePos)
              }
            }
          }
          continue
        } else {
          break
        }
      }
    }

    moves.push({ row: newRow, col: pos.col })
  }

  if (rules.canChooseAttackMode) {
    const diagonalDirections = [
      [direction, -1],
      [direction, 1]
    ]
    for (const [rowOff, colOff] of diagonalDirections) {
      const row = pos.row + rowOff
      const col = pos.col + colOff
      if (!isInBounds(row, col, boardSize)) continue
      const targetCell = board[row][col]
      if (targetCell && isPiece(targetCell) && targetCell.color !== piece.color) {
        if (!moves.some(move => move.row === row && move.col === col)) {
          moves.push({ row, col })
        }
      }
    }
  }

  return moves
}

const getCrossMoves = (board: Board, pos: Position, piece: Piece, boardSize: BoardSize): Position[] => {
  const moves: Position[] = []
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  const maxRiver = getMaxRiverWidth(piece.type)

  for (const [rowDir, colDir] of directions) {
    let row = pos.row + rowDir
    let col = pos.col + colDir
    let riverRun = 0

    while (isInBounds(row, col, boardSize)) {
      const cell = board[row][col]

      if (cell) {
        if (isPiece(cell)) {
          if (cell.color !== piece.color && (piece.isZombie || piece.type === PieceTypes.RAM_TOWER)) {
            moves.push({ row, col })
          }
          break
        }
        if (isObstacle(cell)) {
          if (cell.type === ObstacleTypes.MYSTERY_BOX) {
            moves.push({ row, col })
            if (!canPassObstacle(piece.type, ObstacleTypes.MYSTERY_BOX)) break
            row += rowDir
            col += colDir
            continue
          }
          if (canPassObstacle(piece.type, cell.type)) {
            if (cell.type === ObstacleTypes.RIVER) {
              if (riverRun >= maxRiver) break
              riverRun++
            } else {
              riverRun = 0
            }
            if (canStopOnObstacle(cell.type)) {
              const obstaclePos = { row, col }
              if (cell.type === ObstacleTypes.CAVE) {
                if (canTeleportThroughCave(piece.type)) {
                  if (canEnterCave(board, obstaclePos, boardSize)) {
                    moves.push(obstaclePos)
                  }
                } else {
                  moves.push(obstaclePos)
                }
              }
            }
            row += rowDir
            col += colDir
            continue
          } else {
            break
          }
        }
      } else {
        riverRun = 0
      }

      moves.push({ row, col })
      row += rowDir
      col += colDir
    }
  }

  return moves
}

const getSidewaysMoves = (board: Board, pos: Position, piece: Piece, boardSize: BoardSize): Position[] => {
  const moves: Position[] = []
  const directions = [[0, -1], [0, 1]]
  const maxRiver = getMaxRiverWidth(piece.type)

  for (const [rowDir, colDir] of directions) {
    let row = pos.row + rowDir
    let col = pos.col + colDir
    let riverRun = 0

    while (isInBounds(row, col, boardSize)) {
      const cell = board[row][col]

      if (cell) {
        if (isPiece(cell)) {
          if (piece.isZombie && cell.color !== piece.color) {
            moves.push({ row, col })
          }
          break
        }
        if (isObstacle(cell)) {
          if (cell.type === ObstacleTypes.MYSTERY_BOX) {
            moves.push({ row, col })
            if (!canPassObstacle(piece.type, ObstacleTypes.MYSTERY_BOX)) break
            row += rowDir
            col += colDir
            continue
          }
          if (canPassObstacle(piece.type, cell.type)) {
            if (cell.type === ObstacleTypes.RIVER) {
              if (riverRun >= maxRiver) break
              riverRun++
            } else {
              riverRun = 0
            }
            if (canStopOnObstacle(cell.type)) {
              const obstaclePos = { row, col }
              if (cell.type === ObstacleTypes.CAVE) {
                if (canTeleportThroughCave(piece.type)) {
                  if (canEnterCave(board, obstaclePos, boardSize)) {
                    moves.push(obstaclePos)
                  }
                } else {
                  moves.push(obstaclePos)
                }
              }
            }
            row += rowDir
            col += colDir
            continue
          } else {
            break
          }
        }
      } else {
        riverRun = 0
      }

      moves.push({ row, col })
      row += rowDir
      col += colDir
    }
  }

  return moves
}

const getDiagonalMoves = (board: Board, pos: Position, piece: Piece, boardSize: BoardSize): Position[] => {
  const moves: Position[] = []
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  const maxRiver = getMaxRiverWidth(piece.type)

  for (const [rowDir, colDir] of directions) {
    let row = pos.row + rowDir
    let col = pos.col + colDir
    let riverRun = 0

    while (isInBounds(row, col, boardSize)) {
      const cell = board[row][col]

      if (cell) {
        if (isPiece(cell)) {
          if (cell.color !== piece.color && (piece.isZombie || piece.type === PieceTypes.PALADIN)) {
            moves.push({ row, col })
          }
          break
        }
        if (isObstacle(cell)) {
          if (cell.type === ObstacleTypes.MYSTERY_BOX) {
            moves.push({ row, col })
            if (!canPassObstacle(piece.type, ObstacleTypes.MYSTERY_BOX)) break
            row += rowDir
            col += colDir
            continue
          }
          if (canPassObstacle(piece.type, cell.type)) {
            if (cell.type === ObstacleTypes.RIVER) {
              if (riverRun >= maxRiver) break
              riverRun++
            } else {
              riverRun = 0
            }
            if (canStopOnObstacle(cell.type)) {
              const obstaclePos = { row, col }
              if (cell.type === ObstacleTypes.CAVE) {
                if (canTeleportThroughCave(piece.type)) {
                  if (canEnterCave(board, obstaclePos, boardSize)) {
                    moves.push(obstaclePos)
                  }
                } else {
                  moves.push(obstaclePos)
                }
              }
            }
            row += rowDir
            col += colDir
            continue
          } else {
            break
          }
        }
      } else {
        riverRun = 0
      }

      moves.push({ row, col })
      row += rowDir
      col += colDir
    }
  }

  return moves
}

const getAnyDirectionMoves = (board: Board, pos: Position, piece: Piece, boardSize: BoardSize, maxSteps: number = 1): Position[] => {
  const moves: Position[] = []
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ]
  const maxRiver = getMaxRiverWidth(piece.type)

  for (const [rowDir, colDir] of directions) {
    let riverRun = 0
    for (let step = 1; step <= maxSteps; step++) {
      const row = pos.row + (rowDir * step)
      const col = pos.col + (colDir * step)

      if (!isInBounds(row, col, boardSize)) break

      const cell = board[row][col]

      if (cell) {
        if (isPiece(cell)) {
          if (piece.isZombie && cell.color !== piece.color) {
            moves.push({ row, col })
          }
          break
        }
        if (isObstacle(cell)) {
          if (cell.type === ObstacleTypes.MYSTERY_BOX) {
            moves.push({ row, col })
            if (!canPassObstacle(piece.type, ObstacleTypes.MYSTERY_BOX)) break
            continue
          }
          if (canPassObstacle(piece.type, cell.type)) {
            if (cell.type === ObstacleTypes.RIVER) {
              if (riverRun >= maxRiver) break
              riverRun++
            } else {
              riverRun = 0
            }
            if (canStopOnObstacle(cell.type)) {
              const obstaclePos = { row, col }
              if (cell.type === ObstacleTypes.CAVE) {
                if (canTeleportThroughCave(piece.type)) {
                  if (canEnterCave(board, obstaclePos, boardSize)) {
                    moves.push(obstaclePos)
                  }
                } else {
                  moves.push(obstaclePos)
                }
              }
            }
            continue
          } else {
            break
          }
        }
      } else {
        riverRun = 0
      }

      moves.push({ row, col })
    }
  }

  return moves
}

const getPatternMoves = (board: Board, pos: Position, piece: Piece, boardSize: BoardSize): Position[] => {
  const moves: Position[] = []
  const rules = PIECE_RULES[piece.type]
  const patterns = rules.move as number[][]

  for (const pattern of patterns) {
    const [dx, dy] = pattern

    const variations = [
      [dx, dy], [dx, -dy], [-dx, dy], [-dx, -dy],
      [dy, dx], [dy, -dx], [-dy, dx], [-dy, -dx]
    ]

    for (const [rowOff, colOff] of variations) {
      const newRow = pos.row + rowOff
      const newCol = pos.col + colOff

      if (!isInBounds(newRow, newCol, boardSize)) continue

      if (!isPathClear(board, pos, { row: newRow, col: newCol }, piece, boardSize)) continue

      const targetCell = board[newRow][newCol]
      if (targetCell && isPiece(targetCell)) {
        if (
          targetCell.color !== piece.color &&
          (piece.isZombie || piece.type === PieceTypes.CHARIOT)
        ) {
          moves.push({ row: newRow, col: newCol })
        }
        continue
      }

      moves.push({ row: newRow, col: newCol })
    }
  }

  const uniqueMoves = moves.filter((move, index, self) =>
    index === self.findIndex(m => m.row === move.row && m.col === move.col)
  )

  return uniqueMoves
}

export const getPieceMoves = (board: Board, pos: Position, boardSize: BoardSize): Position[] => {
  const cell = board[pos.row][pos.col]
  if (!cell || !isPiece(cell)) return []
  if (isPieceFrozen(cell)) return []

  const rules = PIECE_RULES[cell.type]
  let moves: Position[] = []

  if (cell.type === PieceTypes.HOPLITE) {
    moves = getHopliteMoves(board, pos, cell, boardSize)
  } else if (rules.move === MovePatterns.CROSS) {
    moves = getCrossMoves(board, pos, cell, boardSize)
  } else if (rules.move === MovePatterns.SIDEWAYS) {
    moves = getSidewaysMoves(board, pos, cell, boardSize)
  } else if (rules.move === MovePatterns.DIAGONAL) {
    moves = getDiagonalMoves(board, pos, cell, boardSize)
  } else if (rules.move === MovePatterns.ANY) {
    const maxSteps = cell.type === PieceTypes.MONARCH ? 1 : boardSize.rows
    moves = getAnyDirectionMoves(board, pos, cell, boardSize, maxSteps)
  } else if (Array.isArray(rules.move)) {
    moves = getPatternMoves(board, pos, cell, boardSize)
  }

  return moves
}

const isInAttackRange = (from: Position, to: Position, attackRange: number): boolean => {
  const dx = Math.abs(to.row - from.row)
  const dy = Math.abs(to.col - from.col)
  return Math.max(dx, dy) <= attackRange
}

const isPieceFrozen = (piece: Piece): boolean => {
  return (piece.frozenTurns ?? 0) > 0
}

export const canUseCaptureAttackMode = (piece: Piece): boolean => {
  if (isPieceFrozen(piece)) return false
  return Boolean(PIECE_RULES[piece.type].canChooseAttackMode)
}

const getNecromancerBaseFreezeRange = (): number =>
  PIECE_RULES[PieceTypes.NECROMANCER].freezeRange ?? 8

const getNecromancerFreezeRange = (piece: Piece): number =>
  getAdjustedAttackRange(piece, getNecromancerBaseFreezeRange())

const getNecromancerFreezeDuration = (distance: number): number =>
  Math.floor(distance / 2)

export const getNecromancerKillTargets = (board: Board, pos: Position, boardSize: BoardSize): Position[] => {
  const cell = board[pos.row][pos.col]
  if (!cell || !isPiece(cell) || cell.type !== PieceTypes.NECROMANCER) return []

  const targets: Position[] = []
  for (let rowOff = -1; rowOff <= 1; rowOff++) {
    for (let colOff = -1; colOff <= 1; colOff++) {
      if (rowOff === 0 && colOff === 0) continue
      const row = pos.row + rowOff
      const col = pos.col + colOff
      if (!isInBounds(row, col, boardSize)) continue
      const targetCell = board[row][col]
      if (!targetCell || !isPiece(targetCell)) continue
      if (targetCell.color === cell.color) continue
      targets.push({ row, col })
    }
  }
  return targets
}

const isFreezePathClear = (
  board: Board,
  from: Position,
  to: Position,
  boardSize: BoardSize
): boolean => {
  const rowDiff = to.row - from.row
  const colDiff = to.col - from.col
  const rowDir = rowDiff === 0 ? 0 : rowDiff > 0 ? 1 : -1
  const colDir = colDiff === 0 ? 0 : colDiff > 0 ? 1 : -1
  const isAligned = rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)
  if (!isAligned) return false

  let row = from.row + rowDir
  let col = from.col + colDir
  while (row !== to.row || col !== to.col) {
    if (!isInBounds(row, col, boardSize)) return false
    const cell = board[row][col]
    if (cell && isObstacle(cell) && !canPassFreezeObstacle(cell.type)) return false
    row += rowDir
    col += colDir
  }
  return true
}

export const getNecromancerFreezeTargets = (board: Board, pos: Position, boardSize: BoardSize): Position[] => {
  const cell = board[pos.row][pos.col]
  if (!cell || !isPiece(cell) || cell.type !== PieceTypes.NECROMANCER || isPieceFrozen(cell)) return []

  const freezeRange = getNecromancerFreezeRange(cell)
  if (freezeRange <= 0) return []

  const targets: Position[] = []

  for (let row = 0; row < boardSize.rows; row++) {
    for (let col = 0; col < boardSize.cols; col++) {
      if (row === pos.row && col === pos.col) continue
      const targetCell = board[row][col]
      if (!targetCell || !isPiece(targetCell)) continue
      if (targetCell.color === cell.color) continue
      if ((targetCell.frozenTurns ?? 0) > 0) continue
      const distance = Math.max(Math.abs(row - pos.row), Math.abs(col - pos.col))
      if (getNecromancerFreezeDuration(distance) < 1) continue
      if (!isInAttackRange(pos, { row, col }, freezeRange)) continue
      if (!isFreezePathClear(board, pos, { row, col }, boardSize)) continue
      targets.push({ row, col })
    }
  }

  return targets
}

const getChariotRangeKillGammaBox = (piece: Piece): number =>
  getAdjustedAttackRange(
    piece,
    PIECE_RULES[PieceTypes.CHARIOT].chariotRangeKillGammaBox ?? 4
  )

const getChariotCaptureMaxGammaRange = (piece: Piece): number =>
  getAdjustedAttackRange(
    piece,
    PIECE_RULES[PieceTypes.CHARIOT].chariotCaptureMaxGammaRange ?? 3
  )

const getChariotGammaRange = (from: Position, to: Position): number | null => {
  const absDr = Math.abs(to.row - from.row)
  const absDc = Math.abs(to.col - from.col)
  if (absDr < 1 || absDc < 1) return null
  if (Math.min(absDr, absDc) !== 1) return null
  return Math.max(absDr, absDc) + 1
}

const isChariotExactRangeKillGamma = (from: Position, to: Position, exactGammaRange: number): boolean =>
  getChariotGammaRange(from, to) === exactGammaRange

const isChariotCaptureGamma = (from: Position, to: Position, maxGammaRange: number): boolean => {
  const gammaRange = getChariotGammaRange(from, to)
  return gammaRange !== null && gammaRange <= maxGammaRange
}

const getChariotGammaPathOptionCells = (
  from: Position,
  firstRowDir: number,
  firstColDir: number,
  firstSteps: number,
  secondRowDir: number,
  secondColDir: number,
  secondSteps: number,
  boardSize: BoardSize
): Position[] | null => {
  let row = from.row
  let col = from.col
  const traversed: Position[] = []

  for (let i = 0; i < firstSteps; i++) {
    row += firstRowDir
    col += firstColDir
    if (!isInBounds(row, col, boardSize)) return null
    traversed.push({ row, col })
  }

  for (let i = 0; i < secondSteps; i++) {
    row += secondRowDir
    col += secondColDir
    if (!isInBounds(row, col, boardSize)) return null
    traversed.push({ row, col })
  }

  return traversed.slice(0, -1)
}

const isChariotGammaPathOptionClear = (
  board: Board,
  from: Position,
  piece: Piece,
  firstRowDir: number,
  firstColDir: number,
  firstSteps: number,
  secondRowDir: number,
  secondColDir: number,
  secondSteps: number,
  boardSize: BoardSize
): boolean => {
  const intermediateCells = getChariotGammaPathOptionCells(
    from,
    firstRowDir,
    firstColDir,
    firstSteps,
    secondRowDir,
    secondColDir,
    secondSteps,
    boardSize
  )
  if (!intermediateCells) return false

  for (const cellPos of intermediateCells) {
    const cell = board[cellPos.row][cellPos.col]
    if (!cell) continue
    if (isObstacle(cell)) {
      if (!canPassRangeAttackObstacle(piece.type, cell.type)) return false
      continue
    }
    if (isPiece(cell)) {
      if (cell.color === piece.color) continue
      return false
    }
  }

  return true
}

const getChariotGammaPathOptions = (from: Position, to: Position) => {
  const dr = to.row - from.row
  const dc = to.col - from.col
  const absDr = Math.abs(dr)
  const absDc = Math.abs(dc)
  const rowSign = Math.sign(dr)
  const colSign = Math.sign(dc)

  if (absDr > absDc) {
    return [
      { firstRowDir: rowSign, firstColDir: 0, firstSteps: absDr, secondRowDir: 0, secondColDir: colSign, secondSteps: absDc },
      { firstRowDir: 0, firstColDir: colSign, firstSteps: absDc, secondRowDir: rowSign, secondColDir: 0, secondSteps: absDr }
    ]
  }

  return [
    { firstRowDir: 0, firstColDir: colSign, firstSteps: absDc, secondRowDir: rowSign, secondColDir: 0, secondSteps: absDr },
    { firstRowDir: rowSign, firstColDir: 0, firstSteps: absDr, secondRowDir: 0, secondColDir: colSign, secondSteps: absDc }
  ]
}

const isChariotGammaPathClear = (
  board: Board,
  from: Position,
  to: Position,
  piece: Piece,
  boardSize: BoardSize
): boolean => {
  const exactGammaRange = getChariotRangeKillGammaBox(piece)
  if (!isChariotExactRangeKillGamma(from, to, exactGammaRange)) {
    return false
  }

  return getChariotGammaPathOptions(from, to).some(option =>
    isChariotGammaPathOptionClear(
      board,
      from,
      piece,
      option.firstRowDir,
      option.firstColDir,
      option.firstSteps,
      option.secondRowDir,
      option.secondColDir,
      option.secondSteps,
      boardSize
    )
  )
}

const chariotGammaPathHasFriendlyOrObstacle = (
  board: Board,
  from: Position,
  to: Position,
  piece: Piece,
  boardSize: BoardSize
): boolean => {
  const maxGammaRange = getChariotCaptureMaxGammaRange(piece)
  if (!isChariotCaptureGamma(from, to, maxGammaRange)) return false

  return getChariotGammaPathOptions(from, to).some(option => {
    if (!isChariotGammaPathOptionClear(
      board,
      from,
      piece,
      option.firstRowDir,
      option.firstColDir,
      option.firstSteps,
      option.secondRowDir,
      option.secondColDir,
      option.secondSteps,
      boardSize
    )) {
      return false
    }

    const intermediateCells = getChariotGammaPathOptionCells(
      from,
      option.firstRowDir,
      option.firstColDir,
      option.firstSteps,
      option.secondRowDir,
      option.secondColDir,
      option.secondSteps,
      boardSize
    )
    if (!intermediateCells) return false

    return intermediateCells.some(cellPos => {
      const cell = board[cellPos.row][cellPos.col]
      if (!cell) return false
      if (isObstacle(cell)) return true
      return isPiece(cell) && cell.color === piece.color
    })
  })
}

const getRamTowerValidAttacks = (board: Board, pos: Position, boardSize: BoardSize, cell: Piece): Position[] => {
  const attacks: Position[] = []
  const attackRange = getAdjustedAttackRange(cell, PIECE_RULES[cell.type].attackRange)
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]

  for (const [rowDir, colDir] of directions) {
    for (let step = 1; step <= attackRange; step++) {
      const row = pos.row + rowDir * step
      const col = pos.col + colDir * step
      if (!isInBounds(row, col, boardSize)) break

      const targetCell = board[row][col]
      if (!targetCell) continue
      if (isObstacle(targetCell)) {
        if (!canPassRangeAttackObstacle(cell.type, targetCell.type)) break
        continue
      }
      if (targetCell.color === cell.color) continue

      const target = { row, col }
      if (!isAttackPathClear(board, pos, target, cell, boardSize)) break

      attacks.push(target)
      break
    }
  }
  return attacks
}

const getPaladinValidAttacks = (board: Board, pos: Position, boardSize: BoardSize, cell: Piece): Position[] => {
  const attacks: Position[] = []
  const attackRange = getAdjustedAttackRange(cell, 3)
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]

  for (const [rowDir, colDir] of directions) {
    for (let step = 1; step <= attackRange; step++) {
      const row = pos.row + rowDir * step
      const col = pos.col + colDir * step
      if (!isInBounds(row, col, boardSize)) break

      const targetCell = board[row][col]
      if (!targetCell) continue
      if (isObstacle(targetCell)) {
        if (!canPassRangeAttackObstacle(cell.type, targetCell.type)) break
        continue
      }
      if (targetCell.color === cell.color) continue

      const target = { row, col }
      if (!isAttackPathClear(board, pos, target, cell, boardSize)) break

      attacks.push(target)
      break
    }
  }
  return attacks
}

const getChariotValidAttacks = (board: Board, pos: Position, boardSize: BoardSize, cell: Piece): Position[] => {
  const attacks: Position[] = []
  const rangeKillGammaRange = getChariotRangeKillGammaBox(cell)

  for (let row = 0; row < boardSize.rows; row++) {
    for (let col = 0; col < boardSize.cols; col++) {
      if (row === pos.row && col === pos.col) continue

      const targetCell = board[row][col]
      if (!targetCell || !isPiece(targetCell)) continue
      if (targetCell.color === cell.color) continue

      const target = { row, col }
      const isGamma = isChariotExactRangeKillGamma(pos, target, rangeKillGammaRange)

      if (isGamma && isChariotGammaPathClear(board, pos, target, cell, boardSize)) {
        attacks.push(target)
      }
    }
  }
  return attacks
}

export const isChariotValidCaptureMoveTarget = (
  board: Board,
  from: Position,
  target: Position,
  piece: Piece,
  boardSize: BoardSize
): boolean => {
  const targetCell = board[target.row]?.[target.col]
  if (!targetCell || !isPiece(targetCell) || targetCell.color === piece.color) return false

  const canLandOnEnemy = getPieceMoves(board, from, boardSize).some(
    move => move.row === target.row && move.col === target.col
  )
  if (!canLandOnEnemy) return false

  const captureMaxGammaRange = getChariotCaptureMaxGammaRange(piece)

  if (getChariotGammaRange(from, target) !== null) {
    if (!isChariotCaptureGamma(from, target, captureMaxGammaRange)) {
      return false
    }
    return !chariotGammaPathHasFriendlyOrObstacle(board, from, target, piece, boardSize)
  }

  return true
}

const isAttackPathClear = (
  board: Board,
  from: Position,
  to: Position,
  piece: Piece,
  boardSize: BoardSize
): boolean => {
  const rowDir = to.row === from.row ? 0 : (to.row > from.row ? 1 : -1)
  const colDir = to.col === from.col ? 0 : (to.col > from.col ? 1 : -1)

  let row = from.row + rowDir
  let col = from.col + colDir

  while (row !== to.row || col !== to.col) {
    if (!isInBounds(row, col, boardSize)) return false

    const cell = board[row][col]
    if (cell) {
      if (isPiece(cell)) {
        if (cell.color === piece.color) {
          row += rowDir
          col += colDir
          continue
        }
        return false
      }
      if (isObstacle(cell) && !canPassRangeAttackObstacle(piece.type, cell.type)) return false
    }

    row += rowDir
    col += colDir
  }

  return true
}

export const getValidAttacks = (board: Board, pos: Position, boardSize: BoardSize): Position[] => {
  const cell = board[pos.row][pos.col]
  if (!cell || !isPiece(cell)) return []

  const rules = PIECE_RULES[cell.type]
  const attackRange = getAdjustedAttackRange(cell, rules.attackRange)
  const attacks: Position[] = []

  if (attackRange === 0) return []

  if (cell.type === PieceTypes.RAM_TOWER) {
    return getRamTowerValidAttacks(board, pos, boardSize, cell)
  }

  if (cell.type === PieceTypes.HOPLITE) {
    const forwardDirection = cell.color === PlayerColors.WHITE ? -1 : 1
    const directions = [
      [forwardDirection, -1],
      [forwardDirection, 1]
    ]
    for (const [rowOff, colOff] of directions) {
      const row = pos.row + rowOff
      const col = pos.col + colOff
      if (!isInBounds(row, col, boardSize)) continue

      const targetCell = board[row][col]
      if (targetCell && isPiece(targetCell) && targetCell.color !== cell.color) {
        attacks.push({ row, col })
      }
    }
    return attacks
  }

  if (cell.type === PieceTypes.CHARIOT) {
    return getChariotValidAttacks(board, pos, boardSize, cell)
  }

  if (cell.type === PieceTypes.PALADIN) {
    return getPaladinValidAttacks(board, pos, boardSize, cell)
  }

  if (cell.type === PieceTypes.NECROMANCER) {
    return getNecromancerKillTargets(board, pos, boardSize)
  }

  if (cell.type === PieceTypes.WARLOCK) {
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    for (const [rowOff, colOff] of directions) {
      const row = pos.row + rowOff
      const col = pos.col + colOff
      if (!isInBounds(row, col, boardSize)) continue

      const targetCell = board[row][col]
      if (targetCell && isPiece(targetCell) && targetCell.color !== cell.color) {
        attacks.push({ row, col })
      }
    }
    return attacks
  }

  for (let row = 0; row < boardSize.rows; row++) {
    for (let col = 0; col < boardSize.cols; col++) {
      if (row === pos.row && col === pos.col) continue

      const targetCell = board[row][col]
      if (!targetCell || !isPiece(targetCell)) continue
      if (targetCell.color === cell.color) continue

      if (!isInAttackRange(pos, { row, col }, attackRange)) continue

      if (!isAttackPathClear(board, pos, { row, col }, cell, boardSize)) continue

      attacks.push({ row, col })
    }
  }

  return attacks
}

export const getValidMoves = (board: Board, pos: Position, boardSize: BoardSize): Position[] => {
  return getPieceMoves(board, pos, boardSize)
}

export const getDisplayedMoveTargets = (
  board: Board,
  validMoves: Position[],
  selectedPiece: Piece | null
): Position[] => {
  if (!selectedPiece || !PIECE_RULES[selectedPiece.type].canChooseAttackMode) {
    return validMoves
  }

  return validMoves.filter(move => {
    const cell = board[move.row]?.[move.col]
    return !cell || !isPiece(cell) || cell.color === selectedPiece.color
  })
}

export const getDisplayedAttackTargets = (
  board: Board,
  validMoves: Position[],
  validAttacks: Position[],
  selectedPiece: Piece | null,
  selectedPosition: Position | null,
  attackMode: 'ranged' | 'capture',
  boardSize: BoardSize
): Position[] => {
  if (!selectedPiece || !canUseCaptureAttackMode(selectedPiece)) {
    return validAttacks
  }

  if (attackMode === 'capture') {
    const enemyMoveTargets = validMoves.filter(move => {
      const cell = board[move.row]?.[move.col]
      return cell && isPiece(cell) && cell.color !== selectedPiece.color
    })

    if (
      selectedPiece.type === PieceTypes.CHARIOT &&
      selectedPosition
    ) {
      return enemyMoveTargets.filter(target =>
        isChariotValidCaptureMoveTarget(board, selectedPosition, target, selectedPiece, boardSize)
      )
    }

    return enemyMoveTargets
  }

  return validAttacks
}

export const resolveAttackModeAction = (
  selectedPiece: Piece,
  targetCell: CellContent,
  isValidMoveTarget: boolean,
  isValidAttackTarget: boolean,
  attackMode: 'ranged' | 'capture',
  options?: {
    board: Board
    from: Position
    to: Position
    boardSize: BoardSize
  }
): { allowed: boolean; shouldUseRangedAttack: boolean; shouldUseMoveCapture: boolean } => {
  const canChooseAttackMode = PIECE_RULES[selectedPiece.type].canChooseAttackMode
  const canMoveCapture = canUseCaptureAttackMode(selectedPiece)
  const isEnemyTarget = Boolean(targetCell && isPiece(targetCell) && targetCell.color !== selectedPiece.color)
  const isEnemyMoveCaptureTarget = isValidMoveTarget && isEnemyTarget
  const isChariotCaptureTarget = selectedPiece.type === PieceTypes.CHARIOT &&
    options &&
    isChariotValidCaptureMoveTarget(options.board, options.from, options.to, selectedPiece, options.boardSize)

  if (canChooseAttackMode && isEnemyTarget && attackMode === 'ranged' && !isValidAttackTarget) {
    return { allowed: false, shouldUseRangedAttack: false, shouldUseMoveCapture: false }
  }

  if (
    canChooseAttackMode &&
    selectedPiece.type === PieceTypes.CHARIOT &&
    attackMode === 'capture' &&
    isEnemyTarget &&
    !isChariotCaptureTarget
  ) {
    return { allowed: false, shouldUseRangedAttack: false, shouldUseMoveCapture: false }
  }

  const shouldUseRangedAttack = isValidAttackTarget && (!canChooseAttackMode || attackMode === 'ranged')
  const shouldUseMoveCapture = Boolean(canMoveCapture &&
    attackMode === 'capture' &&
    (selectedPiece.type === PieceTypes.CHARIOT
      ? isChariotCaptureTarget
      : (isValidAttackTarget || isEnemyMoveCaptureTarget)))

  return { allowed: true, shouldUseRangedAttack, shouldUseMoveCapture }
}

export const isValidMove = (
  _piece: PieceType,
  start: Position,
  end: Position,
  board: Board,
  boardSize: BoardSize
): boolean => {
  const moves = getPieceMoves(board, start, boardSize)
  return moves.some(m => m.row === end.row && m.col === end.col)
}

export const canAttack = (
  _piece: PieceType,
  start: Position,
  target: Position,
  board: Board,
  boardSize: BoardSize
): boolean => {
  const attacks = getValidAttacks(board, start, boardSize)
  return attacks.some(a => a.row === target.row && a.col === target.col)
}

const getValidCaveExitPositions = (board: Board, enteredCavePos: Position, boardSize: BoardSize): Position[] => {
  const caves = findAllCaves(board)
  const otherCaves = caves.filter(c => c.row !== enteredCavePos.row || c.col !== enteredCavePos.col)
  const validExits: Position[] = []

  for (const cave of otherCaves) {
    const adjacentEmpty = getAdjacentEmptyPositions(board, cave, boardSize)
    validExits.push(...adjacentEmpty)
  }

  return validExits
}

const getRandomCaveExit = (board: Board, enteredCavePos: Position, boardSize: BoardSize): Position | null => {
  const validExits = getValidCaveExitPositions(board, enteredCavePos, boardSize)

  if (validExits.length === 0) return null

  const randomIndex = Math.floor(Math.random() * validExits.length)
  return validExits[randomIndex]
}

export const hasCaveExit = (board: Board, cavePos: Position, boardSize: BoardSize): boolean => {
  const validExits = getValidCaveExitPositions(board, cavePos, boardSize)
  return validExits.length > 0
}

export const makeMove = (
  board: Board,
  from: Position,
  to: Position,
  boardSize: BoardSize,
  isAttack: boolean = false,
  narcs: Narc[] = [],
  capturedPieces: { white: Piece[]; black: Piece[] } = { white: [], black: [] }
): { newBoard: Board; move: Move; newNarcs: Narc[] } => {
  const newBoard = cloneBoard(board)
  const cell = newBoard[from.row][from.col]

  if (!cell || !isPiece(cell)) {
    throw new Error('No piece at source position')
  }

  const piece = cell
  const targetCell = newBoard[to.row][to.col]
  const captured = targetCell && isPiece(targetCell) ? targetCell : undefined
  const sourceObstacle = piece.standingOnObstacle

  let finalPosition = to
  const isCaveDestination = targetCell &&
    isObstacle(targetCell) &&
    targetCell.type === ObstacleTypes.CAVE &&
    canTeleportThroughCave(piece.type)

  if (isCaveDestination && !isAttack) {
    const caveExit = getRandomCaveExit(newBoard, to, boardSize)
    if (caveExit) {
      finalPosition = caveExit
    }
  }

  let newNarcs = [...narcs]
  const triggeredNarcNet = checkNarcNetTrigger(board, boardSize, finalPosition, piece.color)

  if (triggeredNarcNet && !isAttack) {
    newBoard[from.row][from.col] = sourceObstacle ? { type: sourceObstacle } : null

    const move: Move = {
      from,
      to: finalPosition,
      piece: { ...piece },
      captured: { ...piece },
      isAttack: false,
      terminatedByNarc: true
    }

    return { newBoard, move, newNarcs }
  }

  let move: Move = {
    from,
    to: finalPosition,
    piece: { ...piece },
    captured: captured ? { ...captured } : undefined,
    isAttack
  }

  if (isAttack && captured) {
    newBoard[to.row][to.col] = null
    if (captured.type === PieceTypes.BOMBER) {
      newNarcs = removeNarcsForBomber(newNarcs, captured.id)
    }
  } else {
    const destinationCell = newBoard[finalPosition.row][finalPosition.col]
    const destinationObstacle =
      destinationCell && isObstacle(destinationCell) ? destinationCell.type : undefined
    let movedPiece: Piece = {
      ...piece,
      hasMoved: true,
      standingOnObstacle: destinationObstacle
    }

    if (canPromoteHoplite(piece, finalPosition, boardSize, board, capturedPieces)) {
      movedPiece = promoteHopliteToDuchess(movedPiece)
      move.promotedTo = movedPiece.type
    }

    newBoard[finalPosition.row][finalPosition.col] = movedPiece
    newBoard[from.row][from.col] = sourceObstacle ? { type: sourceObstacle } : null
    if (captured && captured.type === PieceTypes.BOMBER) {
      newNarcs = removeNarcsForBomber(newNarcs, captured.id)
    }
  }

  if (piece.type === PieceTypes.BOMBER && !piece.isZombie && !isAttack) {
    newNarcs = removeNarcsForBomber(newNarcs, piece.id)
    const bomberNarcs = createNarcsForBomber(
      finalPosition,
      piece.color,
      piece.id,
      newBoard,
      boardSize,
      newNarcs
    )
    newNarcs = [...newNarcs, ...bomberNarcs]
  }

  return { newBoard, move, newNarcs }
}

export const applyNecromancerFreeze = (
  board: Board,
  from: Position,
  to: Position,
  boardSize: BoardSize
): { newBoard: Board; move: Move } => {
  const newBoard = cloneBoard(board)
  const casterCell = newBoard[from.row][from.col]
  const targetCell = newBoard[to.row][to.col]

  if (!casterCell || !isPiece(casterCell) || casterCell.type !== PieceTypes.NECROMANCER) {
    throw new Error('Freeze requires a Necromancer caster')
  }
  if (isPieceFrozen(casterCell)) {
    throw new Error('Frozen Necromancer cannot freeze')
  }
  if (!targetCell || !isPiece(targetCell) || targetCell.color === casterCell.color) {
    throw new Error('Freeze target must be an enemy piece')
  }
  if ((targetCell.frozenTurns ?? 0) > 0) {
    throw new Error('Cannot freeze an already frozen target')
  }

  const validTargets = getNecromancerFreezeTargets(board, from, boardSize)
  const canFreeze = validTargets.some(target => target.row === to.row && target.col === to.col)
  if (!canFreeze) {
    throw new Error('Target is outside freeze range or line of sight')
  }

  const usedRange = Math.max(Math.abs(to.row - from.row), Math.abs(to.col - from.col))
  const freezeTurns = getNecromancerFreezeDuration(usedRange)
  if (freezeTurns < 1) {
    throw new Error('Target is too close for freeze')
  }
  const updatedTarget: Piece = { ...targetCell, frozenTurns: freezeTurns }
  newBoard[to.row][to.col] = updatedTarget

  const move: Move = {
    from,
    to,
    piece: { ...casterCell },
    captured: undefined,
    isFreeze: true,
    freezeTurns
  }

  return { newBoard, move }
}

export const decrementFrozenTurnsForPlayer = (board: Board, color: PlayerColor): Board => {
  const updatedBoard = cloneBoard(board)
  for (let row = 0; row < updatedBoard.length; row++) {
    for (let col = 0; col < updatedBoard[row].length; col++) {
      const cell = updatedBoard[row][col]
      if (!cell || !isPiece(cell)) continue
      if (cell.color !== color) continue
      const frozenTurns = cell.frozenTurns ?? 0
      if (frozenTurns <= 0) continue
      const nextFrozenTurns = frozenTurns - 1
      updatedBoard[row][col] = nextFrozenTurns > 0
        ? { ...cell, frozenTurns: nextFrozenTurns }
        : { ...cell, frozenTurns: undefined }
    }
  }
  return updatedBoard
}

export const hasLegalMoves = (board: Board, color: PlayerColor, boardSize: BoardSize): boolean => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col]
      if (cell && isPiece(cell) && cell.color === color) {
        const moves = getValidMoves(board, { row, col }, boardSize)
        if (moves.length > 0) return true

        const attacks = getValidAttacks(board, { row, col }, boardSize)
        if (attacks.length > 0) return true

        if (cell.type === PieceTypes.NECROMANCER) {
          const freezeTargets = getNecromancerFreezeTargets(board, { row, col }, boardSize)
          if (freezeTargets.length > 0) return true
        }
      }
    }
  }
  return false
}

export const findMonarch = (board: Board, color: PlayerColor): Position | null => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col]
      if (cell && isPiece(cell) && cell.type === PieceTypes.MONARCH && cell.color === color) {
        return { row, col }
      }
    }
  }
  return null
}

export const isMonarchCaptured = (board: Board, color: PlayerColor): boolean => {
  return findMonarch(board, color) === null
}
