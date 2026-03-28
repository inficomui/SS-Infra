'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Check, AlertCircle, CreditCard, Calendar, History, ShieldCheck, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import {
    useGetUserSubscriptionsQuery,
    useAssignPlanMutation,
    useCancelSubscriptionMutation
} from '@/redux/apis/subscriptionApi'
import { useGetPlansQuery } from '@/redux/apis/plansApi'
import clsx from 'clsx'

interface SubscriptionManagerModalProps {
    isOpen: boolean
    onClose: () => void
    userId: number | null
    userName: string
    userRole?: string
}

export default function SubscriptionManagerModal({
    isOpen,
    onClose,
    userId,
    userName,
    userRole
}: SubscriptionManagerModalProps) {
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
    const [notes, setNotes] = useState('')

    const {
        data: subsData,
        isLoading: isLoadingSubs,
        refetch: refetchSubs
    } = useGetUserSubscriptionsQuery(userId!, { skip: !userId })

    const {
        data: plansData,
        isLoading: isLoadingPlans
    } = useGetPlansQuery({})

    const [assignPlan, { isLoading: isAssigning }] = useAssignPlanMutation()
    const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation()

    useEffect(() => {
        if (isOpen) {
            setSelectedPlanId(null)
            setNotes('')
            if (userId) refetchSubs()
        }
    }, [isOpen, userId, refetchSubs])

    const activeSubscription = subsData?.subscriptions?.find((sub: any) => sub.status === 'active')
    const pastSubscriptions = subsData?.subscriptions?.filter((sub: any) => sub.status !== 'active') || []

    const handleAssign = async () => {
        if (!userId || !selectedPlanId) return

        try {
            await assignPlan({
                userId,
                planId: selectedPlanId,
                notes,
                startDate: new Date().toISOString()
            }).unwrap()

            toast.success('Service plan activated successfully')
            setSelectedPlanId(null)
            setNotes('')
            refetchSubs()
        } catch (error: any) {
            toast.error(error?.data?.message || 'Activation sequence failed')
        }
    }

    const handleCancel = async (subId: number) => {
        if (!confirm('Are you authorized to terminate this active subscription?')) return

        try {
            await cancelSubscription({ id: subId, softDelete: true }).unwrap()
            toast.success('Subscription terminated')
            refetchSubs()
        } catch (error: any) {
            toast.error(error?.data?.message || 'Termination failed')
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden"
            >
                {/* Backdrop Click */}
                <div className="absolute inset-0" onClick={onClose} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-card dark:bg-[#09090b] w-full max-w-2xl max-h-[85vh] flex flex-col rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-white/10 relative z-10 overflow-hidden"
                >
                    {/* Header Bloom Accent */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-linear-to-r from-transparent via-primary to-transparent blur-sm" />

                    <div className="p-8 border-b border-zinc-200 dark:border-white/5 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/40 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                <Zap className="h-6 w-6 text-primary" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-foreground dark:text-white tracking-tight leading-tight">Service Deck</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{userName}</p>
                                    <span className="h-1 w-1 rounded-full bg-zinc-400" />
                                    <span className="text-[10px] font-black text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20 uppercase tracking-tighter">
                                        {userRole || 'Entity'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-zinc-400 hover:text-foreground dark:hover:text-white p-3 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-2xl transition-all active:scale-90">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="p-8 overflow-y-auto flex-1 space-y-10 custom-scrollbar">
                        {isLoadingSubs ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="animate-spin h-10 w-10 text-primary" strokeWidth={3} />
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] animate-pulse">Syncing Cloud Node...</p>
                            </div>
                        ) : (
                            <>
                                {/* Current Strategic Plan */}
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 opacity-70">
                                            <ShieldCheck className="h-3 w-3" />
                                            Active Protocol
                                        </h4>
                                        {activeSubscription && (
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest">Live Node</span>
                                        )}
                                    </div>

                                    {activeSubscription ? (
                                        <motion.div
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="bg-linear-to-br from-primary/5 via-primary/[0.02] to-transparent border border-primary/20 rounded-[2rem] p-6 relative overflow-hidden group shadow-lg shadow-primary/5"
                                        >
                                            <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                                                <div className="flex-1 text-center md:text-left">
                                                    <h5 className="text-3xl font-black text-foreground dark:text-white tracking-tighter group-hover:text-primary transition-colors">
                                                        {activeSubscription.plan?.name}
                                                    </h5>
                                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground dark:text-zinc-500">
                                                            <Calendar className="h-4 w-4" />
                                                            End Date: <span className="text-foreground dark:text-zinc-300">{new Date(activeSubscription.endDate).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 uppercase tracking-widest">
                                                            {Math.ceil(activeSubscription.daysRemaining)} Cycles Left
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleCancel(activeSubscription.id)}
                                                    disabled={isCancelling}
                                                    className="w-full md:w-auto px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                                >
                                                    {isCancelling ? <Loader2 className="h-4 w-4 animate-spin mx-auto" strokeWidth={3} /> : 'Terminate Axis'}
                                                </button>
                                            </div>
                                            {/* Decorative Elements */}
                                            <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-primary/10 blur-[60px] rounded-full" />
                                        </motion.div>
                                    ) : (
                                        <div className="bg-zinc-50 dark:bg-white/5 border border-dashed border-zinc-200 dark:border-white/10 rounded-[2rem] p-12 text-center group hover:border-primary/50 transition-all duration-500">
                                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-[1.5rem] bg-zinc-100 dark:bg-zinc-800/50 mb-6 group-hover:rotate-6 transition-all duration-500 border border-transparent group-hover:border-primary/20 shadow-lg">
                                                <AlertCircle className="h-8 w-8 text-zinc-400 group-hover:text-primary transition-colors" />
                                            </div>
                                            <p className="text-xl font-black text-foreground dark:text-white tracking-tight">System Node IDLE</p>
                                            <p className="text-sm font-medium text-muted-foreground dark:text-zinc-500 mt-2 max-w-xs mx-auto">No active service protocols detected. Please initialize a deployment below.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Deployment Phase */}
                                {!activeSubscription && (
                                    <div className="space-y-6 pt-6 border-t border-zinc-200 dark:border-white/5">
                                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 opacity-70">
                                            <Zap className="h-3 w-3" />
                                            Available Deployments
                                        </h4>

                                        {isLoadingPlans ? (
                                            <div className="py-20 text-center">
                                                <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                {plansData?.plans?.map((plan: any) => (
                                                    <motion.div
                                                        key={plan.id}
                                                        whileHover={{ scale: 1.02, y: -4 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setSelectedPlanId(plan.id)}
                                                        className={clsx(
                                                            "cursor-pointer border rounded-[2rem] p-6 transition-all relative group overflow-hidden shadow-sm hover:shadow-xl",
                                                            selectedPlanId === plan.id
                                                                ? 'border-primary ring-4 ring-primary/10 bg-primary/5 dark:bg-primary/[0.03]'
                                                                : 'border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] hover:border-primary/40'
                                                        )}
                                                    >
                                                        <div className="flex justify-between items-center mb-4 relative z-10">
                                                            <div className={clsx(
                                                                "h-10 w-10 flex items-center justify-center rounded-xl transition-all duration-500",
                                                                selectedPlanId === plan.id ? 'bg-primary text-black' : 'bg-zinc-200 dark:bg-white/10 text-muted-foreground group-hover:text-primary'
                                                            )}>
                                                                <CreditCard className="h-5 w-5" />
                                                            </div>
                                                            <span className="text-2xl font-black text-foreground dark:text-white tracking-tighter">₹{plan.price}</span>
                                                        </div>
                                                        <div className="relative z-10">
                                                            <h5 className="font-extrabold text-lg text-foreground dark:text-white tracking-tight group-hover:text-primary transition-colors">{plan.name}</h5>
                                                            <p className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-[0.2em] mt-2 group-hover:text-zinc-400">{plan.durationDays} Days Duration</p>
                                                        </div>
                                                        {selectedPlanId === plan.id && (
                                                            <div className="absolute -top-3 -right-3 h-12 w-12 bg-primary rounded-full flex items-center justify-center pt-2 pr-2">
                                                                <Check className="h-5 w-5 text-black" strokeWidth={4} />
                                                            </div>
                                                        )}
                                                        {/* Glow background on selected */}
                                                        {selectedPlanId === plan.id && <div className="absolute inset-0 bg-primary/5 animate-pulse" />}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}

                                        <AnimatePresence>
                                            {selectedPlanId && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 20 }}
                                                    className="space-y-5 pt-8 bg-zinc-50 dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-zinc-200 dark:border-white/5"
                                                >
                                                    <div>
                                                        <label className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest block mb-3 ml-1">Deployment Audit Note (Optional)</label>
                                                        <textarea
                                                            value={notes}
                                                            onChange={(e) => setNotes(e.target.value)}
                                                            placeholder="Enter activation rationale or reference IDs..."
                                                            className="w-full min-h-[100px] px-5 py-4 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-white/10 rounded-[1.5rem] text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none dark:text-white font-medium shadow-inner"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={handleAssign}
                                                        disabled={isAssigning}
                                                        className="w-full py-5 bg-primary hover:bg-yellow-400 text-black font-black text-lg rounded-[1.5rem] shadow-[0_20px_40px_-15px_rgba(250,204,21,0.3)] transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-3"
                                                    >
                                                        {isAssigning ? <Loader2 className="animate-spin h-6 w-6" strokeWidth={3} /> : <Zap className="h-5 w-5" strokeWidth={3} />}
                                                        Initialize Protocol Deployment
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* Archive Registry */}
                                {pastSubscriptions.length > 0 && (
                                    <div className="space-y-6 pt-6 border-t border-zinc-200 dark:border-white/5 pb-10">
                                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 opacity-70">
                                            <History className="h-4 w-4" />
                                            Service History Log
                                        </h4>
                                        <div className="overflow-hidden border border-zinc-200 dark:border-white/5 rounded-[2rem] bg-zinc-50/50 dark:bg-black/20 shadow-inner">
                                            <table className="min-w-full divide-y divide-zinc-200 dark:divide-white/5">
                                                <thead className="bg-zinc-100/50 dark:bg-zinc-800/30">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-[9px] font-black text-muted-foreground uppercase tracking-widest">Plan Spec</th>
                                                        <th className="px-6 py-4 text-left text-[9px] font-black text-muted-foreground uppercase tracking-widest">Timeframe</th>
                                                        <th className="px-6 py-4 text-right text-[9px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                                                    {pastSubscriptions.map((sub: any) => (
                                                        <tr key={sub.id} className="hover:bg-zinc-100/50 dark:hover:bg-white/5 transition-colors">
                                                            <td className="px-6 py-4 text-sm font-bold text-foreground dark:text-zinc-300">{sub.plan?.name}</td>
                                                            <td className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-tighter">
                                                                {new Date(sub.startDate).toLocaleDateString()} <span className="mx-1 opacity-30">→</span> {new Date(sub.endDate).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <span className={clsx(
                                                                    "inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                                                                    sub.status === 'expired' ? 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-500 dark:border-white/5' :
                                                                    sub.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                                    'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                                )}>
                                                                    {sub.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
