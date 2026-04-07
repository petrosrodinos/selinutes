export const figuresConfig = {
  bomber: {
    default: {
      variant_a: 'figures/Bomber/base/variant-A/mesh.glb',
      variant_b: 'figures/Bomber/base/variant-B/mesh.glb',
    },
  },
  chariot: {
    default: {
      variant_a: 'figures/Chariot/base/variant-A/mesh.glb',
      variant_b: 'figures/Chariot/base/variant-B/mesh.glb',
    },
  },
  duchess: {
    default: {
      variant_a: 'figures/Duchess/base/variant-A/mesh.glb',
      variant_b: 'figures/Duchess/base/variant-B/mesh.glb',
    },
  },
  hoplite: {
    default: {
      variant_a: 'figures/Hoplite/base/variant-A/mesh.glb',
      variant_b: 'figures/Hoplite/base/variant-B/mesh.glb',
    },
  },
  monarch: {
    default: {
      variant_a: 'figures/Monarch/base/variant-A/mesh.glb',
      variant_b: 'figures/Monarch/base/variant-B/mesh.glb',
    },
  },
  necromancer: {
    default: {
      variant_a: 'figures/Necromancer/base/variant-A/mesh.glb',
      variant_b: 'figures/Necromancer/base/variant-B/mesh.glb',
    },
  },
  paladin: {
    default: {
      variant_a: 'figures/Paladin/base/variant-A/mesh.glb',
      variant_b: 'figures/Paladin/base/variant-B/mesh.glb',
    },
  },
  ram_tower: {
    default: {
      variant_a: 'figures/Ram-Tower/base/variant-A/mesh.glb',
      variant_b: 'figures/Ram-Tower/base/variant-B/mesh.glb',
    },
  },
  warlock: {
    default: {
      variant_a: 'figures/Warlock/base/variant-A/mesh.glb',
      variant_b: 'figures/Warlock/base/variant-B/mesh.glb',
    },
  },
  canyon: {
    default: {
      variant_a: 'figures/Canyon/base/variant-A/mesh.glb',
    },
  },
  cave: {
    default: {
      variant_a: 'figures/Cave/base/variant-A/mesh.glb',
    },
  },
  river: {
    default: {
      variant_a: 'figures/River/base/variant-A/mesh.glb',
    },
  },
  tree: {
    default: {
      variant_a: 'figures/Tree/base/variant-A/mesh.glb',
    },
  },
  lake: {
    default: {
      variant_a: 'figures/Lake/base/variant-A/mesh.glb',
    },
  },
} as const;

export type FigureName = keyof typeof figuresConfig;
