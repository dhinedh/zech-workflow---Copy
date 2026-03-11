"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Eye, EyeOff, Check, AlertTriangle, ShieldCheck } from "lucide-react"

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "At least 8 characters required")
        .regex(/[A-Z]/, "Requires uppercase letter")
        .regex(/[a-z]/, "Requires lowercase letter")
        .regex(/[0-9]/, "Requires number")
        .regex(/[!@#$%^&*]/, "Requires special character"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export default function ChangePasswordPage() {
    const router = useRouter()
    const { user } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState("")
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<z.infer<typeof changePasswordSchema>>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    })

    const newPassword = watch("newPassword")

    // Password requirements check
    const requirements = [
        { label: "At least 8 characters", met: newPassword.length >= 8 },
        { label: "Contains uppercase letter (A-Z)", met: /[A-Z]/.test(newPassword) },
        { label: "Contains lowercase letter (a-z)", met: /[a-z]/.test(newPassword) },
        { label: "Contains number (0-9)", met: /[0-9]/.test(newPassword) },
        { label: "Contains special character (!@#$%^&*)", met: /[!@#$%^&*]/.test(newPassword) },
    ]

    // Strength calculation (simple)
    const strength = requirements.filter(r => r.met).length
    const strengthLabel = strength <= 2 ? "Weak 😟" : strength <= 4 ? "Medium 😐" : "Strong 💪"
    const strengthColor = strength <= 2 ? "bg-red-500" : strength <= 4 ? "bg-amber-500" : "bg-green-500"

    const onSubmit = async (data: z.infer<typeof changePasswordSchema>) => {
        setIsLoading(true)
        setError("")

        try {
            await api.post("/auth/change-password", {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            })
            setIsSuccess(true)
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to change password. Please check your current password.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="flex min-h-screen bg-gray-50 items-center justify-center p-4">
                <div className="w-full max-w-lg">
                    <Card className="border-none shadow-2xl overflow-hidden rounded-2xl">
                        <div className="bg-green-600 p-8 text-white text-center">
                            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                                <Check size={32} />
                            </div>
                            <h2 className="text-2xl font-bold">✅ Password Updated!</h2>
                        </div>
                        <CardContent className="p-8 space-y-6 text-center">
                            <p className="text-gray-600">
                                Your password has been changed successfully. You can now access your account.
                            </p>
                            <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100">
                                <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">ℹ️ Login Credentials:</p>
                                <ul className="space-y-1 text-gray-700">
                                    <li>• <span className="font-medium">Employee ID:</span> {user?.employeeId}</li>
                                    <li>• <span className="font-medium">Email:</span> {user?.email}</li>
                                    <li>• <span className="font-medium">Password:</span> Your new password</li>
                                </ul>
                            </div>
                            <Button
                                onClick={() => router.push("/onboarding/setup")}
                                className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg shadow-lg shadow-green-100"
                            >
                                Continue to Profile Setup →
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50 items-center justify-center p-4 py-12">
            <div className="w-full max-w-2xl">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-1 rounded-full text-sm font-bold mb-4">
                        <ShieldCheck size={16} />
                        🔐 FIRST-TIME LOGIN DETECTED
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}! 👋</h1>
                    <p className="text-gray-500 mt-2">This is your first login to Zech WorkFlow. For security, you must change your temporary password.</p>
                </div>

                <div className="grid md:grid-cols-5 gap-6">
                    {/* Details Column */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="h-full border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                            <div className="bg-gray-50 p-4 border-b border-gray-100">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    📋 YOUR DETAILS
                                </h3>
                            </div>
                            <CardContent className="p-4 space-y-4">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Employee ID</p>
                                    <p className="text-gray-700 font-medium">{user?.employeeId || "Generating..."}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Email</p>
                                    <p className="text-gray-700 font-medium">{user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Role</p>
                                    <p className="text-gray-700 font-medium">{user?.role === 'SUPER_ADMIN' ? 'Administrator' : user?.role}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Department</p>
                                    <p className="text-gray-700 font-medium">Engineering</p> {/* Mocking dept for now */}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Change Password Form Column */}
                    <div className="md:col-span-3">
                        <Card className="border-none shadow-xl rounded-2xl">
                            <div className="p-6 border-b border-gray-100 bg-blue-50/30">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                                    🔑 CREATE NEW PASSWORD
                                </h3>
                            </div>
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                                    {/* Current Password */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-sm font-semibold text-gray-700">Current Temporary Password</label>
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        <Input
                                            type={showPasswords.current ? "text" : "password"}
                                            placeholder="Zech@2026!XXX"
                                            {...register("currentPassword")}
                                            className="h-11 bg-gray-50 border-gray-200 transition-all focus:bg-white"
                                            disabled={isLoading}
                                        />
                                        {errors.currentPassword && <p className="text-xs text-red-500 font-medium">{errors.currentPassword.message}</p>}
                                    </div>

                                    {/* New Password */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-sm font-semibold text-gray-700">New Password</label>
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        <Input
                                            type={showPasswords.new ? "text" : "password"}
                                            placeholder="••••••••••••••••"
                                            {...register("newPassword")}
                                            className="h-11 bg-gray-50 border-gray-200 transition-all focus:bg-white"
                                            disabled={isLoading}
                                        />

                                        {/* Strength Bar */}
                                        <div className="mt-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-semibold text-gray-500">Password Strength: <span className={strengthLabel.includes('Strong') ? 'text-green-600' : strengthLabel.includes('Medium') ? 'text-amber-600' : 'text-red-600'}>{strengthLabel}</span></span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
                                                <div className={`h-full transition-all duration-500 ${strengthColor}`} style={{ width: `${(strength / 5) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        <Input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            placeholder="••••••••••••••••"
                                            {...register("confirmPassword")}
                                            className="h-11 bg-gray-50 border-gray-200 transition-all focus:bg-white"
                                            disabled={isLoading}
                                        />
                                        {errors.confirmPassword && <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>}
                                        {watch("confirmPassword") && watch("newPassword") === watch("confirmPassword") && (
                                            <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                                                <Check size={12} strokeWidth={3} /> Passwords match
                                            </p>
                                        )}
                                    </div>

                                    {/* Requirements Checklist */}
                                    <div className="p-4 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">📋 PASSWORD REQUIREMENTS</p>
                                        {requirements.map((req, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs">
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                                                    <Check size={10} strokeWidth={3} />
                                                </div>
                                                <span className={`${req.met ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{req.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {error && (
                                        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-start gap-2">
                                            <AlertTriangle size={18} className="shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 group" disabled={isLoading}>
                                        {isLoading ? (
                                            <Loader2 size={24} className="animate-spin" />
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                Change Password & Continue
                                                <span className="transition-transform group-hover:translate-x-1">→</span>
                                            </span>
                                        )}
                                    </Button>

                                    <div className="text-center">
                                        <p className="text-xs text-amber-600 font-medium">
                                            ⚠️ IMPORTANT: Do not share your password with anyone. You can change it later in Settings.
                                        </p>
                                    </div>

                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
