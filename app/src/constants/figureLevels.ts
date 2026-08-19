const figureLevelAssetModules = import.meta.glob('../assets/figure-levels/**/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export const FigureLevels = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  RUBY: 'ruby',
  GOLD: 'gold',
  DIAMOND: 'diamond',
} as const

export type FigureLevelKey = typeof FigureLevels[keyof typeof FigureLevels]

export const FigureLevelFigures = {
  HOPLITE: 'hoplite',
  NECROMANCER: 'necromancer',
  WARLOCK: 'warlock',
  BOMBER: 'bomber',
  PALADIN: 'paladin',
  CHARIOT: 'chariot',
  RAM_TOWER: 'ramTower',
  DUCHESS: 'duchess',
  MONARCH: 'monarch',
} as const

export type FigureLevelFigureKey = typeof FigureLevelFigures[keyof typeof FigureLevelFigures]

type FigureLevelFigureConfig = {
  readonly title: string
  readonly assetPath: string
}

type FigureLevelConfig = {
  readonly level: number
  readonly label: string
  readonly figures: Record<FigureLevelFigureKey, FigureLevelFigureConfig>
}

const FIGURE_LEVEL_FIGURE_TITLES = {
  [FigureLevelFigures.HOPLITE]: 'Hoplite-Legion',
  [FigureLevelFigures.NECROMANCER]: 'Necro-Druid',
  [FigureLevelFigures.WARLOCK]: 'Warlock-Vezier',
  [FigureLevelFigures.BOMBER]: 'Saboter-Bomber',
  [FigureLevelFigures.PALADIN]: 'Rogue-Paladin',
  [FigureLevelFigures.CHARIOT]: 'Chariot',
  [FigureLevelFigures.RAM_TOWER]: 'Ram-Tower',
  [FigureLevelFigures.DUCHESS]: 'Dutchess',
  [FigureLevelFigures.MONARCH]: 'Monarch',
} as const satisfies Record<FigureLevelFigureKey, string>

const createFigureLevelFigures = (
  assetPaths: Record<FigureLevelFigureKey, string>,
): Record<FigureLevelFigureKey, FigureLevelFigureConfig> => ({
  [FigureLevelFigures.HOPLITE]: {
    title: FIGURE_LEVEL_FIGURE_TITLES[FigureLevelFigures.HOPLITE],
    assetPath: assetPaths[FigureLevelFigures.HOPLITE],
  },
  [FigureLevelFigures.NECROMANCER]: {
    title: FIGURE_LEVEL_FIGURE_TITLES[FigureLevelFigures.NECROMANCER],
    assetPath: assetPaths[FigureLevelFigures.NECROMANCER],
  },
  [FigureLevelFigures.WARLOCK]: {
    title: FIGURE_LEVEL_FIGURE_TITLES[FigureLevelFigures.WARLOCK],
    assetPath: assetPaths[FigureLevelFigures.WARLOCK],
  },
  [FigureLevelFigures.BOMBER]: {
    title: FIGURE_LEVEL_FIGURE_TITLES[FigureLevelFigures.BOMBER],
    assetPath: assetPaths[FigureLevelFigures.BOMBER],
  },
  [FigureLevelFigures.PALADIN]: {
    title: FIGURE_LEVEL_FIGURE_TITLES[FigureLevelFigures.PALADIN],
    assetPath: assetPaths[FigureLevelFigures.PALADIN],
  },
  [FigureLevelFigures.CHARIOT]: {
    title: FIGURE_LEVEL_FIGURE_TITLES[FigureLevelFigures.CHARIOT],
    assetPath: assetPaths[FigureLevelFigures.CHARIOT],
  },
  [FigureLevelFigures.RAM_TOWER]: {
    title: FIGURE_LEVEL_FIGURE_TITLES[FigureLevelFigures.RAM_TOWER],
    assetPath: assetPaths[FigureLevelFigures.RAM_TOWER],
  },
  [FigureLevelFigures.DUCHESS]: {
    title: FIGURE_LEVEL_FIGURE_TITLES[FigureLevelFigures.DUCHESS],
    assetPath: assetPaths[FigureLevelFigures.DUCHESS],
  },
  [FigureLevelFigures.MONARCH]: {
    title: FIGURE_LEVEL_FIGURE_TITLES[FigureLevelFigures.MONARCH],
    assetPath: assetPaths[FigureLevelFigures.MONARCH],
  },
})

