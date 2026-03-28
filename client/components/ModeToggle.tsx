'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export function ModeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Wait for mount to avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="h-10 w-10 rounded-xl bg-muted/50 border border-zinc-200 dark:border-white/5 animate-pulse" />
        )
    }

    const isDark = resolvedTheme === 'dark'

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={clsx(
                "relative h-11 w-11 flex items-center justify-center rounded-2xl transition-all duration-500 overflow-hidden border active:scale-90",
                isDark 
                    ? "bg-zinc-900 border-white/10 text-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.1)]" 
                    : "bg-white border-zinc-200 text-zinc-900 shadow-sm"
            )}
            aria-label="Toggle theme"
        >
            <AnimatePresence mode="wait">
                {isDark ? (
                    <motion.div
                        key="moon"
                        initial={{ y: 20, opacity: 0, rotate: 45 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: -20, opacity: 0, rotate: -45 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <Moon className="h-5 w-5 fill-yellow-500" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        initial={{ y: 20, opacity: 0, rotate: 45 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: -20, opacity: 0, rotate: -45 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <Sun className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
    )
}
