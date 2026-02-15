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
        { name: 'Operators', href: '/users/operators', icon: User },
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
                {isSidebarOpen && (window.innerWidth < 1024) && (
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
                    x: isSidebarOpen ? 0 : '-100%',
                    width: isSidebarOpen ? (typeof window !== 'undefined' && window.innerWidth >= 1024 ? 280 : '100%') : 0
                }}
                transition={{ duration: 0.3, type: 'spring', damping: 25, stiffness: 200 }}
                className={clsx(
                    "fixed lg:static inset-y-0 left-0 z-50 bg-card text-foreground shadow-2xl flex flex-col border-r border-border",
                    "lg:shadow-none lg:w-72 xl:w-72 w-80"
                )}
                style={{
                    transform: !isSidebarOpen ? 'translateX(-100%)' : 'none',
                    position: typeof window !== 'undefined' && window.innerWidth < 1024 ? 'fixed' : 'relative'
                }}
            >
                {/* Sidebar Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-border bg-muted/20 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-linear-to-br from-primary to-yellow-600 rounded-md shadow-lg shadow-primary/20 flex items-center justify-center transform rotate-3 group-hover:rotate-0 transition-transform">
                            <Shield className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground leading-none">SS <span className="text-primary italic">Infra</span></h1>
                            <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase opacity-70">Admin Console</span>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-md transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5 custom-scrollbar">
                    <p className="px-5 text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-4">Operations Hub</p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    "group flex items-center px-5 py-3.5 text-sm font-bold rounded-md transition-all duration-300 relative overflow-hidden",
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20'
                                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:translate-x-1'
                                )}
                            >
                                <item.icon className={clsx(
                                    "mr-3.5 h-5 w-5 transition-transform group-hover:scale-110",
                                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
                                )} />
                                {item.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav-indicator"
                                        className="absolute right-4 h-1.5 w-1.5 rounded-md bg-primary-foreground/50"
                                    />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-border bg-muted/5">
                    <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-all border border-border/50 group cursor-pointer">
                        <div className="h-10 w-10 rounded-md bg-linear-to-tr from-primary/80 to-yellow-600 flex items-center justify-center text-primary-foreground font-black shrink-0 shadow-lg shadow-primary/10">
                            {user?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-foreground truncate">{user?.name || 'Administrator'}</p>
                            <p className="text-[10px] font-bold text-muted-foreground/70 truncate uppercase tracking-tighter">System Level Auth</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-muted/20 relative">
                {/* Top Header */}
                <header className="bg-background/80 backdrop-blur-md border-b border-border h-20 flex items-center justify-between px-6 sm:px-8 z-30 sticky top-0 transition-all">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors border border-transparent hover:border-border"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold text-foreground capitalize flex items-center gap-2">
                                {pathname?.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
                            </h2>
                            <div className="hidden sm:flex text-xs text-muted-foreground gap-1 items-center">
                                <span className='opacity-60'>SS Infra</span>
                                <span className='opacity-40'>/</span>
                                <span className='text-primary opacity-80 capitalize'>{pathname?.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="hidden md:flex items-center bg-muted/50 rounded-md px-3 py-1.5 border border-transparent hover:border-border transition-colors">
                            <Globe className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                            <span className="text-xs font-medium text-muted-foreground">Admin Portal v1.2</span>
                        </div>

                        <button className="p-2.5 text-muted-foreground hover:text-primary rounded-md hover:bg-muted transition-all relative group">
                            <Bell className="h-5 w-5 group-hover:animate-swing" />
                            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-md bg-red-500 ring-2 ring-background animate-pulse"></span>
                        </button>

                        <div className="h-8 w-px bg-border mx-1 opacity-50"></div>
                        <ModeToggle />
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
