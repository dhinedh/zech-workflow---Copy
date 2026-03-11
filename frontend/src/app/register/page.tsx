
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    ArrowRight,
    Loader2,
    Command,
    Activity,
    Code2,
    Sun,
    Moon
} from "lucide-react"
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

export default function RegisterPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('EMPLOYEE');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Simulate network delay
        setTimeout(() => {
            const mockUser = {
                id: Math.random().toString(36).substring(7),
                email,
                user_metadata: {
                    full_name: fullName,
                    role: role,
                }
            };
            
            localStorage.setItem('mock_user', JSON.stringify(mockUser));
            setLoading(false);
            router.push('/login?message=Account created successfully. You can now login.');
        }, 1000);
    };

    const isDark = theme === 'dark';

    return (
        <div className={`flex h-screen overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#050505] text-white selection:bg-[#C0FF00] selection:text-black' : 'bg-white text-slate-900 selection:bg-indigo-600 selection:text-white'}`}>

            {/* Theme Toggle Floating Button */}
            <button
                onClick={toggleTheme}
                className={`fixed top-6 right-6 z-50 p-3 rounded-full border transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-[#C0FF00]' : 'bg-white border-slate-200 hover:bg-slate-50 text-indigo-600 shadow-lg shadow-indigo-100'}`}
            >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Left Side: System Architecture Visualization */}
            <div className={`hidden lg:flex w-1/2 relative flex-col border-r transition-colors duration-500 overflow-hidden ${isDark ? 'border-white/5' : 'border-slate-300 bg-slate-200'}`}>
                {isDark ? (
                    <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#111_0%,transparent_100%)]" />
                        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
                    </>
                ) : (
                    <>
                        <div className="absolute inset-0 opacity-[0.6]" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1.5px, transparent 1.5px), linear-gradient(90deg, #cbd5e1 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />
                    </>
                )}

                <div className="relative z-10 p-16 flex flex-col h-full justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push('/')}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center -rotate-6 transition-all duration-300 ${isDark ? 'bg-[#C0FF00] shadow-[0_0_20px_rgba(192,255,0,0.3)]' : 'bg-indigo-600 shadow-xl shadow-indigo-200'}`}>
                            <Command className={`${isDark ? 'text-black' : 'text-white'} h-6 w-6`} />
                        </div>
                        <span className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>ZECH.OS</span>
                    </div>

                    <div className="space-y-12">
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h1 className="text-7xl font-bold leading-none tracking-tight">
                                    Design the <br />
                                    <span className={isDark ? 'text-[#C0FF00]' : 'text-indigo-600'}>future.</span>
                                </h1>
                            </div>

                            {/* System Status */}
                            <div className="flex items-center gap-12 pt-4">
                                <div className="space-y-1">
                                    <div className={`text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Platform Uptime</div>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full animate-pulse ${isDark ? 'bg-[#C0FF00]' : 'bg-indigo-600'}`} />
                                        <span className={`text-sm font-bold tracking-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>99.9% OPERATIONAL</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className={`text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Active Users</div>
                                    <div className={`text-sm font-bold tracking-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>1.2K+ CONNECTED</div>
                                </div>
                            </div>

                            {/* Dot Grid Map Simulation */}
                            <div className="grid grid-cols-8 gap-2 w-48 opacity-20">
                                {[...Array(24)].map((_, i) => (
                                    <div key={i} className={`h-1 w-1 rounded-full ${i % 7 === 0 ? (isDark ? 'bg-[#C0FF00]' : 'bg-indigo-600') : (isDark ? 'bg-white' : 'bg-slate-400')}`} />
                                ))}
                            </div>
                        </div>

                        <div className={`p-6 rounded-2xl relative overflow-hidden transition-all duration-500 ${isDark ? 'bg-gradient-to-br from-[#111] to-transparent border-white/5 border' : 'bg-white border-slate-200 border shadow-2xl shadow-indigo-100'}`}>
                            <div className="flex items-center gap-4 mb-4">
                                <Activity className={`h-4 w-4 ${isDark ? 'text-[#C0FF00]' : 'text-indigo-600'}`} />
                                <span className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-slate-400'}`}>Network Throughput</span>
                            </div>
                            <div className="flex gap-1 h-8 items-end">
                                {[40, 70, 45, 90, 65, 30, 80, 55, 95, 75, 40].map((h, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 rounded-t-sm ${isDark ? 'bg-white/10' : 'bg-indigo-600/10'}`}
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>
                            <div className="absolute top-2 right-4 opacity-5">
                                <Code2 className={`h-10 w-10 ${isDark ? 'text-white' : 'text-indigo-600'}`} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Startup Registration Form */}
            <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto h-full transition-colors duration-500 ${isDark ? 'bg-[#050505]' : 'bg-white'}`}>
                <div className="w-full max-w-sm space-y-10 py-12 animate-in fade-in slide-in-from-left-8 duration-700">
                    <div className="lg:hidden flex justify-center mb-12">
                        <div className={`w-8 h-8 rounded flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-[#C0FF00] shadow-[0_0_15px_rgba(192,255,0,0.2)]' : 'bg-indigo-600 shadow-lg shadow-indigo-100'}`}>
                            <Command className={`${isDark ? 'text-black' : 'text-white'} h-5 w-5`} />
                        </div>
                        <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>ZECH.OS</span>
                    </div>

                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
                        <p className={`${isDark ? 'text-gray-500' : 'text-slate-500'} font-medium pt-2 transition-colors duration-300`}>Join our platform and start managing your workspace efficiently.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6 pt-4">
                        {error && (
                            <div className={`border p-4 rounded-xl text-xs flex items-center gap-3 animate-in shake duration-500 ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                <div className={`h-2 w-2 rounded-full ${isDark ? 'bg-red-500' : 'bg-red-600'}`} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2 group">
                            <Label htmlFor="fullName" className={`${isDark ? 'text-gray-500' : 'text-slate-600'} text-xs font-semibold uppercase ml-1 transition-colors duration-300`}>Full Name</Label>
                            <Input
                                id="fullName"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className={`h-12 rounded-xl transition-all ${isDark ? 'bg-[#0A0A0A] border-white/5 focus:border-[#C0FF00]/50' : 'bg-white border-slate-200 focus:border-indigo-600 shadow-sm'}`}
                                required
                            />
                        </div>

                        <div className="space-y-2 group">
                            <Label htmlFor="role" className={`${isDark ? 'text-gray-500' : 'text-slate-600'} text-xs font-semibold uppercase ml-1 transition-colors duration-300`}>Account Type</Label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className={`w-full h-12 bg-transparent border-2 rounded-xl px-4 outline-none text-sm transition-all ${isDark ? 'border-white/5 focus:border-[#C0FF00]/50 text-white bg-[#111]' : 'border-slate-200 focus:border-indigo-600 text-slate-900 bg-white shadow-sm'}`}
                            >
                                <option value="CLIENT" className={`${isDark ? 'bg-black text-white' : 'bg-white text-slate-900'}`}>Client</option>
                                <option value="EMPLOYEE" className={`${isDark ? 'bg-black text-white' : 'bg-white text-slate-900'}`}>Employee</option>
                                <option value="INTERN" className={`${isDark ? 'bg-black text-white' : 'bg-white text-slate-900'}`}>Intern</option>
                                <option value="FREELANCER" className={`${isDark ? 'bg-black text-white' : 'bg-white text-slate-900'}`}>Freelancer</option>
                                <option value="MANAGER" className={`${isDark ? 'bg-black text-white' : 'bg-white text-slate-900'}`}>Manager</option>
                                <option value="SUPER_ADMIN" className={`${isDark ? 'bg-black text-white' : 'bg-white text-slate-900'}`}>Admin</option>
                            </select>
                        </div>

                        <div className="space-y-2 group">
                            <Label htmlFor="email" className={`${isDark ? 'text-gray-500' : 'text-slate-600'} text-xs font-semibold uppercase ml-1 transition-colors duration-300`}>Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`h-12 rounded-xl transition-all ${isDark ? 'bg-[#0A0A0A] border-white/5 focus:border-[#C0FF00]/50' : 'bg-white border-slate-200 focus:border-indigo-600 shadow-sm'}`}
                                required
                            />
                        </div>

                        <div className="space-y-2 group">
                            <Label htmlFor="password" className={`${isDark ? 'text-gray-500' : 'text-slate-600'} text-xs font-semibold uppercase ml-1 transition-colors duration-300`}>Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`h-12 rounded-xl transition-all ${isDark ? 'bg-[#0A0A0A] border-white/5 focus:border-[#C0FF00]/50' : 'bg-white border-slate-200 focus:border-indigo-600 shadow-sm'}`}
                                required
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className={`w-full h-12 font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] group ${isDark ? 'bg-[#C0FF00] text-black hover:bg-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'}`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Create Account
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>

                    <div className={`text-center pt-8 border-t transition-colors duration-300 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                        <span className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Already have an account?</span> {' '}
                        <Link href="/login" className={`font-bold text-sm ml-2 transition-colors ${isDark ? 'text-white hover:text-[#C0FF00]' : 'text-indigo-600 hover:text-indigo-700'}`}>Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
