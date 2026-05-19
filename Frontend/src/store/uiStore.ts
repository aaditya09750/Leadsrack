import { create } from 'zustand';

interface UIState {
  rightDrawerOpen: boolean;
  openRightDrawer: () => void;
  closeRightDrawer: () => void;
  toggleRightDrawer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  rightDrawerOpen: false,
  openRightDrawer: () => set({ rightDrawerOpen: true }),
  closeRightDrawer: () => set({ rightDrawerOpen: false }),
  toggleRightDrawer: () => set((s) => ({ rightDrawerOpen: !s.rightDrawerOpen })),
}));
