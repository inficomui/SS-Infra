'use client'

import React, { useState } from 'react'
import { useGetRechargeReportsQuery } from '@/redux/apis/dashboardApi'
import { Loader2, Search, Filter, Calendar, FileText, ChevronLeft, ChevronRight, User, CreditCard, Download, Printer, CircleDollarSign, Hash, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export default function ReportsPage() {
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    // Proper Debounce Logic
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search)
        }, 500)
        return () => clearTimeout(handler)
    }, [search])

    const { data, isLoading } = useGetRechargeReportsQuery({
        page,
        limit: 10,
        status: statusFilter || undefined,
        search: debouncedSearch || undefined
    })

    const reports = data?.reports || []
    const pagination = data?.pagination

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header & Advanced Search Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/5 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shrink-0">
                        <FileText className="h-7 w-7 text-blue-500" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-foreground dark:text-white tracking-tight">Financial Reports</h2>
                        <p className="text-sm font-bold text-muted-foreground dark:text-zinc-400 mt-1 flex items-center gap-2">
                             <CircleDollarSign className="h-4 w-4 text-emerald-500" />
                            Consolidated Revenue & Transaction Analytics
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-80 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search transaction identity..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-muted/30 dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/50 focus:bg-background transition-all outline-none dark:text-white placeholder:text-muted-foreground/50"
                        />
                    </div>
                </div>
            </div>

            {/* Reports Ledger Implementation */}
            <div className="bg-card dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl overflow-hidden border border-zinc-200/50 dark:border-white/5 transition-all">
                <div className="flex justify-between items-center p-8 border-b border-zinc-200/50 dark:border-white/5 bg-muted/10 dark:bg-white/5">
                    <h3 className="text-lg font-black text-foreground dark:text-white tracking-tight flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <Hash className="h-4 w-4" strokeWidth={3} />
                        </div>
                        Transaction Ledger
                    </h3>
                    <div className="flex gap-2">
                        <button className="p-3 text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-zinc-200 dark:hover:border-white/10" title="Print Ledger">
                            <Printer className="h-5 w-5" />
                        </button>
                        <button className="p-3 text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-zinc-200 dark:hover:border-white/10" title="Export CSV">
                            <Download className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-[500px] space-y-6">
                        <Loader2 className="animate-spin h-12 w-12 text-primary" strokeWidth={3} />
                        <div className="text-center">
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Syncing Cryptographic Records</p>
                            <p className="text-[10px] text-zinc-400 mt-2 font-bold opacity-50">Establishing connection to database node...</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-muted/30 dark:bg-zinc-800/50 border-b border-zinc-200/50 dark:border-white/5">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-[0.2em] opacity-70">Trans. Segment</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-[0.2em] opacity-70">Payee Entity</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-[0.2em] opacity-70">Value Analysis</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-[0.2em] opacity-70">Network Method</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-[0.2em] opacity-70">Finality State</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-[0.2em] opacity-70">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200/50 dark:divide-white/5">
                                {reports.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="h-20 w-20 rounded-3xl bg-muted/30 dark:bg-white/5 flex items-center justify-center border border-zinc-200/50 dark:border-white/5 text-muted-foreground/30 group hover:rotate-6 transition-all">
                                                    <FileText className="h-10 w-10" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-black text-foreground dark:text-white tracking-tight">Zero Records Found</p>
                                                    <p className="text-sm font-medium text-muted-foreground dark:text-zinc-500 mt-1 max-w-xs mx-auto">The ledger is currently empty for the specified search parameters.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((report: any, idx: number) => (
                                        <motion.tr
                                            key={report.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="group hover:bg-muted/30 dark:hover:bg-zinc-800/50 transition-all"
                                        >
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <span className="font-mono text-[11px] font-black text-foreground dark:text-white bg-muted/50 dark:bg-white/10 px-2 py-1.5 rounded-lg border border-zinc-200/50 dark:border-white/10 tracking-wider">
                                                    #{report.id.toString().substring(0, 8).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-black border border-primary/20 text-xs">
                                                        {report.user?.name?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-foreground dark:text-white tracking-tight">{report.user?.name || 'Anonymous Entity'}</div>
                                                        <div className="text-[10px] text-muted-foreground dark:text-zinc-500 font-black uppercase tracking-widest mt-0.5 opacity-70">Access Level: {report.user?.role || 'CLIENT'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-base font-black text-foreground dark:text-white tracking-tighter">
                                                        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-600 mr-1">₹</span>
                                                        {report.amount?.toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Verified Payout</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-2.5 text-[10px] font-black text-muted-foreground dark:text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-white/5 py-1.5 px-3 rounded-lg border border-zinc-200/50 dark:border-white/10 w-fit">
                                                    <CreditCard className="h-3 w-3 text-primary" strokeWidth={3} />
                                                    {report.paymentMethod || 'SECURE_TRANS'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className={clsx(
                                                    "inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                                                    report.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                        report.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse" :
                                                            "bg-red-500/10 text-red-500 border-red-500/20"
                                                )}>
                                                    <span className={clsx("h-1.5 w-1.5 rounded-full mr-2", 
                                                        report.status === 'completed' ? "bg-emerald-500" :
                                                        report.status === 'pending' ? "bg-amber-500" : "bg-red-500"
                                                    )}></span>
                                                    {report.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-right">
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-1.5 text-xs font-black text-foreground dark:text-white tracking-tight">
                                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                                        {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground dark:text-zinc-500 font-bold mt-1 opacity-70 uppercase tracking-widest">
                                                        <Clock className="h-2.5 w-2.5" />
                                                        {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Advanced Pagination UI */}
                <AnimatePresence>
                    {pagination && pagination.totalPages > 1 && (
                        <div className="bg-muted/10 dark:bg-white/5 px-8 py-8 flex flex-col lg:flex-row items-center justify-between border-t border-zinc-200/50 dark:border-white/5 gap-6">
                            <div className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-[0.2em] opacity-70">
                                Ledger Range: <span className="text-foreground dark:text-white">{(page - 1) * 10 + 1}</span> — <span className="text-foreground dark:text-white">{Math.min(page * 10, pagination.total || pagination.totalItems || 0)}</span> <span className="mx-2 opacity-30">|</span> Total Items: <span className="text-primary">{pagination.total || pagination.totalItems}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="inline-flex items-center px-6 py-2.5 bg-background dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" strokeWidth={3} /> Previous Node
                                </button>
                                <div className="px-6 py-2.5 bg-primary/10 border border-primary/20 rounded-xl text-[10px] font-black text-primary tracking-widest uppercase">
                                    Page {page} <span className="mx-1 opacity-40">/</span> {pagination.totalPages}
                                </div>
                                <button
                                    onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                                    disabled={page === pagination.totalPages}
                                    className="inline-flex items-center px-6 py-2.5 bg-background dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                                >
                                    Next Node <ChevronRight className="h-4 w-4 ml-2" strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
