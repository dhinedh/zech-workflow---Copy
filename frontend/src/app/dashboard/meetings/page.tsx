
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Link as LinkIcon, Clock, Users, Video, Plus, Copy, ExternalLink, Loader2 } from "lucide-react"
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
} from "@/components/ui/form"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { useTheme } from "@/context/ThemeContext"

const meetingSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    date: z.date(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    duration: z.number().min(15, "Minimum 15 mins"),
    meetingLink: z.string().url("Invalid URL").min(1, "Link is required"),
})

type MeetingFormValues = z.infer<typeof meetingSchema>

export default function MeetingsPage() {
    const { user } = useAuthStore()
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [meetings, setMeetings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const form = useForm<MeetingFormValues>({
        resolver: zodResolver(meetingSchema),
        defaultValues: {
            title: "",
            description: "",
            date: new Date(),
            startTime: "10:00",
            duration: 30,
            meetingLink: "",
        },
    })

    const fetchMeetings = async () => {
        try {
            const response = await api.get('/meetings')
            if (response.data.success) {
                setMeetings(response.data.data)
            }
        } catch (error) {
            console.error('Failed to fetch meetings:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMeetings()
    }, [])

    const onSubmit = async (data: MeetingFormValues) => {
        setSubmitting(true)
        try {
            const startDateTime = new Date(data.date)
            const [hours, minutes] = data.startTime.split(':').map(Number)
            startDateTime.setHours(hours, minutes)
            const endDateTime = new Date(startDateTime.getTime() + data.duration * 60000)

            const response = await api.post('/meetings', {
                title: data.title,
                description: data.description,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                meetingLink: data.meetingLink,
                meetingType: 'TEAM_MEETING' // Default to TEAM_MEETING
            })

            if (response.data.success) {
                setMeetings([response.data.data, ...meetings])
                setIsDialogOpen(false)
                form.reset()
            }
        } catch (error) {
            console.error('Failed to schedule meeting:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    return (
        <div className={cn("space-y-8 max-w-6xl mx-auto")}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>Team Meetings</h2>
                    <p className={cn("mt-1 transition-colors", isDark ? "text-gray-400" : "text-muted-foreground")}>
                        Schedule and join upcoming team discussions.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className={cn("font-bold tracking-tight transition-all shadow-lg", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00] active:scale-95" : "bg-indigo-600 hover:bg-indigo-700")}>
                            <Plus className="mr-2 h-4 w-4" /> Schedule New Meeting
                        </Button>
                    </DialogTrigger>
                    <DialogContent className={cn("sm:max-w-[500px]", isDark ? "bg-[#1c1c1c] border-white/10" : "")}>
                        <DialogHeader>
                            <DialogTitle className={cn(isDark ? "text-white font-bold tracking-tight" : "")}>Schedule Meeting</DialogTitle>
                            <DialogDescription className={isDark ? "text-gray-400" : ""}>
                                Create a new meeting invite for your team.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={isDark ? "text-gray-400 font-semibold uppercase text-[10px] tracking-wider" : ""}>Meeting Subject</FormLabel>
                                            <FormControl>
                                                <Input className={isDark ? "bg-white/5 border-white/10 text-white focus-visible:ring-[#C0FF00]/50" : ""} placeholder="e.g. Project Update Sync" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className={isDark ? "text-gray-400 font-semibold uppercase text-[10px] tracking-wider" : ""}>Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal transition-all",
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
                                                    <PopoverContent className={cn("w-auto p-0", isDark ? "bg-[#1c1c1c] border-white/10" : "")} align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date: Date) =>
                                                                date < new Date(new Date().setHours(0, 0, 0, 0))
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex gap-2">
                                        <FormField
                                            control={form.control}
                                            name="startTime"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel className={isDark ? "text-gray-400 font-semibold uppercase text-[10px] tracking-wider" : ""}>Start Time</FormLabel>
                                                    <FormControl>
                                                        <Input type="time" className={isDark ? "bg-white/5 border-white/10 text-white focus-visible:ring-[#C0FF00]/50" : ""} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="duration"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel className={isDark ? "text-gray-400 font-semibold uppercase text-[10px] tracking-wider" : ""}>Duration (min)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            className={isDark ? "bg-white/5 border-white/10 text-white focus-visible:ring-[#C0FF00]/50" : ""}
                                                            {...field}
                                                            value={Number.isNaN(field.value) ? '' : field.value}
                                                            onChange={e => field.onChange(e.target.valueAsNumber)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="meetingLink"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={isDark ? "text-gray-400 font-semibold uppercase text-[10px] tracking-wider" : ""}>Meeting Link (URL)</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Video className={cn("absolute left-3 top-2.5 h-4 w-4", isDark ? "text-[#C0FF00]" : "text-muted-foreground")} />
                                                    <Input placeholder="https://meet.google.com/..." className={cn("pl-9", isDark ? "bg-white/5 border-white/10 text-white focus-visible:ring-[#C0FF00]/50" : "")} {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={isDark ? "text-gray-400 font-semibold uppercase text-[10px] tracking-wider" : ""}>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="What's this meeting about?"
                                                    className={cn("resize-none transition-all", isDark ? "bg-white/5 border-white/10 text-white focus-visible:ring-[#C0FF00]/50" : "")}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button type="submit" disabled={submitting} className={cn("w-full transition-all font-bold tracking-tight shadow-lg", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "bg-indigo-600 hover:bg-indigo-700")}>
                                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Schedule Meeting
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center py-24">
                    <Loader2 className={cn("h-10 w-10 animate-spin", isDark ? "text-[#C0FF00]" : "text-indigo-600")} />
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {meetings.length === 0 ? (
                        <div className={cn(
                            "col-span-full text-center py-20 rounded-2xl border border-dashed transition-all",
                            isDark ? "bg-white/2 border-white/10" : "bg-white border-gray-200"
                        )}>
                            <div className={cn("h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6", isDark ? "bg-[#C0FF00]/10" : "bg-indigo-50")}>
                                <Video className={cn("h-10 w-10", isDark ? "text-[#C0FF00]" : "text-indigo-600")} />
                            </div>
                            <h3 className={cn("text-xl font-bold tracking-tight", isDark ? "text-white" : "text-gray-900")}>No upcoming meetings</h3>
                            <p className={cn("mt-2 transition-colors", isDark ? "text-gray-400" : "text-gray-500")}>You have no meetings scheduled at the moment.</p>
                        </div>
                    ) : (
                        meetings.map((meeting) => (
                            <Card key={meeting.id} className={cn(
                                "group hover:scale-[1.02] transition-all duration-300 border-l-4 relative overflow-hidden",
                                isDark
                                    ? "bg-[#080808] border-white/5 border-l-[#C0FF00] shadow-xl hover:border-[#C0FF00]/30"
                                    : "bg-white hover:shadow-md border-l-indigo-500"
                            )}>
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <Badge className={cn(
                                            "font-bold tracking-wider text-[10px] px-3 py-1 border-0 rounded-full uppercase",
                                            isDark ? "bg-[#C0FF00]/10 text-[#C0FF00]" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                        )}>
                                            {meeting.meetingType?.replace('_', ' ') || 'TEAM SYNC'}
                                        </Badge>
                                        {meeting.organizer?.name && (
                                            <div className="flex items-center text-[10px] font-semibold uppercase tracking-wider text-gray-400" title={`Organizer: ${meeting.organizer.name}`}>
                                                <span className="mr-2">Hosted by {meeting.organizer.name.split(' ')[0]}</span>
                                                <div className={cn(
                                                    "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors shadow-sm",
                                                    isDark ? "bg-[#C0FF00] text-black border-transparent" : "bg-indigo-100 text-indigo-700 border-white"
                                                )}>
                                                    {meeting.organizer.name.charAt(0)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <CardTitle className={cn("text-xl font-bold tracking-tight transition-colors leading-tight", isDark ? "text-white group-hover:text-[#C0FF00]" : "text-slate-900")}>{meeting.title}</CardTitle>
                                    <CardDescription className={cn("flex items-center gap-2 mt-2 font-medium transition-colors", isDark ? "text-gray-400" : "text-slate-500")}>
                                        <Clock className={cn("h-4 w-4", isDark ? "text-[#C0FF00]" : "text-indigo-500")} />
                                        {format(new Date(meeting.startTime), 'MMM d, h:mm a')} - {format(new Date(meeting.endTime), 'h:mm a')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-5">
                                    {meeting.description && (
                                        <p className={cn("text-sm line-clamp-2 min-h-[3em] mb-6 transition-colors", isDark ? "text-gray-400 font-light" : "text-gray-600")}>
                                            {meeting.description}
                                        </p>
                                    )}
                                    <div className={cn(
                                        "p-3 rounded-xl flex items-center justify-between border transition-all",
                                        isDark ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-200"
                                    )}>
                                        <div className="flex items-center gap-3 truncate max-w-[80%]">
                                            <LinkIcon className={cn("h-4 w-4 shrink-0", isDark ? "text-[#C0FF00]/60" : "text-gray-400")} />
                                            <span className={cn("text-[10px] font-mono truncate", isDark ? "text-gray-500" : "text-gray-500")}>{meeting.meetingLink}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn("h-8 w-8 transition-colors", isDark ? "text-gray-500 hover:text-[#C0FF00] hover:bg-white/5" : "text-gray-400 hover:text-indigo-600")}
                                            onClick={() => copyToClipboard(meeting.meetingLink)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2">
                                    <Button asChild className={cn(
                                        "w-full font-bold tracking-tight h-11 transition-all shadow-md",
                                        isDark ? "bg-white text-black hover:bg-[#C0FF00] active:scale-95" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                    )}>
                                        <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                                            Join Meeting <ExternalLink className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
