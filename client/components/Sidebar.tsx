'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import clsx from 'clsx'
import { 
    X, Shield, LogOut, LayoutDashboard, Users, User, 
    CreditCard, ClipboardList, Wallet, FileText, Settings 
} from 'lucide-react'

interface SidebarProps {
    isSidebarOpen: boolean
    setIsSidebarOpen: (open: boolean) => void
    user: any
    handleLogout: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    isSidebarOpen, 
    setIsSidebarOpen, 
    user, 
    handleLogout 
}) => {
    const pathname = usePathname()
    const router = useRouter()

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
        <motion.aside
            initial={false}
            animate={{
                width: isSidebarOpen ? 280 : 0,
                x: isSidebarOpen ? 0 : -280,
                opacity: isSidebarOpen ? 1 : 0
            }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className={clsx(
                "fixed top-0 inset-y-0 left-0 z-50 bg-background/80 dark:bg-[#0F172A]/90 backdrop-blur-xl text-foreground dark:text-white flex flex-col border-r border-blue-200 dark:border-[#1E293B] shadow-2xl transition-all duration-500",
                !isSidebarOpen && "pointer-events-none"
            )}
        >
            {/* Sidebar Header */}
            <div className="h-24 flex items-center justify-between px-8 border-b border-blue-100 dark:border-[#1E293B] relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 h-24 w-24 bg-primary/5 rounded-full blur-2xl"></div>
                
                <div className="flex items-center gap-4 group cursor-pointer relative z-10" onClick={() => router.push('/dashboard')}>
                    <div className="h-12 w-12 bg-primary rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        <Shield className="h-6 w-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="transition-all duration-300">
                        <h1 className="text-xl font-black tracking-tight text-foreground dark:text-white leading-none">
                            SS <span className="text-primary dark:text-opacity-90">ADMIN</span>
                        </h1>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] text-muted-foreground dark:text-white/60 font-bold tracking-[0.2em] uppercase opacity-80">Operational Hub</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden text-muted-foreground hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Nav Items */}
            <div className="flex-1 overflow-y-auto py-10 px-6 space-y-10 custom-scrollbar">
                <div className="space-y-3">
                    <div className="px-4 flex items-center justify-between group/title mb-4">
                        <p className="text-[10px] font-black text-foreground dark:text-white/50 uppercase tracking-[0.3em] opacity-80 group-hover/title:opacity-100 transition-opacity">Main Ops</p>
                        <div className="h-px flex-1 ml-4 bg-blue-100 dark:bg-white/5 opacity-50"></div>
                    </div>
                    <div className="space-y-1.5">
                        {navItems.slice(0, 3).map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={clsx(
                                        "group flex items-center px-4 py-4 text-sm font-bold rounded-2xl transition-all duration-300 relative overflow-hidden",
                                        isActive
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                            : 'text-zinc-600 dark:text-slate-400 hover:bg-primary/5 dark:hover:bg-white/5 hover:text-primary dark:hover:text-white'
                                    )}
                                >
                                    <item.icon className={clsx(
                                        "mr-4 h-5 w-5 transition-all duration-300",
                                        isActive ? 'text-white' : 'text-muted-foreground group-hover:text-primary dark:group-hover:text-white group-hover:scale-110'
                                    )} strokeWidth={2.5} />
                                    {item.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-nav-glow"
                                            className="absolute right-3 h-1.5 w-1.5 bg-white rounded-full shadow-[0_0_8px_white]"
                                        />
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="px-4 flex items-center justify-between group/title mb-4">
                        <p className="text-[10px] font-black text-foreground dark:text-white/50 uppercase tracking-[0.3em] opacity-80 group-hover/title:opacity-100 transition-opacity">Financials</p>
                        <div className="h-px flex-1 ml-4 bg-blue-100 dark:bg-white/5 opacity-50"></div>
                    </div>
                    <div className="space-y-1.5">
                        {navItems.slice(3).map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={clsx(
                                        "group flex items-center px-4 py-4 text-sm font-bold rounded-2xl transition-all duration-300 relative overflow-hidden",
                                        isActive
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                            : 'text-zinc-600 dark:text-slate-400 hover:bg-primary/5 dark:hover:bg-white/5 hover:text-primary dark:hover:text-white'
                                    )}
                                >
                                    <item.icon className={clsx(
                                        "mr-4 h-5 w-5 transition-all duration-300",
                                        isActive ? 'text-white' : 'text-muted-foreground group-hover:text-primary dark:group-hover:text-white group-hover:scale-110'
                                    )} strokeWidth={2.5} />
                                    {item.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-nav-glow-payments"
                                            className="absolute right-3 h-1.5 w-1.5 bg-white rounded-full shadow-[0_0_8px_white]"
                                        />
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* User Profile Footer */}
            <div className="p-6 border-t border-blue-100 dark:border-[#1E293B] bg-primary/5 dark:bg-black/20">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-blue-100 dark:border-white/5 group hover:border-primary/30 transition-all duration-300 shadow-sm dark:shadow-xl">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black shrink-0 shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        {user?.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-foreground dark:text-white truncate tracking-tight">{user?.name || 'Administrator'}</p>
                        <p className="text-[10px] font-bold text-primary dark:text-primary/90 truncate uppercase tracking-widest opacity-80">Executive</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </motion.aside>
    )
}
