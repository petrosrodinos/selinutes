import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * Terrain height function using overlapping sine/cosine waves.
 *
 * Architecture: Exported separately so that pieces, obstacles, and click
 * regions can all query the same height at any world (x, z) coordinate.
 * This decouples the visual surface from the game grid while keeping a
 * single source of truth for "what height is the ground here?"
 *
 * Multiple frequencies create organic non-repeating hills.
 * Overall range ≈ ±0.5 units — subtle enough not to obscure gameplay.
 */
export const getTerrainHeight = (x: number, z: number): number => {
  return (
    Math.sin(x * 0.28 + 0.5)            * 0.32 +
    Math.cos(z * 0.22 - 0.3)            * 0.28 +
    Math.sin(x * 0.13 + z * 0.17)       * 0.38 +
    Math.cos(x * 0.24 - z * 0.19 + 1.2) * 0.22
  ) * 0.48
}

/**
 * Maps terrain height to a vertex colour.
 *   Low  (valleys)   → earthy dark brown
 *   Mid  (plains)    → grass green
 *   High (hills)     → lighter green / pale stone
 */
const heightToColor = (h: number): [number, number, number] => {
  // Normalise height to 0–1
  const t = (h + 0.55) / 1.1

  if (t < 0.25) {
    const s = t / 0.25
    return [0.26 + s * 0.04, 0.18 + s * 0.08, 0.07 + s * 0.02]
  }

  if (t < 0.60) {
    const s = (t - 0.25) / 0.35
    return [0.20 + s * 0.09, 0.32 + s * 0.18, 0.07 + s * 0.05]
  }

  const s = (t - 0.60) / 0.40
  return [0.29 + s * 0.22, 0.50 + s * 0.14, 0.13 + s * 0.14]
}

interface TerrainProps {
  /** Total width along X — should extend beyond the game board */
  worldWidth: number
  /** Total depth along Z — should extend beyond the game board */
  worldDepth: number
}

/**
 * Terrain component: replaces the flat tiled game board with a procedural
 * ground mesh.  Vertex displacement and vertex colouring give the impression
 * of real geography without any external assets or textures.
 *
 * Architecture change: The old approach rendered one BoxGeometry per grid
 * cell (chess-board pattern).  This renders a single high-resolution plane
 * with per-vertex height & colour.  Game logic remains grid-based; only the
 * visual representation is "open world."
 */
export const Terrain = ({ worldWidth, worldDepth }: TerrainProps) => {
  const geometry = useMemo(() => {
    // ~5 segments per world unit gives smooth but performance-friendly hills
    const segX = Math.round(worldWidth * 5)
    const segZ = Math.round(worldDepth * 5)

    const geo = new THREE.PlaneGeometry(worldWidth, worldDepth, segX, segZ)
    // Plane is XY by default — rotate to lie flat on XZ
    geo.rotateX(-Math.PI / 2)

    const pos    = geo.attributes.position as THREE.BufferAttribute
    const colors = new Float32Array(pos.count * 3)

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const h = getTerrainHeight(x, z)

      pos.setY(i, h)

      const [r, g, b] = heightToColor(h)
      colors[i * 3]     = r
      colors[i * 3 + 1] = g
      colors[i * 3 + 2] = b
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [worldWidth, worldDepth])

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.88}
        metalness={0}
      />
    </mesh>
  )
}
