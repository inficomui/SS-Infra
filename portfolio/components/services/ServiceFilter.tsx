"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, ChevronDown, Search, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setDistrict, setTaluka, setSearchQuery, resetFilters } from "@/redux/slices/filterSlice";
import { useGetDistrictsQuery, useGetTalukasQuery } from "@/redux/apis/locationApi";

// Skeleton loader for dropdowns
function DropdownSkeleton() {
    return (
        <div className="w-full h-14 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
    );
}

export function ServiceFilter() {
    const dispatch = useAppDispatch();
    const { selectedDistrict, selectedTaluka, searchQuery } = useAppSelector((s) => s.filter);

    // Fetch districts (always on mount)
    const { data: districtData, isLoading: loadingDistricts } = useGetDistrictsQuery();

    // Fetch talukas only when a district is selected (cascading logic)
    const { data: talukaData, isLoading: loadingTalukas } = useGetTalukasQuery(
        selectedDistrict,
        { skip: !selectedDistrict }
    );

    const districts: string[] = districtData?.data ?? [];
    const talukas: string[] = talukaData?.data ?? [];

    const hasActiveFilters = selectedDistrict || selectedTaluka || searchQuery;

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">

                {/* District Dropdown */}
                <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 px-1">
                        District
                    </label>
                    {loadingDistricts ? (
                        <DropdownSkeleton />
                    ) : (
                        <div className="relative">
                            <select
                                value={selectedDistrict}
                                onChange={(e) => dispatch(setDistrict(e.target.value))}
                                className="w-full appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 font-bold text-zinc-900 dark:text-white outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all cursor-pointer"
                            >
                                <option value="">All Districts</option>
                                {districts.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                        </div>
                    )}
                </div>

                {/* Taluka Dropdown — cascades from District */}
                <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 px-1">
                        Taluka
                    </label>
                    {loadingTalukas ? (
                        <DropdownSkeleton />
                    ) : (
                        <div className="relative">
                            <select
                                value={selectedTaluka}
                                onChange={(e) => dispatch(setTaluka(e.target.value))}
                                disabled={!selectedDistrict}
                                className="w-full appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 font-bold text-zinc-900 dark:text-white outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <option value="">All Talukas</option>
                                {talukas.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                        </div>
                    )}
                </div>

                {/* Search Input */}
                <div className="flex-[2] min-w-0">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 px-1">
                        Search
                    </label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Filter by name or service type..."
                            value={searchQuery}
                            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-11 pr-5 py-4 font-bold text-zinc-900 dark:text-white outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:font-normal placeholder:text-zinc-400"
                        />
                    </div>
                </div>

                {/* Reset Filters */}
                {hasActiveFilters && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => dispatch(resetFilters())}
                        className="flex items-center gap-2 px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 transition-all font-bold text-xs uppercase tracking-widest whitespace-nowrap self-end"
                    >
                        <X size={14} /> Clear
                    </motion.button>
                )}
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex flex-wrap gap-2 mt-4"
                >
                    {selectedDistrict && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold">
                            <MapPin size={10} /> {selectedDistrict}
                            <button onClick={() => dispatch(setDistrict(""))} className="ml-1 hover:text-red-500">×</button>
                        </span>
                    )}
                    {selectedTaluka && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold">
                            {selectedTaluka}
                            <button onClick={() => dispatch(setTaluka(""))} className="ml-1 hover:text-red-500">×</button>
                        </span>
                    )}
                    {searchQuery && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full text-xs font-bold">
                            "{searchQuery}"
                            <button onClick={() => dispatch(setSearchQuery(""))} className="ml-1 hover:text-red-500">×</button>
                        </span>
                    )}
                </motion.div>
            )}
        </div>
    );
}
