"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setLanguage, Language } from "@/store/slices/languageSlice";
import { Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LanguageToggle() {
    const dispatch = useAppDispatch();
    const current = useAppSelector((state: any) => state?.language.current);

    const langs: { id: Language; label: string; full: string }[] = [
        { id: "en", label: "EN", full: "English" },
        { id: "hi", label: "हिं", full: "Hindi" },
        { id: "mr", label: "मरा", full: "Marathi" },
    ];

    return (
        <div className="flex items-center gap-3">
            {/* Minimalist Globe Icon - Signals purpose without text */}
            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <Globe size={14} className="text-zinc-500 animate-pulse" />
            </div>

            <div className="relative flex items-center p-1 bg-zinc-100 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
                {langs.map((l) => {
                    const isActive = current === l.id;

                    return (
                        <button
                            key={l.id}
                            onClick={() => dispatch(setLanguage(l.id))}
                            className="group relative flex items-center justify-center px-4 py-2 text-[10px] font-black tracking-widest transition-all outline-none"
                        >
                            {/* Label */}
                            <span className={`relative z-20 transition-colors duration-300 ${isActive
                                ? 'text-zinc-950 dark:text-zinc-950'
                                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                }`}>
                                {l.label}
                            </span>

                            {/* Tooltip on Hover */}
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[8px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-tighter">
                                {l.full}
                            </div>

                            {/* Active Background Slider */}
                            {isActive && (
                                <motion.div
                                    layoutId="official-nav-bg"
                                    className="absolute inset-0 bg-amber-500 rounded-[10px] shadow-[0_4px_12px_rgba(245,158,11,0.3)] z-10"
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30
                                    }}
                                />
                            )}

                            {/* Tap/Click Effect */}
                            <motion.div
                                whileTap={{ scale: 0.95 }}
                                className="absolute inset-0 z-0"
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}