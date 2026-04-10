import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import type { ObstacleType } from '../../types'
import { ObstacleTypes } from '../../types'
import { OBSTACLE_COLORS } from '../../constants'

import canyonGLB from '../../../../assets/figures/Canyon/base/variant-A/mesh.glb'
import caveGLB from '../../../../assets/figures/Cave/base/variant-A/mesh.glb'
import lakeGLB from '../../../../assets/figures/Lake/base/variant-A/mesh.glb'
import riverGLB from '../../../../assets/figures/River/base/variant-A/mesh.glb'
import treeGLB from '../../../../assets/figures/Tree/base/variant-A/mesh.glb'

export const OBSTACLE_GLB_URLS: readonly string[] = [canyonGLB, caveGLB, lakeGLB, riverGLB, treeGLB]

interface Obstacle3DProps {
  type: ObstacleType
  position: [number, number, number]
}

const GLBObstacle = ({ url, scale = 1.4, positionY = 0.4 }: { url: string; scale?: number; positionY?: number }) => {
  const { scene } = useGLTF(url)
  const cloned = useMemo(() => scene.clone(true), [scene])

  return <primitive object={cloned} scale={scale} position-y={positionY} rotation-y={Math.PI / 2} />
}

const AnimatedRiver = () => {
  const ref = useRef<Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02
    }
  })
  return (
    <group ref={ref}>
      <GLBObstacle url={riverGLB} scale={0.95} positionY={0.08} />
    </group>
  )
}

const AnimatedLake = () => {
  const ref = useRef<Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })
  return (
    <group ref={ref}>
      <GLBObstacle url={lakeGLB} scale={0.95} positionY={0.08} />
    </group>
  )
}

const Rock = ({ color }: { color: string }) => (
  <group position={[0, 0.08, 0]}>
    <mesh position={[0, 0.08, 0]}>
      <dodecahedronGeometry args={[0.28, 0]} />
      <meshStandardMaterial color={color} roughness={0.9} flatShading />
    </mesh>
    <mesh position={[0.16, 0.04, 0.1]}>
      <dodecahedronGeometry args={[0.14, 0]} />
      <meshStandardMaterial color={color} roughness={0.9} flatShading />
    </mesh>
  </group>
)

const MysteryBox = ({ color }: { color: string }) => {
  const ref = useRef<Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 1.5
      ref.current.position.y = 0.25 + Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })
  return (
    <group ref={ref} position={[0, 0.25, 0]}>
      <mesh>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.31, 0.31, 0.31]} />
        <meshBasicMaterial color="#ffd700" wireframe />
      </mesh>
    </group>
  )
}

export const Obstacle3D = ({ type, position }: Obstacle3DProps) => {
  const color = OBSTACLE_COLORS[type]

  const content = (() => {
    switch (type) {
      case ObstacleTypes.CANYON:     return <GLBObstacle url={canyonGLB} scale={0.9} />
      case ObstacleTypes.CAVE:       return <GLBObstacle url={caveGLB} scale={0.9} />
      case ObstacleTypes.TREE:       return <GLBObstacle url={treeGLB} scale={1.4} />
      case ObstacleTypes.RIVER:      return <AnimatedRiver />
      case ObstacleTypes.LAKE:       return <AnimatedLake />
      case ObstacleTypes.ROCK:       return <Rock color={color} />
      case ObstacleTypes.MYSTERY_BOX: return <MysteryBox color={color} />
    }
  })()

  return <group position={position}>{content}</group>
}
