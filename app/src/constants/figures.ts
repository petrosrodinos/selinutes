export const FigureTiers = {
  TIER1: 'tier1',
  TIER2: 'tier2',
  TIER3: 'tier3',
  TIER4: 'tier4',
  TIER5: 'tier5',
} as const

export type FigureTierKey = typeof FigureTiers[keyof typeof FigureTiers]

export const FIGURE_TIER_ORDER = [
  FigureTiers.TIER1,
  FigureTiers.TIER2,
  FigureTiers.TIER3,
  FigureTiers.TIER4,
  FigureTiers.TIER5,
] as const

export const LEVELS_PER_FIGURE_TIER = 9

export const FIGURE_TIER_NAMES: Record<FigureTierKey, string> = {
  [FigureTiers.TIER1]: 'Bronze',
  [FigureTiers.TIER2]: 'Silver',
  [FigureTiers.TIER3]: 'Ruby',
  [FigureTiers.TIER4]: 'Sapphire',
  [FigureTiers.TIER5]: 'Emerald',
}

type FigureTierSkins = {
  readonly variant_a: string
  readonly variant_b: string
}

export const FIGURE_TIER_SKINS: Record<FigureTierKey, FigureTierSkins> = {
  [FigureTiers.TIER1]: { variant_a: 'Yellow', variant_b: 'Green' },
  [FigureTiers.TIER2]: { variant_a: 'Red', variant_b: 'Purple' },
  [FigureTiers.TIER3]: { variant_a: 'Blue', variant_b: 'Orange' },
  [FigureTiers.TIER4]: { variant_a: 'Giant', variant_b: 'Aqua' },
  [FigureTiers.TIER5]: { variant_a: 'Fairy', variant_b: 'Vampire' },
}

export const FigureAssetFolders = {
  BOMBER: 'Bomber',
  CHARIOT: 'Chariot',
  DUCHESS: 'Duchess',
  HOPLITE: 'Hoplite',
  MONARCH: 'Monarch',
  NECROMANCER: 'Necromancer',
  PALADIN: 'Paladin',
  RAM_TOWER: 'Ram-Tower',
  WARLOCK: 'Warlock',
  CANYON: 'Canyon',
  CAVE: 'Cave',
  RIVER: 'River',
  TREE: 'Tree',
  LAKE: 'Lake',
  ROCK: 'Rock',
  MYSTERY_BOX: 'MysteryBox',
} as const

export type FigureAssetFolder = typeof FigureAssetFolders[keyof typeof FigureAssetFolders]

const FIGURES_ASSET_ROOT = 'figures' as const
const FIGURE_3D_SKINS_ASSET_ROOT = 'figure-3d-skins' as const

const FigureAssetFormats = {
  TWO_D: '2d',
  THREE_D: '3d',
  FIGURE_PNG: 'figure.png',
  MESH_GLB: 'mesh.glb',
} as const

const FigureVariants = {
  A: 'variant-A',
  B: 'variant-B',
} as const

type FigureVariantAssets = {
  readonly variant_a: string
  readonly variant_b: string
}

type FigureTierAssets = {
  readonly twoD: FigureVariantAssets
  readonly threeD: FigureVariantAssets
}

const createPieceTierAssets = (figureFolder: FigureAssetFolder): Record<FigureTierKey, FigureTierAssets> => {
  const tier1TwoD: FigureVariantAssets = {
    variant_a: `${FIGURES_ASSET_ROOT}/${figureFolder}/${FigureTiers.TIER1}/${FigureAssetFormats.TWO_D}/${FigureVariants.A}/${FigureAssetFormats.FIGURE_PNG}`,
    variant_b: `${FIGURES_ASSET_ROOT}/${figureFolder}/${FigureTiers.TIER1}/${FigureAssetFormats.TWO_D}/${FigureVariants.B}/${FigureAssetFormats.FIGURE_PNG}`,
  }

  const threeD = (tier: FigureTierKey): FigureVariantAssets => {
    const skins = FIGURE_TIER_SKINS[tier]
    return {
      variant_a: `${FIGURE_3D_SKINS_ASSET_ROOT}/${figureFolder}/${tier}/${skins.variant_a.toLowerCase()}/${FigureAssetFormats.MESH_GLB}`,
      variant_b: `${FIGURE_3D_SKINS_ASSET_ROOT}/${figureFolder}/${tier}/${skins.variant_b.toLowerCase()}/${FigureAssetFormats.MESH_GLB}`,
    }
  }

  return {
    tier1: { twoD: tier1TwoD, threeD: threeD(FigureTiers.TIER1) },
    tier2: { twoD: tier1TwoD, threeD: threeD(FigureTiers.TIER2) },
    tier3: { twoD: tier1TwoD, threeD: threeD(FigureTiers.TIER3) },
    tier4: { twoD: tier1TwoD, threeD: threeD(FigureTiers.TIER4) },
    tier5: { twoD: tier1TwoD, threeD: threeD(FigureTiers.TIER5) },
  }
}

const createObstacleTierAssets = (figureFolder: FigureAssetFolder): { tier1: FigureTierAssets } => ({
  tier1: {
    twoD: {
      variant_a: `${FIGURES_ASSET_ROOT}/${figureFolder}/${FigureTiers.TIER1}/${FigureAssetFormats.TWO_D}/${FigureVariants.A}/${FigureAssetFormats.FIGURE_PNG}`,
      variant_b: '',
    },
    threeD: {
      variant_a: `${FIGURES_ASSET_ROOT}/${figureFolder}/${FigureTiers.TIER1}/${FigureAssetFormats.THREE_D}/${FigureVariants.A}/${FigureAssetFormats.MESH_GLB}`,
      variant_b: '',
    },
  },
})

export const figuresConfig = {
  bomber: createPieceTierAssets(FigureAssetFolders.BOMBER),
  chariot: createPieceTierAssets(FigureAssetFolders.CHARIOT),
  duchess: createPieceTierAssets(FigureAssetFolders.DUCHESS),
  hoplite: createPieceTierAssets(FigureAssetFolders.HOPLITE),
  monarch: createPieceTierAssets(FigureAssetFolders.MONARCH),
  necromancer: createPieceTierAssets(FigureAssetFolders.NECROMANCER),
  paladin: createPieceTierAssets(FigureAssetFolders.PALADIN),
  ram_tower: createPieceTierAssets(FigureAssetFolders.RAM_TOWER),
  warlock: createPieceTierAssets(FigureAssetFolders.WARLOCK),
  canyon: createObstacleTierAssets(FigureAssetFolders.CANYON),
  cave: createObstacleTierAssets(FigureAssetFolders.CAVE),
  river: createObstacleTierAssets(FigureAssetFolders.RIVER),
  tree: createObstacleTierAssets(FigureAssetFolders.TREE),
  lake: createObstacleTierAssets(FigureAssetFolders.LAKE),
  rock: createObstacleTierAssets(FigureAssetFolders.ROCK),
  mystery_box: createObstacleTierAssets(FigureAssetFolders.MYSTERY_BOX),
} as const

export type FigureName = keyof typeof figuresConfig

export const getFigureTierFromPlayerLevel = (playerLevel: number): FigureTierKey => {
  const clampedLevel = Math.min(Math.max(Math.floor(playerLevel), 1), LEVELS_PER_FIGURE_TIER * FIGURE_TIER_ORDER.length)
  const tierIndex = Math.floor((clampedLevel - 1) / LEVELS_PER_FIGURE_TIER)
  return FIGURE_TIER_ORDER[tierIndex]
}
