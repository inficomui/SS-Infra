'use client'

import { useState } from 'react'
import { useGetAllSubscriptionsQuery, useCancelSubscriptionMutation } from '@/redux/apis/subscriptionApi'
import { Loader2, Search, Filter, Calendar, User, MoreVertical, XCircle, Trash2, ChevronLeft, ChevronRight, Hash, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

export default function SubscriptionsPage() {
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<string>('')

    const { data, isLoading, error, refetch } = useGetAllSubscriptionsQuery({
        page,
        limit: 10,
        status: statusFilter || undefined
    })

    const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation()

    const handleCancel = async (id: number, softDelete: boolean) => {
        if (!confirm(`Are you sure you want to ${softDelete ? 'cancel' : 'permanently delete'} this subscription?`)) return

        try {
            await cancelSubscription({ id, softDelete }).unwrap()
            toast.success(`Subscription ${softDelete ? 'cancelled' : 'deleted'} successfully`)
        } catch (err: any) {
            toast.error(err?.data?.message || 'Action failed')
        }
    }

    const subscriptions = data?.subscriptions || []
    const pagination = data?.pagination

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header & Advanced Filters */}
            <div className="bg-card border border-border/50 p-6 sm:p-8 rounded-md shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-foreground tracking-tight">Access Subscriptions</h2>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Monitor and control system-wide user plan memberships.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <button
                        type="button"
                        onClick={() => {
                            setPage(1)
                            setStatusFilter('')
                            refetch()
                        }}
                        className="p-3 bg-muted/50 text-muted-foreground hover:text-primary hover:bg-muted border border-transparent hover:border-border/50 rounded-md transition-all"
                        title="Sync Subscriptions"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>
                    <div className="relative flex-1 min-w-[200px]">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setPage(1)
                                setStatusFilter(e.target.value)
                            }}
                            className="w-full pl-4 pr-10 py-3 bg-muted/30 border border-border/50 rounded-md text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active Memberships</option>
                            <option value="expired">Expired Plans</option>
                            <option value="cancelled">Cancelled Access</option>
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* List Overview */}
            <div className="bg-card shadow-2xl shadow-black/5 rounded-md overflow-hidden border border-border/60">
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-96 space-y-4">
                        <Loader2 className="animate-spin h-10 w-10 text-primary" />
                        <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing subscription vault...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col justify-center items-center h-96 text-destructive space-y-2">
                        <AlertCircle className="h-12 w-12" />
                        <p className="font-black">Identity Vault Connection Failed</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border/30">
                            <thead className="bg-muted/20">
                                <tr>
                                    <th className="px-8 py-5 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Subscriber Details</th>
                                    <th className="px-8 py-5 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Plan Tier</th>
                                    <th className="px-8 py-5 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Validation Status</th>
                                    <th className="px-8 py-5 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Term Duration</th>
                                    <th className="px-8 py-5 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Revenue Impact</th>
                                    <th className="px-8 py-5 text-right text-xs font-black text-muted-foreground uppercase tracking-widest">Management</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {subscriptions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="h-16 w-16 rounded-md bg-muted/50 flex items-center justify-center">
                                                    <Calendar className="h-8 w-8 text-muted-foreground/30" />
                                                </div>
                                                <p className="text-muted-foreground font-bold">No matching records found in the cycle</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : subscriptions.map((sub: any, idx: number) => (
                                    <motion.tr
                                        key={sub.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="group hover:bg-muted/10 transition-colors"
                                    >
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-12 w-12 rounded-md bg-linear-to-tr from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-foreground font-black border border-border/50 shadow-sm group-hover:scale-105 transition-transform">
                                                    {sub.user?.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{sub.user?.name}</div>
                                                    <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                                                        <Hash className="h-3 w-3" /> {sub.user?.mobile}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="inline-flex flex-col">
                                                <span className="text-sm font-black text-foreground">{sub.plan?.name}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-0.5 bg-muted/50 rounded mt-1 inline-block w-fit">{sub.plan?.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex flex-col items-start gap-1">
                                                <div className={clsx(
                                                    "px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter border",
                                                    sub.status === 'active' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                                        sub.status === 'expired' ? "bg-muted text-muted-foreground border-border" :
                                                            "bg-red-500/10 text-red-600 border-red-500/20"
                                                )}>
                                                    {sub.status}
                                                </div>
                                                {sub.status === 'active' && (
                                                    <span className="text-[10px] text-emerald-600/70 font-bold ml-1 flex items-center gap-1">
                                                        <Clock className="h-2.5 w-2.5" /> {sub.daysRemaining} days left
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex flex-col text-xs font-bold text-muted-foreground">
                                                <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 opacity-50" /> {new Date(sub.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <span className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 mt-1"><ArrowRight className="h-3 w-3 opacity-30" /> {new Date(sub.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="text-sm font-black text-foreground">
                                                {sub.plan?.price !== undefined ? (
                                                    <span className="flex items-center">
                                                        <span className="text-zinc-400 font-medium mr-1">₹</span>
                                                        {sub.plan.price.toLocaleString()}
                                                    </span>
                                                ) : '-'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                {sub.status === 'active' && (
                                                    <button
                                                        onClick={() => handleCancel(sub.id, true)}
                                                        className="p-2.5 text-orange-500 hover:bg-orange-500/10 rounded-md transition-all border border-transparent hover:border-orange-500/20 group/btn"
                                                        title="Revoke Membership"
                                                    >
                                                        <XCircle className="h-5 w-5 group-hover/btn:scale-110" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleCancel(sub.id, false)}
                                                    className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-md transition-all border border-transparent hover:border-red-500/20 group/btn"
                                                    title="Expunge Record"
                                                >
                                                    <Trash2 className="h-5 w-5 group-hover/btn:scale-110" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                <AnimatePresence>
                    {pagination && pagination.totalPages > 1 && (
                        <div className="bg-muted/10 px-8 py-6 flex flex-col sm:flex-row items-center justify-between border-t border-border/30 gap-4">
                            <div className="text-sm font-bold text-muted-foreground">
                                Showing <span className="text-foreground">{(page - 1) * 10 + 1}</span> to <span className="text-foreground">{Math.min(page * 10, pagination.totalItems)}</span> of <span className="text-primary">{pagination.totalItems}</span> global records
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="inline-flex items-center px-4 py-2 bg-card border border-border/60 rounded-md text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-all shadow-sm"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                </button>
                                <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-md text-xs font-black text-primary">
                                    Cycle {page} / {pagination.totalPages}
                                </div>
                                <button
                                    onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                                    disabled={page === pagination.totalPages}
                                    className="inline-flex items-center px-4 py-2 bg-card border border-border/60 rounded-md text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-all shadow-sm"
                                >
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </button>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

const ArrowRight = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
)
