import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'SUPER_ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'CLIENT' | 'INTERN' | 'FREELANCER';

interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    employeeId?: string;
    isFirstLogin?: boolean;
    managerId?: string;
    bio?: string;
    designation?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            login: (user, token) => set({ user, accessToken: token, isAuthenticated: true }),
            logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
            setAccessToken: (token) => set({ accessToken: token }),
        }),
        {
            name: 'auth-storage', // unique name
            partialize: (state) => ({ user: state.user, accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }),
        }
    )
);
