"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleLoginPopup } from "@/store/slices/authSlice";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, ArrowRight, Zap, ShieldCheck, Lock } from "lucide-react";

export function LoginPopup() {
    const dispatch = useAppDispatch();
    const show = useAppSelector((state: any) => state.auth.showLoginPopup);
    const { t } = useTranslation();
    const [phoneNumber, setPhoneNumber] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(toggleLoginPopup(true));
        }, 5000);
        return () => clearTimeout(timer);
    }, [dispatch]);

    if (!show) return null;

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { staggerChildren: 0.1, delayChildren: 0.2, type: "spring", damping: 20 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                {/* Cinematic Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => dispatch(toggleLoginPopup(false))}
                    className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xl"
                />

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="relative w-full max-w-[480px] bg-white dark:bg-[#09090b] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] overflow-hidden border border-zinc-200 dark:border-zinc-800"
                >
                    {/* Glowing Accent Background */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />

                    {/* Close Button */}
                    <button
                        onClick={() => dispatch(toggleLoginPopup(false))}
                        className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-90 z-20"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8 sm:p-12 pt-16">
                        {/* Header Section */}
                        <motion.div variants={itemVariants} className="flex flex-col items-center text-center mb-10">
                            <div className="relative mb-6">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"
                                />
                                <div className="relative w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center text-black shadow-xl shadow-amber-500/20">
                                    <Lock size={32} strokeWidth={2.5} />
                                </div>
                            </div>

                            <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">
                                Secured <span className="text-amber-500">Access</span>
                            </h3>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                                Sign in to your SS-Infra dashboard
                            </p>
                        </motion.div>

                        {/* Form Section */}
                        <motion.div variants={itemVariants} className="space-y-6">
                            <div className="group relative">
                                <label className="absolute -top-2.5 left-4 px-2 bg-white dark:bg-[#09090b] text-[10px] font-black uppercase tracking-widest text-zinc-400 z-10">
                                    Mobile Identity
                                </label>
                                <div className="relative flex items-center bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl transition-all group-focus-within:border-amber-500 group-focus-within:ring-4 group-focus-within:ring-amber-500/10">
                                    <div className="pl-6 flex items-center gap-2 border-r border-zinc-200 dark:border-zinc-800 pr-4 my-4">
                                        <span className="text-zinc-400 dark:text-zinc-500 font-bold">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="00000 00000"
                                        value={phoneNumber}
                                        maxLength={10}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                                        className="w-full px-4 py-5 bg-transparent text-lg font-bold text-zinc-900 dark:text-white outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                                    />
                                    <div className="pr-6 text-zinc-300 dark:text-zinc-700 group-focus-within:text-amber-500 transition-colors">
                                        <Phone size={20} />
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full relative group overflow-hidden bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-zinc-500/10"
                            >
                                <span className="relative z-10 uppercase tracking-widest text-xs">Authorize Device</span>
                                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:text-black" />
                                {/* Button Hover Text Override Trick */}
                                <div className="absolute inset-0 bg-amber-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-black uppercase tracking-widest text-xs flex items-center gap-2">
                                        Get OTP Code <ArrowRight size={18} />
                                    </span>
                                </div>
                            </motion.button>
                        </motion.div>

                        {/* Footer Trust Section */}
                        <motion.div variants={itemVariants} className="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-900/50">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-500">
                                        <ShieldCheck size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-400">Security</span>
                                        <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-300">SSL Encrypted</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500">
                                        <Zap size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-400">Network</span>
                                        <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-300">Fast OTP</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[10px] text-center text-zinc-400 dark:text-zinc-500 font-medium leading-relaxed">
                                By entering your number, you agree to our <br />
                                <span className="text-zinc-900 dark:text-zinc-300 font-bold hover:underline cursor-pointer transition-all">Service Terms</span> & <span className="text-zinc-900 dark:text-zinc-300 font-bold hover:underline cursor-pointer transition-all">Security Protocol</span>
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}