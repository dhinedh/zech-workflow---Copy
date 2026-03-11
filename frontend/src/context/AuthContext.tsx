'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

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
        // 1. Get initial session
        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        };

        initSession();

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                if (!profile || profile.id !== session.user.id) {
                    setLoading(true);
                    await fetchProfile(session.user.id);
                }
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            // Updated to query 'User' table which exists (created by Prisma)
            // Selecting specific fields to avoid sensitive data and match interface needs
            const { data, error } = await supabase
                .from('User')
                .select('id, email, name, role, companyId, isActive')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile from User table:', error);

                // Fallback: try lowercase 'user' if case sensitivity issue
                if (error.code === 'PGRST205') { // Relation not found
                    const { data: retryData, error: retryError } = await supabase
                        .from('user')
                        .select('id, email, name, role, companyId, isActive')
                        .eq('id', userId)
                        .single();

                    if (!retryError && retryData) {
                        setProfile({
                            id: retryData.id,
                            email: retryData.email,
                            full_name: retryData.name, // Map name -> full_name
                            role: retryData.role as UserRole,
                            company_id: retryData.companyId, // Map companyId -> company_id
                            status: retryData.isActive ? 'ACTIVE' : 'DISABLED' // Map isActive -> status
                        });
                        return;
                    }
                }
            } else if (data) {
                // Map Prisma User fields (camelCase) to UserProfile interface (snake_case preference)
                setProfile({
                    id: data.id,
                    email: data.email,
                    full_name: data.name, // Map name -> full_name
                    role: data.role as UserRole,
                    company_id: data.companyId, // Map companyId -> company_id
                    status: data.isActive ? 'ACTIVE' : 'DISABLED' // Map isActive -> status
                });
            }
        } catch (err) {
            console.error('Profile fetch exception:', err);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
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
