"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, CreditCard, UploadCloud, MapPin, Briefcase, ChevronRight, CheckCircle, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function BookingPage() {
    const { t } = useTranslation();

    const [step, setStep] = useState(1);
    const operator = {
        id: 101,
        name: "Vijay Singh",
        skill: "Excavator Operator",
        rate: "₹500/hr",
        owner: "Sharma Infra Works"
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    return (
        <main className="min-h-screen bg-[var(--bg-muted)] text-[var(--fg)]">
            <Navbar />

            <section className="pt-32 pb-16">
                <div className="container mx-auto px-6 max-w-4xl">

                    <div className="mb-10 text-center">
                        <h1 className="text-4xl font-black mb-3">Complete Your <span className="gradient-text">Booking</span></h1>
                        <p className="text-[var(--fg-muted)] font-medium text-lg">Secure your operator instantly by providing project details.</p>
                    </div>

                    {/* Stepper Progress */}
                    <div className="flex items-center justify-between mb-12 relative max-w-2xl mx-auto">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[var(--border)] z-0 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[var(--accent)] transition-all duration-500"
                                style={{ width: `${((step - 1) / 3) * 100}%` }}
                            />
                        </div>

                        {[
                            { num: 1, label: "Schedule" },
                            { num: 2, label: "Details" },
                            { num: 3, label: "Media" },
                            { num: 4, label: "Payment" }
                        ].map(s => (
                            <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all shadow-md
                  ${step >= s.num ? 'bg-[var(--accent)] border-[var(--accent)] text-black' : 'bg-[var(--card)] border-[var(--border)] text-[var(--fg-muted)]'}`}
                                >
                                    {step > s.num ? <CheckCircle size={18} /> : s.num}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= s.num ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]'}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Booking Form Area */}
                        <div className="flex-1 bento-card p-8">

                            {/* Step 1: Schedule */}
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h2 className="text-2xl font-black mb-6">Select Date & Time</h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[var(--fg-muted)] uppercase tracking-widest mb-2">Target Date</label>
                                            <div className="relative">
                                                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" size={20} />
                                                <input type="date" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[var(--accent)] transition-colors text-sm font-medium" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-[var(--fg-muted)] uppercase tracking-widest mb-2">Start Time</label>
                                                <select className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-4 px-4 outline-none focus:border-[var(--accent)] transition-colors text-sm font-medium appearance-none">
                                                    <option>09:00 AM</option>
                                                    <option>10:00 AM</option>
                                                    <option>11:00 AM</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-[var(--fg-muted)] uppercase tracking-widest mb-2">Duration</label>
                                                <select className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-4 px-4 outline-none focus:border-[var(--accent)] transition-colors text-sm font-medium appearance-none">
                                                    <option>4 Hours (Half Day)</option>
                                                    <option>8 Hours (Full Day)</option>
                                                    <option>Multiple Days</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Details */}
                            {step === 2 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h2 className="text-2xl font-black mb-6">Project Details</h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[var(--fg-muted)] uppercase tracking-widest mb-2">Site Location Address</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-4 text-[var(--fg-muted)]" size={20} />
                                                <textarea rows={3} placeholder="Enter full address or GPS coordinates" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[var(--accent)] transition-colors text-sm font-medium resize-none"></textarea>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-[var(--fg-muted)] uppercase tracking-widest mb-2">Job Description</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-4 top-4 text-[var(--fg-muted)]" size={20} />
                                                <textarea rows={4} placeholder="Describe the work required (e.g. Foundation excavation, debris removal...)" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[var(--accent)] transition-colors text-sm font-medium resize-none"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Media */}
                            {step === 3 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h2 className="text-2xl font-black mb-6">Site Images (Optional)</h2>
                                    <p className="text-sm text-[var(--fg-muted)] mb-6">Upload photos of the site area so the operator understands terrain and access points.</p>

                                    <div className="border-2 border-dashed border-[var(--border)] rounded-xl bg-[var(--bg)] h-64 flex flex-col items-center justify-center hover:border-[var(--accent)] transition-colors cursor-pointer group">
                                        <div className="w-16 h-16 rounded-full bg-[var(--bg-muted)] flex items-center justify-center text-[var(--accent)] mb-4 group-hover:scale-110 transition-transform">
                                            <UploadCloud size={24} />
                                        </div>
                                        <span className="font-bold">Click to Upload or Drag & Drop</span>
                                        <span className="text-xs font-medium text-[var(--fg-muted)] mt-1 tracking-widest uppercase">JPG, PNG (Max 5MB)</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Payment */}
                            {step === 4 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h2 className="text-2xl font-black mb-6">Confirm & Pay</h2>

                                    <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-4 rounded-xl text-xs font-bold leading-relaxed mb-6 flex items-start gap-3">
                                        <Info size={16} className="shrink-0 mt-0.5" />
                                        <span>Your payment is held securely in escrow and only released to the owner upon job completion and sign-off.</span>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="flex items-center gap-4 p-4 border border-[var(--border)] rounded-xl cursor-pointer hover:border-[var(--accent)]">
                                            <input type="radio" name="payment" defaultChecked className="accent-[var(--accent)] w-5 h-5" />
                                            <div className="flex-1">
                                                <div className="font-bold">Pay Now Online</div>
                                                <div className="text-xs text-[var(--fg-muted)]">Credit Card, UPI, Net Banking</div>
                                            </div>
                                            <CreditCard className="text-[var(--fg-muted)]" />
                                        </label>
                                        <label className="flex items-center gap-4 p-4 border border-[var(--border)] rounded-xl cursor-pointer hover:border-[var(--accent)]">
                                            <input type="radio" name="payment" className="accent-[var(--accent)] w-5 h-5" />
                                            <div className="flex-1">
                                                <div className="font-bold">Send Booking Request</div>
                                                <div className="text-xs text-[var(--fg-muted)]">Pay later upon owner approval</div>
                                            </div>
                                        </label>
                                    </div>
                                </motion.div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-10 pt-6 border-t border-[var(--border)]">
                                {step > 1 ? (
                                    <button onClick={prevStep} className="px-6 py-3 rounded-lg text-sm font-black uppercase tracking-widest text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors">
                                        Back
                                    </button>
                                ) : <div></div>}

                                {step < 4 ? (
                                    <button onClick={nextStep} className="px-8 py-3 bg-[var(--fg)] text-[var(--bg)] rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-80 transition-all flex items-center gap-2">
                                        Next Step <ChevronRight size={16} />
                                    </button>
                                ) : (
                                    <Link href="/dashboard/client">
                                        <button className="px-10 py-4 bg-[var(--accent)] text-black rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20">
                                            Confirm Booking
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Booking Summary Sidebar */}
                        <div className="w-full md:w-80 shrink-0">
                            <div className="bento-card p-6 sticky top-24">
                                <h3 className="text-lg font-black mb-4">Summary</h3>

                                <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)] mb-4">
                                    <div className="w-12 h-12 bg-[var(--bg-muted)] rounded-lg flex items-center justify-center font-bold text-lg text-[var(--accent)]">
                                        {operator.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm bg-transparent">{operator.name}</div>
                                        <div className="text-[10px] uppercase font-bold text-[var(--fg-muted)]">{operator.skill}</div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--fg-muted)]">Rate</span>
                                        <span className="font-bold">{operator.rate}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--fg-muted)]">Est. Hours</span>
                                        <span className="font-bold">4 Hours</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--fg-muted)]">Service Fee (5%)</span>
                                        <span className="font-bold">₹100</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-[var(--border)] mb-6">
                                    <span className="text-sm font-black uppercase tracking-widest text-[var(--fg-muted)]">Total</span>
                                    <span className="text-2xl font-black text-green-600 dark:text-green-400">₹2,100</span>
                                </div>

                                <div className="text-[10px] text-center text-[var(--fg-muted)] font-medium leading-relaxed">
                                    By confirming, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Cancellation Policy</span>.
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            <Footer />
        </main>
    );
}
