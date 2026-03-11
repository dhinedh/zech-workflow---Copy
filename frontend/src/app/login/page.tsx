
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Mail,
    ArrowRight,
    Loader2,
    Lock,
    Command,
    Zap,
    Cpu,
    Terminal,
    Fingerprint,
    Sparkles,
    Sun,
    Moon
} from "lucide-react"
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const { login: storeLogin, isAuthenticated, user } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/auth/login', {
                identifier: email,
                password,
            });

            if (response.data.success) {
                const { user: userData, accessToken } = response.data.data;
                storeLogin(userData, accessToken);

                // Redirect based on role
                switch (userData.role) {
                    case 'SUPER_ADMIN': router.push('/admin'); break;
                    case 'MANAGER': router.push('/manager'); break;
                    case 'EMPLOYEE': router.push('/employee'); break;
                    case 'FREELANCER': router.push('/freelancer'); break;
                    case 'CLIENT': router.push('/client'); break;
                    default: router.push('/dashboard');
                }
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            switch (user.role) {
                case 'SUPER_ADMIN': router.push('/admin'); break;
                case 'MANAGER': router.push('/manager'); break;
                case 'EMPLOYEE': router.push('/employee'); break;
                case 'FREELANCER': router.push('/freelancer'); break;
                case 'CLIENT': router.push('/client'); break;
                default: router.push('/dashboard');
            }
        }
    }, [isAuthenticated, user, router]);

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

            {/* Left Side: Innovation Hub Visual */}
            <div className={`hidden lg:flex w-1/2 relative flex-col border-r transition-colors duration-500 overflow-hidden ${isDark ? 'border-white/5' : 'border-slate-300 bg-slate-200'}`}>
                {/* Background patterns */}
                {isDark ? (
                    <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a1a1a_0%,transparent_100%)]" />
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C0FF00]/10 rounded-full blur-[100px] animate-pulse" />
                    </>
                ) : (
                    <>
                        <div className="absolute inset-0 opacity-[0.6]" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1.5px, transparent 1.5px), linear-gradient(90deg, #cbd5e1 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />
                    </>
                )}

                <div className="relative z-10 p-16 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-16">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center -rotate-6 transition-all duration-300 ${isDark ? 'bg-[#C0FF00] shadow-[0_0_20px_rgba(192,255,0,0.3)]' : 'bg-indigo-600 shadow-xl shadow-indigo-200'}`}>
                                <Command className={`${isDark ? 'text-black' : 'text-white'} h-6 w-6`} />
                            </div>
                            <span className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>ZECH.OS</span>
                        </div>

                        <div className="space-y-6 max-w-md">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold transition-colors duration-300 ${isDark ? 'bg-white/5 border-white/10 text-[#C0FF00]' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                                <Sparkles className="h-3 w-3" />
                                <span>LATEST STABLE</span>
                            </div>
                            <h1 className="text-6xl font-bold leading-none tracking-tight">
                                Streamline your <br />
                                <span className={`${isDark ? 'text-[#C0FF00]' : 'text-indigo-600'} italic`}>entire workflow.</span>
                            </h1>

                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Status Mockup */}
                        <div className={`rounded-xl border p-6 text-sm overflow-hidden relative group transition-all duration-500 ${isDark ? 'bg-[#111] border-white/10' : 'bg-slate-900 border-slate-800 shadow-2xl shadow-slate-200'}`}>
                            <div className="flex gap-1.5 mb-4">
                                <div className="w-3 h-3 rounded-full bg-slate-500/20" />
                                <div className="w-3 h-3 rounded-full bg-slate-500/20" />
                                <div className="w-3 h-3 rounded-full bg-slate-500/20" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex gap-2 text-gray-500 font-mono">
                                    <span>$</span>
                                    <span>system analytics --status</span>
                                </div>
                                <div className={`font-semibold ${isDark ? 'text-[#C0FF00]' : 'text-indigo-400'}`}>Workspace Ready</div>
                                <div className="text-white font-medium">All systems operational</div>
                            </div>
                            <div className="absolute top-2 right-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                <Cpu className="h-12 w-12 text-white" />
                            </div>
                        </div>

                        <div className={`flex items-center gap-12 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                            <div className="flex items-center gap-2 group cursor-default">
                                <Zap className={`h-4 w-4 transition-colors ${isDark ? 'group-hover:text-[#C0FF00]' : 'group-hover:text-indigo-600'}`} />
                                <span>High Performance</span>
                            </div>
                            <div className="flex items-center gap-2 group cursor-default">
                                <Fingerprint className={`h-4 w-4 transition-colors ${isDark ? 'group-hover:text-[#C0FF00]' : 'group-hover:text-indigo-600'}`} />
                                <span>Secure Access</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Startup Auth Form */}
            <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto h-full transition-colors duration-500 ${isDark ? 'bg-[#050505]' : 'bg-white'}`}>
                <div className="w-full max-w-sm space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="lg:hidden flex items-center gap-2 mb-12 justify-center">
                        <div className={`w-8 h-8 rounded flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-[#C0FF00] shadow-[0_0_15px_rgba(192,255,0,0.2)]' : 'bg-indigo-600 shadow-lg shadow-indigo-100'}`}>
                            <Command className={`${isDark ? 'text-black' : 'text-white'} h-5 w-5`} />
                        </div>
                        <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>ZECH.OS</span>
                    </div>

                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
                        <p className={`${isDark ? 'text-gray-500' : 'text-slate-500'} font-medium transition-colors duration-300`}>Please enter your credentials to access your account.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className={`border p-4 rounded-xl text-xs flex items-center gap-3 animate-in shake duration-500 ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${isDark ? 'bg-red-500' : 'bg-red-600'}`} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2 group">
                            <Label htmlFor="email" className={`${isDark ? 'text-gray-400' : 'text-slate-600'} text-xs font-semibold uppercase ml-1 transition-colors duration-300`}>Email Address</Label>
                            <div className="relative">
                                <Mail className={`absolute left-4 top-3.5 h-4 w-4 transition-colors ${isDark ? 'text-gray-600 group-focus-within:text-[#C0FF00]' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`pl-12 h-12 transition-all rounded-xl ${isDark ? 'bg-[#0A0A0A] border-white/5 focus:border-[#C0FF00]/50' : 'bg-white border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 shadow-sm'}`}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <div className="flex justify-between items-center ml-1">
                                <Label htmlFor="password" className={`${isDark ? 'text-gray-400' : 'text-slate-600'} text-xs font-semibold uppercase transition-colors duration-300`}>Password</Label>
                                <Link href="#" className={`text-xs font-medium transition-colors ${isDark ? 'text-gray-600 hover:text-[#C0FF00]' : 'text-indigo-600'}`}>Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock className={`absolute left-4 top-3.5 h-4 w-4 transition-colors ${isDark ? 'text-gray-600 group-focus-within:text-[#C0FF00]' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`pl-12 h-12 transition-all rounded-xl ${isDark ? 'bg-[#0A0A0A] border-white/5 focus:border-[#C0FF00]/50' : 'bg-white border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 shadow-sm'}`}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className={`w-full h-12 font-bold rounded-xl transition-all shadow-lg active:scale-95 group overflow-hidden ${isDark ? 'bg-[#C0FF00] text-black hover:bg-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <span>Sign In</span>
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </Button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className={`w-full border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] font-semibold uppercase tracking-widest">
                                <span className={`px-4 ${isDark ? 'bg-[#050505] text-gray-700' : 'bg-slate-50 text-slate-400'}`}>or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className={`h-12 bg-transparent rounded-xl font-semibold text-xs transition-colors ${isDark ? 'border-white/5 text-gray-400 hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300'}`} type="button">
                                <span className="mr-2">Google</span>
                                <div className="h-2 w-2 rounded-full bg-blue-500/50" />
                            </Button>
                            <Button variant="outline" className={`h-12 bg-transparent rounded-xl font-semibold text-xs transition-colors ${isDark ? 'border-white/5 text-gray-400 hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300'}`} type="button">
                                <span className="mr-2">GitHub</span>
                                <div className={`h-2 w-2 rounded-full ${isDark ? 'bg-slate-500' : 'bg-black/50'}`} />
                            </Button>
                        </div>
                    </form>

                    <p className={`text-center text-sm pt-4 transition-colors duration-300 ${isDark ? 'text-gray-600' : 'text-slate-500'}`}>
                        Don't have an account? <Link href="/register" className={`font-bold underline underline-offset-4 transition-colors ${isDark ? 'text-white hover:text-[#C0FF00]' : 'text-indigo-600 hover:text-indigo-700'}`}>Create a new account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

const Github = ({ className }: any) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
)
