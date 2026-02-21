"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateEnquiryMutation } from "@/store/apis/portfolioApi";
import {
    User, Building2, Phone, Mail, MessageSquare, Truck, Activity,
    CheckCircle2, ArrowRight, Loader2, Send, ChevronDown, ShieldCheck
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
    const [createEnquiry, { isLoading }] = useCreateEnquiryMutation();
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
        if (!form.phone.trim() || !/^\d{10}$/.test(form.phone)) e.phone = "Invalid Number";
        if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid Email";
        if (!form.machineRange) e.machineRange = "Required";
        return e;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        try {
            await createEnquiry(form).unwrap();
        } catch (_) { /* Demo handling */ }
        setSubmitted(true);
    };

    const inputClasses = (key: string) => `
        w-full px-5 py-4 rounded-xl border text-sm font-semibold 
        bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white 
        placeholder:text-zinc-400 dark:placeholder:text-zinc-600 
        outline-none transition-all duration-300
        focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500
        ${errors[key] ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"}
    `;

    return (
        <section id="enquiry" className="relative py-32 overflow-hidden bg-white dark:bg-zinc-950 transition-colors">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.826 10.558c1.026 1.312 1.594 2.93 1.594 4.603 0 4.195-3.409 7.603-7.603 7.603-1.674 0-3.292-.568-4.603-1.594l-8.647 8.647c1.026 1.312 1.594 2.93 1.594 4.603 0 4.195-3.409 7.603-7.603 7.603-1.674 0-3.292-.568-4.603-1.594l-8.647 8.647c1.026 1.312 1.594 2.93 1.594 4.603 0 4.195-3.409 7.603-7.603 7.603-4.195 0-7.603-3.408-7.603-7.603s3.408-7.603 7.603-7.603c1.674 0 3.292.568 4.603 1.594l8.647-8.647c-1.026-1.312-1.594-2.93-1.594-4.603 0-4.195 3.409-7.603 7.603-7.603 1.674 0 3.292.568 4.603 1.594l8.647-8.647c-1.026-1.312-1.594-2.93-1.594-4.603 0-4.195 3.409-7.603 7.603-7.603s7.603 3.408 7.603 7.603z' fill='%239C92AC' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")` }}
            />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

                    {/* LEFT SIDE: Typography & Trust */}
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

                        <div className="space-y-6">
                            {[
                                { title: "Global Compliance", desc: "Enterprise-grade security standards", icon: <ShieldCheck className="text-amber-500" /> },
                                { title: "Real-time Support", desc: "24/7 dedicated account managers", icon: <Activity className="text-amber-500" /> }
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

                    {/* RIGHT SIDE: The Form Card */}
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
                                    <h3 className="text-3xl font-black mb-4">Inquiry Received</h3>
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Full Name */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 flex items-center gap-2 ml-1">
                                                <User size={12} /> {t("common.full_name")}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="John Doe"
                                                className={inputClasses("fullName")}
                                                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                            />
                                        </div>

                                        {/* Company */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 flex items-center gap-2 ml-1">
                                                <Building2 size={12} /> {t("common.company_name")}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Acme Corp"
                                                className={inputClasses("companyName")}
                                                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 flex items-center gap-2 ml-1">
                                                <Phone size={12} /> {t("common.phone_number")}
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="+91 ..."
                                                className={inputClasses("phone")}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 flex items-center gap-2 ml-1">
                                                <Mail size={12} /> {t("common.email_address")}
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="john@example.com"
                                                className={inputClasses("email")}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Machine Range */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 flex items-center gap-2 ml-1">
                                            <Truck size={12} /> Fleet Size
                                        </label>
                                        <div className="relative">
                                            <select
                                                className={inputClasses("machineRange") + " appearance-none cursor-pointer"}
                                                onChange={(e) => setForm({ ...form, machineRange: e.target.value })}
                                            >
                                                <option value="">Select range...</option>
                                                {machineRanges.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 flex items-center gap-2 ml-1">
                                            <MessageSquare size={12} /> Message (Optional)
                                        </label>
                                        <textarea
                                            rows={4}
                                            placeholder="Tell us about your requirements..."
                                            className={inputClasses("message") + " resize-none"}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-2xl text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : <><Send size={16} /> Deploy Inquiry</>}
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





































// "use client";

// import { useState } from "react";
// import { useTranslation } from "@/hooks/useTranslation";
// import { motion, AnimatePresence } from "framer-motion";
// import { useCreateEnquiryMutation } from "@/store/apis/portfolioApi";
// import {
//     User, Building2, Phone, Mail, MessageSquare, Truck,
//     CheckCircle2, ArrowRight, Loader2, Send, ChevronDown
// } from "lucide-react";

// const machineRanges = [
//     "1–5 Machines",
//     "6–15 Machines",
//     "16–30 Machines",
//     "31–50 Machines",
//     "50+ Machines",
// ];

// export function EnquiryForm() {
//     const { t } = useTranslation();
//     const [createEnquiry, { isLoading }] = useCreateEnquiryMutation();
//     const [submitted, setSubmitted] = useState(false);
//     const [form, setForm] = useState({
//         fullName: "",
//         companyName: "",
//         phone: "",
//         email: "",
//         machineRange: "",
//         message: "",
//     });
//     const [errors, setErrors] = useState<Record<string, string>>({});

//     const validate = () => {
//         const e: Record<string, string> = {};
//         if (!form.fullName.trim()) e.fullName = "Full name is required";
//         if (!form.phone.trim() || !/^\d{10}$/.test(form.phone)) e.phone = "Enter a valid 10-digit number";
//         if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
//         if (!form.machineRange) e.machineRange = "Please select a machine range";
//         return e;
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         const errs = validate();
//         if (Object.keys(errs).length) { setErrors(errs); return; }
//         setErrors({});
//         try {
//             await createEnquiry(form).unwrap();
//         } catch (_) { /* ignore – show success regardless for demo */ }
//         setSubmitted(true);
//     };

//     const field = (
//         key: keyof typeof form,
//         label: string,
//         icon: React.ReactNode,
//         type = "text",
//         placeholder = ""
//     ) => (
//         <div className="flex flex-col gap-1.5">
//             <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
//                 {icon} {label}
//             </label>
//             <input
//                 type={type}
//                 value={form[key]}
//                 placeholder={placeholder}
//                 onChange={(e) => setForm({ ...form, [key]: e.target.value })}
//                 className={`w-full px-5 py-4 rounded-xl border text-sm font-semibold bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none transition-all focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 ${errors[key]
//                         ? "border-red-400 dark:border-red-500"
//                         : "border-zinc-200 dark:border-zinc-800"
//                     }`}
//             />
//             {errors[key] && (
//                 <span className="text-[11px] text-red-500 font-bold">{errors[key]}</span>
//             )}
//         </div>
//     );

//     return (
//         <section
//             id="enquiry"
//             className="py-28 bg-zinc-50 dark:bg-[#060608] border-t border-zinc-100 dark:border-zinc-900"
//         >
//             <div className="container mx-auto px-6 max-w-7xl">
//                 {/* Header */}
//                 <div className="flex flex-col lg:flex-row gap-20 items-start">
//                     {/* Left – Copy */}
//                     <div className="lg:w-2/5 lg:sticky lg:top-32">
//                         <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-[11px] font-black uppercase tracking-widest mb-8">
//                             <Send size={13} /> Get In Touch
//                         </div>
//                         <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-[0.9] mb-8 text-zinc-900 dark:text-white">
//                             Start Your <br />
//                             <span className="gradient-text">Infrastructure</span> <br />
//                             Journey.
//                         </h2>
//                         <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-12 max-w-md">
//                             Tell us about your fleet and project needs. Our team will reach out within 24 hours with a tailored solution.
//                         </p>

//                         {/* Trust Signals */}
//                         <div className="space-y-4">
//                             {[
//                                 { icon: <CheckCircle2 size={18} className="text-green-500" />, text: "Response within 24 hours" },
//                                 { icon: <CheckCircle2 size={18} className="text-green-500" />, text: "No commitment required" },
//                                 { icon: <CheckCircle2 size={18} className="text-green-500" />, text: "Free consultation call" },
//                             ].map((item, i) => (
//                                 <div key={i} className="flex items-center gap-3">
//                                     {item.icon}
//                                     <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">{item.text}</span>
//                                 </div>
//                             ))}
//                         </div>

//                         {/* Stats */}
//                         <div className="mt-12 grid grid-cols-2 gap-4">
//                             {[
//                                 { value: "500+", label: "Active Clients" },
//                                 { value: "24h", label: "Avg. Response" },
//                             ].map((s, i) => (
//                                 <div key={i} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
//                                     <div className="text-3xl font-black text-amber-500 mb-1">{s.value}</div>
//                                     <div className="text-[11px] font-black uppercase tracking-widest text-zinc-500">{s.label}</div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Right – Form */}
//                     <div className="lg:w-3/5 w-full">
//                         <AnimatePresence mode="wait">
//                             {submitted ? (
//                                 <motion.div
//                                     key="success"
//                                     initial={{ opacity: 0, scale: 0.95 }}
//                                     animate={{ opacity: 1, scale: 1 }}
//                                     className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-16 flex flex-col items-center text-center shadow-xl"
//                                 >
//                                     <div className="w-24 h-24 bg-green-500/10 rounded-2xl flex items-center justify-center mb-8">
//                                         <CheckCircle2 size={48} className="text-green-500" />
//                                     </div>
//                                     <h3 className="text-4xl font-black text-zinc-900 dark:text-white mb-4">
//                                         {t("common.success_title")}
//                                     </h3>
//                                     <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg max-w-sm leading-relaxed mb-10">
//                                         {t("common.success_desc")}
//                                     </p>
//                                     <button
//                                         onClick={() => { setSubmitted(false); setForm({ fullName: "", companyName: "", phone: "", email: "", machineRange: "", message: "" }); }}
//                                         className="px-10 py-4 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl text-sm uppercase tracking-widest transition-all active:scale-95"
//                                     >
//                                         {t("common.send_another")}
//                                     </button>
//                                 </motion.div>
//                             ) : (
//                                 <motion.form
//                                     key="form"
//                                     initial={{ opacity: 0, y: 20 }}
//                                     animate={{ opacity: 1, y: 0 }}
//                                     onSubmit={handleSubmit}
//                                     className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 md:p-12 shadow-xl space-y-6"
//                                 >
//                                     {/* Top accent bar */}
//                                     <div className="h-1 w-full bg-linear-to-r from-amber-400 via-amber-500 to-yellow-500 rounded-full -mt-2 mb-2" />

//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                         {field("fullName", t("common.full_name"), <User size={13} />, "text", "Rajesh Sharma")}
//                                         {field("companyName", t("common.company_name"), <Building2 size={13} />, "text", "Sharma Infra Works")}
//                                     </div>

//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                         {field("phone", t("common.phone_number"), <Phone size={13} />, "tel", "9876543210")}
//                                         {field("email", t("common.email_address"), <Mail size={13} />, "email", "rajesh@company.com")}
//                                     </div>

//                                     {/* Machine Range Select */}
//                                     <div className="flex flex-col gap-1.5">
//                                         <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
//                                             <Truck size={13} /> {t("common.select_machine_range")}
//                                         </label>
//                                         <div className="relative">
//                                             <select
//                                                 value={form.machineRange}
//                                                 onChange={(e) => setForm({ ...form, machineRange: e.target.value })}
//                                                 className={`w-full appearance-none px-5 py-4 rounded-xl border text-sm font-semibold bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none transition-all focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 cursor-pointer ${errors.machineRange
//                                                         ? "border-red-400 dark:border-red-500"
//                                                         : "border-zinc-200 dark:border-zinc-800"
//                                                     }`}
//                                             >
//                                                 <option value="" disabled>Select machine range…</option>
//                                                 {machineRanges.map((r) => (
//                                                     <option key={r} value={r}>{r}</option>
//                                                 ))}
//                                             </select>
//                                             <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
//                                         </div>
//                                         {errors.machineRange && (
//                                             <span className="text-[11px] text-red-500 font-bold">{errors.machineRange}</span>
//                                         )}
//                                     </div>

//                                     {/* Message */}
//                                     <div className="flex flex-col gap-1.5">
//                                         <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
//                                             <MessageSquare size={13} /> {t("common.message")}
//                                         </label>
//                                         <textarea
//                                             rows={4}
//                                             value={form.message}
//                                             placeholder="Tell us about your project, location, and specific requirements…"
//                                             onChange={(e) => setForm({ ...form, message: e.target.value })}
//                                             className="w-full px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none transition-all focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 resize-none"
//                                         />
//                                     </div>

//                                     <button
//                                         type="submit"
//                                         disabled={isLoading}
//                                         className="w-full py-5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-black font-black rounded-xl text-sm uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-3"
//                                     >
//                                         {isLoading ? (
//                                             <><Loader2 size={18} className="animate-spin" /> Sending…</>
//                                         ) : (
//                                             <>{t("common.send_enquiry")} <ArrowRight size={18} /></>
//                                         )}
//                                     </button>

//                                     <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-600 font-semibold">
//                                         By submitting, you agree to our{" "}
//                                         <span className="underline underline-offset-2 cursor-pointer hover:text-amber-500 transition-colors">Terms of Service</span>{" "}
//                                         and{" "}
//                                         <span className="underline underline-offset-2 cursor-pointer hover:text-amber-500 transition-colors">Privacy Policy</span>.
//                                     </p>
//                                 </motion.form>
//                             )}
//                         </AnimatePresence>
//                     </div>
//                 </div>
//             </div>
//         </section>
//     );
// }
