"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Navigation, User, Star, ArrowRight, Heart, Share2, Filter } from "lucide-react";

import { useGetOperatorsQuery } from "@/redux/apis/discoveryApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { openBookingModal } from "@/redux/slices/modalSlice";
import { BookingModal } from "@/components/services/BookingModal";

export function OperatorDiscovery() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { isBookingModalOpen } = useAppSelector((s) => s.modal);
    const [activeTab, setActiveTab] = useState("nearby");

    const { data, isLoading } = useGetOperatorsQuery({ page: 1 });
    const operators = data?.data?.data ?? [];

    return (
        <>
            <section className="py-24 md:py-32 relative overflow-hidden" id="discovery">
                {/* Background decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-primary/5 blur-[120px] rounded-full -z-10" />

                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                        <div className="lg:w-1/3 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-6">
                                <MapPin size={14} /> Global Discovery
                            </div>
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-[Space Grotesk] leading-[0.9] tracking-tight mb-8 uppercase">
                                Find Your <br />
                                <span className="text-gradient-yellow">Next Expert.</span>
                            </h2>
                            <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed mb-10 md:mb-12">
                                Our real-time discovery engine matches you with the highest-rated operators in your immediate vicinity.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 mb-12">
                                {['verified', 'location', 'rating'].map((f) => (
                                    <div key={f} className="flex items-center gap-4 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-background dark:bg-zinc-900 shadow-sm transition-all hover:border-primary/30">
                                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                                            <Filter size={18} />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Filter By</div>
                                            <div className="font-black uppercase text-xs">{f}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-2/3">
                            <div className="bg-background dark:bg-background rounded-[1.5rem] md:rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-3xl overflow-hidden">
                                <div className="p-4 md:p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                        {['nearby', 'top_rated', 'urgent'].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`px-5 md:px-6 py-3 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-black dark:bg-background text-white dark:text-foreground shadow-lg' : 'text-muted-foreground hover:text-zinc-900 dark:hover:text-white'
                                                    }`}
                                            >
                                                {tab.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-[10px] md:text-xs font-bold text-muted-foreground">
                                        <span className="w-2 h-2 bg-green-500 rounded-sm animate-pulse" /> {operators.length} Active Online
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 space-y-4 max-h-[600px] overflow-y-auto">
                                    {isLoading ? (
                                        Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="flex items-center gap-8 p-6 rounded-xl border border-zinc-100 dark:border-zinc-800 animate-pulse">
                                                <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                                                <div className="flex-1 space-y-3">
                                                    <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full w-1/3" />
                                                    <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full w-1/2" />
                                                </div>
                                            </div>
                                        ))
                                    ) : operators.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">No operators available at the moment.</p>
                                        </div>
                                    ) : (
                                        operators.map((op: any) => (
                                            <motion.div
                                                layout
                                                key={op.id}
                                                className="group p-6 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-primary/50 bg-zinc-50/50 dark:bg-zinc-900/40 transition-all flex flex-col md:flex-row items-center gap-6 md:gap-8"
                                            >
                                                <div className="relative shrink-0">
                                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-xl flex items-center justify-center text-foreground font-black text-2xl overflow-hidden uppercase">
                                                        {op.avatar ? <img src={op.avatar} className="w-full h-full object-cover" /> : op.name[0]}
                                                    </div>
                                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-950 ${op.status === 'online' ? 'bg-green-500' : 'bg-primary'
                                                        }`} />
                                                </div>

                                                <div className="flex-1 text-center md:text-left">
                                                    <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4 mb-2">
                                                        <h4 className="text-xl md:text-2xl font-black font-[Space Grotesk] tracking-tight uppercase leading-none">{op.name}</h4>
                                                        <div className="flex items-center gap-1 text-primary text-xs md:text-sm font-black">
                                                            <Star size={14} fill="currentColor" /> {op.rating || "5.0"}
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] md:text-sm font-black text-muted-foreground uppercase tracking-widest mb-4">{op.district} • {op.taluka}</p>
                                                    <div className="flex items-center justify-center md:justify-start gap-6">
                                                        <div className="flex items-center gap-2 text-[10px] md:text-xs font-black text-muted-foreground">
                                                            <Navigation size={14} className="text-primary" /> {op.experience || "Expert"}
                                                        </div>
                                                        <div className="text-[9px] md:text-[10px] font-black text-zinc-900 dark:text-zinc-100 py-1.5 px-3 bg-background dark:bg-zinc-800 rounded-lg shadow-sm border border-black/5 dark:border-white/5 uppercase">
                                                            Active Now
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex w-full md:w-auto gap-2">
                                                    <button className="flex-1 md:flex-none h-12 md:w-12 md:h-12 rounded-xl bg-background dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                                                        <Heart size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => dispatch(openBookingModal({ id: String(op.id), type: 'operator', name: op.name }))}
                                                        className="flex-[3] md:flex-none px-6 md:px-8 py-4 bg-primary hover:bg-amber-600 text-black font-black rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-3"
                                                    >
                                                        Book Now <ArrowRight size={14} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Booking Modal Portal */}
            {isBookingModalOpen && <BookingModal />}
        </>
    );
}
