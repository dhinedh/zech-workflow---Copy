
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { useTheme } from "@/context/ThemeContext"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Loader2,
    Camera,
    Video,
    Check,
    ChevronRight,
    ChevronLeft,
    Bell,
    Clock,
    Moon,
    Monitor,
    LayoutDashboard,
    ListTodo,
    BarChart3,
    MessageCircle,
    PartyPopper,
    ExternalLink,
    Play
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function OnboardingSetup() {
    const router = useRouter()
    const { user } = useAuthStore()
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [step, setStep] = useState(1) // 1: Profile, 2: Preferences, 3: Tour, 4: Done
    const [isLoading, setIsLoading] = useState(false)
    const [tourStep, setTourStep] = useState(1) // 1-5 for tour tips

    // Form states
    const [profile, setProfile] = useState({
        bio: "",
        emergencyContactName: "Jane Doe",
        emergencyContactRelation: "Spouse",
        emergencyContactPhone: "+91 98765 00000",
        skills: ["Node.js", "React", "MongoDB", "AWS"],
        newSkill: ""
    })

    const [prefs, setPrefs] = useState({
        emailNotifications: true,
        inAppNotifications: true,
        smsNotifications: false,
        notifyTasks: true,
        notifyReports: true,
        notifyMeetings: true,
        notifyMessages: true,
        notifyProjectUpdates: false,
        workingHoursStart: "09:00 AM",
        workingHoursEnd: "06:00 PM",
        timezone: "Asia/Kolkata (IST)",
        dndEnabled: false
    })

    const handleAddSkill = () => {
        if (profile.newSkill && !profile.skills.includes(profile.newSkill)) {
            setProfile({ ...profile, skills: [...profile.skills, profile.newSkill], newSkill: "" })
        }
    }

    const removeSkill = (skill: string) => {
        setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) })
    }

    const handleSaveProfile = async () => {
        setIsLoading(true)
        try {
            await api.put("/auth/profile", {
                bio: profile.bio,
                emergencyContactName: profile.emergencyContactName,
                emergencyContactRelation: profile.emergencyContactRelation,
                emergencyContactPhone: profile.emergencyContactPhone,
                skills: profile.skills
            })
            setStep(2)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSavePrefs = async () => {
        setIsLoading(true)
        try {
            await api.put("/auth/profile", prefs)
            setStep(3)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const renderProgress = () => (
        <div className={cn(
            "border rounded-2xl p-6 mb-8 transition-all duration-500",
            isDark ? "bg-[#080808] border-white/5 shadow-2xl" : "bg-white border-gray-100 shadow-sm"
        )}>
            <div className="flex justify-between items-center mb-6">
                <h3 className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isDark ? "text-gray-500" : "text-gray-400")}>ONBOARDING_PROGRESS</h3>
                <div className="flex gap-4">
                    <Button variant="ghost" size="sm" onClick={() => setStep(4)} className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isDark ? "text-gray-700 hover:text-white" : "text-gray-400 hover:text-gray-600")}>
                        SKIP_TOUR // 0%
                    </Button>
                    <div className={cn("flex items-center gap-2 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full transition-all", isDark ? "text-[#C0FF00] bg-[#C0FF00]/10" : "text-green-600 bg-green-50")}>
                        {step === 4 ? <Check size={12} strokeWidth={3} /> : null}
                        {step === 4 ? "COMPLETE" : `${Math.round((step / 4) * 100)}%`}
                    </div>
                </div>
            </div>
            <div className="relative pt-2">
                <div className={cn("absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 rounded-full transition-colors", isDark ? "bg-white/5" : "bg-gray-100")}></div>
                <div
                    className={cn("absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full transition-all duration-700", isDark ? "bg-[#C0FF00] shadow-[0_0_15px_rgba(192,255,0,0.5)]" : "bg-blue-600")}
                    style={{ width: `${((step - 1) / 3) * 100}%` }}
                ></div>
                <div className="flex justify-between relative z-10">
                    {['Profile', 'Preferences', 'Tour', 'Done'].map((s, i) => (
                        <div key={s} className="flex flex-col items-center">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500",
                                isDark ? "border-[#050505]" : "border-white shadow-sm",
                                step > i + 1 ? (isDark ? 'bg-[#C0FF00] text-black' : 'bg-green-500 text-white') :
                                    step === i + 1 ? (isDark ? 'bg-white text-black' : 'bg-blue-600 text-white') :
                                        (isDark ? 'bg-[#111] text-transparent' : 'bg-gray-200 text-transparent')
                            )}>
                                {step > i + 1 ? <Check size={20} strokeWidth={3} /> : <div className={cn("w-2.5 h-2.5 rounded-full", step === i + 1 ? "bg-currentColor" : "bg-gray-800")} />}
                            </div>
                            <span className={cn("text-[9px] font-black mt-3 uppercase tracking-widest transition-colors", step === i + 1 ? (isDark ? 'text-white' : 'text-blue-600') : (isDark ? 'text-gray-700' : 'text-gray-400'))}>
                                {s.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    return (
        <div className={cn("min-h-screen transition-colors duration-500 py-16 px-4", isDark ? "bg-[#050505]" : "bg-gray-50")}>
            <div className={cn("max-w-4xl mx-auto", isDark && "font-mono")}>
                <div className="mb-12 text-center space-y-2">
                    <h1 className={cn("text-4xl font-black tracking-tighter transition-colors", isDark ? "text-white" : "text-gray-900")}>
                        {isDark ? "SYSTEM_ACCESS_GRANTED" : "👋 Welcome to Zech WorkFlow"}
                    </h1>
                    <p className={cn("transition-colors max-w-lg mx-auto", isDark ? "text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]" : "text-gray-500 font-medium")}>
                        {isDark ? "INITIALIZE_PROFILE // DEPLOY_PREFERENCES // SYNC_TELEMETRY" : "Let's get you started by setting up your profile and preferences."}
                    </p>
                </div>

                {renderProgress()}

                {/* STEP 1: PROFILE */}
                {step === 1 && (
                    <Card className={cn("border-0 shadow-2xl rounded-3xl overflow-hidden transition-all duration-500", isDark ? "bg-[#080808] border border-white/5" : "bg-white")}>
                        <div className="p-10">
                            <h2 className={cn("text-2xl font-black tracking-tighter mb-2 transition-colors", isDark ? "text-white" : "text-gray-800")}>STEP_01: SYNC_PROFILE</h2>
                            <p className={cn("mb-10 transition-colors", isDark ? "text-gray-600 text-[10px] font-bold uppercase tracking-widest" : "text-gray-500 font-medium")}>Your node has been instantiated. Customize your metadata identity.</p>

                            <div className="space-y-10">
                                {/* Photo */}
                                <div>
                                    <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-6 block transition-colors", isDark ? "text-gray-500" : "text-gray-700")}>IDENTITY_AVATAR</label>
                                    <div className="flex flex-wrap items-center gap-10">
                                        <div className={cn(
                                            "w-36 h-36 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-500",
                                            isDark ? "bg-black border-white/5 text-gray-700" : "bg-gray-50 border-gray-300 text-gray-400 shadow-inner"
                                        )}>
                                            <Camera size={40} />
                                            <span className="text-[9px] font-black mt-3 uppercase tracking-widest">UPLOAD_SLOT</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex gap-3">
                                                <Button size="sm" className={cn("h-11 px-6 font-black tracking-tighter transition-all shadow-xl", isDark ? "bg-[#C0FF00] text-black hover:bg-white" : "bg-blue-600 text-white")} onClick={() => alert("RESOURCE_UPLOAD_PROTOCOL_INITIALIZED")}>
                                                    UPLOAD_RESOURCE
                                                </Button>
                                                <Button size="sm" variant="outline" className={cn("h-11 px-6 font-black tracking-tighter transition-all border-2", isDark ? "border-white/5 text-white hover:bg-white/5" : "border-gray-200")} onClick={() => alert("OPTICAL_CAPTURE_PROTOCOL_INITIALIZED")}>
                                                    <Video size={18} className="mr-2" /> OPTICAL_CAPTURE
                                                </Button>
                                            </div>
                                            <p className={cn("text-[9px] font-black uppercase tracking-widest transition-colors", isDark ? "text-gray-700" : "text-gray-400")}>MAX_PAYLOAD: 5MB // JPG, PNG, WEBP</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-3 block transition-colors", isDark ? "text-gray-500" : "text-gray-700")}>BIOGRAPHIC_DATA_STREAM</label>
                                    <Textarea
                                        placeholder={isDark ? "INPUT_IDENTITY_DESCRIPTION..." : "Tell us about yourself..."}
                                        className={cn(
                                            "h-36 transition-all text-sm leading-relaxed border-2 rounded-2xl",
                                            isDark ? "bg-black border-white/5 text-white focus-visible:ring-[#C0FF00]/50 placeholder:text-gray-800" : "bg-gray-50 border-gray-100 focus:bg-white"
                                        )}
                                        value={profile.bio}
                                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                        maxLength={500}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <span className={cn("text-[8px] font-black uppercase tracking-widest transition-colors", isDark ? "text-gray-800" : "text-gray-400")}>PARSED_BYTES: {profile.bio.length} / 500</span>
                                    </div>
                                </div>

                                {/* Emergency Contact */}
                                <div className="space-y-6">
                                    <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] block transition-colors", isDark ? "text-gray-500" : "text-gray-700")}>FAILSAFE_CONTACT_NODE</label>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {[
                                            { label: 'IDENTIFIER', value: 'emergencyContactName', key: 'name' },
                                            { label: 'RELATION_TYPE', value: 'emergencyContactRelation', key: 'relation', type: 'select' },
                                            { label: 'COMMS_CHANNEL', value: 'emergencyContactPhone', key: 'phone' }
                                        ].map((field) => (
                                            <div key={field.value} className="space-y-2">
                                                <label className={cn("text-[9px] font-black uppercase tracking-widest transition-colors", isDark ? "text-gray-700" : "text-gray-400")}>{field.label}</label>
                                                {field.type === 'select' ? (
                                                    <select
                                                        className={cn(
                                                            "w-full h-12 rounded-xl px-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 transition-all border-2",
                                                            isDark ? "bg-black border-white/5 text-white focus:ring-[#C0FF00]/50" : "bg-gray-50 border-gray-100 focus:ring-blue-500"
                                                        )}
                                                        value={(profile as any)[field.value]}
                                                        onChange={(e) => setProfile({ ...profile, [field.value]: e.target.value })}
                                                    >
                                                        <option>Spouse</option>
                                                        <option>Parent</option>
                                                        <option>Sibling</option>
                                                        <option>Friend</option>
                                                    </select>
                                                ) : (
                                                    <Input
                                                        value={(profile as any)[field.value]}
                                                        onChange={(e) => setProfile({ ...profile, [field.value]: e.target.value })}
                                                        className={cn(
                                                            "h-12 border-2 rounded-xl transition-all",
                                                            isDark ? "bg-black border-white/5 text-white focus-visible:ring-[#C0FF00]/50" : "bg-gray-50 border-gray-100"
                                                        )}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Skills */}
                                <div>
                                    <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-4 block transition-colors", isDark ? "text-gray-500" : "text-gray-700")}>TECHNICAL_CAPABILITIES_ARRAY</label>
                                    <p className={cn("text-[9px] font-black uppercase tracking-widest mb-4 transition-colors", isDark ? "text-[#C0FF00]/60" : "text-gray-400")}>SYSTEM_INHERITED: {profile.skills.join(", ")}</p>
                                    <div className="flex flex-wrap gap-2.5 mb-6">
                                        {profile.skills.map(skill => (
                                            <Badge key={skill} className={cn(
                                                "px-4 py-2 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border transition-all group cursor-default",
                                                isDark ? "bg-white/5 border-white/10 text-white hover:border-[#C0FF00]" : "bg-blue-50 text-blue-700 border-blue-100"
                                            )}>
                                                {skill}
                                                <button onClick={() => removeSkill(skill)} className={cn("transition-colors", isDark ? "text-gray-700 hover:text-[#C0FF00]" : "text-blue-300 hover:text-red-500 text-lg leading-none")}>&times;</button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex gap-3">
                                        <Input
                                            placeholder={isDark ? "INPUT_SKILL_TOKEN..." : "Add more skills..."}
                                            value={profile.newSkill}
                                            onChange={(e) => setProfile({ ...profile, newSkill: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                                            className={cn(
                                                "h-12 border-2 rounded-xl transition-all font-bold",
                                                isDark ? "bg-black border-white/5 text-white focus-visible:ring-[#C0FF00]/50 placeholder:text-gray-800" : "bg-gray-50 border-gray-100"
                                            )}
                                        />
                                        <Button onClick={handleAddSkill} variant="outline" className={cn("border-2 h-12 px-8 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all", isDark ? "border-white/5 text-white hover:bg-[#C0FF00] hover:text-black" : "border-gray-200 text-gray-600")}>
                                            PUSH_SKILL
                                        </Button>
                                    </div>
                                </div>

                                <div className={cn("flex justify-between items-center gap-4 pt-8 border-t transition-colors", isDark ? "border-white/5" : "border-gray-100")}>
                                    <Button variant="ghost" onClick={() => setStep(2)} className={cn("text-[10px] font-black uppercase tracking-[0.3em] transition-all", isDark ? "text-gray-700 hover:text-white" : "text-gray-400")}>SKIP_FOR_NOW</Button>
                                    <Button onClick={handleSaveProfile} disabled={isLoading} className={cn("h-14 px-10 font-black tracking-tighter shadow-2xl transition-all group rounded-2xl", isDark ? "bg-[#C0FF00] text-black hover:bg-white active:scale-95" : "bg-blue-600 hover:bg-blue-700")}>
                                        {isLoading ? <Loader2 className="animate-spin" /> : (
                                            <span className="flex items-center gap-3 text-lg">
                                                COMMIT_AND_PROCEED
                                                <ChevronRight size={22} className="transition-transform group-hover:translate-x-1" />
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* STEP 2: PREFERENCES */}
                {step === 2 && (
                    <Card className={cn("border-0 shadow-2xl rounded-3xl overflow-hidden transition-all duration-500", isDark ? "bg-[#080808] border border-white/5" : "bg-white")}>
                        <div className="p-10">
                            <h2 className={cn("text-2xl font-black tracking-tighter mb-2 transition-colors", isDark ? "text-white" : "text-gray-800")}>STEP_02: CONFIG_PREFERENCES</h2>
                            <p className={cn("mb-10 transition-colors", isDark ? "text-gray-600 text-[10px] font-bold uppercase tracking-widest" : "text-gray-500 font-medium")}>Optimize your interaction threshold and telemetry frequency.</p>

                            <div className="space-y-12">
                                {/* Notification Channels */}
                                <div>
                                    <h3 className={cn("text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3 transition-colors", isDark ? "text-white" : "text-gray-700")}>
                                        <Bell size={18} className={isDark ? "text-[#C0FF00]" : "text-blue-600"} />
                                        COMMUNICATION_CHANNELS
                                    </h3>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {[
                                            { id: 'emailNotifications', label: 'EMAIL_ALERTS', icon: '📧' },
                                            { id: 'inAppNotifications', label: 'SYSTEM_PULSES', icon: '🔔' },
                                            { id: 'smsNotifications', label: 'CELLULAR_LINK', icon: '📱', note: '(CREDIT_REQUIRED)' }
                                        ].map((item) => (
                                            <label key={item.id} className={cn(
                                                "flex flex-col p-6 rounded-2xl border-2 transition-all cursor-pointer group hover:-translate-y-1",
                                                (prefs as any)[item.id]
                                                    ? (isDark ? 'border-[#C0FF00] bg-[#C0FF00]/5 shadow-[0_0_20px_rgba(192,255,0,0.1)]' : 'border-blue-600 bg-blue-50/50')
                                                    : (isDark ? 'border-white/5 bg-black hover:bg-white/5' : 'border-gray-100 bg-gray-50')
                                            )}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className={cn("text-3xl transition-transform group-hover:scale-110", isDark && "filter grayscale brightness-150")}>{item.icon}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={(prefs as any)[item.id]}
                                                        onChange={(e) => setPrefs({ ...prefs, [item.id]: e.target.checked })}
                                                        className={cn("w-6 h-6 rounded border-2 transition-all", isDark ? "bg-black border-white/10 text-[#C0FF00] focus:ring-[#C0FF00]" : "border-gray-300 text-blue-600")}
                                                    />
                                                </div>
                                                <span className={cn("font-black text-xs uppercase tracking-widest transition-colors", (prefs as any)[item.id] ? (isDark ? 'text-[#C0FF00]' : 'text-blue-900') : (isDark ? 'text-gray-600' : 'text-gray-800'))}>{item.label}</span>
                                                {item.note && <span className={cn("text-[8px] font-black mt-2 transition-colors uppercase tracking-[0.22em]", (prefs as any)[item.id] ? (isDark ? 'text-[#C0FF00]/60' : 'text-blue-400') : 'text-gray-600')}>{item.note}</span>}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Notification Types */}
                                <div>
                                    <h3 className={cn("text-[10px] font-black uppercase tracking-[0.25em] mb-4 transition-colors", isDark ? "text-gray-700" : "text-gray-600")}>FILTER_EVENT_TYPES:</h3>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {[
                                            { id: 'notifyTasks', label: 'TASK_NODE_ASSIGNMENTS' },
                                            { id: 'notifyReports', label: 'DAILY_TELEMETRY_REMINDERS' },
                                            { id: 'notifyMeetings', label: 'SYNC_SESSION_ALERTS' },
                                            { id: 'notifyMessages', label: 'PEER_TO_PEER_MESSAGES' },
                                            { id: 'notifyProjectUpdates', label: 'GLOBAL_PROJECT_PULSES' }
                                        ].map((type) => (
                                            <label key={type.id} className={cn(
                                                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group",
                                                (prefs as any)[type.id] ? (isDark ? 'bg-white/5 border-white/10' : 'bg-blue-50 border-blue-100') : (isDark ? 'bg-transparent border-transparent hover:bg-white/2' : 'hover:bg-gray-50 border-transparent')
                                            )}>
                                                <input
                                                    type="checkbox"
                                                    checked={(prefs as any)[type.id]}
                                                    onChange={(e) => setPrefs({ ...prefs, [type.id]: e.target.checked })}
                                                    className={cn("w-5 h-5 rounded border-2 transition-all", isDark ? "bg-black border-white/10 text-[#C0FF00] focus:ring-[#C0FF00]" : "border-gray-300 text-blue-600")}
                                                />
                                                <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", (prefs as any)[type.id] ? (isDark ? 'text-white' : 'text-blue-900') : (isDark ? 'text-gray-700 group-hover:text-white' : 'text-gray-600'))}>{type.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Working Hours */}
                                <div className={cn("p-8 rounded-3xl space-y-8 transition-colors border", isDark ? "bg-white/2 border-white/5" : "bg-blue-50 border-blue-100")}>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                        <div className="space-y-2">
                                            <h3 className={cn("text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3", isDark ? "text-[#C0FF00]" : "text-gray-800")}>
                                                <Clock size={20} className={isDark ? "text-white" : "text-blue-600"} />
                                                TEMPORAL_CYCLE
                                            </h3>
                                            <p className={cn("text-[9px] font-bold uppercase tracking-widest", isDark ? "text-gray-700" : "text-gray-500")}>Configure your operational window for optimized sync.</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="space-y-2">
                                                <span className={cn("text-[8px] font-black uppercase tracking-widest block", isDark ? "text-gray-700" : "text-gray-400")}>CYCLE_START</span>
                                                <select
                                                    className={cn(
                                                        "rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2",
                                                        isDark ? "bg-black text-white border-white/10 focus:ring-[#C0FF00]/50" : "bg-white border-transparent shadow-sm text-gray-700 focus:ring-blue-500"
                                                    )}
                                                    value={prefs.workingHoursStart}
                                                    onChange={(e) => setPrefs({ ...prefs, workingHoursStart: e.target.value })}
                                                >
                                                    <option>08:00 AM</option>
                                                    <option>09:00 AM</option>
                                                    <option>10:00 AM</option>
                                                </select>
                                            </div>
                                            <div className={cn("text-center font-black text-xl pt-6 transition-colors", isDark ? "text-gray-800" : "text-gray-300")}>&raquo;</div>
                                            <div className="space-y-2">
                                                <span className={cn("text-[8px] font-black uppercase tracking-widest block", isDark ? "text-gray-700" : "text-gray-400")}>CYCLE_END</span>
                                                <select
                                                    className={cn(
                                                        "rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2",
                                                        isDark ? "bg-black text-white border-white/10 focus:ring-[#C0FF00]/50" : "bg-white border-transparent shadow-sm text-gray-700 focus:ring-blue-500"
                                                    )}
                                                    value={prefs.workingHoursEnd}
                                                    onChange={(e) => setPrefs({ ...prefs, workingHoursEnd: e.target.value })}
                                                >
                                                    <option>05:00 PM</option>
                                                    <option>06:00 PM</option>
                                                    <option>07:00 PM</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={cn("flex border-t pt-8 transition-colors", isDark ? "border-white/5" : "border-blue-100")}>
                                        <div className="flex-1 space-y-2">
                                            <span className={cn("text-[8px] font-black uppercase tracking-widest block", isDark ? "text-gray-700" : "text-gray-400")}>GEOGRAPHIC_ZONE_OFFSET</span>
                                            <select
                                                className={cn(
                                                    "w-full rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2",
                                                    isDark ? "bg-black text-white border-white/10 focus:ring-[#C0FF00]/50" : "bg-white border-transparent shadow-sm text-gray-700 focus:ring-blue-500"
                                                )}
                                                value={prefs.timezone}
                                                onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}
                                            >
                                                <option>Asia/Kolkata (IST)</option>
                                                <option>America/New_York (EST)</option>
                                                <option>Europe/London (GMT)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* DND */}
                                <div className={cn(
                                    "p-8 rounded-3xl flex items-center justify-between border-2 transition-all group",
                                    prefs.dndEnabled
                                        ? (isDark ? 'bg-[#C0FF00] border-transparent text-black shadow-[0_0_30px_rgba(192,255,0,0.3)]' : 'bg-indigo-600 border-indigo-600 text-white shadow-xl')
                                        : (isDark ? 'bg-black border-white/5 text-gray-500' : 'bg-white border-gray-100 text-gray-400')
                                )}>
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                                            prefs.dndEnabled ? (isDark ? 'bg-black/10' : 'bg-white/20') : (isDark ? 'bg-white/5 text-white' : 'bg-gray-100 text-indigo-600 shadow-inner')
                                        )}>
                                            <Moon size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className={cn("text-lg font-black tracking-tight transition-colors uppercase", prefs.dndEnabled ? "text-currentColor" : (isDark ? "text-white" : "text-gray-800"))}>Silent_Protocol</h3>
                                            <p className={cn("text-[10px] font-black uppercase tracking-widest opacity-70 transition-colors")}>Suppress_Comms_Outside_Cycle</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setPrefs({ ...prefs, dndEnabled: !prefs.dndEnabled })}
                                        className={cn("w-16 h-9 rounded-full relative transition-all border-2", prefs.dndEnabled ? (isDark ? 'bg-black border-black/10' : 'bg-white border-white/20') : (isDark ? 'bg-white/5 border-white/10' : 'bg-gray-200 border-gray-200'))}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-5.5 h-5.5 rounded-full transition-all duration-300 transform",
                                            prefs.dndEnabled ? (isDark ? 'translate-x-8 bg-[#C0FF00]' : 'translate-x-8 bg-indigo-600') : (isDark ? 'translate-x-1 bg-gray-800' : 'translate-x-1 bg-white shadow-sm'),
                                            isDark ? "h-5 w-5 top-1.5" : "h-6 w-6 top-1"
                                        )}></div>
                                    </button>
                                </div>

                                <div className={cn("flex justify-between items-center gap-4 pt-10 border-t transition-colors", isDark ? "border-white/5" : "border-gray-100")}>
                                    <Button variant="ghost" onClick={() => setStep(1)} className={cn("text-[10px] font-black uppercase tracking-[0.3em] transition-all", isDark ? "text-gray-700 hover:text-white" : "text-gray-400")}>
                                        <ChevronLeft size={20} className="mr-2" /> DATA_ENTRY_01
                                    </Button>
                                    <Button onClick={handleSavePrefs} disabled={isLoading} className={cn("h-14 px-10 font-black tracking-tighter shadow-2xl transition-all group rounded-2xl", isDark ? "bg-[#C0FF00] text-black hover:bg-white active:scale-95" : "bg-blue-600 hover:bg-blue-700")}>
                                        {isLoading ? <Loader2 className="animate-spin" /> : (
                                            <span className="flex items-center gap-3 text-lg">
                                                LOCK_PREFERENCES
                                                <ChevronRight size={22} className="transition-transform group-hover:translate-x-1" />
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* STEP 3: TOUR */}
                {step === 3 && (
                    <Card className={cn(
                        "border-0 shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden transition-all duration-700 min-h-[580px] flex flex-col justify-center relative",
                        isDark ? "bg-[#080808] border border-white/5" : "bg-gradient-to-br from-indigo-900 to-blue-900 text-white"
                    )}>
                        {isDark && (
                            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C0FF00] rounded-full filter blur-[100px] animate-pulse"></div>
                                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-[100px] animate-pulse delay-700"></div>
                            </div>
                        )}
                        <div className="p-12 relative z-10">
                            <div className="flex justify-between items-center mb-16">
                                <div className={cn("px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-colors border", isDark ? "bg-[#C0FF00]/10 text-[#C0FF00] border-[#C0FF00]/20" : "bg-white/10 border-white/10 text-white")}>
                                    SYSTEM_TELEMETRY_TOUR ({tourStep}/5)
                                </div>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={cn("h-1 w-10 rounded-full transition-all duration-500", i <= tourStep ? (isDark ? 'bg-[#C0FF00] shadow-[0_0_10px_#C0FF00]' : 'bg-blue-400') : 'bg-white/10')}></div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-16 items-center">
                                <div className="space-y-10">
                                    {tourStep === 1 && (
                                        <div className="space-y-6 animate-in slide-in-from-left duration-700">
                                            <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center transition-all border shadow-2xl", isDark ? "bg-white/5 border-white/10 text-[#C0FF00]" : "bg-blue-500/20 border-white/10 text-blue-400")}>
                                                <LayoutDashboard size={44} />
                                            </div>
                                            <h2 className={cn("text-5xl font-black leading-tight tracking-tighter transition-colors", isDark ? "text-white" : "text-white")}>
                                                {isDark ? "CONTROL_MATRIX" : "📊 Your Dashboard"}
                                            </h2>
                                            <p className={cn("text-lg leading-relaxed transition-colors", isDark ? "text-gray-500 font-bold uppercase text-sm tracking-widest" : "text-blue-100 font-medium")}>
                                                {isDark
                                                    ? "PRIMARY_NODE_INTERFACE // VIEW_ASSIGNED_RESOURCES // TRACK_CYCLE_PROGRESS // EMIT_DAILY_PULSES"
                                                    : "This is your home base. Here you'll see tasks assigned to you, track your daily progress, view upcoming meetings, and submit daily reports."
                                                }
                                            </p>
                                        </div>
                                    )}
                                    {tourStep === 2 && (
                                        <div className="space-y-6 animate-in slide-in-from-left duration-700">
                                            <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center transition-all border shadow-2xl", isDark ? "bg-white/5 border-white/10 text-cyan-400" : "bg-green-500/20 border-white/10 text-green-400")}>
                                                <ListTodo size={44} />
                                            </div>
                                            <h2 className={cn("text-5xl font-black leading-tight tracking-tighter transition-colors", isDark ? "text-white" : "text-white")}>
                                                {isDark ? "RESOURCE_SCHEDULER" : "✅ Task Management"}
                                            </h2>
                                            <p className={cn("text-lg leading-relaxed transition-colors", isDark ? "text-gray-500 font-bold uppercase text-sm tracking-widest" : "text-blue-100 font-medium")}>
                                                {isDark
                                                    ? "NEVER_MISS_DEADLINES // CENTRAL_RESOURCE_LOCATOR // INSTANT_STATUS_SYNCHRONIZATION"
                                                    : "Never miss a deadline. View your active tasks, subtasks, and dependencies in one central location. Update statuses with a single click."
                                                }
                                            </p>
                                        </div>
                                    )}
                                    {tourStep === 3 && (
                                        <div className="space-y-6 animate-in slide-in-from-left duration-700">
                                            <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center transition-all border shadow-2xl", isDark ? "bg-white/5 border-white/10 text-amber-500" : "bg-amber-500/20 border-white/10 text-amber-400")}>
                                                <Clock size={44} />
                                            </div>
                                            <h2 className={cn("text-5xl font-black leading-tight tracking-tighter transition-colors", isDark ? "text-white" : "text-white")}>
                                                {isDark ? "TEMPORAL_MONITOR" : "⏱️ Time Tracking"}
                                            </h2>
                                            <p className={cn("text-lg leading-relaxed transition-colors", isDark ? "text-gray-500 font-bold uppercase text-sm tracking-widest" : "text-blue-100 font-medium")}>
                                                {isDark
                                                    ? "PRECISION_PULSE_TRACKING // TASK_DURATION_ANALYTICS // PROJECT_ALLOCATION_LOGS"
                                                    : "Precision matters. Start timers for your tasks, log manual hours, and generate detailed reports for your project time allocation."
                                                }
                                            </p>
                                        </div>
                                    )}
                                    {tourStep === 4 && (
                                        <div className="space-y-6 animate-in slide-in-from-left duration-700">
                                            <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center transition-all border shadow-2xl", isDark ? "bg-white/5 border-white/10 text-purple-400" : "bg-purple-500/20 border-white/10 text-purple-400")}>
                                                <BarChart3 size={44} />
                                            </div>
                                            <h2 className={cn("text-5xl font-black leading-tight tracking-tighter transition-colors", isDark ? "text-white" : "text-white")}>
                                                {isDark ? "TELEMETRY_LOGS" : "📝 Daily Reports"}
                                            </h2>
                                            <p className={cn("text-lg leading-relaxed transition-colors", isDark ? "text-gray-500 font-bold uppercase text-sm tracking-widest" : "text-blue-100 font-medium")}>
                                                {isDark
                                                    ? "MAINTAIN_ALIGNMENT // EMIT_CYCLE_STATUS // DOCUMENT_BLOCKERS"
                                                    : "Keep everyone in the loop. Submit your daily work reports before 7 PM to ensure your team is aligned on progress and blockers."
                                                }
                                            </p>
                                        </div>
                                    )}
                                    {tourStep === 5 && (
                                        <div className="space-y-6 animate-in slide-in-from-left duration-700">
                                            <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center transition-all border shadow-2xl", isDark ? "bg-white/5 border-white/10 text-rose-500" : "bg-pink-500/20 border-white/10 text-pink-400")}>
                                                <MessageCircle size={44} />
                                            </div>
                                            <h2 className={cn("text-5xl font-black leading-tight tracking-tighter transition-colors", isDark ? "text-white" : "text-white")}>
                                                {isDark ? "LAYERED_COMMS" : "💬 Communication"}
                                            </h2>
                                            <p className={cn("text-lg leading-relaxed transition-colors", isDark ? "text-gray-500 font-bold uppercase text-sm tracking-widest" : "text-blue-100 font-medium")}>
                                                {isDark
                                                    ? "STAY_CONNECTED // PROJECT_CHANNELS // DIRECT_PEER_SYNC"
                                                    : "Stay connected. Chat with your team members in project channels or send direct messages to your manager for quick updates."
                                                }
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-8 pt-6">
                                        <Button
                                            variant="ghost"
                                            onClick={() => tourStep > 1 ? setTourStep(tourStep - 1) : setStep(2)}
                                            className={cn("font-black uppercase tracking-[0.3em] text-[10px] h-12 px-6 rounded-xl transition-all", isDark ? "text-gray-700 hover:text-white" : "text-white/50 hover:text-white hover:bg-white/10")}
                                        >
                                            <ChevronLeft size={20} className="mr-3" /> PREV_STEP
                                        </Button>
                                        <Button
                                            onClick={() => tourStep < 5 ? setTourStep(tourStep + 1) : setStep(4)}
                                            className={cn("h-16 px-12 rounded-2xl font-black text-xl shadow-2xl transition-all group", isDark ? "bg-[#C0FF00] text-black hover:bg-white" : "bg-white text-blue-900 hover:bg-blue-50")}
                                        >
                                            {tourStep === 5 ? (isDark ? "INITIALIZE_DASHBOARD 🎉" : "Finish Tour 🎉") : (isDark ? "NEXT_TELEMETRY »" : "Next Tip →")}
                                        </Button>
                                    </div>
                                </div>

                                <div className="hidden md:block relative">
                                    <div className={cn(
                                        "aspect-square rounded-[40px] border flex items-center justify-center backdrop-blur-3xl transition-all duration-700 transform hover:scale-105",
                                        isDark ? "bg-white/2 border-white/10" : "bg-white/5 border-white/10"
                                    )}>
                                        <div className="p-10 text-center space-y-6">
                                            <div className={cn(
                                                "w-28 h-28 rounded-full mx-auto flex items-center justify-center shadow-2xl transition-all group-hover:rotate-12",
                                                isDark ? "bg-[#C0FF00] text-black shadow-[#C0FF00]/20" : "bg-blue-500 text-white shadow-blue-500/40"
                                            )}>
                                                <Play size={40} className="ml-1" fill="currentColor" />
                                            </div>
                                            <p className={cn("text-[10px] font-black uppercase tracking-[0.4em] transition-colors", isDark ? "text-[#C0FF00]" : "text-blue-200")}>BOOT_TUTORIAL_STREAM</p>
                                            <div className="pt-10 space-y-3 opacity-20">
                                                <div className={cn("h-2.5 w-56 rounded-full mx-auto transition-colors", isDark ? "bg-white" : "bg-white")}></div>
                                                <div className={cn("h-2.5 w-40 rounded-full mx-auto transition-colors", isDark ? "bg-white" : "bg-white")}></div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Decorative circles */}
                                    {isDark ? (
                                        <>
                                            <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#C0FF00] rounded-full blur-[90px] opacity-10"></div>
                                            <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-cyan-500 rounded-full blur-[110px] opacity-10"></div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-400 rounded-full blur-[80px] opacity-20"></div>
                                            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* STEP 4: DONE */}
                {step === 4 && (
                    <Card className={cn("border-0 shadow-2xl rounded-3xl overflow-hidden text-center transition-all duration-700", isDark ? "bg-[#080808] border border-white/5" : "bg-white")}>
                        <div className="p-16">
                            <div className={cn(
                                "w-28 h-28 rounded-full mx-auto flex items-center justify-center mb-10 animate-bounce transition-all",
                                isDark ? "bg-[#C0FF00]/10 text-[#C0FF00] shadow-[0_0_30px_rgba(192,255,0,0.1)]" : "bg-green-100 text-green-600"
                            )}>
                                <PartyPopper size={56} />
                            </div>
                            <h2 className={cn("text-5xl font-black tracking-tighter mb-4 transition-colors", isDark ? "text-white" : "text-gray-900")}>
                                {isDark ? "ONBOARDING_SYNCHRONIZED" : `🎉 You're All Set, ${user?.name?.split(" ")[0]}!`}
                            </h2>
                            <p className={cn("text-lg font-medium max-w-xl mx-auto mb-16 transition-colors", isDark ? "text-gray-600 font-bold uppercase text-xs tracking-widest leading-relaxed" : "text-gray-500")}>
                                {isDark
                                    ? "NEURAL_LINK_ESTABLISHED // ALL_SYSTEMS_NOMINAL // YOUR_NODE_IS_NOW_LIVE_IN_THE_NETWORK"
                                    : "Your onboarding is complete. You're now ready to join your team and start collaborating efficiently."
                                }
                            </p>

                            <div className="grid md:grid-cols-2 gap-10 text-left max-w-4xl mx-auto mb-16">
                                <div className={cn("p-8 rounded-3xl space-y-6 transition-colors border", isDark ? "bg-white/2 border-white/10" : "bg-gray-50 border-gray-100")}>
                                    <h3 className={cn("font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-3", isDark ? "text-[#C0FF00]" : "text-gray-800")}>
                                        <Check size={18} className={isDark ? "text-white" : "text-green-600"} />
                                        DEPLOYMENT_CHECKLIST
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            'REVIEW_ASSIGNED_RESOURCES',
                                            'ACTIVATE_DAILY_CALENDAR',
                                            'INITIALIZE_TEAM_SYNC',
                                            'EMIT_FIRST_PULSE_REPORT'
                                        ].map(item => (
                                            <label key={item} className="flex items-center gap-4 cursor-pointer group">
                                                <input type="checkbox" className={cn("w-5 h-5 rounded border-2 transition-all", isDark ? "bg-black border-white/10 text-[#C0FF00] focus:ring-[#C0FF00]" : "border-gray-300 text-green-600")} />
                                                <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isDark ? "text-gray-600 group-hover:text-white" : "text-gray-600 group-hover:text-gray-900")}>{item}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className={cn("p-8 rounded-3xl space-y-6 transition-colors border", isDark ? "bg-black border-white/10" : "bg-blue-50 border-blue-100")}>
                                    <h3 className={cn("font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-3", isDark ? "text-cyan-400" : "text-blue-900")}>
                                        <ExternalLink size={18} className={isDark ? "text-white" : "text-blue-600"} />
                                        KNOWLEDGE_BUFFERS
                                    </h3>
                                    <div className="space-y-5 pt-2">
                                        {[
                                            { label: 'NODE_OPERATOR_MANUAL', action: 'READ_DOCS', status: 'primary' },
                                            { label: 'TELEMETRY_TUTORIALS', action: 'STREAM_VOD', status: 'outline' },
                                            { label: 'FREQUENTLY_SYNCED_Q', action: 'CACHE_HINTS', status: 'outline' }
                                        ].map((resource, i) => (
                                            <div key={i} className="flex items-center justify-between group">
                                                <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isDark ? "text-gray-600 group-hover:text-white" : "text-gray-700")}>{resource.label}</span>
                                                <Badge className={cn(
                                                    "px-3 py-1 font-black text-[8px] uppercase tracking-tighter cursor-pointer transition-all",
                                                    resource.status === 'primary'
                                                        ? (isDark ? 'bg-[#C0FF00] text-black hover:bg-white' : 'bg-blue-600 text-white')
                                                        : (isDark ? 'bg-white/5 text-white border-white/10 hover:border-[#C0FF00]' : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50')
                                                )}>
                                                    {resource.action}
                                                </Badge>
                                            </div>
                                        ))}
                                        <div className={cn("pt-4 flex items-center gap-3 text-[9px] font-black uppercase tracking-widest transition-colors", isDark ? "text-gray-800" : "text-blue-400")}>
                                            SYS_ADMIN_LINK: <a href="mailto:admin@zech.ai" className={cn("hover:underline transition-colors", isDark ? "text-gray-600 hover:text-[#C0FF00]" : "text-blue-600")}>ADMIN@ZECH.AI</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => router.push(user?.role === 'CLIENT' ? '/client/dashboard' : '/dashboard')}
                                className={cn("h-20 px-16 text-2xl font-black tracking-tighter shadow-2xl flex items-center gap-4 group mx-auto rounded-[32px] transition-all", isDark ? "bg-[#C0FF00] text-black hover:bg-white active:scale-95" : "bg-blue-600 hover:bg-blue-700")}
                            >
                                🚀 ENTER_THE_WORKSPACE
                                <ChevronRight size={32} className="transition-transform group-hover:translate-x-3" />
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}
