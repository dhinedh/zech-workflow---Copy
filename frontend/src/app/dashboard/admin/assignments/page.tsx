
"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { useTheme } from "@/context/ThemeContext"
import {
    Users,
    Briefcase,
    CheckSquare,
    Plus,
    Search,
    Filter,
    ChevronRight,
    UserPlus,
    LayoutDashboard,
    Clock,
    Target,
    Loader2,
    Calendar,
    AlertCircle,
    TrendingUp,
    Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function AdminAssignmentsPage() {
    const { user: currentUser } = useAuthStore()
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Mock Data
    const [users, setUsers] = useState([
        { id: "u1", name: "Alex Rivera", role: "DEVELOPER", department: "Engineering", avatar: "AR", activeProjects: 2, activeTasks: 5, workload: 75 },
        { id: "u2", name: "Sarah Chen", role: "DESIGNER", department: "Product", avatar: "SC", activeProjects: 1, activeTasks: 3, workload: 45 },
        { id: "u3", name: "Marcus Thorne", role: "MANAGER", department: "Management", avatar: "MT", activeProjects: 3, activeTasks: 8, workload: 90 },
        { id: "u4", name: "Elena Volkov", role: "DEVELOPER", department: "Engineering", avatar: "EV", activeProjects: 2, activeTasks: 4, workload: 60 },
    ])

    const [projects, setProjects] = useState([
        { id: "p1", name: "Cyber-Shield UI", status: "IN_PROGRESS", role: "Lead Developer" },
        { id: "p2", name: "Nexus API Core", status: "PLANNING", role: "Backend Support" },
        { id: "p3", name: "Zenith Mobile App", status: "IN_PROGRESS", role: "Frontend Lead" },
    ])

    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Assignment State
    const [isAssigning, setIsAssigning] = useState(false)
    const [assignmentType, setAssignmentType] = useState<"TASK" | "PROJECT" | "DAILY">("TASK")
    const [newAssignment, setNewAssignment] = useState({
        title: "",
        description: "",
        projectId: "",
        priority: "MEDIUM",
        dueDate: "",
        quotaHours: "8"
    })

    const selectedUser = users.find(u => u.id === selectedUserId)

    const handleAssign = () => {
        setIsAssigning(true)
        setTimeout(() => {
            setIsAssigning(false)
            setIsDialogOpen(false)
            setNewAssignment({ title: "", description: "", projectId: "", priority: "MEDIUM", dueDate: "", quotaHours: "8" })
        }, 1500)
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.department.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getWorkloadColor = (workload: number) => {
        if (workload >= 80) return isDark ? "text-red-400 bg-red-500/10" : "text-red-600 bg-red-50"
        if (workload >= 60) return isDark ? "text-amber-400 bg-amber-500/10" : "text-amber-600 bg-amber-50"
        return isDark ? "text-emerald-400 bg-emerald-500/10" : "text-emerald-600 bg-emerald-50"
    }

    return (
        <div className={cn("container mx-auto py-6 space-y-6", isDark && "font-mono")}>
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className={cn("text-3xl font-black tracking-tight", isDark ? "text-white" : "text-slate-900")}>
                            Team Assignments
                        </h1>
                        <p className={cn("mt-1 text-sm", isDark ? "text-gray-400" : "text-slate-500")}>
                            Manage tasks, projects, and workload allocation
                        </p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search team members..."
                                className={cn("pl-10", isDark ? "bg-white/5 border-white/10" : "")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Team Members List */}
                <Card className={cn("lg:col-span-1", isDark ? "bg-[#080808] border-white/5" : "shadow-sm")}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Team Members
                        </CardTitle>
                        <CardDescription>Select a member to manage</CardDescription>
                    </CardHeader>
                    <CardContent className="px-3">
                        <div className="space-y-2">
                            {filteredUsers.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => setSelectedUserId(u.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                                        selectedUserId === u.id
                                            ? (isDark ? "bg-[#C0FF00] text-black" : "bg-indigo-600 text-white")
                                            : (isDark ? "hover:bg-white/5 text-gray-300" : "hover:bg-gray-50 text-gray-700")
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                                        selectedUserId === u.id
                                            ? (isDark ? "bg-black text-[#C0FF00]" : "bg-white text-indigo-700")
                                            : (isDark ? "bg-white/10 text-white" : "bg-indigo-100 text-indigo-700")
                                    )}>
                                        {u.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm truncate">{u.name}</div>
                                        <div className={cn("text-xs mt-0.5", selectedUserId === u.id ? "opacity-80" : "text-gray-500")}>
                                            {u.role} • {u.department}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-2 py-1 rounded text-xs font-bold",
                                        getWorkloadColor(u.workload)
                                    )}>
                                        {u.workload}%
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Assignment Workspace */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedUserId ? (
                        <>
                            {/* User Header */}
                            <Card className={cn(isDark ? "bg-[#080808] border-white/5" : "shadow-sm")}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black",
                                                isDark ? "bg-[#C0FF00] text-black" : "bg-indigo-600 text-white"
                                            )}>
                                                {selectedUser?.avatar}
                                            </div>
                                            <div>
                                                <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                                                    {selectedUser?.name}
                                                </h2>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge variant="outline" className={isDark ? "border-white/20" : ""}>
                                                        {selectedUser?.role}
                                                    </Badge>
                                                    <Badge variant="outline" className={isDark ? "border-white/20" : ""}>
                                                        {selectedUser?.department}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button className={cn(
                                                    "font-semibold",
                                                    isDark ? "bg-[#C0FF00] text-black hover:bg-[#C0FF00]/90" : ""
                                                )}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    New Assignment
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className={cn("max-w-2xl", isDark ? "bg-[#080808] border-white/5 text-white" : "")}>
                                                <DialogHeader>
                                                    <DialogTitle className={cn("text-xl font-bold", isDark ? "text-white" : "")}>
                                                        Create New Assignment
                                                    </DialogTitle>
                                                    <DialogDescription className={isDark ? "text-gray-400" : ""}>
                                                        Assign a new task or project to {selectedUser?.name}
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <div className="space-y-6 py-4">
                                                    {/* Assignment Type Selector */}
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Assignment Type</Label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {(["TASK", "PROJECT", "DAILY"] as const).map(type => (
                                                                <button
                                                                    key={type}
                                                                    onClick={() => setAssignmentType(type)}
                                                                    className={cn(
                                                                        "py-2.5 rounded-lg text-sm font-semibold transition-all",
                                                                        assignmentType === type
                                                                            ? (isDark ? "bg-[#C0FF00] text-black" : "bg-indigo-600 text-white")
                                                                            : (isDark ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-gray-100 text-gray-600 hover:bg-gray-200")
                                                                    )}
                                                                >
                                                                    {type}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Daily Quota */}
                                                    {assignmentType === "DAILY" && (
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                                <Clock className="h-4 w-4" />
                                                                Daily Work Hours
                                                            </Label>
                                                            <Select onValueChange={(val) => setNewAssignment({ ...newAssignment, quotaHours: val })} defaultValue="8">
                                                                <SelectTrigger className={isDark ? "bg-black border-white/10" : ""}>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className={isDark ? "bg-[#080808] border-white/5 text-white" : ""}>
                                                                    <SelectItem value="4">4 hours (Part-time)</SelectItem>
                                                                    <SelectItem value="8">8 hours (Standard)</SelectItem>
                                                                    <SelectItem value="10">10 hours (Extended)</SelectItem>
                                                                    <SelectItem value="12">12 hours (Maximum)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}

                                                    {/* Title */}
                                                    {assignmentType !== "PROJECT" && (
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium">Title</Label>
                                                            <Input
                                                                placeholder="Enter assignment title"
                                                                className={isDark ? "bg-black border-white/10" : ""}
                                                                value={newAssignment.title}
                                                                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Project Selection */}
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Project</Label>
                                                        <Select onValueChange={(val) => setNewAssignment({ ...newAssignment, projectId: val })}>
                                                            <SelectTrigger className={isDark ? "bg-black border-white/10" : ""}>
                                                                <SelectValue placeholder="Select a project" />
                                                            </SelectTrigger>
                                                            <SelectContent className={isDark ? "bg-[#080808] border-white/5 text-white" : ""}>
                                                                {projects.map(p => (
                                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Description */}
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Description</Label>
                                                        <Textarea
                                                            placeholder="Describe the assignment details..."
                                                            className={cn("min-h-[100px] resize-none", isDark ? "bg-black border-white/10" : "")}
                                                            value={newAssignment.description}
                                                            onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                                                        />
                                                    </div>

                                                    {/* Priority and Due Date */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium">Priority</Label>
                                                            <Select onValueChange={(val) => setNewAssignment({ ...newAssignment, priority: val })} defaultValue="MEDIUM">
                                                                <SelectTrigger className={isDark ? "bg-black border-white/10" : ""}>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className={isDark ? "bg-[#080808] border-white/5 text-white" : ""}>
                                                                    <SelectItem value="LOW">Low</SelectItem>
                                                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                                                    <SelectItem value="HIGH">High</SelectItem>
                                                                    <SelectItem value="URGENT">Urgent</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium">Due Date</Label>
                                                            <Input
                                                                type="date"
                                                                className={isDark ? "bg-black border-white/10" : ""}
                                                                value={newAssignment.dueDate}
                                                                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <DialogFooter>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsDialogOpen(false)}
                                                        className={isDark ? "border-white/10" : ""}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        className={cn(
                                                            "font-semibold",
                                                            isDark ? "bg-[#C0FF00] text-black hover:bg-[#C0FF00]/90" : ""
                                                        )}
                                                        onClick={handleAssign}
                                                        disabled={isAssigning}
                                                    >
                                                        {isAssigning ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Assigning...
                                                            </>
                                                        ) : (
                                                            `Assign ${assignmentType}`
                                                        )}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { label: "Active Tasks", value: selectedUser?.activeTasks || 0, icon: CheckSquare, color: isDark ? "text-cyan-400" : "text-blue-600" },
                                    { label: "Projects", value: selectedUser?.activeProjects || 0, icon: Briefcase, color: isDark ? "text-[#C0FF00]" : "text-indigo-600" },
                                    { label: "Workload", value: `${selectedUser?.workload || 0}%`, icon: Activity, color: isDark ? "text-amber-400" : "text-amber-600" },
                                ].map((stat, i) => (
                                    <Card key={i} className={cn("transition-all hover:shadow-md", isDark ? "bg-[#050505] border-white/5" : "")}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                                    <p className={cn("text-2xl font-bold mt-1", isDark ? "text-white" : "text-slate-900")}>{stat.value}</p>
                                                </div>
                                                <div className={cn("p-3 rounded-lg", isDark ? "bg-white/5" : "bg-gray-50")}>
                                                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Projects and Tasks */}
                            <div className="grid lg:grid-cols-2 gap-6">
                                {/* Active Projects */}
                                <Card className={cn(isDark ? "bg-[#080808] border-white/5" : "shadow-sm")}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                                <Briefcase className="h-4 w-4" />
                                                Active Projects
                                            </CardTitle>
                                            <Badge variant="secondary" className="text-xs">{projects.length}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-3">
                                        <div className="space-y-2">
                                            {projects.map(p => (
                                                <div key={p.id} className={cn(
                                                    "p-3 rounded-lg transition-all",
                                                    isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                                                )}>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className={cn("font-semibold text-sm truncate", isDark ? "text-white" : "text-slate-900")}>
                                                                {p.name}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {p.role}
                                                                </Badge>
                                                                <span className={cn("text-xs", p.status === 'IN_PROGRESS' ? "text-cyan-500" : "text-gray-500")}>
                                                                    {p.status.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recent Tasks */}
                                <Card className={cn(isDark ? "bg-[#080808] border-white/5" : "shadow-sm")}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                                <CheckSquare className="h-4 w-4" />
                                                Recent Tasks
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={cn(
                                            "flex flex-col items-center justify-center py-12 text-center",
                                            isDark ? "text-gray-600" : "text-gray-400"
                                        )}>
                                            <LayoutDashboard className="h-12 w-12 mb-3 opacity-50" />
                                            <p className="text-sm font-medium">No recent tasks</p>
                                            <p className="text-xs mt-1">Assign a task to get started</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <Card className={cn(
                            "h-[600px] flex flex-col items-center justify-center",
                            isDark ? "bg-[#080808] border-white/5 border-dashed" : "bg-slate-50 border-dashed shadow-sm"
                        )}>
                            <div className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center mb-6",
                                isDark ? "bg-[#C0FF00]/10 text-[#C0FF00]" : "bg-indigo-50 text-indigo-400"
                            )}>
                                <Users size={40} />
                            </div>
                            <h3 className={cn("text-xl font-bold mb-2", isDark ? "text-white" : "text-slate-900")}>
                                Select a Team Member
                            </h3>
                            <p className={cn("text-sm max-w-md text-center", isDark ? "text-gray-500" : "text-slate-500")}>
                                Choose a team member from the list to view their assignments and create new ones
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
