"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Zap, Menu, X, ArrowRight, ShieldCheck, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SearchPopup } from "@/components/ui/SearchPopup";

export function Navbar() {
    const { t } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [mobileMenuOpen]);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Search', href: '/search' },
        { name: 'Client Panel', href: '/dashboard/client' }
    ];

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-[1000] px-4 py-4 md:py-6 pointer-events-none">
                <div className="container mx-auto max-w-7xl relative pointer-events-auto">
                    <nav
                        className={`
                            flex items-center justify-between p-2 pl-6 rounded-[2rem] 
                            transition-all duration-500
                            ${isScrolled
                                ? 'backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 md:py-3 py-2.5'
                                : 'bg-transparent md:py-4 py-3'}
                        `}
                    >
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 group cursor-pointer z-[1001]">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/20 transition-all group-hover:bg-amber-500 group-hover:text-black dark:group-hover:bg-amber-500"
                            >
                                <Zap size={20} fill="currentColor" />
                            </motion.div>
                            <span className="text-xl font-black tracking-tighter uppercase font-[Space Grotesk] dark:text-white transition-colors group-hover:text-amber-500">
                                SS<span className="text-amber-500 group-hover:text-black dark:group-hover:text-white transition-colors">.</span>INFRA
                            </span>
                        </Link>

                        <div className="hidden lg:flex items-center gap-2">
                            {navLinks.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="relative px-5 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-all group"
                                >
                                    {item.name}
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-amber-500 transition-all duration-300 group-hover:w-1/2 rounded-full" />
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 z-[1001]">
                            <div className="hidden md:flex items-center gap-3 mr-3 pl-4 border-l border-black/10 dark:border-white/10">
                                <button
                                    onClick={() => setSearchOpen(true)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/50 transition-all"
                                    aria-label="Search"
                                >
                                    <Search size={18} />
                                </button>
                                <LanguageToggle />
                                <ThemeToggle />
                            </div>

                            <Link href="/auth/login" className="hidden sm:flex group bg-black dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.2em] px-8 py-4 rounded-xl transition-all shadow-xl shadow-black/10 dark:shadow-white/10 hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-95 items-center gap-2">
                                {t("common.get_started")}
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <button
                                onClick={() => setSearchOpen(true)}
                                className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-black/5 dark:border-white/5 transition-colors mr-1 hover:text-amber-500"
                                aria-label="Search"
                            >
                                <Search size={20} />
                            </button>

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-black/5 dark:border-white/5 transition-all hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                aria-label="Toggle menu"
                            >
                                <motion.div animate={{ rotate: mobileMenuOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                                </motion.div>
                            </button>
                        </div>
                    </nav>
                </div>
            </header>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className="fixed inset-0 z-[990] lg:hidden flex flex-col pointer-events-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div
                            className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-2xl"
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        <motion.div
                            initial={{ y: "-10%" }}
                            animate={{ y: "0%" }}
                            exit={{ y: "-10%" }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="relative flex flex-col h-full pt-[6.5rem] px-6 pb-8"
                        >
                            <div className="flex-1 flex flex-col justify-center gap-2 max-w-md mx-auto w-full">
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-500 mb-6 pl-4"
                                >
                                    Menu
                                </motion.p>

                                {navLinks.map((item, index) => (
                                    <motion.div
                                        key={item.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + index * 0.05 }}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="group flex items-center justify-between py-5 px-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <span className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-black dark:text-white transition-all group-hover:text-amber-500 group-hover:translate-x-2">
                                                {item.name}
                                            </span>
                                            <ArrowRight size={28} className="text-zinc-300 dark:text-zinc-700 group-hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-8 group-hover:translate-x-0" />
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="w-full max-w-md mx-auto flex flex-col gap-6 mt-8 p-6 bg-black/5 dark:bg-white/5 rounded-3xl backdrop-blur-sm border border-black/5 dark:border-white/10"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <LanguageToggle />
                                        <ThemeToggle />
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl">
                                        <ShieldCheck size={16} /> Secure
                                    </div>
                                </div>
                                <Link
                                    href="/auth/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full flex justify-center items-center gap-3 bg-amber-500 hover:bg-amber-400 text-black font-black py-5 rounded-xl uppercase tracking-[0.2em] text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
                                >
                                    {t("common.get_started")}
                                    <ArrowRight size={18} />
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <SearchPopup isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}