
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { useTheme } from "@/context/ThemeContext"
import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    Sun,
    Moon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const pathname = usePathname()
    const router = useRouter()
    const { user, logout } = useAuthStore()
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    const navItems = [
        { name: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
        { name: "Projects", href: "/client/projects", icon: FolderKanban },
        { name: "Invoices", href: "/client/invoices", icon: FileText },
        { name: "Settings", href: "/client/settings", icon: Settings },
    ]

    return (
        <div className={cn("min-h-screen transition-colors duration-500", isDark ? "bg-[#050505]" : "bg-gray-50")}>
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 border-r",
                        isDark ? "bg-[#080808] border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)]" : "bg-white border-gray-100 shadow-lg",
                        !isSidebarOpen && "-translate-x-full lg:w-20"
                    )}
                >
                    <div className={cn("flex h-20 items-center justify-center border-b px-4", isDark ? "border-white/5" : "border-gray-100")}>
                        <h1 className={cn("text-2xl font-black tracking-tighter transition-all", isDark ? "text-[#C0FF00]" : "text-primary", !isSidebarOpen && "hidden")}>
                            ZECH_CLIENT
                        </h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden ml-auto"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className={cn("h-6 w-6", isDark ? "text-white" : "text-gray-900")} />
                        </Button>
                    </div>

                    <nav className="mt-8 flex-1 space-y-2 px-3">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href)
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all group",
                                        isActive
                                            ? (isDark ? "bg-[#C0FF00] text-black shadow-[0_0_20px_rgba(192,255,0,0.3)]" : "bg-primary/10 text-primary shadow-sm")
                                            : (isDark ? "text-gray-500 hover:bg-white/5 hover:text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900")
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-all", isSidebarOpen ? "mr-4" : "mx-auto", isActive ? (isDark ? "text-black" : "text-primary") : (isDark ? "text-gray-600 group-hover:text-white" : "text-gray-400"))} />
                                    {isSidebarOpen && <span>{item.name}</span>}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className={cn("border-t p-4 mt-auto", isDark ? "border-white/5" : "border-gray-100")}>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start rounded-xl font-bold uppercase tracking-widest text-xs transition-all",
                                isDark ? "text-rose-500 hover:bg-rose-500/10 hover:text-rose-400" : "text-red-600 hover:bg-red-50 hover:text-red-700",
                                !isSidebarOpen && "justify-center px-2"
                            )}
                            onClick={handleLogout}
                        >
                            <LogOut className={cn("h-5 w-5 flex-shrink-0", isSidebarOpen && "mr-3")} />
                            {isSidebarOpen && "DISSOLVE_AUTH"}
                        </Button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Header */}
                    <header className={cn(
                        "flex h-20 items-center justify-between border-b px-4 lg:px-10 transition-all duration-500 z-10",
                        isDark ? "bg-[#050505]/80 backdrop-blur-xl border-white/5" : "bg-white border-gray-100 shadow-sm"
                    )}>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className={cn("transition-colors", isDark ? "text-white hover:bg-white/5" : "text-gray-600")}
                            >
                                <Menu className="h-6 w-6" />
                            </Button>
                            <div className="hidden md:block w-96 relative group">
                                <Search className={cn("absolute left-3 top-3.5 h-4 w-4 transition-colors", isDark ? "text-[#C0FF00]" : "text-gray-400")} />
                                <Input
                                    type="search"
                                    placeholder={isDark ? "SCAN_SYSTEM_RESOURCES..." : "Search projects, invoices..."}
                                    className={cn(
                                        "pl-10 h-11 transition-all font-bold tracking-widest text-[10px]",
                                        isDark
                                            ? "bg-black border-white/5 text-white focus-visible:ring-[#C0FF00]/50 placeholder:text-gray-700"
                                            : "bg-gray-50 border-transparent focus:bg-white"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className={cn(
                                    "rounded-full transition-all duration-500",
                                    isDark ? "bg-white/5 text-[#C0FF00] hover:bg-[#C0FF00] hover:text-black shadow-[0_0_15px_rgba(0,0,0,0.5)]" : "bg-gray-100 text-gray-600"
                                )}
                            >
                                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>

                            <Button variant="ghost" size="icon" className="relative group">
                                <Bell className={cn("h-6 w-6 transition-colors", isDark ? "text-white group-hover:text-[#C0FF00]" : "text-gray-500")} />
                                <span className={cn("absolute top-1 right-1 h-2 w-2 rounded-full ring-2 transition-all", isDark ? "bg-[#C0FF00] ring-[#050505] shadow-[0_0_8px_#C0FF00]" : "bg-red-500 ring-white")} />
                            </Button>

                            <div className="flex items-center space-x-3 group cursor-pointer">
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center font-black transition-all",
                                    isDark ? "bg-white/5 text-[#C0FF00] border border-white/5 group-hover:border-[#C0FF00] group-hover:shadow-[0_0_15px_rgba(192,255,0,0.2)]" : "bg-primary/20 text-primary"
                                )}>
                                    {user ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="hidden md:block">
                                    <p className={cn("text-sm font-black tracking-tight transition-colors", isDark ? "text-white group-hover:text-[#C0FF00]" : "text-gray-900")}>{user?.name?.toUpperCase() || 'USER'}</p>
                                    <p className={cn("text-[9px] font-black uppercase tracking-widest", isDark ? "text-gray-600" : "text-gray-500")}>CLIENT_NODE</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className={cn(
                        "flex-1 overflow-y-auto p-6 lg:p-10 transition-all duration-500",
                        isDark && "font-mono"
                    )}>
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
