import { create } from 'zustand';
import type { AuthUser } from '@/types/user.types';
import { onAuthChange, signOut as authSignOut } from '@/services/firebase/authService';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isReady: boolean;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setReady: (ready: boolean) => void;
  initAuthListener: () => () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isReady: false,

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setReady: (isReady) => set({ isReady }),

  initAuthListener: () => {
    set({ isLoading: true });
    const unsubscribe = onAuthChange((user) => {
      set({ user, isLoading: false, isReady: true });
    });
    return unsubscribe;
  },

  signOut: async () => {
    await authSignOut();
    get().clearUser();
  },
}));
