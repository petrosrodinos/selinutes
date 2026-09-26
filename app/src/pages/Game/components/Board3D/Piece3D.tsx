import { memo, useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import * as THREE from 'three'
import type { FigureTierKey } from '../../../../constants/figures'
import { FigureTiers } from '../../../../constants/figures'
import type { PieceType, PlayerColor } from '../../types'
import { PlayerColors, PieceTypes } from '../../types'
import { getPieceGlbUrl } from './board3dGltfUrls'
import { getPiece3DBoardFacingY, getPiece3DRulesPreviewFacingY } from './piece3dOrientation.utils'

interface Piece3DProps {
  type: PieceType
  color: PlayerColor
  tier: FigureTierKey
  position: [number, number, number]
  isSelected: boolean
  isHint: boolean
  isTargeted: boolean
  isSwapTarget: boolean
  onClick: () => void
  /** Static rules-page preview: skip lerp / animation logic in useFrame */
  rulesPreview?: boolean
}

export { PIECE_GLB_URLS } from './board3dGltfUrls'

export function preloadPieceGltfPair(type: PieceType, tier: FigureTierKey = FigureTiers.TIER1): void {
  useGLTF.preload(getPieceGlbUrl(type, PlayerColors.WHITE, tier))
  useGLTF.preload(getPieceGlbUrl(type, PlayerColors.BLACK, tier))
}

const GLBPiece = memo(function GLBPiece({
  url,
  rotationY,
  scale = 1.4,
}: {
  url: string
  rotationY: number
  scale?: number
}) {
  const { scene } = useGLTF(url)
  const cloned = useMemo(() => scene.clone(true), [scene])

  return <primitive object={cloned} scale={scale} position-y={0.7} rotation-y={rotationY} />
})

export const Piece3D = ({
  type,
  color,
  tier,
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
  const invalidate = useThree((state) => state.invalidate)

  const [px, py, pz] = position

  if (!rulesPreview && currentPosRef.current === null) {
    currentPosRef.current = new THREE.Vector3(...position)
  }

  if (
    !rulesPreview &&
    (targetPosRef.current.x !== px ||
      targetPosRef.current.y !== py ||
      targetPosRef.current.z !== pz)
  ) {
    targetPosRef.current.set(px, py, pz)
  }

  // On-demand rendering: when the target position changes (a move), request the
  // frames needed to animate the piece into place. Once it arrives the loop stops
  // invalidating, so an idle board renders nothing.
  useEffect(() => {
    if (!rulesPreview) invalidate()
  }, [px, py, pz, rulesPreview, invalidate])

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    if (rulesPreview) {
      group.position.set(px, py, pz)
      group.rotation.y = 0
      return
    }

    const current = currentPosRef.current
    if (!current) return

    const target = targetPosRef.current
    if (current.distanceToSquared(target) < 1e-8) {
      group.position.copy(target)
      group.rotation.y = 0
      return
    }

    const dt = Math.min(Math.max(delta, 1e-6), 0.1)
    const lerpFactor = 1 - Math.pow(0.001, dt)
    current.lerp(target, lerpFactor)
    group.position.copy(current)
    group.rotation.y = 0

    // Still moving — keep the frame loop alive for the next step.
    state.invalidate()
  })

  const url = getPieceGlbUrl(type, color, tier)
  const boardFacingY = getPiece3DBoardFacingY(type, color, tier)
  const rotationY = rulesPreview ? getPiece3DRulesPreviewFacingY(type) + Math.PI : boardFacingY
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
          <ringGeometry args={[0.28, 0.38, 16]} />
          <meshBasicMaterial color="#ffd700" transparent opacity={0.9} />
        </mesh>
      )}
      {isHint && !isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.28, 0.38, 16]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.9} />
        </mesh>
      )}
      {isTargeted && !isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.4, 16]} />
          <meshBasicMaterial color="#ff4444" transparent opacity={0.9} />
        </mesh>
      )}
      {isSwapTarget && !isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.4, 16]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  )
}
