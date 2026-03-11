
"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useTheme } from "@/context/ThemeContext"
import { cn } from "@/lib/utils"
import { SidebarProvider } from "@/context/SidebarContext"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <SidebarProvider>
                <div className="h-full relative overflow-hidden">
                    <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
                        <Sidebar />
                    </div>
                    <main className={cn(
                        "md:pl-72 h-full min-h-screen transition-colors duration-500",
                        isDark ? "bg-[#050505]" : "bg-slate-50"
                    )}>
                        <div className="p-8">
                            {children}
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        </ProtectedRoute>
    )
}
