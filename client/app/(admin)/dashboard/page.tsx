'use client'

import { useGetDashboardStatsQuery } from '@/redux/apis/dashboardApi'
import { useAppSelector } from '@/redux/hooks'
import { selectCurrentUser } from '@/redux/features/authSlice'
import { Users, CreditCard, TrendingUp, Activity, UserPlus, FileText, ArrowUpRight, ArrowDownRight, MoreHorizontal, Calendar, RefreshCw } from 'lucide-react'
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

    const stats = data?.dashboard || {}

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card h-40 rounded-md shadow-sm border border-border/50"></div>
                ))}
            </div>
        )
    }

    if (error) {
        return <div className="text-destructive font-medium p-4 bg-destructive/10 rounded-md border border-destructive/20">Error loading dashboard stats.</div>
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>. Here's what's happening with your platform today.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-md shadow-sm">
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-all"
                        title="Refresh Data"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                    <div className="h-4 w-px bg-border mx-1"></div>
                    <button className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md shadow-sm">Last 7 Days</button>
                    <button className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors">Last 30 Days</button>
                    <button className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors">Month</button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Revenue"
                    value={`₹${stats.recharges?.totalAmount?.toLocaleString() || '0'}`}
                    icon={CreditCard}
                    trend="+12.5%"
                    trendUp={true}
                    color="text-emerald-600 dark:text-emerald-400"
                    bgColor="bg-emerald-500/10"
                />
                <StatsCard
                    title="Total Users"
                    value={stats.users?.totalUsers || 0}
                    icon={Users}
                    trend="+5.2%"
                    trendUp={true}
                    color="text-blue-600 dark:text-blue-400"
                    bgColor="bg-blue-500/10"
                />
                <StatsCard
                    title="Active Operators"
                    value={stats.users?.totalOperators || 0}
                    icon={Activity}
                    trend="+2.4%"
                    trendUp={true}
                    color="text-orange-600 dark:text-orange-400"
                    bgColor="bg-orange-500/10"
                />
                <StatsCard
                    title="Pending Recharges"
                    value={stats.recharges?.pendingCount || 0}
                    icon={FileText}
                    trend="-1.5%"
                    trendUp={false}
                    color="text-yellow-600 dark:text-yellow-400"
                    bgColor="bg-yellow-500/10"
                    attention={true}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-card border border-border/60 shadow-2xl shadow-black/5 rounded-md p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-black text-xl text-foreground tracking-tight">Revenue Intelligence</h3>
                            <p className="text-sm text-muted-foreground font-medium">Daily transaction pulse across the network</p>
                        </div>
                        <div className="h-12 w-12 bg-muted/50 rounded-md flex items-center justify-center border border-border/50">
                            <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#facc15" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.2} />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
                                    className="text-muted-foreground"
                                    dy={15}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
                                    className="text-muted-foreground"
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#facc15', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    contentStyle={{
                                        backgroundColor: 'var(--card)',
                                        borderRadius: '0.375rem',
                                        border: '1px solid var(--border)',
                                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)',
                                        padding: '12px 16px'
                                    }}
                                    itemStyle={{ color: 'var(--foreground)', fontWeight: 800, fontSize: '12px' }}
                                    labelStyle={{ color: 'var(--muted-foreground)', fontWeight: 600, fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                                    formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#facc15"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    strokeWidth={4}
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Growth Chart */}
                <div className="bg-card border border-border/60 shadow-2xl shadow-black/5 rounded-md p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-black text-xl text-foreground tracking-tight">Growth Metrics</h3>
                            <p className="text-sm text-muted-foreground font-medium">Monthly user acquisition velocity</p>
                        </div>
                        <div className="h-12 w-12 bg-muted/50 rounded-md flex items-center justify-center border border-border/50">
                            <UserPlus className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.2} />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
                                    className="text-muted-foreground"
                                    dy={15}
                                />
                                <Tooltip
                                    cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                                    contentStyle={{
                                        backgroundColor: 'var(--card)',
                                        borderRadius: '0.375rem',
                                        border: '1px solid var(--border)',
                                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)'
                                    }}
                                    labelStyle={{ display: 'none' }}
                                />
                                <Bar dataKey="users" fill="#facc15" radius={[10, 10, 2, 2]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Signups */}
                <div className="bg-card border border-border/60 shadow-2xl shadow-black/5 rounded-md overflow-hidden">
                    <div className="p-8 border-b border-border/40 flex justify-between items-center bg-muted/5">
                        <h3 className="font-black text-xl text-foreground tracking-tight">New Identifiers</h3>
                        <button className="text-xs font-black text-primary px-4 py-2 bg-primary/10 rounded-md hover:bg-primary/20 transition-all uppercase tracking-widest">Global Deck</button>
                    </div>
                    <div className="divide-y divide-border/30">
                        {stats.recentSignups?.slice(0, 5).map((signup: any, idx: number) => (
                            <motion.div
                                key={signup.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-6 flex items-center justify-between hover:bg-muted/20 transition-all group cursor-pointer"
                            >
                                <div className="flex items-center space-x-5">
                                    <div className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-indigo-500/25 dark:border-zinc-800">
                                        {/* Glassy Overlay for depth */}
                                        <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />

                                        <span className="relative z-10 transition-transform duration-300 group-hover:rotate-6">
                                            {signup.name[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-foreground group-hover:translate-x-1 transition-transform">{signup.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={clsx(
                                                "text-[9px] px-2 py-0.5 rounded-md uppercase tracking-widest font-black",
                                                signup.role === 'OWNER' ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
                                                    "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                            )}>
                                                {signup.role}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-bold opacity-60">• {signup.district}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                                        {new Date(signup.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </p>
                                    <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-card border border-border/60 shadow-2xl shadow-black/5 rounded-md overflow-hidden">
                    <div className="p-8 border-b border-border/40 flex justify-between items-center bg-muted/5">
                        <h3 className="font-black text-xl text-foreground tracking-tight">Ledger Stream</h3>
                        <button className="text-xs font-black text-primary px-4 py-2 bg-primary/10 rounded-md hover:bg-primary/20 transition-all uppercase tracking-widest">Audit Trail</button>
                    </div>
                    <div className="divide-y divide-border/30">
                        {stats.recentRecharges?.slice(0, 5).map((txn: any, idx: number) => (
                            <motion.div
                                key={txn.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-6 flex items-center justify-between hover:bg-muted/20 transition-all group cursor-pointer"
                            >
                                <div className="flex items-center space-x-5">
                                    <div className={clsx(
                                        "h-12 w-12 rounded-md flex items-center justify-center border border-border/50",
                                        txn.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                                            txn.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                                                'bg-red-500/10 text-red-600'
                                    )}>
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black text-foreground">₹{txn.amount.toLocaleString()}</p>
                                            <span className="text-[10px] font-bold text-muted-foreground opacity-40">via {txn.paymentMethod}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-bold mt-1 group-hover:text-foreground transition-colors">{txn.user?.name}</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className={clsx(
                                        "inline-flex items-center text-[9px] px-2.5 py-1 rounded-md font-black uppercase tracking-tighter border",
                                        txn.status === 'completed' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                            txn.status === 'pending' ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                                                "bg-red-500/10 text-red-600 border-red-500/20"
                                    )}>
                                        {txn.status}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-bold mt-1.5 opacity-60">Verified</span>
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
            whileHover={{ y: -8, scale: 1.02 }}
            className={clsx(
                "bg-card border border-border/60 shadow-2xl shadow-black/5 rounded-md p-8 relative overflow-hidden group transition-all",
                attention && "ring-2 ring-yellow-500/20"
            )}
        >
            <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all transform group-hover:scale-150 rotate-12">
                <Icon className="h-32 w-32" />
            </div>

            <div className="flex items-center justify-between mb-8">
                <div className={clsx("h-14 w-14 rounded-md flex items-center justify-center border border-border/50 shadow-inner transition-transform group-hover:-rotate-6", bgColor, color)}>
                    <Icon className="h-7 w-7" />
                </div>
                {trend && (
                    <div className={clsx(
                        "flex items-center text-[10px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-md border",
                        trendUp ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" : "text-red-600 bg-red-500/10 border-red-500/20"
                    )}>
                        {trendUp ? <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> : <ArrowDownRight className="h-3.5 w-3.5 mr-1" />}
                        {trend}
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.15em] opacity-70 mb-2">{title}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-4xl font-black text-foreground tracking-tighter leading-none">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </h3>
                </div>
            </div>

            <div className="mt-6 h-1 w-12 bg-primary/20 rounded-md group-hover:w-full transition-all duration-500"></div>
        </motion.div>
    )
}

