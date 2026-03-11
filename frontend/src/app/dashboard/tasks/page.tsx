"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    CheckSquare,
    Clock,
    AlertCircle,
    Calendar as CalendarIcon,
    Search,
    Users,
    User,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Circle,
    Target,
    TrendingUp,
    Activity,
    Zap
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { useTheme } from "@/context/ThemeContext"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate: string;
    project: {
        id: string;
        name: string;
    };
    assignedTo: {
        id: string;
        name: string;
        avatar?: string;
    };
    progress?: number;
    hoursSpent?: number;
    estimatedHours?: number;
}

interface Worker {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    email: string;
    tasksTotal: number;
    tasksCompleted: number;
    tasksInProgress: number;
    tasksPending: number;
    tasks: Task[];
}

export default function TasksPage() {
    const router = useRouter()
    const { user } = useAuthStore()
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER'

    const [activeView, setActiveView] = useState<'my-tasks' | 'all-workers'>('my-tasks')
    const [myTasks, setMyTasks] = useState<Task[]>([])
    const [workers, setWorkers] = useState<Worker[]>([])
    const [expandedWorker, setExpandedWorker] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<string>('ALL')
    const [searchQuery, setSearchQuery] = useState("")
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newTask, setNewTask] = useState<{
        title: string,
        priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        description: string,
        dueDate: Date | undefined,
        projectId: string,
        assignedToId: string
    }>({
        title: "",
        priority: 'MEDIUM',
        description: "",
        dueDate: new Date(),
        projectId: "",
        assignedToId: ""
    })
    const [projects, setProjects] = useState<{ id: string, name: string }[]>([])
    const [assignableUsers, setAssignableUsers] = useState<{ id: string, name: string }[]>([])

    // Mock data for workers and their tasks


    const handleCreateTask = async () => {
        if (!newTask.title || !newTask.projectId || !newTask.assignedToId) return
        setIsSubmitting(true)
        try {
            const response = await api.post("/tasks", {
                title: newTask.title,
                description: newTask.description,
                priority: newTask.priority,
                dueDate: newTask.dueDate?.toISOString(),
                projectId: newTask.projectId,
                assignedToId: newTask.assignedToId
            })
            if (response.data.success) {
                setMyTasks([response.data.data, ...myTasks])
                setIsCreateOpen(false)
                setNewTask({
                    title: "",
                    priority: 'MEDIUM',
                    description: "",
                    dueDate: new Date(),
                    projectId: "",
                    assignedToId: ""
                })
            }
        } catch (error) {
            console.error("Failed to create task", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user's own tasks (Backend will filter based on role)
                const response = await api.get("/tasks", { params: { assignedToId: user?.id } })
                if (response.data.success) {
                    setMyTasks(response.data.data)
                }

                // Fetch Projects for everyone (Backend filters by permission)
                try {
                    const projectsRes = await api.get("/projects")
                    if (projectsRes.data.success) setProjects(projectsRes.data.data)
                } catch (e) {
                    console.error("Failed to fetch projects", e)
                }

                // If super admin, fetch all workers and users
                if (isSuperAdmin) {
                    // Fetch Users
                    const usersRes = await api.get("/users")
                    if (usersRes.data.success) setAssignableUsers(usersRes.data.data)

                    // Fetch all tasks for all workers
                    const allTasksRes = await api.get("/tasks")
                    if (allTasksRes.data.success) {
                        const allTasks = allTasksRes.data.data
                        const users = usersRes.data.data

                        // Group tasks by assignee
                        const workerMap: Record<string, Worker> = {}

                        users.forEach((u: any) => {
                            workerMap[u.id] = {
                                id: u.id,
                                name: u.name,
                                role: u.designation || u.role,
                                email: u.email,
                                avatar: u.avatar,
                                tasksTotal: 0,
                                tasksCompleted: 0,
                                tasksInProgress: 0,
                                tasksPending: 0,
                                tasks: []
                            }
                        })

                        allTasks.forEach((t: any) => {
                            if (t.assignedToId && workerMap[t.assignedToId]) {
                                const w = workerMap[t.assignedToId]
                                w.tasks.push(t)
                                w.tasksTotal++
                                if (t.status === 'COMPLETED') w.tasksCompleted++
                                else if (t.status === 'IN_PROGRESS') w.tasksInProgress++
                                else w.tasksPending++
                            }
                        })

                        setWorkers(Object.values(workerMap).filter(w => w.tasks.length > 0 || w.id === user.id))
                    }
                } else {
                    // For regular users, they can only assign to themselves (or we could fetch team members)
                    if (user) {
                        setAssignableUsers([{ id: user.id, name: user.name || user.email || 'Me' }])
                    }
                }
            } catch (err: any) {
                console.error("Failed to load tasks:", err)

                // More specific error logging
                if (err.response) {
                    // Server responded with error
                    console.error("Server error:", err.response.status, err.response.data)
                } else if (err.request) {
                    // Request made but no response
                    console.error("Network error: No response from server. Is the backend running?")
                } else {
                    // Something else happened
                    console.error("Error:", err.message)
                }
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [isSuperAdmin, user, router])

    const filteredMyTasks = myTasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.project?.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const filteredWorkers = workers.filter(worker =>
        worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.role.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getPriorityBadge = (priority: string) => {
        if (isDark) {
            switch (priority) {
                case 'URGENT': return <Badge className="bg-red-500/20 text-red-500 border border-red-500/30 font-bold tracking-tight">URGENT</Badge>;
                case 'HIGH': return <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold tracking-tight">HIGH</Badge>;
                case 'MEDIUM': return <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold tracking-tight">MEDIUM</Badge>;
                case 'LOW': return <Badge className="bg-white/5 text-gray-500 border border-white/10 font-bold tracking-tight">LOW</Badge>;
                default: return <Badge className="bg-white/5 font-bold">{priority}</Badge>;
            }
        }
        switch (priority) {
            case 'URGENT': return <Badge variant="destructive" className="bg-red-600 font-bold">Urgent</Badge>;
            case 'HIGH': return <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600 font-bold">High</Badge>;
            case 'MEDIUM': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold">Medium</Badge>;
            case 'LOW': return <Badge variant="outline" className="text-gray-500 font-bold">Low</Badge>;
            default: return <Badge variant="outline">{priority}</Badge>;
        }
    }

    const getStatusIndicator = (status: string) => {
        if (isDark) {
            switch (status) {
                case 'COMPLETED': return 'border-l-4 border-l-[#C0FF00] shadow-[inset_4px_0_10px_-4px_#C0FF00]';
                case 'IN_PROGRESS': return 'border-l-4 border-l-cyan-500 shadow-[inset_4px_0_10px_-4px_rgba(6,182,212,0.5)]';
                case 'PENDING': return 'border-l-4 border-l-white/20';
                case 'ON_HOLD': return 'border-l-4 border-l-amber-500 shadow-[inset_4px_0_10px_-4px_rgba(245,158,11,0.5)]';
                default: return 'border-l-4 border-l-white/5';
            }
        }
        switch (status) {
            case 'COMPLETED': return 'border-l-4 border-l-green-500';
            case 'IN_PROGRESS': return 'border-l-4 border-l-blue-500';
            case 'PENDING': return 'border-l-4 border-l-gray-300';
            case 'ON_HOLD': return 'border-l-4 border-l-yellow-400';
            default: return 'border-l-4 border-l-gray-200';
        }
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'COMPLETED': { icon: CheckCircle2, color: isDark ? 'bg-[#C0FF00]/10 text-[#C0FF00]' : 'bg-green-100 text-green-700' },
            'IN_PROGRESS': { icon: Activity, color: isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-100 text-blue-700' },
            'PENDING': { icon: Circle, color: isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-600' },
            'ON_HOLD': { icon: Clock, color: isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-yellow-100 text-yellow-700' }
        }
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['PENDING']
        const Icon = config.icon

        return (
            <div className={cn("px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5", config.color)}>
                <Icon className="h-3 w-3" />
                {status.replace('_', ' ')}
            </div>
        )
    }

    const renderTaskCard = (task: Task, showAssignee = false) => (
        <Card key={task.id} className={cn(
            "group hover:scale-[1.01] transition-all duration-300 overflow-hidden relative",
            getStatusIndicator(task.status),
            isDark ? "bg-[#080808] border-white/5 hover:border-[#C0FF00]/30 shadow-xl" : "bg-white hover:shadow-md"
        )}>
            <CardContent className="p-5">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className={cn("font-bold text-lg transition-colors", isDark ? "text-white group-hover:text-[#C0FF00]" : "text-gray-900")}>
                                    {task.title}
                                </h3>
                                {getPriorityBadge(task.priority)}
                            </div>
                            <p className={cn("text-sm line-clamp-2 transition-colors", isDark ? "text-gray-400" : "text-gray-600")}>
                                {task.description || "No description provided."}
                            </p>
                        </div>
                        {getStatusBadge(task.status)}
                    </div>

                    {/* Progress Bar */}
                    {task.progress !== undefined && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-gray-500" : "text-gray-600")}>
                                    Progress
                                </span>
                                <span className={cn("text-sm font-bold", isDark ? "text-[#C0FF00]" : "text-primary")}>
                                    {task.progress}%
                                </span>
                            </div>
                            <Progress value={task.progress} className={cn("h-2", isDark && "bg-white/5")} />
                        </div>
                    )}

                    {/* Meta Information */}
                    <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-4 text-[10px] font-semibold">
                            <div className={cn("flex items-center gap-1.5 uppercase tracking-wider", isDark ? "text-[#C0FF00]" : "text-indigo-600")}>
                                <Target className="h-3 w-3" />
                                {task.project?.name}
                            </div>
                            {task.dueDate && (
                                <div className={cn(
                                    "flex items-center gap-1.5 uppercase tracking-wider",
                                    new Date(task.dueDate) < new Date() ? (isDark ? 'text-red-500' : 'text-red-600 font-bold') : (isDark ? 'text-gray-400' : 'text-slate-500')
                                )}>
                                    <CalendarIcon className="h-3 w-3" />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </div>
                            )}
                            {task.hoursSpent !== undefined && task.estimatedHours !== undefined && (
                                <div className={cn("flex items-center gap-1.5 uppercase tracking-wider", isDark ? "text-cyan-400" : "text-blue-600")}>
                                    <Clock className="h-3 w-3" />
                                    {task.hoursSpent}h / {task.estimatedHours}h
                                </div>
                            )}
                        </div>

                        {showAssignee && task.assignedTo && (
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all",
                                    isDark ? "bg-[#C0FF00] text-black" : "bg-indigo-100 text-indigo-700"
                                )}>
                                    {task.assignedTo.name.charAt(0)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className={cn("space-y-6")}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>
                        {isSuperAdmin ? "Task Management" : "My Tasks"}
                    </h1>
                    <p className={cn("mt-1 transition-colors", isDark ? "text-gray-500" : "text-muted-foreground")}>
                        {isSuperAdmin ? "Monitor and manage all team tasks" : "Track your daily activities and project tasks"}
                    </p>
                </div>

            </div>

            {isSuperAdmin && (
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className={cn("font-bold transition-all", isDark ? "bg-[#C0FF00] text-black hover:bg-white active:scale-95" : "")}>
                            <Plus className="mr-2 h-4 w-4" /> New Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent className={isDark ? "bg-[#080808] border-white/5 text-white" : ""}>
                        <DialogHeader>
                            <DialogTitle className={isDark ? "text-[#C0FF00]" : ""}>Create New Task</DialogTitle>
                            <DialogDescription className={isDark ? "text-gray-500" : ""}>
                                Add a new task to your workload.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Task Title</label>
                                <Input
                                    className={isDark ? "bg-white/5 border-white/10" : ""}
                                    placeholder="e.g. Implement OAuth Flow"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Description</label>
                                <Textarea
                                    className={cn("resize-none h-24", isDark ? "bg-white/5 border-white/10" : "")}
                                    placeholder="What needs to be done?"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Due Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal h-11",
                                                !newTask.dueDate && "text-muted-foreground",
                                                isDark && "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                            )}
                                        >
                                            {newTask.dueDate ? (
                                                format(newTask.dueDate, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className={cn("w-auto p-0", isDark ? "bg-[#080808] border-white/5" : "")} align="start">
                                        <Calendar
                                            mode="single"
                                            selected={newTask.dueDate}
                                            onSelect={(date) => setNewTask({ ...newTask, dueDate: date })}
                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Priority</label>
                                <div className="flex gap-2">
                                    {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((p) => (
                                        <Button
                                            key={p}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setNewTask({ ...newTask, priority: p })}
                                            className={cn(
                                                "flex-1 font-bold text-[10px] tracking-tight transition-all",
                                                newTask.priority === p
                                                    ? (isDark ? "bg-[#C0FF00] text-black border-transparent shadow-md" : "bg-indigo-600 text-white border-transparent shadow-md")
                                                    : (isDark ? "border-white/10 text-gray-500 hover:bg-white/5" : "border-slate-200")
                                            )}
                                        >
                                            {p}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Project</label>
                                <Select onValueChange={(val) => setNewTask({ ...newTask, projectId: val })} value={newTask.projectId}>
                                    <SelectTrigger className={isDark ? "bg-white/5 border-white/10" : ""}>
                                        <SelectValue placeholder="Select Project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map(project => (
                                            <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Assign To</label>
                                <Select onValueChange={(val) => setNewTask({ ...newTask, assignedToId: val })} value={newTask.assignedToId}>
                                    <SelectTrigger className={isDark ? "bg-white/5 border-white/10" : ""}>
                                        <SelectValue placeholder="Select Worker" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assignableUsers.map(user => (
                                            <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={handleCreateTask}
                                disabled={!newTask.title || !newTask.projectId || !newTask.assignedToId || isSubmitting}
                                className={cn("w-full h-12 font-bold tracking-tight", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "")}
                            >
                                {isSubmitting ? "Creating..." : "Create Task"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}



            {/* Tabs for Super Admin */}
            {
                isSuperAdmin ? (
                    <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-full">
                        <TabsList className={cn("grid w-full grid-cols-2", isDark ? "bg-white/5" : "")}>
                            <TabsTrigger value="my-tasks" className={cn("font-bold", isDark && "data-[state=active]:bg-[#C0FF00] data-[state=active]:text-black")}>
                                <User className="h-4 w-4 mr-2" />
                                My Tasks
                            </TabsTrigger>
                            <TabsTrigger value="all-workers" className={cn("font-bold", isDark && "data-[state=active]:bg-[#C0FF00] data-[state=active]:text-black")}>
                                <Users className="h-4 w-4 mr-2" />
                                All Workers
                            </TabsTrigger>
                        </TabsList>

                        {/* My Tasks Tab */}
                        <TabsContent value="my-tasks" className="space-y-4 mt-6">
                            {/* Search and Filter */}
                            <div className={cn(
                                "flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-xl border shadow-sm transition-all duration-300",
                                isDark ? "bg-white/5 border-white/5 shadow-2xl" : "bg-white border-slate-200"
                            )}>
                                <div className="flex items-center space-x-2 w-full sm:w-auto">
                                    <Search className={cn("h-5 w-5", isDark ? "text-[#C0FF00]" : "text-gray-400")} />
                                    <Input
                                        placeholder="Search tasks..."
                                        className="max-w-xs border-0 bg-transparent focus-visible:ring-0"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                                    {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                                        <Button
                                            key={status}
                                            variant={filterStatus === status ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => setFilterStatus(status)}
                                            className={cn(
                                                "whitespace-nowrap font-bold tracking-tight px-4",
                                                isDark && filterStatus === status && "bg-[#C0FF00] text-black hover:bg-white",
                                                isDark && filterStatus !== status && "hover:bg-white/10 text-gray-500 hover:text-white"
                                            )}
                                        >
                                            {status === 'ALL' ? 'ALL' : status.replace('_', ' ')}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Tasks List */}
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={cn("h-32 rounded-xl animate-pulse", isDark ? "bg-white/5" : "bg-gray-100")} />
                                    ))}
                                </div>
                            ) : filteredMyTasks.length === 0 ? (
                                <div className={cn(
                                    "text-center py-20 rounded-2xl border border-dashed transition-all",
                                    isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-300"
                                )}>
                                    <CheckSquare className={cn("h-16 w-16 mx-auto mb-4 transition-colors", isDark ? "text-[#C0FF00]/20" : "text-gray-300")} />
                                    <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>No tasks found</h3>
                                    <p className={cn("mt-2 transition-colors", isDark ? "text-gray-500" : "text-gray-500")}>You're all caught up! Or try adjusting your filters.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {filteredMyTasks.map((task) => renderTaskCard(task))}
                                </div>
                            )}
                        </TabsContent>

                        {/* All Workers Tab */}
                        <TabsContent value="all-workers" className="space-y-4 mt-6">
                            {/* Search */}
                            <div className={cn(
                                "flex items-center space-x-2 p-4 rounded-xl border shadow-sm transition-all duration-300",
                                isDark ? "bg-white/5 border-white/5 shadow-2xl" : "bg-white border-slate-200"
                            )}>
                                <Search className={cn("h-5 w-5", isDark ? "text-[#C0FF00]" : "text-gray-400")} />
                                <Input
                                    placeholder="Search workers..."
                                    className="border-0 bg-transparent focus-visible:ring-0"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Workers List */}
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={cn("h-24 rounded-xl animate-pulse", isDark ? "bg-white/5" : "bg-gray-100")} />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredWorkers.map((worker) => (
                                        <Card key={worker.id} className={cn(
                                            "overflow-hidden transition-all duration-300",
                                            isDark ? "bg-[#080808] border-white/5 hover:border-[#C0FF00]/30" : "bg-white hover:shadow-md"
                                        )}>
                                            {/* Worker Header */}
                                            <div
                                                className={cn(
                                                    "p-5 cursor-pointer transition-all",
                                                    isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                                                )}
                                                onClick={() => setExpandedWorker(expandedWorker === worker.id ? null : worker.id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ring-2",
                                                            isDark ? "bg-[#C0FF00] text-black ring-[#1c1c1c]" : "bg-indigo-100 text-indigo-700 ring-white"
                                                        )}>
                                                            {worker.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h3 className={cn("font-bold text-lg", isDark ? "text-white" : "text-gray-900")}>
                                                                {worker.name}
                                                            </h3>
                                                            <p className={cn("text-sm", isDark ? "text-gray-500" : "text-gray-600")}>
                                                                {worker.role}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        {/* Stats */}
                                                        <div className="hidden sm:flex items-center gap-3">
                                                            <div className="text-center">
                                                                <div className={cn("text-2xl font-bold", isDark ? "text-[#C0FF00]" : "text-green-600")}>
                                                                    {worker.tasksCompleted}
                                                                </div>
                                                                <div className={cn("text-[10px] font-semibold uppercase tracking-wider", isDark ? "text-gray-600" : "text-gray-500")}>
                                                                    Done
                                                                </div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className={cn("text-2xl font-bold", isDark ? "text-cyan-400" : "text-blue-600")}>
                                                                    {worker.tasksInProgress}
                                                                </div>
                                                                <div className={cn("text-[10px] font-semibold uppercase tracking-wider", isDark ? "text-gray-600" : "text-gray-500")}>
                                                                    Active
                                                                </div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className={cn("text-2xl font-bold", isDark ? "text-gray-500" : "text-gray-600")}>
                                                                    {worker.tasksPending}
                                                                </div>
                                                                <div className={cn("text-[10px] font-semibold uppercase tracking-wider", isDark ? "text-gray-600" : "text-gray-500")}>
                                                                    Pending
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Expand Icon */}
                                                        {expandedWorker === worker.id ? (
                                                            <ChevronUp className={cn("h-5 w-5", isDark ? "text-[#C0FF00]" : "text-gray-600")} />
                                                        ) : (
                                                            <ChevronDown className={cn("h-5 w-5", isDark ? "text-gray-500" : "text-gray-400")} />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Mobile Stats */}
                                                <div className="sm:hidden flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
                                                    <div className="flex-1 text-center">
                                                        <div className={cn("text-xl font-bold", isDark ? "text-[#C0FF00]" : "text-green-600")}>
                                                            {worker.tasksCompleted}
                                                        </div>
                                                        <div className={cn("text-[9px] font-semibold uppercase tracking-wider", isDark ? "text-gray-600" : "text-gray-500")}>
                                                            Done
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 text-center">
                                                        <div className={cn("text-xl font-bold", isDark ? "text-cyan-400" : "text-blue-600")}>
                                                            {worker.tasksInProgress}
                                                        </div>
                                                        <div className={cn("text-[9px] font-semibold uppercase tracking-wider", isDark ? "text-gray-600" : "text-gray-500")}>
                                                            Active
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 text-center">
                                                        <div className={cn("text-xl font-bold", isDark ? "text-gray-500" : "text-gray-600")}>
                                                            {worker.tasksPending}
                                                        </div>
                                                        <div className={cn("text-[9px] font-semibold uppercase tracking-wider", isDark ? "text-gray-600" : "text-gray-500")}>
                                                            Pending
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Worker Tasks (Expanded) */}
                                            {expandedWorker === worker.id && (
                                                <div className={cn(
                                                    "border-t p-5 space-y-4 animate-in slide-in-from-top-2 duration-300",
                                                    isDark ? "bg-white/2 border-white/5" : "bg-gray-50/50 border-gray-200"
                                                )}>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className={cn("font-bold text-sm uppercase tracking-wider", isDark ? "text-[#C0FF00]" : "text-gray-700")}>
                                                            Task List ({worker.tasks.length})
                                                        </h4>
                                                        <Badge className={cn("font-bold", isDark ? "bg-[#C0FF00]/10 text-[#C0FF00] border-[#C0FF00]/20" : "")}>
                                                            {Math.round((worker.tasksCompleted / worker.tasksTotal) * 100)}% Complete
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {worker.tasks.map((task) => renderTaskCard(task))}
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                ) : (
                    // Regular user view (no tabs)
                    <>
                        {/* Search and Filter */}
                        <div className={cn(
                            "flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-xl border shadow-sm transition-all duration-300",
                            isDark ? "bg-white/5 border-white/5 shadow-2xl" : "bg-white border-slate-200"
                        )}>
                            <div className="flex items-center space-x-2 w-full sm:w-auto">
                                <Search className={cn("h-5 w-5", isDark ? "text-[#C0FF00]" : "text-gray-400")} />
                                <Input
                                    placeholder="Search tasks..."
                                    className="max-w-xs border-0 bg-transparent focus-visible:ring-0"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                                {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                                    <Button
                                        key={status}
                                        variant={filterStatus === status ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setFilterStatus(status)}
                                        className={cn(
                                            "whitespace-nowrap font-bold tracking-tight px-4",
                                            isDark && filterStatus === status && "bg-[#C0FF00] text-black hover:bg-white",
                                            isDark && filterStatus !== status && "hover:bg-white/10 text-gray-500 hover:text-white"
                                        )}
                                    >
                                        {status === 'ALL' ? 'ALL' : status.replace('_', ' ')}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Tasks List */}
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={cn("h-32 rounded-xl animate-pulse", isDark ? "bg-white/5" : "bg-gray-100")} />
                                ))}
                            </div>
                        ) : filteredMyTasks.length === 0 ? (
                            <div className={cn(
                                "text-center py-20 rounded-2xl border border-dashed transition-all",
                                isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-300"
                            )}>
                                <CheckSquare className={cn("h-16 w-16 mx-auto mb-4 transition-colors", isDark ? "text-[#C0FF00]/20" : "text-gray-300")} />
                                <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>No tasks found</h3>
                                <p className={cn("mt-2 transition-colors", isDark ? "text-gray-500" : "text-gray-500")}>You're all caught up! Or try adjusting your filters.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredMyTasks.map((task) => renderTaskCard(task))}
                            </div>
                        )}
                    </>
                )
            }
        </div >
    )
}
