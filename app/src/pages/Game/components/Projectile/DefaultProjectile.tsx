import type { PlayerColor } from '../../types'
import { PlayerColors } from '../../types'

export interface ProjectileVisualProps {
  playerColor: PlayerColor
  angleDeg: number
  size: number
}

export const DefaultProjectile = ({ playerColor, angleDeg, size }: ProjectileVisualProps) => {
  const isWhite = playerColor === PlayerColors.WHITE
  const coreColor = isWhite ? '#fbbf24' : '#94a3b8'
  const glowColor = isWhite ? 'rgba(251, 191, 36, 0.55)' : 'rgba(148, 163, 184, 0.5)'
  const tailColor = isWhite ? 'rgba(245, 158, 11, 0.35)' : 'rgba(100, 116, 139, 0.35)'

  return (
    <div
      className="pointer-events-none relative"
      style={{
        width: size,
        height: size,
        transform: `rotate(${angleDeg}deg)`,
        transformOrigin: 'center center'
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size * 0.45,
          height: size * 0.45,
          background: `radial-gradient(circle at 35% 35%, #fff 0%, ${coreColor} 45%, ${coreColor} 100%)`,
          boxShadow: `0 0 ${size * 0.35}px ${glowColor}, 0 0 ${size * 0.15}px ${glowColor}`
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size * 1.1,
          height: size * 0.22,
          marginLeft: -size * 1.05,
          background: `linear-gradient(90deg, transparent 0%, ${tailColor} 55%, ${glowColor} 100%)`
        }}
      />
    </div>
  )
}
