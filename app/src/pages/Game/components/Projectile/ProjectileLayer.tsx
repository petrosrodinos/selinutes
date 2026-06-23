import type { ActiveProjectile } from '../../hooks/useProjectileAnimation'
import { ProjectileInstance } from './ProjectileInstance'

interface ProjectileLayerProps {
  projectiles: ActiveProjectile[]
  squareSize: number
  onProjectileComplete: (id: string) => void
}

export const ProjectileLayer = ({
  projectiles,
  squareSize,
  onProjectileComplete
}: ProjectileLayerProps) => {
  if (projectiles.length === 0) return null

  return (
    <>
      {projectiles.map(projectile => (
        <ProjectileInstance
          key={projectile.id}
          id={projectile.id}
          from={projectile.from}
          to={projectile.to}
          type={projectile.type}
          playerColor={projectile.playerColor}
          squareSize={squareSize}
          onComplete={onProjectileComplete}
        />
      ))}
    </>
  )
}
