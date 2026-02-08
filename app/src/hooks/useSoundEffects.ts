import { useEffect, useRef, useCallback } from 'react'
import type { Move } from '../pages/Game/types'
import type { PieceType } from '../pages/Game/types'
import { SoundManager } from '../lib/soundManager'
import type { SoundEvent } from '../config/audio'
import { SoundEvents, PIECE_CAPTURE_SOUNDS, DEFAULT_CAPTURE_SOUND } from '../config/audio'
import { useUIStore } from '../store/uiStore'

const getMoveSound = (move: Move): SoundEvent => {
  if (move.terminatedByNarc) return SoundEvents.BOMB_EXPLODE

  if (move.captured) {
    const pieceType = move.piece.type as PieceType
    const captureSound = PIECE_CAPTURE_SOUNDS[pieceType]
    if (captureSound) return captureSound
    return DEFAULT_CAPTURE_SOUND
  }

  return SoundEvents.PIECE_MOVE
}

export const useSoundEffects = (lastMove: Move | null | undefined) => {
  const soundEnabled = useUIStore(state => state.soundEnabled)
  const moveCountRef = useRef(0)
  const initializedRef = useRef(false)

  useEffect(() => {
    SoundManager.setEnabled(soundEnabled)
  }, [soundEnabled])

  useEffect(() => {
    if (!initializedRef.current) {
      SoundManager.preloadAll()
      initializedRef.current = true
    }
  }, [])

  useEffect(() => {
    if (!lastMove) return

    const currentCount = moveCountRef.current
    moveCountRef.current += 1

    if (currentCount === 0) return

    const soundEvent = getMoveSound(lastMove)
    SoundManager.play(soundEvent)
  }, [lastMove])

  const playBoardClick = useCallback(() => {
    SoundManager.play(SoundEvents.MENU_CLICK)
  }, [])

  const playSwap = useCallback(() => {
    SoundManager.play(SoundEvents.TELEPORT)
  }, [])

  const playMysteryBox = useCallback(() => {
    SoundManager.play(SoundEvents.MYSTERY_BOX)
  }, [])

  const playCaveTeleport = useCallback(() => {
    SoundManager.play(SoundEvents.CAVE_TELEPORT)
  }, [])

  const playRevive = useCallback(() => {
    SoundManager.play(SoundEvents.REVIVE)
  }, [])

  return { playBoardClick, playSwap, playMysteryBox, playCaveTeleport, playRevive }
}
