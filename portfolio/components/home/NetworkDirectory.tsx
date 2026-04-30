"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, HardHat, Briefcase, ChevronRight, CheckCircle2, Star, Zap } from "lucide-react";
import { useGetDistrictsQuery } from "@/redux/apis/locationApi";
import { useGetOwnersQuery, useGetOperatorsQuery } from "@/redux/apis/discoveryApi";
import { useGetPlansQuery } from "@/redux/apis/plansApi";

export function NetworkDirectory() {
    const { t } = useTranslation();
    const { data: districtData, isLoading: loadingDistricts } = useGetDistrictsQuery();
    const districts = districtData?.data ?? [];

    const [activeDistrict, setActiveDistrict] = useState<string>("");

    // Set initial active district once data loads
    useMemo(() => {
        if (districts.length > 0 && !activeDistrict) {
            setActiveDistrict(districts[0]);
        }
    }, [districts]);

    const { data: ownersData, isLoading: loadingOwners } = useGetOwnersQuery({ district: activeDistrict }, { skip: !activeDistrict });
    const { data: operatorsData, isLoading: loadingOperators } = useGetOperatorsQuery({ district: activeDistrict }, { skip: !activeDistrict });

    const owners = ownersData?.data?.data ?? [];
    const operators = operatorsData?.data?.data ?? [];

    return (
        <section className="py-24 md:py-32 bg-background border-y border-border" id="directory">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col items-center text-center mb-16 md:mb-24">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-primary/5 border border-primary/20 text-primary rounded-[14px] text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-6 md:mb-8">
                        <Zap size={14} className="animate-pulse" /> Network Ecosystem
                    </div>
                    <h2 className="text-4xl sm:text-6xl md:text-[5.5rem] font-black font-heading tracking-tight mb-6 md:mb-8 leading-[0.9]">
                        Location-Wise <br />
                        <span className="text-gradient">Resource Mapping.</span>
                    </h2>
                    <p className="max-w-2xl text-base md:text-xl text-foreground dark:text-muted-foreground font-medium opacity-80">
                        Explore our vast network of owners, operators, and active project footprints across Maharashtra's industrial hubs.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Location Sidebar */}
                    <div className="lg:col-span-4 space-y-4">
                        {loadingDistricts ? (
                            Array.from({ length: 3 }).map((_, i: number) => (
                                <div key={i} className="w-full h-24 bg-muted rounded-xl animate-pulse" />
                            ))
                        ) : districts.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs border border-dashed rounded-xl">
                                No active hubs found.
                            </div>
                        ) : (
                            districts.map((loc) => (
                                <button
                                    key={loc}
                                    onClick={() => setActiveDistrict(loc)}
                                    className={`w-full group p-6 md:p-8 rounded-2xl border transition-all duration-500 flex items-center justify-between ${activeDistrict === loc
                                        ? 'bg-primary text-primary-foreground border-transparent shadow-2xl scale-[1.03]'
                                        : 'bg-card border-border text-foreground hover:border-primary/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-colors ${activeDistrict === loc ? 'bg-white text-primary' : 'bg-muted text-slate-400'
                                            }`}>
                                            <MapPin size={24} />
                                        </div>
                                        <span className="text-xl md:text-2xl font-black capitalize tracking-tight font-[Space Grotesk]">{loc} Hub</span>
                                    </div>
                                    <ChevronRight size={20} className={`transition-transform duration-500 ${activeDistrict === loc ? 'rotate-90 text-primary' : 'group-hover:translate-x-1'}`} />
                                </button>
                            ))
                        )}

                        <div className="mt-8 md:mt-12 p-8 md:p-10 bento-card bg-gradient-to-br from-primary to-blue-700 text-white">
                            <h4 className="text-xl md:text-2xl font-black font-[Space Grotesk] mb-4">Need Custom Coverage?</h4>
                            <p className="text-xs md:text-sm font-bold leading-relaxed mb-8 opacity-80">Request a specialized resource mapping for your upcoming mega-project site.</p>
                            <button className="w-full py-4 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                                Contact Expansion Team
                            </button>
                        </div>
                    </div>

                    {/* Directory Content */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeDistrict}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-6 md:space-y-8"
                            >
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                    <div className="industrial-border p-8 md:p-10 bg-card rounded-[1.5rem] md:rounded-[2rem]">
                                        <div className="flex items-center gap-5 mb-6 md:mb-8">
                                            <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center border border-primary/10 shadow-inner">
                                                <Briefcase size={28} />
                                            </div>
                                            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-primary">Total Owners</span>
                                        </div>
                                        <div className="text-4xl md:text-6xl font-black font-heading tracking-tight">
                                            {loadingOwners ? "..." : owners.length}
                                            <span className="text-sm md:text-lg text-muted-foreground ml-3 uppercase tracking-tighter font-medium">Organizations</span>
                                        </div>
                                    </div>
                                    <div className="industrial-border p-8 md:p-10 bg-card rounded-[1.5rem] md:rounded-[2rem]">
                                        <div className="flex items-center gap-5 mb-6 md:mb-8">
                                            <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500/5 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/10 shadow-inner">
                                                <HardHat size={28} />
                                            </div>
                                            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600">Active Operators</span>
                                        </div>
                                        <div className="text-4xl md:text-6xl font-black font-heading tracking-tight">
                                            {loadingOperators ? "..." : operators.length}
                                            <span className="text-sm md:text-lg text-muted-foreground ml-3 uppercase tracking-tighter font-medium">Units</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="bento-card p-8 md:p-10">
                                    <div className="flex items-center justify-between mb-8 md:mb-10 pb-6 border-b border-border">
                                        <h4 className="text-xl md:text-2xl font-black font-[Space Grotesk]">Premium Partners in {activeDistrict}</h4>
                                        <Users size={24} className="text-primary" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h5 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                                                <Star size={14} fill="currentColor" /> Top Registered Owners
                                            </h5>
                                            <div className="space-y-4">
                                                {loadingOwners ? [1, 2].map((i: number) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />) :
                                                    owners.slice(0, 5).map((owner: any, i: number) => (
                                                        <div key={i} className="p-4 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-between">
                                                            <span className="font-black text-xs md:text-sm">{owner.name}</span>
                                                            <div className="px-3 py-1 bg-background rounded-lg text-[9px] md:text-[10px] font-black text-muted-foreground">Fleet: {owner.machinesCount || owner.machines || "—"}</div>
                                                        </div>
                                                    ))}
                                                {!loadingOwners && owners.length === 0 && <p className="text-xs text-muted-foreground font-bold">No registered owners here yet.</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <h5 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                                                <CheckCircle2 size={14} /> Regional Coverage
                                            </h5>
                                            <div className="flex flex-wrap gap-2">
                                                {activeDistrict ? (
                                                    <span className="px-4 py-2 bg-primary text-white rounded-xl text-[9px] font-bold uppercase tracking-widest">
                                                        {activeDistrict} Sector
                                                    </span>
                                                ) : "Loading..."}
                                            </div>
                                        </div>
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
