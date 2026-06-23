import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { PlayerColor, Position } from '../../types'
import type { ProjectileType } from '../../constants/projectileTypes'
import {
  getProjectileAngleDeg,
  getProjectileDurationSec,
  getSquareCenterPx
} from '../../utils/projectile.utils'
import { getProjectileVisual } from './projectileRegistry'

export interface ProjectileInstanceProps {
  id: string
  from: Position
  to: Position
  type: ProjectileType
  playerColor: PlayerColor
  squareSize: number
  onComplete: (id: string) => void
}

export const ProjectileInstance = ({
  id,
  from,
  to,
  type,
  playerColor,
  squareSize,
  onComplete
}: ProjectileInstanceProps) => {
  const fromPx = useMemo(() => getSquareCenterPx(from, squareSize), [from, squareSize])
  const toPx = useMemo(() => getSquareCenterPx(to, squareSize), [to, squareSize])
  const angleDeg = useMemo(() => getProjectileAngleDeg(from, to), [from, to])
  const duration = useMemo(() => getProjectileDurationSec(from, to), [from, to])
  const Visual = getProjectileVisual(type)
  const projectileSize = Math.max(14, Math.round(squareSize * 0.42))

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ zIndex: 25, width: projectileSize, height: projectileSize }}
      initial={{
        left: fromPx.x - projectileSize / 2,
        top: fromPx.y - projectileSize / 2,
        opacity: 0.85,
        scale: 0.75
      }}
      animate={{
        left: toPx.x - projectileSize / 2,
        top: toPx.y - projectileSize / 2,
        opacity: 1,
        scale: 1
      }}
      transition={{ duration, ease: 'linear' }}
      onAnimationComplete={() => onComplete(id)}
    >
      <Visual playerColor={playerColor} angleDeg={angleDeg} size={projectileSize} />
    </motion.div>
  )
}
