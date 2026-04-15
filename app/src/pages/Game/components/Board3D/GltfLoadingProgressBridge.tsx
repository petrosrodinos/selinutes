import { useEffect } from 'react'
import { useProgress } from '@react-three/drei'

interface GltfLoadingProgressBridgeProps {
  onLoadingChange: (loading: boolean) => void
}

/**
 * Drei's useProgress tracks Three's DefaultLoadingManager (used by GLTFLoader / useGLTF).
 * Fires even when models were preloaded — use this to show a DOM overlay until work is done.
 */
export const GltfLoadingProgressBridge = ({ onLoadingChange }: GltfLoadingProgressBridgeProps) => {
  const { active, loaded, total } = useProgress()
  useEffect(() => {
    const hasPendingAssets = total > 0 && loaded < total
    onLoadingChange(active || hasPendingAssets)
  }, [active, loaded, total, onLoadingChange])
  return null
}
