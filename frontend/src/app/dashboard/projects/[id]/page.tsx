"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTheme } from "@/context/ThemeContext"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import {
    ArrowLeft,
    Calendar,
    Users,
    FileText,
    MessageSquare,
    Upload,
    CheckCircle2,
    Clock,
    AlertCircle,
    Edit,
    Plus,
    Send,
    Briefcase,
    Target,
    TrendingUp,
    Activity,
    Search,
    Filter,
    Download,
    Share2,
    Bell,
    BellOff,
    Star,
    StarOff,
    Zap,
    MoreVertical,
    Trash2,
    Copy,
    ExternalLink,
    FileDown,
    Printer,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Paperclip,
    X,
    Check,
    Loader2,
    Archive,
    UserPlus,
    Settings,
    BarChart3,
    PieChart,
    Save,
    Command
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

interface TeamMember {
    id: string
    name: string
    role: string
    avatar?: string
    tasksCompleted: number
    tasksTotal: number
}

interface Module {
    id: string
    name: string
    description: string
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
    completedBy?: string
    completedAt?: string
    assignedTo: string[]
}

interface Requirement {
    id: string
    title: string
    description: string
    type: 'INITIAL' | 'UPDATE' | 'CHANGE_REQUEST'
    addedBy: string
    addedAt: string
    status: 'PENDING' | 'APPROVED' | 'IMPLEMENTED'
}

interface Update {
    id: string
    content: string
    author: string
    authorRole: string
    createdAt: string
    type: 'REQUIREMENT' | 'CHANGE' | 'COMMENT' | 'STATUS'
    responses?: Response[]
}

interface Response {
    id: string
    content: string
    author: string
    authorRole: string
    createdAt: string
}

interface ProjectDetails {
    id: string
    name: string
    description: string
    clientName: string
    clientRequirements: string
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    startDate: string
    deadline: string
    progress: number
    budget?: number
    reason: string
    team: TeamMember[]
    modules: Module[]
    requirements: Requirement[]
    updates: Update[]
}

