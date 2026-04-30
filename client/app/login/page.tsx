'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useLoginMutation } from '@/redux/apis/authApi'
import { setCredentials } from '@/redux/features/authSlice'
import { Loader2, Lock, Mail, Eye, EyeOff, LayoutDashboard, ArrowRight, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { motion } from 'framer-motion'

export default function LoginPage() {
    const [loginInput, setLoginInput] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [login, { isLoading }] = useLoginMutation()
    const dispatch = useDispatch()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!loginInput || !password) {
            toast.error('Please fill in all fields')
            return
        }

        try {
            const result = await login({ login: loginInput, password }).unwrap()
            if (result.success) {
                dispatch(setCredentials({ user: result.admin, token: result.token }))
                toast.success('Welcome Back, Admin!')
                router.push('/dashboard')
            } else {
                toast.error(result.message || 'Invalid credentials.')
            }
        } catch (err: any) {
            console.error('Login failed', err)
            const errorMessage = err?.data?.message || 'Invalid credentials. Please try again.'
            toast.error(errorMessage)
        }
    }

    return (
        <div className="min-h-screen w-full flex bg-background selection:bg-primary/30">
            {/* Left Panel - Premium Branding */}
            <div className="hidden lg:flex w-[45%] bg-[#0F172A] relative items-center justify-center overflow-hidden border-r border-border">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] to-[#1E293B]"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]"></div>

                {/* Moving Grid Lines for Tech feel */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                <div className="relative z-10 w-full max-w-lg p-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative group">
                            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <LayoutDashboard className="h-10 w-10 text-white relative z-10" />
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight leading-none">
                                SS <span className="text-primary text-opacity-90">ADMIN</span>
                                <span className="block h-1.5 w-16 bg-primary mt-6 rounded-full"></span>
                            </h1>
                            <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-sm mt-4">
                                Enterprise-grade infrastructure control. Secure your operations.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 pt-4">
                            {[
                                { icon: ShieldCheck, text: "Admin Panel Access" },
                                { icon: ArrowRight, text: "Real-time Monitoring" }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (idx * 0.1) }}
                                    className="flex items-center gap-3 text-foreground font-medium"
                                >
                                    <item.icon className="h-5 w-5 text-primary/60" />
                                    <span>{item.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Footer for Left Side */}
                <div className="absolute bottom-8 left-12">
                    <p className="text-xs text-zinc-600 font-semibold tracking-widest uppercase">Admin Panel</p>
                </div>
            </div>

            {/* Right Panel - Polished Form */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 md:p-20 bg-background">
                <div className="w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-card p-8 sm:p-12 rounded-[16px] shadow-xl border border-border overflow-hidden"
                    >
                        <div className="mb-10 text-center sm:text-left">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground">
                                Secure Login
                            </h2>
                            <p className="mt-2 text-sm text-foreground font-medium">
                                Authenticate to access the command center.
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-foreground ml-1">Login ID</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            className="block w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-[12px] text-foreground placeholder:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                            placeholder="Email or Mobile"
                                            value={loginInput}
                                            onChange={(e) => setLoginInput(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="block text-sm font-bold text-foreground">Password</label>
                                        <a href="#" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">
                                            Recover Access
                                        </a>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            className="block w-full pl-12 pr-12 py-3.5 bg-background border border-border rounded-[12px] text-foreground placeholder:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-primary transition-colors"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 ml-1">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 transition-all cursor-pointer"
                                />
                                <label htmlFor="remember" className="text-sm font-semibold text-foreground cursor-pointer select-none">
                                    Trust this device
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-4 px-4 bg-primary hover:bg-primary/90 text-white font-bold text-base rounded-[12px] shadow-sm transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <>
                                        Authenticate <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    <p className="mt-8 text-center text-xs text-foreground font-medium uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} SS Infra Ecosystem. Protected Node.
                    </p>
                </div>
            </div>
        </div>
    )
}
