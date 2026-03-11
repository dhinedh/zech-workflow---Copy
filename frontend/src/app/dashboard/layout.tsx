
"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useTheme } from "@/context/ThemeContext"
import { SidebarProvider, useSidebar } from "@/context/SidebarContext"
import { cn } from "@/lib/utils"

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const { isCollapsed } = useSidebar();
    const isDark = theme === 'dark';

    return (
        <div className="h-full relative overflow-hidden">
            <div className={cn(
                "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80] transition-all duration-300",
                isCollapsed ? "md:w-20" : "md:w-64"
            )}>
                <Sidebar />
            </div>
            <main className={cn(
                "h-full min-h-screen transition-all duration-300",
                isCollapsed ? "md:pl-20" : "md:pl-64",
                isDark ? "bg-[#050505]" : "bg-slate-50"
            )}>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedRoute>
            <SidebarProvider>
                <DashboardContent>{children}</DashboardContent>
            </SidebarProvider>
        </ProtectedRoute>
    )
}
