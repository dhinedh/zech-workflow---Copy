
"use client"

import { useAuthStore } from "@/store/authStore"
import { useTheme } from "@/context/ThemeContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    Clock,
    DollarSign,
    Layout,
    CheckCircle2,
    Calendar,
    ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function FreelancerDashboard() {
    const { user } = useAuthStore()
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <div className={cn("space-y-8 animate-in fade-in duration-500")}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>
                        Freelancer Dashboard
                    </h2>
                    <p className={cn("transition-colors", isDark ? "text-gray-400 text-sm font-medium" : "text-slate-500 mt-1")}>
                        Welcome back, {user?.name}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className={cn("font-semibold transition-all shadow-sm", isDark ? "border-white/10 text-white hover:bg-white/5" : "border-slate-200")} asChild>
                        <Link href="/dashboard/reports/daily">Submit Work Log</Link>
                    </Button>
                    <Button className={cn("font-bold tracking-tight transition-all shadow-lg h-10 px-8", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "bg-indigo-600 hover:bg-indigo-700 text-white")}>
                        View Contracts
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className={cn(
                    "border-0 shadow-lg transition-all duration-300 relative overflow-hidden group hover:-translate-y-1",
                    isDark ? "bg-gradient-to-br from-[#C0FF00] to-emerald-500 text-black shadow-[#C0FF00]/10" : "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white"
                )}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-black/60" : "opacity-80")}>Pending Earnings</CardTitle>
                        <DollarSign className={cn("h-4 w-4 shadow-sm", isDark ? "text-black" : "opacity-80")} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tight">$1,250.00</div>
                        <p className={cn("text-[10px] font-semibold uppercase tracking-wider mt-2", isDark ? "text-black/60" : "opacity-70")}>Payment Date: Mar 01</p>
                    </CardContent>
                    {isDark && <div className="absolute top-0 right-0 p-1 bg-black text-[#C0FF00] text-[10px] font-bold px-3">SECURE</div>}
                </Card>
                <Card className={cn("transition-all duration-300 border shadow-sm group hover:-translate-y-1", isDark ? "bg-[#1c1c1c] border-white/10 shadow-xl" : "bg-white border-slate-200")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider transition-colors", isDark ? "text-gray-400" : "text-slate-500")}>Active Projects</CardTitle>
                        <Layout className={cn("h-4 w-4", isDark ? "text-[#C0FF00]" : "text-indigo-500")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>03</div>
                        <p className={cn("text-xs font-medium mt-1 transition-colors", isDark ? "text-gray-600" : "text-slate-400")}>2 Projects near completion</p>
                    </CardContent>
                </Card>
                <Card className={cn("transition-all duration-300 border shadow-sm group hover:-translate-y-1", isDark ? "bg-[#1c1c1c] border-white/10 shadow-xl" : "bg-white border-slate-200")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider transition-colors", isDark ? "text-gray-400" : "text-slate-500")}>Billable Hours</CardTitle>
                        <Clock className={cn("h-4 w-4", isDark ? "text-emerald-400" : "text-emerald-500")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>18h 45m</div>
                        <p className={cn("text-xs font-medium mt-1 transition-colors", isDark ? "text-gray-600" : "text-slate-400")}>Logged this week</p>
                    </CardContent>
                </Card>
                <Card className={cn("transition-all duration-300 border shadow-sm group hover:-translate-y-1", isDark ? "bg-[#1c1c1c] border-white/10 shadow-xl" : "bg-white border-slate-200")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider transition-colors", isDark ? "text-gray-400" : "text-slate-500")}>Success Rate</CardTitle>
                        <CheckCircle2 className={cn("h-4 w-4", isDark ? "text-amber-400" : "text-amber-500")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>98%</div>
                        <p className={cn("text-xs font-medium mt-1 transition-colors", isDark ? "text-amber-500" : "text-slate-400")}>Top Rated Freelancer</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                <Card className={cn(
                    "col-span-full lg:col-span-4 transition-all duration-300 border shadow-xl",
                    isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200 shadow-sm"
                )}>
                    <CardHeader className={cn("border-b transition-colors", isDark ? "border-white/5 bg-white/2 pb-6" : "pb-4 border-slate-100")}>
                        <div>
                            <CardTitle className={cn("text-lg font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>Project Progress</CardTitle>
                            <p className={cn("text-xs font-medium mt-1 transition-colors", isDark ? "text-gray-500" : "text-slate-500")}>Real-time status of current contract milestones.</p>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-10">
                        {[
                            { name: "Zephyr E-commerce", progress: 75, deadline: "5 days remaining", status: "Ahead" },
                            { name: "Titan Dashboard UI", progress: 42, deadline: "12 days remaining", status: "On Track" },
                            { name: "Quantum API Docs", progress: 10, deadline: "20 days remaining", status: "Starting" },
                        ].map((p, i) => (
                            <div key={i} className="space-y-4 group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={cn("font-bold tracking-tight text-base transition-colors", isDark ? "text-white group-hover:text-[#C0FF00]" : "text-slate-900")}>{p.name}</p>
                                        <p className={cn("text-xs font-medium transition-colors", isDark ? "text-gray-600" : "text-slate-500")}>{p.deadline}</p>
                                    </div>
                                    <span className={cn("text-sm font-bold tracking-tight", isDark ? "text-[#C0FF00]" : "text-indigo-600")}>{p.progress}%</span>
                                </div>
                                <div className={cn("h-2.5 w-full rounded-full overflow-hidden transition-all", isDark ? "bg-white/5" : "bg-slate-100")}>
                                    <div className={cn("h-full rounded-full transition-all duration-1000", isDark ? "bg-[#C0FF00] shadow-[0_0_10px_#C0FF00]" : "bg-indigo-500")} style={{ width: `${p.progress}%` }} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className={cn(
                    "col-span-full lg:col-span-3 transition-all duration-300 border shadow-xl",
                    isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200 shadow-sm"
                )}>
                    <CardHeader className={cn("border-b transition-colors", isDark ? "border-white/5 bg-white/2 pb-6" : "pb-4 border-slate-100")}>
                        <CardTitle className={cn("text-lg font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>Recent Milestones</CardTitle>
                        <p className={cn("text-xs font-medium mt-1 transition-colors", isDark ? "text-gray-500" : "text-slate-500")}>Latest approvals and deliverables.</p>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="space-y-8">
                            {[
                                { title: "Auth Module Redesign", date: "yesterday", amount: "$450", status: "Pending" },
                                { title: "User Profile Pages", date: "2 days ago", amount: "$300", status: "Approved" },
                                { title: "Database Migration", date: "3 days ago", amount: "$150", status: "Approved" },
                            ].map((m, i) => (
                                <div key={i} className={cn("flex items-center justify-between pb-5 border-b last:border-0 last:pb-0 transition-all", isDark ? "border-white/5" : "border-slate-50")}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center transition-all shadow-sm",
                                            m.status === 'Approved'
                                                ? (isDark ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-50 text-emerald-600')
                                                : (isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600')
                                        )}>
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className={cn("text-sm font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>{m.title}</p>
                                            <p className={cn("text-xs font-medium transition-colors", isDark ? "text-gray-600" : "text-slate-500")}>{m.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn("text-sm font-bold tracking-tight", isDark ? "text-white" : "text-slate-900")}>{m.amount}</p>
                                        <p className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider mt-1 transition-all",
                                            m.status === 'Approved' ? (isDark ? 'text-emerald-500' : 'text-emerald-600') : (isDark ? 'text-amber-500' : 'text-amber-600')
                                        )}>
                                            {m.status}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className={cn(
                            "w-full mt-8 font-bold tracking-tight text-sm h-12 rounded-xl border-2 transition-all",
                            isDark ? "border-white/10 text-white hover:bg-[#C0FF00] hover:text-black hover:border-transparent" : "border-slate-200 text-indigo-600 hover:bg-indigo-50"
                        )}>
                            Create New Invoice
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
