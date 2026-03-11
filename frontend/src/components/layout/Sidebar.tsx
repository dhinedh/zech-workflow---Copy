
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    CheckSquare,
    FileText,
    Calendar,
    MessageSquare,
    Settings,
    LogOut,
    Clock,
    Video,
    Sun,
    Moon,
    Command,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { useTheme } from "@/context/ThemeContext"
import { useSidebar } from "@/context/SidebarContext"

export function Sidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuthStore()
    const { theme, toggleTheme } = useTheme()
    const { isCollapsed, toggleSidebar } = useSidebar()

    const isDark = theme === 'dark'

    const getDashboardHref = () => {
        if (!user) return "/dashboard";
        switch (user.role) {
            case 'SUPER_ADMIN': return "/admin";
            case 'MANAGER': return "/manager";
            case 'EMPLOYEE': return "/employee";
            case 'FREELANCER': return "/freelancer";
            case 'CLIENT': return "/client/dashboard";
            default: return "/dashboard";
        }
    }

    const dashboardHref = getDashboardHref();

    const getProjectsHref = () => {
        if (!user) return "/dashboard/projects";
        switch (user.role) {
            case 'SUPER_ADMIN': return "/admin/projects";
            default: return "/dashboard/projects";
        }
    }

    const routes = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: dashboardHref,
            color: isDark ? "text-[#C0FF00]" : "text-sky-500",
        },
        {
            label: "Projects",
            icon: FolderKanban,
            href: getProjectsHref(),
            color: isDark ? "text-[#C0FF00]" : "text-violet-500",
        },
        {
            label: "My Tasks",
            icon: CheckSquare,
            href: "/dashboard/tasks",
            color: isDark ? "text-[#C0FF00]" : "text-pink-700",
        },
        {
            label: "Daily Reports",
            icon: FileText,
            href: "/dashboard/reports/daily",
            color: isDark ? "text-[#C0FF00]" : "text-orange-700",
        },
{
    label: "Attendance",
    icon: Clock,
    href: "/dashboard/attendance",
    color: isDark ? "text-[#C0FF00]" : "text-red-500",
},
        {
            label: "Meetings",
            icon: Video,
            href: "/dashboard/meetings",
            color: isDark ? "text-[#C0FF00]" : "text-red-500",
        },
        {
            label: "Calendar",
            icon: Calendar,
            href: "/dashboard/calendar",
            color: isDark ? "text-[#C0FF00]" : "text-green-700",
        },
        {
            label: "Team",
            icon: Users,
            href: "/dashboard/team",
            color: isDark ? "text-[#C0FF00]" : "text-blue-700",
            roles: ['MANAGER', 'SUPER_ADMIN']
        },
        {
            label: "Assignments",
            icon: Command,
            href: "/dashboard/admin/assignments",
            color: isDark ? "text-[#C0FF00]" : "text-amber-600",
            roles: ['MANAGER', 'SUPER_ADMIN']
        },
        {
            label: "Messages",
            icon: MessageSquare,
            href: "/dashboard/messages",
            color: isDark ? "text-[#C0FF00]" : "text-indigo-500",
        },
        {
            label: "Settings",
            icon: Settings,
            href: "/dashboard/settings",
            color: isDark ? "text-white" : "text-gray-500",
        },
    ]

    return (
        <div className={cn(
            "space-y-4 py-4 flex flex-col h-full transition-all duration-300 border-r relative",
            isDark ? "bg-[#050505] text-white border-white/5 font-mono" : "bg-white text-slate-900 border-slate-200",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className={cn(
                    "absolute -right-3 top-8 z-50 p-1.5 rounded-full border transition-all duration-300 hover:scale-110",
                    isDark
                        ? "bg-[#050505] border-white/10 text-[#C0FF00] hover:bg-white/5"
                        : "bg-white border-slate-200 text-indigo-600 hover:bg-slate-50 shadow-md"
                )}
            >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            {/* Logo Section */}
            <div className={cn("px-3 py-2", isCollapsed && "px-2")}>
                <Link href={dashboardHref} className={cn(
                    "flex items-center mb-8 group",
                    isCollapsed ? "justify-center pl-0" : "pl-3"
                )}>
                    <div className="relative">
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                            isDark ? "bg-[#C0FF00] shadow-sm" : "bg-indigo-600 shadow-sm"
                        )}>
                            <Command className={cn("h-6 w-6", isDark ? "text-black" : "text-white")} />
                        </div>
                    </div>
                    {!isCollapsed && (
                        <h1 className={cn(
                            "text-xl font-bold tracking-tight ml-4 transition-opacity duration-300",
                            isDark ? "text-white" : "text-slate-900"
                        )}>
                            ZECH<span className={isDark ? "text-[#C0FF00]" : "text-indigo-600"}>.OS</span>
                        </h1>
                    )}
                </Link>
            </div>

            {/* Scrollable Navigation */}
            <div className={cn(
                "flex-1 overflow-y-auto overflow-x-hidden px-3",
                isCollapsed && "px-2",
                // Custom scrollbar styling
                isDark
                    ? "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20"
                    : "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300"
            )}>
                <div className="space-y-1">
                    {routes.map((route) => {
                        if (route.roles && user && !route.roles.includes(user.role)) return null;

                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "text-sm group flex p-3 w-full font-medium cursor-pointer rounded-xl transition-all duration-300 relative",
                                    pathname === route.href
                                        ? (isDark ? "bg-white/5 text-[#C0FF00] border-l-2 border-[#C0FF00]" : "bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600")
                                        : (isDark ? "text-gray-500 hover:text-white hover:bg-white/5" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"),
                                    isCollapsed && "justify-center px-0"
                                )}
                                title={isCollapsed ? route.label : undefined}
                            >
                                <div className={cn(
                                    "flex items-center",
                                    isCollapsed ? "justify-center" : "flex-1"
                                )}>
                                    <route.icon className={cn(
                                        "h-5 w-5 transition-colors",
                                        route.color,
                                        !isCollapsed && "mr-3"
                                    )} />
                                    {!isCollapsed && (
                                        <span className="transition-opacity duration-300">{route.label}</span>
                                    )}
                                </div>
                                {pathname === route.href && isDark && !isCollapsed && (
                                    <div className="h-1.5 w-1.5 rounded-full bg-[#C0FF00] shadow-[0_0_5px_#C0FF00] animate-pulse" />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Footer Section */}
            <div className={cn(
                "px-3 py-4 border-t",
                isDark ? "border-white/5" : "border-slate-100",
                isCollapsed && "px-2"
            )}>
                {!isCollapsed ? (
                    <>
                        <div className="flex items-center justify-between gap-x-2 p-3 mb-4 rounded-xl transition-colors duration-300">
                            <div className="text-sm truncate flex-1 min-w-0">
                                <p className={cn("font-bold truncate", isDark ? "text-white" : "text-slate-900")}>{user?.name}</p>
                                <p className={cn("text-xs transition-colors", isDark ? "text-gray-500" : "text-slate-400")}>{user?.role}</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={cn(
                                    "p-2 rounded-lg transition-all duration-300 border shrink-0",
                                    isDark
                                        ? "bg-white/5 border-white/10 text-[#C0FF00] hover:bg-white/10"
                                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-white"
                                )}
                            >
                                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>
                        </div>

                        <Button
                            variant={isDark ? "outline" : "destructive"}
                            className={cn(
                                "w-full justify-start h-11 rounded-xl transition-all active:scale-95",
                                isDark && "bg-transparent border-red-500/20 text-red-500 hover:bg-red-500/10 border-2"
                            )}
                            onClick={() => { logout(); window.location.href = '/login' }}
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            Logout
                        </Button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className={cn(
                                "p-2.5 rounded-lg transition-all duration-300 border",
                                isDark
                                    ? "bg-white/5 border-white/10 text-[#C0FF00] hover:bg-white/10"
                                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-white"
                            )}
                            title="Toggle theme"
                        >
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        <button
                            className={cn(
                                "p-2.5 rounded-lg transition-all duration-300 border",
                                isDark
                                    ? "bg-transparent border-red-500/20 text-red-500 hover:bg-red-500/10"
                                    : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                            )}
                            onClick={() => { logout(); window.location.href = '/login' }}
                            title="Logout"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
