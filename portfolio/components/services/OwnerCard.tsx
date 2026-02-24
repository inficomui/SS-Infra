"use client";

import { motion } from "framer-motion";
import { MapPin, Users, Zap, Star } from "lucide-react";
import { useAppDispatch } from "@/redux/hooks";
import { openBookingModal } from "@/redux/slices/modalSlice";

interface OwnerCardProps {
    owner: {
        id: number | string;
        name: string;
        district: string;
        taluka: string;
        operatorCount?: number;
        machines?: number;
        rating?: number;
        avatar?: string | null;
        serviceType?: string;
    };
    index?: number;
}

function SkeletonCard() {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 animate-pulse">
            <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full w-3/4" />
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full w-1/2" />
                </div>
            </div>
            <div className="space-y-2 mb-5">
                <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-4/5" />
            </div>
            <div className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
        </div>
    );
}

export function OwnerCard({ owner, index = 0 }: OwnerCardProps) {
    const dispatch = useAppDispatch();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-950/50 hover:border-amber-200 dark:hover:border-amber-900/50 transition-all duration-300"
        >
            <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center text-amber-500 shrink-0 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform">
                    <Zap size={22} fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg text-zinc-900 dark:text-white leading-tight truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {owner.name}
                    </h3>
                    <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-xs font-bold mt-1">
                        <MapPin size={10} className="text-amber-500" />
                        {owner.district} • {owner.taluka}
                    </div>
                </div>
                {owner.rating && (
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-black shrink-0">
                        <Star size={12} fill="currentColor" /> {owner.rating}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Fleet</div>
                    <div className="flex items-center gap-1.5 text-zinc-900 dark:text-white font-black">
                        <Users size={14} className="text-amber-500" />
                        {owner.operatorCount ?? 0} Operators
                    </div>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Machines</div>
                    <div className="flex items-center gap-1.5 text-zinc-900 dark:text-white font-black">
                        {owner.machines ?? "—"}
                    </div>
                </div>
            </div>

            {owner.serviceType && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-4 line-clamp-1">
                    {owner.serviceType}
                </p>
            )}

            <button
                onClick={() => dispatch(openBookingModal({ id: String(owner.id), type: "owner", name: owner.name }))}
                className="w-full py-3.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-500 hover:text-black dark:hover:bg-amber-500 dark:hover:text-black transition-all active:scale-95 shadow-lg shadow-zinc-400/10"
            >
                Book Now
            </button>
        </motion.div>
    );
}

export function OwnerCardSkeleton() {
    return <SkeletonCard />;
}
