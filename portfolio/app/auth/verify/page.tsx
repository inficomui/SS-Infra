"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";
import { ArrowRight, Zap, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useVerifyOtpMutation } from "@/redux/apis/authApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/slices/authSlice";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function VerifyPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();

    const phoneNumber = searchParams.get("phone") || "";
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [verifyOtp] = useVerifyOtpMutation();

    useEffect(() => {
        if (!phoneNumber) {
            router.push("/auth/login");
        }
    }, [phoneNumber, router]);

    const handleVerifyOtp = async () => {
        const otpStr = otp.join("");
        if (otpStr.length < 4) {
            setErrorMsg("Please enter a valid OTP");
            return;
        }
        setIsLoading(true);
        setErrorMsg("");
        try {
            const data = await verifyOtp({ mobile: phoneNumber, otp: otpStr }).unwrap();
            dispatch(setCredentials({ user: data.user, token: data.otpToken }));
            router.push("/dashboard/client");
        } catch (err: any) {
            setErrorMsg(err?.data?.message || "Invalid OTP code");
        } finally {
            setIsLoading(false);
        }
    };

    if (!phoneNumber) return null;

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
                                    <CheckCircle2 size={32} strokeWidth={2.5} />
                                </div>
                            </div>

                            <h3 className="text-3xl font-black mb-3 tracking-tight">
                                Verify <span className="text-amber-500">Identity</span>
                            </h3>
                            <p className="text-[var(--fg-muted)] font-medium">
                                Enter the OTP sent to +91 {phoneNumber}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {errorMsg && (
                                <div className="text-red-500 text-sm font-bold text-center bg-red-500/10 py-2 rounded-xl">
                                    {errorMsg}
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="block text-center text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)] mb-2">
                                    Security Code
                                </label>
                                <div className="flex gap-4 justify-center">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="relative group w-14 h-18">
                                            <input
                                                id={`otp-${i}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={otp[i] || ""}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, "").slice(-1);
                                                    const newOtp = [...otp];
                                                    newOtp[i] = val;
                                                    setOtp(newOtp);
                                                    if (val && i < 3) document.getElementById(`otp-${i + 1}`)?.focus();
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Backspace" && !otp[i] && i > 0) {
                                                        document.getElementById(`otp-${i - 1}`)?.focus();
                                                    }
                                                }}
                                                className="w-full h-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl text-2xl font-black text-center outline-none transition-all group-focus-within:border-amber-500 group-focus-within:ring-4 group-focus-within:ring-amber-500/10"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <motion.button
                                whileHover={otp.join("").length === 4 ? { scale: 1.01 } : {}}
                                whileTap={otp.join("").length === 4 ? { scale: 0.98 } : {}}
                                onClick={handleVerifyOtp}
                                disabled={isLoading || otp.join("").length < 4}
                                className="w-full relative group overflow-hidden bg-[var(--fg)] text-[var(--bg)] font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-[var(--fg-muted)]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="relative z-10 uppercase tracking-widest text-xs">
                                    {isLoading ? "Verifying..." : "Verify & Login"}
                                </span>
                                {!isLoading && <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
                            </motion.button>

                            <div className="text-center mt-6">
                                <Link
                                    href="/auth/login"
                                    className="text-xs text-[var(--fg-muted)] hover:text-amber-500 font-bold transition-colors"
                                >
                                    Change Mobile Number
                                </Link>
                            </div>
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
                                By verifying your identity, you agree to our <br />
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
