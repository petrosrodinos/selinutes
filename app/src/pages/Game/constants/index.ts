import type { GameState, BoardSize, PieceRules, ObstacleType, PieceType } from '../types'
import { PlayerColors, PieceTypes, ObstacleTypes, BotDifficulties, BoardSizeKeys, MovePatterns } from '../types'

export const generateFiles = (cols: number): string[] => {
  const files: string[] = []
  for (let i = 0; i < cols; i++) {
    files.push(String.fromCharCode(97 + i))
  }
  return files
}

export const generateRanks = (rows: number): string[] => {
  const ranks: string[] = []
  for (let i = rows; i > 0; i--) {
    ranks.push(String(i))
  }
  return ranks
}

export const PIECE_RULES: Record<string, PieceRules> = {
  [PieceTypes.HOPLITE]: {
    move: [3, 2],
    attackRange: 1,
    canPass: [ObstacleTypes.CAVE, ObstacleTypes.MYSTERY_BOX],
    canChooseAttackMode: true,
    points: 3
  },
  [PieceTypes.RAM_TOWER]: {
    move: MovePatterns.CROSS,
    attackRange: 5,
    canPass: [],
    rangeAttackCanPass: [
      ObstacleTypes.ROCK,
      ObstacleTypes.CAVE,
      ObstacleTypes.RIVER,
      ObstacleTypes.LAKE,
      ObstacleTypes.CANYON,
      ObstacleTypes.MYSTERY_BOX
    ],
    canChooseAttackMode: true,
    points: 20
  },
  [PieceTypes.CHARIOT]: {
    move: [[2, 1], [1, 2], [2, 2], [3, 1], [1, 3]],
    attackRange: 3,
    chariotRangeKillGammaBox: 4,
    chariotCaptureMaxGammaRange: 3,
    canPass: [ObstacleTypes.RIVER, ObstacleTypes.MYSTERY_BOX],
    rangeAttackCanPass: [
      ObstacleTypes.TREE,
      ObstacleTypes.CAVE,
      ObstacleTypes.RIVER,
      ObstacleTypes.LAKE,
      ObstacleTypes.CANYON,
      ObstacleTypes.MYSTERY_BOX
    ],
    canJumpPieces: true,
    canChooseAttackMode: true,
    points: 16,
    zombiePoints: 13
  },
  [PieceTypes.BOMBER]: {
    move: [[1, 0], [0, 1], [1, 1], [2, 0], [0, 2], [2, 2]],
    attackRange: 0,
    canPass: [ObstacleTypes.CAVE, ObstacleTypes.RIVER, ObstacleTypes.MYSTERY_BOX],
    canJumpPieces: true,
    canChooseAttackMode: false,
    points: 12,
    zombiePoints: 9
  },
  [PieceTypes.PALADIN]: {
    move: MovePatterns.DIAGONAL,
    attackRange: 3,
    canPass: [ObstacleTypes.CAVE, ObstacleTypes.RIVER, ObstacleTypes.CANYON, ObstacleTypes.MYSTERY_BOX],
    rangeAttackCanPass: [
      ObstacleTypes.ROCK,
      ObstacleTypes.CAVE,
      ObstacleTypes.RIVER,
      ObstacleTypes.LAKE,
      ObstacleTypes.CANYON,
      ObstacleTypes.MYSTERY_BOX
    ],
    canChooseAttackMode: true,
    maxRiverWidth: 1,
    points: 15,
    zombiePoints: 12
  },
  [PieceTypes.WARLOCK]: {
    move: [[2, 0], [0, 2], [2, 2]],
    attackRange: 1,
    canPass: [ObstacleTypes.CAVE, ObstacleTypes.LAKE, ObstacleTypes.MYSTERY_BOX],
    canJumpPieces: true,
    canChooseAttackMode: false,
    points: 11
  },
  [PieceTypes.MONARCH]: {
    move: MovePatterns.ANY,
    attackRange: 1,
    canPass: [ObstacleTypes.MYSTERY_BOX],
    canChooseAttackMode: true,
    points: 210
  },
  [PieceTypes.DUCHESS]: {
    move: MovePatterns.ANY,
    attackRange: 9,
    canPass: [ObstacleTypes.RIVER, ObstacleTypes.MYSTERY_BOX],
    rangeAttackCanPass: [
      ObstacleTypes.ROCK,
      ObstacleTypes.CAVE,
      ObstacleTypes.RIVER,
      ObstacleTypes.LAKE,
      ObstacleTypes.CANYON,
      ObstacleTypes.MYSTERY_BOX
    ],
    canChooseAttackMode: true,
    points: 27
  },
  [PieceTypes.NECROMANCER]: {
    move: [[1, 0], [0, 1], [1, 1]],
    attackRange: 1,
    freezeRange: 8,
    canPass: [ObstacleTypes.MYSTERY_BOX],
    freezeCanPass: [
      ObstacleTypes.TREE,
      ObstacleTypes.CAVE,
      ObstacleTypes.RIVER,
      ObstacleTypes.LAKE,
      ObstacleTypes.CANYON,
      ObstacleTypes.MYSTERY_BOX
    ],
    canChooseAttackMode: false,
    points: 13
  }
} as const

