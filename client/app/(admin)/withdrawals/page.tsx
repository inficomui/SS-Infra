'use client'

import React, { useState } from 'react'
import { useGetWithdrawalRequestsQuery, useApproveWithdrawalMutation, useRejectWithdrawalMutation, WithdrawalRequest } from '@/redux/apis/walletApi'
import { Loader2, RefreshCw, Eye, CheckCircle, XCircle, Search, Filter, AlertCircle, Calendar, CreditCard, User, Landmark } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export default function WithdrawalsPage() {
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<string>('pending')
    const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null)
    const [note, setNote] = useState('')
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)

    const { data, isLoading, refetch } = useGetWithdrawalRequestsQuery({
        page,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined
    })

    const [approveWithdrawal, { isLoading: isApproving }] = useApproveWithdrawalMutation()
    const [rejectWithdrawal, { isLoading: isRejecting }] = useRejectWithdrawalMutation()

    const handleAction = async () => {
        if (!selectedRequest || !actionType) return

        if (actionType === 'reject' && !note.trim()) {
            toast.error('Please provide a reason for rejection')
            return
        }

        try {
            if (actionType === 'approve') {
                await approveWithdrawal({ id: selectedRequest.id, note }).unwrap()
                toast.success('Withdrawal approved successfully')
            } else {
                await rejectWithdrawal({ id: selectedRequest.id, note }).unwrap()
                toast.success('Withdrawal rejected')
            }
            setSelectedRequest(null)
            setNote('')
            setActionType(null)
        } catch (err: any) {
            toast.error(err?.data?.message || 'Action failed')
        }
    }

    const withdrawals = data?.withdrawals || []
    const pagination = data?.pagination

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card border border-border/50 p-6 rounded-md shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Withdrawal Requests</h1>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Manage payout requests from owners and operators.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <button
                        type="button"
                        onClick={() => {
                            setPage(1)
                            refetch()
                        }}
                        className="p-3 bg-muted/50 text-muted-foreground hover:text-primary hover:bg-muted border border-transparent hover:border-border/50 rounded-md transition-all"
                        title="Refresh List"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>
                    <div className="flex p-1 bg-muted/30 rounded-md border border-border/50">
                        {['pending', 'approved', 'rejected', 'all'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setStatusFilter(tab)
                                    setPage(1)
                                }}
                                className={clsx(
                                    "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all",
                                    statusFilter === tab
                                        ? 'bg-primary text-black shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : (
                <div className="bg-card border border-border/50 rounded-md overflow-hidden shadow-sm">
                    {withdrawals.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted/30 mb-6">
                                <CreditCard className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">No Withdrawals Found</h3>
                            <p className="text-muted-foreground mt-2">There are no withdrawal requests matching your filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/30 text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border/50">
                                    <tr>
                                        <th className="px-6 py-4">Request Details</th>
                                        <th className="px-6 py-4">User Info</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {withdrawals.map((item) => (
                                        <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                        <Landmark className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground">ID: #{item.id}</p>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                        {item.user.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground">{item.user.name}</p>
                                                        <p className="text-xs text-muted-foreground">{item.user.mobile}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-lg font-black text-foreground tracking-tight">
                                                    ₹{parseFloat(item.amount).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={clsx(
                                                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                                                    item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                        item.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                )}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {item.status === 'pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRequest(item)
                                                                setActionType('approve')
                                                                setNote('')
                                                            }}
                                                            className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRequest(item)
                                                                setActionType('reject')
                                                                setNote('')
                                                            }}
                                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                )}
                                                {item.status !== 'pending' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest(item)
                                                            setActionType(null) // view only
                                                        }}
                                                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-border/50 bg-muted/20">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="px-4 py-2 text-xs font-bold bg-background border border-border rounded-md hover:bg-muted disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-xs font-medium text-muted-foreground">
                                Page {page} of {pagination.totalPages}
                            </span>
                            <button
                                disabled={page === pagination.totalPages}
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                className="px-4 py-2 text-xs font-bold bg-background border border-border rounded-md hover:bg-muted disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Action Modal */}
            <AnimatePresence>
                {selectedRequest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-card w-full max-w-lg rounded-lg shadow-2xl border border-border overflow-hidden"
                        >
                            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/20">
                                <h3 className="text-lg font-black text-foreground">
                                    {actionType === 'approve' ? 'Approve Withdrawal' :
                                        actionType === 'reject' ? 'Reject Withdrawal' : 'Withdrawal Details'}
                                </h3>
                                <button onClick={() => setSelectedRequest(null)} className="text-muted-foreground hover:text-foreground">
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">Amount</label>
                                        <p className="text-xl font-black text-foreground">₹{parseFloat(selectedRequest.amount).toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">User</label>
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                                {selectedRequest.user.name[0]}
                                            </div>
                                            <p className="text-sm font-medium text-foreground truncate">{selectedRequest.user.name}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 p-4 bg-muted/30 rounded-md border border-border/50">
                                    <h4 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-2">
                                        <Landmark className="h-3 w-3" />
                                        Bank Details
                                    </h4>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                        <div>
                                            <span className="text-xs text-muted-foreground block">Bank Name</span>
                                            <span className="font-bold">{selectedRequest.bankDetails.bankName}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground block">Account Holder</span>
                                            <span className="font-bold">{selectedRequest.bankDetails.holderName}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground block">Account Number</span>
                                            <span className="font-mono font-medium">{selectedRequest.bankDetails.accountNumber}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground block">IFSC Code</span>
                                            <span className="font-mono font-medium">{selectedRequest.bankDetails.ifsc}</span>
                                        </div>
                                    </div>
                                </div>

                                {actionType && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-foreground">
                                            {actionType === 'reject' ? 'Rejection Reason (Required)' : 'Admin Note (Optional)'}
                                        </label>
                                        <textarea
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className="w-full h-24 p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
                                            placeholder={actionType === 'reject' ? "e.g., Incorrect bank details provided..." : "e.g., Processed via NEFT: REF123456"}
                                        />
                                    </div>
                                )}

                                {!actionType && selectedRequest.adminNote && (
                                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                                        <p className="text-xs font-bold text-yellow-600 uppercase mb-1">Admin Note</p>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-400">{selectedRequest.adminNote}</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 pt-0 flex justify-end gap-3">
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    Close
                                </button>
                                {actionType === 'approve' && (
                                    <button
                                        onClick={handleAction}
                                        disabled={isApproving}
                                        className="flex items-center px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-md shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                                    >
                                        {isApproving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                        Confirm Approval
                                    </button>
                                )}
                                {actionType === 'reject' && (
                                    <button
                                        onClick={handleAction}
                                        disabled={isRejecting}
                                        className="flex items-center px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-md shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                                    >
                                        {isRejecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                                        Reject Request
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
