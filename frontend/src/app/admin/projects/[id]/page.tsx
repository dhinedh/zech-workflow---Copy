"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import { cn } from "@/lib/utils"

interface ModuleUpdate {
    id: string
    moduleName: string
    description: string
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
    startedAt?: string
    completedAt?: string
    userId: string
    userName: string
    createdAt: string
}

interface ProjectMember {
    id: string
    role: string
    user: {
        id: string
        name: string
        email: string
        role: string
    }
}

interface Project {
    id: string
    name: string
    description: string
    status: string
    priority: string
    progress: number
    members: ProjectMember[]
}

export default function ProjectDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { theme } = useTheme()
    const { user } = useAuthStore()
    const isDark = theme === 'dark'

    const [project, setProject] = useState<Project | null>(null)
    const [modules, setModules] = useState<ModuleUpdate[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [newModule, setNewModule] = useState<{
        moduleName: string
        description: string
        status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
    }>({
        moduleName: "",
        description: "",
        status: "NOT_STARTED"
    })

    useEffect(() => {
        if (params.id) {
            fetchProjectDetails()
            fetchModules()
        }
    }, [params.id])

    const fetchProjectDetails = async () => {
        try {
            const response = await api.get(`/projects/${params.id}`)
            if (response.data.success) {
                setProject(response.data.data)
            }
        } catch (err) {
            console.error('Failed to fetch project')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchModules = async () => {
        try {
            // This endpoint needs to be created in backend
            const response = await api.get(`/projects/${params.id}/modules`)
            if (response.data.success) {
                setModules(response.data.data)
            }
        } catch (err) {
            // If endpoint doesn't exist yet, use empty array
            setModules([])
        }
    }

    const handleCreateModule = async () => {
        if (!newModule.moduleName) return

        setIsSubmitting(true)
        try {
            const response = await api.post(`/projects/${params.id}/modules`, {
                ...newModule,
                startedAt: newModule.status === 'IN_PROGRESS' ? new Date().toISOString() : undefined,
                completedAt: newModule.status === 'COMPLETED' ? new Date().toISOString() : undefined
            })

            if (response.data.success) {
                setModules([response.data.data, ...modules])
                setIsModuleDialogOpen(false)
                setNewModule({ moduleName: "", description: "", status: "NOT_STARTED" })
            }
        } catch (error: any) {
            console.error('Failed to create module update')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateModuleStatus = async (moduleId: string, newStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') => {
        try {
            const updateData: any = { status: newStatus }
            if (newStatus === 'IN_PROGRESS') {
                updateData.startedAt = new Date().toISOString()
            } else if (newStatus === 'COMPLETED') {
                updateData.completedAt = new Date().toISOString()
            }

            const response = await api.patch(`/projects/${params.id}/modules/${moduleId}`, updateData)
            if (response.data.success) {
                setModules(modules.map(m => m.id === moduleId ? response.data.data : m))
            }
        } catch (error) {
            console.error('Failed to update module status')
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle2 className={cn("h-4 w-4", isDark ? "text-[#C0FF00]" : "text-green-600")} />
            case 'IN_PROGRESS':
                return <Clock className={cn("h-4 w-4", isDark ? "text-blue-400" : "text-blue-600")} />
            default:
                return <AlertCircle className={cn("h-4 w-4", isDark ? "text-gray-500" : "text-gray-400")} />
        }
    }

    const getStatusColor = (status: string) => {
        const colors = {
            'NOT_STARTED': isDark ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-100 text-gray-700',
            'IN_PROGRESS': isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700',
            'COMPLETED': isDark ? 'bg-[#C0FF00]/10 text-[#C0FF00]' : 'bg-green-100 text-green-700',
        }
        return colors[status as keyof typeof colors] || colors['NOT_STARTED']
    }

    const isMember = project?.members.some(m => m.user.id === user?.id)
    const isAdmin = user?.role === 'SUPER_ADMIN'

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className={cn("h-8 w-48 rounded animate-pulse", isDark ? "bg-white/5" : "bg-slate-200")} />
                <div className={cn("h-64 rounded-lg animate-pulse", isDark ? "bg-white/5" : "bg-slate-200")} />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <p className={isDark ? "text-gray-400" : "text-slate-500"}>Project not found</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className={isDark ? "hover:bg-white/5" : ""}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>

            {/* Project Info */}
            <Card className={cn(isDark ? "bg-[#1c1c1c] border-white/10" : "")}>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className={cn("text-2xl", isDark ? "text-white" : "text-slate-900")}>
                                {project.name}
                            </CardTitle>
                            <p className={cn("text-sm mt-2", isDark ? "text-gray-400" : "text-slate-500")}>
                                {project.description}
                            </p>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                            {project.status.replace('_', ' ')}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className={cn("text-xs", isDark ? "text-gray-500" : "text-slate-500")}>Priority</p>
                            <p className={cn("font-semibold mt-1", isDark ? "text-white" : "text-slate-900")}>
                                {project.priority}
                            </p>
                        </div>
                        <div>
                            <p className={cn("text-xs", isDark ? "text-gray-500" : "text-slate-500")}>Progress</p>
                            <p className={cn("font-semibold mt-1", isDark ? "text-[#C0FF00]" : "text-indigo-600")}>
                                {project.progress}%
                            </p>
                        </div>
                        <div>
                            <p className={cn("text-xs", isDark ? "text-gray-500" : "text-slate-500")}>Team Size</p>
                            <p className={cn("font-semibold mt-1", isDark ? "text-white" : "text-slate-900")}>
                                {project.members.length} members
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Team Members */}
            <Card className={cn(isDark ? "bg-[#1c1c1c] border-white/10" : "")}>
                <CardHeader>
                    <CardTitle className={cn("text-lg", isDark ? "text-white" : "text-slate-900")}>
                        Team Members
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                        {project.members.map((member) => (
                            <div
                                key={member.id}
                                className={cn("p-3 rounded-lg", isDark ? "bg-white/5" : "bg-slate-50")}
                            >
                                <p className={cn("font-medium text-sm", isDark ? "text-white" : "text-slate-900")}>
                                    {member.user.name}
                                </p>
                                <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-slate-500")}>
                                    {member.role} • {member.user.email}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Module Updates */}
            <Card className={cn(isDark ? "bg-[#1c1c1c] border-white/10" : "")}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className={cn("text-lg", isDark ? "text-white" : "text-slate-900")}>
                            Module Updates
                        </CardTitle>
                        {(isMember || isAdmin) && (
                            <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className={cn("font-semibold", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "")}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Update
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className={cn(isDark ? "bg-[#1c1c1c] border-white/10" : "")}>
                                    <DialogHeader>
                                        <DialogTitle className={isDark ? "text-white" : ""}>Add Module Update</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div>
                                            <Label className={isDark ? "text-gray-300" : ""}>Module Name</Label>
                                            <Input
                                                value={newModule.moduleName}
                                                onChange={(e) => setNewModule({ ...newModule, moduleName: e.target.value })}
                                                className={cn("mt-1", isDark ? "bg-black border-white/10 text-white" : "")}
                                                placeholder="e.g., User Authentication"
                                            />
                                        </div>
                                        <div>
                                            <Label className={isDark ? "text-gray-300" : ""}>Description</Label>
                                            <Textarea
                                                value={newModule.description}
                                                onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                                                className={cn("mt-1", isDark ? "bg-black border-white/10 text-white" : "")}
                                                placeholder="What did you work on?"
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <Label className={isDark ? "text-gray-300" : ""}>Status</Label>
                                            <select
                                                value={newModule.status}
                                                onChange={(e) => setNewModule({ ...newModule, status: e.target.value as any })}
                                                className={cn("w-full h-10 rounded-md border px-3 mt-1", isDark ? "bg-black border-white/10 text-white" : "")}
                                            >
                                                <option value="NOT_STARTED">Not Started</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="COMPLETED">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <Button variant="outline" onClick={() => setIsModuleDialogOpen(false)} className={isDark ? "border-white/10 hover:bg-white/5" : ""}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleCreateModule}
                                            disabled={isSubmitting || !newModule.moduleName}
                                            className={cn("font-semibold", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "")}
                                        >
                                            {isSubmitting ? "Adding..." : "Add Update"}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {modules.length === 0 ? (
                        <p className={cn("text-sm text-center py-8", isDark ? "text-gray-400" : "text-slate-500")}>
                            No module updates yet. Add your first update!
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {modules.map((module) => (
                                <div
                                    key={module.id}
                                    className={cn("p-4 rounded-lg border", isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getStatusIcon(module.status)}
                                                <h4 className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>
                                                    {module.moduleName}
                                                </h4>
                                                <Badge className={cn("text-xs", getStatusColor(module.status))}>
                                                    {module.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <p className={cn("text-sm mb-3", isDark ? "text-gray-400" : "text-slate-600")}>
                                                {module.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs">
                                                <span className={isDark ? "text-gray-500" : "text-slate-500"}>
                                                    By {module.userName}
                                                </span>
                                                {module.startedAt && (
                                                    <span className={isDark ? "text-gray-500" : "text-slate-500"}>
                                                        Started: {new Date(module.startedAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {module.completedAt && (
                                                    <span className={isDark ? "text-[#C0FF00]" : "text-green-600"}>
                                                        Completed: {new Date(module.completedAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {(module.userId === user?.id || isAdmin) && module.status !== 'COMPLETED' && (
                                            <div className="flex gap-2">
                                                {module.status === 'NOT_STARTED' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleUpdateModuleStatus(module.id, 'IN_PROGRESS')}
                                                        className={isDark ? "border-white/10 hover:bg-white/5" : ""}
                                                    >
                                                        Start
                                                    </Button>
                                                )}
                                                {module.status === 'IN_PROGRESS' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleUpdateModuleStatus(module.id, 'COMPLETED')}
                                                        className={cn("font-semibold", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "")}
                                                    >
                                                        Complete
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
