import { describe, it, expect } from 'vitest'
import { PieceTypes } from '../../types'
import {
  getAttackChebyshevDistance,
  getProjectileDurationSec,
  getProjectileTypeForPiece,
  isProjectileRangedAttack
} from '../projectile.utils'
import { ProjectileTypes } from '../../constants/projectileTypes'

describe('projectile.utils', () => {
  it('detects ranged attacks beyond adjacent squares', () => {
    expect(
      isProjectileRangedAttack({
        from: { row: 6, col: 5 },
        to: { row: 6, col: 8 },
        piece: { id: '1', type: PieceTypes.RAM_TOWER, color: 'white' },
        captured: { id: '2', type: PieceTypes.HOPLITE, color: 'black' },
        isAttack: true
      })
    ).toBe(true)
  })

  it('skips adjacent melee ranged-flag attacks', () => {
    expect(
      isProjectileRangedAttack({
        from: { row: 6, col: 5 },
        to: { row: 6, col: 6 },
        piece: { id: '1', type: PieceTypes.HOPLITE, color: 'white' },
        captured: { id: '2', type: PieceTypes.HOPLITE, color: 'black' },
        isAttack: true
      })
    ).toBe(false)
  })

  it('skips move captures and freeze actions', () => {
    expect(
      isProjectileRangedAttack({
        from: { row: 6, col: 5 },
        to: { row: 4, col: 5 },
        piece: { id: '1', type: PieceTypes.RAM_TOWER, color: 'white' },
        captured: { id: '2', type: PieceTypes.HOPLITE, color: 'black' },
        isAttack: false
      })
    ).toBe(false)

    expect(
      isProjectileRangedAttack({
        from: { row: 6, col: 5 },
        to: { row: 2, col: 5 },
        piece: { id: '1', type: PieceTypes.NECROMANCER, color: 'white' },
        isAttack: false,
        isFreeze: true,
        freezeTurns: 2
      })
    ).toBe(false)
  })

  it('maps every piece to a projectile type', () => {
    for (const pieceType of Object.values(PieceTypes)) {
      expect(getProjectileTypeForPiece(pieceType)).toBe(ProjectileTypes.DEFAULT)
    }
  })

  it('scales duration with attack distance', () => {
    const near = getProjectileDurationSec({ row: 0, col: 0 }, { row: 0, col: 2 })
    const far = getProjectileDurationSec({ row: 0, col: 0 }, { row: 0, col: 8 })
    expect(far).toBeGreaterThan(near)
    expect(getAttackChebyshevDistance({ row: 0, col: 0 }, { row: 2, col: 3 })).toBe(3)
  })
})
