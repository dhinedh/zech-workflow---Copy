
"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import { useTheme } from "@/context/ThemeContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Users,
    UserPlus,
    Mail,
    MoreHorizontal,
    Shield,
    BadgeCheck,
    Search,
    Filter
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"


interface TeamMember {
    id: string;
    name: string;
    role: string;
    email: string;
    status: string;
    avatar: string;
    designation?: string;
}

export default function TeamPage() {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [isInviting, setIsInviting] = useState(false)
    const [inviteEmail, setInviteEmail] = useState("")

    const [team, setTeam] = useState<TeamMember[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await api.get('/users')
                if (response.data.success) {
                    const mappedTeam = response.data.data.map((u: any) => ({
                        id: u.id,
                        name: u.name,
                        role: u.designation || u.role,
                        email: u.email,
                        status: u.isActive ? "Active" : "Inactive",
                        avatar: u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
                    }))
                    setTeam(mappedTeam)
                }
            } catch (error) {
                console.error('Failed to fetch team:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchTeam()
    }, [])

    return (
        <div className={cn("space-y-8 animate-in fade-in duration-500")}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>
                        Team Directory
                    </h2>
                    <p className={cn("transition-colors", isDark ? "text-gray-400 text-sm" : "text-slate-500 mt-1")}>
                        {isDark ? "Total Active Members: 5" : "Manage your team members and their roles."}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className={cn("font-bold tracking-tight transition-all shadow-sm", isDark ? "border-white/10 text-white hover:bg-white/5" : "border-slate-200")}>
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                    <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                        <DialogTrigger asChild>
                            <Button className={cn("font-bold tracking-tight transition-all shadow-lg h-10 px-6", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "bg-indigo-600 hover:bg-indigo-700")}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className={isDark ? "bg-[#1c1c1c] border-white/10 text-white" : ""}>
                            <DialogHeader>
                                <DialogTitle className={cn("font-bold tracking-tight", isDark ? "text-white" : "")}>Invite New Member</DialogTitle>
                                <DialogDescription className={isDark ? "text-gray-400" : ""}>
                                    Send an invitation to a new team member.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label className={isDark ? "text-gray-300" : ""}>Email Address</Label>
                                    <Input
                                        type="email"
                                        placeholder="email@company.com"
                                        className={isDark ? "bg-black/20 border-white/10 focus-visible:ring-indigo-500" : ""}
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className={cn("text-[10px] uppercase font-bold tracking-wider", isDark ? "text-gray-500" : "text-gray-600")}>Role / Title</Label>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {['Project Manager', 'Developer', 'Designer', 'QA Engineer'].map(role => (
                                            <Button key={role} variant="outline" size="sm" className={cn("text-[10px] font-bold tracking-tight h-8 transition-all shrink-0", isDark ? "border-white/10 text-gray-400 hover:bg-white/5" : "border-slate-200")}>{role}</Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    className={cn("w-full h-11 font-bold", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "bg-indigo-600 hover:bg-indigo-700")}
                                    onClick={async () => {
                                        if (!inviteEmail) return
                                        setIsInviting(true)
                                        // Mock invite for now as backend doesn't have invite system yet
                                        await new Promise(r => setTimeout(r, 1000))
                                        setIsInviting(false)
                                        setIsInviteOpen(false)
                                        setInviteEmail("")
                                    }}
                                    disabled={!inviteEmail || isInviting}
                                >
                                    {isInviting ? "Sending..." : "Send Invitation"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1 group">
                    <Search className={cn("absolute left-3 top-3.5 h-4 w-4 transition-colors", isDark ? "text-gray-500" : "text-slate-400")} />
                    <Input
                        placeholder="Search team members..."
                        className={cn(
                            "pl-10 h-11 transition-all font-medium",
                            isDark ? "bg-[#1c1c1c] border-white/10 text-white focus-visible:ring-indigo-500 placeholder:text-gray-600" : ""
                        )}
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {team.map((member, i) => (
                    <Card key={i} className={cn(
                        "transition-all duration-300 border shadow-sm group hover:-translate-y-1 overflow-hidden relative",
                        isDark ? "bg-[#1c1c1c] border-white/10 shadow-xl hover:border-white/20" : "border-slate-200 bg-white"
                    )}>
                        <CardHeader className="flex flex-row items-center gap-4 pb-4">
                            <div className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-xl transition-all duration-300",
                                isDark ? "bg-white/5 text-[#C0FF00] border border-white/5 group-hover:scale-105" : "bg-indigo-50 text-indigo-700"
                            )}>
                                {member.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                                <CardTitle className={cn("text-lg font-bold tracking-tight truncate transition-colors", isDark ? "text-white group-hover:text-[#C0FF00]" : "text-slate-900")}>
                                    {member.name}
                                </CardTitle>
                                <p className={cn("text-[11px] font-semibold uppercase tracking-wider transition-colors", isDark ? "text-gray-500" : "text-slate-500")}>
                                    {member.role}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" className={cn("transition-colors", isDark ? "text-gray-600 hover:text-white hover:bg-white/5" : "text-slate-400 hover:bg-slate-50")}>
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-2">
                            <div className="flex items-center gap-3">
                                <Mail className={cn("h-4 w-4 transition-colors", isDark ? "text-gray-500" : "text-slate-400")} />
                                <span className={cn("text-xs font-medium transition-colors truncate", isDark ? "text-gray-400" : "text-slate-600")}>{member.email}</span>
                            </div>

                            <div className={cn("flex items-center justify-between pt-4 border-t transition-colors", isDark ? "border-white/5" : "border-slate-100")}>
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        member.status === 'Active' ? (isDark ? 'bg-[#C0FF00]' : 'bg-green-500') :
                                            member.status === 'In Meeting' ? 'bg-cyan-400' : 'bg-rose-500'
                                    )} />
                                    <span className={cn("text-xs font-medium transition-colors", isDark ? "text-gray-500" : "text-slate-500")}>
                                        {member.status}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <BadgeCheck className={cn("h-4 w-4", isDark ? "text-gray-700" : "text-blue-500")} />
                                    <Shield className={cn("h-4 w-4", isDark ? "text-gray-700" : "text-slate-300")} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
