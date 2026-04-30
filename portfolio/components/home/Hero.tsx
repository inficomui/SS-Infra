"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { ArrowRight, Play, Server, Shield, Cpu, Activity } from "lucide-react";
import { useRef } from "react";
import { FleetHUD } from "@/components/home/FleetHUD";

export function Hero() {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const rotate = useTransform(scrollYProgress, [0, 1], [0, 10]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [0.3, 0.1]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1] 
            } 
        }
    };

    return (
        <section
            ref={containerRef}
            className="relative pt-24 md:pt-40 pb-24 md:pb-40 overflow-hidden flex flex-col items-center bg-background min-h-screen"
        >
            {/* Cinematic Background Layer */}
            <motion.div
                style={{ opacity }}
                className="absolute inset-0 z-0 pointer-events-none"
            >
                <img
                    src="/hero_command_center_bg_1776414635348.png"
                    alt="Command Center"
                    className="w-full h-full object-cover grayscale brightness-50 contrast-125 transition-all"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
            </motion.div>

            {/* Industrial Grid Background Overlay */}
            <div className="absolute inset-0 z-1 industrial-grid opacity-[0.2] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center"
                >
                    {/* Left Content Column */}
                    <div className="lg:col-span-12 xl:col-span-6 flex flex-col items-center xl:items-start text-center xl:text-left">
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-xl">
                            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                                {t("hero.badge")}
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-5xl sm:text-7xl md:text-[6.5rem] font-black tracking-tighter leading-[0.85] mb-8 uppercase font-heading text-foreground transition-colors"
                        >
                            {t("hero.title")} <br />
                            <span className="text-gradient-yellow font-heading italic">
                                {t("hero.subtitle")}
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="max-w-xl text-base md:text-xl text-muted-foreground font-medium leading-relaxed mb-12 opacity-80"
                        >
                            {t("hero.desc")}
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
                            <button className="w-full sm:w-auto px-12 py-6 bg-primary text-black rounded-2xl flex items-center justify-center gap-4 transition-all hover:scale-[1.05] active:scale-[0.98] font-black text-xs uppercase tracking-widest yellow-glow">
                                {t("common.view_packages")}
                                <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
                            </button>

                            <button className="w-full sm:w-auto px-12 py-6 rounded-2xl border-2 border-border backdrop-blur-xl hover:bg-muted/50 transition-all flex items-center justify-center gap-4 font-black text-xs uppercase tracking-widest text-foreground">
                                <Play size={18} fill="currentColor" />
                                {t("common.see_features")}
                            </button>
                        </motion.div>
                    </div>

                    {/* Right Visual Column (Interactive HUD) */}
                    <div className="lg:col-span-12 xl:col-span-6 relative">
                        <motion.div
                            initial={{ opacity: 0, x: 50, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-10"
                        >
                            <FleetHUD />

                            {/* Supplementary Floating Elements */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-10 -right-10 p-6 glass-card rounded-2xl border-primary/20 hidden xl:flex items-center gap-4 bg-card/40 backdrop-blur-xl"
                            >
                                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                                    <Shield size={20} />
                                </div>
                                <div className="hidden sm:block">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-primary">Security Node</div>
                                    <div className="text-sm font-black text-foreground italic leading-none">AES-256 ACTIVE</div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Background Pulsing Decorations */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse-slow" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] border border-primary/5 rounded-full -z-10" />
                    </div>
                </motion.div>
            </div>

            {/* Trusted By Ticker Section */}
            <div className="w-full mt-24 md:mt-40 pt-16 border-t border-border backdrop-blur-sm bg-muted/20 transition-colors">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground shrink-0 text-center md:text-left">
                            STRATEGIC PARTNERS & <br /> ENTERPRISE CLIENTS
                        </div>
                        <div className="flex-1 flex flex-wrap items-center justify-center md:justify-end gap-12 md:gap-20 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700 dark:invert-0 light:invert">
                            {/* Fleet Partner Logos (Simplified Icons + Text) */}
                            <div className="flex items-center gap-3">
                                <Shield size={24} className="text-foreground" />
                                <span className="text-sm font-black text-foreground uppercase tracking-tighter">INFRASEC</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Server size={24} className="text-foreground" />
                                <span className="text-sm font-black text-foreground uppercase tracking-tighter">GRIDCORE</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Activity size={24} className="text-foreground" />
                                <span className="text-sm font-black text-foreground uppercase tracking-tighter">COREBUILD</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Cpu size={24} className="text-foreground" />
                                <span className="text-sm font-black text-foreground uppercase tracking-tighter">MAX-MECH</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
