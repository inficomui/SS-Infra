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
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
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
        <div className="min-h-screen bg-blue-100/50 flex overflow-hidden font-sans">
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

            {/* Navigation Sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                user={user}
                handleLogout={handleLogout}
            />

            {/* Main Content Wrapper */}
            <div className={clsx(
                "flex-1 flex flex-col min-h-screen bg-background relative overflow-hidden transition-all duration-500 ease-in-out",
                isSidebarOpen ? "lg:ml-[280px]" : "lg:ml-0"
            )}>
                {/* Top Header */}
                {/* Floating Top Header */}
                <Header
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    pathname={pathname}
                />

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
