"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import {
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    FileText,
    Loader2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Search,
    XCircle,
    Check
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { useTheme } from "@/context/ThemeContext"

// --- Schemas & Types ---

const reportSchema = z.object({
    date: z.date({ message: "Date is required" }),
    taskIds: z.array(z.string()).min(1, "Please select at least one task involved in your day."),
    hoursWorked: z.number().min(0.5, "Minimum 0.5 hours").max(24, "Max 24 hours"),
    accomplishments: z.string().min(10, "Please provide a brief description of your accomplishments (min 10 chars)."),
    problems: z.string().optional(),
    tomorrowPlan: z.string().optional(),
    selfRating: z.number().min(1).max(5),
})

type ReportFormValues = z.infer<typeof reportSchema>

interface Task {
    id: string
    title: string
    status: string
    project?: { name: string }
}

interface WorkerReport {
    id: string
    userId: string
    user: {
        id: string
        name: string
        avatar?: string
        role: string
    }
    date: string
    hoursWorked: number
    accomplishments: string
    problems?: string
    tomorrowPlan?: string
    selfRating: number
    status: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
    managerFeedback?: string
    tasks?: Task[]
}

export default function DailyReportPage() {
    const { user } = useAuthStore()
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Permission check: Super Admin or Manager
    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER'

    const [activeTab, setActiveTab] = useState<'my-report' | 'team-reports'>('my-report')

    return (
        <div className={cn("container mx-auto p-6 max-w-7xl animate-in fade-in duration-500", isDark ? "text-slate-100" : "text-slate-900")}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Daily Reporting</h1>
                    <p className={cn("mt-1 transition-colors", isDark ? "text-gray-400" : "text-muted-foreground")}>
                        Track your daily progress and stay aligned with your team.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={cn("px-4 py-2 rounded-xl border transition-all shadow-sm", isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200")}>
                        <div className={cn("text-sm font-bold", isDark ? "text-[#C0FF00]" : "text-slate-900")}>{format(new Date(), 'EEEE, MMM d, yyyy')}</div>
                    </div>
                </div>
            </div>

            {isSuperAdmin ? (
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full space-y-6">
                    <TabsList className={cn("grid w-full md:w-[400px] grid-cols-2", isDark ? "bg-white/5" : "")}>
                        <TabsTrigger value="my-report" className={cn("font-bold tracking-tight", isDark && "data-[state=active]:bg-[#C0FF00] data-[state=active]:text-black")}>My Report</TabsTrigger>
                        <TabsTrigger value="team-reports" className={cn("font-bold tracking-tight", isDark && "data-[state=active]:bg-[#C0FF00] data-[state=active]:text-black")}>Team Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="my-report" className="space-y-4">
                        <ReportSubmissionForm isDark={isDark} />
                    </TabsContent>

                    <TabsContent value="team-reports" className="space-y-4">
                        <TeamReportsView isDark={isDark} />
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="max-w-3xl mx-auto">
                    <ReportSubmissionForm isDark={isDark} />
                </div>
            )}
        </div>
    )
}

// --- Sub-Components ---

function ReportSubmissionForm({ isDark }: { isDark: boolean }) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            date: new Date(),
            taskIds: [],
            hoursWorked: 8,
            accomplishments: "",
            problems: "",
            tomorrowPlan: "",
            selfRating: 4,
        },
    })

    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true)
            try {
                // Fetch active tasks for the dropdown
                const res = await api.get('/tasks?status=IN_PROGRESS,TODO')
                if (res.data.success) {
                    setTasks(res.data.data)
                } else {
                    // Fallback if data structure is different
                    setTasks(res.data.data || [])
                }
            } catch (err) {
                console.error("Failed to fetch tasks", err)
                toast.error("Could not load your tasks. Please try refreshing.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchTasks()
    }, [])

    const onSubmit = async (data: ReportFormValues) => {
        setIsSubmitting(true)
        try {
            await api.post('/daily-reports', data)
            setIsSuccess(true)
            toast.success("Daily report submitted successfully!")
            form.reset()
        } catch (error: any) {
            console.error("Submission error", error)
            const msg = error.response?.data?.message || "Failed to submit report. You may have already submitted one for today."
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800">
                <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px] text-center p-8">
                    <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">Report Submitted!</h2>
                    <p className="text-green-700 dark:text-green-400 mb-6 max-w-md">
                        Your daily report has been successfully recorded. Great work today!
                    </p>
                    <Button onClick={() => setIsSuccess(false)} variant="outline" className="border-green-600 text-green-700 hover:bg-green-100 dark:hover:bg-green-900/20 dark:text-green-300 dark:border-green-700">
                        Submit Another Report
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={cn("shadow-xl border-t-4 transition-all duration-300", isDark ? "bg-[#1c1c1c] border-white/10 border-t-[#C0FF00]" : "border-t-indigo-600")}>
            <CardHeader>
                <CardTitle className="font-bold tracking-tight text-2xl">Submit Daily Report</CardTitle>
                <CardDescription className={isDark ? "text-gray-400" : ""}>
                    Log your activities, hours, and plan for the next day.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date Parser */}
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className={cn("text-[10px] uppercase font-bold tracking-wider", isDark ? "text-gray-500" : "text-gray-600")}>Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal h-11 transition-all",
                                                            !field.value && "text-muted-foreground",
                                                            isDark && "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Hours Worked */}
                            <FormField
                                control={form.control}
                                name="hoursWorked"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={cn("text-[10px] uppercase font-bold tracking-wider", isDark ? "text-gray-500" : "text-gray-600")}>Hours Worked</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.5"
                                                className={cn("h-11", isDark ? "bg-white/5 border-white/10 focus-visible:ring-[#C0FF00]/50" : "")}
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormDescription className={isDark ? "text-gray-500" : ""}>Total hours spent on work today.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Task Selector */}
                        <FormField
                            control={form.control}
                            name="taskIds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Working Tasks</FormLabel>
                                    <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto space-y-2 bg-muted/30">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center py-4">
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Loading tasks...
                                            </div>
                                        ) : tasks.length === 0 ? (
                                            <div className="text-sm text-muted-foreground text-center py-2">No active tasks found.</div>
                                        ) : (
                                            tasks.map((task) => {
                                                const isChecked = field.value?.includes(task.id)
                                                return (
                                                    <div key={task.id} className="flex items-start space-x-3 p-2 rounded hover:bg-muted/50 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked
                                                                const current = field.value || []
                                                                if (checked) {
                                                                    field.onChange([...current, task.id])
                                                                } else {
                                                                    field.onChange(current.filter((id) => id !== task.id))
                                                                }
                                                            }}
                                                            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium leading-none">{task.title}</div>
                                                            {task.project && (
                                                                <p className="text-xs text-muted-foreground mt-1">{task.project.name}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>
                                    <FormDescription>Select the tasks you worked on today.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Accomplishments */}
                        <FormField
                            control={form.control}
                            name="accomplishments"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Accomplishments</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="What did you get done today?"
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Problems */}
                        <FormField
                            control={form.control}
                            name="problems"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Blockers / Issues (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Did you face any challenges?"
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Tomorrow Plan */}
                        <FormField
                            control={form.control}
                            name="tomorrowPlan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Plan for Tomorrow (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="What will you work on next?"
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Self Rating */}
                        <FormField
                            control={form.control}
                            name="selfRating"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block mb-2">Self Rating (1-5)</FormLabel>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((val) => (
                                            <Button
                                                key={val}
                                                type="button"
                                                variant={field.value === val ? "default" : "outline"}
                                                size="sm"
                                                className={cn("w-10 h-10 rounded-full", field.value === val ? "font-bold" : "")}
                                                onClick={() => field.onChange(val)}
                                            >
                                                {val}
                                            </Button>
                                        ))}
                                    </div>
                                    <FormDescription>Rate your productivity for the day.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="pt-4">
                            <Button type="submit" size="lg" className={cn("w-full md:w-auto font-bold tracking-tight shadow-md transition-all active:scale-95", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "bg-indigo-600 hover:bg-indigo-700")} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Daily Report"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

