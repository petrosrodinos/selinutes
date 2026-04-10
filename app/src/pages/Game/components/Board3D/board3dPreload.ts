import { useGLTF } from '@react-three/drei'
import { OBSTACLE_GLB_URLS, PIECE_GLB_URLS } from './board3dGltfUrls'

export function preloadBoard3DGltfs(): void {
  for (const url of PIECE_GLB_URLS) {
    useGLTF.preload(url)
  }
  for (const url of OBSTACLE_GLB_URLS) {
    useGLTF.preload(url)
  }
}
