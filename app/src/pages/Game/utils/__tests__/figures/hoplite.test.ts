import { describe, it, expect } from 'vitest'
import {
  getValidMoves,
  getValidAttacks,
  makeMove,
  resolveAttackModeAction,
  getDisplayedAttackTargets,
  getDisplayedMoveTargets
} from '../../moveUtils'
import { PieceTypes, ObstacleTypes } from '../../../types'
import type { PlayerColor } from '../../../types'
import {
  createEmptyBoard,
  placePiece,
  placeObstacle,
  pos,
  BOTH_COLORS,
  DEFAULT_SIZE,
  forwardDirection,
  opponentOf,
  expectSamePositions,
  expectContainsPositions,
  expectExcludesPositions
} from '../helpers/boardFixtures'

describe('Hoplite', () => {
  it.each(BOTH_COLORS)('moves 3 steps forward on first move (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color, hasMoved: false })
    const dir = forwardDirection(color)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectSamePositions(moves, [
      pos(6 + dir, 5),
      pos(6 + dir * 2, 5),
      pos(6 + dir * 3, 5)
    ])
  })

  it.each(BOTH_COLORS)('moves 2 steps forward after first move (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color, hasMoved: true })
    const dir = forwardDirection(color)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectSamePositions(moves, [
      pos(6 + dir, 5),
      pos(6 + dir * 2, 5)
    ])
  })

  it.each(BOTH_COLORS)('cannot move sideways or backward (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color, hasMoved: true })
    const dir = forwardDirection(color)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectExcludesPositions(moves, [
      pos(6, 4),
      pos(6, 6),
      pos(6 - dir, 5)
    ])
  })

  it.each(BOTH_COLORS)('attacks the two forward diagonals at range 1 (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const enemy = opponentOf(color)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color })
    const dir = forwardDirection(color)
    placePiece(board, pos(6 + dir, 4), { type: PieceTypes.HOPLITE, color: enemy })
    placePiece(board, pos(6 + dir, 6), { type: PieceTypes.HOPLITE, color: enemy })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expectSamePositions(attacks, [pos(6 + dir, 4), pos(6 + dir, 6)])
  })

  it.each(BOTH_COLORS)('does not attack friendly pieces on the forward diagonals (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color })
    const dir = forwardDirection(color)
    placePiece(board, pos(6 + dir, 4), { type: PieceTypes.HOPLITE, color })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toHaveLength(0)
  })

  it.each(BOTH_COLORS)('does not attack straight ahead (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const enemy = opponentOf(color)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color })
    const dir = forwardDirection(color)
    placePiece(board, pos(6 + dir, 5), { type: PieceTypes.HOPLITE, color: enemy })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toHaveLength(0)
  })

  it('passes through cave and mystery box', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color: 'white', hasMoved: true })
    placeObstacle(board, pos(5, 5), ObstacleTypes.MYSTERY_BOX)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectContainsPositions(moves, [pos(5, 5), pos(4, 5)])
  })

  it.each([
    ObstacleTypes.RIVER,
    ObstacleTypes.LAKE,
    ObstacleTypes.CANYON,
    ObstacleTypes.TREE,
    ObstacleTypes.ROCK
  ])('is blocked by %s', (obstacle) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color: 'white', hasMoved: true })
    placeObstacle(board, pos(5, 5), obstacle)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectExcludesPositions(moves, [pos(5, 5), pos(4, 5)])
  })

  it('is blocked by a piece directly ahead', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color: 'white', hasMoved: true })
    placePiece(board, pos(5, 5), { type: PieceTypes.HOPLITE, color: 'white' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).toHaveLength(0)
  })

  it('zombie hoplite captures an enemy directly ahead', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color: 'white', hasMoved: true, isZombie: true })
    placePiece(board, pos(5, 5), { type: PieceTypes.HOPLITE, color: 'black' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).toContainEqual(pos(5, 5))
  })

  it('promotes to duchess when white hoplite reaches row 0', () => {
    const board = createEmptyBoard()
    const start = pos(1, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color: 'white', hasMoved: true, id: 'hoplite-1' })

    const { newBoard, move } = makeMove(board, start, pos(0, 5), DEFAULT_SIZE)

    const promoted = newBoard[0][5]
    expect(move.promotedTo).toBe(PieceTypes.DUCHESS)
    expect(promoted && 'type' in promoted && promoted.type).toBe(PieceTypes.DUCHESS)
    expect(promoted && 'promotedFromHoplite' in promoted && promoted.promotedFromHoplite).toBe(true)
    expect(promoted && 'id' in promoted && promoted.id).toBe('hoplite-1')
  })

  it('promotes to duchess when black hoplite reaches the last row', () => {
    const board = createEmptyBoard()
    const start = pos(10, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color: 'black', hasMoved: true })

    const { newBoard, move } = makeMove(board, start, pos(11, 5), DEFAULT_SIZE)

    expect(move.promotedTo).toBe(PieceTypes.DUCHESS)
    expect(newBoard[11][5] && 'type' in newBoard[11][5]! && newBoard[11][5]!.type).toBe(PieceTypes.DUCHESS)
  })

  it('does not promote after 3 hoplites have already been promoted in the game', () => {
    const board = createEmptyBoard()
    const start = pos(1, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color: 'white', hasMoved: true })
    placePiece(board, pos(0, 0), { type: PieceTypes.DUCHESS, color: 'white', promotedFromHoplite: true })
    placePiece(board, pos(0, 1), { type: PieceTypes.DUCHESS, color: 'white', promotedFromHoplite: true })
    placePiece(board, pos(0, 2), { type: PieceTypes.DUCHESS, color: 'white', promotedFromHoplite: true })

    const { newBoard, move } = makeMove(board, start, pos(0, 5), DEFAULT_SIZE, false, [], { white: [], black: [] })

    expect(move.promotedTo).toBeUndefined()
    expect(newBoard[0][5] && 'type' in newBoard[0][5]! && newBoard[0][5]!.type).toBe(PieceTypes.HOPLITE)
  })

  it('does not promote zombie hoplites on the enemy back row', () => {
    const board = createEmptyBoard()
    const start = pos(1, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color: 'white', hasMoved: true, isZombie: true })

    const { newBoard, move } = makeMove(board, start, pos(0, 5), DEFAULT_SIZE)

    expect(move.promotedTo).toBeUndefined()
    expect(newBoard[0][5] && 'type' in newBoard[0][5]! && newBoard[0][5]!.type).toBe(PieceTypes.HOPLITE)
  })

  it.each(BOTH_COLORS)('includes diagonal enemies as capture move targets (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const enemy = opponentOf(color)
    const hoplite = { type: PieceTypes.HOPLITE, color, hasMoved: true }
    placePiece(board, start, hoplite)
    const dir = forwardDirection(color)
    const leftDiagonal = pos(6 + dir, 4)
    const rightDiagonal = pos(6 + dir, 6)
    placePiece(board, leftDiagonal, { type: PieceTypes.HOPLITE, color: enemy })
    placePiece(board, rightDiagonal, { type: PieceTypes.HOPLITE, color: enemy })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectContainsPositions(moves, [leftDiagonal, rightDiagonal])
  })

  it('hides diagonal enemy squares from move highlights when attack mode is available', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const hoplite = { type: PieceTypes.HOPLITE, color: 'white' as const, hasMoved: true }
    const leftDiagonal = pos(5, 4)
    const rightDiagonal = pos(5, 6)
    placePiece(board, start, hoplite)
    placePiece(board, leftDiagonal, { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, rightDiagonal, { type: PieceTypes.HOPLITE, color: 'black' })

    const validMoves = getValidMoves(board, start, DEFAULT_SIZE)
    const displayedMoves = getDisplayedMoveTargets(board, validMoves, hoplite)

    expectContainsPositions(displayedMoves, [pos(5, 5), pos(4, 5)])
    expectExcludesPositions(displayedMoves, [leftDiagonal, rightDiagonal])
  })

  it('shows diagonal enemies in capture mode and ranged attacks in ranged mode', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const hoplite = { type: PieceTypes.HOPLITE, color: 'white' as const, hasMoved: true }
    const leftDiagonal = pos(5, 4)
    const rightDiagonal = pos(5, 6)
    placePiece(board, start, hoplite)
    placePiece(board, leftDiagonal, { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, rightDiagonal, { type: PieceTypes.HOPLITE, color: 'black' })

    const validMoves = getValidMoves(board, start, DEFAULT_SIZE)
    const validAttacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(getDisplayedAttackTargets(
      board,
      validMoves,
      validAttacks,
      hoplite,
      start,
      'ranged',
      DEFAULT_SIZE
    )).toEqual(validAttacks)

    expect(getDisplayedAttackTargets(
      board,
      validMoves,
      validAttacks,
      hoplite,
      start,
      'capture',
      DEFAULT_SIZE
    )).toEqual([leftDiagonal, rightDiagonal])
  })

  it('uses ranged attack in ranged mode without moving', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const target = pos(5, 4)
    const hoplite = { type: PieceTypes.HOPLITE, color: 'white' as const, hasMoved: true }
    const enemy = { type: PieceTypes.HOPLITE, color: 'black' as const }
    placePiece(board, start, hoplite)
    placePiece(board, target, enemy)

    const validMoves = getValidMoves(board, start, DEFAULT_SIZE)
    const validAttacks = getValidAttacks(board, start, DEFAULT_SIZE)
    const isValidMoveTarget = validMoves.some(move => move.row === target.row && move.col === target.col)
    const isValidAttackTarget = validAttacks.some(attack => attack.row === target.row && attack.col === target.col)

    const result = resolveAttackModeAction(
      hoplite,
      enemy,
      isValidMoveTarget,
      isValidAttackTarget,
      'ranged'
    )

    expect(result).toEqual({
      allowed: true,
      shouldUseRangedAttack: true,
      shouldUseMoveCapture: false
    })

    const { newBoard, move } = makeMove(board, start, target, DEFAULT_SIZE, true)
    expect(move.isAttack).toBe(true)
    expect(newBoard[start.row][start.col] && 'type' in newBoard[start.row][start.col]! && newBoard[start.row][start.col]!.type).toBe(PieceTypes.HOPLITE)
    expect(newBoard[target.row][target.col]).toBeNull()
  })

  it('uses capture and move in capture mode', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const target = pos(5, 4)
    const hoplite = { type: PieceTypes.HOPLITE, color: 'white' as const, hasMoved: true }
    const enemy = { type: PieceTypes.HOPLITE, color: 'black' as const }
    placePiece(board, start, hoplite)
    placePiece(board, target, enemy)

    const validMoves = getValidMoves(board, start, DEFAULT_SIZE)
    const validAttacks = getValidAttacks(board, start, DEFAULT_SIZE)
    const isValidMoveTarget = validMoves.some(move => move.row === target.row && move.col === target.col)
    const isValidAttackTarget = validAttacks.some(attack => attack.row === target.row && attack.col === target.col)

    const result = resolveAttackModeAction(
      hoplite,
      enemy,
      isValidMoveTarget,
      isValidAttackTarget,
      'capture'
    )

    expect(result).toEqual({
      allowed: true,
      shouldUseRangedAttack: false,
      shouldUseMoveCapture: true
    })

    const { newBoard, move } = makeMove(board, start, target, DEFAULT_SIZE, false)
    expect(move.captured?.type).toBe(PieceTypes.HOPLITE)
    expect(newBoard[target.row][target.col] && 'type' in newBoard[target.row][target.col]! && newBoard[target.row][target.col]!.type).toBe(PieceTypes.HOPLITE)
    expect(newBoard[start.row][start.col]).toBeNull()
  })

})
