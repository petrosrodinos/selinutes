import { create } from 'zustand'
import { SoundManager } from '../lib/soundManager'

interface UIStore {
    is3D: boolean
    isTopMenuOpen: boolean
    isRightMenuOpen: boolean
    helpEnabled: boolean
    devMode: boolean
    soundEnabled: boolean
    soundVolume: number

    toggle3D: () => void
    toggleHelp: () => void
    toggleDevMode: () => void
    openTopMenu: () => void
    closeTopMenu: () => void
    openRightMenu: () => void
    closeRightMenu: () => void
    toggleSound: () => void
    setSoundVolume: (volume: number) => void
}

export const useUIStore = create<UIStore>((set) => ({
    is3D: true,
    isTopMenuOpen: false,
    isRightMenuOpen: false,
    helpEnabled: true,
    devMode: false,
    soundEnabled: true,
    soundVolume: 0.5,

    toggle3D: () => set((state) => ({ is3D: !state.is3D })),
    toggleHelp: () => set((state) => ({ helpEnabled: !state.helpEnabled })),
    toggleDevMode: () => set((state) => ({ devMode: !state.devMode })),
    openTopMenu: () => set({ isTopMenuOpen: true }),
    closeTopMenu: () => set({ isTopMenuOpen: false }),
    openRightMenu: () => set({ isRightMenuOpen: true }),
    closeRightMenu: () => set({ isRightMenuOpen: false }),
    toggleSound: () => set((state) => {
        const next = !state.soundEnabled
        SoundManager.setEnabled(next)
        return { soundEnabled: next }
    }),
    setSoundVolume: (volume: number) => {
        SoundManager.setVolume(volume)
        set({ soundVolume: volume })
    }
}))