function TeamReportsView({ isDark }: { isDark: boolean }) {
    const [reports, setReports] = useState<WorkerReport[]>([])
    const [loading, setLoading] = useState(true)
    const [filterName, setFilterName] = useState("")

    const fetchReports = async () => {
        setLoading(true)
        try {
            const res = await api.get('/daily-reports')
            if (res.data.success) {
                setReports(res.data.data)
            }
        } catch (error) {
            console.error("Failed to fetch reports", error)
            toast.error("Failed to load team reports.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReports()
    }, [])

    const handleApprove = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await api.put(`/daily-reports/${id}/status`, { status: 'APPROVED' })
            toast.success("Report approved")
            fetchReports()
        } catch (err) {
            toast.error("Action failed")
        }
    }

    const handleReject = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await api.put(`/daily-reports/${id}/status`, { status: 'REJECTED' })
            toast.success("Report rejected")
            fetchReports()
        } catch (err) {
            toast.error("Action failed")
        }
    }

    const filteredReports = reports.filter(r =>
        r.user.name.toLowerCase().includes(filterName.toLowerCase()) ||
        r.status.toLowerCase().includes(filterName.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search by name or status..."
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="max-w-md"
                />
                <Button variant="ghost" onClick={fetchReports} title="Refresh">
                    <Loader2 className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 rounded-xl bg-muted/40 animate-pulse" />
                    ))}
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/30">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-2" />
                    <h3 className="text-lg font-medium text-muted-foreground">No reports found</h3>
                    <p className="text-sm text-muted-foreground/70">Team reports will appear here once submitted.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredReports.map((report) => (
                        <TeamReportCard
                            key={report.id}
                            report={report}
                            onApprove={(e) => handleApprove(report.id, e)}
                            onReject={(e) => handleReject(report.id, e)}
                            isDark={isDark}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

function TeamReportCard({ report, onApprove, onReject, isDark }: { report: WorkerReport, onApprove: (e: any) => void, onReject: (e: any) => void, isDark: boolean }) {
    const [expanded, setExpanded] = useState(false)

    const statusColors: Record<string, string> = {
        'SUBMITTED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        'APPROVED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        'REJECTED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    }

    return (
        <Card className={cn(
            "transition-all duration-200 hover:shadow-md cursor-pointer",
            expanded ? "ring-2 ring-primary/20" : ""
        )} onClick={() => setExpanded(!expanded)}>
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm transition-all",
                            isDark ? "bg-[#C0FF00] text-black" : "bg-indigo-600 text-white"
                        )}>
                            {report.user.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className={cn("font-bold text-lg tracking-tight", isDark ? "text-white" : "text-slate-900")}>{report.user.name}</h3>
                            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                <span className={isDark ? "text-[#C0FF00]/60" : "text-indigo-600/60"}>{format(new Date(report.date), 'MMM d, yyyy')}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {report.hoursWorked}h</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge variant="secondary" className={cn("capitalize px-3 py-1 font-bold tracking-tight border-0", statusColors[report.status] || "")}>
                            {report.status.toLowerCase()}
                        </Badge>
                        {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                    </div>
                </div>

                {expanded && (
                    <div className="mt-6 space-y-6 border-t pt-6 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" /> Accomplishments
                                </h4>
                                <div className="p-4 bg-muted/30 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                                    {report.accomplishments}
                                </div>
                            </div>

                            {(report.problems || report.tomorrowPlan) && (
                                <div className="space-y-6">
                                    {report.problems && (
                                        <div>
                                            <h4 className="text-sm font-semibold uppercase tracking-wider text-red-500/80 mb-3 flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" /> Blockers / Issues
                                            </h4>
                                            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg text-sm leading-relaxed text-red-800 dark:text-red-300">
                                                {report.problems}
                                            </div>
                                        </div>
                                    )}

                                    {report.tomorrowPlan && (
                                        <div>
                                            <h4 className="text-sm font-semibold uppercase tracking-wider text-blue-500/80 mb-3 flex items-center gap-2">
                                                <Clock className="h-4 w-4" /> Next Steps / Plans
                                            </h4>
                                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg text-sm leading-relaxed text-blue-800 dark:text-blue-300">
                                                {report.tomorrowPlan}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {report.tasks && report.tasks.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Tasks Involved</h4>
                                <div className="flex flex-wrap gap-2">
                                    {report.tasks.map(t => (
                                        <Badge key={t.id} variant="outline" className="px-3 py-1.5 bg-background">
                                            {t.title}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {report.status === 'SUBMITTED' && (
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                    onClick={onReject}
                                >
                                    <XCircle className="h-4 w-4 mr-2" /> Reject
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={onApprove}
                                >
                                    <Check className="h-4 w-4 mr-2" /> Approve
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    )
}
