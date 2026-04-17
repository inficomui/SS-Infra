'use client'

import React, { useState, useEffect } from 'react'
import { useGetDashboardStatsQuery } from '@/redux/apis/dashboardApi'
import { useAppSelector } from '@/redux/hooks'
import { selectCurrentUser } from '@/redux/features/authSlice'
import { Users, CreditCard, TrendingUp, Activity, UserPlus, FileText, ArrowUpRight, ArrowDownRight, MoreHorizontal, Calendar, RefreshCw, Shield } from 'lucide-react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

// Mock Data for Charts (Replace with real API data when available)
const revenueData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
]

const userGrowthData = [
    { name: 'Jan', users: 400 },
    { name: 'Feb', users: 300 },
    { name: 'Mar', users: 200 },
    { name: 'Apr', users: 278 },
    { name: 'May', users: 189 },
]

export default function Dashboard() {
    const user = useAppSelector(selectCurrentUser)
    const { data, isLoading, error, refetch } = useGetDashboardStatsQuery(undefined, {
        pollingInterval: 60000
    })
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const stats = data?.dashboard || {}

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse p-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card h-40 rounded-xl shadow-sm border border-border/50"></div>
                ))}
            </div>
        )
    }

    if (error) {
        return <div className="text-destructive font-medium p-6 bg-destructive/10 rounded-xl border border-destructive/20 m-8">Error loading dashboard metrics.</div>
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
        >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Earnings"
                    value={`₹${stats.recharges?.totalAmount?.toLocaleString() || '0'}`}
                    icon={CreditCard}
                    trend="+12.5%"
                    trendUp={true}
                    color="text-emerald-500"
                    bgColor="bg-emerald-500/10"
                />
                <StatsCard
                    title="Total Users"
                    value={stats.users?.totalUsers || 0}
                    icon={Users}
                    trend="+5.2%"
                    trendUp={true}
                    color="text-blue-500"
                    bgColor="bg-blue-500/10"
                />
                <StatsCard
                    title="Active Drivers"
                    value={stats.users?.totalOperators || 0}
                    icon={Shield}
                    trend="+2.4%"
                    trendUp={true}
                    color="text-indigo-500"
                    bgColor="bg-indigo-500/10"
                />
                <StatsCard
                    title="Waiting Tasks"
                    value={stats.recharges?.pendingCount || 0}
                    icon={Activity}
                    trend="-1.5%"
                    trendUp={false}
                    color="text-yellow-500"
                    bgColor="bg-yellow-500/10"
                    attention={true}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl p-8 relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="font-black text-xl text-foreground tracking-tight">Money Stats</h3>
                            <p className="text-sm text-muted-foreground font-medium mt-1">Daily sales & new users</p>
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
                                            <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.1} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 700 }}
                                        className="text-muted-foreground"
                                        dy={15}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 700 }}
                                        className="text-muted-foreground"
                                        tickFormatter={(value) => "₹" + value}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#facc15', strokeWidth: 2, strokeDasharray: '5 5' }}
                                        contentStyle={{
                                            backgroundColor: 'var(--card)',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            backdropFilter: 'blur(10px)',
                                            padding: '12px 16px',
                                            color: 'var(--foreground)',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                        }}
                                        itemStyle={{ color: '#facc15', fontWeight: 900, fontSize: '14px' }}
                                        labelStyle={{ color: '#aaa', fontWeight: 600, fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                                        formatter={(value: any) => ["₹" + value.toLocaleString(), 'Revenue']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#facc15"
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
                <div className="bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl p-8 relative group overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="font-black text-xl text-foreground tracking-tight">User Growth</h3>
                            <p className="text-sm text-muted-foreground font-medium mt-1">New users per month</p>
                        </div>
                        <div className="h-12 w-12 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/20 group-hover:rotate-6 transition-transform">
                            <UserPlus className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    
                    <div className="h-[350px] w-full">
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={userGrowthData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.1} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 700 }}
                                        className="text-muted-foreground"
                                        dy={15}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{
                                            backgroundColor: 'var(--card)',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            backdropFilter: 'blur(10px)',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                        }}
                                        labelStyle={{ display: 'none' }}
                                    />
                                    <Bar dataKey="users" fill="#facc15" radius={[8, 8, 2, 2]} barSize={28} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                {/* Recent Identifiers */}
                <div className="bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-zinc-200/50 dark:border-white/5 flex justify-between items-center bg-muted/20 dark:bg-zinc-800/20">
                        <h3 className="font-black text-xl text-foreground dark:text-white tracking-tight">New Users</h3>
                        <button className="text-[10px] font-black text-primary px-4 py-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-all uppercase tracking-widest border border-primary/20">Full List</button>
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
                                        <p className="text-sm font-black text-foreground">{signup.name}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={clsx(
                                                "text-[9px] px-2.5 py-1 rounded-md uppercase tracking-widest font-black",
                                                signup.role === 'OWNER' ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                                            )}>
                                                {signup.role}
                                            </span>
                                            <span className="text-[10px] text-zinc-500 font-bold opacity-60">• {signup.district}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">
                                        {new Date(signup.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </p>
                                    <ArrowUpRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all mt-1 ml-auto" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Recent Ledger */}
                <div className="bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-zinc-200/50 dark:border-white/5 flex justify-between items-center bg-muted/20 dark:bg-zinc-800/20">
                        <h3 className="font-black text-xl text-foreground dark:text-white tracking-tight">Recent Payments</h3>
                        <button className="text-[10px] font-black text-primary px-4 py-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-all uppercase tracking-widest border border-primary/20">See All</button>
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
                                            <p className="text-sm font-black text-foreground">₹{txn.amount.toLocaleString()}</p>
                                            <span className="text-[10px] font-bold text-zinc-500 opacity-60">via {txn.paymentMethod}</span>
                                        </div>
                                        <p className="text-xs text-zinc-500 font-bold mt-1 group-hover:text-foreground transition-colors">{txn.user?.name}</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className={clsx(
                                        "inline-flex items-center text-[9px] px-2.5 py-1.5 rounded-lg font-black uppercase tracking-tighter border",
                                        txn.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                            txn.status === 'pending' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                                "bg-red-500/10 text-red-500 border-red-500/20"
                                    )}>
                                        {txn.status}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-bold mt-2 opacity-40">System checking...</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

function StatsCard({ title, value, icon: Icon, trend, trendUp, color, bgColor, attention }: any) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } }}
            className={clsx(
                "bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl p-8 relative overflow-hidden group transition-all duration-500",
                attention && "ring-2 ring-yellow-500/20"
            )}
        >
            {/* Glossy Background Accent */}
            <div className={clsx(
                "absolute -top-24 -right-24 h-64 w-64 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-full",
                bgColor
            )}></div>

            <div className="flex items-center justify-between mb-10 relative z-10">
                <div className={clsx(
                    "h-16 w-16 rounded-2xl flex items-center justify-center border border-zinc-200/50 dark:border-white/10 shadow-sm transition-all duration-500 group-hover:rotate-12 group-hover:scale-110",
                    bgColor, 
                    color
                )}>
                    <Icon className="h-8 w-8" strokeWidth={2.5} />
                </div>
                {trend && (
                    <div className={clsx(
                        "flex items-center text-[10px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-xl border transition-all duration-300",
                        trendUp 
                            ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
                            : "text-red-500 bg-red-500/10 border-red-500/20"
                    )}>
                        {trendUp ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                        {trend}
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] opacity-60 mb-3">{title}</p>
                <h3 className="text-4xl font-black text-foreground tracking-tighter leading-none group-hover:text-primary transition-colors">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </h3>
            </div>

            {/* Bottom Progress Indicator Accent */}
            <div className="mt-10 flex items-center gap-2 relative z-10">
                <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "65%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full group-hover:shadow-[0_0_10px_#facc15] transition-all"
                    ></motion.div>
                </div>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Active</span>
            </div>
        </motion.div>
    )
}
