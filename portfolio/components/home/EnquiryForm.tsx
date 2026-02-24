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
                clientMobile: form.phone,
                message: `[${form.machineRange}] ${form.message}`,
            }).unwrap();
        } catch (_) {
            // Global rtkQueryErrorLogger in store shows the toast error
        }
        setSubmitted(true);
    };

    const inputClass = (key: string) =>
        `w-full px-5 py-4 rounded-xl border text-sm font-semibold bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none transition-all duration-300 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 ${errors[key] ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
        }`;

    return (
        <section id="enquiry" className="relative py-32 overflow-hidden bg-white dark:bg-zinc-950 transition-colors">
            {/* Subtle Background Pattern */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.826 10.558c1.026 1.312 1.594 2.93 1.594 4.603 0 4.195-3.409 7.603-7.603 7.603-1.674 0-3.292-.568-4.603-1.594l-8.647 8.647c1.026 1.312 1.594 2.93 1.594 4.603 0 4.195-3.409 7.603-7.603 7.603-1.674 0-3.292-.568-4.603-1.594l-8.647 8.647c1.026 1.312 1.594 2.93 1.594 4.603 0 4.195-3.409 7.603-7.603 7.603-4.195 0-7.603-3.408-7.603-7.603s3.408-7.603 7.603-7.603c1.674 0 3.292.568 4.603 1.594l8.647-8.647c-1.026-1.312-1.594-2.93-1.594-4.603 0-4.195 3.409-7.603 7.603-7.603 1.674 0 3.292.568 4.603 1.594l8.647-8.647c-1.026-1.312-1.594-2.93-1.594-4.603 0-4.195 3.409-7.603 7.603-7.603s7.603 3.408 7.603 7.603z' fill='%239C92AC' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                }}
            />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

                    {/* LEFT: Copy */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-5"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                            <Send size={12} strokeWidth={3} /> Connection Hub
                        </div>

                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] mb-8 text-zinc-900 dark:text-white">
                            Ready to <br />
                            <span className="text-amber-500">Scale</span> Your <br />
                            Operations?
                        </h2>

                        <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-12 max-w-md">
                            Join 500+ infrastructure leaders who optimized their fleet management with us.
                        </p>

                        <div className="space-y-5">
                            {[
                                { title: "Global Compliance", desc: "Enterprise-grade security standards", icon: <ShieldCheck className="text-amber-500" /> },
                                { title: "Real-time Support", desc: "24/7 dedicated account managers", icon: <Activity className="text-amber-500" /> },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                                    <div className="mt-1">{item.icon}</div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 dark:text-white">{item.title}</h4>
                                        <p className="text-sm text-zinc-500">{item.desc}</p>
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
                                    className="bg-white dark:bg-zinc-900 p-12 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 text-center shadow-2xl"
                                >
                                    <div className="w-20 h-20 bg-green-500 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/20">
                                        <CheckCircle2 size={40} className="text-white -rotate-12" />
                                    </div>
                                    <h3 className="text-3xl font-black mb-4 text-zinc-900 dark:text-white">Inquiry Received</h3>
                                    <p className="text-zinc-500 mb-8">One of our specialists will contact you shortly.</p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="text-sm font-black uppercase tracking-widest text-amber-500 hover:text-amber-600 transition-colors"
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
                                    className="bg-zinc-50 dark:bg-zinc-900/30 p-8 md:p-12 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8"
                                >
                                    {/* Name + Company */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 flex items-center gap-2 ml-1">
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
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 flex items-center gap-2 ml-1">
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
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 flex items-center gap-2 ml-1">
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
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 flex items-center gap-2 ml-1">
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
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 flex items-center gap-2 ml-1">
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
                                            <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        </div>
                                        {errors.machineRange && <p className="text-red-500 text-xs font-bold px-1">{errors.machineRange}</p>}
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 flex items-center gap-2 ml-1">
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
                                        className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-2xl text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isLoading
                                            ? <><Loader2 size={16} className="animate-spin" /> Sending...</>
                                            : <><Send size={16} /> Deploy Inquiry</>
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
