"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Play, Server, Shield, Cpu, Activity, Globe, CheckCircle2 } from "lucide-react";
import { useRef } from "react";

export function Hero() {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLElement>(null);
    
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    // Smoother spring physics for parallax
    const smoothY1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, 250]), { stiffness: 100, damping: 30 });
    const smoothY2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -180]), { stiffness: 100, damping: 30 });
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 15]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <section 
            ref={containerRef} 
            className="relative pt-40 pb-24 overflow-hidden min-h-screen flex items-center bg-white dark:bg-zinc-950 transition-colors duration-500"
        >
            {/* Advanced Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <motion.div style={{ y: smoothY1 }} className="absolute top-20 left-[-10%] w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full" />
                <motion.div style={{ y: smoothY2 }} className="absolute bottom-20 right-[-10%] w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
                >
                    {/* Left Content */}
                    <div className="lg:col-span-7">
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                {t("hero.badge")}
                            </span>
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8">
                            {t("hero.title")} <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">
                                {t("hero.subtitle")}
                            </span>
                        </motion.h1>

                        <motion.p variants={itemVariants} className="max-w-xl text-lg md:text-xl text-zinc-500 dark:text-zinc-400 font-normal leading-relaxed mb-10">
                            {t("hero.desc")}
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-wrap gap-5">
                            <button className="relative group bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-8 py-4 rounded-2xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] font-bold shadow-xl shadow-zinc-500/20">
                                {t("common.request_demo")}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            
                            <button className="group px-8 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all font-bold text-zinc-900 dark:text-white">
                                <div className="p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg group-hover:scale-110 transition-transform">
                                    <Play size={16} className="fill-current" />
                                </div>
                                {t("common.see_features")}
                            </button>
                        </motion.div>
                    </div>

                    {/* Right Visual Element */}
                    <div className="lg:col-span-5 relative hidden lg:block">
                        <motion.div 
                            style={{ rotate }}
                            className="relative z-10 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-2xl"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: Server, label: "Cloud" },
                                    { icon: Shield, label: "Secure" },
                                    { icon: Cpu, label: "Core" },
                                    { icon: Activity, label: "Live" }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -5, backgroundColor: "rgba(245, 158, 11, 0.05)" }}
                                        className="p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col items-center gap-4 transition-colors"
                                    >
                                        <item.icon size={32} className="text-amber-500" />
                                        <div className="h-1.5 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                                                className="h-full bg-amber-500" 
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Floating "Status" Card */}
                            <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -right-8 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-white dark:bg-zinc-800 shadow-2xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-4 min-w-[200px]"
                            >
                                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-tighter text-zinc-500 font-bold">System Status</p>
                                    <p className="text-sm font-black text-zinc-900 dark:text-white">99.9% Uptime</p>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Decorative Background Rings */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-zinc-200/50 dark:border-zinc-800/50 rounded-full -z-10" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-zinc-100/30 dark:border-zinc-900/30 rounded-full -z-10" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}





































// "use client";

// import { useTranslation } from "@/hooks/useTranslation";
// import { motion, useScroll, useTransform } from "framer-motion";
// import { ArrowRight, Play, Server, Shield, Cpu, Activity } from "lucide-react";
// import { useRef } from "react";

// export function Hero() {
//     const { t } = useTranslation();
//     const containerRef = useRef(null);
//     const { scrollYProgress } = useScroll({
//         target: containerRef,
//         offset: ["start start", "end start"],
//     });

//     const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
//     const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
//     const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

//     return (
//         <section ref={containerRef} className="relative pt-48 pb-32 overflow-hidden grid-bg min-h-screen flex items-center">
//             <div className="scan-line" />

//             {/* Decorative Elements */}
//             <motion.div style={{ y: y1 }} className="absolute top-40 -left-20 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full" />
//             <motion.div style={{ y: y2 }} className="absolute bottom-40 -right-20 w-80 h-80 bg-blue-500/10 blur-3xl rounded-full" />

//             <div className="container mx-auto px-6 max-w-7xl relative z-10">
//                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
//                     <div className="lg:col-span-8">
//                         <motion.div
//                             initial={{ opacity: 0, x: -20 }}
//                             animate={{ opacity: 1, x: 0 }}
//                             className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-[10px] font-black uppercase tracking-[0.3em] mb-8"
//                         >
//                             <Activity size={12} className="text-amber-500" /> {t("hero.badge")}
//                         </motion.div>

//                         <motion.h1
//                             initial={{ opacity: 0, y: 30 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
//                             className="text-7xl md:text-[9rem] font-black leading-[0.85] tracking-tight mb-12 font-[Space Grotesk]"
//                         >
//                             <span className="block">{t("hero.title")}</span>
//                             <span className="gradient-text">{t("hero.subtitle")}</span>
//                         </motion.h1>

//                         <motion.p
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             transition={{ delay: 0.4 }}
//                             className="max-w-2xl text-xl text-zinc-500 font-medium leading-relaxed mb-12"
//                         >
//                             {t("hero.desc")}
//                         </motion.p>

//                         <div className="flex flex-col sm:flex-row gap-6">
//                             <button className="group bg-amber-500 hover:bg-amber-600 text-black px-12 py-6 rounded-xl flex items-center justify-center gap-4 transition-all shadow-2xl shadow-amber-500/30 text-lg font-black uppercase tracking-widest active:scale-95">
//                                 {t("common.request_demo")}
//                                 <ArrowRight className="group-hover:translate-x-2 transition-transform" />
//                             </button>
//                             <button className="px-12 py-6 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-4 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all font-black uppercase tracking-widest active:scale-95">
//                                 <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
//                                     <Play size={16} fill="currentColor" />
//                                 </div>
//                                 {t("common.see_features")}
//                             </button>
//                         </div>
//                     </div>

//                     <div className="lg:col-span-4 hidden lg:block relative">
//                         <motion.div
//                             style={{ rotate }}
//                             className="relative w-full aspect-square border-2 border-zinc-200 dark:border-zinc-800 rounded-xl p-12 bg-white/5 backdrop-blur-3xl shadow-3xl"
//                         >
//                             <div className="absolute inset-0 grid grid-cols-2 gap-4 p-4">
//                                 {[Server, Shield, Cpu, Activity].map((Icon, i) => (
//                                     <motion.div
//                                         key={i}
//                                         whileHover={{ scale: 1.05, backgroundColor: 'rgba(245,158,11,0.1)' }}
//                                         className="flex flex-col items-center justify-center border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg p-6"
//                                     >
//                                         <Icon size={40} className="text-amber-500 mb-4" />
//                                         <div className="h-1 w-8 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
//                                     </motion.div>
//                                 ))}
//                             </div>
//                             <div className="absolute -top-4 -left-4 w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-black font-black">
//                                 01
//                             </div>
//                         </motion.div>
//                     </div>
//                 </div>
//             </div>
//         </section>
//     );
// }
