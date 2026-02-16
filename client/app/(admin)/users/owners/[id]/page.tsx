'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGetOwnerDetailsQuery } from '@/redux/apis/usersApi'
import { Loader2, User, MapPin, Phone, Calendar, Truck, Users, Activity, CreditCard, Network, ChevronRight, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import SubscriptionManagerModal from '@/components/subscriptions/SubscriptionManagerModal'

export default function OwnerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter()
    const { data, isLoading, error, refetch } = useGetOwnerDetailsQuery(id)

    const [activeTab, setActiveTab] = useState<'overview' | 'machines' | 'operators' | 'referrals'>('overview')
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>
    if (error) return <div className="p-10 text-center text-red-500">Error loading owner details. The owner might not exist.</div>

    const owner = data?.owner
    const stats = data?.statistics
    const machines = data?.machines || []
    const operators = data?.operators || []
    const recentWorks = data?.recentWorks || []
    const referralTeam = data?.referralTeam || {}

    if (!owner) return null

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border/50 rounded-md shadow-xl shadow-black/5 overflow-hidden relative group"
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
                        onClick={() => {
                            setActiveTab('overview')
                            refetch()
                        }}
                        className="p-2 text-foreground/50 hover:text-foreground bg-background/20 hover:bg-background/40 backdrop-blur-md rounded-full border border-border/20 transition-all"
                        title="Refresh Details"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>
                </div>

                {/* Decorative Background */}
                <div className="h-40 bg-linear-to-br from-primary/20 via-primary/5 to-transparent relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    {/* Floating Pattern */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="px-8 pb-8 -mt-16 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div className="flex flex-col md:flex-row items-end gap-6">
                            <div className="relative">
                                <div className="h-32 w-32 rounded-md bg-background border-[6px] border-card shadow-2xl flex items-center justify-center overflow-hidden">
                                    <div className="h-full w-full bg-linear-to-br from-primary to-yellow-600 flex items-center justify-center text-4xl font-black text-black uppercase tracking-tighter">
                                        {owner.name?.[0]}
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-emerald-500 border-4 border-card rounded-md shadow-lg flex items-center justify-center" title="Active Account">
                                    <Activity className="h-3 w-3 text-white" />
                                </div>
                            </div>

                            <div className="mb-2">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-black text-foreground tracking-tight">{owner.name}</h1>
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-md border border-primary/20">
                                        Verified Owner
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-3 text-sm font-medium text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-muted rounded-md text-foreground/70"><Phone className="h-3.5 w-3.5" /></div>
                                        {owner.mobile}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-muted rounded-md text-foreground/70"><MapPin className="h-3.5 w-3.5" /></div>
                                        {owner.district}, {owner.taluka}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-muted rounded-md text-foreground/70"><Calendar className="h-3.5 w-3.5" /></div>
                                        Joined {new Date(owner.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-auto p-1 bg-muted/30 rounded-md border border-border/50">
                            <div className="bg-background rounded-md px-6 py-4 flex flex-col items-center justify-center border border-border shadow-inner">
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-1">Referral Code</p>
                                <p className="text-xl font-black text-primary tracking-widest uppercase">{owner.referralCode}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Machines Fleet', value: stats?.totalMachines || 0, icon: Truck, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
                    { label: 'Active Operators', value: stats?.totalOperators || 0, icon: Users, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
                    { label: 'Works Executed', value: stats?.totalWorkSessions || 0, icon: Activity, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
                    { label: 'Growth Network', value: stats?.totalReferrals || 0, icon: Network, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="bg-card border border-border/60 p-6 rounded-md shadow-xl shadow-black/5 relative overflow-hidden group transition-all"
                    >
                        <div className={clsx("absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-150 rotate-12", stat.color)}>
                            <stat.icon className="h-20 w-20" />
                        </div>

                        <div className="flex flex-col">
                            <div className={clsx("h-10 w-10 flex items-center justify-center rounded-md border border-border/50 mb-4 transition-transform group-hover:-rotate-6 shadow-inner", stat.bgColor, stat.color)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                            <h3 className="text-3xl font-black text-foreground tracking-tight leading-none">{stat.value}</h3>
                        </div>

                        <div className={clsx("mt-4 h-1 w-8 rounded-md transition-all duration-500 group-hover:w-full", stat.color.replace('text-', 'bg-'))}></div>
                    </motion.div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div className="bg-card border border-border/50 p-1 rounded-md shadow-sm flex items-center max-w-fit overflow-x-auto no-scrollbar">
                {['overview', 'machines', 'operators', 'referrals'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={clsx(
                            "relative px-6 py-2 text-xs font-black uppercase tracking-widest transition-all duration-300 rounded-md",
                            activeTab === tab
                                ? "text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-primary rounded-md shadow-lg shadow-primary/20"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{tab}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-card border border-border/60 rounded-md shadow-2xl shadow-black/5 min-h-[500px] overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-8 space-y-8"
                        >
                            <div>
                                <h3 className="text-xl font-black text-foreground tracking-tight mb-6 flex items-center gap-3">
                                    <Activity className="h-5 w-5 text-primary" />
                                    Operational Timeline
                                </h3>
                                {recentWorks.length > 0 ? (
                                    <div className="space-y-6 relative ml-4 before:absolute before:inset-y-0 before:-left-4 before:w-px before:bg-border/60">
                                        {recentWorks.map((work: any, workIdx: number) => (
                                            <div key={work.id} className="relative group">
                                                <div className={clsx(
                                                    "absolute -left-[2.05rem] mt-1 h-3 w-3 rounded-full border-4 border-card ring-1 ring-border shadow-sm transition-all group-hover:scale-125 z-10",
                                                    work.status === 'completed' ? 'bg-emerald-500 ring-emerald-500/20' : 'bg-primary ring-primary/20'
                                                )} />

                                                <div className="bg-muted/20 border border-border/30 p-5 rounded-md hover:bg-muted/40 transition-all hover:translate-x-1">
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-md bg-background border border-border flex items-center justify-center shadow-inner">
                                                                <Truck className="h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-foreground">
                                                                    {work.machine?.name} • <span className="text-primary">{work.operator?.name}</span>
                                                                </p>
                                                                <p className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-2">
                                                                    <MapPin className="h-3 w-3" /> {work.location}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex flex-col items-end">
                                                            <span className={clsx(
                                                                "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border",
                                                                work.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'
                                                            )}>
                                                                {work.status}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground font-bold mt-2 opacity-60">
                                                                {new Date(work.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-md border border-dashed border-border/60">
                                        <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center mb-4">
                                            <Activity className="h-8 w-8 text-muted-foreground/30" />
                                        </div>
                                        <p className="text-sm font-bold text-muted-foreground">No recent activity found in the vault.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'machines' && (
                        <motion.div
                            key="machines"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-8"
                        >
                            <h3 className="text-xl font-black text-foreground tracking-tight mb-8">Asset Inventory</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {machines.map((machine: any) => (
                                    <div key={machine.id} className="relative group bg-muted/10 border border-border/40 rounded-md p-5 hover:bg-muted/20 transition-all hover:-translate-y-1">
                                        <div className="h-40 bg-background rounded-md mb-5 flex items-center justify-center border border-border/50 overflow-hidden shadow-inner group-hover:border-primary/30 transition-colors">
                                            {machine.photoUrl ? (
                                                <img src={machine.photoUrl} alt={machine.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <Truck className="h-12 w-12 text-muted-foreground/20 group-hover:text-primary/20 transition-colors" />
                                            )}
                                        </div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-black text-foreground tracking-tight">{machine.name}</h4>
                                            <span className={clsx(
                                                "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1.5 border",
                                                machine.status === 'available' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                                            )}>
                                                <div className={clsx("h-1.5 w-1.5 rounded-full", machine.status === 'available' ? "bg-emerald-500" : "bg-orange-500")}></div>
                                                {machine.status}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-muted-foreground opacity-60 mb-5">{machine.registrationNumber}</p>

                                        <div className="flex items-center justify-between pt-4 border-t border-border/30">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Assignments</span>
                                                <span className="text-sm font-black text-foreground">{machine.totalAssignments}</span>
                                            </div>
                                            <button className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-muted rounded-md hover:bg-primary hover:text-black transition-all">Details</button>
                                        </div>
                                    </div>
                                ))}
                                {machines.length === 0 && (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-muted/5 rounded-md border border-dashed border-border/60">
                                        <Truck className="h-10 w-10 text-muted-foreground/20 mb-3" />
                                        <p className="text-sm font-bold text-muted-foreground">No heavy machinery registered yet.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'operators' && (
                        <motion.div
                            key="operators"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-8"
                        >
                            <h3 className="text-xl font-black text-foreground tracking-tight mb-8">Personnel Deployment</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {operators.map((op: any) => (
                                    <div key={op.id} className="group flex items-center p-5 bg-muted/10 border border-border/40 rounded-md hover:bg-muted/20 transition-all hover:translate-x-1">
                                        <div className="h-16 w-16 rounded-md bg-linear-to-br from-primary to-yellow-600 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-primary/10 mr-5 transition-transform group-hover:scale-110">
                                            {op.name?.[0]}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-foreground tracking-tight text-lg">{op.name}</h4>
                                            <p className="text-sm font-bold text-muted-foreground opacity-60 flex items-center gap-2 mt-1">
                                                <Phone className="h-3 w-3" /> {op.mobile}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => router.push(`/users/operators/${op.id}`)}
                                            className="h-10 w-10 flex items-center justify-center bg-background border border-border rounded-md hover:bg-primary hover:text-black hover:border-primary transition-all shadow-sm"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {operators.length === 0 && (
                                    <div className="col-span-full py-20 bg-muted/5 rounded-md border border-dashed border-border/60 flex flex-col items-center justify-center">
                                        <Users className="h-10 w-10 text-muted-foreground/20 mb-3" />
                                        <p className="text-sm font-bold text-muted-foreground">No personnel assigned to this account.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'referrals' && (
                        <motion.div
                            key="referrals"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-8"
                        >
                            <h3 className="text-xl font-black text-foreground tracking-tight mb-8">Strategic Referral Matrix</h3>
                            <div className="space-y-10">
                                {['level1', 'level2', 'level3'].map((level, lvlIdx) => (
                                    <div key={level} className="relative">
                                        <div className="flex items-center gap-4 mb-5">
                                            <div className="h-8 w-8 bg-muted border border-border rounded-md flex items-center justify-center text-[10px] font-black text-muted-foreground uppercase">L{lvlIdx + 1}</div>
                                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Deployment Tier {lvlIdx + 1} ({referralTeam[level]?.length || 0})</h4>
                                            <div className="flex-1 h-px bg-border/40"></div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {referralTeam[level]?.map((ref: any) => (
                                                <div key={ref.id} className="flex items-center justify-between p-4 bg-muted/10 border border-border/30 rounded-md hover:bg-muted/20 hover:border-primary/20 transition-all cursor-pointer group">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 rounded-md bg-background border border-border text-foreground flex items-center justify-center font-black text-sm mr-4 shadow-sm group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all">
                                                            {ref.name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-foreground group-hover:translate-x-1 transition-transform">{ref.name}</p>
                                                            <p className="text-[10px] text-muted-foreground font-bold mt-0.5 opacity-60">Joined {new Date(ref.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-muted border border-border text-muted-foreground uppercase tracking-widest group-hover:bg-background transition-colors">
                                                        {ref.role}
                                                    </span>
                                                </div>
                                            ))}
                                            {(!referralTeam[level] || referralTeam[level].length === 0) && (
                                                <p className="text-xs text-muted-foreground font-medium italic opacity-40 col-span-full ml-12">No data points in this tier.</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <SubscriptionManagerModal
                isOpen={isSubscriptionModalOpen}
                onClose={() => setIsSubscriptionModalOpen(false)}
                userId={owner.id}
                userName={owner.name}
                userRole="Owner"
            />
        </div>
    )
}
