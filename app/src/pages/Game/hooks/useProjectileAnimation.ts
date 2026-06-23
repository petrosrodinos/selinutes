import { useCallback, useEffect, useRef, useState } from 'react'
import type { Move, PlayerColor, Position } from '../types'
import type { ProjectileType } from '../constants/projectileTypes'
import { getProjectileTypeForPiece, isProjectileRangedAttack } from '../utils/projectile.utils'

export interface ActiveProjectile {
  id: string
  from: Position
  to: Position
  type: ProjectileType
  playerColor: PlayerColor
}

export const useProjectileAnimation = (lastMove: Move | null | undefined) => {
  const [projectiles, setProjectiles] = useState<ActiveProjectile[]>([])
  const moveCountRef = useRef(0)
  const projectileSeqRef = useRef(0)

  useEffect(() => {
    if (!lastMove) return

    const currentCount = moveCountRef.current
    moveCountRef.current += 1
    if (currentCount === 0) return
    if (!isProjectileRangedAttack(lastMove)) return

    projectileSeqRef.current += 1
    const id = `projectile-${lastMove.from.row}-${lastMove.from.col}-${lastMove.to.row}-${lastMove.to.col}-${projectileSeqRef.current}`

    setProjectiles(prev => [
      ...prev,
      {
        id,
        from: lastMove.from,
        to: lastMove.to,
        type: getProjectileTypeForPiece(lastMove.piece.type),
        playerColor: lastMove.piece.color
      }
    ])
  }, [lastMove])

  const removeProjectile = useCallback((id: string) => {
    setProjectiles(prev => prev.filter(projectile => projectile.id !== id))
  }, [])

  return { projectiles, removeProjectile }
}