export const PIECE_SYMBOLS = {
  [PlayerColors.WHITE]: {
    [PieceTypes.HOPLITE]: '⚔️',
    [PieceTypes.RAM_TOWER]: '🏰',
    [PieceTypes.CHARIOT]: '🐴',
    [PieceTypes.BOMBER]: '💣',
    [PieceTypes.PALADIN]: '🛡️',
    [PieceTypes.WARLOCK]: '🧙',
    [PieceTypes.MONARCH]: '👑',
    [PieceTypes.DUCHESS]: '👸',
    [PieceTypes.NECROMANCER]: '💀'
  },
  [PlayerColors.BLACK]: {
    [PieceTypes.HOPLITE]: '⚔️',
    [PieceTypes.RAM_TOWER]: '🏰',
    [PieceTypes.CHARIOT]: '🐴',
    [PieceTypes.BOMBER]: '💣',
    [PieceTypes.PALADIN]: '🛡️',
    [PieceTypes.WARLOCK]: '🧙',
    [PieceTypes.MONARCH]: '👑',
    [PieceTypes.DUCHESS]: '👸',
    [PieceTypes.NECROMANCER]: '💀'
  }
} as const

export const OBSTACLE_SYMBOLS = {
  [ObstacleTypes.CAVE]: '🕳️',
  [ObstacleTypes.TREE]: '🌲',
  [ObstacleTypes.ROCK]: '🪨',
  [ObstacleTypes.RIVER]: '🌊',
  [ObstacleTypes.LAKE]: '💧',
  [ObstacleTypes.CANYON]: '🏜️',
  [ObstacleTypes.MYSTERY_BOX]: '❓'
} as const

export const PIECE_NAMES = {
  [PieceTypes.HOPLITE]: 'Hoplite',
  [PieceTypes.RAM_TOWER]: 'Ram Tower',
  [PieceTypes.CHARIOT]: 'Chariot',
  [PieceTypes.BOMBER]: 'Bomber',
  [PieceTypes.PALADIN]: 'Paladin',
  [PieceTypes.WARLOCK]: 'Warlock',
  [PieceTypes.MONARCH]: 'Monarch',
  [PieceTypes.DUCHESS]: 'Duchess',
  [PieceTypes.NECROMANCER]: 'Necromancer'
} as const

export const RULES_FIGURE_ORDER: readonly PieceType[] = [
  PieceTypes.HOPLITE,
  PieceTypes.RAM_TOWER,
  PieceTypes.CHARIOT,
  PieceTypes.BOMBER,
  PieceTypes.PALADIN,
  PieceTypes.WARLOCK,
  PieceTypes.MONARCH,
  PieceTypes.DUCHESS,
  PieceTypes.NECROMANCER
] as const

export const RULES_FIGURE_SECTION_TITLES: Record<PieceType, string> = {
  [PieceTypes.HOPLITE]: 'Hoplite',
  [PieceTypes.RAM_TOWER]: 'Ram-Tower',
  [PieceTypes.CHARIOT]: 'Chariot',
  [PieceTypes.BOMBER]: 'Bomber',
  [PieceTypes.PALADIN]: 'Paladin',
  [PieceTypes.WARLOCK]: 'Warlock (Vezier)',
  [PieceTypes.MONARCH]: 'Monarch',
  [PieceTypes.DUCHESS]: 'Duchess',
  [PieceTypes.NECROMANCER]: 'Necromancer (Druid)'
} as const

