"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Zap, Mail, Phone, MapPin, Twitter, Github, Linkedin, ArrowUpRight, Globe, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
    const { t } = useTranslation();

    const socialLinks = [
        { Icon: Twitter, href: "#" },
        { Icon: Github, href: "#" },
        { Icon: Linkedin, href: "#" }
    ];

    const platformLinks = ['Features', 'Owners', 'Discovery', 'Pricing'];
    const companyLinks = ['About Us', 'Case Studies', 'News', 'Contact'];

    return (
        <footer className="pt-32 pb-12 bg-white dark:bg-[#08080a] relative overflow-hidden transition-colors duration-500">
            {/* Architectural Border */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />

            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none bg-[grid-10px] [mask-image:radial-gradient(ellipse_at_top,black,transparent)]" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-24">

                    {/* Brand Column */}
                    <div className="lg:col-span-5">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-zinc-950 dark:bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/10">
                                <Zap size={24} fill="currentColor" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter uppercase font-[Space Grotesk] dark:text-white">
                                SS-INFRA
                            </span>
                        </div>

                        <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-10 max-w-sm">
                            Redefining infrastructure management with precision, scale, and high-performance workforce integration.
                        </p>

                        <div className="flex gap-3">
                            {socialLinks.map(({ Icon, href }, i) => (
                                <motion.a
                                    key={i}
                                    href={href}
                                    whileHover={{ y: -4 }}
                                    className="w-11 h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-amber-500 hover:border-amber-500/50 transition-all bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm"
                                >
                                    <Icon size={18} />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-8">Platform</h4>
                            <ul className="space-y-4">
                                {platformLinks.map(l => (
                                    <li key={l}>
                                        <a href={`#${l.toLowerCase()}`} className="group flex items-center gap-2 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-500 transition-colors">
                                            {l}
                                            <ArrowUpRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500 mb-8">Company</h4>
                            <ul className="space-y-4">
                                {companyLinks.map(l => (
                                    <li key={l}>
                                        <a href="#" className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-500 transition-colors">
                                            {l}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Status Card */}
                        <div className="col-span-2 md:col-span-1">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500 mb-8">Global Ops</h4>
                            <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 backdrop-blur-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Globe size={40} />
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Live Status</span>
                                </div>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                                    Infrastructure systems operational in 12 industrial zones across MH.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            © 2026 SS-INFRA. Industrial Precision.
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/5 border border-green-500/20 text-[9px] font-black text-green-600 dark:text-green-500 uppercase tracking-tighter">
                            <ShieldCheck size={10} /> Certified Infrastructure
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {['Privacy', 'Terms', 'Cookies'].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors underline-offset-4 hover:underline"
                            >
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}