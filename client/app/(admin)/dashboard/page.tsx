'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useGetDashboardStatsQuery } from '@/redux/apis/dashboardApi'
import { useGetAllSubscriptionsQuery } from '@/redux/apis/subscriptionApi'
import { useGetWithdrawalRequestsQuery } from '@/redux/apis/walletApi'
import { useAppSelector } from '@/redux/hooks'
import { selectCurrentUser } from '@/redux/features/authSlice'
import { Users, CreditCard, TrendingUp, Activity, UserPlus, FileText, ArrowUpRight, ArrowDownRight, MoreHorizontal, Calendar, RefreshCw, Shield, ClipboardList, Wallet, ExternalLink } from 'lucide-react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

// Helper: group recharges by day-of-week
function buildRevenueData(recharges: any[]) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const map: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 }
    recharges?.forEach((r: any) => {
        const d = new Date(r.createdAt)
        const label = days[d.getDay()]
        map[label] = (map[label] || 0) + (Number(r.amount) || 0)
    })
    return days.map(d => ({ name: d, revenue: map[d] }))
}

// Helper: group signups by month
function buildUserGrowthData(signups: any[]) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const map: Record<string, number> = {}
    months.forEach(m => { map[m] = 0 })
    signups?.forEach((s: any) => {
        const m = new Date(s.createdAt).toLocaleString('en', { month: 'short' })
        if (map[m] !== undefined) map[m]++
    })
    const now = new Date().getMonth()
    return months.slice(0, now + 1).map(m => ({ name: m, users: map[m] }))
}

