import type { SoundEvent } from '../config/audio'
import { SOUND_FILES, SOUND_VOLUMES } from '../config/audio'

const audioCache = new Map<SoundEvent, HTMLAudioElement>()
let globalVolume = 0.5
let soundEnabled = true

const getAudio = (event: SoundEvent): HTMLAudioElement => {
  const cached = audioCache.get(event)
  if (cached) return cached

  const src = SOUND_FILES[event]
  const audio = new Audio(src)
  audio.preload = 'auto'
  audioCache.set(event, audio)
  return audio
}

export const SoundManager = {
  preload: (events: SoundEvent[]) => {
    events.forEach(getAudio)
  },

  preloadAll: () => {
    const allEvents = Object.keys(SOUND_FILES) as SoundEvent[]
    allEvents.forEach(getAudio)
  },

  play: (event: SoundEvent) => {
    if (!soundEnabled) return

    const audio = getAudio(event)
    const eventVolume = SOUND_VOLUMES[event] ?? 1
    audio.volume = Math.min(1, globalVolume * eventVolume)
    audio.currentTime = 0
    audio.play().catch(() => {})
  },

  setVolume: (volume: number) => {
    globalVolume = Math.max(0, Math.min(1, volume))
  },

  getVolume: (): number => globalVolume,

  setEnabled: (enabled: boolean) => {
    soundEnabled = enabled
  },

  isEnabled: (): boolean => soundEnabled,
} as const
