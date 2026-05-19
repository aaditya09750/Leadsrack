import { create } from 'zustand';

interface UIState {
  rightDrawerOpen: boolean;
  openRightDrawer: () => void;
  closeRightDrawer: () => void;
  toggleRightDrawer: () => void;

  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  rightDrawerOpen: false,
  openRightDrawer: () => set({ rightDrawerOpen: true }),
  closeRightDrawer: () => set({ rightDrawerOpen: false }),
  toggleRightDrawer: () => set((s) => ({ rightDrawerOpen: !s.rightDrawerOpen })),

  mobileNavOpen: false,
  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
}));
