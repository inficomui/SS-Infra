"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateBookingMutation } from "@/redux/apis/bookingApi";
import {
    User, Building2, Phone, Mail, MessageSquare, Truck, Activity,
    CheckCircle2, Loader2, Send, ChevronDown, ShieldCheck
} from "lucide-react";

const machineRanges = [
    "1–5 Machines",
    "6–15 Machines",
    "16–30 Machines",
    "31–50 Machines",
    "50+ Machines",
];

export function EnquiryForm() {
    const { t } = useTranslation();
    const [createBooking, { isLoading }] = useCreateBookingMutation();
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        fullName: "",
        companyName: "",
        phone: "",
        email: "",
        machineRange: "",
        message: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.fullName.trim()) e.fullName = "Required";
        if (!form.phone.trim() || !/^\d{10}$/.test(form.phone)) e.phone = "Invalid 10-digit number";
        if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
        if (!form.machineRange) e.machineRange = "Required";
        return e;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        try {
            await createBooking({
                targetId: "general-enquiry",
                targetType: "owner",
                clientName: form.fullName,
                mobile: form.phone,
                otpToken: "", // General enquiry doesn't require OTP
                message: `[${form.machineRange}] ${form.message}`,
            }).unwrap();
        } catch (_) {
            // Global rtkQueryErrorLogger in store shows the toast error
        }
        setSubmitted(true);
    };

    const inputClass = (key: string) =>
        `w-full px-5 py-4 rounded-xl border text-sm font-semibold bg-background text-foreground placeholder:text-muted-foreground dark:placeholder:text-zinc-600 outline-none transition-all duration-300 focus:ring-4 focus:ring-primary/10 focus:border-primary ${errors[key] ? "border-red-500" : "border-border"
        }`;

    return (
        <section id="enquiry" className="relative py-32 overflow-hidden bg-background transition-colors">
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 grid-pattern opacity-[0.2] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

                    {/* LEFT: Copy */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-5"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
                            <Send size={12} strokeWidth={3} /> Connection Hub
                        </div>

                        <h2 className="text-5xl md:text-[5rem] font-black font-heading tracking-tight leading-[0.85] mb-8 text-foreground">
                            Ready to <br />
                            <span className="text-gradient">Scale</span> Your <br />
                            Operations?
                        </h2>

                        <p className="text-xl text-muted-foreground dark:text-muted-foreground font-medium leading-relaxed mb-12 max-w-md">
                            Join 500+ infrastructure leaders who optimized their fleet management with us.
                        </p>

                        <div className="space-y-4">
                            {[
                                { title: "Global Compliance", desc: "Enterprise-grade security standards", icon: <ShieldCheck className="text-primary" /> },
                                { title: "Real-time Support", desc: "24/7 dedicated account managers", icon: <Activity className="text-primary" /> },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-5 p-6 rounded-[2rem] industrial-border bg-card shadow-sm transition-all hover:scale-[1.02] cursor-default">
                                    <div className="mt-1 p-3 bg-primary/5 rounded-xl border border-primary/10">{item.icon}</div>
                                    <div>
                                        <h4 className="font-black text-foreground uppercase tracking-tight">{item.title}</h4>
                                        <p className="text-sm text-foreground/60 font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* RIGHT: Form */}
                    <div className="lg:col-span-7 w-full">
                        <AnimatePresence mode="wait">
                            {submitted ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-background dark:bg-zinc-900 p-12 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 text-center shadow-2xl"
                                >
                                    <div className="w-20 h-20 bg-green-500 rounded-[16px] rotate-12 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/20">
                                        <CheckCircle2 size={40} className="text-white -rotate-12" />
                                    </div>
                                    <h3 className="text-3xl font-black mb-4 text-zinc-900 dark:text-white">Inquiry Received</h3>
                                    <p className="text-muted-foreground mb-8">One of our specialists will contact you shortly.</p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="text-sm font-black uppercase tracking-widest text-primary hover:text-amber-600 transition-colors"
                                    >
                                        Send another response
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    onSubmit={handleSubmit}
                                    className="bg-card p-10 md:p-14 rounded-[3rem] border-2 border-primary/10 shadow-2xl relative overflow-hidden"
                                >
                                    {/* Glossy Accent */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -z-10 rounded-full" />
                                    {/* Name + Company */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-muted-foreground flex items-center gap-2 ml-1">
                                                <User size={12} /> {t("common.full_name")}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Rajesh Sharma"
                                                className={inputClass("fullName")}
                                                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                            />
                                            {errors.fullName && <p className="text-red-500 text-xs font-bold px-1">{errors.fullName}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-muted-foreground flex items-center gap-2 ml-1">
                                                <Building2 size={12} /> {t("common.company_name")}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Sharma Infra Works"
                                                className={inputClass("companyName")}
                                                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Phone + Email */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-muted-foreground flex items-center gap-2 ml-1">
                                                <Phone size={12} /> {t("common.phone_number")}
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="9876543210"
                                                maxLength={10}
                                                className={inputClass("phone")}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                                            />
                                            {errors.phone && <p className="text-red-500 text-xs font-bold px-1">{errors.phone}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-muted-foreground flex items-center gap-2 ml-1">
                                                <Mail size={12} /> {t("common.email_address")}
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="rajesh@company.com"
                                                className={inputClass("email")}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            />
                                            {errors.email && <p className="text-red-500 text-xs font-bold px-1">{errors.email}</p>}
                                        </div>
                                    </div>

                                    {/* Fleet Size */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-muted-foreground flex items-center gap-2 ml-1">
                                            <Truck size={12} /> Fleet Size
                                        </label>
                                        <div className="relative">
                                            <select
                                                className={inputClass("machineRange") + " appearance-none cursor-pointer"}
                                                onChange={(e) => setForm({ ...form, machineRange: e.target.value })}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Select range...</option>
                                                {machineRanges.map((r) => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                        </div>
                                        {errors.machineRange && <p className="text-red-500 text-xs font-bold px-1">{errors.machineRange}</p>}
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-muted-foreground flex items-center gap-2 ml-1">
                                            <MessageSquare size={12} /> Message (Optional)
                                        </label>
                                        <textarea
                                            rows={4}
                                            placeholder="Tell us about your requirements..."
                                            className={inputClass("message") + " resize-none"}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-5 bg-primary hover:bg-primary/90 text-black font-black rounded-xl text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed yellow-glow"
                                    >
                                        {isLoading
                                            ? <><Loader2 size={16} className="animate-spin text-black" /> Sending...</>
                                            : <><Send size={16} className="text-black" /> Deploy Inquiry</>
                                        }
                                    </motion.button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
}
