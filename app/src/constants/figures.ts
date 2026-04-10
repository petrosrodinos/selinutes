export const figuresConfig = {
  bomber: {
    default: {
      threeD: {
        variant_a: 'figures/Bomber/default/3d/variant-A/mesh.glb',
        variant_b: 'figures/Bomber/default/3d/variant-B/mesh.glb',
      }
    },
  },
  chariot: {
    default: {
      threeD: {
        variant_a: 'figures/Chariot/default/3d/variant-A/mesh.glb',
        variant_b: 'figures/Chariot/default/3d/variant-B/mesh.glb',
      }
    },
  },
  duchess: {
    default: {
      threeD: {
        variant_a: 'figures/Duchess/default/3d/variant-A/mesh.glb',
        variant_b: 'figures/Duchess/default/3d/variant-B/mesh.glb',
      }
    },
  },
  hoplite: {
    default: {
      threeD: {
        variant_a: 'figures/Hoplite/default/3d/variant-A/mesh.glb',
        variant_b: 'figures/Hoplite/default/3d/variant-B/mesh.glb',
      }
    },
  },
  monarch: {
    default: {
      threeD: {
        variant_a: 'figures/Monarch/default/3d/variant-A/mesh.glb',
        variant_b: 'figures/Monarch/default/3d/variant-B/mesh.glb',
      }
    },
  },
  necromancer: {
    default: {
      threeD: {
        variant_a: 'figures/Necromancer/default/3d/variant-A/mesh.glb',
        variant_b: 'figures/Necromancer/default/3d/variant-B/mesh.glb',
      }
    },
  },
  paladin: {
    default: {
      threeD: {
        variant_a: 'figures/Paladin/default/3d/variant-A/mesh.glb',
        variant_b: 'figures/Paladin/default/3d/variant-B/mesh.glb',
      }
    },
  },
  ram_tower: {
    default: {
      threeD: {
        variant_a: 'figures/Ram-Tower/default/3d/variant-A/mesh.glb',
        variant_b: 'figures/Ram-Tower/default/3d/variant-B/mesh.glb',
      }
    },
  },
  warlock: {
    default: {
      threeD: {
        variant_a: 'figures/Warlock/default/3d/variant-A/mesh.glb',
        variant_b: 'figures/Warlock/default/3d/variant-B/mesh.glb',
      }
    },
  },
  canyon: {
    default: {
      threeD: {
        variant_a: 'figures/Canyon/default/3d/variant-A/mesh.glb',
      },
    }
  },
  cave: {
    default: {
      threeD: {
        variant_a: 'figures/Cave/default/3d/variant-A/mesh.glb',
      },
    }
  },
  river: {
    default: {
      threeD: {
        variant_a: 'figures/River/default/3d/variant-A/mesh.glb',
      },
    }
  },
  tree: {
    default: {
      threeD: {
        variant_a: 'figures/Tree/default/3d/variant-A/mesh.glb',
      },
    }
  },
  lake: {
    default: {
      threeD: {
        variant_a: 'figures/Lake/default/3d/variant-A/mesh.glb',
      },
    }
  },
} as const;

export type FigureName = keyof typeof figuresConfig;
