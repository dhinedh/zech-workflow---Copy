
"use client"

import { useAuthStore } from "@/store/authStore"
import { useTheme } from "@/context/ThemeContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Users,
    Building2,
    CreditCard,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function SuperAdminDashboard() {
    const { user } = useAuthStore()
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    const stats = [
        {
            title: "Total Companies",
            value: "142",
            change: "+12.5%",
            trend: "up",
            icon: Building2,
            color: isDark ? "text-[#C0FF00]" : "text-blue-600",
            bg: isDark ? "bg-[#C0FF00]/10" : "bg-blue-100"
        },
        {
            title: "Active Users",
            value: "1,284",
            change: "+18.2%",
            trend: "up",
            icon: Users,
            color: isDark ? "text-cyan-400" : "text-green-600",
            bg: isDark ? "bg-cyan-400/10" : "bg-green-100"
        },
        {
            title: "Monthly Revenue",
            value: "$42.5k",
            change: "-2.4%",
            trend: "down",
            icon: CreditCard,
            color: isDark ? "text-purple-400" : "text-purple-600",
            bg: isDark ? "bg-purple-400/10" : "bg-purple-100"
        },
        {
            title: "System Health",
            value: "99.9%",
            change: "Stable",
            trend: "neutral",
            icon: Activity,
            color: isDark ? "text-rose-400" : "text-rose-600",
            bg: isDark ? "bg-rose-400/10" : "bg-rose-100"
        }
    ]

    return (
        <div className={cn("space-y-8")}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>System Dashboard</h1>
                    <p className={cn("transition-colors", isDark ? "text-gray-400 text-xs font-medium uppercase tracking-wider" : "text-slate-500 mt-1")}>
                        {isDark ? "Platform Administration Portal" : "Global management dashboard for ZECH Workflow."}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className={cn("font-semibold transition-all shadow-sm", isDark ? "border-white/10 text-white hover:bg-white/5" : "")}>
                        <Filter className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                    <Button className={cn("font-bold tracking-tight transition-all shadow-lg h-10 px-8", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "bg-indigo-600 hover:bg-indigo-700")}>
                        {isDark ? "Add New Company" : "Add New Company"}
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className={cn(
                        "transition-all duration-300 border shadow-sm group hover:-translate-y-1",
                        isDark ? "bg-[#1c1c1c] border-white/10 shadow-xl" : "bg-white border-slate-200"
                    )}>
                        <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                            <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider transition-colors", isDark ? "text-gray-400" : "text-slate-500")}>
                                {stat.title}
                            </CardTitle>
                            <div className={cn("p-2.5 rounded-xl transition-all shadow-sm", stat.bg, stat.color)}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={cn("text-2xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>{stat.value}</div>
                            <div className="flex items-center mt-2 group">
                                {stat.trend === 'up' ? (
                                    <ArrowUpRight className={cn("h-3 w-3 mr-1", isDark ? "text-[#C0FF00]" : "text-green-600")} />
                                ) : stat.trend === 'down' ? (
                                    <ArrowDownRight className={cn("h-3 w-3 mr-1", isDark ? "text-rose-500" : "text-rose-600")} />
                                ) : null}
                                <span className={cn("text-[10px] font-bold uppercase tracking-wider",
                                    stat.trend === 'up' ? (isDark ? 'text-[#C0FF00]' : 'text-green-600') :
                                        stat.trend === 'down' ? (isDark ? 'text-rose-500' : 'text-rose-600') : (isDark ? 'text-gray-600' : 'text-slate-400')
                                )}>
                                    {stat.change}
                                </span>
                                <span className={cn("text-[10px] font-medium uppercase tracking-wider ml-1.5", isDark ? "text-gray-600" : "text-slate-400")}>vs last month</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Companies & Activity */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                <Card className={cn(
                    "col-span-full lg:col-span-4 transition-all duration-300 border shadow-xl",
                    isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200"
                )}>
                    <CardHeader className={cn("flex flex-row items-center justify-between border-b transition-colors", isDark ? "border-white/5 bg-white/2 pb-6" : "pb-4 border-slate-100")}>
                        <div>
                            <CardTitle className={cn("text-lg font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>Recent Companies</CardTitle>
                            <p className={cn("text-xs font-medium text-gray-400 mt-1 transition-colors", isDark ? "text-gray-500" : "text-slate-500")}>Newly joined companies in current period.</p>
                        </div>
                        <div className="relative w-64 hidden sm:block">
                            <Search className={cn("absolute left-3 top-3.5 h-4 w-4", isDark ? "text-gray-600" : "text-slate-400")} />
                            <Input placeholder="Search companies..." className={cn(
                                "pl-10 h-11 text-xs transition-all",
                                isDark ? "bg-black border-white/5 text-white focus-visible:ring-indigo-500/50" : "h-9 pl-9 border-slate-200"
                            )} />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {[
                                { name: "Makjuz Corp", domain: "makjuz.com", status: "Active", users: 24, plan: "Enterprise" },
                                { name: "Skyline Digital", domain: "skyline.io", status: "Trial", users: 5, plan: "Pro" },
                                { name: "Nova Solutions", domain: "novasol.net", status: "Active", users: 12, plan: "Starter" },
                                { name: "Quantum Labs", domain: "qlabs.ai", status: "Pending", users: 0, plan: "Enterprise" },
                            ].map((company, i) => (
                                <div key={i} className={cn(
                                    "flex items-center justify-between group cursor-pointer p-4 rounded-2xl transition-all duration-300",
                                    isDark ? "hover:bg-white/[0.02] border border-transparent hover:border-white/5" : "hover:bg-slate-50"
                                )}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all shadow-sm",
                                            isDark ? "bg-black text-[#C0FF00] border border-white/5 group-hover:border-[#C0FF00]" : "bg-slate-100 text-indigo-600"
                                        )}>
                                            {company.name[0]}
                                        </div>
                                        <div>
                                            <p className={cn("font-bold tracking-tight text-base transition-colors", isDark ? "text-white group-hover:text-[#C0FF00]" : "text-slate-900")}>{company.name}</p>
                                            <p className={cn("text-xs font-medium transition-colors", isDark ? "text-gray-500" : "text-slate-500")}>{company.domain}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="hidden md:block text-right">
                                            <p className={cn("text-xs font-bold transition-colors", isDark ? "text-white" : "text-slate-900")}>{company.users} users</p>
                                            <p className={cn("text-[10px] font-semibold uppercase tracking-wider", isDark ? "text-gray-600" : "text-slate-500")}>{company.plan}</p>
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                                            company.status === 'Active' ? (isDark ? 'bg-[#C0FF00]/10 text-[#C0FF00]' : 'bg-green-100 text-green-700') :
                                                company.status === 'Trial' ? (isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-100 text-blue-700') :
                                                    (isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-100 text-amber-700')
                                        )}>
                                            {company.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className={cn(
                            "w-full mt-8 font-bold tracking-tight text-sm h-12 rounded-xl transition-all",
                            isDark ? "text-[#C0FF00] hover:bg-white/5 hover:text-white" : "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        )}>
                            View All Companies
                        </Button>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "col-span-full lg:col-span-3 transition-all duration-300 border shadow-xl",
                    isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200"
                )}>
                    <CardHeader className={cn("border-b transition-colors", isDark ? "border-white/5 bg-white/2" : "border-slate-100")}>
                        <CardTitle className={cn("text-lg font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>Activity Log</CardTitle>
                        <p className={cn("text-xs font-medium transition-colors", isDark ? "text-gray-500" : "text-slate-400")}>Latest system activity and logs.</p>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="space-y-8">
                            {[
                                { event: "Database Backup", time: "2h ago", status: "Success", type: "system" },
                                { event: "SSL Certificate Renewal", time: "5h ago", status: "Success", type: "system" },
                                { event: "New Signup: OmniMedia", time: "8h ago", status: "New", type: "user" },
                                { event: "High Traffic Alert", time: "10h ago", status: "Resolved", type: "alert" },
                                { event: "Deployment successful", time: "1d ago", status: "v2.8.4", type: "system" },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className={cn(
                                        "mt-1.5 h-2 w-2 rounded-full shrink-0 transition-all",
                                        log.type === 'alert' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' :
                                            log.type === 'user' ? 'bg-indigo-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]' :
                                                'bg-[#C0FF00] shadow-[0_0_8px_rgba(192,255,0,0.4)]'
                                    )} />
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className={cn("text-sm font-bold tracking-tight transition-colors", isDark ? "text-white group-hover:text-[#C0FF00]" : "text-slate-900")}>{log.event}</p>
                                            <span className={cn("text-[10px] font-medium text-gray-500")}>{log.time}</span>
                                        </div>
                                        <p className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded inline-block transition-colors",
                                            isDark ? "text-gray-400 bg-white/5 group-hover:text-white" : "bg-slate-50 text-slate-500"
                                        )}>
                                            Status: <span className={isDark ? "text-white" : "text-slate-700"}>{log.status}</span>
                                        </p>
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
