import type { PieceType } from '../pages/Game/types'
import { PieceTypes } from '../pages/Game/types'
import bomberTheme from '../assets/audio/figure-themes/Bomber_Theme_Demo_Mix.wav'
import chariotTheme from '../assets/audio/figure-themes/Charriot_Theme_Demo_Mix.wav'
import duchessTheme from '../assets/audio/figure-themes/Dutchess_Theme_Demo_Mix.wav'
import hopliteTheme from '../assets/audio/figure-themes/Hoplite_Theme_Demo_Mix.wav'
import monarchTheme from '../assets/audio/figure-themes/Monarch_Theme_Demo_Mix.wav'
import necromancerTheme from '../assets/audio/figure-themes/NecroMancer_Theme_Demo_Mix.wav'
import paladinTheme from '../assets/audio/figure-themes/Paladin_Theme_Demo_Mix.wav'
import ramTowerTheme from '../assets/audio/figure-themes/RamTank_V1_Theme_Demo_Mix.wav'
import warlockTheme from '../assets/audio/figure-themes/Vizier_Theme_Demo_Mix.wav'

export const FIGURE_THEME_SOUNDS: Record<PieceType, string> = {
  [PieceTypes.HOPLITE]: hopliteTheme,
  [PieceTypes.RAM_TOWER]: ramTowerTheme,
  [PieceTypes.CHARIOT]: chariotTheme,
  [PieceTypes.BOMBER]: bomberTheme,
  [PieceTypes.PALADIN]: paladinTheme,
  [PieceTypes.WARLOCK]: warlockTheme,
  [PieceTypes.MONARCH]: monarchTheme,
  [PieceTypes.DUCHESS]: duchessTheme,
  [PieceTypes.NECROMANCER]: necromancerTheme,
} as const
