"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Clock, Calendar, MessageSquare, FileText, Activity, MapPin, User, ArrowRight, Loader2, Phone, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useGetEnquiriesQuery } from "@/redux/apis/bookingApi";
import { format } from "date-fns";

export default function ClientDashboard() {
    const { t } = useTranslation();
    const [tab, setTab] = useState("bookings");

    const { data, isLoading } = useGetEnquiriesQuery({});

    const allBookings = data?.data?.data || [];
    const activeBookings = allBookings.filter(b => ['pending', 'assigned'].includes(b.status));
    const historyBookings = allBookings.filter(b => ['completed', 'cancelled'].includes(b.status));

    // Dynamic aggregated data
    const totalSpent = "₹" + (historyBookings.length * 2000).toLocaleString(); // Mock calculation as real amounts might differ
    const activeJobsCount = activeBookings.length;
    const historyJobsCount = historyBookings.length;

    const renderBookingCard = (b: any, isHistory = false) => {
        const operatorName = b.assigned_operator_id ? b.assigned_operator?.name || `Operator #${b.assigned_operator_id}` : b.target?.name || `Provider #${b.target_id}`;

        const statusColors: any = {
            pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
            assigned: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
            completed: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
            cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
        };

        const statusColor = statusColors[b.status] || statusColors.pending;

        return (
            <div key={b.id} className="group flex flex-col md:flex-row items-center justify-between p-5 border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--bg)] hover:bg-[var(--bg-muted)] transition-all duration-300 rounded-2xl gap-6 shadow-sm hover:shadow-md">
                <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--accent)] to-amber-600 text-white flex items-center justify-center font-black text-xl shadow-inner transform group-hover:scale-105 transition-transform duration-300">
                        {operatorName.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="font-black text-lg text-[var(--fg)] flex items-center gap-2">
                            {operatorName}
                            {b.status === 'assigned' && <span className="inline-flex w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
                        </div>
                        <div className="text-sm font-medium text-[var(--fg-muted)] flex flex-wrap items-center gap-4 mt-1">
                            <span className="flex items-center gap-1"><Clock size={14} className="text-[var(--accent)]" />
                                {b.date_of_requirement ? format(new Date(b.date_of_requirement), 'dd MMM yyyy') : 'No Date'}
                            </span>
                            <span className="flex items-center gap-1"><MapPin size={14} className="text-[var(--accent)]" />
                                {b.location_district}, {b.location_taluka}
                            </span>
                        </div>
                        {b.message && (
                            <div className="text-xs text-[var(--fg-muted)] mt-2 bg-[var(--bg-muted)] px-3 py-2 rounded-lg border border-[var(--border)] italic">
                                "{b.message}"
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
                    <div className={`text-xs font-black px-4 py-1.5 rounded-full inline-flex border uppercase tracking-wider ${statusColor}`}>
                        {b.status}
                    </div>
                    <div className="flex gap-2">
                        <button className="h-10 w-10 rounded-full flex items-center justify-center bg-[var(--bg-muted)] text-[var(--fg)] hover:text-white hover:bg-[var(--accent)] border border-[var(--border)] transition-colors duration-300" title="Contact Support">
                            <MessageSquare size={16} />
                        </button>
                        {(b.status === 'assigned' || b.status === 'pending') && (
                            <button className="h-10 px-4 rounded-full flex items-center justify-center bg-[var(--accent)] text-white font-bold hover:bg-amber-600 shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.23)] transition-all duration-300 transform group-hover:-translate-y-0.5" title="Call Provider">
                                <Phone size={14} className="mr-2" /> Call
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-[var(--bg-muted)] text-[var(--fg)] selection:bg-[var(--accent)] selection:text-white">
            <Navbar />

            <div className="pt-32 pb-24 container mx-auto px-6 max-w-7xl flex flex-col lg:flex-row gap-8">

                {/* Sidebar */}
                <div className="w-full lg:w-[280px] shrink-0">
                    <div className="bg-[var(--bg)] border border-[var(--border)] p-6 rounded-3xl sticky top-28 shadow-xl shadow-black/[0.02]">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-white flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-amber-500/20">C</div>
                            <div>
                                <h2 className="font-black text-xl">My Portal</h2>
                                <div className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-500/10 inline-block px-2 py-0.5 rounded-md mt-1 border border-amber-500/20">Client User</div>
                            </div>
                        </div>

                        <nav className="flex flex-col gap-2">
                            <button onClick={() => setTab("bookings")} className={`relative overflow-hidden text-left px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${tab === 'bookings' ? 'bg-[var(--fg)] text-[var(--bg)] shadow-md' : 'text-[var(--fg-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg)]'}`}>
                                <Calendar size={18} className="inline mr-3 opacity-80" />
                                Active Bookings
                                {activeJobsCount > 0 && tab !== 'bookings' && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--accent)] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                        {activeJobsCount}
                                    </span>
                                )}
                            </button>
                            <button onClick={() => setTab("history")} className={`text-left px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${tab === 'history' ? 'bg-[var(--fg)] text-[var(--bg)] shadow-md' : 'text-[var(--fg-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg)]'}`}>
                                <Activity size={18} className="inline mr-3 opacity-80" /> History
                            </button>
                            <button onClick={() => setTab("invoices")} className={`text-left px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${tab === 'invoices' ? 'bg-[var(--fg)] text-[var(--bg)] shadow-md' : 'text-[var(--fg-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg)]'}`}>
                                <FileText size={18} className="inline mr-3 opacity-80" /> Invoices
                            </button>
                            <button onClick={() => setTab("chat")} className={`text-left px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${tab === 'chat' ? 'bg-[var(--fg)] text-[var(--bg)] shadow-md' : 'text-[var(--fg-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg)]'}`}>
                                <MessageSquare size={18} className="inline mr-3 opacity-80" /> Chat Support
                            </button>
                        </nav>

                        <div className="mt-8 pt-8 border-t border-[var(--border)]">
                            <div className="bg-gradient-to-br from-[var(--accent)] to-amber-600 rounded-2xl p-5 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                                    <Activity size={80} />
                                </div>
                                <h4 className="font-black text-sm mb-1 relative z-10">Need Equipment?</h4>
                                <p className="text-xs text-white/80 font-medium mb-4 relative z-10 max-w-[150px]">Explore nearby owners and operators.</p>
                                <Link href="/search" className="inline-flex items-center justify-center font-bold text-xs bg-white text-amber-600 px-4 py-2 rounded-xl hover:bg-amber-50 transition-colors relative z-10 w-full group-hover:shadow-md">
                                    Search Now <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                        <div className="bg-[var(--bg)] border border-[var(--border)] p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)] mb-3 flex items-center gap-2"><Activity size={12} className="text-[var(--accent)]" /> Active Jobs</div>
                            <div className="text-4xl font-black text-[var(--fg)]">{activeJobsCount}</div>
                        </div>
                        <div className="bg-[var(--bg)] border border-[var(--border)] p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)] mb-3 flex items-center gap-2"><CheckCircle size={12} className="text-blue-500 dark:text-blue-400" /> Completed</div>
                            <div className="text-4xl font-black text-[var(--fg)]">{historyJobsCount}</div>
                        </div>
                        <div className="bg-[var(--bg)] border border-[var(--border)] p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group sm:col-span-2 lg:col-span-1">
                            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors"></div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)] mb-3 flex items-center gap-2"><FileText size={12} className="text-green-500 dark:text-green-400" /> Est. Value</div>
                            <div className="text-4xl font-black text-[var(--fg)]">{totalSpent}</div>
                        </div>
                    </div>

                    <div className="bg-[var(--bg)] border border-[var(--border)] p-8 rounded-3xl shadow-sm min-h-[500px]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black capitalize flex items-center gap-3">
                                {tab === 'bookings' && <Calendar className="text-[var(--accent)]" />}
                                {tab === 'history' && <Activity className="text-[var(--accent)]" />}
                                {tab === 'invoices' && <FileText className="text-[var(--accent)]" />}
                                {tab === 'chat' && <MessageSquare className="text-[var(--accent)]" />}
                                {tab === 'bookings' ? 'Active Bookings' : tab}
                            </h3>
                            {tab === 'bookings' && (
                                <button onClick={() => { }} className="text-sm font-bold text-[var(--accent)] hover:text-amber-600 dark:hover:text-amber-400 transition-colors bg-amber-500/10 px-4 py-2 rounded-xl flex items-center gap-2">
                                    <Loader2 size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
                                </button>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-60">
                                <Loader2 size={40} className="animate-spin text-[var(--accent)] mb-4" />
                                <p className="font-bold text-[var(--fg-muted)]">Loading your dashboard...</p>
                            </div>
                        ) : (
                            <>
                                {tab === "bookings" && (
                                    <div className="space-y-4">
                                        {activeBookings.length > 0 ? (
                                            activeBookings.map((b: any) => renderBookingCard(b, false))
                                        ) : (
                                            <div className="text-center py-16 bg-[var(--bg-muted)] border border-[var(--border)] rounded-3xl border-dashed">
                                                <div className="w-16 h-16 bg-[var(--bg)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border)] shadow-sm">
                                                    <Calendar className="text-[var(--fg-muted)]" size={24} />
                                                </div>
                                                <h4 className="font-black text-lg mb-2">No active bookings</h4>
                                                <p className="text-[var(--fg-muted)] font-medium max-w-sm mx-auto mb-6">You don't have any ongoing jobs at the moment.</p>
                                                <Link href="/search" className="inline-flex items-center justify-center font-bold text-sm bg-[var(--fg)] text-[var(--bg)] px-6 py-3 rounded-xl hover:bg-opacity-90 transition-colors shadow-md">
                                                    Find Equipment
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {tab === "history" && (
                                    <div className="space-y-4">
                                        {historyBookings.length > 0 ? (
                                            historyBookings.map((b: any) => renderBookingCard(b, true))
                                        ) : (
                                            <div className="text-center py-16 bg-[var(--bg-muted)] border border-[var(--border)] border-dashed rounded-3xl">
                                                <div className="w-16 h-16 bg-[var(--bg)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border)] shadow-sm">
                                                    <Activity className="text-[var(--fg-muted)]" size={24} />
                                                </div>
                                                <h4 className="font-black text-lg mb-2">No history found</h4>
                                                <p className="text-[var(--fg-muted)] font-medium max-w-sm mx-auto">Your completed or cancelled bookings will appear here.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {tab === "invoices" && (
                                    <div className="text-center py-24 bg-[var(--bg-muted)] border border-[var(--border)] border-dashed rounded-3xl">
                                        <div className="w-20 h-20 bg-[var(--bg)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border)] shadow-sm relative">
                                            <FileText className="text-[var(--fg-muted)]" size={32} />
                                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[var(--accent)] rounded-full text-white flex items-center justify-center text-[10px] font-black border-2 border-[var(--bg)]">0</div>
                                        </div>
                                        <h4 className="font-black text-xl mb-2">No pending invoices</h4>
                                        <p className="text-[var(--fg-muted)] font-medium max-w-sm mx-auto">You are all caught up! Generated invoices for your jobs will appear here.</p>
                                    </div>
                                )}

                                {tab === "chat" && (
                                    <div className="text-center py-24 bg-[var(--bg-muted)] border border-[var(--border)] border-dashed rounded-3xl">
                                        <div className="w-20 h-20 bg-[var(--bg)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border)] shadow-sm">
                                            <MessageSquare className="text-[var(--fg-muted)]" size={32} />
                                        </div>
                                        <h4 className="font-black text-xl mb-2">Message Center</h4>
                                        <p className="text-[var(--fg-muted)] font-medium max-w-sm mx-auto">Select a booking to start chatting with your allocated operator or owner directly.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
