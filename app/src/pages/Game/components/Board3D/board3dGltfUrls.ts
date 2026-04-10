import type { PieceType } from '../../types'
import { PieceTypes } from '../../types'

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

import canyonGLB from '../../../../assets/figures/Canyon/base/variant-A/mesh.glb'
import caveGLB from '../../../../assets/figures/Cave/base/variant-A/mesh.glb'
import lakeGLB from '../../../../assets/figures/Lake/base/variant-A/mesh.glb'
import riverGLB from '../../../../assets/figures/River/base/variant-A/mesh.glb'
import treeGLB from '../../../../assets/figures/Tree/base/variant-A/mesh.glb'

export const pieceGLBMap: Record<PieceType, { white: string; black: string }> = {
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

export const PIECE_GLB_URLS: readonly string[] = Object.values(pieceGLBMap).flatMap((pair) => [
  pair.white,
  pair.black,
])

export { canyonGLB, caveGLB, lakeGLB, riverGLB, treeGLB }

export const OBSTACLE_GLB_URLS: readonly string[] = [canyonGLB, caveGLB, lakeGLB, riverGLB, treeGLB]
