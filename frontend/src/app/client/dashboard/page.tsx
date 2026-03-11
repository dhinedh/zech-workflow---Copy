
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import {
    Loader2,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Clock,
    FolderKanban,
    MessageSquare,
    FileText,
    TrendingUp,
    MoreHorizontal,
    Users
} from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/authStore"
import { useTheme } from "@/context/ThemeContext"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function ClientDashboard() {
    const { user } = useAuthStore()
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [loading, setLoading] = useState(false)

    // Mock Data to match the exact requirement
    const activeProjectsCount = 2
    const overallProgress = 78.5
    const pendingApprovals = 1

    return (
        <div className={cn("space-y-8 max-w-7xl mx-auto")}>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h2 className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>
                        {isDark ? "Project Control" : "Welcome back,"} {user?.name || "Client"}! {isDark ? "" : "👋"}
                    </h2>
                    <p className={cn("transition-colors", isDark ? "text-gray-400 text-sm font-medium" : "text-muted-foreground mt-1")}>
                        You have <span className={cn("font-bold tracking-tight", isDark ? "text-[#C0FF00]" : "text-amber-600")}>1 pending approval</span>.
                    </p>
                </div>
                <div className={cn("text-xs font-semibold uppercase tracking-wider transition-colors", isDark ? "text-gray-600" : "text-muted-foreground")}>
                    {format(new Date(), 'yyyy / MM / dd')}
                </div>
            </div>

            {/* Projects Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className={cn("transition-all duration-300 border shadow-sm", isDark ? "bg-[#1c1c1c] border-white/10 shadow-2xl" : "bg-white border-slate-200")}>
                    <CardHeader className="pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider transition-colors", isDark ? "text-gray-400" : "text-muted-foreground")}>Active Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>{activeProjectsCount}</div>
                        <div className={cn("flex items-center text-[10px] font-bold uppercase tracking-wider mt-2 transition-all", isDark ? "text-[#C0FF00]" : "text-green-600")}>
                            <span className={cn("h-2 w-2 rounded-full mr-2", isDark ? "bg-[#C0FF00] shadow-[0_0_8px_#C0FF00]" : "bg-green-500")}></span>
                            Synchronized
                        </div>
                    </CardContent>
                </Card>
                <Card className={cn("transition-all duration-300 border shadow-sm", isDark ? "bg-[#1c1c1c] border-white/10 shadow-2xl" : "bg-white border-slate-200")}>
                    <CardHeader className="pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider transition-colors", isDark ? "text-gray-400" : "text-muted-foreground")}>Overall Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>{overallProgress}%</div>
                        <div className={cn("h-2 w-full rounded-full mt-3 overflow-hidden transition-all", isDark ? "bg-white/5" : "bg-gray-100")}>
                            <div className={cn("h-full rounded-full transition-all duration-1000", isDark ? "bg-[#C0FF00] shadow-[0_0_10px_#C0FF00]" : "bg-indigo-600")} style={{ width: `${overallProgress}%` }} />
                        </div>
                    </CardContent>
                </Card>
                <Card className={cn("transition-all duration-300 border shadow-lg relative", isDark ? "bg-[#C0FF00] border-transparent text-black shadow-[0_0_30px_rgba(192,255,0,0.2)]" : "bg-amber-50 border-amber-100")}>
                    <CardHeader className="pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-black/60" : "text-amber-900")}>Pending Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-bold tracking-tight")}>{pendingApprovals}</div>
                        <div className={cn("text-[10px] font-bold uppercase tracking-wider mt-2", isDark ? "text-black/70" : "text-amber-700")}>
                            Review Required &gt;
                        </div>
                    </CardContent>
                    {isDark && <div className="absolute top-0 right-0 p-1 bg-black text-[#C0FF00] text-[10px] font-bold px-3">ACTION</div>}
                </Card>
                <Card className={cn("transition-all duration-300 border shadow-sm", isDark ? "bg-[#1c1c1c] border-white/10 shadow-2xl" : "bg-white border-slate-200")}>
                    <CardHeader className="pb-2">
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider transition-colors", isDark ? "text-gray-400" : "text-muted-foreground")}>Next Milestone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>Feb 20</div>
                        <div className={cn("text-[10px] font-bold uppercase tracking-wider mt-2 transition-colors", isDark ? "text-gray-600" : "text-muted-foreground")}>
                            Development Phase
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* PENDING APPROVAL HERO CARD */}
            <div className="space-y-6">
                <h3 className={cn("text-base font-bold uppercase tracking-wider flex items-center gap-3 transition-colors", isDark ? "text-white" : "text-gray-900")}>
                    <AlertCircle className={cn("h-5 w-5", isDark ? "text-[#C0FF00]" : "text-amber-500")} />
                    Awaiting Decision ({pendingApprovals})
                </h3>
                <Card className={cn("transition-all duration-300 border shadow-xl overflow-hidden group", isDark ? "bg-[#1c1c1c] border-white/10" : "border-amber-200 bg-amber-50/10")}>
                    <div className={cn("absolute top-0 left-0 w-1.5 h-full transition-all duration-500", isDark ? "bg-[#C0FF00] shadow-[0_0_20px_#C0FF00]" : "bg-amber-400")}></div>
                    <CardContent className="p-8">
                        <div className="flex flex-col lg:flex-row justify-between gap-10">
                            <div className="space-y-6 flex-1">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Badge className={cn("font-bold tracking-wider uppercase text-[10px] h-6 px-3 border transition-all", isDark ? "bg-[#C0FF00]/10 text-[#C0FF00] border-[#C0FF00]/20" : "bg-amber-100 text-amber-700 border-amber-200")}>Action Required</Badge>
                                        <span className={cn("text-[10px] font-semibold uppercase tracking-wider transition-colors", isDark ? "text-gray-600" : "text-gray-500")}>Completed: Feb 05</span>
                                    </div>
                                    <h3 className={cn("text-2xl font-bold tracking-tight transition-colors", isDark ? "text-white group-hover:text-[#C0FF00]" : "text-gray-900")}>Mobile App Development - Milestone: Phase 2 Design</h3>
                                    <p className={cn("text-sm font-semibold mt-2 transition-colors", isDark ? "text-[#C0FF00]" : "text-amber-700")}>Status: 🟡 Awaiting Your Approval</p>
                                </div>

                                <div className="space-y-3">
                                    <p className={cn("text-xs font-bold uppercase tracking-wider transition-colors", isDark ? "text-gray-500" : "text-gray-700")}>Deliverables:</p>
                                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {["UI/UX Wireframes", "High-Fidelity Mockups", "Interactive Prototype"].map((item, i) => (
                                            <li key={i} className={cn("flex items-center text-xs font-medium transition-colors", isDark ? "text-gray-400" : "text-gray-600")}>
                                                <CheckCircle2 className={cn("h-3.5 w-3.5 mr-2", isDark ? "text-[#C0FF00]" : "text-green-500")} />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className={cn("p-4 rounded-xl border italic font-medium text-xs transition-all", isDark ? "bg-white/5 border-white/10 text-gray-400" : "bg-white/50 border-amber-100 text-gray-600")}>
                                    <span className={cn("font-bold tracking-wider uppercase not-italic mr-2 transition-colors", isDark ? "text-white" : "text-gray-900")}>Team Note: </span>
                                    "All design deliverables ready for review. Prototype includes full user flow with interactions. Please review and approve to proceed with development phase."
                                </div>

                                <div className={cn("flex items-center gap-6 text-[10px] font-bold uppercase tracking-wider transition-colors", isDark ? "text-gray-600" : "text-gray-500")}>
                                    <span className="flex items-center"><FileText className="w-3 h-3 mr-1.5" /> 3 Attachments</span>
                                    <span>|</span>
                                    <span>Milestone Payment: 30% (₹1.5L) due upon approval</span>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center gap-4 min-w-[240px]">
                                <Button asChild className={cn("font-bold tracking-tight h-14 shadow-lg text-base transition-all", isDark ? "bg-white text-black hover:bg-[#C0FF00]" : "bg-amber-600 hover:bg-amber-700 text-white")}>
                                    <Link href="/client/projects/proj-mobile/milestones/mil-phase2">
                                        Review Details
                                    </Link>
                                </Button>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" className={cn("font-bold tracking-wider text-[10px] h-12 border-2", isDark ? "border-white/10 text-white hover:bg-white/5" : "border-amber-200 text-amber-800 bg-white")}>
                                        Request Revision
                                    </Button>
                                    <Button variant="outline" className={cn("font-bold tracking-wider text-[10px] h-12 border-2", isDark ? "border-[#C0FF00]/50 text-[#C0FF00] bg-[#C0FF00]/5 hover:bg-[#C0FF00] hover:text-black" : "border-amber-200 text-green-700 bg-white hover:bg-green-50")}>
                                        Approve & Pay
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid lg:grid-cols-3 gap-10">

                {/* LEFT COL - PROJECT STATUS */}
                <div className="lg:col-span-2 space-y-8">
                    <h3 className={cn("text-base font-bold uppercase tracking-wider transition-colors", isDark ? "text-white" : "text-gray-900")}>Project Status</h3>

                    {/* Project 1 */}
                    <Card className={cn("transition-all duration-300 border shadow-xl overflow-hidden", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200")}>
                        <CardHeader className={cn("pb-4 border-b transition-colors", isDark ? "border-white/5 bg-white/2" : "border-slate-100 bg-slate-50/30")}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className={cn("font-bold tracking-tight text-xl transition-colors", isDark ? "text-white" : "text-slate-900")}>Mobile App Development</CardTitle>
                                    <CardDescription className={cn("text-[10px] font-semibold uppercase tracking-wider mt-1 transition-colors", isDark ? "text-gray-500" : "text-slate-500")}>Project Manager: Sarah Johnson • Start Date: 2024.12.10</CardDescription>
                                </div>
                                <Badge className={cn("font-bold tracking-wider uppercase text-[10px] h-6 px-3 border-none shadow-sm", isDark ? "bg-[#C0FF00]/10 text-[#C0FF00]" : "bg-green-100 text-green-700")}>85% Complete</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-10 pt-8">
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                    <span className={cn("transition-colors", isDark ? "text-gray-600" : "text-gray-500")}>Overall Progress</span>
                                    <span className={cn("transition-colors font-bold", isDark ? "text-[#C0FF00]" : "text-slate-900")}>85%</span>
                                </div>
                                <div className={cn("h-3 w-full rounded-full overflow-hidden transition-all", isDark ? "bg-white/5" : "bg-gray-100")}>
                                    <div className={cn("h-full transition-all duration-1000", isDark ? "bg-[#C0FF00] shadow-[0_0_10px_#C0FF00]" : "bg-green-500")} style={{ width: '85%' }} />
                                </div>
                            </div>

                            {/* Timeline Viz */}
                            <div className="relative pt-8 pb-4">
                                <div className={cn("absolute top-10 left-0 w-full h-0.5 transition-colors", isDark ? "bg-white/10" : "bg-gray-200")}></div>
                                <div className="flex justify-between relative text-[10px] font-bold uppercase tracking-wider transition-colors">
                                    {[
                                        { label: "Start", date: "Dec 10", active: true },
                                        { label: "Phase 1", date: "Jan 15", active: true },
                                        { label: "Phase 2", date: "Feb 05", active: true, highlighted: true },
                                        { label: "Launch", date: "Feb 28", active: false }
                                    ].map((mil, idx) => (
                                        <div key={idx} className={cn("text-center w-24 space-y-3", !mil.active && "opacity-30")}>
                                            <div className={cn(
                                                "w-4 h-4 rounded-full mx-auto relative z-10 ring-4 transition-all duration-500",
                                                mil.highlighted
                                                    ? (isDark ? "bg-[#C0FF00] ring-[#1c1c1c] shadow-[0_0_10px_#C0FF00]" : "bg-green-500 ring-white shadow-sm")
                                                    : (mil.active ? (isDark ? "bg-white/20 ring-[#1c1c1c]" : "bg-indigo-600 ring-white shadow-sm") : (isDark ? "bg-white/10 ring-[#1c1c1c]" : "bg-gray-300 ring-white shadow-sm"))
                                            )}></div>
                                            <span className={cn("block transition-colors", mil.highlighted && isDark ? "text-[#C0FF00]" : (isDark ? "text-gray-500" : "text-gray-500"))}>{mil.label}<br />{mil.date}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pb-2">
                                <div className={cn("p-5 rounded-2xl transition-all border shadow-sm", isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100")}>
                                    <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1.5 transition-colors", isDark ? "text-gray-600" : "text-gray-500")}>Budget Usage</p>
                                    <p className={cn("text-lg font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-gray-900")}>₹4.2L / ₹5.0L</p>
                                    <div className={cn("w-full h-1.5 rounded-full mt-3 transition-colors", isDark ? "bg-black/20" : "bg-gray-200")}>
                                        <div className={cn("h-1.5 rounded-full transition-all", isDark ? "bg-[#C0FF00] shadow-[0_0_8px_#C0FF00]" : "bg-indigo-500")} style={{ width: '84%' }}></div>
                                    </div>
                                </div>
                                <div className={cn("p-5 rounded-2xl transition-all border shadow-sm", isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100")}>
                                    <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1.5 transition-colors", isDark ? "text-gray-600" : "text-gray-500")}>Project Health</p>
                                    <p className={cn("text-lg font-bold tracking-tight uppercase flex items-center transition-colors", isDark ? "text-[#C0FF00]" : "text-green-600")}>
                                        <CheckCircle2 className="w-5 h-5 mr-2" /> Healthy
                                    </p>
                                    <p className={cn("text-[10px] font-medium mt-1.5 transition-colors", isDark ? "text-gray-600" : "text-gray-400")}>No issues detected</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className={cn("border-t p-4 transition-colors", isDark ? "bg-white/5 border-white/10" : "bg-slate-50/50 border-slate-100")}>
                            <Button variant="ghost" className={cn("w-full font-bold tracking-wider text-[10px] uppercase h-10 transition-all", isDark ? "text-[#C0FF00] hover:bg-white/5" : "text-indigo-600 hover:bg-indigo-50")}>
                                View Detailed Project Analytics <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Project 2 */}
                    <Card className={cn("transition-all duration-500 border shadow-2xl overflow-hidden", isDark ? "bg-[#080808] border-white/5" : "")}>
                        <CardHeader className={cn("pb-4 border-b transition-colors", isDark ? "border-white/5 bg-white/2" : "")}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className={cn("font-black tracking-tighter text-xl transition-colors", isDark ? "text-white" : "")}>E-commerce Website</CardTitle>
                                    <CardDescription className={cn("text-[9px] font-bold uppercase tracking-[0.15em] mt-1 transition-colors", isDark ? "text-gray-600" : "")}>Manager: MIKE CHEN // START_DATE: 2026.01.15</CardDescription>
                                </div>
                                <Badge className={cn("font-black tracking-widest uppercase text-[10px] h-6 px-3 border-none", isDark ? "bg-cyan-500/10 text-cyan-400" : "bg-blue-100 text-blue-700")}>72% COMPLETE</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8 pt-6 pb-6">
                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className={cn("transition-colors", isDark ? "text-gray-700" : "text-gray-500")}>Progress_Buffer</span>
                                    <span className={cn("transition-colors", isDark ? "text-cyan-400" : "font-medium text-slate-900")}>72%</span>
                                </div>
                                <div className={cn("h-3 w-full rounded-full overflow-hidden transition-all", isDark ? "bg-white/5" : "bg-gray-100")}>
                                    <div className={cn("h-full transition-all duration-1000", isDark ? "bg-cyan-400 shadow-[0_0_10px_#22D3EE]" : "bg-blue-500")} style={{ width: '72%' }} />
                                </div>
                                <p className={cn("text-[9px] font-black uppercase tracking-[0.2em] mt-4 transition-colors", isDark ? "text-gray-600" : "text-muted-foreground pt-2")}>Next Milestone: Back-end API Synced (Feb 15)</p>
                            </div>
                        </CardContent>
                        <CardFooter className={cn("border-t p-4 transition-colors", isDark ? "bg-white/2 border-white/5" : "bg-gray-50/50")}>
                            <Button variant="ghost" className={cn("w-full font-black tracking-widest text-[10px] uppercase h-10 transition-all", isDark ? "text-cyan-400 hover:bg-white/5" : "text-indigo-600")}>
                                DECODE_PROJECT_TELEMETRY <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* RIGHT COL - SIDEBAR INFO */}
                <div className="space-y-8">

                    {/* RECENT UPDATES */}
                    <Card className={cn("transition-all duration-300 border shadow-xl overflow-hidden", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200")}>
                        <CardHeader className={cn("pb-4 border-b transition-colors", isDark ? "border-white/5 bg-white/2" : "border-slate-100 bg-slate-50/30")}>
                            <div className="flex justify-between items-center">
                                <CardTitle className={cn("text-xs font-bold uppercase tracking-wider transition-colors", isDark ? "text-white" : "text-gray-900")}>Activity Feed</CardTitle>
                                <Button variant="ghost" size="sm" className={cn("text-[9px] font-bold uppercase tracking-widest h-6 px-2 transition-all", isDark ? "text-[#C0FF00] hover:bg-[#C0FF00]/10" : "text-indigo-600 hover:bg-slate-100")}>View All</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                {[
                                    { title: "Design Revision Update", time: "2h ago", type: "system" },
                                    { title: "Weekly Report Generated", time: "5h ago", type: "file" },
                                    { title: "New Resource Assigned", time: "1d ago", type: "user" }
                                ].map((log, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className={cn("h-1.5 w-1.5 mt-1.5 rounded-full shrink-0 transition-all", isDark ? "bg-[#C0FF00] shadow-[0_0_8px_#C0FF00]" : "bg-indigo-500 group-hover:scale-125")} />
                                        <div>
                                            <p className={cn("text-xs font-bold tracking-tight transition-colors", isDark ? "text-gray-300 group-hover:text-white" : "text-slate-900")}>{log.title}</p>
                                            <p className={cn("text-[10px] font-medium transition-colors", isDark ? "text-gray-600" : "text-gray-400")}>{log.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* ACCOUNT MANAGER */}
                    <Card className={cn("transition-all duration-300 border shadow-xl overflow-hidden", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200")}>
                        <CardHeader className={cn("pb-4 border-b transition-colors", isDark ? "border-white/5 bg-white/2" : "border-slate-100 bg-slate-50/30")}>
                            <CardTitle className={cn("text-xs font-bold uppercase tracking-wider transition-colors", isDark ? "text-white" : "text-gray-900")}>Account Manager</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors border", isDark ? "bg-white/5 border-white/10" : "bg-indigo-50 border-indigo-100")}>
                                    <Users className={cn("w-6 h-6", isDark ? "text-[#C0FF00]" : "text-indigo-600")} />
                                </div>
                                <div>
                                    <p className={cn("font-bold tracking-tight text-sm transition-colors", isDark ? "text-white" : "text-slate-900")}>David Miller</p>
                                    <p className={cn("text-xs font-medium transition-colors", isDark ? "text-gray-500" : "text-slate-500")}>Senior Project Lead</p>
                                </div>
                            </div>
                            <Button className={cn("w-full mt-6 font-bold tracking-tight text-xs h-10 transition-all", isDark ? "bg-white/10 text-white hover:bg-[#C0FF00] hover:text-black" : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md")}>
                                Message Support
                            </Button>
                        </CardContent>
                    </Card>

                    {/* SYSTEM STATUS */}
                    <Card className={cn("transition-all duration-300 border shadow-xl overflow-hidden", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200 shadow-sm")}>
                        <CardHeader className={cn("pb-4 border-b transition-colors", isDark ? "border-white/5 bg-white/2" : "border-slate-100 bg-slate-50/30")}>
                            <CardTitle className={cn("text-xs font-bold uppercase tracking-wider transition-colors", isDark ? "text-white" : "text-gray-900")}>System Status</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                <span className={cn("transition-colors", isDark ? "text-gray-600" : "text-gray-500")}>Core Systems</span>
                                <span className={cn("transition-colors", isDark ? "text-[#C0FF00]" : "text-green-600")}>Online</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                <span className={cn("transition-colors", isDark ? "text-gray-600" : "text-gray-500")}>API Connectivity</span>
                                <span className={cn("transition-colors", isDark ? "text-[#C0FF00]" : "text-green-600")}>100%</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider pt-2 border-t border-dashed border-white/10">
                                <span className={cn("transition-colors", isDark ? "text-gray-600" : "text-gray-400")}>Last Sync</span>
                                <span className={cn("transition-colors font-medium", isDark ? "text-gray-400" : "text-gray-500")}>{format(new Date(), 'HH:mm:ss')}</span>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    )
}