export const resolveFigureLevelAssetUrl = (relativeAssetPath: string): string | null => {
  const normalizedPath = relativeAssetPath.replace(/\\/g, '/')
  const modulePath = `../assets/${normalizedPath}`
  return figureLevelAssetModules[modulePath] ?? null
}

export const FIGURE_LEVELS = {
  [FigureLevels.BRONZE]: {
    level: 1,
    label: 'Bronze',
    figures: createFigureLevelFigures({
      [FigureLevelFigures.HOPLITE]: 'figure-levels/bronze/Bronze Hop.jpg',
      [FigureLevelFigures.NECROMANCER]: 'figure-levels/bronze/Bronz-Dru.jpg',
      [FigureLevelFigures.WARLOCK]: 'figure-levels/bronze/Bronz-Vez.jpg',
      [FigureLevelFigures.BOMBER]: 'figure-levels/bronze/Bronz-Sab.jpg',
      [FigureLevelFigures.PALADIN]: 'figure-levels/bronze/Bronz-Rog.jpg',
      [FigureLevelFigures.CHARIOT]: 'figure-levels/bronze/Bronz-Char.jpg',
      [FigureLevelFigures.RAM_TOWER]: 'figure-levels/bronze/Bronz-Skc.jpg',
      [FigureLevelFigures.DUCHESS]: 'figure-levels/bronze/Bronz-Dutc.jpg',
      [FigureLevelFigures.MONARCH]: 'figure-levels/bronze/Bronz-Mon.jpg',
    }),
  },
  [FigureLevels.SILVER]: {
    level: 2,
    label: 'Silver',
    figures: createFigureLevelFigures({
      [FigureLevelFigures.HOPLITE]: 'figure-levels/silver/Silver Hop.jpg',
      [FigureLevelFigures.NECROMANCER]: 'figure-levels/silver/Silv-Dru.jpg',
      [FigureLevelFigures.WARLOCK]: 'figure-levels/silver/Silv-Vez.jpg',
      [FigureLevelFigures.BOMBER]: 'figure-levels/silver/Silv-Sab.jpg',
      [FigureLevelFigures.PALADIN]: 'figure-levels/silver/Silv-Rog.jpg',
      [FigureLevelFigures.CHARIOT]: 'figure-levels/silver/Silv-Char.jpg',
      [FigureLevelFigures.RAM_TOWER]: 'figure-levels/silver/Silv-Skc.jpg',
      [FigureLevelFigures.DUCHESS]: 'figure-levels/silver/Silv-Dutc.jpg',
      [FigureLevelFigures.MONARCH]: 'figure-levels/silver/Silv-Mon.jpg',
    }),
  },
  [FigureLevels.RUBY]: {
    level: 3,
    label: 'Ruby',
    figures: createFigureLevelFigures({
      [FigureLevelFigures.HOPLITE]: 'figure-levels/ruby/Rub-Hop.jpg',
      [FigureLevelFigures.NECROMANCER]: 'figure-levels/ruby/Rub-Dru.jpg',
      [FigureLevelFigures.WARLOCK]: 'figure-levels/ruby/Rub-Vez.jpg',
      [FigureLevelFigures.BOMBER]: 'figure-levels/ruby/Rub-Sab.jpg',
      [FigureLevelFigures.PALADIN]: 'figure-levels/ruby/Rub-Rog.jpg',
      [FigureLevelFigures.CHARIOT]: 'figure-levels/ruby/Rub-Char.jpg',
      [FigureLevelFigures.RAM_TOWER]: 'figure-levels/ruby/Rub-Skc.jpg',
      [FigureLevelFigures.DUCHESS]: 'figure-levels/ruby/Rub-Dutc.jpg',
      [FigureLevelFigures.MONARCH]: 'figure-levels/ruby/Rub-Mon.jpg',
    }),
  },
  [FigureLevels.GOLD]: {
    level: 4,
    label: 'Sapphire',
    figures: createFigureLevelFigures({
      [FigureLevelFigures.HOPLITE]: 'figure-levels/gold/Gold-Hop.jpg',
      [FigureLevelFigures.NECROMANCER]: 'figure-levels/gold/Gold-Dru.jpg',
      [FigureLevelFigures.WARLOCK]: 'figure-levels/gold/Gold-Vez.jpg',
      [FigureLevelFigures.BOMBER]: 'figure-levels/gold/Gold-Sab.jpg',
      [FigureLevelFigures.PALADIN]: 'figure-levels/gold/Gold-Rog.jpg',
      [FigureLevelFigures.CHARIOT]: 'figure-levels/gold/Gold-Char.jpg',
      [FigureLevelFigures.RAM_TOWER]: 'figure-levels/gold/Gold-Skc.jpg',
      [FigureLevelFigures.DUCHESS]: 'figure-levels/gold/Gold-Dutc.jpg',
      [FigureLevelFigures.MONARCH]: 'figure-levels/gold/Gold-Mon.jpg',
    }),
  },
  [FigureLevels.DIAMOND]: {
    level: 5,
    label: 'Emerald',
    figures: createFigureLevelFigures({
      [FigureLevelFigures.HOPLITE]: 'figure-levels/diamond/Diam-Hop.jpg',
      [FigureLevelFigures.NECROMANCER]: 'figure-levels/diamond/Diam-Dru.jpg',
      [FigureLevelFigures.WARLOCK]: 'figure-levels/diamond/Diam-Vez.jpg',
      [FigureLevelFigures.BOMBER]: 'figure-levels/diamond/Diam-Sab.jpg',
      [FigureLevelFigures.PALADIN]: 'figure-levels/diamond/Diam-Rog.jpg',
      [FigureLevelFigures.CHARIOT]: 'figure-levels/diamond/Diam-Char.jpg',
      [FigureLevelFigures.RAM_TOWER]: 'figure-levels/diamond/Diam-Skc.jpg',
      [FigureLevelFigures.DUCHESS]: 'figure-levels/diamond/Diam-Dutc.jpg',
      [FigureLevelFigures.MONARCH]: 'figure-levels/diamond/Diam-Mon.jpg',
    }),
  },
} as const satisfies Record<FigureLevelKey, FigureLevelConfig>

