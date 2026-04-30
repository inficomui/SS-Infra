"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";
import { BadgeCheck, Truck, Users, ExternalLink, ArrowRight } from "lucide-react";

import { useGetOwnersQuery } from "@/redux/apis/discoveryApi";
import { openBookingModal } from "@/redux/slices/modalSlice";
import { useAppDispatch } from "@/redux/hooks";
import Link from "next/link";

export function OwnersList() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { data, isLoading } = useGetOwnersQuery({ page: 1 });

    const owners = (data?.data?.data ?? []).slice(0, 3);

    return (
        <section className="py-24 md:py-32" id="owners">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-10 mb-20 md:mb-24 text-center lg:text-left">
                    <div className="max-w-3xl">
                        <div className="flex items-center justify-center lg:justify-start gap-3 text-primary font-black mb-6 uppercase tracking-[0.3em] text-[10px] md:text-xs">
                            <div className="w-12 h-[2px] bg-primary" /> Professional Network
                        </div>
                        <h2 className="text-4xl sm:text-6xl md:text-8xl font-black font-[Space Grotesk] leading-[0.85] tracking-tight mb-8 uppercase">
                            Elite <span className="text-muted-foreground">Industry</span> <br />
                            <span className="text-gradient-yellow">Stakeholders.</span>
                        </h2>
                        <p className="text-base md:text-xl text-muted-foreground font-medium leading-relaxed">
                            Connect with India's most efficient infrastructure providers and project managers.
                        </p>
                    </div>
                    <Link href="/search" className="w-full sm:w-auto px-10 py-5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all flex items-center justify-center gap-3 group">
                        Search All Partners <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bento-card p-10 animate-pulse">
                                <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-xl mb-12" />
                                <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-full w-3/4 mb-4" />
                                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full w-1/2 mb-12" />
                            </div>
                        ))
                    ) : owners.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-[16px] border border-dashed border-zinc-200 dark:border-zinc-800">
                            <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">No verified owners found in selected region.</p>
                        </div>
                    ) : (
                        owners.map((owner: any, i: number) => (
                            <motion.div
                                key={owner.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bento-card p-8 md:p-10 group"
                            >
                                <div className="flex justify-between items-start mb-10 md:mb-12">
                                    <div className="relative">
                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center">
                                            {owner.avatar || owner.profile_photo ? (
                                                <img src={owner.avatar || owner.profile_photo} alt={owner.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Users size={32} className="text-primary" />
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-7 h-7 md:w-8 md:h-8 bg-primary rounded-xl flex items-center justify-center text-foreground shadow-lg">
                                            <BadgeCheck size={16} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</div>
                                        <div className="text-[11px] md:text-sm font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">Verified</div>
                                    </div>
                                </div>

                                <div className="mb-10 md:mb-12">
                                    <h3 className="text-2xl md:text-3xl font-black font-[Space Grotesk] tracking-tight mb-2 group-hover:text-primary transition-all duration-300 uppercase leading-none">{owner.name}</h3>
                                    <p className="text-[10px] md:text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">{owner.district} • {owner.taluka}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8 md:mb-10">
                                    <div className="p-4 md:p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
                                        <Truck size={20} className="text-primary" />
                                        <div className="text-lg md:text-xl font-black leading-none">{owner.machinesCount || owner.machines || "—"}</div>
                                        <div className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Fleet Items</div>
                                    </div>
                                    <div className="p-4 md:p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
                                        <Users size={20} className="text-primary" />
                                        <div className="text-lg md:text-xl font-black leading-none">{owner.operatorCount || "—"}</div>
                                        <div className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Staff</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => dispatch(openBookingModal({ id: String(owner.id), type: 'owner' }))}
                                    className="w-full py-5 bg-black dark:bg-background text-white dark:text-foreground border border-transparent dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] group-hover:bg-primary group-hover:text-black group-hover:border-transparent transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    Send Inquiry <ExternalLink size={14} />
                                </button>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
