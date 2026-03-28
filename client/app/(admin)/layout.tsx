'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAppSelector } from '@/redux/hooks'
import { selectIsAuthenticated, selectCurrentUser, logout } from '@/redux/features/authSlice'
import { useDispatch } from 'react-redux'
import {
    Menu, LogOut, LayoutDashboard, User, Settings, PieChart, Users, FileText,
    CreditCard, ClipboardList, X, ChevronRight, Bell, Globe, Shield, Wallet
} from 'lucide-react'
import Link from 'next/link'
import { ModeToggle } from '@/components/ModeToggle'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAppSelector(selectIsAuthenticated)
    const user = useAppSelector(selectCurrentUser)
    const dispatch = useDispatch()
    const router = useRouter()
    const pathname = usePathname()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Close sidebar on mobile route change
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setIsSidebarOpen(false)
            else setIsSidebarOpen(true)
        }

        window.addEventListener('resize', handleResize)
        handleResize() // Init

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        if (window.innerWidth < 1024) setIsSidebarOpen(false)
    }, [pathname])

    useEffect(() => {
        const token = document.cookie.includes('admin_token')
        if (!isAuthenticated && !token) {
            router.push('/login')
        }
    }, [isAuthenticated, router])

    const handleLogout = () => {
        dispatch(logout())
        router.push('/login')
    }

    if (!isAuthenticated) return null

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Owners', href: '/users/owners', icon: Users },
        { name: 'Operators & Drivers', href: '/users/operators', icon: User },
        { name: 'Plans', href: '/plans', icon: CreditCard },
        { name: 'Subscriptions', href: '/subscriptions', icon: ClipboardList },
        { name: 'Withdrawals', href: '/withdrawals', icon: Wallet },
        { name: 'Reports', href: '/reports', icon: FileText },
        { name: 'Settings', href: '/settings', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-muted/20 flex overflow-hidden font-sans">
            {/* Sidebar Backdrop (Mobile) */}
            <AnimatePresence>
                {isMounted && isSidebarOpen && (typeof window !== 'undefined' && window.innerWidth < 1024) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: isSidebarOpen ? 280 : 0,
                    x: isSidebarOpen ? 0 : -280,
                    opacity: isSidebarOpen ? 1 : 0
                }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className={clsx(
                    "fixed lg:sticky top-0 inset-y-0 left-0 z-50 bg-card text-foreground flex flex-col border-r border-border shadow-[20px_0_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[20px_0_40px_-15px_rgba(0,0,0,0.3)] transition-colors duration-500",
                    !isSidebarOpen && "pointer-events-none"
                )}
            >
                {/* Sidebar Header */}
                <div className="h-24 flex items-center justify-between px-8 border-b border-border">
                    <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => router.push('/dashboard')}>
                        <div className="h-11 w-11 bg-linear-to-br from-primary via-primary to-yellow-600 rounded-md shadow-[0_0_20px_-5px_#facc15] flex items-center justify-center transform group-hover:rotate-6 transition-all duration-500">
                            <Shield className="h-6 w-6 text-black" strokeWidth={2.5} />
                        </div>
                        <div className="transition-all duration-300">
                            <h1 className="text-xl font-black tracking-tighter text-foreground leading-none">
                                SS <span className="text-primary italic">INFRA</span>
                            </h1>
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[9px] text-muted-foreground font-black tracking-[0.2em] uppercase opacity-70">Console v1.2</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)} 
                        className="lg:hidden text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-all active:scale-95"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Nav Items */}
                <div className="flex-1 overflow-y-auto py-10 px-6 space-y-8 custom-scrollbar">
                    <div className="space-y-2">
                        <p className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4 opacity-70">Core Management</p>
                        <div className="space-y-1">
                            {navItems.slice(0, 3).map((item) => {
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={clsx(
                                            "group flex items-center px-4 py-3.5 text-sm font-bold rounded-md transition-all duration-500 relative overflow-hidden",
                                            isActive
                                                ? 'bg-primary text-black shadow-[0_10px_20px_-10px_#facc15]'
                                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                        )}
                                    >
                                        <item.icon className={clsx(
                                            "mr-3.5 h-5 w-5 transition-transform duration-500 group-hover:scale-110",
                                            isActive ? 'text-black' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-primary'
                                        )} strokeWidth={isActive ? 2.5 : 2} />
                                        {item.name}
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-nav-glow"
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-black/60 rounded-r-full"
                                            />
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4 opacity-70">Financial Deck</p>
                        <div className="space-y-1">
                            {navItems.slice(3).map((item) => {
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={clsx(
                                            "group flex items-center px-4 py-3.5 text-sm font-bold rounded-md transition-all duration-500 relative overflow-hidden",
                                            isActive
                                                ? 'bg-primary text-black shadow-[0_10px_20px_-10px_#facc15]'
                                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                        )}
                                    >
                                        <item.icon className={clsx(
                                            "mr-3.5 h-5 w-5 transition-transform duration-500 group-hover:scale-110",
                                            isActive ? 'text-black' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-primary'
                                        )} strokeWidth={isActive ? 2.5 : 2} />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* User Profile Footer */}
                <div className="p-6 border-t border-border bg-muted/20">
                    <div className="flex items-center gap-3.5 p-3 rounded-lg bg-card border border-border group hover:border-primary/30 transition-all duration-500">
                        <div className="h-10 w-10 rounded-md bg-linear-to-tr from-primary to-yellow-600 flex items-center justify-center text-black font-black shrink-0 shadow-lg shadow-primary/20">
                            {user?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-foreground truncate">{user?.name || 'Administrator'}</p>
                            <p className="text-[9px] font-black text-muted-foreground truncate uppercase tracking-tighter opacity-70">Sys-Admin Node</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-h-screen bg-background relative overflow-hidden">
                {/* Top Header */}
                <header className="bg-background/80 backdrop-blur-xl border-b border-border h-20 flex items-center justify-between px-8 z-40 sticky top-0 transition-all">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2.5 text-muted-foreground hover:text-primary rounded-md hover:bg-muted transition-all border border-border shadow-sm"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="hidden sm:flex flex-col">
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                <span>SS Infra</span>
                                <ChevronRight className="h-3 w-3 opacity-30" />
                                <span className={clsx(
                                    "transition-colors",
                                    pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'
                                )}>Console</span>
                            </div>
                            <h2 className="text-xl font-black text-foreground tracking-tight capitalize mt-0.5">
                                {pathname?.split('/').pop()?.replace(/-/g, ' ') || 'Overview'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-2 bg-muted rounded-md px-4 py-2 border border-border">
                            <Globe className="h-4 w-4 text-primary animate-pulse" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Admin Node: Active</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-3 text-muted-foreground hover:text-primary rounded-md hover:bg-muted transition-all relative group border border-transparent hover:border-border">
                                <Bell className="h-5 w-5 group-hover:animate-swing" />
                                <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background shadow-[0_0_10px_rgba(220,38,38,0.5)]"></span>
                            </button>
                            <ModeToggle />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar scroll-smooth">
                    <div className="max-w-[1600px] mx-auto space-y-8 pb-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
