import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MeResponse } from '../types/api';

interface AuthState {
  token: string | null;
  user: MeResponse | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (token: string, user: MeResponse) => void;
  logout: () => void;
  setUser: (user: MeResponse) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      hydrated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      setUser: (user) => set({ user }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'ca_auth',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
);