export const FIGURE_RULES_BULLETS: Record<PieceType, readonly string[]> = {
  [PieceTypes.HOPLITE]: [
    'Moves 3 steps forward on the first move; afterwards, moves 2 steps.',
    'Range attack: kills 1 step on front diagonals (left/right) without moving.',
    'Capture and move: can move onto an enemy on a front diagonal to capture it.',
    'Reaching the opponent\'s back rank promotes to a Duchess (only 3 Hoplites may promote in the entire game).',
    'Can pass through caves.',
    'Cannot pass through river, lake, or canyon.'
  ],
  [PieceTypes.RAM_TOWER]: [
    'Moves cross-shaped (orthogonal) any number of blocks.',
    'Catapult attack: cross-shaped, up to 5 blocks away; shoots through friendly figures and captures only the first enemy in each line.',
    'Range attacks pass over rock, cave, river, lake, canyon, and mystery box; trees block the shot.',
    'Can also move onto an enemy in its path to capture it directly.',
    'Cannot pass through cave, river, lake, or canyon.'
  ],
  [PieceTypes.CHARIOT]: [
    'Moves in corner patterns: 2-1, 1-2, 2-2, 3-1, 1-3 steps.',
    'Can jump over other figures on its path.',
    'Attacks: gamma-shaped (L) ranged kill only at gamma range 4 (3+1 or 1+3); shoots over friendly figures; range attacks pass over tree, cave, river, lake, canyon, and mystery box but rock blocks the shot; enemy figures block the shot. Capture-and-move only up to gamma range 3 (2+1 or 1+2) on a clear path — not at gamma range 4.',
    'Can pass through rivers and land beyond them.',
    'Cannot pass through lake, canyon, or cave.'
  ],
  [PieceTypes.BOMBER]: [
    'Moves 1 or 2 steps in cross or X patterns.',
    'Can jump over other figures on its path.',
    'Cannot attack or shoot directly.',
    'After it moves, it lays a hidden net of explosives on nearby tiles (diagonals 1–2 away and orthogonals 2 away). Any enemy figure that steps onto a net tile is destroyed.',
    'Can pass through river and cave.',
    'Cannot pass through lake, canyon, tree, or rock.'
  ],
  [PieceTypes.PALADIN]: [
    'Moves diagonal as many steps as possible.',
    'Shoots up to 3 steps (diagonal); shoots through friendly figures and captures only the first enemy in each line.',
    'Range attacks pass over rock, cave, river, lake, canyon, and mystery box; trees block the shot.',
    'Can also move onto an enemy in its path to capture it directly (any diagonal distance on a clear path).',
    'Can pass through river (1 step wide), cave, and canyon (only figure that can pass canyon).',
    'Cannot pass through lake.'
  ],
  [PieceTypes.WARLOCK]: [
    'Moves in 2-step corner patterns.',
    'Can attack 1 step diagonally.',
    'Can pass over figures in its path.',
    'Can swap positions with any Hoplite and the Monarch.',
    'Can pass through lake and cave.',
    'Cannot pass through river or canyon.'
  ],
  [PieceTypes.MONARCH]: [
    'Moves in any direction, 1 step at a time.',
    'Shoots 1 step in any direction.',
    'Cannot pass through cave, river, lake, or canyon.'
  ],
  [PieceTypes.DUCHESS]: [
    'Moves in any direction, any number of steps.',
    'Shoots up to 9 steps in any direction; shoots through friendly figures and captures only the first enemy in each line.',
    'Range attacks pass over rock, cave, river, lake, canyon, and mystery box; trees block the shot.',
    'Can pass through river.',
    'Cannot pass through lake, canyon, cave, or tree.'
  ],
  [PieceTypes.NECROMANCER]: [
    'Moves 1 step in any direction.',
    'Melee attack: kills an adjacent enemy 1 step away in any direction.',
    'Freeze-stun: stuns an enemy in a straight line up to 8 steps away; rock blocks it, but tree, cave, river, lake, canyon, and mystery box do not. Stunned figures cannot move or capture-and-move, but can still use their normal ranged attacks. Freeze duration is always half the Necromancer\'s maximum freeze range (4 turns at full power). Each revival permanently reduces maximum freeze range by 2, which also lowers freeze duration (e.g. after one revival: range 6, duration 3 turns). After 4 revivals the Necromancer can no longer freeze.',
    'Can revive Ram, Chariot, Bomber, or Paladin when the Necromancer, Monarch, and Duchess are on the same horizontal line.',
    'Revived figures attack at range 1 only; a revived Bomber can still attack as a Zombie.',
    'Cannot pass through cave, river, lake, or canyon.'
  ]
} as const

