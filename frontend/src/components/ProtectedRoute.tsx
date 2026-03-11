'use client';
import { useAuthStore, UserRole } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Wait for Zustand persist to hydrate
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated) return; // Don't check auth until hydrated

        console.log('ProtectedRoute check:', { isAuthenticated, user: user?.email, hasToken: !!useAuthStore.getState().accessToken });

        if (!isAuthenticated || !user) {
            console.log('Not authenticated, redirecting to login');
            router.push('/login');
            return;
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
            console.log('User role not allowed, redirecting:', user.role);
            // Redirect based on role if unauthorized for current route
            switch (user.role) {
                case 'SUPER_ADMIN':
                    router.push('/admin');
                    break;
                case 'MANAGER':
                    router.push('/manager');
                    break;
                case 'EMPLOYEE':
                    router.push('/employee');
                    break;
                case 'FREELANCER':
                    router.push('/freelancer');
                    break;
                case 'CLIENT':
                    router.push('/client');
                    break;
                default:
                    router.push('/dashboard');
            }
        }
    }, [user, isAuthenticated, router, allowedRoles, isHydrated]);

    // Show loading while hydrating
    if (!isHydrated) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    // If not authenticated after hydration, don't render children
    if (!isAuthenticated || !user) {
        return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}
