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
  const { active } = useProgress()
  useEffect(() => {
    onLoadingChange(active)
  }, [active, onLoadingChange])
  return null
}