export const OBSTACLE_NAMES = {
  [ObstacleTypes.CAVE]: 'Cave',
  [ObstacleTypes.TREE]: 'Tree',
  [ObstacleTypes.ROCK]: 'Rock',
  [ObstacleTypes.RIVER]: 'River',
  [ObstacleTypes.LAKE]: 'Lake',
  [ObstacleTypes.CANYON]: 'Canyon',
  [ObstacleTypes.MYSTERY_BOX]: 'Mystery Box'
} as const

export const OBSTACLE_COLORS = {
  [ObstacleTypes.CAVE]: '#2d2d2d',
  [ObstacleTypes.TREE]: '#228b22',
  [ObstacleTypes.ROCK]: '#808080',
  [ObstacleTypes.RIVER]: '#4169e1',
  [ObstacleTypes.LAKE]: '#1e90ff',
  [ObstacleTypes.CANYON]: '#cd853f',
  [ObstacleTypes.MYSTERY_BOX]: '#9932cc'
} as const

export const OBSTACLE_COUNTS: Record<string, Record<ObstacleType, number>> = {
  [BoardSizeKeys.SMALL]: {
    [ObstacleTypes.CAVE]: 2,
    [ObstacleTypes.TREE]: 2,
    [ObstacleTypes.ROCK]: 2,
    [ObstacleTypes.LAKE]: 4,
    [ObstacleTypes.RIVER]: 3,
    [ObstacleTypes.CANYON]: 3,
    [ObstacleTypes.MYSTERY_BOX]: 2
  },
  [BoardSizeKeys.MEDIUM]: {
    [ObstacleTypes.CAVE]: 2,
    [ObstacleTypes.TREE]: 3,
    [ObstacleTypes.ROCK]: 3,
    [ObstacleTypes.LAKE]: 4,
    [ObstacleTypes.RIVER]: 3,
    [ObstacleTypes.CANYON]: 3,
    [ObstacleTypes.MYSTERY_BOX]: 2
  },
  [BoardSizeKeys.LARGE]: {
    [ObstacleTypes.CAVE]: 2,
    [ObstacleTypes.TREE]: 3,
    [ObstacleTypes.ROCK]: 3,
    [ObstacleTypes.LAKE]: 5,
    [ObstacleTypes.RIVER]: 4,
    [ObstacleTypes.CANYON]: 4,
    [ObstacleTypes.MYSTERY_BOX]: 3
  }
} as const

export const BACK_ROW_PIECES = [
  PieceTypes.RAM_TOWER,
  PieceTypes.CHARIOT,
  PieceTypes.BOMBER,
  PieceTypes.PALADIN,
  PieceTypes.WARLOCK,
  PieceTypes.MONARCH,
  PieceTypes.DUCHESS,
  PieceTypes.NECROMANCER,
  PieceTypes.PALADIN,
  PieceTypes.BOMBER,
  PieceTypes.CHARIOT,
  PieceTypes.RAM_TOWER
] as const

export const DEFAULT_BOARD_SIZE: BoardSize = { rows: 12, cols: 12 }

export const INITIAL_GAME_STATE: GameState = {
  board: [],
  boardSize: DEFAULT_BOARD_SIZE,
  currentPlayer: PlayerColors.WHITE,
  selectedPosition: null,
  validMoves: [],
  validAttacks: [],
  validSwaps: [],
  moveHistory: [],
  capturedPieces: { white: [], black: [] },
  lastMove: null,
  gameOver: false,
  winner: null,
  narcs: [],
  nightMode: false
}

export const BOT_DELAY = {
  [BotDifficulties.EASY]: 400,
  [BotDifficulties.MEDIUM]: 400,
  [BotDifficulties.HARD]: 600
} as const
