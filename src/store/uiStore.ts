import { create } from 'zustand'

interface UIStore {
    is3D: boolean
    isTopMenuOpen: boolean
    isRightMenuOpen: boolean
    helpEnabled: boolean

    toggle3D: () => void
    toggleHelp: () => void
    openTopMenu: () => void
    closeTopMenu: () => void
    openRightMenu: () => void
    closeRightMenu: () => void
}

export const useUIStore = create<UIStore>((set) => ({
    is3D: true,
    isTopMenuOpen: false,
    isRightMenuOpen: false,
    helpEnabled: false,

    toggle3D: () => set((state) => ({ is3D: !state.is3D })),
    toggleHelp: () => set((state) => ({ helpEnabled: !state.helpEnabled })),
    openTopMenu: () => set({ isTopMenuOpen: true }),
    closeTopMenu: () => set({ isTopMenuOpen: false }),
    openRightMenu: () => set({ isRightMenuOpen: true }),
    closeRightMenu: () => set({ isRightMenuOpen: false })
}))
