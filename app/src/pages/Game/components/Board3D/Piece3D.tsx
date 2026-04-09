import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import * as THREE from 'three'
import type { PieceType, PlayerColor } from '../../types'
import { PlayerColors, PieceTypes } from '../../types'

import bomberA from '../../../../assets/figures/Bomber/base/variant-A/mesh.glb'
import bomberB from '../../../../assets/figures/Bomber/base/variant-B/mesh.glb'
import chariotA from '../../../../assets/figures/Chariot/base/variant-A/mesh.glb'
import chariotB from '../../../../assets/figures/Chariot/base/variant-B/mesh.glb'
import duchessA from '../../../../assets/figures/Duchess/base/variant-A/mesh.glb'
import duchessB from '../../../../assets/figures/Duchess/base/variant-B/mesh.glb'
import hopliteA from '../../../../assets/figures/Hoplite/base/variant-A/mesh.glb'
import hopliteB from '../../../../assets/figures/Hoplite/base/variant-B/mesh.glb'
import monarchA from '../../../../assets/figures/Monarch/base/variant-A/mesh.glb'
import monarchB from '../../../../assets/figures/Monarch/base/variant-B/mesh.glb'
import necromancerA from '../../../../assets/figures/Necromancer/base/variant-A/mesh.glb'
import necromancerB from '../../../../assets/figures/Necromancer/base/variant-B/mesh.glb'
import paladinA from '../../../../assets/figures/Paladin/base/variant-A/mesh.glb'
import paladinB from '../../../../assets/figures/Paladin/base/variant-B/mesh.glb'
import ramTowerA from '../../../../assets/figures/Ram-Tower/base/variant-A/mesh.glb'
import ramTowerB from '../../../../assets/figures/Ram-Tower/base/variant-B/mesh.glb'
import warlockA from '../../../../assets/figures/Warlock/base/variant-A/mesh.glb'
import warlockB from '../../../../assets/figures/Warlock/base/variant-B/mesh.glb'

interface Piece3DProps {
  type: PieceType
  color: PlayerColor
  position: [number, number, number]
  isSelected: boolean
  isHint: boolean
  isTargeted: boolean
  isSwapTarget: boolean
  onClick: () => void
  /** Static rules-page preview: skip lerp / animation logic in useFrame */
  rulesPreview?: boolean
}

const pieceGLBMap: Record<PieceType, { white: string; black: string }> = {
  [PieceTypes.BOMBER]:      { white: bomberA,      black: bomberB },
  [PieceTypes.CHARIOT]:     { white: chariotA,     black: chariotB },
  [PieceTypes.DUCHESS]:     { white: duchessA,     black: duchessB },
  [PieceTypes.HOPLITE]:     { white: hopliteA,     black: hopliteB },
  [PieceTypes.MONARCH]:     { white: monarchA,     black: monarchB },
  [PieceTypes.NECROMANCER]: { white: necromancerA, black: necromancerB },
  [PieceTypes.PALADIN]:     { white: paladinA,     black: paladinB },
  [PieceTypes.RAM_TOWER]:   { white: ramTowerA,    black: ramTowerB },
  [PieceTypes.WARLOCK]:     { white: warlockA,     black: warlockB },
}

const GLBPiece = ({ url, rotationY, scale = 1.4 }: { url: string; rotationY: number; scale?: number }) => {
  const { scene } = useGLTF(url)
  const cloned = useMemo(() => scene.clone(true), [scene])

  return <primitive object={cloned} scale={scale} position-y={0.7} rotation-y={rotationY} />
}

export const Piece3D = ({
  type,
  color,
  position,
  isSelected,
  isHint,
  isTargeted,
  isSwapTarget,
  onClick,
  rulesPreview = false,
}: Piece3DProps) => {
  const groupRef = useRef<Group>(null)
  const currentPosRef = useRef<THREE.Vector3 | null>(null)
  const targetPosRef = useRef<THREE.Vector3>(new THREE.Vector3(...position))

  if (!rulesPreview && currentPosRef.current === null) {
    currentPosRef.current = new THREE.Vector3(...position)
  }

  if (
    !rulesPreview &&
    (targetPosRef.current.x !== position[0] ||
      targetPosRef.current.y !== position[1] ||
      targetPosRef.current.z !== position[2])
  ) {
    targetPosRef.current.set(...position)
  }

  useFrame((state, delta) => {
    if (!groupRef.current) return

    if (rulesPreview) {
      const [x, y, z] = position
      groupRef.current.position.set(x, y, z)
      groupRef.current.rotation.y = 0
      return
    }

    if (!currentPosRef.current) return

    const dt = Math.min(Math.max(delta, 1e-6), 0.1)
    const lerpFactor = 1 - Math.pow(0.001, dt)
    currentPosRef.current.lerp(targetPosRef.current, lerpFactor)

    groupRef.current.position.x = currentPosRef.current.x
    groupRef.current.position.z = currentPosRef.current.z

    const baseY = currentPosRef.current.y
    if (isSelected) {
      groupRef.current.position.y = baseY + 0.15 + Math.sin(state.clock.elapsedTime * 3) * 0.08
      groupRef.current.rotation.y = state.clock.elapsedTime * 2
    } else if (isHint) {
      groupRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 4) * 0.05
      groupRef.current.rotation.y = 0
    } else if (isSwapTarget) {
      groupRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 4) * 0.04
      groupRef.current.rotation.y = 0
    } else if (isTargeted) {
      groupRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 5) * 0.03
      groupRef.current.rotation.y = 0
    } else {
      groupRef.current.position.y = baseY
      groupRef.current.rotation.y = 0
    }
  })

  const urls = pieceGLBMap[type]
  const url = urls[color === PlayerColors.WHITE ? 'white' : 'black']
  const baseRotation = color === PlayerColors.WHITE ? Math.PI / 2 : -Math.PI / 2
  // Chariot model already faces Z axis — use 0/π instead of the ±π/2 used by other pieces
  const boardFacingY =
    type === PieceTypes.CHARIOT
      ? (color === PlayerColors.WHITE ? 0 : Math.PI)
      : baseRotation
  // Rules preview: same frontal yaw for light and dark (black’s board yaw is −white’s, so +π on both used to flip only white)
  const whiteBoardFacingY = type === PieceTypes.CHARIOT ? 0 : Math.PI / 2
  const rotationY = rulesPreview ? whiteBoardFacingY + Math.PI : boardFacingY
  const pieceScale = type === PieceTypes.CHARIOT ? 1.2 : 1.4

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <GLBPiece url={url} rotationY={rotationY} scale={pieceScale} />
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.28, 0.38, 32]} />
          <meshBasicMaterial color="#ffd700" transparent opacity={0.9} />
        </mesh>
      )}
      {isHint && !isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.28, 0.38, 32]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.9} />
        </mesh>
      )}
      {isTargeted && !isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.4, 32]} />
          <meshBasicMaterial color="#ff4444" transparent opacity={0.9} />
        </mesh>
      )}
      {isSwapTarget && !isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.4, 32]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  )
}
