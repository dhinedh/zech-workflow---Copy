
"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import api from "@/lib/api"
import {
    Clock,
    Calendar as CalendarIcon,
    LogIn,
    LogOut,
    Coffee,
    History,
    TrendingUp,
    AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"

// Mock data types
interface AttendanceLog {
    id: string;
    date: Date;
    type: 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_START' | 'BREAK_END';
    time: string;
    location?: string;
}

export default function AttendancePage() {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [currentTime, setCurrentTime] = useState(new Date())
    const [isCheckedIn, setIsCheckedIn] = useState(false)
    const [isOnBreak, setIsOnBreak] = useState(false)
    const [logs, setLogs] = useState<AttendanceLog[]>([])
    const [workingHours, setWorkingHours] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [attendanceRecord, setAttendanceRecord] = useState<any>(null)

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
            if (isCheckedIn && !isOnBreak) {
                setWorkingHours(prev => prev + 1)
            }
        }, 1000)
        return () => clearInterval(timer)
    }, [isCheckedIn, isOnBreak])

    const handleCheckIn = async () => {
        try {
            const response = await api.post('/attendance/check-in')
            if (response.data.success) {
                setIsCheckedIn(true)
                setAttendanceRecord(response.data.data)
                fetchAttendance()
            }
        } catch (error) {
            console.error('Failed to clock in:', error)
        }
    }

    const handleCheckOut = async () => {
        try {
            const response = await api.post('/attendance/check-out')
            if (response.data.success) {
                setIsCheckedIn(false)
                setAttendanceRecord(response.data.data)
                fetchAttendance()
            }
        } catch (error) {
            console.error('Failed to clock out:', error)
        }
    }

    const fetchAttendance = async () => {
        try {
            const response = await api.get('/attendance')
            if (response.data.success) {
                const fetchedRecords = response.data.data
                const today = new Date()
                today.setHours(0, 0, 0, 0)

                const todayRecord = fetchedRecords.find((r: any) => new Date(r.date).getTime() === today.getTime())

                if (todayRecord) {
                    setAttendanceRecord(todayRecord)
                    setIsCheckedIn(!!todayRecord.checkInTime && !todayRecord.checkOutTime)

                    // Calculate working hours if checked in
                    if (todayRecord.checkInTime && !todayRecord.checkOutTime) {
                        const start = new Date(todayRecord.checkInTime).getTime()
                        const now = new Date().getTime()
                        setWorkingHours(Math.floor((now - start) / 1000))
                    } else if (todayRecord.totalHours) {
                        setWorkingHours(Math.floor(todayRecord.totalHours * 3600))
                    }
                }

                // Map to logs for display
                const mappedLogs: AttendanceLog[] = fetchedRecords.map((r: any) => ({
                    id: r.id,
                    date: new Date(r.date),
                    type: r.checkOutTime ? 'CHECK_OUT' : 'CHECK_IN',
                    time: format(new Date(r.checkInTime), 'hh:mm a'),
                    location: r.workType
                }))
                setLogs(mappedLogs)
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAttendance()
    }, [])

    const handleBreakToggle = () => {
        // Break logic remains mock for now as backend doesn't support it yet
        setIsOnBreak(!isOnBreak)
    }

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    return (
        <div className={cn("space-y-6 container mx-auto p-4 max-w-6xl")}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>Attendance</h1>
                    <p className={cn("mt-1 transition-colors", isDark ? "text-gray-400" : "text-muted-foreground")}>Track your daily attendance and work hours.</p>
                </div>
                <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl transition-all shadow-sm border", isDark ? "bg-[#1c1c1c] border-white/10 text-[#C0FF00]" : "bg-white border-slate-200 text-gray-900")}>
                    <CalendarIcon className={cn("h-5 w-5", isDark ? "text-[#C0FF00]" : "text-gray-500")} />
                    <span className="font-semibold">{format(currentTime, 'EEEE, MMMM d, yyyy')}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Clock Card */}
                <Card className={cn("md:col-span-2 shadow-xl transition-all duration-300 border-t-4", isDark ? "bg-[#1c1c1c] border-white/10 border-t-[#C0FF00]" : "bg-white border-t-indigo-600")}>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span className={cn("font-bold", isDark ? "text-white" : "text-slate-900")}>Attendance Session</span>
                            <Badge variant={isCheckedIn ? "default" : "secondary"} className={cn(
                                "font-semibold px-3 py-1",
                                isCheckedIn ? (isDark ? "bg-[#C0FF00] text-black" : "bg-green-500 hover:bg-green-600") :
                                    (isDark ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-600")
                            )}>
                                {isCheckedIn ? (isOnBreak ? "On Break" : "In Progress") : "Inactive"}
                            </Badge>
                        </CardTitle>
                        <CardDescription className={isDark ? "text-gray-400" : ""}>
                            {isCheckedIn
                                ? "Your session is currently active and being tracked."
                                : "Click the clock in button to start your work day."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">

                        <div className="flex flex-col items-center justify-center py-6 space-y-4">
                            <div className={cn("text-7xl font-mono font-bold tracking-tight tabular-nums transition-colors drop-shadow-sm", isDark ? "text-[#C0FF00]" : "text-slate-900")}>
                                {format(currentTime, 'HH:mm:ss')}
                            </div>
                            <div className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors px-4 py-1.5 rounded-full", isDark ? "text-gray-500 bg-white/5" : "text-slate-500 bg-slate-50")}>
                                {Intl.DateTimeFormat().resolvedOptions().timeZone}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {!isCheckedIn ? (
                                <Button
                                    size="lg"
                                    className={cn(
                                        "w-full h-16 text-lg font-bold tracking-tight transition-all hover:scale-[1.01] active:scale-95 shadow-lg",
                                        isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "bg-green-600 hover:bg-green-700 shadow-md"
                                    )}
                                    onClick={handleCheckIn}
                                >
                                    <LogIn className="mr-2 h-5 w-5" /> Clock In
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    className={cn(
                                        "w-full h-16 text-lg font-bold tracking-tight transition-all hover:scale-[1.01] active:scale-95 shadow-lg text-white",
                                        isDark ? "bg-rose-500 hover:bg-rose-600" : "bg-rose-600 hover:bg-rose-700 shadow-md"
                                    )}
                                    onClick={handleCheckOut}
                                >
                                    <LogOut className="mr-2 h-5 w-5" /> Clock Out
                                </Button>
                            )}

                            <Button
                                size="lg"
                                variant="outline"
                                className={cn(
                                    "w-full h-16 text-lg font-bold tracking-tight border-2 transition-all hover:scale-[1.01] active:scale-95 shadow-sm",
                                    isOnBreak
                                        ? (isDark ? "bg-amber-500/10 border-amber-500 text-amber-500" : "bg-amber-50 border-amber-200 text-amber-700")
                                        : (isDark ? "border-white/10 text-white hover:bg-white/5" : "border-slate-200 hover:bg-slate-50")
                                )}
                                onClick={handleBreakToggle}
                                disabled={!isCheckedIn}
                            >
                                <Coffee className="mr-2 h-5 w-5" /> {isOnBreak ? "Resume Work" : "Take Break"}
                            </Button>
                        </div>

                        {isCheckedIn && (
                            <div className={cn(
                                "rounded-xl p-5 flex justify-between items-center animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-inner",
                                isDark ? "bg-white/5 border border-white/10" : "bg-indigo-50/50 border border-indigo-100"
                            )}>
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-3 rounded-full shadow-sm", isDark ? "bg-[#C0FF00]/10 text-[#C0FF00]" : "bg-indigo-100 text-indigo-600")}>
                                        <History className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className={cn("text-[10px] font-bold uppercase tracking-widest", isDark ? "text-[#C0FF00]" : "text-indigo-900")}>Total Working Hours</p>
                                        <p className={cn("text-[9px] font-medium", isDark ? "text-gray-500" : "text-indigo-600/70")}>Tracking session in real-time</p>
                                    </div>
                                </div>
                                <div className={cn("text-3xl font-mono font-bold tabular-nums transition-colors drop-shadow-sm", isDark ? "text-white" : "text-indigo-700")}>
                                    {formatDuration(workingHours)}
                                </div>
                            </div>
                        )}

                    </CardContent>
                </Card>

                {/* Stats / Summary Column */}
                <div className="space-y-6">

                    {/* Weekly Goals */}
                    <Card className={cn(isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white")}>
                        <CardHeader className="pb-2">
                            <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider flex items-center gap-2", isDark ? "text-gray-400" : "text-slate-500")}>
                                <TrendingUp className={cn("h-4 w-4", isDark ? "text-[#C0FF00]" : "text-indigo-600")} /> Weekly Goals
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>28.5 <span className="text-xs text-gray-400 font-normal">/ 40.0 hrs</span></span>
                                    <span className={cn("font-bold text-sm", isDark ? "text-[#C0FF00]" : "text-indigo-600")}>70%</span>
                                </div>
                                <div className={cn("h-2 rounded-full overflow-hidden", isDark ? "bg-white/5" : "bg-slate-100")}>
                                    <div
                                        className={cn("h-full transition-all duration-1000 ease-out", isDark ? "bg-[#C0FF00]" : "bg-indigo-600")}
                                        style={{ width: '70%' }}
                                    />
                                </div>
                                <p className={cn("text-xs leading-relaxed transition-colors", isDark ? "text-gray-500" : "text-slate-500")}>
                                    You are on track to meet your weekly goal. Keep it up!
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Today's Summary */}
                    <Card className={cn(isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white")}>
                        <CardHeader className="pb-2">
                            <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-gray-400" : "text-slate-500")}>Daily Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className={cn("flex justify-between items-center py-3 border-b transition-colors", isDark ? "border-white/5" : "border-slate-100")}>
                                <span className={cn("text-xs font-medium text-gray-500")}>Clock In</span>
                                <span className={cn("font-bold", isDark ? "text-[#C0FF00]" : "text-slate-900")}>
                                    {attendanceRecord?.checkInTime ? format(new Date(attendanceRecord.checkInTime), 'hh:mm a') : '--:--'}
                                </span>
                            </div>
                            <div className={cn("flex justify-between items-center py-3 border-b transition-colors", isDark ? "border-white/5" : "border-slate-100")}>
                                <span className={cn("text-xs font-medium text-gray-500")}>Clock Out</span>
                                <span className={cn("font-bold", isDark ? "text-gray-600" : "text-slate-300")}>
                                    {attendanceRecord?.checkOutTime ? format(new Date(attendanceRecord.checkOutTime), 'hh:mm a') : '--:--'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className={cn("text-xs font-medium text-gray-500")}>Total Work Today</span>
                                <span className={cn("font-bold", isDark ? "text-white" : "text-slate-900")}>
                                    {attendanceRecord?.totalHours ? `${attendanceRecord.totalHours} hrs` : '--'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Note */}
                    <div className={cn(
                        "p-5 rounded-xl border transition-all duration-300 flex items-start gap-3",
                        isDark ? "bg-amber-500/5 border-amber-500/20 text-amber-500/80" : "bg-amber-50 border-amber-200 text-amber-800"
                    )}>
                        <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                        <p className="text-xs font-medium leading-relaxed">
                            Reminder: Please ensure you clock out before leaving for the day.
                        </p>
                    </div>

                </div>
            </div>

            {/* Activity History */}
            <Card className={cn(isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white")}>
                <CardHeader>
                    <CardTitle className={cn("font-bold", isDark ? "text-white" : "text-slate-900")}>Activity History</CardTitle>
                    <CardDescription className={isDark ? "text-gray-400" : ""}>View your attendance logs for the current week.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className={cn("rounded-xl border overflow-hidden", isDark ? "border-white/10" : "border-slate-200")}>
                        <table className="w-full text-sm text-left">
                            <thead className={cn("transition-colors", isDark ? "bg-white/5 text-gray-400" : "bg-slate-50 text-slate-500")}>
                                <tr>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Date</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Activity</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Time</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Location</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px] text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className={cn("divide-y transition-colors", isDark ? "divide-white/5" : "divide-gray-100")}>
                                {logs.map((log) => (
                                    <tr key={log.id} className={cn("transition-colors", isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/50")}>
                                        <td className={cn("px-6 py-4 font-bold", isDark ? "text-gray-300" : "text-slate-900")}>{format(log.date, 'MMM d, yyyy')}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {log.type === 'CHECK_IN' && <LogIn className={cn("h-4 w-4", isDark ? "text-[#C0FF00]" : "text-green-500")} />}
                                                {log.type === 'CHECK_OUT' && <LogOut className={cn("h-4 w-4", isDark ? "text-rose-500" : "text-rose-600")} />}
                                                {(log.type === 'BREAK_START' || log.type === 'BREAK_END') && <Coffee className={cn("h-4 w-4", isDark ? "text-amber-500" : "text-amber-600")} />}
                                                <span className={cn("font-semibold text-[11px]", isDark ? "text-white" : "text-slate-700")}>{log.type.replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td className={cn("px-6 py-4 font-mono tabular-nums", isDark ? "text-[#C0FF00]/80" : "text-slate-600")}>{log.time}</td>
                                        <td className={cn("px-6 py-4 font-medium", isDark ? "text-gray-500" : "text-slate-500")}>{log.location}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Badge variant="outline" className={cn("text-[10px] font-bold py-0.5 px-3 border-0 rounded-full", isDark ? "bg-[#C0FF00]/10 text-[#C0FF00]" : "bg-indigo-50 text-indigo-600")}>
                                                Verified
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-semibold text-sm">
                                            No activity logs for this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
