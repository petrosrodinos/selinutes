import type { Move, PieceType, Position } from '../types'
import { PIECE_PROJECTILE_TYPES, type ProjectileType } from '../constants/projectileTypes'

export const getAttackChebyshevDistance = (from: Position, to: Position): number =>
  Math.max(Math.abs(to.row - from.row), Math.abs(to.col - from.col))

export const isProjectileRangedAttack = (move: Move): boolean => {
  if (!move.isAttack || move.isFreeze || move.terminatedByNarc) return false
  return getAttackChebyshevDistance(move.from, move.to) > 1
}

export const getProjectileTypeForPiece = (pieceType: PieceType): ProjectileType =>
  PIECE_PROJECTILE_TYPES[pieceType]

export const getSquareCenterPx = (
  position: Position,
  squareSize: number
): { x: number; y: number } => ({
  x: (position.col + 0.5) * squareSize,
  y: (position.row + 0.5) * squareSize
})

export const getProjectileAngleDeg = (from: Position, to: Position): number => {
  const dx = to.col - from.col
  const dy = to.row - from.row
  return (Math.atan2(dy, dx) * 180) / Math.PI
}

export const getProjectileDurationSec = (from: Position, to: Position): number => {
  const distance = getAttackChebyshevDistance(from, to)
  return Math.min(0.85, 0.12 + distance * 0.055)
}