export default function Dashboard() {
    const user = useAppSelector(selectCurrentUser)
    const { data, isLoading, error, refetch } = useGetDashboardStatsQuery(undefined, { pollingInterval: 60000 })
    const { data: subData } = useGetAllSubscriptionsQuery({ limit: 100 })
    const { data: wdData } = useGetWithdrawalRequestsQuery({ limit: 5, status: 'pending' })
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => { setIsMounted(true) }, [])

    const stats = data?.dashboard || {}

    const revenueData = useMemo(() => buildRevenueData(stats.recentRecharges || []), [stats.recentRecharges])
    const userGrowthData = useMemo(() => buildUserGrowthData(stats.recentSignups || []), [stats.recentSignups])

    const activeSubscriptions = subData?.subscriptions?.filter((s: any) => s.status === 'active').length ?? 0
    const totalSubscriptions = subData?.pagination?.totalItems ?? 0
    const pendingWithdrawals = wdData?.pagination?.total ?? 0

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 animate-pulse">
                    {[1,2,3,4,5,6].map((i) => (
                        <div key={i} className="bg-card h-40 rounded-xl shadow-sm border border-border/50"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
                    <div className="lg:col-span-2 bg-card h-80 rounded-xl border border-border/50"></div>
                    <div className="bg-card h-80 rounded-xl border border-border/50"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return <div className="text-destructive font-medium p-6 bg-destructive/10 rounded-xl border border-destructive/20 m-8">Error loading dashboard metrics.</div>
    }

    const totalOwners = stats.users?.totalOwners ?? 0
    const totalOperators = stats.users?.totalOperators ?? 0
    const totalUsers = stats.users?.totalUsers ?? (totalOwners + totalOperators)
    const totalEarnings = stats.recharges?.totalAmount ?? 0
    const pendingCount = stats.recharges?.pendingCount ?? 0
    const completedCount = stats.recharges?.completedCount ?? 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
        >
            {/* 6 Dynamic KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
                <StatsCard title="Total Earnings" value={`₹${totalEarnings.toLocaleString()}`} icon={CreditCard} sub={`${completedCount} completed`} trendUp={true} color="text-emerald-500" bgColor="bg-emerald-500/10" />
                <StatsCard title="Total Users" value={totalUsers} icon={Users} sub={`${totalOwners} owners`} trendUp={true} color="text-blue-500" bgColor="bg-blue-500/10" />
                <StatsCard title="Active Drivers" value={totalOperators} icon={Shield} sub="Operators" trendUp={true} color="text-indigo-500" bgColor="bg-indigo-500/10" />
                <StatsCard title="Pending Payments" value={pendingCount} icon={Activity} sub="Awaiting review" trendUp={false} attention={pendingCount > 0} color="text-amber-500" bgColor="bg-amber-500/10" />
                <StatsCard title="Subscriptions" value={totalSubscriptions} icon={ClipboardList} sub={`${activeSubscriptions} active`} trendUp={true} color="text-purple-500" bgColor="bg-purple-500/10" />
                <StatsCard title="Withdrawals" value={pendingWithdrawals} icon={Wallet} sub="Pending approval" trendUp={false} attention={pendingWithdrawals > 0} color="text-rose-500" bgColor="bg-rose-500/10" />
            </div>

            {/* Quick Action Nav */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {[
                    { label: 'Owners', href: '/users/owners', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Operators', href: '/users/operators', icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                    { label: 'Plans', href: '/plans', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Subscriptions', href: '/subscriptions', icon: ClipboardList, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Withdrawals', href: '/withdrawals', icon: Wallet, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                    { label: 'Reports', href: '/reports', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map((item) => (
                    <Link key={item.href} href={item.href}
                        className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer">
                        <div className={clsx('h-10 w-10 rounded-xl flex items-center justify-center border border-border', item.bg, item.color)}>
                            <item.icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                    </Link>
                ))}
            </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-card border border-border shadow-sm rounded-[16px] p-6 lg:p-8 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="font-bold text-xl text-foreground tracking-tight">Money Stats</h3>
                        <p className="text-sm text-foreground font-medium mt-1">Daily sales & new users</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/20 group-hover:rotate-6 transition-transform">
                        <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                </div>

                <div className="h-[350px] w-full mt-4">
                    {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border dark:text-white" opacity={0.2} />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 700 }}
                                    className="text-foreground"
                                    dy={15}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 700 }}
                                    className="text-foreground"
                                    tickFormatter={(value) => "₹" + value}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#2563EB', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    contentStyle={{
                                        backgroundColor: 'var(--card)',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        backdropFilter: 'blur(10px)',
                                        padding: '12px 16px',
                                        color: 'var(--foreground)',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ color: '#2563EB', fontWeight: 600, fontSize: '14px' }}
                                    labelStyle={{ color: '#64748B', fontWeight: 600, fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase' }}
                                    formatter={(value: any) => ["₹" + value.toLocaleString(), 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#2563EB"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    strokeWidth={4}
                                    animationDuration={2500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* User Growth Chart */}
            <div className="bg-card border border-border shadow-sm rounded-[16px] p-6 lg:p-8 relative group overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="font-bold text-xl text-foreground tracking-tight">User Growth</h3>
                        <p className="text-sm text-foreground font-medium mt-1">New users per month</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/20 group-hover:rotate-6 transition-transform">
                        <UserPlus className="h-6 w-6 text-primary" />
                    </div>
                </div>

                <div className="h-[350px] w-full">
                    {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border dark:text-white" opacity={0.2} />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 700 }}
                                    className="text-foreground"
                                    dy={15}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(37,99,235,0.05)' }}
                                    contentStyle={{
                                        backgroundColor: 'var(--card)',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    labelStyle={{ display: 'none' }}
                                />
                                <Bar dataKey="users" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
            {/* Recent Identifiers */}
            <div className="bg-card border border-border shadow-sm rounded-[16px] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border flex justify-between items-center bg-blue-100/50">
                    <h3 className="font-bold text-lg text-foreground tracking-tight">New Users</h3>
                    <button className="text-[10px] font-bold text-primary px-4 py-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-all uppercase tracking-widest border border-primary/20">Full List</button>
                </div>
                <div className="divide-y divide-border/20 flex-1">
                    {stats.recentSignups?.slice(0, 5).map((signup: any, idx: number) => (
                        <motion.div
                            key={signup.id || idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-6 flex items-center justify-between hover:bg-muted/10 transition-all group cursor-pointer"
                        >
                            <div className="flex items-center space-x-5">
                                <div className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-linear-to-br from-zinc-700 to-zinc-900 text-sm font-bold text-white shadow-lg transition-all duration-300">
                                    <span className="relative z-10">{signup.name[0]?.toUpperCase()}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">{signup.name}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className={clsx(
                                            "text-[9px] px-2.5 py-1 rounded-md uppercase tracking-widest font-bold",
                                            signup.role === 'OWNER' ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                                        )}>
                                            {signup.role}
                                        </span>
                                        <span className="text-[10px] text-foreground font-bold opacity-60">• {signup.district}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-foreground font-bold uppercase tracking-tighter">
                                    {new Date(signup.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </p>
                                <ArrowUpRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all mt-1 ml-auto" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Recent Ledger */}
            <div className="bg-card border border-border shadow-sm rounded-[16px] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border flex justify-between items-center bg-blue-100/50">
                    <h3 className="font-bold text-lg text-foreground tracking-tight">Recent Payments</h3>
                    <button className="text-[10px] font-bold text-primary px-4 py-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-all uppercase tracking-widest border border-primary/20">See All</button>
                </div>
                <div className="divide-y divide-border/20 flex-1">
                    {stats.recentRecharges?.slice(0, 5).map((txn: any, idx: number) => (
                        <motion.div
                            key={txn.id || idx}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-6 flex items-center justify-between hover:bg-muted/10 transition-all group cursor-pointer"
                        >
                            <div className="flex items-center space-x-5">
                                <div className={clsx(
                                    "h-12 w-12 rounded-xl flex items-center justify-center border border-white/5",
                                    txn.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                        txn.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                            'bg-red-500/10 text-red-500'
                                )}>
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-foreground">₹{txn.amount.toLocaleString()}</p>
                                        <span className="text-[10px] font-bold text-foreground opacity-60">via {txn.paymentMethod}</span>
                                    </div>
                                    <p className="text-xs text-foreground font-bold mt-1 group-hover:text-foreground transition-colors">{txn.user?.name}</p>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className={clsx(
                                    "inline-flex items-center text-[9px] px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-tighter border",
                                    txn.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                        txn.status === 'pending' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                            "bg-red-500/10 text-red-500 border-red-500/20"
                                )}>
                                    {txn.status}
                                </span>
                                <span className="text-[10px] text-foreground font-bold mt-2 opacity-40">System checking...</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    </motion.div>
)
}

function StatsCard({ title, value, icon: Icon, sub, trendUp, color, bgColor, attention }: any) {
    return (
        <motion.div
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }}
            className={clsx(
                "bg-card border border-border shadow-sm rounded-[16px] p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-md",
                attention && "ring-1 ring-amber-500/30"
            )}
        >
            {/* Glossy Background Accent */}
            <div className={clsx(
                "absolute -top-24 -right-24 h-64 w-64 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-full",
                bgColor
            )}></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className={clsx(
                    "h-12 w-12 rounded-[12px] flex items-center justify-center border border-border shadow-sm transition-all duration-300 group-hover:scale-105",
                    bgColor,
                    color
                )}>
                    <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className={clsx(
                    "flex items-center text-[10px] font-bold px-2 py-1 rounded-lg border",
                    trendUp
                        ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                        : "text-red-400 bg-red-500/10 border-red-500/20"
                )}>
                    {trendUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                </div>
            </div>

            <div className="relative z-10">
                <p className="text-[10px] font-bold text-foreground uppercase tracking-widest opacity-70 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-foreground tracking-tight leading-none group-hover:text-primary transition-colors">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </h3>
                {sub && <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">{sub}</p>}
            </div>

            {/* Bottom bar */}
            <div className="mt-5 flex items-center gap-2 relative z-10">
                <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "65%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={clsx("h-full rounded-full", color.replace('text-', 'bg-'))}
                    ></motion.div>
                </div>
            </div>
        </motion.div>
    )
}
