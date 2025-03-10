import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),
      login: async (username, password) => {
        try {
          const response = await fetch('https://api.orincore.com/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });
          const data = await response.json();
          if (!response.ok) {
            return { success: false, error: data.message || 'Invalid username or password' };
          }
          // Assuming your backend returns a user object and token in the response
          set({ user: { username: data.user.username, email: data.user.email }, isAuthenticated: true });
          localStorage.setItem('token', data.token);
          return { success: true };
        } catch (error) {
          return { success: false, error: 'Something went wrong' };
        }
      },
      register: async (username, email, password) => {
        try {
          const response = await fetch('https://api.orincore.com/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
          });
          const data = await response.json();
          if (!response.ok) {
            return { success: false, error: data.message || 'Registration failed' };
          }
          // Assuming your backend returns a user object and token in the response
          set({ user: { username: data.user.username, email: data.user.email }, isAuthenticated: true });
          localStorage.setItem('token', data.token);
          return { success: true };
        } catch (error) {
          return { success: false, error: 'Something went wrong' };
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('token');
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
