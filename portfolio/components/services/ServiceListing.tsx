"use client";

import { useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, AlertCircle } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { useGetOwnersQuery, useRecordSearchLeadMutation } from "@/redux/apis/discoveryApi";
import { OwnerCard, OwnerCardSkeleton } from "./OwnerCard";
import { ServiceFilter } from "./ServiceFilter";
import { BookingModal } from "./BookingModal";

export function ServiceListing() {
    const { selectedDistrict, selectedTaluka, searchQuery } = useAppSelector((s) => s.filter);
    const { isBookingModalOpen } = useAppSelector((s) => s.modal);
    const [recordLead] = useRecordSearchLeadMutation();
    const lastLeadRef = useRef<string>("");

    // Trigger lead notification when a specific area is searched
    useEffect(() => {
        if (!selectedDistrict) return;

        const leadKey = `${selectedDistrict}-${selectedTaluka || "all"}`;

        // Don't send the same lead twice in a row to avoid spam
        if (lastLeadRef.current === leadKey) return;

        const timer = setTimeout(() => {
            recordLead({
                district: selectedDistrict,
                taluka: selectedTaluka || undefined,
                searchQuery: searchQuery || undefined
            });
            lastLeadRef.current = leadKey;
        }, 3000); // 3 second delay to ensure they stop clicking

        return () => clearTimeout(timer);
    }, [selectedDistrict, selectedTaluka, recordLead]);

    const { data, isLoading, isError, isFetching } = useGetOwnersQuery(
        {
            district: selectedDistrict || undefined,
            taluka: selectedTaluka || undefined,
            search: searchQuery || undefined,
        },
        { refetchOnMountOrArgChange: true }
    );

    const owners: any[] = useMemo(() => data?.data?.data ?? [], [data]);

    return (
        <section className="py-20 px-4">
            <div className="container mx-auto max-w-7xl">

                {/* Section Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-3">
                        <Users size={14} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Find Services</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight mb-4">
                        Browse <span className="text-amber-500">Owners</span> & Fleets
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-xl">
                        Search by district and taluka to find verified infrastructure owners and their operators near you.
                    </p>
                </div>

                {/* Filter Bar */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 mb-10 shadow-sm">
                    <ServiceFilter />
                </div>

                {/* Listing Grid */}
                <AnimatePresence mode="wait">
                    {isLoading || isFetching ? (
                        <motion.div
                            key="skeleton"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                        >
                            {Array.from({ length: 8 }).map((_, i) => (
                                <OwnerCardSkeleton key={i} />
                            ))}
                        </motion.div>
                    ) : isError ? (
                        <motion.div
                            key="error"
                            className="flex flex-col items-center justify-center py-24 text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500 mb-4">
                                <AlertCircle size={28} />
                            </div>
                            <h3 className="font-black text-xl text-zinc-900 dark:text-white mb-2">Failed to load services</h3>
                            <p className="text-zinc-500 text-sm max-w-[280px]">
                                Unable to connect to the server. Please check your connection and try again.
                            </p>
                        </motion.div>
                    ) : owners.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-24 text-center"
                        >
                            <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-6">
                                <Users size={32} />
                            </div>
                            <h3 className="font-black text-2xl text-zinc-900 dark:text-white mb-2">No owners found</h3>
                            <p className="text-zinc-500 text-sm max-w-[320px]">
                                {selectedDistrict
                                    ? `No registered owners in ${selectedTaluka ? `${selectedTaluka}, ` : ""}${selectedDistrict} yet.`
                                    : "No owners are registered yet. Try a different search."}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                        >
                            {owners.map((owner: any, i: number) => (
                                <OwnerCard key={owner.id} owner={owner} index={i} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Result count */}
                {!isLoading && !isError && owners.length > 0 && (
                    <p className="text-center text-xs text-zinc-400 font-bold uppercase tracking-widest mt-10">
                        Showing {owners.length} result{owners.length !== 1 ? "s" : ""}
                    </p>
                )}
            </div>

            {/* Booking Modal (portal) */}
            {isBookingModalOpen && <BookingModal />}
        </section>
    );
}
