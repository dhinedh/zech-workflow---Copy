
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import {
    Card,
    CardContent,
    CardFooter,
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Plus,
    MoreVertical,
    Calendar,
    Clock,
    Briefcase,
    AlertCircle
} from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import { cn } from "@/lib/utils"

// Types based on backend controller or assumptions
interface UserInfo {
    name: string;
    avatar?: string;
}

interface Milestone {
    id: string;
    title: string;
    dueDate: string; // ISO date
    status: string;
}

interface Project {
    id: string;
    name: string;
    description: string;
    status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    startDate: string;
    endDate?: string;
    progress: number;
    manager?: UserInfo;
    client?: UserInfo;
    milestones: Milestone[];
}

export default function ProjectsPage() {
    const router = useRouter()
    const { theme } = useTheme()
    const { user } = useAuthStore()
    const isDark = theme === 'dark'
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [error, setError] = useState("")
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newProject, setNewProject] = useState({ name: "", description: "", startDate: "" })

    const handleCreateProject = async () => {
        if (!newProject.name) return

        setIsSubmitting(true)
        try {
            const response = await api.post('/api/projects', {
                name: newProject.name,
                description: newProject.description,
                startDate: newProject.startDate || new Date().toISOString(),
                status: 'PLANNING',
                priority: 'MEDIUM'
            })
            if (response.data.success) {
                setProjects([response.data.data, ...projects])
                setIsCreateOpen(false)
                setNewProject({ name: "", description: "", startDate: "" })
            }
        } catch (error) {
            console.error('Failed to create project:', error)
            setError("Failed to create project. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }



    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true)
            try {
                const response = await api.get('/projects')
                if (response.data.success) {
                    setProjects(response.data.data)
                }
            } catch (error) {
                console.error('Failed to fetch projects:', error)
                setError("Failed to load projects.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchProjects()
    }, [])

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        if (isDark) {
            switch (status) {
                case 'COMPLETED': return 'bg-[#C0FF00]/10 text-[#C0FF00] border border-[#C0FF00]/20';
                case 'IN_PROGRESS': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
                case 'PLANNING': return 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20';
                case 'ON_HOLD': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                default: return 'bg-white/5 text-gray-400 border border-white/10';
            }
        }
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-700 hover:bg-green-100';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
            case 'PLANNING': return 'bg-purple-100 text-purple-700 hover:bg-purple-100';
            case 'ON_HOLD': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
            default: return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
        }
    }

    const getPriorityColor = (priority: string) => {
        if (isDark) {
            switch (priority) {
                case 'HIGH': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                case 'MEDIUM': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                case 'LOW': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                default: return 'text-gray-400 bg-white/5';
            }
        }
        switch (priority) {
            case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
            case 'MEDIUM': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'LOW': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50';
        }
    }

    return (
        <div className={cn("space-y-6")}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>Projects</h1>
                    <p className={cn("mt-1 transition-colors", isDark ? "text-gray-500" : "text-muted-foreground")}>Manage and track your ongoing projects.</p>
                </div>
                {user?.role === 'SUPER_ADMIN' && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className={cn(
                                "transition-all active:scale-95 font-bold tracking-tight shadow-lg",
                                isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "bg-indigo-600 hover:bg-indigo-700"
                            )}>
                                <Plus className="mr-2 h-4 w-4" /> New Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent className={isDark ? "bg-[#1c1c1c] border-white/10 text-white" : ""}>
                            <DialogHeader>
                                <DialogTitle className={cn("font-bold tracking-tight", isDark ? "text-white" : "")}>Create New Project</DialogTitle>
                                <DialogDescription className={isDark ? "text-gray-400" : ""}>
                                    Add a new project to your workspace. Click create when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className={isDark ? "text-gray-400" : ""}>Project Name</Label>
                                    <Input
                                        id="name"
                                        value={newProject.name}
                                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                        placeholder="e.g. Website Redesign"
                                        className={isDark ? "bg-white/5 border-white/10" : ""}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description" className={isDark ? "text-gray-400" : ""}>Description</Label>
                                    <Textarea
                                        id="description"
                                        value={newProject.description}
                                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                        placeholder="Brief description of the project"
                                        className={isDark ? "bg-white/5 border-white/10" : ""}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="startDate" className={cn("text-[10px] uppercase font-bold tracking-wider", isDark ? "text-gray-500" : "text-gray-600")}>Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={newProject.startDate}
                                        onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                                        className={cn("h-11", isDark ? "bg-white/5 border-white/10 focus-visible:ring-[#C0FF00]/50" : "")}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleCreateProject}
                                    disabled={!newProject.name || isSubmitting}
                                    className={cn("w-full h-12 font-bold tracking-tight transition-all shadow-md", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "bg-indigo-600 hover:bg-indigo-700")}
                                >
                                    {isSubmitting ? "Creating..." : "Create Project"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className={cn(
                "flex items-center space-x-2 p-2 rounded-xl border shadow-sm max-w-md transition-all duration-300",
                isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-200"
            )}>
                <Search className={cn("h-5 w-5 ml-2 transition-colors", isDark ? "text-[#C0FF00]" : "text-gray-400")} />
                <Input
                    placeholder="Search projects by name..."
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {error && (
                <div className={cn(
                    "p-4 rounded-xl flex items-center transition-colors",
                    isDark ? "bg-red-500/10 border border-red-500/20 text-red-400" : "bg-red-50 border border-red-200 text-red-700"
                )}>
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className={cn("animate-pulse", isDark ? "bg-white/5 border-white/5" : "")}>
                            <CardHeader className={cn("h-24 rounded-t-lg", isDark ? "bg-white/5" : "bg-gray-100")} />
                            <CardContent className="h-40" />
                        </Card>
                    ))}
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className={cn(
                    "text-center py-12 rounded-2xl border border-dashed transition-all",
                    isDark ? "bg-white/2 border-white/10" : "bg-gray-50 border-gray-300"
                )}>
                    <Briefcase className={cn("h-12 w-12 mx-auto mb-4 transition-colors", isDark ? "text-[#C0FF00]/40" : "text-gray-400")} />
                    <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>No projects found</h3>
                    <p className={cn("mt-2 transition-colors", isDark ? "text-gray-500" : "text-gray-500")}>Create a new project to get started or adjust your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <Link href={`/dashboard/projects/${project.id}`} key={project.id} className="block group">
                            <Card className={cn(
                                "h-full transition-all duration-500 relative overflow-hidden group-hover:-translate-y-1",
                                isDark
                                    ? "bg-[#080808] border-white/5 hover:border-[#C0FF00]/30 shadow-2xl"
                                    : "bg-white border-gray-200 hover:shadow-lg hover:border-primary/50"
                            )}>
                                <div className={cn(
                                    "absolute top-0 left-0 w-1 h-full shadow-[0_0_10px_rgba(192,255,0,0.2)]",
                                    project.status === 'COMPLETED' ? (isDark ? 'bg-[#C0FF00]' : 'bg-green-500') :
                                        project.status === 'IN_PROGRESS' ? (isDark ? 'bg-cyan-500' : 'bg-blue-500') :
                                            project.priority === 'HIGH' ? (isDark ? 'bg-rose-500' : 'bg-red-500') : 'bg-gray-300'
                                )} />

                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="secondary" className={cn("border-0 font-bold tracking-tight px-3 py-1", getStatusColor(project.status))}>
                                            {project.status.replace('_', ' ')}
                                        </Badge>
                                        <Badge variant="outline" className={cn("text-xs font-bold", getPriorityColor(project.priority))}>
                                            {project.priority}
                                        </Badge>
                                    </div>
                                    <CardTitle className={cn(
                                        "mt-4 text-xl transition-colors line-clamp-1 font-bold",
                                        isDark ? "text-white group-hover:text-[#C0FF00]" : "group-hover:text-primary"
                                    )}>
                                        {project.name}
                                    </CardTitle>
                                    <div className={cn("flex items-center text-xs mt-1 transition-colors", isDark ? "text-gray-500" : "text-gray-500")}>
                                        <Calendar className={cn("h-3.5 w-3.5 mr-1", isDark && "text-[#C0FF00]")} />
                                        <span>Due {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </CardHeader>

                                <CardContent className="pb-3">
                                    <p className={cn("text-sm line-clamp-2 min-h-[40px] font-medium leading-relaxed transition-colors", isDark ? "text-gray-400" : "text-slate-600")}>
                                        {project.description || "No description provided."}
                                    </p>

                                    <div className="mt-4 space-y-2">
                                        <div className={cn("flex justify-between text-[10px] font-semibold uppercase tracking-wider", isDark ? "text-[#C0FF00]" : "text-gray-500")}>
                                            <span>Overall Progress</span>
                                            <span>{project.progress}%</span>
                                        </div>
                                        <div className={cn("w-full rounded-full h-1.5 overflow-hidden transition-colors", isDark ? "bg-white/5" : "bg-gray-100")}>
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-700 ease-out",
                                                    isDark ? "bg-[#C0FF00] shadow-[0_0_10px_#C0FF00]" : "bg-primary"
                                                )}
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className={cn(
                                    "pt-3 border-t flex justify-between items-center text-[10px]",
                                    isDark ? "border-white/5 bg-white/1 text-gray-500" : "border-gray-100 bg-gray-50/50 text-gray-500"
                                )}>
                                    <div className="flex -space-x-2">
                                        {project.manager && (
                                            <div className={cn(
                                                "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold transition-all",
                                                isDark ? "bg-[#C0FF00] border-[#080808] text-black" : "bg-primary/20 border-white text-primary"
                                            )} title={`Manager: ${project.manager.name}`}>
                                                {project.manager.name.charAt(0)}
                                            </div>
                                        )}
                                        {project.client && (
                                            <div className={cn(
                                                "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold transition-all",
                                                isDark ? "bg-white/10 border-[#080808] text-white" : "bg-indigo-100 border-white text-indigo-700"
                                            )} title={`Client: ${project.client.name}`}>
                                                {project.client.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    {project.milestones && project.milestones.length > 0 && (
                                        <div className={cn(
                                            "flex items-center px-2 py-1 rounded-full border transition-all",
                                            isDark ? "text-cyan-400 bg-cyan-500/5 border-cyan-500/10" : "text-orange-600 bg-orange-50 border-orange-100"
                                        )}>
                                            <Clock className="h-3 w-3 mr-1" />
                                            <span>Next: {new Date(project.milestones[0].dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                    )}
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
