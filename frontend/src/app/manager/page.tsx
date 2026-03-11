
"use client"

import { useAuthStore } from "@/store/authStore"
import { useTheme } from "@/context/ThemeContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Users,
    CheckCircle2,
    Clock,
    TrendingUp,
    FileText,
    ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function ManagerDashboard() {
    const { user } = useAuthStore()
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <div className={cn("space-y-8")}>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>
                        Manager Dashboard
                    </h2>
                    <p className={cn("transition-colors", isDark ? "text-gray-400 text-sm font-medium" : "text-slate-500 mt-1")}>
                        {isDark ? "Operational Status: Active" : "Welcome back,"} {user?.name}
                    </p>
                </div>
                <Button className={cn("font-bold tracking-tight transition-all shadow-lg h-10 px-6", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "bg-indigo-600 hover:bg-indigo-700")}>
                    Create New Project
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className={cn("transition-all duration-300 border shadow-sm", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200 shadow-sm")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-gray-400" : "text-slate-500")}>Productivity</CardTitle>
                        <TrendingUp className={cn("h-4 w-4", isDark ? "text-[#C0FF00]" : "text-green-500")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>84%</div>
                        <p className={cn("text-xs font-medium mt-1", isDark ? "text-[#C0FF00]" : "text-green-600")}>+2.5% vs last week</p>
                    </CardContent>
                </Card>
                <Card className={cn("transition-all duration-300 border shadow-sm", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200 shadow-sm")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-gray-400" : "text-slate-500")}>Team Members</CardTitle>
                        <Users className={cn("h-4 w-4", isDark ? "text-indigo-400" : "text-indigo-500")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>12</div>
                        <p className={cn("text-xs font-medium mt-1", isDark ? "text-gray-500" : "text-muted-foreground")}>3 on break // 9 active</p>
                    </CardContent>
                </Card>
                <Card className={cn("transition-all duration-300 border shadow-sm", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200 shadow-sm")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-gray-400" : "text-slate-500")}>Pending Reports</CardTitle>
                        <FileText className={cn("h-4 w-4", isDark ? "text-amber-400" : "text-orange-500")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>08</div>
                        <p className={cn("text-xs font-medium mt-1", isDark ? "text-amber-500" : "text-muted-foreground")}>Requires review</p>
                    </CardContent>
                </Card>
                <Card className={cn("transition-all duration-300 border shadow-sm", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200 shadow-sm")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-gray-400" : "text-slate-500")}>Deadlines</CardTitle>
                        <Clock className={cn("h-4 w-4", isDark ? "text-rose-400" : "text-rose-500")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>03</div>
                        <p className={cn("text-xs font-medium mt-1", isDark ? "text-rose-500" : "text-muted-foreground")}>Due in next 48h</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className={cn("col-span-4 transition-all duration-300 border shadow-xl", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200 shadow-sm")}>
                    <CardHeader className={cn("border-b transition-colors", isDark ? "border-white/5 bg-white/2" : "border-slate-100")}>
                        <CardTitle className={cn("font-bold tracking-tight text-xl transition-colors", isDark ? "text-white" : "text-slate-900")}>Team Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {[
                                { name: "Alice Johnson", status: "In Meeting", task: "API Design", color: "text-blue-500" },
                                { name: "Bob Smith", status: "Coding", task: "Bug Fix #104", color: "text-green-500" },
                                { name: "Charlie Davis", status: "Reviewing", task: "PR #56", color: "text-amber-500" },
                            ].map((m, i) => (
                                <div key={i} className={cn("flex justify-between items-center pb-3 border-b transition-colors", isDark ? "border-white/5" : "border-slate-50")}>
                                    <div>
                                        <p className={cn("font-bold tracking-tight text-base transition-colors", isDark ? "text-[#C0FF00]" : "text-slate-900")}>{m.name}</p>
                                        <p className={cn("text-xs font-medium text-gray-500 mt-0.5")}>{m.task}</p>
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all shadow-sm",
                                        isDark ? "bg-white/5 text-white border-white/10" : "bg-slate-50 text-slate-600 border-slate-200"
                                    )}>{m.status}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className={cn("col-span-3 transition-all duration-300 border shadow-xl", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200 shadow-sm")}>
                    <CardHeader className={cn("border-b transition-colors", isDark ? "border-white/5 bg-white/2" : "border-slate-100")}>
                        <CardTitle className={cn("font-bold tracking-tight text-xl transition-colors", isDark ? "text-white" : "text-slate-900")}>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            <div className="flex gap-4 text-sm relative">
                                <div className={cn("h-2 w-2 mt-1.5 rounded-full shrink-0", isDark ? "bg-[#C0FF00] shadow-[0_0_8px_#C0FF00]" : "bg-indigo-500")} />
                                <p className={cn("font-medium transition-colors", isDark ? "text-gray-400" : "text-slate-600")}>
                                    Milestone <span className={cn("font-bold", isDark ? "text-white" : "text-slate-900")}>Beta Launch</span> completed for Project Alpha
                                </p>
                            </div>
                            <div className="flex gap-4 text-sm">
                                <div className={cn("h-2 w-2 mt-1.5 rounded-full shrink-0", isDark ? "bg-rose-500" : "bg-indigo-500")} />
                                <p className={cn("font-medium transition-colors", isDark ? "text-gray-400" : "text-slate-600")}>
                                    New client <span className={cn("font-bold", isDark ? "text-white" : "text-slate-900")}>Nova Soft</span> onboarded
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
