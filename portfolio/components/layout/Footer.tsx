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
        <footer className="pt-24 md:pt-32 pb-12 bg-background dark:bg-[#08080a] relative overflow-hidden transition-colors duration-500">
            {/* Architectural Border */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />

            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none bg-[grid-10px] [mask-image:radial-gradient(ellipse_at_top,black,transparent)]" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-16 md:mb-24">

                    {/* Brand Column */}
                    <div className="lg:col-span-5 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-black shadow-xl shadow-primary/20">
                                <Zap size={24} fill="currentColor" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter uppercase font-heading text-foreground">
                                SS INFRA <span className="text-primary font-heading">SOFTWARE</span>
                            </span>
                        </div>

                        <p className="text-base md:text-lg text-muted-foreground dark:text-muted-foreground font-medium leading-relaxed mb-10 max-w-md mx-auto lg:mx-0">
                            Redefining infrastructure management with precision, scale, and high-performance workforce integration.
                        </p>

                        <div className="space-y-6 mb-10 flex flex-col items-center lg:items-start group">
                            <div className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors">
                                <MapPin size={20} className="text-primary" />
                                <span className="text-sm font-bold uppercase tracking-tight">{t("footer.address_val")}</span>
                            </div>
                            <div className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors">
                                <Phone size={20} className="text-primary" />
                                <span className="text-sm font-bold uppercase tracking-tight">{t("footer.phone")}</span>
                            </div>
                            <div className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors">
                                <Mail size={20} className="text-primary" />
                                <span className="text-sm font-bold lowercase tracking-tight">{t("footer.email")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 text-center sm:text-left">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-8">Platform</h4>
                            <ul className="space-y-4">
                                {platformLinks.map(l => (
                                    <li key={l}>
                                        <a href={`#${l.toLowerCase()}`} className="group flex items-center justify-center sm:justify-start gap-2 text-sm font-bold text-zinc-600 dark:text-muted-foreground hover:text-primary dark:hover:text-primary transition-colors">
                                            {l}
                                            <ArrowUpRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground dark:text-muted-foreground mb-8">Company</h4>
                            <ul className="space-y-4">
                                {companyLinks.map(l => (
                                    <li key={l}>
                                        <a href="#" className="text-sm font-bold text-zinc-600 dark:text-muted-foreground hover:text-primary dark:hover:text-primary transition-colors">
                                            {l}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Status Card */}
                        <div className="col-span-1 sm:col-span-2 md:col-span-1">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground dark:text-muted-foreground mb-8">Global Ops</h4>
                            <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 backdrop-blur-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Globe size={40} />
                                </div>
                                <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Live Status</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground dark:text-muted-foreground leading-relaxed font-semibold uppercase">
                                    Infrastructure systems operational in 12 industrial zones across MH.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center md:text-left leading-relaxed">
                            © 2026 SS-INFRA SOFTWARE. ALL RIGHTS RESERVED. Industrial Precision.
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/5 border border-green-500/20 text-[9px] font-black text-green-600 dark:text-green-500 uppercase tracking-tighter">
                            <ShieldCheck size={10} /> Certified Infrastructure
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-8">
                        {['Privacy', 'Terms', 'Cookies'].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors underline-offset-4 hover:underline"
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
