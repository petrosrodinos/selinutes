import type { ComponentType } from 'react'
import { ProjectileTypes, type ProjectileType } from '../../constants/projectileTypes'
import { DefaultProjectile, type ProjectileVisualProps } from './DefaultProjectile'

export type ProjectileVisualComponent = ComponentType<ProjectileVisualProps>

export const PROJECTILE_VISUALS: Record<ProjectileType, ProjectileVisualComponent> = {
  [ProjectileTypes.DEFAULT]: DefaultProjectile,
  [ProjectileTypes.ARROW]: DefaultProjectile,
  [ProjectileTypes.FIREBALL]: DefaultProjectile,
  [ProjectileTypes.CANNON_BALL]: DefaultProjectile
}

export const getProjectileVisual = (type: ProjectileType): ProjectileVisualComponent =>
  PROJECTILE_VISUALS[type] ?? DefaultProjectile
