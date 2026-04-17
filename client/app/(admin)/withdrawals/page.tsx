'use client'

import React, { useState } from 'react'
import { useGetWithdrawalRequestsQuery, useApproveWithdrawalMutation, useRejectWithdrawalMutation, WithdrawalRequest } from '@/redux/apis/walletApi'
import { Loader2, RefreshCw, Eye, CheckCircle, XCircle, Search, Filter, AlertCircle, Calendar, CreditCard, User, Landmark, Hash } from 'lucide-react'
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
            className="space-y-8 relative"
        >
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/5 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shrink-0">
                        <CreditCard className="h-7 w-7 text-primary" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-foreground dark:text-white tracking-tight">Withdrawals</h2>
                        <p className="text-sm font-bold text-muted-foreground dark:text-zinc-400 mt-1 flex items-center gap-2">
                             <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                            Manage User Payments
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <button
                        type="button"
                        onClick={() => {
                            setPage(1)
                            refetch()
                        }}
                        className="p-3 text-muted-foreground hover:text-primary hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-zinc-200 dark:hover:border-white/10"
                        title="Refresh"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>
                    <div className="flex p-1.5 bg-muted/30 dark:bg-white/5 rounded-xl border border-zinc-200/50 dark:border-white/5 transition-all">
                        {['pending', 'approved', 'rejected', 'all'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setStatusFilter(tab)
                                    setPage(1)
                                }}
                                className={clsx(
                                    "px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95",
                                    statusFilter === tab
                                        ? 'bg-primary text-black shadow-lg shadow-primary/20'
                                        : 'text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-white/10'
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List Overview */}
            {isLoading ? (
                <div className="flex flex-col justify-center items-center h-80 space-y-4">
                    <Loader2 className="animate-spin h-10 w-10 text-primary" strokeWidth={3} />
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest animate-pulse">Loading payments...</p>
                </div>
            ) : (
                <div className="bg-card dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl overflow-hidden border border-zinc-200/50 dark:border-white/5 transition-all">
                    {withdrawals.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/30 dark:bg-white/5 border border-zinc-200/50 dark:border-white/5 mb-6 group hover:rotate-6 transition-all">
                                <CreditCard className="h-10 w-10 text-muted-foreground/50 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-2xl font-black text-foreground dark:text-white tracking-tight">No Withdrawals Found</h3>
                            <p className="text-sm font-medium text-muted-foreground dark:text-zinc-500 mt-2 max-w-xs mx-auto">There are no withdrawal requests matching your filters currently in the system.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-muted/30 dark:bg-zinc-800/50 border-b border-zinc-200/50 dark:border-white/5">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-[0.2em] opacity-70">Details</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-[0.2em] opacity-70">User</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-[0.2em] opacity-70">Amount</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-[0.2em] opacity-70">Status</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-[0.2em] opacity-70">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200/50 dark:divide-white/5">
                                    {withdrawals.map((item, idx) => (
                                        <tr key={item.id} className="group hover:bg-muted/30 dark:hover:bg-zinc-800/50 transition-all">
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                                        <Landmark className="h-5 w-5" strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-foreground dark:text-white tracking-tight">ID: #{item.id}</p>
                                                        <p className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 mt-1.5 opacity-70">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                                                        {item.user.name[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground dark:text-white tracking-tight">{item.user.name}</p>
                                                        <p className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest mt-0.5">{item.user.mobile}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <span className="text-lg font-black text-foreground dark:text-white tracking-tighter">
                                                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 mr-0.5">₹</span>
                                                    {parseFloat(item.amount).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <span className={clsx(
                                                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                                                    item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                        item.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                            'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
                                                )}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-right">
                                                {item.status === 'pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRequest(item)
                                                                setActionType('approve')
                                                                setNote('')
                                                            }}
                                                            className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all border border-transparent hover:border-emerald-500/20"
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
                                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
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
                                                            setActionType(null)
                                                        }}
                                                        className="p-2 text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-all"
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
                        <div className="flex items-center justify-between p-6 border-t border-zinc-200/50 dark:border-white/5 bg-muted/20 dark:bg-white/5">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-background dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-30 transition-all dark:text-white"
                            >
                                Previous
                            </button>
                            <span className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest bg-muted/50 dark:bg-black/20 px-4 py-2 rounded-lg border border-zinc-200/50 dark:border-white/10">
                                Page {page} <span className="mx-1 opacity-30">/</span> {pagination.totalPages}
                            </span>
                            <button
                                disabled={page === pagination.totalPages}
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                className="px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-background dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-30 transition-all dark:text-white"
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
                            className="bg-card dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-200 dark:border-white/10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-zinc-200/50 dark:border-white/5 flex justify-between items-center bg-muted/10 dark:bg-white/5">
                                <h3 className="text-xl font-black text-foreground dark:text-white tracking-tight">
                                    {actionType === 'approve' ? 'Approve' :
                                        actionType === 'reject' ? 'Reject' : 'Details'}
                                </h3>
                                <button onClick={() => setSelectedRequest(null)} className="text-muted-foreground hover:text-foreground dark:hover:text-white p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-all">
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest opacity-70">Amount</label>
                                        <p className="text-2xl font-black text-foreground dark:text-white tracking-tighter">
                                            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-600 mr-1">₹</span>
                                            {parseFloat(selectedRequest.amount).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest opacity-70">Recipient</label>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                                                {selectedRequest.user.name[0]?.toUpperCase()}
                                            </div>
                                            <p className="text-sm font-bold text-foreground dark:text-white truncate tracking-tight">{selectedRequest.user.name}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 p-5 bg-muted/30 dark:bg-white/5 rounded-2xl border border-zinc-200/50 dark:border-white/5 transition-all">
                                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 opacity-80">
                                        <Landmark className="h-3 w-3" strokeWidth={3} />
                                        Bank Details
                                    </h4>
                                    <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm">
                                        <div>
                                            <span className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest opacity-60 block mb-1">Bank Name</span>
                                            <span className="font-bold text-foreground dark:text-white tracking-tight">{selectedRequest.bankDetails.bankName}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest opacity-60 block mb-1">Account Holder</span>
                                            <span className="font-bold text-foreground dark:text-white tracking-tight">{selectedRequest.bankDetails.holderName}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest opacity-60 block mb-1">Account Number</span>
                                            <span className="font-mono font-bold text-foreground dark:text-white text-xs bg-muted/50 dark:bg-black/20 px-2 py-1 rounded border border-zinc-200/50 dark:border-white/5">{selectedRequest.bankDetails.accountNumber}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest opacity-60 block mb-1">IFSC Code</span>
                                            <span className="font-mono font-bold text-foreground dark:text-zinc-white text-xs bg-muted/50 dark:bg-black/20 px-2 py-1 rounded border border-zinc-200/50 dark:border-white/5 uppercase">{selectedRequest.bankDetails.ifsc}</span>
                                        </div>
                                    </div>
                                </div>

                                {actionType && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest opacity-70">
                                            {actionType === 'reject' ? 'Reason' : 'Admin Note (Optional)'}
                                        </label>
                                        <textarea
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className="w-full h-28 p-4 bg-muted/30 dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary/50 focus:bg-background transition-all resize-none text-sm dark:text-white font-medium"
                                            placeholder={actionType === 'reject' ? "Why are you rejecting this?" : "Add a note..."}
                                        />
                                    </div>
                                )}

                                {!actionType && selectedRequest.adminNote && (
                                    <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-2 opacity-20">
                                            <AlertCircle className="h-10 w-10 text-amber-500" />
                                        </div>
                                        <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1.5 opacity-80">Admin Note</p>
                                        <p className="text-sm font-medium text-amber-700 dark:text-amber-200 leading-relaxed">{selectedRequest.adminNote}</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 pt-0 flex justify-end gap-3">
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="px-6 py-3 text-sm font-black text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-all"
                                >
                                    Close
                                </button>
                                {actionType === 'approve' && (
                                    <button
                                        onClick={handleAction}
                                        disabled={isApproving}
                                        className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black rounded-xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isApproving ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} /> : <CheckCircle className="h-5 w-5" strokeWidth={3} />}
                                        Approve
                                    </button>
                                )}
                                {actionType === 'reject' && (
                                    <button
                                        onClick={handleAction}
                                        disabled={isRejecting}
                                        className="flex items-center gap-2 px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl shadow-xl shadow-red-500/20 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isRejecting ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} /> : <XCircle className="h-5 w-5" strokeWidth={3} />}
                                        Reject
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
