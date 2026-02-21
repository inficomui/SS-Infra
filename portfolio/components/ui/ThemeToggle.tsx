"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleTheme } from "@/store/slices/themeSlice";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
    const dispatch = useAppDispatch();
    const mode = useAppSelector((state: any) => state.theme.mode);
    const isDark = mode === "dark";

    return (
        <button
            onClick={() => dispatch(toggleTheme())}
            className="group relative w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all duration-300 hover:border-amber-500/50 active:scale-90 overflow-hidden shadow-sm"
            aria-label="Toggle Theme"
        >
            {/* Background Ambient Glow */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl ${isDark ? 'bg-indigo-500/10' : 'bg-amber-500/10'
                }`} />

            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={mode}
                    initial={{ y: 20, opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ y: -20, opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                    }}
                    className="relative z-10"
                >
                    {isDark ? (
                        <div className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                            <Sun size={20} strokeWidth={2.5} fill="currentColor" />
                        </div>
                    ) : (
                        <div className="text-zinc-600 drop-shadow-[0_0_8px_rgba(0,0,0,0.1)]">
                            <Moon size={20} strokeWidth={2.5} fill="currentColor" />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Corner Decorative Accent */}
            <div className="absolute top-0 right-0 w-2 h-2 bg-gradient-to-bl from-zinc-200 dark:from-zinc-700 to-transparent" />
        </button>
    );
}