"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, Loader2, ArrowRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGetNearMeQuery } from "@/redux/apis/discoveryApi";
import { Zap } from "lucide-react";

interface SearchPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchPopup({ isOpen, onClose }: SearchPopupProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    // Simulate search delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Use existing nearMe query as a mock for Taluka search right now - ideally create a specific search endpoint later
    const { data: searchResults, isFetching } = useGetNearMeQuery(
        { lat: 0, lng: 0, radius: 50 },
        { skip: debouncedQuery.length < 2 }
    );

    // Mock local data if API isn't fully returning yet
    const mockResults = [
        { id: 1, type: "owner", name: "Sharma Infra Works", taluka: "Pune", operators: 12 },
        { id: 2, type: "operator", name: "Vijay Singh", taluka: "Pune", skill: "Excavator" },
        { id: 3, type: "owner", name: "Deshmukh Excavations", taluka: "Satara", operators: 8 },
        { id: 4, type: "operator", name: "Rahul Patil", taluka: "Satara", skill: "JCB Operator" }
    ].filter(r =>
        r.taluka.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        r.name.toLowerCase().includes(debouncedQuery.toLowerCase())
    );

    const displayResults = searchResults?.data || mockResults;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onClose();
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-24 px-4 sm:pt-32 pb-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-[640px] bg-[var(--card)] rounded-[2rem] shadow-2xl overflow-hidden border border-[var(--border)]"
                    >
                        <form onSubmit={handleSearch} className="flex items-center px-6 py-4 border-b border-[var(--border)]">
                            <Search className="w-6 h-6 text-[var(--fg-muted)] shrink-0" />
                            <input
                                type="text"
                                autoFocus
                                placeholder="Search by Taluka, Owner, or Operator..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent px-4 py-2 text-xl font-bold outline-none placeholder:text-[var(--fg-muted)] placeholder:font-medium"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="p-2 text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] rounded-full transition-colors mr-2 text-xs font-bold shrink-0"
                                >
                                    CLEAR
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] rounded-full transition-colors shrink-0"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </form>

                        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {searchQuery.length < 2 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-[var(--bg-muted)] rounded-2xl flex items-center justify-center text-[var(--fg-muted)] mb-4">
                                        <MapPin size={24} />
                                    </div>
                                    <h4 className="font-bold text-lg mb-2">Find Taluka Networks</h4>
                                    <p className="text-[var(--fg-muted)] text-sm max-w-[280px]">
                                        Type at least 2 characters to discover infrastructure fleets in any Taluka.
                                    </p>

                                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full px-4">
                                        {['Pune', 'Mumbai', 'Satara', 'Nagpur'].map(city => (
                                            <button
                                                key={city}
                                                type="button"
                                                onClick={() => setSearchQuery(city)}
                                                className="py-2 px-3 border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--fg-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg)] transition-colors"
                                            >
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : isFetching ? (
                                <div className="py-12 flex flex-col items-center justify-center text-[var(--fg-muted)]">
                                    <Loader2 size={32} className="animate-spin mb-4 text-amber-500" />
                                    <p className="font-bold">Scanning Local Network...</p>
                                </div>
                            ) : displayResults.length > 0 ? (
                                <div className="space-y-2">
                                    <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)]">
                                        Top Results ({displayResults.length})
                                    </div>
                                    {displayResults.map((result: any, i: number) => (
                                        <Link
                                            key={`${result.type}-${result.id}-${i}`}
                                            href={result.type === 'owner' ? `/owner/${result.id}` : `/operator/${result.id}`}
                                            onClick={onClose}
                                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[var(--bg)] hover:bg-[var(--bg-muted)] border border-[var(--border)] rounded-2xl transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${result.type === 'owner' ? 'bg-zinc-800' : 'bg-amber-500'
                                                    }`}>
                                                    {result.type === 'owner' ? <MapPin size={24} /> : <Zap size={24} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-lg group-hover:text-amber-500 transition-colors">
                                                        {result.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider">
                                                        <span className="text-amber-500">{result.type}</span> • {result.taluka}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                                <div className="text-right">
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)]">
                                                        {result.type === 'owner' ? 'Fleet Size' : 'Primary'}
                                                    </div>
                                                    <div className="font-bold">
                                                        {result.type === 'owner' ? `${result.operators} Operators` : result.skill}
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-[var(--bg-muted)] border border-[var(--border)] group-hover:border-amber-500 group-hover:bg-amber-500 group-hover:text-black flex items-center justify-center transition-all shrink-0">
                                                    <ArrowRight size={14} />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={handleSearch}
                                        className="w-full mt-4 py-4 rounded-xl border border-dashed border-[var(--border)] hover:bg-[var(--bg-muted)] transition-colors text-sm font-bold flex items-center justify-center gap-2 text-[var(--fg-muted)] hover:text-amber-500"
                                    >
                                        View All Results for "{searchQuery}" <ArrowRight size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-[var(--bg-muted)] rounded-2xl flex items-center justify-center text-[var(--fg-muted)] mb-4">
                                        <X size={24} />
                                    </div>
                                    <h4 className="font-bold text-lg mb-2">No Results Found</h4>
                                    <p className="text-[var(--fg-muted)] text-sm max-w-[280px]">
                                        We couldn't find any owners or operators matching "{searchQuery}".
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
