import { useGLTF } from '@react-three/drei'
import type { FigureTierKey } from '../../../../constants/figures'
import { FigureTiers } from '../../../../constants/figures'
import { collectPieceGlbUrlsForTiers, OBSTACLE_GLB_URLS } from './board3dGltfUrls'

export function preloadBoard3DGltfs(
  whiteTier: FigureTierKey = FigureTiers.TIER1,
  blackTier: FigureTierKey = FigureTiers.TIER1,
): void {
  for (const url of collectPieceGlbUrlsForTiers(whiteTier, blackTier)) {
    useGLTF.preload(url)
  }
  for (const url of OBSTACLE_GLB_URLS) {
    useGLTF.preload(url)
  }
}
