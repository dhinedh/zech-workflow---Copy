
"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Clock, CalendarDays, Play, Square } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
    const { user } = useAuthStore()
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [activeTimerTask, setActiveTimerTask] = useState<string | null>(null)
    const [activeTasks, setActiveTasks] = useState<any[]>([])
    const [notifications, setNotifications] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState({
        assignmentsCount: 0,
        urgentCount: 0,
        weeklyHours: "0.0",
        upcomingMeetings: 0
    })

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`)
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
        } catch (error) {
            console.error('Failed to mark notification as read:', error)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all')
            setNotifications(notifications.map(n => ({ ...n, isRead: true })))
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        }
    }

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true)
            try {
                const [statsRes, tasksRes, notifsRes] = await Promise.all([
                    api.get('/users/stats'),
                    api.get('/tasks?status=IN_PROGRESS,TODO'),
                    api.get('/notifications')
                ])

                if (statsRes.data.success) setStats(statsRes.data.data)
                if (tasksRes.data.success) setActiveTasks(tasksRes.data.data.slice(0, 5))
                if (notifsRes.data.success) setNotifications(notifsRes.data.data.slice(0, 5))
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    return (
        <div className={cn("space-y-8")}>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>
                        Welcome back, {user?.name?.split(' ')[0]}!
                    </h2>
                    {isDark && (
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C0FF00] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C0FF00]"></span>
                            </span>
                            <p className="text-xs text-[#C0FF00]/80 font-bold uppercase tracking-wider">Active Workspace</p>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild className={cn("font-bold tracking-tight shadow-md transition-all", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "bg-indigo-600 hover:bg-indigo-700")}>
                        <Link href="/dashboard/reports/daily">Submit Report</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className={cn("transition-all duration-300 border shadow-sm", isDark ? "bg-[#1c1c1c] border-white/10 shadow-xl" : "bg-white border-slate-200")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-gray-400" : "text-slate-500")}>
                            Assignments
                        </CardTitle>
                        <CheckCircle2 className={cn("h-4 w-4", isDark ? "text-[#C0FF00]" : "text-indigo-500")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-4xl font-bold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
                            {stats.assignmentsCount.toString().padStart(2, '0')}
                        </div>
                        <p className={cn("text-xs font-medium mt-1 transition-colors", isDark ? "text-[#C0FF00]/60" : "text-amber-600")}>
                            {stats.urgentCount} urgent priorities
                        </p>
                    </CardContent>
                </Card>
                <Card className={cn("transition-all duration-300 border shadow-sm", isDark ? "bg-[#1c1c1c] border-white/10 shadow-xl" : "bg-white border-slate-200")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-gray-400" : "text-slate-500")}>
                            Productivity
                        </CardTitle>
                        <Clock className={cn("h-4 w-4", isDark ? "text-[#C0FF00]" : "text-indigo-500")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-4xl font-bold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
                            {stats.weeklyHours}h
                        </div>
                        <p className={cn("text-xs font-medium mt-1 transition-colors", isDark ? "text-gray-500" : "text-slate-400")}>
                            WEEKLY GOAL: 40.0h
                        </p>
                    </CardContent>
                </Card>
                <Card className={cn("transition-all duration-300 border shadow-sm", isDark ? "bg-[#1c1c1c] border-white/10 shadow-xl" : "bg-white border-slate-200")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-gray-400" : "text-slate-500")}>
                            Upcoming Ops
                        </CardTitle>
                        <CalendarDays className={cn("h-4 w-4", isDark ? "text-[#C0FF00]" : "text-indigo-500")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-4xl font-bold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
                            {stats.upcomingMeetings.toString().padStart(2, '0')}
                        </div>
                        <p className={cn("text-xs font-medium mt-1 transition-colors", isDark ? "text-gray-500" : "text-slate-400")}>
                            SCHEDULED FOR LATER
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions / Recent */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                <Card className={cn("col-span-4 transition-all duration-300 border shadow-xl", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200")}>
                    <CardHeader className={cn("border-b transition-colors", isDark ? "border-white/5 bg-white/2" : "border-slate-100")}>
                        <CardTitle className={cn("text-xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>Active Assignments</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {activeTasks.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No active assignments</p>
                            ) : (
                                activeTasks.map((task) => (
                                    <div key={task.id} className={cn("flex justify-between items-center border-b pb-6 transition-colors last:border-0 last:pb-0", isDark ? "border-white/5" : "border-slate-50")}>
                                        <div className="flex-1 min-w-0 mr-4">
                                            <p className={cn("font-bold text-lg tracking-tight transition-colors truncate", isDark ? "text-white group-hover:text-[#C0FF00]" : "text-slate-900")}>
                                                {task.title}
                                            </p>
                                            <p className={cn("text-xs font-medium text-gray-500 mt-1")}>
                                                {task.project?.name || 'In Progress'}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className={cn(
                                                "font-bold tracking-tight h-10 px-6 transition-all shadow-sm shrink-0",
                                                activeTimerTask === task.id
                                                    ? (isDark ? "bg-[#C0FF00] text-black border-[#C0FF00]" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100")
                                                    : (isDark ? "border-white/10 text-white hover:bg-[#C0FF00] hover:text-black hover:border-transparent" : "border-slate-200")
                                            )}
                                            onClick={() => setActiveTimerTask(activeTimerTask === task.id ? null : task.id)}
                                        >
                                            {activeTimerTask === task.id ? <><Square className="h-3 w-3 mr-2" /> Stop</> : <><Play className="h-3 w-3 mr-2" /> Start</>}
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className={cn("col-span-3 transition-all duration-300 border shadow-xl", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200")}>
                    <CardHeader className={cn("border-b transition-colors flex flex-row items-center justify-between space-y-0", isDark ? "border-white/5 bg-white/2" : "border-slate-100")}>
                        <CardTitle className={cn("text-xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>Notifications</CardTitle>
                        {notifications.some(n => !n.isRead) && (
                            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-8 text-xs">
                                Mark all as read
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {notifications.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No recent notifications</p>
                            ) : (
                                notifications.map((notif) => (
                                    <div key={notif.id} className="flex gap-4 items-start group">
                                        <div className={cn(
                                            "h-2 w-2 mt-1.5 rounded-full shrink-0 transition-all",
                                            notif.isRead
                                                ? (isDark ? "bg-gray-700" : "bg-gray-300")
                                                : (isDark ? "bg-[#C0FF00]" : "bg-blue-600")
                                        )} />
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                                        >
                                            <p className={cn(
                                                "text-sm font-semibold transition-colors",
                                                notif.isRead
                                                    ? (isDark ? "text-gray-500" : "text-slate-500")
                                                    : (isDark ? "text-white" : "text-slate-900")
                                            )}>
                                                {notif.title}
                                            </p>
                                            <p className={cn("text-xs mt-1 transition-colors", isDark ? "text-gray-500" : "text-slate-500")}>{notif.message}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
