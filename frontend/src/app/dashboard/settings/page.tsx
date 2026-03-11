
"use client"

import { useState } from "react"
import {
    User,
    Lock,
    Bell,
    Palette,
    LogOut,
    Check,
    Upload,
    Shield,
    AlertTriangle,
    Loader2
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"
import { useAuthStore } from "@/store/authStore"

export default function SettingsPage() {
    const { user } = useAuthStore()
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    const [activeTab, setActiveTab] = useState("profile")
    const [isLoading, setIsLoading] = useState(false)
    const [saved, setSaved] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteAccount = async () => {
        setIsDeleting(true)
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsDeleting(false)
        setIsDeleteDialogOpen(false)
        // In a real app, this would logout and redirect
        alert("Node Dissolution Sequence Complete.")
    }

    const handleSave = async () => {
        setIsLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsLoading(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    const navigationResult = [
        { id: "profile", label: "Profile", icon: User, description: "Manage your public profile" },
        { id: "account", label: "Account", icon: Lock, description: "Update password and secure your account" },
        { id: "notifications", label: "Notifications", icon: Bell, description: "Configure how you receive alerts" },
        { id: "appearance", label: "Appearance", icon: Palette, description: "Customize the look and feel" },
    ]

    return (
        <div className={cn("container mx-auto p-4 max-w-6xl space-y-8")}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className={cn("text-3xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-slate-900")}>Settings</h2>
                    <p className={cn("mt-1 transition-colors", isDark ? "text-gray-400" : "text-muted-foreground")}>Manage your account settings and preferences.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-10">

                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 shrink-0 space-y-1">
                    {navigationResult.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                                activeTab === item.id
                                    ? (isDark ? "bg-[#C0FF00] text-black shadow-sm" : "bg-indigo-50 text-indigo-700 shadow-sm")
                                    : (isDark ? "text-gray-400 hover:bg-white/5 hover:text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900")
                            )}
                        >
                            <item.icon className={cn("h-4 w-4 transition-colors", activeTab === item.id ? (isDark ? "text-black" : "text-indigo-600") : "text-gray-500")} />
                            {item.label}
                        </button>
                    ))}
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 space-y-6">

                    {/* PROFILE TAB */}
                    {activeTab === "profile" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-500">
                            <Card className={cn(
                                "shadow-sm transition-all duration-300 border",
                                isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200"
                            )}>
                                <CardHeader className={cn("border-b py-6", isDark ? "border-white/10" : "border-slate-100")}>
                                    <CardTitle className={cn("font-bold", isDark ? "text-white" : "")}>Profile Information</CardTitle>
                                    <CardDescription className={isDark ? "text-gray-400" : ""}>Update your photo and personal details here.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8 pt-8">
                                    <div className="flex flex-col sm:flex-row items-center gap-8">
                                        <div className="relative group">
                                            <Avatar className={cn(
                                                "h-24 w-24 border-4 transition-all duration-300",
                                                isDark ? "border-white/5" : "border-slate-50"
                                            )}>
                                                <AvatarImage src={user?.avatar} />
                                                <AvatarFallback className={cn("text-2xl font-bold", isDark ? "bg-white/10 text-white" : "bg-indigo-100 text-indigo-700")}>{user?.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className={cn("absolute -bottom-1 -right-1 p-2 rounded-full ring-4 transition-colors cursor-pointer", isDark ? "bg-[#C0FF00] text-black ring-[#1c1c1c]" : "bg-white text-gray-700 ring-white shadow-sm border")}>
                                                <Upload className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <div className="space-y-3 text-center sm:text-left">
                                            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                                                <Button size="sm" variant="outline" className={cn("font-medium transition-all", isDark ? "bg-transparent border-white/20 text-white hover:bg-white/10" : "")} onClick={() => alert("Change Avatar clicked")}>Change Avatar</Button>
                                                <Button size="sm" variant="ghost" className="font-medium text-red-500 hover:bg-red-500/10 hover:text-red-600" onClick={() => alert("Remove clicked")}>Remove</Button>
                                            </div>
                                            <p className={cn("text-xs", isDark ? "text-gray-500" : "text-muted-foreground")}>JPG, GIF or PNG. Max size of 2MB.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className={isDark ? "text-gray-300" : ""}>Display Name</Label>
                                            <Input id="name" defaultValue={user?.name} className={cn(isDark ? "bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500" : "")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role" className={isDark ? "text-gray-300" : ""}>Role</Label>
                                            <Input id="role" defaultValue={user?.role} disabled className={cn(isDark ? "bg-white/5 border-white/5 text-gray-500" : "bg-gray-50 text-gray-500")} />
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label htmlFor="email" className={isDark ? "text-gray-300" : ""}>Email Address</Label>
                                            <Input id="email" defaultValue={user?.email} disabled className={cn(isDark ? "bg-white/5 border-white/5 text-gray-500" : "bg-gray-50 text-gray-500")} />
                                            <p className={cn("text-xs italic", isDark ? "text-gray-600" : "text-muted-foreground")}>* Contact your admin to change email.</p>
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label htmlFor="bio" className={isDark ? "text-gray-300" : ""}>Bio</Label>
                                            <Textarea id="bio" placeholder="Tell us a little about yourself" defaultValue={user?.bio} className={cn("resize-none min-h-[120px] transition-all", isDark ? "bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500" : "")} />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className={cn("flex justify-end border-t px-8 py-5", isDark ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50/50")}>
                                    <Button onClick={handleSave} disabled={isLoading} className={cn("font-medium transition-all px-6", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "bg-indigo-600 hover:bg-indigo-700")}>
                                        {isLoading ? "Saving..." : saved ? <><Check className="mr-2 h-4 w-4" /> Saved</> : "Save Changes"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}

                    {/* ACCOUNT TAB */}
                    {activeTab === "account" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
                            <Card className={cn(
                                "shadow-sm transition-all duration-300 border",
                                isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200"
                            )}>
                                <CardHeader className={cn("border-b py-6", isDark ? "border-white/10" : "border-slate-100")}>
                                    <CardTitle className={cn("font-bold", isDark ? "text-white" : "")}>Change Password</CardTitle>
                                    <CardDescription className={isDark ? "text-gray-400" : ""}>Ensure your account is using a strong password.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-8">
                                    <div className="space-y-2">
                                        <Label htmlFor="current" className={isDark ? "text-gray-300" : ""}>Current Password</Label>
                                        <Input id="current" type="password" className={cn(isDark ? "bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500" : "")} />
                                    </div>
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="new" className={isDark ? "text-gray-300" : ""}>New Password</Label>
                                            <Input id="new" type="password" className={cn(isDark ? "bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500" : "")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm" className={isDark ? "text-gray-300" : ""}>Confirm Password</Label>
                                            <Input id="confirm" type="password" className={cn(isDark ? "bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500" : "")} />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className={cn("flex justify-end border-t px-8 py-5", isDark ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50/50")}>
                                    <Button onClick={handleSave} className={cn("font-medium transition-all px-6", isDark ? "bg-white text-black hover:bg-gray-200" : "")}>
                                        {isLoading ? "Updating..." : "Update Password"}
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Card className={cn("shadow-sm transition-all border overflow-hidden", isDark ? "bg-red-900/10 border-red-900/20" : "border-red-100 bg-red-50/30")}>
                                <CardHeader className={cn("py-6", isDark ? "bg-red-900/20" : "bg-red-50/50")}>
                                    <CardTitle className={cn("flex items-center gap-2 font-bold text-base", isDark ? "text-red-400" : "text-red-700")}><Shield className="h-5 w-5" /> Danger Zone</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-8">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                        <div className="space-y-1 text-center sm:text-left">
                                            <h4 className={cn("font-semibold text-base", isDark ? "text-gray-200" : "text-gray-900")}>Delete Account</h4>
                                            <p className={cn("text-sm transition-colors", isDark ? "text-gray-500" : "text-muted-foreground")}>Permanently delete your account and all associated data.</p>
                                        </div>
                                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="destructive" className={cn("font-medium transition-all", isDark ? "bg-red-600 hover:bg-red-700" : "")}>Delete Account</Button>
                                            </DialogTrigger>
                                            <DialogContent className={isDark ? "bg-[#1c1c1c] border-white/10 text-white" : ""}>
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-2">
                                                        <AlertTriangle className="h-5 w-5 text-red-500" /> Confirm Deletion
                                                    </DialogTitle>
                                                    <DialogDescription className={isDark ? "text-gray-400" : ""}>
                                                        This action will permanently delete your account. This cannot be undone.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter className="mt-6 flex gap-3">
                                                    <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className={isDark ? "text-gray-400 hover:text-white hover:bg-white/10" : ""}>Cancel</Button>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={handleDeleteAccount}
                                                        disabled={isDeleting}
                                                    >
                                                        {isDeleting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                                        Delete Account
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeTab === "notifications" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-500">
                            <Card className={cn(
                                "shadow-sm transition-all duration-300 border",
                                isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200"
                            )}>
                                <CardHeader className={cn("border-b py-6", isDark ? "border-white/10" : "border-slate-100")}>
                                    <CardTitle className={cn("font-bold", isDark ? "text-white" : "")}>Notification Preferences</CardTitle>
                                    <CardDescription className={isDark ? "text-gray-400" : ""}>Choose what updates you want to receive.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-1 pt-4">
                                    {[
                                        { title: "Report Reminders", desc: "Receive alert at 5 PM if daily report is missing.", default: true },
                                        { title: "Task Assignments", desc: "Receive alert when a new task is assigned to you.", default: true },
                                        { title: "Mentions", desc: "Receive alert when you are mentioned in comments.", default: true },
                                        { title: "Project Updates", desc: "Receive weekly summary of project progress.", default: false },
                                    ].map((item, i) => (
                                        <div key={i} className={cn("flex items-center justify-between p-5 rounded-lg transition-all", isDark ? "hover:bg-white/5" : "hover:bg-gray-50")}>
                                            <div className="space-y-1">
                                                <Label htmlFor={`notif-${i}`} className={cn("text-sm font-semibold cursor-pointer transition-colors", isDark ? "text-gray-200" : "text-slate-900")}>{item.title}</Label>
                                                <p className={cn("text-xs transition-colors", isDark ? "text-gray-500" : "text-muted-foreground")}>{item.desc}</p>
                                            </div>
                                            <div className="relative inline-block w-11 mr-2 align-middle select-none transition duration-200 ease-in">
                                                <input type="checkbox" name={`toggle-${i}`} id={`notif-${i}`} defaultChecked={item.default}
                                                    className={cn(
                                                        "toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 transform top-0.5 left-0.5",
                                                        item.default ? "translate-x-5" : "translate-x-0"
                                                    )}
                                                />
                                                <label htmlFor={`notif-${i}`} className={cn("block overflow-hidden h-6 rounded-full cursor-pointer transition-colors", item.default ? (isDark ? "bg-[#C0FF00]" : "bg-indigo-600") : "bg-gray-300")}></label>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                                <CardFooter className={cn("flex justify-end border-t px-8 py-5", isDark ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50/50")}>
                                    <Button onClick={handleSave} className={cn("font-medium transition-all px-6", isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "bg-indigo-600 hover:bg-indigo-700")}>Save Preferences</Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}

                    {/* APPEARANCE TAB */}
                    {activeTab === "appearance" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-500">
                            <Card className={cn(
                                "shadow-sm transition-all duration-300 border",
                                isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200"
                            )}>
                                <CardHeader className={cn("border-b py-6", isDark ? "border-white/10" : "border-slate-100")}>
                                    <CardTitle className={cn("font-bold", isDark ? "text-white" : "")}>Interface Styling</CardTitle>
                                    <CardDescription className={isDark ? "text-gray-400" : ""}>Choose your preferred color theme.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">
                                    <div className={cn(
                                        "group relative flex flex-col p-6 rounded-xl border-2 transition-all cursor-pointer",
                                        !isDark ? "bg-indigo-50/50 border-indigo-600 shadow-sm" : "bg-black/20 border-white/5 hover:border-white/20"
                                    )}>
                                        <div className="w-full h-32 rounded-lg bg-slate-50 border border-slate-200 shadow-inner overflow-hidden mb-4 p-4">
                                            <div className="w-2/3 h-3 bg-indigo-100 rounded-full mb-3" />
                                            <div className="w-full h-3 bg-slate-200 rounded-full mb-3" />
                                            <div className="w-1/2 h-3 bg-slate-200 rounded-full" />
                                        </div>
                                        <h4 className={cn("font-semibold text-sm mb-1", !isDark ? "text-indigo-900" : "text-gray-400")}>Light Mode</h4>
                                        <p className="text-xs text-gray-500">Standard clean light interface.</p>
                                        {!isDark && <Check className="absolute top-4 right-4 h-5 w-5 text-indigo-600" />}
                                    </div>

                                    <div className={cn(
                                        "group relative flex flex-col p-6 rounded-xl border-2 transition-all cursor-pointer",
                                        isDark ? "bg-[#C0FF00]/5 border-[#C0FF00] shadow-sm" : "bg-black/5 border-transparent hover:border-slate-300"
                                    )}>
                                        <div className="w-full h-32 rounded-lg bg-[#111] border border-white/10 shadow-inner overflow-hidden mb-4 p-4">
                                            <div className="w-2/3 h-3 bg-[#C0FF00]/40 rounded-full mb-3" />
                                            <div className="w-full h-3 bg-white/10 rounded-full mb-3" />
                                            <div className="w-1/2 h-3 bg-white/10 rounded-full" />
                                        </div>
                                        <h4 className={cn("font-semibold text-sm mb-1", isDark ? "text-[#C0FF00]" : "text-gray-900")}>Dark Mode</h4>
                                        <p className="text-xs text-gray-500">Dark aesthetic for low-light environments.</p>
                                        {isDark && <Check className="absolute top-4 right-4 h-5 w-5 text-[#C0FF00]" />}
                                    </div>
                                </CardContent>
                                <CardFooter className={cn("p-6 px-8 border-t transition-colors text-center block", isDark ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50/50")}>
                                    <p className={cn("text-xs transition-colors", isDark ? "text-gray-500" : "text-muted-foreground")}>
                                        Current Theme: <span className="font-semibold">{isDark ? "Dark" : "Light"}</span>
                                    </p>
                                </CardFooter>
                            </Card>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
