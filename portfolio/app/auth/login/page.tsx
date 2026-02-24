"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";
import { Phone, ArrowRight, Zap, ShieldCheck, Lock } from "lucide-react";
import { useSendOtpMutation } from "@/redux/apis/authApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function LoginPage() {
    const { t } = useTranslation();
    const router = useRouter();

    const [phoneNumber, setPhoneNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [sendOtp] = useSendOtpMutation();

    const handleSendOtp = async () => {
        if (phoneNumber.length < 10) {
            setErrorMsg("Please enter a valid 10-digit number");
            return;
        }
        setIsLoading(true);
        setErrorMsg("");
        try {
            await sendOtp({ mobile: phoneNumber }).unwrap();
            router.push(`/auth/verify?phone=${phoneNumber}`);
        } catch (err: any) {
            setErrorMsg(err?.data?.message || "Failed to send OTP");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[var(--bg-muted)] text-[var(--fg)] flex flex-col">
            <Navbar />

            <div className="flex-1 flex items-center justify-center p-4 pt-32 pb-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="relative w-full max-w-[480px] bg-[var(--card)] rounded-[2.5rem] shadow-2xl overflow-hidden border border-[var(--border)]"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />

                    <div className="p-8 sm:p-12 pt-16">
                        <div className="flex flex-col items-center text-center mb-10">
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

                            <h3 className="text-3xl font-black mb-3 tracking-tight">
                                Secured <span className="text-amber-500">Access</span>
                            </h3>
                            <p className="text-[var(--fg-muted)] font-medium">
                                Sign in to your SS-Infra dashboard
                            </p>
                        </div>

                        <div className="space-y-6">
                            {errorMsg && (
                                <div className="text-red-500 text-sm font-bold text-center bg-red-500/10 py-2 rounded-xl">
                                    {errorMsg}
                                </div>
                            )}

                            <div className="group relative">
                                <label className="absolute -top-2.5 left-4 px-2 bg-[var(--card)] text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)] z-10">
                                    Mobile Identity
                                </label>
                                <div className="relative flex items-center bg-[var(--bg)] border border-[var(--border)] rounded-2xl transition-all group-focus-within:border-amber-500 group-focus-within:ring-4 group-focus-within:ring-amber-500/10">
                                    <div className="pl-6 flex items-center gap-2 border-r border-[var(--border)] pr-4 my-4">
                                        <span className="text-[var(--fg-muted)] font-bold">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="98765  43212"
                                        value={phoneNumber}
                                        maxLength={10}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                                        className="w-full px-4 py-5 bg-transparent text-lg font-bold outline-none placeholder:text-[var(--fg-muted)] tracking-widest"
                                    />
                                    <div className="pr-6 text-[var(--fg-muted)] group-focus-within:text-amber-500 transition-colors">
                                        <Phone size={20} />
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={phoneNumber.length >= 10 ? { scale: 1.01 } : {}}
                                whileTap={phoneNumber.length >= 10 ? { scale: 0.98 } : {}}
                                onClick={handleSendOtp}
                                disabled={isLoading || phoneNumber.length < 10}
                                className="w-full relative group overflow-hidden bg-[var(--fg)] text-[var(--bg)] font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-[var(--fg-muted)]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="relative z-10 uppercase tracking-widest text-xs">
                                    {isLoading ? "Sending..." : "Authorize Device"}
                                </span>
                                {!isLoading && <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:text-black" />
                                {!isLoading && (
                                    <div className="absolute inset-0 bg-amber-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-black uppercase tracking-widest text-xs flex items-center gap-2">
                                            Get OTP Code <ArrowRight size={18} />
                                        </span>
                                    </div>
                                )}
                            </motion.button>
                        </div>

                        <div className="mt-10 pt-8 border-t border-[var(--border)]">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                                        <ShieldCheck size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-[var(--fg-muted)]">Security</span>
                                        <span className="text-[11px] font-bold">SSL Encrypted</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                        <Zap size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-[var(--fg-muted)]">Network</span>
                                        <span className="text-[11px] font-bold">Fast OTP</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[10px] text-center text-[var(--fg-muted)] font-medium leading-relaxed">
                                By entering your number, you agree to our <br />
                                <span className="font-bold hover:underline cursor-pointer transition-all">Service Terms</span> & <span className="font-bold hover:underline cursor-pointer transition-all">Security Protocol</span>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}
