
"use client"

import { useAuthStore } from "@/store/authStore"
import { useTheme } from "@/context/ThemeContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    CheckCircle2,
    Clock,
    CalendarDays,
    Timer,
    Plus
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function EmployeeDashboard() {
    const { user } = useAuthStore()
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <div className={cn("space-y-8")}>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>
                        Personal Workspace
                    </h2>
                    <p className={cn("transition-colors", isDark ? "text-gray-400 text-sm font-medium" : "text-slate-500")}>
                        Welcome back, {user?.name}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild className={cn("font-semibold transition-all shadow-sm", isDark ? "border-white/10 text-white hover:bg-[#C0FF00] hover:text-black hover:border-[#C0FF00]" : "border-slate-200")}>
                        <Link href="/dashboard/attendance">Clock In</Link>
                    </Button>
                    <Button asChild className={cn("font-bold tracking-tight transition-all shadow-lg", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "bg-indigo-600 hover:bg-indigo-700")}>
                        <Link href="/dashboard/reports/daily">
                            <Plus className="h-4 w-4 mr-2" />
                            Submit Daily Report
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className={cn(
                    "transition-all duration-300 border shadow-sm group hover:-translate-y-1 overflow-hidden relative",
                    isDark ? "bg-[#1c1c1c] border-white/10" : "bg-indigo-50 border-indigo-100"
                )}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-[#C0FF00]/80" : "text-indigo-900")}>Active Timer</CardTitle>
                        <Timer className={cn("h-4 w-4", isDark ? "text-[#C0FF00]" : "text-indigo-600")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-bold tracking-tight", isDark ? "text-[#C0FF00]" : "text-indigo-900")}>02:45:12</div>
                        <p className={cn("text-xs font-medium mt-1", isDark ? "text-gray-400" : "text-indigo-600")}>Project: Web Refactor</p>
                    </CardContent>
                    {isDark && <div className="absolute top-0 right-0 p-1 bg-[#C0FF00] text-black text-[10px] font-bold px-2">LIVE</div>}
                </Card>
                <Card className={cn("transition-all duration-300 border shadow-sm", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-gray-400" : "text-muted-foreground")}>
                            Upcoming Meetings
                        </CardTitle>
                        <CalendarDays className={cn("h-4 w-4", isDark ? "text-[#C0FF00]" : "text-indigo-600")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-bold tracking-tight", isDark ? "text-white" : "text-slate-900")}>02</div>
                        <p className={cn("text-xs mt-1 transition-colors", isDark ? "text-gray-500" : "text-muted-foreground")}>
                            Next: 2:00 PM
                        </p>
                    </CardContent>
                </Card>
                <Card className={cn("transition-all duration-300 border shadow-sm", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-gray-400" : "text-muted-foreground")}>
                            Hours Logged
                        </CardTitle>
                        <Clock className={cn("h-4 w-4", isDark ? "text-[#C0FF00]" : "text-indigo-600")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-bold tracking-tight", isDark ? "text-white" : "text-slate-900")}>32.5</div>
                        <p className={cn("text-xs mt-1 transition-colors", isDark ? "text-gray-500" : "text-muted-foreground")}>
                            Goal: 40.0 hours
                        </p>
                    </CardContent>
                </Card>
                <Card className={cn("transition-all duration-300 border shadow-sm", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider transition-colors", isDark ? "text-gray-400" : "text-slate-500")}>Next Sync</CardTitle>
                        <CalendarDays className={cn("h-4 w-4", isDark ? "text-amber-400" : "text-amber-500")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>02:00 PM</div>
                        <p className={cn("text-xs font-medium mt-1 uppercase tracking-wider", isDark ? "text-amber-500" : "text-muted-foreground")}>Daily Standup</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className={cn("col-span-4 transition-all duration-300 border shadow-xl", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200")}>
                    <CardHeader className={cn("flex flex-row items-center justify-between border-b transition-colors", isDark ? "border-white/5 bg-white/2 pb-4" : "pb-4 border-slate-100")}>
                        <CardTitle className={cn("font-bold tracking-tight text-xl transition-colors", isDark ? "text-white" : "text-slate-900")}>Personal Assignments</CardTitle>
                        <Button size="sm" variant="ghost" asChild className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-[#C0FF00] hover:bg-white/5" : "text-indigo-600 hover:bg-indigo-50")}>
                            <Link href="/dashboard/tasks">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {[
                                { title: "Fix Header Responsiveness", project: "Client Web App", priority: "High" },
                                { title: "Draft API Documentation", project: "Core Backend", priority: "Medium" },
                                { title: "Team Lunch RSVP", project: "Internal", priority: "Low" },
                            ].map((t, i) => (
                                <div key={i} className={cn("flex justify-between items-center pb-3 border-b transition-colors", isDark ? "border-white/5" : "border-slate-100")}>
                                    <div>
                                        <p className={cn("font-bold tracking-tight text-base transition-colors", isDark ? "text-white hover:text-[#C0FF00]" : "text-slate-900")}>{t.title}</p>
                                        <p className={cn("text-xs font-medium text-gray-500 mt-0.5")}>{t.project}</p>
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all border shadow-sm",
                                        t.priority === 'High' ? (isDark ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-rose-100 text-rose-700 border-rose-200') :
                                            t.priority === 'Medium' ? (isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-100 text-indigo-700 border-indigo-200') :
                                                (isDark ? 'bg-white/5 text-gray-500 border-white/10' : 'bg-slate-100 text-slate-700 border-slate-200')
                                    )}>{t.priority}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className={cn("col-span-3 transition-all duration-300 border shadow-xl", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200")}>
                    <CardHeader className={cn("border-b transition-colors", isDark ? "border-white/5 bg-white/2" : "border-slate-100")}>
                        <CardTitle className={cn("font-bold tracking-tight text-xl transition-colors", isDark ? "text-white" : "text-slate-900")}>Upcoming Sync</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {[
                                { day: "15", month: "Feb", title: "Project Performance Review", time: "2:00 PM - 3:00 PM" },
                                { day: "17", month: "Feb", title: "Frontend Sync", time: "11:00 AM - 12:00 PM" },
                            ].map((ev, i) => (
                                <div key={i} className="flex gap-5 items-start">
                                    <div className={cn(
                                        "text-center w-14 py-2 border rounded-xl transition-all shadow-sm",
                                        isDark ? "bg-white/5 border-white/10" : "bg-indigo-50 border-indigo-100"
                                    )}>
                                        <p className={cn("text-[10px] font-semibold uppercase tracking-wider", isDark ? "text-gray-500" : "text-indigo-600")}>{ev.month}</p>
                                        <p className={cn("text-xl font-bold leading-none mt-1", isDark ? "text-[#C0FF00]" : "text-indigo-900")}>{ev.day}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className={cn("text-sm font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>{ev.title}</p>
                                        <p className={cn("text-xs font-medium transition-colors", isDark ? "text-gray-500" : "text-slate-500")}>{ev.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
