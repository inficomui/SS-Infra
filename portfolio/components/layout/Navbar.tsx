"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Zap, Menu, X, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function Navbar() {
    const { t } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Owners', href: '#owners' },
        { name: 'Discovery', href: '#discovery' },
        { name: 'Enquiry', href: '#enquiry' }
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-[1000] px-4 py-4 md:py-6 pointer-events-none">
            <div className="container mx-auto max-w-7xl">
                <motion.nav
                    initial={false}
                    animate={{
                        paddingTop: isScrolled ? "10px" : "16px",
                        paddingBottom: isScrolled ? "10px" : "16px",
                        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0)",
                    }}
                    className={`
                        flex items-center justify-between p-2 pl-6 rounded-[1.5rem] 
                        transition-all duration-500 pointer-events-auto
                        ${isScrolled
                            ? 'backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20 dark:border-zinc-800/50 dark:!bg-zinc-950/80'
                            : 'bg-transparent'}
                    `}
                >
                    {/* Logo Area */}
                    <div className="flex items-center gap-4">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className="w-10 h-10 bg-zinc-950 dark:bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/20"
                        >
                            <Zap size={20} fill="currentColor" />
                        </motion.div>
                        <span className="text-xl font-black tracking-tighter uppercase font-[Space Grotesk] dark:text-white">
                            SS<span className="text-amber-500">.</span>INFRA
                        </span>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center gap-2">
                        {navLinks.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className="relative px-5 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-all group"
                            >
                                {item.name}
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-amber-500 transition-all group-hover:w-1/2" />
                            </a>
                        ))}
                    </div>

                    {/* Action Area */}
                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-3 mr-3 pl-4 border-l border-zinc-200 dark:border-zinc-800">
                            <LanguageToggle />
                            <ThemeToggle />
                        </div>

                        <button className="hidden sm:flex group bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-[10px] uppercase tracking-[0.2em] px-8 py-4 rounded-xl transition-all shadow-xl shadow-zinc-500/10 active:scale-95 items-center gap-2">
                            {t("common.get_started")}
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white transition-colors"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </motion.nav>
            </div>

            {/* Premium Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[-1] lg:hidden"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="lg:hidden absolute top-28 left-4 right-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-8 shadow-2xl pointer-events-auto"
                        >
                            <div className="flex flex-col gap-8">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Menu</p>
                                    <div className="grid grid-cols-1 gap-4">
                                        {navLinks.map((item) => (
                                            <a
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="text-3xl font-black uppercase tracking-tighter hover:text-amber-500 transition-colors dark:text-white"
                                            >
                                                {item.name}
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900 flex flex-col gap-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-3">
                                            <LanguageToggle />
                                            <ThemeToggle />
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-500">
                                            <ShieldCheck size={14} /> Secure
                                        </div>
                                    </div>
                                    <button className="w-full bg-amber-500 text-black font-black py-5 rounded-2xl uppercase tracking-widest text-xs">
                                        {t("common.get_started")}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}