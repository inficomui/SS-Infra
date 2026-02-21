"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Navigation, User, Star, ArrowRight, Heart, Share2, Filter } from "lucide-react";

export function OperatorDiscovery() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("nearby");
    const [operators] = useState([
        { id: 1, name: "Rahul Deshmukh", type: "JCB Expert", rating: 4.8, distance: "1.2 km", status: "online", price: "₹800/hr", jobs: 145 },
        { id: 2, name: "Sanjay Patil", type: "Excavator Ops", rating: 4.9, distance: "2.5 km", status: "online", price: "₹1,200/hr", jobs: 230 },
        { id: 3, name: "Vijay Shinde", type: "Crane Ops", rating: 4.7, distance: "3.8 km", status: "busy", price: "₹1,500/hr", jobs: 89 },
    ]);

    return (
        <section className="py-32 relative overflow-hidden" id="discovery">
            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-amber-500/5 blur-[120px] rounded-full -z-10" />

            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-20">
                    <div className="lg:w-1/3">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6">
                            <MapPin size={14} /> Global Discovery
                        </div>
                        <h2 className="text-6xl font-black font-[Space Grotesk] leading-[0.9] tracking-tight mb-8">
                            Find Your <br />
                            <span className="gradient-text">Next Expert.</span>
                        </h2>
                        <p className="text-lg text-zinc-500 font-medium leading-relaxed mb-12">
                            Our real-time discovery engine matches you with the highest-rated operators in your immediate vicinity.
                        </p>

                        <div className="space-y-4 mb-12">
                            {['verified', 'location', 'rating'].map((f) => (
                                <div key={f} className="flex items-center gap-4 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                                    <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
                                        <Filter size={18} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Filter By</div>
                                        <div className="font-black uppercase text-xs">{f}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:w-2/3">
                        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-3xl overflow-hidden">
                            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                                <div className="flex gap-2">
                                    {['nearby', 'top_rated', 'urgent'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-black dark:bg-white text-white dark:text-black shadow-xl' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                                                }`}
                                        >
                                            {tab.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-xs font-bold text-zinc-500">
                                    <span className="w-2 h-2 bg-green-500 rounded-sm animate-pulse" /> {operators.length} Active Online
                                </div>
                            </div>

                            <div className="p-8 space-y-4 max-h-[600px] overflow-y-auto">
                                {operators.map((op) => (
                                    <motion.div
                                        layout
                                        key={op.id}
                                        className="group p-6 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-amber-500/50 bg-zinc-50/50 dark:bg-zinc-900/40 transition-all flex flex-col md:flex-row items-center gap-8"
                                    >
                                        <div className="relative">
                                            <div className="w-20 h-20 bg-amber-500 rounded-xl flex items-center justify-center text-black font-black text-2xl">
                                                {op.name[0]}
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-950 ${op.status === 'online' ? 'bg-green-500' : 'bg-amber-500'
                                                }`} />
                                        </div>

                                        <div className="flex-1 text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                                                <h4 className="text-2xl font-black font-[Space Grotesk] tracking-tight">{op.name}</h4>
                                                <div className="flex items-center gap-1 text-amber-500 text-sm font-black">
                                                    <Star size={14} fill="currentColor" /> {op.rating}
                                                </div>
                                            </div>
                                            <p className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4">{op.type} • {op.jobs} Jobs</p>
                                            <div className="flex items-center justify-center md:justify-start gap-6">
                                                <div className="flex items-center gap-2 text-xs font-black text-zinc-500">
                                                    <Navigation size={14} className="text-amber-500" /> {op.distance}
                                                </div>
                                                <div className="text-xs font-black text-zinc-900 dark:text-zinc-100 py-1.5 px-3 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                                                    {op.price}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors">
                                                <Heart size={20} />
                                            </button>
                                            <button className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 active:scale-95 flex items-center gap-3">
                                                Book Now <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
