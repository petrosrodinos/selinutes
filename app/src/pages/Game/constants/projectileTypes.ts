import { PieceTypes, type PieceType } from '../types'

export const ProjectileTypes = {
  DEFAULT: 'default',
  ARROW: 'arrow',
  FIREBALL: 'fireball',
  CANNON_BALL: 'cannonBall'
} as const

export type ProjectileType = typeof ProjectileTypes[keyof typeof ProjectileTypes]

export const PIECE_PROJECTILE_TYPES: Record<PieceType, ProjectileType> = {
  [PieceTypes.HOPLITE]: ProjectileTypes.DEFAULT,
  [PieceTypes.RAM_TOWER]: ProjectileTypes.DEFAULT,
  [PieceTypes.CHARIOT]: ProjectileTypes.DEFAULT,
  [PieceTypes.BOMBER]: ProjectileTypes.DEFAULT,
  [PieceTypes.PALADIN]: ProjectileTypes.DEFAULT,
  [PieceTypes.WARLOCK]: ProjectileTypes.DEFAULT,
  [PieceTypes.MONARCH]: ProjectileTypes.DEFAULT,
  [PieceTypes.DUCHESS]: ProjectileTypes.DEFAULT,
  [PieceTypes.NECROMANCER]: ProjectileTypes.DEFAULT
}
