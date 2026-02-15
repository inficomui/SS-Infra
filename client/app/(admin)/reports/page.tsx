'use client'

import { useState } from 'react'
import { useGetRechargeReportsQuery } from '@/redux/apis/dashboardApi'
import { Loader2, Search, Filter, Calendar, FileText, ChevronLeft, ChevronRight, User, CreditCard, Download, Printer } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export default function ReportsPage() {
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [search, setSearch] = useState('')

    const { data, isLoading } = useGetRechargeReportsQuery({
        page,
        limit: 10,
        status: statusFilter || undefined,
        search: search || undefined
    })

    const reports = data?.reports || []
    const pagination = data?.pagination

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header & Filters */}
            <div className="bg-card border border-border/50 p-6 sm:p-8 rounded-md shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-foreground tracking-tight">Financial Reports</h2>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Detailed log of all recharge transactions and revenue streams.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 min-w-[200px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search transaction ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border/50 rounded-md text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Reports Table */}
            <div className="bg-card shadow-2xl shadow-black/5 rounded-md overflow-hidden border border-border/60">
                <div className="flex justify-between items-center p-6 border-b border-border/40 bg-muted/5">
                    <h3 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Transaction Ledger
                    </h3>
                    <div className="flex gap-2">
                        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="Print Ledger">
                            <Printer className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="Export CSV">
                            <Download className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-96 space-y-4">
                        <Loader2 className="animate-spin h-10 w-10 text-primary" />
                        <p className="text-sm font-bold text-muted-foreground animate-pulse">Retrieving financial data...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border/30">
                            <thead className="bg-muted/20">
                                <tr>
                                    <th className="px-8 py-5 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Transaction ID</th>
                                    <th className="px-8 py-5 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">User Entity</th>
                                    <th className="px-8 py-5 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Amount</th>
                                    <th className="px-8 py-5 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Payment Mode</th>
                                    <th className="px-8 py-5 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-right text-xs font-black text-muted-foreground uppercase tracking-widest">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {reports.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="h-16 w-16 rounded-md bg-muted/50 flex items-center justify-center">
                                                    <FileText className="h-8 w-8 text-muted-foreground/30" />
                                                </div>
                                                <p className="text-muted-foreground font-bold">No transactions found matching criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : reports.map((report: any, idx: number) => (
                                    <motion.tr
                                        key={report.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="group hover:bg-muted/10 transition-colors"
                                    >
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className="font-mono text-xs font-bold text-foreground bg-muted p-1 rounded border border-border/50">
                                                #{report.id.toString().padStart(6, '0')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded bg-linear-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-foreground font-black border border-border/50 text-xs mr-3">
                                                    {report.user?.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-foreground">{report.user?.name}</div>
                                                    <div className="text-[10px] text-muted-foreground font-bold">{report.user?.role || 'USER'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className="text-sm font-black text-foreground">₹{report.amount?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                <CreditCard className="h-3 w-3 text-primary" />
                                                {report.paymentMethod || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className={clsx(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter border",
                                                report.status === 'completed' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                                    report.status === 'pending' ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                                                        "bg-red-500/10 text-red-600 border-red-500/20"
                                            )}>
                                                {report.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-bold text-foreground">
                                                    {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-medium opacity-60">
                                                    {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <AnimatePresence>
                    {pagination && pagination.totalPages > 1 && (
                        <div className="bg-muted/10 px-8 py-6 flex flex-col sm:flex-row items-center justify-between border-t border-border/30 gap-4">
                            <div className="text-sm font-bold text-muted-foreground">
                                Showing <span className="text-foreground">{(page - 1) * 10 + 1}</span> to <span className="text-foreground">{Math.min(page * 10, pagination.totalItems)}</span> of <span className="text-primary">{pagination.totalItems}</span> records
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
                                    Page {page} / {pagination.totalPages}
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
