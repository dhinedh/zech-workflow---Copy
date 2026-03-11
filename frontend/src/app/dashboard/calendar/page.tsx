
"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format, isSameDay } from "date-fns"
import { Plus, Clock, Video, CheckSquare, MapPin, Calendar as CalendarIcon } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import { cn } from "@/lib/utils"

// Types for Calendar Events
interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    type: 'MEETING' | 'TASK' | 'DEADLINE' | 'HOLIDAY';
    time?: string;
    location?: string; // or link
    description?: string;
}

export default function CalendarPage() {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [date, setDate] = useState<Date | undefined>(new Date())

    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true)
            try {
                const [meetingsRes, tasksRes] = await Promise.all([
                    api.get('/meetings'),
                    api.get('/tasks')
                ])

                const calendarEvents: CalendarEvent[] = []

                if (meetingsRes.data.success) {
                    meetingsRes.data.data.forEach((m: any) => {
                        calendarEvents.push({
                            id: `m-${m.id}`,
                            title: m.title,
                            date: new Date(m.startTime),
                            type: 'MEETING',
                            time: format(new Date(m.startTime), 'hh:mm a'),
                            location: m.location || 'Online'
                        })
                    })
                }

                if (tasksRes.data.success) {
                    tasksRes.data.data.forEach((t: any) => {
                        calendarEvents.push({
                            id: `t-${t.id}`,
                            title: t.title,
                            date: new Date(t.dueDate || t.createdAt),
                            type: t.priority === 'URGENT' ? 'DEADLINE' : 'TASK',
                            time: t.dueDate ? format(new Date(t.dueDate), 'hh:mm a') : 'All Day',
                            description: t.description
                        })
                    })
                }

                setEvents(calendarEvents)
            } catch (error) {
                console.error('Failed to fetch events:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchEvents()
    }, [])

    const selectedDateEvents = events.filter(event => date && isSameDay(event.date, date))

    const getEventColor = (type: string) => {
        if (isDark) {
            switch (type) {
                case 'MEETING': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
                case 'DEADLINE': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                case 'TASK': return 'bg-[#C0FF00]/10 text-[#C0FF00] border-[#C0FF00]/20';
                case 'HOLIDAY': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                default: return 'bg-white/5 text-gray-400';
            }
        }
        switch (type) {
            case 'MEETING': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'DEADLINE': return 'bg-red-100 text-red-700 border-red-200';
            case 'TASK': return 'bg-green-100 text-green-700 border-green-200';
            case 'HOLIDAY': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    }

    return (
        <div className={cn("space-y-6 container mx-auto p-4 max-w-6xl")}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>Calendar</h1>
                    <p className={cn("mt-1 transition-colors", isDark ? "text-gray-400" : "text-muted-foreground")}>Manage your schedule, meetings, and deadlines.</p>
                </div>
                <Button className={cn("font-bold transition-all shadow-sm", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "bg-indigo-600 hover:bg-indigo-700")}>
                    <Plus className="mr-2 h-4 w-4" /> Add Event
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Calendar View */}
                <Card className={cn(
                    "md:col-span-8 shadow-xl transition-all duration-300",
                    isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200"
                )}>
                    <CardHeader className={cn("border-b", isDark ? "border-white/10" : "border-slate-100")}>
                        <CardTitle className={cn("font-bold", isDark ? "text-white" : "text-slate-900")}>Event Calendar</CardTitle>
                        <CardDescription className={isDark ? "text-gray-400" : ""}>Select a date to view your scheduled activities.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center p-8">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className={cn(
                                "rounded-xl border shadow-lg transition-all",
                                isDark ? "bg-black/20 border-white/10 text-white" : "bg-white border-slate-200"
                            )}
                            modifiers={{
                                event: (date) => events.some(e => isSameDay(e.date, date))
                            }}
                            modifiersClassNames={{
                                event: isDark ? "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[#C0FF00] after:rounded-full" : "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-indigo-600 after:rounded-full"
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Agenda / Events List for Selected Date */}
                <Card className={cn(
                    "md:col-span-4 h-full border-l-4 shadow-xl transition-all duration-300 overflow-hidden",
                    isDark ? "bg-[#1c1c1c] border-white/10 border-l-[#C0FF00]" : "bg-white border-l-indigo-600 border-slate-200"
                )}>
                    <CardHeader className={cn("border-b py-6", isDark ? "bg-white/5 border-white/10" : "bg-slate-50/50 border-slate-100")}>
                        <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider flex items-center gap-3", isDark ? "text-gray-400" : "text-slate-500")}>
                            Agenda
                            <Badge variant="outline" className={cn(
                                "ml-auto font-bold text-[10px] py-0.5 px-3 uppercase border-0 rounded-full transition-all",
                                isDark ? "bg-[#C0FF00] text-black" : "bg-white text-indigo-700 shadow-sm"
                            )}>
                                {date ? format(date, 'MMM d, yyyy') : 'Select Date'}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {selectedDateEvents.length > 0 ? (
                            <div className={cn("divide-y transition-colors", isDark ? "divide-white/10" : "divide-slate-100")}>
                                {selectedDateEvents.map(event => (
                                    <div key={event.id} className={cn("p-5 transition-all group", isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/50")}>
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className={cn("font-bold text-lg transition-colors leading-tight", isDark ? "text-white group-hover:text-[#C0FF00]" : "text-slate-900 group-hover:text-indigo-600")}>{event.title}</h4>
                                            <Badge className={cn("text-[9px] font-bold tracking-wider uppercase border-0 rounded-full px-2.5 py-0.5", getEventColor(event.type))}>
                                                {event.type}
                                            </Badge>
                                        </div>

                                        <div className={cn("space-y-2 text-xs font-medium transition-colors", isDark ? "text-gray-500" : "text-slate-500")}>
                                            {event.time && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className={cn("h-4 w-4", isDark ? "text-gray-600" : "text-indigo-500")} />
                                                    <span className={isDark ? "text-gray-400" : ""}>{event.time}</span>
                                                </div>
                                            )}
                                            {event.location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className={cn("h-4 w-4", isDark ? "text-gray-600" : "text-slate-400")} />
                                                    <span className={isDark ? "text-gray-400" : ""}>{event.location}</span>
                                                </div>
                                            )}
                                            {event.description && (
                                                <p className={cn("mt-4 text-sm font-normal leading-relaxed transition-colors", isDark ? "text-gray-500 group-hover:text-gray-400" : "text-slate-600")}>
                                                    {event.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center p-8">
                                <div className={cn("h-20 w-20 rounded-full flex items-center justify-center mb-6 transition-all", isDark ? "bg-white/5 border border-white/10" : "bg-slate-50")}>
                                    <CalendarIcon className={cn("h-10 w-10 transition-colors", isDark ? "text-gray-800" : "text-slate-200")} />
                                </div>
                                <p className={cn("font-bold text-sm", isDark ? "text-gray-400" : "text-slate-600")}>No Scheduled Events</p>
                                <p className={cn("text-xs mt-2 text-gray-500 max-w-[200px] leading-relaxed transition-colors", isDark ? "text-gray-600" : "text-slate-400")}>There are no events scheduled for this day.</p>
                                <Button variant="link" className={cn("mt-6 h-auto p-0 font-bold text-sm", isDark ? "text-[#C0FF00] hover:text-[#b0eb00]" : "text-indigo-600")}>
                                    <Plus className="h-4 w-4 mr-2" /> Create Event
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
