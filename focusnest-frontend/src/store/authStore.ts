import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
  onboardingDone: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, access: string, refresh: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setAuth: (user, access, refresh) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fn_access', access);
      localStorage.setItem('fn_refresh', refresh);
      localStorage.setItem('fn_user', JSON.stringify(user));
    }
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fn_access');
      localStorage.removeItem('fn_refresh');
      localStorage.removeItem('fn_user');
    }
    set({ user: null, isAuthenticated: false });
  },
}));