export type FigureLevelConfigEntry = typeof FIGURE_LEVELS[FigureLevelKey]

export const getFigureLevelAssetUrl = (
  levelKey: FigureLevelKey,
  figureKey: FigureLevelFigureKey,
): string | null => resolveFigureLevelAssetUrl(FIGURE_LEVELS[levelKey].figures[figureKey].assetPath)

export const FIGURE_LEVEL_TIER_ORDER = [
  FigureLevels.BRONZE,
  FigureLevels.SILVER,
  FigureLevels.RUBY,
  FigureLevels.GOLD,
  FigureLevels.DIAMOND,
] as const

export const FIGURE_LEVEL_FIGURE_ORDER = [
  FigureLevelFigures.HOPLITE,
  FigureLevelFigures.NECROMANCER,
  FigureLevelFigures.WARLOCK,
  FigureLevelFigures.BOMBER,
  FigureLevelFigures.PALADIN,
  FigureLevelFigures.CHARIOT,
  FigureLevelFigures.RAM_TOWER,
  FigureLevelFigures.DUCHESS,
  FigureLevelFigures.MONARCH,
] as const

export const FIGURES_PER_LEVEL_TIER = FIGURE_LEVEL_FIGURE_ORDER.length

export type PlayerLevelMeta = {
  readonly playerLevel: number
  readonly tierKey: FigureLevelKey
  readonly tierLabel: string
  readonly tierRank: number
  readonly figureKey: FigureLevelFigureKey
  readonly figureTitle: string
  readonly imageUrl: string | null
}

const clampPlayerLevel = (playerLevel: number, maxLevel: number): number =>
  Math.min(Math.max(Math.floor(playerLevel), 1), maxLevel)

export const getPlayerLevelMeta = (playerLevel: number, maxLevel: number): PlayerLevelMeta => {
  const clampedLevel = clampPlayerLevel(playerLevel, maxLevel)
  const tierIndex = Math.floor((clampedLevel - 1) / FIGURES_PER_LEVEL_TIER)
  const figureIndex = (clampedLevel - 1) % FIGURES_PER_LEVEL_TIER
  const tierKey = FIGURE_LEVEL_TIER_ORDER[tierIndex]
  const figureKey = FIGURE_LEVEL_FIGURE_ORDER[figureIndex]
  const tier = FIGURE_LEVELS[tierKey]
  const figure = tier.figures[figureKey]

  return {
    playerLevel: clampedLevel,
    tierKey,
    tierLabel: tier.label,
    tierRank: tier.level,
    figureKey,
    figureTitle: figure.title,
    imageUrl: resolveFigureLevelAssetUrl(figure.assetPath),
  }
}

export const buildPlayerLevelCatalog = (maxLevel: number): readonly PlayerLevelMeta[] =>
  Array.from({ length: maxLevel }, (_, index) => getPlayerLevelMeta(index + 1, maxLevel))
