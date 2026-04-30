'use client'

import React from 'react'
import { Menu, ChevronRight, Globe, Bell } from 'lucide-react'
import { ModeToggle } from './ModeToggle'
import clsx from 'clsx'

interface HeaderProps {
    isSidebarOpen: boolean
    setIsSidebarOpen: (open: boolean) => void
    pathname: string
}

export const Header: React.FC<HeaderProps> = ({
    isSidebarOpen,
    setIsSidebarOpen,
    pathname
}) => {
    return (
        <header className="h-20 flex items-center justify-between px-8 sticky top-0 z-40 bg-background/60 backdrop-blur-2xl border-b border-blue-100 dark:border-white/5 transition-all duration-500">
            {/* Left Section: Nav Toggle & Breadcrumbs */}
            <div className="flex items-center gap-6">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="group relative p-3 text-foreground hover:text-primary transition-all duration-300 rounded-2xl bg-white/50 dark:bg-white/5 border border-blue-100 dark:border-white/10 shadow-sm hover:shadow-md active:scale-90"
                >
                    <Menu className={clsx("h-5 w-5 transition-transform duration-500", !isSidebarOpen && "rotate-180")} />
                    <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>

                <div className="hidden sm:flex flex-col">
                    <div className="flex items-center gap-2.5 text-[10px] font-black text-foreground dark:text-white/70 uppercase tracking-[0.2em]">
                        <span className="hover:text-primary transition-colors cursor-pointer">SS Ecosystem</span>
                        <ChevronRight className="h-3 w-3 opacity-30" />
                        <span className="text-primary/80">Command Center</span>
                    </div>
                    <h2 className="text-xl font-black text-foreground tracking-tight capitalize mt-1 flex items-center gap-2">
                        {pathname?.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard Overview'}
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                    </h2>
                </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-5">
                {/* Status Indicator */}
                <div className="hidden lg:flex items-center gap-3 bg-primary/5 dark:bg-primary/10 rounded-2xl px-5 py-2.5 border border-primary/20 group hover:bg-primary/10 transition-all duration-500 cursor-default">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">System Active</span>
                </div>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-blue-100 dark:bg-white/10 hidden sm:block"></div>

                <div className="flex items-center gap-3">
                    {/* Alerts Button */}
                    <button className="group relative p-3 text-foreground hover:text-primary rounded-2xl bg-white/50 dark:bg-white/5 border border-blue-100 dark:border-white/10 transition-all active:scale-90 overflow-hidden">
                        <Bell className="h-5 w-5 relative z-10 group-hover:animate-swing" />
                        <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background z-20 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                        <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>

                    {/* Theme Toggle */}
                    <div className="p-1 bg-blue-50 dark:bg-white/5 rounded-2xl border border-blue-100 dark:border-white/10">
                        <ModeToggle />
                    </div>
                </div>
            </div>

            {/* Top Gloss Effect */}
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent"></div>
        </header>
    )
}
