"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setTheme } from "@/redux/slices/themeSlice";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
    const mode = useAppSelector((state) => state.theme.mode);
    const dispatch = useAppDispatch();

    const toggleTheme = () => {
        const next = mode === "light" ? "dark" : "light";
        dispatch(setTheme(next));
    };

    return (
        <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center relative overflow-hidden transition-colors hover:border-primary/50 group"
            aria-label="Toggle Theme"
        >
            <AnimatePresence mode="wait">
                {mode === "light" ? (
                    <motion.div
                        key="sun"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-primary"
                    >
                        <Sun size={18} fill="currentColor" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="moon"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-primary"
                    >
                        <Moon size={18} fill="currentColor" />
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Hover Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
        </button>
    );
}
