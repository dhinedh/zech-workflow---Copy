"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Users as UsersIcon, X, Calendar, TrendingUp } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import { cn } from "@/lib/utils"

interface User {
    id: string
    name: string
    email: string
    role: string
}

interface TeamMember {
    userId: string
    role: string
    name?: string
    email?: string
}

interface Project {
    id: string
    name: string
    description: string
    status: string
    priority: string
    startDate: string
    endDate?: string
    progress: number
}

export default function AdminProjectsPage() {
    const router = useRouter()
    const { theme } = useTheme()
    const { user } = useAuthStore()
    const isDark = theme === 'dark'

    const [projects, setProjects] = useState<Project[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [error, setError] = useState("")
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [newProject, setNewProject] = useState({
        name: "",
        description: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
        managerId: "",
        status: "NOT_STARTED",
        priority: "MEDIUM"
    })

    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    const [selectedUser, setSelectedUser] = useState("")
    const [selectedRole, setSelectedRole] = useState("Developer")

    useEffect(() => {
        fetchProjects()
        fetchUsers()
    }, [])

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects')
            if (response.data.success) {
                setProjects(response.data.data)
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch projects')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users')
            if (response.data.success) {
                setUsers(response.data.data)
            }
        } catch (err) {
            console.error('Failed to fetch users')
        }
    }

    const handleAddMember = () => {
        if (!selectedUser) return

        const userInfo = users.find(u => u.id === selectedUser)
        if (!userInfo) return

        if (teamMembers.some(m => m.userId === selectedUser)) {
            setError("User already added to team")
            setTimeout(() => setError(""), 3000)
            return
        }

        setTeamMembers([...teamMembers, {
            userId: selectedUser,
            role: selectedRole,
            name: userInfo.name,
            email: userInfo.email
        }])

        setSelectedUser("")
        setSelectedRole("Developer")
    }

    const handleRemoveMember = (userId: string) => {
        setTeamMembers(teamMembers.filter(m => m.userId !== userId))
    }

    const handleCreateProject = async () => {
        if (!newProject.name || !newProject.managerId) {
            setError("Project name and manager are required")
            return
        }

        setIsSubmitting(true)
        setError("")

        try {
            const response = await api.post('/projects', {
                ...newProject,
                members: teamMembers.map(m => ({ userId: m.userId, role: m.role }))
            })

            if (response.data.success) {
                setProjects([response.data.data, ...projects])
                setIsCreateOpen(false)
                setNewProject({
                    name: "",
                    description: "",
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: "",
                    managerId: "",
                    status: "NOT_STARTED",
                    priority: "MEDIUM"
                })
                setTeamMembers([])
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to create project')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStatusColor = (status: string) => {
        const colors = {
            'NOT_STARTED': isDark ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-100 text-gray-700',
            'IN_PROGRESS': isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700',
            'COMPLETED': isDark ? 'bg-[#C0FF00]/10 text-[#C0FF00]' : 'bg-green-100 text-green-700',
            'ON_HOLD': isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700',
        }
        return colors[status as keyof typeof colors] || colors['NOT_STARTED']
    }

    const getPriorityColor = (priority: string) => {
        const colors = {
            'LOW': isDark ? 'text-gray-500' : 'text-gray-600',
            'MEDIUM': isDark ? 'text-blue-400' : 'text-blue-600',
            'HIGH': isDark ? 'text-amber-400' : 'text-amber-600',
            'URGENT': isDark ? 'text-red-400' : 'text-red-600',
        }
        return colors[priority as keyof typeof colors] || colors['MEDIUM']
    }

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const projectRoles = ["Developer", "Designer", "Tester", "DevOps", "Team Lead", "Architect", "Analyst"]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                        Projects
                    </h1>
                    <p className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-slate-500")}>
                        Manage company projects and teams
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className={cn("font-semibold", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "")}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent className={cn("max-w-2xl max-h-[90vh] overflow-y-auto", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white")}>
                        <DialogHeader>
                            <DialogTitle className={isDark ? "text-white" : "text-slate-900"}>Create New Project</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label className={isDark ? "text-gray-300" : ""}>Project Name *</Label>
                                    <Input
                                        value={newProject.name}
                                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                        className={isDark ? "bg-black border-white/10 text-white mt-1" : "mt-1"}
                                        placeholder="Enter project name"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <Label className={isDark ? "text-gray-300" : ""}>Description</Label>
                                    <Textarea
                                        value={newProject.description}
                                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                        className={isDark ? "bg-black border-white/10 text-white mt-1" : "mt-1"}
                                        placeholder="Project description"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label className={isDark ? "text-gray-300" : ""}>Start Date</Label>
                                    <Input
                                        type="date"
                                        value={newProject.startDate}
                                        onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                                        className={isDark ? "bg-black border-white/10 text-white mt-1" : "mt-1"}
                                    />
                                </div>

                                <div>
                                    <Label className={isDark ? "text-gray-300" : ""}>End Date</Label>
                                    <Input
                                        type="date"
                                        value={newProject.endDate}
                                        onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                                        className={isDark ? "bg-black border-white/10 text-white mt-1" : "mt-1"}
                                    />
                                </div>

                                <div>
                                    <Label className={isDark ? "text-gray-300" : ""}>Manager *</Label>
                                    <select
                                        value={newProject.managerId}
                                        onChange={(e) => setNewProject({ ...newProject, managerId: e.target.value })}
                                        className={cn("w-full h-10 rounded-md border px-3 mt-1", isDark ? "bg-black border-white/10 text-white" : "border-slate-200")}
                                    >
                                        <option value="">Select Manager</option>
                                        {users.filter(u => u.role === 'MANAGER' || u.role === 'SUPER_ADMIN').map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label className={isDark ? "text-gray-300" : ""}>Priority</Label>
                                    <select
                                        value={newProject.priority}
                                        onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                                        className={cn("w-full h-10 rounded-md border px-3 mt-1", isDark ? "bg-black border-white/10 text-white" : "border-slate-200")}
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="URGENT">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            {/* Team Members */}
                            <div className={cn("border-t pt-4", isDark ? "border-white/10" : "border-slate-200")}>
                                <Label className={cn("text-base font-semibold", isDark ? "text-white" : "text-slate-900")}>
                                    Team Members
                                </Label>

                                <div className="grid grid-cols-3 gap-3 mt-3">
                                    <select
                                        value={selectedUser}
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                        className={cn("h-10 rounded-md border px-3", isDark ? "bg-black border-white/10 text-white" : "border-slate-200")}
                                    >
                                        <option value="">Select User</option>
                                        {users.filter(u => !teamMembers.some(m => m.userId === u.id)).map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                        ))}
                                    </select>

                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className={cn("h-10 rounded-md border px-3", isDark ? "bg-black border-white/10 text-white" : "border-slate-200")}
                                    >
                                        {projectRoles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>

                                    <Button
                                        type="button"
                                        onClick={handleAddMember}
                                        variant="outline"
                                        className={isDark ? "border-white/10 hover:bg-white/5" : ""}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add
                                    </Button>
                                </div>

                                {teamMembers.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {teamMembers.map((member) => (
                                            <div
                                                key={member.userId}
                                                className={cn("flex items-center justify-between p-3 rounded-lg", isDark ? "bg-white/5" : "bg-slate-50")}
                                            >
                                                <div className="flex-1">
                                                    <p className={cn("font-medium text-sm", isDark ? "text-white" : "text-slate-900")}>
                                                        {member.name}
                                                    </p>
                                                    <p className={cn("text-xs", isDark ? "text-gray-400" : "text-slate-500")}>
                                                        {member.role} • {member.email}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveMember(member.userId)}
                                                    className={isDark ? "hover:bg-red-500/10 text-red-400" : "hover:bg-red-50 text-red-600"}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className={cn("p-3 rounded-lg text-sm", isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600")}>
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                                className={isDark ? "border-white/10 hover:bg-white/5" : ""}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateProject}
                                disabled={isSubmitting || !newProject.name || !newProject.managerId}
                                className={cn("font-semibold", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "")}
                            >
                                {isSubmitting ? "Creating..." : "Create Project"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className={cn("absolute left-3 top-3 h-4 w-4", isDark ? "text-gray-600" : "text-slate-400")} />
                <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn("pl-10", isDark ? "bg-black border-white/5 text-white" : "")}
                />
            </div>

            {/* Projects Grid */}
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className={cn("animate-pulse", isDark ? "bg-[#1c1c1c] border-white/10" : "")}>
                            <CardHeader className="space-y-2">
                                <div className={cn("h-5 rounded", isDark ? "bg-white/5" : "bg-slate-200")} />
                                <div className={cn("h-4 rounded w-2/3", isDark ? "bg-white/5" : "bg-slate-200")} />
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            ) : filteredProjects.length === 0 ? (
                <Card className={cn("p-12 text-center", isDark ? "bg-[#1c1c1c] border-white/10" : "")}>
                    <p className={cn("text-sm", isDark ? "text-gray-400" : "text-slate-500")}>
                        {searchQuery ? "No projects found" : "No projects yet. Create your first project!"}
                    </p>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                        <Card
                            key={project.id}
                            className={cn(
                                "cursor-pointer transition-all hover:-translate-y-1",
                                isDark ? "bg-[#1c1c1c] border-white/10 hover:border-white/20" : "hover:shadow-lg"
                            )}
                            onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className={cn("text-base font-semibold", isDark ? "text-white" : "text-slate-900")}>
                                        {project.name}
                                    </CardTitle>
                                    <Badge className={cn("text-xs", getStatusColor(project.status))}>
                                        {project.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <p className={cn("text-xs line-clamp-2", isDark ? "text-gray-400" : "text-slate-500")}>
                                    {project.description || "No description"}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className={cn("h-3 w-3", getPriorityColor(project.priority))} />
                                        <span className={isDark ? "text-gray-400" : "text-slate-600"}>{project.priority}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className={cn("h-3 w-3", isDark ? "text-gray-500" : "text-slate-400")} />
                                        <span className={isDark ? "text-gray-500" : "text-slate-500"}>
                                            {new Date(project.startDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className={isDark ? "text-gray-400" : "text-slate-600"}>Progress</span>
                                        <span className={cn("font-semibold", isDark ? "text-[#C0FF00]" : "text-indigo-600")}>
                                            {project.progress}%
                                        </span>
                                    </div>
                                    <div className={cn("h-1.5 rounded-full", isDark ? "bg-white/5" : "bg-slate-100")}>
                                        <div
                                            className={cn("h-full rounded-full", isDark ? "bg-[#C0FF00]" : "bg-indigo-600")}
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
