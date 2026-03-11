'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Mock types formerly from Supabase
export interface User {
    id: string;
    email?: string;
    user_metadata?: any;
    role?: string;
}

export interface Session {
    user: User;
    access_token: string;
}

// Define roles strictly
export type UserRole = 'SUPER_ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'CLIENT' | 'INTERN' | 'FREELANCER';
export type UserStatus = 'ACTIVE' | 'INVITED' | 'DISABLED';

interface UserProfile {
    id: string;
    email: string | null;
    full_name: string | null;
    role: UserRole;
    company_id: string;
    status: UserStatus;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Initial session check - using mock data for now
        const initSession = async () => {
            // Check localStorage or cookies for a mock session
            const storedUser = typeof window !== 'undefined' ? localStorage.getItem('mock_user') : null;
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setSession({ user: parsedUser, access_token: 'mock_token' });
                await fetchProfile(parsedUser.id);
            } else {
                setLoading(false);
            }
        };

        initSession();
    }, []);

    const fetchProfile = async (userId: string) => {
        setLoading(true);
        // Simplified profile fetching - in a real app this would call your custom backend
        // For now, we'll use a mock profile based on the user ID
        try {
            // Simulate API call
            setTimeout(() => {
                setProfile({
                    id: userId,
                    email: user?.email || 'user@example.com',
                    full_name: 'Mock User',
                    role: 'SUPER_ADMIN',
                    company_id: 'mock-company-1',
                    status: 'ACTIVE'
                });
                setLoading(false);
            }, 500);
        } catch (err) {
            console.error('Profile fetch error:', err);
            setLoading(false);
        }
    };

    const signOut = async () => {
        localStorage.removeItem('mock_user');
        setUser(null);
        setSession(null);
        setProfile(null);
        router.push('/login');
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id);
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
