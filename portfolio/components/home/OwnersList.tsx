"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";
import { UserCheck, ShieldCheck, BadgeCheck, Truck, Users, Globe, ExternalLink } from "lucide-react";

export function OwnersList() {
    const { t } = useTranslation();
    const owners = [
        { name: "Rajesh Sharma", company: "Sharma Infra Works", machines: 12, operators: 28, verified: true, img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop" },
        { name: "Suresh Patil", company: "Patil Construction Co.", machines: 8, operators: 15, verified: true, img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop" },
        { name: "Mahesh Desai", company: "Desai Infra Solutions", machines: 20, operators: 45, verified: true, img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop" },
    ];

    return (
        <section className="py-32" id="owners">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-24">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 text-amber-500 font-black mb-6 uppercase tracking-[0.3em] text-xs">
                            <div className="w-12 h-[2px] bg-amber-500" /> Professional Network
                        </div>
                        <h2 className="text-6xl md:text-8xl font-black font-[Space Grotesk] leading-[0.85] tracking-tight mb-8">
                            Elite <span className="text-zinc-400">Industry</span> <br />
                            <span className="gradient-text">Stakeholders.</span>
                        </h2>
                        <p className="text-xl text-zinc-500 font-medium leading-relaxed">
                            Connect with India's most efficient infrastructure providers and project managers.
                        </p>
                    </div>
                    <button className="px-10 py-5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-black uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all flex items-center gap-3 group">
                        View All Partners <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {owners.map((owner, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bento-card p-10 group"
                        >
                            <div className="flex justify-between items-start mb-12">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                                        <img src={owner.img} alt={owner.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center text-black shadow-lg">
                                        <BadgeCheck size={16} />
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Company Rank</div>
                                    <div className="text-2xl font-black text-amber-500 font-[Space Grotesk]">#0{i + 1}</div>
                                </div>
                            </div>

                            <div className="mb-12">
                                <h3 className="text-3xl font-black font-[Space Grotesk] tracking-tight mb-2 group-hover:gradient-text transition-all duration-300">{owner.name}</h3>
                                <p className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em]">{owner.company}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
                                    <Truck size={20} className="text-amber-500" />
                                    <div className="text-xl font-black leading-none">{owner.machines}</div>
                                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Fleet Items</div>
                                </div>
                                <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
                                    <Users size={20} className="text-amber-500" />
                                    <div className="text-xl font-black leading-none">{owner.operators}</div>
                                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Staff</div>
                                </div>
                            </div>

                            <button className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-[0.3em] group-hover:bg-amber-500 group-hover:text-black transition-all active:scale-95 flex items-center justify-center gap-3">
                                Send Inquiry <ExternalLink size={14} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ArrowRight({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M5 12h14m-7-7 7 7-7 7" />
        </svg>
    );
}
