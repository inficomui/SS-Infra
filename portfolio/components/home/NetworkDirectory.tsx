"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, HardHat, Briefcase, ChevronRight, CheckCircle2, Star, Zap } from "lucide-react";

const DATA = {
    pune: {
        owners: [
            { name: "Pune Infra Corp", fleet: 15, rating: 4.8 },
            { name: "Sahyadri Earthmovers", fleet: 8, rating: 4.5 }
        ],
        operators: 124,
        clients: ["MIDC Chakan", "Pune Metro", "Amanora Park"],
        plans: ["Pro", "Enterprise"]
    },
    mumbai: {
        owners: [
            { name: "Coastal Road Builders", fleet: 45, rating: 4.9 },
            { name: "Harbor Tech", fleet: 22, rating: 4.7 }
        ],
        operators: 342,
        clients: ["MMRDA", "CIDCO", "MCGM"],
        plans: ["Enterprise Plus"]
    },
    nagpur: {
        owners: [
            { name: "Vidarbha heavy Lift", fleet: 12, rating: 4.4 }
        ],
        operators: 68,
        clients: ["MIHAN", "Nagpur Smart City"],
        plans: ["Starter", "Pro"]
    }
};

export function NetworkDirectory() {
    const { t } = useTranslation();
    const [activeLocation, setActiveLocation] = useState<keyof typeof DATA>("pune");

    const plans = [
        { title: "Starter", price: "₹2,999", features: ["10 Operator Slots", "Basic Analytics", "Email Support"] },
        { title: "Pro", price: "₹7,499", features: ["50 Operator Slots", "Real-time Tracking", "Priority Ops", "24/7 Support"] },
        { title: "Enterprise", price: "Custom", features: ["Unlimited Fleet", "Neural Mesh Integration", "Dedicated Manager", "API Access"] }
    ];

    return (
        <section className="py-32 bg-zinc-50 dark:bg-[#080808] border-y border-zinc-100 dark:border-zinc-900" id="directory">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col items-center text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                        <Zap size={14} className="animate-pulse" /> Network Ecosystem
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black font-[Space Grotesk] tracking-tighter mb-8 leading-tight">
                        Location-Wise <br />
                        <span className="gradient-text">Resource Mapping.</span>
                    </h2>
                    <p className="max-w-2xl text-xl text-zinc-500 font-medium">
                        Explore our vast network of owners, operators, and active project footprints across Maharashtra's industrial hubs.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Location Sidebar */}
                    <div className="lg:col-span-4 space-y-4">
                        {(Object.keys(DATA) as Array<keyof typeof DATA>).map((loc) => (
                            <button
                                key={loc}
                                onClick={() => setActiveLocation(loc)}
                                className={`w-full group p-8 rounded-xl border transition-all duration-500 flex items-center justify-between ${activeLocation === loc
                                    ? 'bg-black dark:bg-white text-white dark:text-black border-transparent shadow-2xl scale-105'
                                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-amber-500/50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${activeLocation === loc ? 'bg-amber-500 text-black' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                                        }`}>
                                        <MapPin size={24} />
                                    </div>
                                    <span className="text-2xl font-black capitalize tracking-tight font-[Space Grotesk]">{loc} Hub</span>
                                </div>
                                <ChevronRight size={20} className={`transition-transform duration-500 ${activeLocation === loc ? 'rotate-90 text-amber-500' : 'group-hover:translate-x-1'}`} />
                            </button>
                        ))}

                        <div className="mt-12 p-10 bento-card bg-linear-to-br from-amber-500 to-yellow-600 text-black">
                            <h4 className="text-2xl font-black font-[Space Grotesk] mb-4">Need Custom Coverage?</h4>
                            <p className="text-sm font-bold leading-relaxed mb-8 opacity-80">Request a specialized resource mapping for your upcoming mega-project site.</p>
                            <button className="w-full py-4 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                                Contact Expansion Team
                            </button>
                        </div>
                    </div>

                    {/* Directory Content */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeLocation}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-8"
                            >
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bento-card p-8">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                                                <Briefcase size={20} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Owners</span>
                                        </div>
                                        <div className="text-5xl font-black font-[Space Grotesk]">{DATA[activeLocation].owners.length} Organizations</div>
                                    </div>
                                    <div className="bento-card p-8">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center">
                                                <HardHat size={20} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Active Operators</span>
                                        </div>
                                        <div className="text-5xl font-black font-[Space Grotesk]">{DATA[activeLocation].operators} Units</div>
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="bento-card p-10">
                                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                                        <h4 className="text-2xl font-black font-[Space Grotesk]">Premium Partners in {activeLocation}</h4>
                                        <Users size={24} className="text-amber-500" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-6 flex items-center gap-2">
                                                <Star size={14} fill="currentColor" /> Top Registered Owners
                                            </h5>
                                            <div className="space-y-4">
                                                {DATA[activeLocation].owners.map((owner, i) => (
                                                    <div key={i} className="p-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between">
                                                        <span className="font-black text-sm">{owner.name}</span>
                                                        <div className="px-3 py-1 bg-white dark:bg-black rounded-lg text-[10px] font-black text-zinc-500">Fleet: {owner.fleet}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-6 flex items-center gap-2">
                                                <CheckCircle2 size={14} /> Major Clients / Projects
                                            </h5>
                                            <div className="flex flex-wrap gap-2">
                                                {DATA[activeLocation].clients.map((client, i) => (
                                                    <span key={i} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-widest">
                                                        {client}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Plans Section */}
                                <div className="bento-card p-10 bg-zinc-900 text-white">
                                    <div className="flex items-center justify-between mb-12">
                                        <div>
                                            <h4 className="text-3xl font-black font-[Space Grotesk] mb-2 tracking-tight">Regional Business Plans</h4>
                                            <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest">Scalable solutions for {activeLocation} Operations</p>
                                        </div>
                                        <div className="px-5 py-2 bg-amber-500 text-black rounded-lg text-[10px] font-black uppercase tracking-widest">Best Value</div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {plans.filter(p => DATA[activeLocation].plans.includes(p.title) || DATA[activeLocation].plans.includes("Enterprise Plus")).map((plan, i) => (
                                            <div key={i} className="p-8 rounded-xl border border-zinc-800 bg-black/40 hover:border-amber-500/50 transition-all group">
                                                <div className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4">{plan.title}</div>
                                                <div className="text-3xl font-black mb-8">{plan.price} <span className="text-sm text-zinc-500">/mo</span></div>
                                                <ul className="space-y-3 mb-10">
                                                    {plan.features.map((f, j) => (
                                                        <li key={j} className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button className="w-full py-4 text-white border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-amber-500 group-hover:text-black transition-all">
                                                    Activate Plan
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}
