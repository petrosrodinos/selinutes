export const figuresConfig = {
  bomber: {
    tier1: {
      twoD: {
        variant_a: 'figures/Bomber/tier1/2d/variant-A/figure.png',
        variant_b: 'figures/Bomber/tier1/2d/variant-B/figure.png',
      },
      threeD: {
        variant_a: 'figures/Bomber/tier1/3d/variant-A/mesh.glb',
        variant_b: 'figures/Bomber/tier1/3d/variant-B/mesh.glb',
      }
    },
  },
  chariot: {
    tier1: {
      twoD: {
        variant_a: 'figures/Chariot/tier1/2d/variant-A/figure.png',
        variant_b: 'figures/Chariot/tier1/2d/variant-B/figure.png',
      },
      threeD: {
        variant_a: 'figures/Chariot/tier1/3d/variant-A/mesh.glb',
        variant_b: 'figures/Chariot/tier1/3d/variant-B/mesh.glb',
      }
    },
  },
  duchess: {
    tier1: {
      twoD: {
        variant_a: 'figures/Duchess/tier1/2d/variant-A/figure.png',
        variant_b: 'figures/Duchess/tier1/2d/variant-B/figure.png',
      },
      threeD: {
        variant_a: 'figures/Duchess/tier1/3d/variant-A/mesh.glb',
        variant_b: 'figures/Duchess/tier1/3d/variant-B/mesh.glb',
      }
    },
  },
  hoplite: {
    tier1: {
      twoD: {
        variant_a: 'figures/Hoplite/tier1/2d/variant-A/figure.png',
        variant_b: 'figures/Hoplite/tier1/2d/variant-B/figure.png',
      },
      threeD: {
        variant_a: 'figures/Hoplite/tier1/3d/variant-A/mesh.glb',
        variant_b: 'figures/Hoplite/tier1/3d/variant-B/mesh.glb',
      }
    },
  },
  monarch: {
    tier1: {
      twoD: {
        variant_a: 'figures/Monarch/tier1/2d/variant-A/figure.png',
        variant_b: 'figures/Monarch/tier1/2d/variant-B/figure.png',
      },
      threeD: {
        variant_a: 'figures/Monarch/tier1/3d/variant-A/mesh.glb',
        variant_b: 'figures/Monarch/tier1/3d/variant-B/mesh.glb',
      }
    },
  },
  necromancer: {
    tier1: {
      twoD: {
        variant_a: 'figures/Necromancer/tier1/2d/variant-A/figure.png',
        variant_b: 'figures/Necromancer/tier1/2d/variant-B/figure.png',
      },
      threeD: {
        variant_a: 'figures/Necromancer/tier1/3d/variant-A/mesh.glb',
        variant_b: 'figures/Necromancer/tier1/3d/variant-B/mesh.glb',
      }
    },
  },
  paladin: {
    tier1: {
      twoD: {
        variant_a: 'figures/Paladin/tier1/2d/variant-A/figure.png',
        variant_b: 'figures/Paladin/tier1/2d/variant-B/figure.png',
      },
      threeD: {
        variant_a: 'figures/Paladin/tier1/3d/variant-A/mesh.glb',
        variant_b: 'figures/Paladin/tier1/3d/variant-B/mesh.glb',
      }
    },
  },
  ram_tower: {
    tier1: {
      twoD: {
        variant_a: 'figures/Ram-Tower/tier1/2d/variant-A/figure.png',
        variant_b: 'figures/Ram-Tower/tier1/2d/variant-B/figure.png',
      },
      threeD: {
        variant_a: 'figures/Ram-Tower/tier1/3d/variant-A/mesh.glb',
        variant_b: 'figures/Ram-Tower/tier1/3d/variant-B/mesh.glb',
      }
    },
  },
  warlock: {
    tier1: {
      twoD: {
        variant_a: 'figures/Warlock/tier1/2d/variant-A/figure.png',
        variant_b: 'figures/Warlock/tier1/2d/variant-B/figure.png',
      },
      threeD: {
        variant_a: 'figures/Warlock/tier1/3d/variant-A/mesh.glb',
        variant_b: 'figures/Warlock/tier1/3d/variant-B/mesh.glb',
      }
    },
  },
  canyon: {
    tier1: {
      twoD: {
        variant_a: 'figures/Canyon/tier1/2d/variant-A/figure.png',
      },
      threeD: {
        variant_a: 'figures/Canyon/tier1/3d/variant-A/mesh.glb',
      },
    }
  },
  cave: {
    tier1: {
      twoD: {
        variant_a: 'figures/Cave/tier1/2d/variant-A/figure.png',
      },
      threeD: {
        variant_a: 'figures/Cave/tier1/3d/variant-A/mesh.glb',
      },
    }
  },
  river: {
    tier1: {
      twoD: {
        variant_a: 'figures/River/tier1/2d/variant-A/figure.png',
      },
      threeD: {
        variant_a: 'figures/River/tier1/3d/variant-A/mesh.glb',
      },
    }
  },
  tree: {
    tier1: {
      twoD: {
        variant_a: 'figures/Tree/tier1/2d/variant-A/figure.png',
      },
      threeD: {
        variant_a: 'figures/Tree/tier1/3d/variant-A/mesh.glb',
      },
    }
  },
  lake: {
    tier1: {
      twoD: {
        variant_a: 'figures/Lake/tier1/2d/variant-A/figure.png',
      },
      threeD: {
        variant_a: 'figures/Lake/tier1/3d/variant-A/mesh.glb',
      },
    }
  },
  rock: {
    tier1: {
      twoD: {
        variant_a: 'figures/Rock/tier1/2d/variant-A/figure.png',
      },
      threeD: {
        variant_a: 'figures/Rock/tier1/3d/variant-A/mesh.glb',
      },
    }
  },
  mystery_box: {
    tier1: {
      twoD: {
        variant_a: 'figures/MysteryBox/tier1/2d/variant-A/figure.png',
      },
      threeD: {
        variant_a: 'figures/MysteryBox/tier1/3d/variant-A/mesh.glb',
      },
    }
  },
} as const;

export type FigureName = keyof typeof figuresConfig;
