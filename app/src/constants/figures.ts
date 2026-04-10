export const figuresConfig = {
  bomber: {
    default: {
      twoD: {
        variant_a: 'figures/Bomber/default/2d/variant-A/figure.jpg',
        variant_b: 'figures/Bomber/default/2d/variant-B/figure.jpg',
      },
      threeD: {
        variant_a: 'figures/Bomber/default/3d/variant-A/mesh.glb',
        variant_b: 'figures/Bomber/default/3d/variant-B/mesh.glb',
      }
    },
  },
  chariot: {
    default: {
      twoD: {
        variant_a: 'figures/Chariot/default/2d/variant-A/figure.jpg',
        variant_b: 'figures/Chariot/default/2d/variant-B/figure.jpg',
      },
      threeD: {
        variant_a: 'figures/Chariot/default/3d/variant-A/mesh.glb',
        variant_b: 'figures/Chariot/default/3d/variant-B/mesh.glb',
      }
    },
  },
  duchess: {
    default: {
      twoD: {
        variant_a: 'figures/Duchess/default/2d/variant-A/figure.jpg',
        variant_b: 'figures/Duchess/default/2d/variant-B/figure.jpg',
      },
      threeD: {
        variant_a: 'figures/Duchess/default/3d/variant-A/mesh.glb',
        variant_b: 'figures/Duchess/default/3d/variant-B/mesh.glb',
      }
    },
  },
  hoplite: {
    default: {
      twoD: {
        variant_a: 'figures/Hoplite/default/2d/variant-A/figure.jpg',
        variant_b: 'figures/Hoplite/default/2d/variant-B/figure.jpg',
      },
      threeD: {
        variant_a: 'figures/Hoplite/default/3d/variant-A/mesh.glb',
        variant_b: 'figures/Hoplite/default/3d/variant-B/mesh.glb',
      }
    },
  },
  monarch: {
    default: {
      twoD: {
        variant_a: 'figures/Monarch/default/2d/variant-A/figure.png',
        variant_b: 'figures/Monarch/default/2d/variant-B/figure.png',
      },
      threeD: {
        variant_a: 'figures/Monarch/default/3d/variant-A/mesh.glb',
        variant_b: 'figures/Monarch/default/3d/variant-B/mesh.glb',
      }
    },
  },
  necromancer: {
    default: {
      twoD: {
        variant_a: 'figures/Necromancer/default/2d/variant-A/figure.png',
        variant_b: 'figures/Necromancer/default/2d/variant-B/figure.png',
      },
      threeD: {
        variant_a: 'figures/Necromancer/default/3d/variant-A/mesh.glb',
        variant_b: 'figures/Necromancer/default/3d/variant-B/mesh.glb',
      }
    },
  },
  paladin: {
    default: {
      twoD: {
        variant_a: 'figures/Paladin/default/2d/variant-A/figure.jpg',
        variant_b: 'figures/Paladin/default/2d/variant-B/figure.jpg',
      },
      threeD: {
        variant_a: 'figures/Paladin/default/3d/variant-A/mesh.glb',
        variant_b: 'figures/Paladin/default/3d/variant-B/mesh.glb',
      }
    },
  },
  ram_tower: {
    default: {
      twoD: {
        variant_a: 'figures/Ram-Tower/default/2d/variant-A/figure.png',
        variant_b: 'figures/Ram-Tower/default/2d/variant-B/figure.png',
      },
      threeD: {
        variant_a: 'figures/Ram-Tower/default/3d/variant-A/mesh.glb',
        variant_b: 'figures/Ram-Tower/default/3d/variant-B/mesh.glb',
      }
    },
  },
  warlock: {
    default: {
      twoD: {
        variant_a: 'figures/Warlock/default/2d/variant-A/figure.png',
        variant_b: 'figures/Warlock/default/2d/variant-B/figure.png',
      },
      threeD: {
        variant_a: 'figures/Warlock/default/3d/variant-A/mesh.glb',
        variant_b: 'figures/Warlock/default/3d/variant-B/mesh.glb',
      }
    },
  },
  canyon: {
    default: {
      twoD: {
        variant_a: 'figures/Canyon/default/2d/variant-A/figure.png',
      },
      threeD: {
        variant_a: 'figures/Canyon/default/3d/variant-A/mesh.glb',
      },
    }
  },
  cave: {
    default: {
      twoD: {
        variant_a: 'figures/Cave/default/2d/variant-A/figure.png',
      },
      threeD: {
        variant_a: 'figures/Cave/default/3d/variant-A/mesh.glb',
      },
    }
  },
  river: {
    default: {
      twoD: {
        variant_a: 'figures/River/default/2d/variant-A/figure.png',
      },
      threeD: {
        variant_a: 'figures/River/default/3d/variant-A/mesh.glb',
      },
    }
  },
  tree: {
    default: {
      twoD: {
        variant_a: 'figures/Tree/default/2d/variant-A/figure.png',
      },
      threeD: {
        variant_a: 'figures/Tree/default/3d/variant-A/mesh.glb',
      },
    }
  },
  lake: {
    default: {
      twoD: {
        variant_a: 'figures/Lake/default/2d/variant-A/figure.png',
      },
      threeD: {
        variant_a: 'figures/Lake/default/3d/variant-A/mesh.glb',
      },
    }
  },
  rock: {
    default: {
      twoD: {
        variant_a: 'figures/Rock/default/2d/variant-A/figure.jpg',
      },
      threeD: {
        variant_a: 'figures/Rock/default/3d/variant-A/mesh.glb',
      },
    }
  },
  mystery_box: {
    default: {
      twoD: {
        variant_a: 'figures/MysteryBox/default/2d/variant-A/figure.jpg',
      },
      threeD: {
        variant_a: 'figures/MysteryBox/default/3d/variant-A/mesh.glb',
      },
    }
  },
} as const;

export type FigureName = keyof typeof figuresConfig;
