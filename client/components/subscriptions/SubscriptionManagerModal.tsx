'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Check, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import {
    useGetUserSubscriptionsQuery,
    useAssignPlanMutation,
    useCancelSubscriptionMutation
} from '@/redux/apis/subscriptionApi'
import { useGetPlansQuery } from '@/redux/apis/plansApi'

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

    // Skip queries if no userId
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

    // Reset state when modal opens/closes or user changes
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

            toast.success('Plan assigned successfully')
            setSelectedPlanId(null)
            setNotes('')
            // No need to close modal immediately, maybe user wants to see the updated status
            // But usually refreshing the list is good.
        } catch (error: any) {
            console.error('Failed to assign plan:', error)
            toast.error(error?.data?.message || 'Failed to assign plan')
        }
    }

    const handleCancel = async (subId: number) => {
        if (!confirm('Are you sure you want to cancel this subscription?')) return

        try {
            await cancelSubscription({ id: subId, softDelete: true }).unwrap()
            toast.success('Subscription cancelled')
        } catch (error: any) {
            console.error('Failed to cancel subscription:', error)
            toast.error(error?.data?.message || 'Failed to cancel subscription')
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-card w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl pointer-events-auto border border-border/50 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/20 shrink-0">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">Manage Subscription</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        For {userName} {userRole && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">{userRole}</span>}
                                    </p>
                                </div>
                                <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-md transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto flex-1 space-y-8">
                                {isLoadingSubs ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                                    </div>
                                ) : (
                                    <>
                                        {/* Active Subscription Section */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center">
                                                <Check className="h-4 w-4 mr-2" /> Current Status
                                            </h4>

                                            {activeSubscription ? (
                                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-bl-lg">
                                                        ACTIVE
                                                    </div>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h5 className="text-lg font-bold text-foreground">{activeSubscription.plan?.name}</h5>
                                                            <div className="text-sm text-muted-foreground mt-1 space-y-1">
                                                                <p>Expires: <span className="font-medium text-foreground">{new Date(activeSubscription.endDate).toLocaleDateString()}</span></p>
                                                                <p>Remaining: <span className="font-medium text-primary">{activeSubscription.daysRemaining} days</span></p>
                                                            </div>
                                                        </div>
                                                        <div className="pt-8">
                                                            <button
                                                                onClick={() => handleCancel(activeSubscription.id)}
                                                                disabled={isCancelling}
                                                                className="px-4 py-2 bg-white/50 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                                            >
                                                                {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-muted/30 border border-dashed border-border rounded-lg p-8 text-center">
                                                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-muted mb-3">
                                                        <AlertCircle className="h-6 w-6 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-foreground font-medium">No active subscription</p>
                                                    <p className="text-sm text-muted-foreground mt-1">Select a plan below to assign one.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Assign New Plan Section */}
                                        {!activeSubscription && (
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Assign New Plan</h4>

                                                {isLoadingPlans ? (
                                                    <div className="py-4 text-center">
                                                        <Loader2 className="animate-spin h-6 w-6 text-primary mx-auto" />
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {plansData?.plans?.map((plan: any) => (
                                                            <div
                                                                key={plan.id}
                                                                onClick={() => setSelectedPlanId(plan.id)}
                                                                className={`cursor-pointer border rounded-lg p-4 transition-all relative ${selectedPlanId === plan.id
                                                                    ? 'border-primary ring-1 ring-primary bg-primary/5'
                                                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                                                    }`}
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <h5 className="font-bold text-foreground">{plan.name}</h5>
                                                                    <span className="font-bold text-primary">₹{plan.price}</span>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mb-2">{plan.durationDays} days validity</p>
                                                                {selectedPlanId === plan.id && (
                                                                    <div className="absolute top-2 right-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                                                                        <Check className="h-3 w-3 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {selectedPlanId && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="space-y-4 pt-4 border-t border-border/50"
                                                    >
                                                        <div>
                                                            <label className="text-sm font-medium text-foreground mb-1.5 block">Admin Notes (Optional)</label>
                                                            <textarea
                                                                value={notes}
                                                                onChange={(e) => setNotes(e.target.value)}
                                                                placeholder="Reason for assignment or payment details..."
                                                                className="w-full min-h-[80px] px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={handleAssign}
                                                            disabled={isAssigning}
                                                            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 flex justify-center items-center"
                                                        >
                                                            {isAssigning && <Loader2 className="animate-spin mr-2 h-5 w-5" />}
                                                            Confirm Assignment
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}

                                        {/* History Section */}
                                        {pastSubscriptions.length > 0 && (
                                            <div className="space-y-4 pt-4 border-t border-border/50">
                                                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Subscription History</h4>
                                                <div className="overflow-hidden border border-border rounded-lg">
                                                    <table className="min-w-full divide-y divide-border/50">
                                                        <thead className="bg-muted/50">
                                                            <tr>
                                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Plan</th>
                                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Duration</th>
                                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border/50 bg-card">
                                                            {pastSubscriptions.map((sub: any) => (
                                                                <tr key={sub.id}>
                                                                    <td className="px-4 py-3 text-sm font-medium text-foreground">{sub.plan?.name}</td>
                                                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                                                        {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${sub.status === 'expired' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' :
                                                                            sub.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                                                                'bg-blue-100 text-blue-800'
                                                                            }`}>
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
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