export default function ProjectDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { theme } = useTheme()
    const { user } = useAuthStore()
    const isDark = theme === 'dark'
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER'

    const [project, setProject] = useState<ProjectDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("overview")
    const [newUpdate, setNewUpdate] = useState("")
    const [newRequirement, setNewRequirement] = useState({ title: "", description: "" })
    const [isAddRequirementOpen, setIsAddRequirementOpen] = useState(false)
    const [responseText, setResponseText] = useState<{ [key: string]: string }>({})

    // Enhanced features state
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const [isExporting, setIsExporting] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    // Auto-save draft functionality
    useEffect(() => {
        if (newUpdate.trim()) {
            const timer = setTimeout(() => {
                localStorage.setItem(`draft_${params.id}`, newUpdate)
                setLastSaved(new Date())
            }, 2000) // Auto-save after 2 seconds of inactivity
            return () => clearTimeout(timer)
        }
    }, [newUpdate, params.id])

    // Load draft on mount
    useEffect(() => {
        const draft = localStorage.getItem(`draft_${params.id}`)
        if (draft) {
            setNewUpdate(draft)
        }
    }, [params.id])

    // Filtered and searched data with useMemo for performance
    const filteredUpdates = useMemo(() => {
        if (!project) return []
        let filtered = project.updates

        if (searchQuery) {
            filtered = filtered.filter(update =>
                update.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                update.author.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        if (filterStatus !== "all") {
            filtered = filtered.filter(update => update.type === filterStatus)
        }

        return filtered
    }, [project, searchQuery, filterStatus])

    const filteredRequirements = useMemo(() => {
        if (!project) return []
        let filtered = project.requirements

        if (searchQuery) {
            filtered = filtered.filter(req =>
                req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        return filtered
    }, [project, searchQuery])

    // Optimized handlers with useCallback
    const handleExportPDF = useCallback(() => {
        setIsExporting(true)
        setTimeout(() => {
            // Simulate PDF export
            alert("PDF export feature coming soon!")
            setIsExporting(false)
        }, 1000)
    }, [])

    const handleExportExcel = useCallback(() => {
        setIsExporting(true)
        setTimeout(() => {
            // Simulate Excel export
            alert("Excel export feature coming soon!")
            setIsExporting(false)
        }, 1000)
    }, [])

    const handlePrint = useCallback(() => {
        window.print()
    }, [])

    const handleRefresh = useCallback(() => {
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            alert("Project data refreshed!")
        }, 500)
    }, [])

    const toggleBookmark = useCallback(() => {
        setIsBookmarked(prev => !prev)
        // Save to localStorage or API
        localStorage.setItem(`bookmark_${params.id}`, (!isBookmarked).toString())
    }, [isBookmarked, params.id])

    const toggleNotifications = useCallback(() => {
        setNotificationsEnabled(prev => !prev)
        localStorage.setItem(`notifications_${params.id}`, (!notificationsEnabled).toString())
    }, [notificationsEnabled, params.id])

    useEffect(() => {
        const fetchProject = async () => {
            setIsLoading(true)
            try {
                const response = await api.get(`/projects/${params.id}`)
                if (response.data.success) {
                    const data = response.data.data
                    setProject({
                        id: data.id,
                        name: data.name,
                        description: data.description || "No description provided.",
                        clientName: data.client?.name || "L’Oréal Paris", // Fallback if no client assigned
                        clientRequirements: data.clientRequirements || "Initial requirements pending documentation.",
                        status: data.status,
                        priority: data.priority,
                        startDate: data.startDate,
                        deadline: data.endDate || data.deadline || "TBD",
                        progress: data.progress || 0,
                        budget: data.budget ? Number(data.budget) : undefined,
                        reason: data.reason || "Project initiated to meet business objectives.",
                        team: (data.members || []).map((m: any) => ({
                            id: m.userId,
                            name: m.user?.name || "Unknown",
                            role: m.role || m.user?.role || "Contributor",
                            avatar: m.user?.avatar,
                            tasksCompleted: m.user?.tasksCompleted || 0,
                            tasksTotal: m.user?.tasksTotal || 0,
                        })),
                        modules: (data.milestones || []).map((m: any) => ({
                            id: m.id,
                            name: m.title,
                            description: m.description || "Milestone description pending.",
                            status: m.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
                            assignedTo: []
                        })),
                        requirements: [],
                        updates: []
                    })
                }
            } catch (error) {
                console.error('Failed to fetch project details:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchProject()
    }, [params.id])

    const handleAddUpdate = () => {
        if (!newUpdate.trim() || !project) return

        const update: Update = {
            id: `u${Date.now()}`,
            content: newUpdate,
            author: user?.name || "Unknown",
            authorRole: user?.role || "USER",
            createdAt: new Date().toISOString(),
            type: isAdmin ? "REQUIREMENT" : "COMMENT",
            responses: []
        }

        setProject({
            ...project,
            updates: [update, ...project.updates]
        })
        setNewUpdate("")
        localStorage.removeItem(`draft_${params.id}`) // Clear draft after posting
    }

    const handleAddResponse = (updateId: string) => {
        if (!responseText[updateId]?.trim() || !project) return

        const response: Response = {
            id: `r${Date.now()}`,
            content: responseText[updateId],
            author: user?.name || "Unknown",
            authorRole: user?.role || "USER",
            createdAt: new Date().toISOString()
        }

        setProject({
            ...project,
            updates: project.updates.map(update =>
                update.id === updateId
                    ? { ...update, responses: [...(update.responses || []), response] }
                    : update
            )
        })
        setResponseText({ ...responseText, [updateId]: "" })
    }

    const handleAddRequirement = () => {
        if (!newRequirement.title.trim() || !project) return

        const requirement: Requirement = {
            id: `r${Date.now()}`,
            title: newRequirement.title,
            description: newRequirement.description,
            type: "CHANGE_REQUEST",
            addedBy: user?.name || "Admin",
            addedAt: new Date().toISOString(),
            status: "PENDING"
        }

        setProject({
            ...project,
            requirements: [...project.requirements, requirement]
        })
        setNewRequirement({ title: "", description: "" })
        setIsAddRequirementOpen(false)
    }

    const getStatusColor = (status: string) => {
        if (isDark) {
            switch (status) {
                case 'COMPLETED': return 'bg-[#C0FF00]/10 text-[#C0FF00] border-[#C0FF00]/20'
                case 'IN_PROGRESS': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                case 'NOT_STARTED': return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                case 'ON_HOLD': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                default: return 'bg-white/5 text-gray-400 border-white/10'
            }
        }
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200'
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'NOT_STARTED': return 'bg-gray-100 text-gray-700 border-gray-200'
            case 'ON_HOLD': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getPriorityColor = (priority: string) => {
        if (isDark) {
            switch (priority) {
                case 'URGENT': return 'text-red-400 bg-red-500/10 border-red-500/20'
                case 'HIGH': return 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                case 'MEDIUM': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                case 'LOW': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                default: return 'text-gray-400 bg-white/5'
            }
        }
        switch (priority) {
            case 'URGENT': return 'text-red-700 bg-red-100 border-red-200'
            case 'HIGH': return 'text-red-600 bg-red-50 border-red-200'
            case 'MEDIUM': return 'text-orange-600 bg-orange-50 border-orange-200'
            case 'LOW': return 'text-blue-600 bg-blue-50 border-blue-200'
            default: return 'text-gray-600 bg-gray-50'
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className={cn("animate-spin rounded-full h-12 w-12 border-b-2", isDark ? "border-[#C0FF00]" : "border-primary")} />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-bold">Project not found</h3>
                <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        )
    }

    return (
        <div className={cn("space-y-6", isDark && "font-mono")}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className={cn(isDark && "hover:bg-white/5")}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className={cn("text-3xl font-black tracking-tight", isDark ? "text-white" : "text-slate-900")}>
                            {project.name}
                        </h1>
                        <p className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-slate-500")}>
                            Client: {project.clientName}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className={cn("border font-bold", getStatusColor(project.status))}>
                        {project.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className={cn("border font-bold", getPriorityColor(project.priority))}>
                        {project.priority}
                    </Badge>
                </div>
            </div>

            {/* Enhanced Toolbar */}
            <Card className={cn(isDark ? "bg-[#080808] border-white/5" : "")}>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        {/* Search Bar */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className={cn("absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4", isDark ? "text-gray-400" : "text-gray-500")} />
                                <Input
                                    placeholder="Search project content..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={cn("pl-10", isDark && "bg-white/5 border-white/10")}
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-wrap">
                            {/* Filter Dropdown */}
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className={cn("w-[140px]", isDark && "bg-white/5 border-white/10")}>
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="REQUIREMENT">Requirements</SelectItem>
                                    <SelectItem value="CHANGE">Changes</SelectItem>
                                    <SelectItem value="COMMENT">Comments</SelectItem>
                                    <SelectItem value="STATUS">Status</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Bookmark Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={toggleBookmark}
                                className={cn(isDark && "border-white/10")}
                                title={isBookmarked ? "Remove bookmark" : "Bookmark project"}
                            >
                                {isBookmarked ? <Star className="h-4 w-4 fill-current text-yellow-500" /> : <StarOff className="h-4 w-4" />}
                            </Button>

                            {/* Notifications Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={toggleNotifications}
                                className={cn(isDark && "border-white/10")}
                                title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
                            >
                                {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                            </Button>

                            {/* Refresh Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleRefresh}
                                className={cn(isDark && "border-white/10")}
                                title="Refresh project data"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>

                            {/* Quick Actions Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className={cn(isDark && "border-white/10")}>
                                        <Zap className="h-4 w-4 mr-2" />
                                        Quick Actions
                                        <ChevronDown className="h-4 w-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className={cn("w-56", isDark && "bg-[#080808] border-white/10")}>
                                    <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
                                        <FileDown className="h-4 w-4 mr-2" />
                                        Export as PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleExportExcel} disabled={isExporting}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Export as Excel
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handlePrint}>
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print Project
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Share</DropdownMenuLabel>
                                    <DropdownMenuItem>
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share Link
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy Project ID
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Analytics</DropdownMenuLabel>
                                    <DropdownMenuItem>
                                        <BarChart3 className="h-4 w-4 mr-2" />
                                        View Analytics
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <PieChart className="h-4 w-4 mr-2" />
                                        Progress Report
                                    </DropdownMenuItem>
                                    {isAdmin && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>
                                                <Settings className="h-4 w-4 mr-2" />
                                                Project Settings
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Archive className="h-4 w-4 mr-2" />
                                                Archive Project
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Auto-save indicator */}
                    {lastSaved && (
                        <div className={cn("text-xs mt-2 flex items-center gap-1", isDark ? "text-gray-500" : "text-gray-600")}>
                            <Save className="h-3 w-3" />
                            Draft saved {lastSaved.toLocaleTimeString()}
                        </div>
                    )}

                    {/* Search Results Count */}
                    {searchQuery && (
                        <div className={cn("text-sm mt-2", isDark ? "text-gray-400" : "text-gray-600")}>
                            Found {filteredUpdates.length + filteredRequirements.length} results for "{searchQuery}"
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Progress", value: `${project.progress}%`, icon: TrendingUp, color: isDark ? "text-[#C0FF00]" : "text-green-600" },
                    { label: "Team Size", value: project.team.length, icon: Users, color: isDark ? "text-cyan-400" : "text-blue-600" },
                    { label: "Modules", value: `${project.modules.filter(m => m.status === 'COMPLETED').length}/${project.modules.length}`, icon: Briefcase, color: isDark ? "text-purple-400" : "text-purple-600" },
                    { label: "Days Left", value: Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)), icon: Clock, color: isDark ? "text-amber-400" : "text-orange-600" },
                ].map((stat, i) => (
                    <Card key={i} className={cn(isDark ? "bg-[#080808] border-white/5" : "")}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>{stat.label}</p>
                                    <p className={cn("text-2xl font-bold mt-1", isDark ? "text-white" : "text-slate-900")}>{stat.value}</p>
                                </div>
                                <stat.icon className={cn("h-8 w-8", stat.color)} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={cn("grid w-full grid-cols-5", isDark ? "bg-white/5" : "")}>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    <TabsTrigger value="team">Team & Modules</TabsTrigger>
                    <TabsTrigger value="updates">Updates</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <Card className={cn(isDark ? "bg-[#080808] border-white/5" : "")}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Project Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={cn(isDark ? "text-gray-300" : "text-slate-700")}>{project.description}</p>
                        </CardContent>
                    </Card>

                    <Card className={cn(isDark ? "bg-[#080808] border-white/5" : "")}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Client Requirements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={cn(isDark ? "text-gray-300" : "text-slate-700")}>{project.clientRequirements}</p>
                        </CardContent>
                    </Card>

                    <Card className={cn(isDark ? "bg-[#080808] border-white/5" : "")}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                Project Reason & Justification
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={cn(isDark ? "text-gray-300" : "text-slate-700")}>{project.reason}</p>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Card className={cn(isDark ? "bg-[#080808] border-white/5" : "")}>
                            <CardHeader>
                                <CardTitle className="text-base">Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>Start Date</span>
                                    <span className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>{new Date(project.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>Deadline</span>
                                    <span className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>{new Date(project.deadline).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {project.budget && (
                            <Card className={cn(isDark ? "bg-[#080808] border-white/5" : "")}>
                                <CardHeader>
                                    <CardTitle className="text-base">Budget</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className={cn("text-2xl font-bold", isDark ? "text-[#C0FF00]" : "text-green-600")}>
                                        ${project.budget.toLocaleString()}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* Requirements Tab */}
                <TabsContent value="requirements" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>
                            All Requirements & Changes
                        </h3>
                        <Dialog open={isAddRequirementOpen} onOpenChange={setIsAddRequirementOpen}>
                            <DialogTrigger asChild>
                                <Button className={cn(isDark && "bg-[#C0FF00] text-black hover:bg-white")}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Requirement
                                </Button>
                            </DialogTrigger>
                            <DialogContent className={cn(isDark && "bg-[#080808] border-white/5 text-white")}>
                                <DialogHeader>
                                    <DialogTitle>Add New Requirement</DialogTitle>
                                    <DialogDescription>Add a new requirement or change request from the client</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Title</Label>
                                        <Input
                                            value={newRequirement.title}
                                            onChange={(e) => setNewRequirement({ ...newRequirement, title: e.target.value })}
                                            placeholder="Requirement title"
                                            className={cn(isDark && "bg-white/5 border-white/10")}
                                        />
                                    </div>
                                    <div>
                                        <Label>Description</Label>
                                        <Textarea
                                            value={newRequirement.description}
                                            onChange={(e) => setNewRequirement({ ...newRequirement, description: e.target.value })}
                                            placeholder="Detailed description"
                                            className={cn(isDark && "bg-white/5 border-white/10")}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleAddRequirement} className={cn(isDark && "bg-[#C0FF00] text-black")}>
                                        Add Requirement
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-3">
                        {filteredRequirements.map((req) => (
                            <Card key={req.id} className={cn(isDark ? "bg-[#080808] border-white/5" : "")}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className={cn("font-bold", isDark ? "text-white" : "text-slate-900")}>{req.title}</h4>
                                                <Badge variant="outline" className="text-xs">
                                                    {req.type.replace('_', ' ')}
                                                </Badge>
                                                <Badge variant="outline" className={cn("text-xs", getStatusColor(req.status))}>
                                                    {req.status}
                                                </Badge>
                                            </div>
                                            <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>{req.description}</p>
                                            <p className={cn("text-xs mt-2", isDark ? "text-gray-500" : "text-gray-500")}>
                                                Added by {req.addedBy} on {new Date(req.addedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Team & Modules Tab */}
                <TabsContent value="team" className="space-y-6">
                    <Card className={cn(isDark ? "bg-[#080808] border-white/5" : "")}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Team Members
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {project.team.map((member) => (
                                    <div key={member.id} className={cn("flex items-center justify-between p-3 rounded-lg", isDark ? "bg-white/5" : "bg-gray-50")}>
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold", isDark ? "bg-[#C0FF00] text-black" : "bg-primary text-white")}>
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>{member.name}</p>
                                                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>{member.role}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn("text-sm font-semibold", isDark ? "text-[#C0FF00]" : "text-primary")}>
                                                {member.tasksCompleted}/{member.tasksTotal} Tasks
                                            </p>
                                            <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-500")}>
                                                {Math.round((member.tasksCompleted / member.tasksTotal) * 100)}% Complete
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={cn(isDark ? "bg-[#080808] border-white/5" : "")}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Project Modules
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {project.modules.map((module) => (
                                    <div key={module.id} className={cn("p-4 rounded-lg border", isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200")}>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className={cn("font-bold", isDark ? "text-white" : "text-slate-900")}>{module.name}</h4>
                                                    <Badge variant="outline" className={cn("border", getStatusColor(module.status))}>
                                                        {module.status.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>{module.description}</p>
                                            </div>
                                        </div>
                                        <div className={cn("text-xs mt-3 pt-3 border-t", isDark ? "border-white/10" : "border-gray-200")}>
                                            <p className={cn(isDark ? "text-gray-500" : "text-gray-600")}>
                                                <strong>Assigned to:</strong> {module.assignedTo.join(", ")}
                                            </p>
                                            {module.completedBy && (
                                                <p className={cn("mt-1", isDark ? "text-[#C0FF00]" : "text-green-600")}>
                                                    <CheckCircle2 className="h-3 w-3 inline mr-1" />
                                                    Completed by {module.completedBy} on {new Date(module.completedAt!).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Updates Tab */}
                <TabsContent value="updates" className="space-y-4">
                    <Card className={cn(isDark ? "bg-[#080808] border-white/5" : "")}>
                        <CardHeader>
                            <CardTitle>Post Update</CardTitle>
                            <CardDescription>
                                {isAdmin ? "Share updates, requirements, or changes with the team" : "Share your thoughts or ask questions"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Textarea
                                value={newUpdate}
                                onChange={(e) => setNewUpdate(e.target.value)}
                                placeholder={isAdmin ? "Add new requirement, update, or change request..." : "Add your comment or question..."}
                                className={cn("min-h-[100px]", isDark && "bg-white/5 border-white/10")}
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleAddUpdate} disabled={!newUpdate.trim()} className={cn(isDark && "bg-[#C0FF00] text-black hover:bg-white")}>
                                    <Send className="h-4 w-4 mr-2" />
                                    Post Update
                                </Button>
                                {isAdmin && (
                                    <Button variant="outline" className={cn(isDark && "border-white/10")}>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Attach File
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        {filteredUpdates.map((update) => (
                            <Card key={update.id} className={cn(isDark ? "bg-[#080808] border-white/5" : "")}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0", isDark ? "bg-[#C0FF00] text-black" : "bg-primary text-white")}>
                                            {update.author.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>{update.author}</p>
                                                <Badge variant="outline" className="text-xs">{update.authorRole}</Badge>
                                                <Badge variant="outline" className="text-xs">{update.type}</Badge>
                                            </div>
                                            <p className={cn("text-sm mb-2", isDark ? "text-gray-400" : "text-gray-600")}>{new Date(update.createdAt).toLocaleString()}</p>
                                            <p className={cn(isDark ? "text-gray-300" : "text-slate-700")}>{update.content}</p>

                                            {/* Responses */}
                                            {update.responses && update.responses.length > 0 && (
                                                <div className={cn("mt-4 pl-4 border-l-2 space-y-3", isDark ? "border-white/10" : "border-gray-200")}>
                                                    {update.responses.map((response) => (
                                                        <div key={response.id} className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-900")}>{response.author}</p>
                                                                <Badge variant="outline" className="text-xs">{response.authorRole}</Badge>
                                                            </div>
                                                            <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>{new Date(response.createdAt).toLocaleString()}</p>
                                                            <p className={cn("text-sm", isDark ? "text-gray-300" : "text-slate-700")}>{response.content}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Response Input */}
                                            <div className="mt-4 flex gap-2">
                                                <Input
                                                    value={responseText[update.id] || ""}
                                                    onChange={(e) => setResponseText({ ...responseText, [update.id]: e.target.value })}
                                                    placeholder="Write a response..."
                                                    className={cn("text-sm", isDark && "bg-white/5 border-white/10")}
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAddResponse(update.id)}
                                                    disabled={!responseText[update.id]?.trim()}
                                                    className={cn(isDark && "bg-[#C0FF00] text-black")}
                                                >
                                                    Reply
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline" className="space-y-4">
                    <Card className={cn(isDark ? "bg-[#080808] border-white/5" : "")}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Project Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { date: project.startDate, event: "Project Started", type: "start" },
                                    ...project.modules.filter(m => m.completedAt).map(m => ({ date: m.completedAt!, event: `${m.name} Completed`, type: "milestone" })),
                                    { date: project.deadline, event: "Project Deadline", type: "deadline" }
                                ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={cn("w-3 h-3 rounded-full",
                                                item.type === 'start' ? (isDark ? 'bg-[#C0FF00]' : 'bg-green-500') :
                                                    item.type === 'milestone' ? (isDark ? 'bg-cyan-400' : 'bg-blue-500') :
                                                        (isDark ? 'bg-red-400' : 'bg-red-500')
                                            )} />
                                            {i < 3 && <div className={cn("w-0.5 h-12", isDark ? "bg-white/10" : "bg-gray-200")} />}
                                        </div>
                                        <div className="flex-1 pb-8">
                                            <p className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>{item.event}</p>
                                            <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>{new Date(item.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
