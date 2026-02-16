'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGetOperatorDetailsQuery } from '@/redux/apis/usersApi'
import { Loader2, User, Phone, MapPin, Calendar, Briefcase, Truck, Activity, ChevronRight, History, RefreshCw, CreditCard } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import clsx from 'clsx'
import SubscriptionManagerModal from '@/components/subscriptions/SubscriptionManagerModal'

export default function OperatorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter()
    const { data, isLoading, error, refetch } = useGetOperatorDetailsQuery(id)
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
    if (error) return <div className="p-10 text-center text-red-500">Error loading operator details. The operator might not exist.</div>

    const operator = data?.operator
    const stats = data?.statistics
    const currentMachine = data?.currentMachine
    const workSessions = data?.workSessions || []

    if (!operator) return null

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border/50 rounded-md shadow-xl shadow-black/5 overflow-hidden relative"
            >
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <button
                        type="button"
                        onClick={() => setIsSubscriptionModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 text-foreground/70 hover:text-foreground bg-background/20 hover:bg-background/40 backdrop-blur-md rounded-md border border-border/20 transition-all text-xs font-black uppercase tracking-widest"
                        title="Manage Subscription"
                    >
                        <CreditCard className="h-4 w-4" />
                        <span>Manage Plan</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="p-2 text-foreground/50 hover:text-foreground bg-background/20 hover:bg-background/40 backdrop-blur-md rounded-full border border-border/20 transition-all"
                        title="Refresh Details"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>
                </div>

                {/* Decorative Background */}
                <div className="h-32 bg-linear-to-br from-emerald-500/20 via-primary/5 to-transparent relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                </div>

                <div className="px-8 pb-8 -mt-12 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div className="flex flex-col md:flex-row items-end gap-6">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-md bg-background border-4 border-card shadow-2xl flex items-center justify-center overflow-hidden">
                                    <div className="h-full w-full bg-linear-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-3xl font-black text-black uppercase">
                                        {operator.name?.[0]}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-black text-foreground tracking-tight">{operator.name}</h1>
                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-md border border-emerald-500/20">
                                        Operator
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-3 text-sm font-medium text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5 text-emerald-500" />
                                        {operator.mobile}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                                        {operator.district}, {operator.taluka}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-3.5 w-3.5 text-emerald-500" />
                                        Employed by <Link href={`/users/owners/${operator.owner?.id}`} className="text-primary hover:underline underline-offset-4 font-black">{operator.owner?.name}</Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-auto p-1 bg-muted/30 rounded-md border border-border/50">
                            <div className="bg-background rounded-md px-6 py-4 flex flex-col items-center justify-center border border-border shadow-inner">
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-1">Live Status</p>
                                {currentMachine ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-emerald-500/20"></div>
                                        <span className="text-sm font-black text-foreground uppercase tracking-tight">Active on {currentMachine.name}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-2 w-2 rounded-full bg-muted-foreground/30"></div>
                                        <span className="text-sm font-black text-muted-foreground uppercase tracking-tight">Idle / Not Logged In</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Cumulative Sessions', value: stats?.totalWorkSessions || 0, icon: History, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
                    { label: 'Success Missions', value: stats?.completedWorkSessions || 0, icon: Activity, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
                    { label: 'Unit Assignments', value: stats?.totalMachineAssignments || 0, icon: Truck, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
                    { label: 'Referral Power', value: stats?.totalReferrals || 0, icon: User, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="bg-card border border-border/60 p-5 rounded-md shadow-xl shadow-black/5 relative overflow-hidden group"
                    >
                        <div className="flex flex-col">
                            <div className={clsx("h-10 w-10 flex items-center justify-center rounded-md border border-border/50 mb-4 shadow-inner", stat.bgColor, stat.color)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                            <h3 className="text-2xl font-black text-foreground tracking-tight leading-none">{stat.value}</h3>
                        </div>
                        <div className={clsx("absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500", stat.color.replace('text-', 'bg-'))}></div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Work History */}
            <div className="bg-card border border-border/60 rounded-md shadow-2xl shadow-black/5 overflow-hidden">
                <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/30">
                    <h3 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        Engagement History
                    </h3>
                    <div className="px-3 py-1 bg-background border border-border rounded-md text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {workSessions.length} ENTRIES
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead>
                            <tr className="bg-muted/10">
                                <th className="px-8 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Temporal Data</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Asset Alpha</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Client Intel</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Deployment</th>
                                <th className="px-8 py-4 text-right text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Outcome</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 bg-card">
                            {workSessions.length > 0 ? workSessions.map((session: any) => (
                                <tr key={session.id} className="hover:bg-muted/10 transition-colors group">
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="text-sm font-black text-foreground">
                                            {new Date(session.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground font-bold mt-0.5 uppercase opacity-60">
                                            T-{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center border border-border transition-colors group-hover:bg-primary group-hover:text-black">
                                                <Truck className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-bold text-foreground">{session.machine?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="text-sm font-bold text-foreground">{session.client?.name}</div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                            <MapPin className="h-3 w-3 text-primary" /> {session.location}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-right">
                                        <span className={clsx(
                                            "px-3 py-1 text-[10px] rounded-md font-black uppercase tracking-tighter border",
                                            session.status === 'completed' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20"
                                        )}>
                                            {session.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-30">
                                            <History className="h-10 w-10 mb-2" />
                                            <p className="text-sm font-black uppercase tracking-widest">No history recorded in system</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <SubscriptionManagerModal
                isOpen={isSubscriptionModalOpen}
                onClose={() => setIsSubscriptionModalOpen(false)}
                userId={operator.id}
                userName={operator.name}
                userRole="Operator"
            />
        </div>
    )
}

