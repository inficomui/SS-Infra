"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Phone,
    MessageSquare,
    Calendar,
    CheckCircle2,
    Loader2,
    User,
    RefreshCw,
    Bell,
    BadgeCheck,
    ShieldCheck,
} from "lucide-react";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeBookingModal } from "@/redux/slices/modalSlice";
import { setCredentials } from "@/redux/slices/authSlice";
import { useCreateBookingMutation } from "@/redux/apis/bookingApi";
import { useSendOtpMutation, useVerifyOtpMutation } from "@/redux/apis/authApi";

/* ─── Validation ─────────────────────────────────────────────── */
const formSchema = z.object({
    clientName: z.string().min(2, "Name must be at least 2 characters"),
    clientMobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    dateOfRequirement: z.string().optional(),
    message: z.string().optional(),
});
type BookingForm = z.infer<typeof formSchema>;

/* ─── OTP Verification states ────────────────────────────────── */
type OtpState = "idle" | "sent" | "verified";

/* ─── 6-box OTP Input ────────────────────────────────────────── */
function OtpBoxes({ value, onChange, disabled }: { value: string[]; onChange: (v: string[]) => void; disabled?: boolean }) {
    const refs = useRef<(HTMLInputElement | null)[]>([]);
    // const digits = Array.from({ length: 4 }, (_, i) => value[i] || ""); // No longer needed, value is already the array

    const handleChange = (i: number, v: string) => {
        const char = v.replace(/\D/g, "").slice(-1);
        const newOtp = [...value]; // Use value directly
        newOtp[i] = char;
        // const next = newDigits.join(""); // No longer needed
        onChange(newOtp); // Pass the array

        if (char && i < 3) {
            refs.current[i + 1]?.focus();
        }
    };

    const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !value[i] && i > 0) { // Use value directly
            refs.current[i - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
        const newOtp = [...value];
        for (let idx = 0; idx < p.length; idx++) {
            newOtp[idx] = p[idx];
        }
        onChange(newOtp);
        if (p.length === 4) refs.current[3]?.focus();
        e.preventDefault();
    };

    return (
        <div className="flex gap-3 justify-center" onPaste={handlePaste}>
            {Array.from({ length: 4 }).map((_, i) => (
                <input
                    key={i}
                    id={`otp-box-${i}`}
                    ref={(el) => { refs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] || ""} // Use value directly
                    disabled={disabled}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKey(i, e)}
                    className="w-12 h-14 text-center text-xl font-black rounded-2xl border-2
            bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white
            outline-none transition-all
            border-zinc-200 dark:border-zinc-800
            focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10
            disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export function BookingModal() {
    const dispatch = useAppDispatch();
    const { bookingTargetId, bookingTargetType, bookingTargetName } = useAppSelector((s) => s.modal);
    const { selectedDistrict, selectedTaluka } = useAppSelector((s) => s.filter);
    const { user, isAuthenticated } = useAppSelector((s) => s.auth);

    const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
    const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
    const [createBooking, { isLoading: isBooking }] = useCreateBookingMutation();

    /* ── Form state ── */
    const [form, setForm] = useState<BookingForm>({
        clientName: user?.name || "",
        clientMobile: user?.mobile || "",
        dateOfRequirement: "",
        message: ""
    });
    const [errors, setErrors] = useState<Partial<Record<keyof BookingForm, string>>>({});

    /* ── OTP state ── */
    const [otpState, setOtpState] = useState<OtpState>(isAuthenticated ? "verified" : "idle");
    const [otpCode, setOtpCode] = useState<string[]>(["", "", "", ""]); // Initialize as array of strings
    const [otpError, setOtpError] = useState<string | null>(null);
    const [otpToken, setOtpToken] = useState<string | null>(isAuthenticated ? "existing-session" : null);
    const [resendTimer, setResendTimer] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);

    /* ── Submitted state ── */
    const [submitted, setSubmitted] = useState(false);

    const isOperator = bookingTargetType === "operator";

    useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

    /* ── Countdown ── */
    const startTimer = (s = 60) => {
        setResendTimer(s);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    /* ── Field change ── */
    const set = (field: keyof BookingForm, val: string) => {
        setForm((p) => ({ ...p, [field]: val }));
        if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
        // If mobile changed after sending OTP, reset verification
        if (field === "clientMobile" && otpState !== "idle") {
            setOtpState("idle");
            setOtpCode(["", "", "", ""]); // Reset OTP code
            setOtpToken(null);
            setOtpError(null);
            if (timerRef.current) clearInterval(timerRef.current);
            setResendTimer(0);
        }
    };

    /* ── Send OTP ── */
    const handleSendOtp = async () => {
        const mobileResult = z.string().regex(/^[6-9]\d{9}$/).safeParse(form.clientMobile);
        if (!mobileResult.success) {
            setErrors((p) => ({ ...p, clientMobile: "Enter a valid 10-digit mobile number" }));
            return;
        }
        setErrors((p) => ({ ...p, clientMobile: undefined }));
        try {
            await sendOtp({ mobile: form.clientMobile }).unwrap();
            toast.success(`OTP sent to +91 ${form.clientMobile}`);
            setOtpState("sent");
            setOtpCode(["", "", "", ""]); // Reset OTP code
            setOtpError(null);
            startTimer(60);
            // Auto-focus first OTP box
            setTimeout(() => document.getElementById("otp-box-0")?.focus(), 100);
        } catch { /* global */ }
    };

    /* ── Verify OTP ── */
    const handleVerifyOtp = async () => {
        const otpStr = otpCode.join(""); // Join array to string for API call
        if (otpStr.length !== 4) { setOtpError("Enter all 4 digits"); return; }
        setOtpError(null);
        try {
            const { otpToken: token, is_registered, user } = await verifyOtp({ mobile: form.clientMobile, otp: otpStr }).unwrap();
            setOtpToken(token);
            setOtpState("verified");

            if (is_registered && user?.name) {
                setForm(p => ({ ...p, clientName: user.name }));
                dispatch(setCredentials({ user, token: token })); // Persistence
                toast.success(`Welcome back, ${user.name}!`);
            } else {
                toast.success("Number verified!");
            }
        } catch {
            setOtpError("Incorrect OTP. Please try again.");
        }
    };

    /* ── Resend ── */
    const handleResend = async () => {
        if (resendTimer > 0) return;
        setOtpCode(["", "", "", ""]); // Reset OTP code
        setOtpError(null);
        try {
            await sendOtp({ mobile: form.clientMobile }).unwrap();
            toast.success("New OTP sent!");
            startTimer(60);
        } catch { /* global */ }
    };

    /* ── Submit booking ── */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate whole form
        const result = formSchema.safeParse(form);
        if (!result.success) {
            const errs: typeof errors = {};
            result.error.issues.forEach((i) => { errs[i.path[0] as keyof BookingForm] = i.message; });
            setErrors(errs);
            return;
        }

        // Must have verified mobile
        if (otpState !== "verified" || !otpToken) {
            setErrors((p) => ({ ...p, clientMobile: "Please verify your mobile number first" }));
            return;
        }

        try {
            await createBooking({
                targetId: bookingTargetId!,
                targetType: bookingTargetType!,
                clientName: result.data.clientName,
                mobile: result.data.clientMobile,
                otpToken,
                message: result.data.message,
                locationDistrict: selectedDistrict,
                locationTaluka: selectedTaluka,
                dateOfRequirement: result.data.dateOfRequirement,
            }).unwrap();
            setSubmitted(true);
            setTimeout(() => { dispatch(closeBookingModal()); }, 3500);
        } catch { /* global */ }
    };

    const inputBase = "w-full bg-zinc-50 dark:bg-zinc-900 border rounded-2xl px-4 py-3.5 font-semibold text-zinc-900 dark:text-white outline-none transition-all placeholder:font-normal placeholder:text-zinc-400 text-sm";
    const inputBorder = (err?: string) => err
        ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
        : "border-zinc-200 dark:border-zinc-800 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-3000 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-zinc-950/70 backdrop-blur-xl"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 30 }}
                    transition={{ type: "spring", damping: 22 }}
                    className="relative w-full max-w-[460px] bg-white dark:bg-zinc-950 rounded-4xl shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden"
                >
                    {/* Top accent */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[3px] bg-linear-to-r from-transparent via-amber-500 to-transparent" />

                    {/* Close */}
                    {!submitted && (
                        <button
                            onClick={() => dispatch(closeBookingModal())}
                            className="absolute top-4 right-4 z-10 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                        >
                            <X size={17} />
                        </button>
                    )}

                    <div className="p-6 sm:p-8">
                        <AnimatePresence mode="wait">

                            {/* ─────────── SUCCESS STATE ─────────── */}
                            {submitted ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.92 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center text-center py-4"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.1 }}
                                        className="w-20 h-20 rounded-3xl bg-green-500 flex items-center justify-center text-white mb-5 shadow-2xl shadow-green-500/25"
                                    >
                                        <CheckCircle2 size={36} strokeWidth={2.5} />
                                    </motion.div>

                                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">
                                        Booking <span className="text-green-500">Confirmed!</span>
                                    </h3>
                                    <p className="text-zinc-500 text-sm font-medium mb-6 max-w-[280px]">
                                        {isOperator
                                            ? "The Operator and their Owner have been notified via the mobile app."
                                            : "The Owner has been notified and will assign the nearest operator."}
                                    </p>

                                    <div className="w-full space-y-2">
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/40">
                                            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white shrink-0">
                                                <Bell size={14} />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400">Push Sent</div>
                                                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                                    {isOperator ? "Operator notified on mobile app" : "Owner notified on mobile app"}
                                                </div>
                                            </div>
                                        </div>
                                        {isOperator && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                                                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black shrink-0">
                                                    <Bell size={14} />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Push Sent</div>
                                                    <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Owner notified for operator assignment</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                            ) : (

                                /* ─────────── SINGLE FORM ─────────── */
                                <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>

                                    {/* Header */}
                                    <div className="mb-6">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest mb-3">
                                            {isOperator ? <User size={11} /> : <Bell size={11} />}
                                            Book {isOperator ? "Operator" : "Owner"}
                                            {bookingTargetName && <span className="text-amber-400 dark:text-amber-500">— {bookingTargetName}</span>}
                                        </div>
                                        <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                                            Your <span className="text-amber-500">Booking Details</span>
                                        </h3>
                                        <p className="text-zinc-400 text-xs font-medium mt-1">
                                            Verify your mobile number, then confirm the booking.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                                        {/* ── Name ── */}
                                        <div>
                                            <label className="text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 block">
                                                Full Name <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Ramesh Patil"
                                                    value={form.clientName}
                                                    onChange={(e) => set("clientName", e.target.value)}
                                                    className={`${inputBase} ${inputBorder(errors.clientName)} pl-9`}
                                                />
                                            </div>
                                            {errors.clientName && <p className="text-red-500 text-xs font-bold mt-1 px-1">{errors.clientName}</p>}
                                        </div>

                                        {/* ── Mobile + Send OTP ── */}
                                        <div>
                                            <label className="text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 block">
                                                Mobile Number <span className="text-red-400">*</span>
                                            </label>
                                            <div className="flex gap-2">
                                                {/* Phone input */}
                                                <div className={`flex-1 relative flex items-center bg-zinc-50 dark:bg-zinc-900 border rounded-2xl transition-all overflow-hidden ${inputBorder(errors.clientMobile)}`}>
                                                    <span className="pl-3.5 pr-2 text-xs font-black text-zinc-500 dark:text-zinc-400 shrink-0 border-r border-zinc-200 dark:border-zinc-700 py-3.5">+91</span>
                                                    <input
                                                        type="tel"
                                                        placeholder="10-digit number"
                                                        maxLength={10}
                                                        value={form.clientMobile}
                                                        onChange={(e) => set("clientMobile", e.target.value.replace(/\D/g, ""))}
                                                        disabled={otpState === "verified"}
                                                        className="flex-1 px-3 py-3.5 font-semibold text-sm text-zinc-900 dark:text-white bg-transparent outline-none placeholder:text-zinc-400 placeholder:font-normal tracking-wider disabled:opacity-60"
                                                    />
                                                    {/* Verified tick inside field */}
                                                    {otpState === "verified" && (
                                                        <BadgeCheck size={18} className="mr-3 text-green-500 shrink-0" />
                                                    )}
                                                </div>

                                                {/* Send / Resend OTP button */}
                                                {otpState !== "verified" && (
                                                    <button
                                                        type="button"
                                                        onClick={handleSendOtp}
                                                        disabled={isSendingOtp || form.clientMobile.length !== 10}
                                                        className="shrink-0 px-4 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-black text-[11px] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                                                    >
                                                        {isSendingOtp ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : otpState === "sent" ? (
                                                            "Resend"
                                                        ) : (
                                                            "Send OTP"
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                            {errors.clientMobile && <p className="text-red-500 text-xs font-bold mt-1 px-1">{errors.clientMobile}</p>}

                                            {/* ── Inline OTP Section (slides in after OTP sent) ── */}
                                            <AnimatePresence>
                                                {otpState === "sent" && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0, marginTop: 12 }}
                                                        animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                        transition={{ duration: 0.25 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <ShieldCheck size={14} className="text-amber-500" />
                                                                <span className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                                                                    Enter OTP sent to +91 {form.clientMobile}
                                                                </span>
                                                            </div>

                                                            <OtpBoxes
                                                                value={otpCode}
                                                                onChange={(v) => { setOtpCode(v); setOtpError(null); }}
                                                            />

                                                            {otpError && (
                                                                <motion.p
                                                                    initial={{ opacity: 0, y: -4 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="text-red-500 text-xs font-bold mt-2 text-center"
                                                                >
                                                                    {otpError}
                                                                </motion.p>
                                                            )}

                                                            <div className="flex items-center justify-between mt-3 gap-2">
                                                                {/* Resend timer */}
                                                                <div className="text-xs text-zinc-400 font-medium">
                                                                    {resendTimer > 0 ? (
                                                                        <>Resend in <span className="text-amber-500 font-black">{resendTimer}s</span></>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            onClick={handleResend}
                                                                            disabled={isSendingOtp}
                                                                            className="flex items-center gap-1 text-zinc-500 hover:text-amber-500 font-black transition-colors"
                                                                        >
                                                                            <RefreshCw size={11} className={isSendingOtp ? "animate-spin" : ""} />
                                                                            Resend OTP
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {/* Verify button */}
                                                                <button
                                                                    type="button"
                                                                    onClick={handleVerifyOtp}
                                                                    disabled={isVerifyingOtp || otpCode.join("").length !== 4} // Check joined length
                                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-black text-[11px] uppercase tracking-wider hover:bg-amber-500 hover:text-black dark:hover:bg-amber-500 dark:hover:text-black transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                                                >
                                                                    {isVerifyingOtp ? (
                                                                        <><Loader2 size={12} className="animate-spin" /> Verifying...</>
                                                                    ) : (
                                                                        <><BadgeCheck size={12} /> Verify</>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Verified success strip */}
                                            <AnimatePresence>
                                                {otpState === "verified" && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="flex items-center gap-2 mt-2 px-1"
                                                    >
                                                        <CheckCircle2 size={13} className="text-green-500" />
                                                        <span className="text-xs font-black text-green-600 dark:text-green-400">
                                                            Mobile number verified successfully
                                                        </span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* ── Date Selection ── */}
                                        <div>
                                            <label className="text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5 block">
                                                Date of Requirement <span className="text-zinc-400 italic font-normal">(Select a day)</span>
                                            </label>

                                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1">
                                                {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                                                    const d = new Date();
                                                    d.setDate(d.getDate() + offset);
                                                    const isToday = offset === 0;
                                                    const isTomorrow = offset === 1;
                                                    const dateStr = d.toISOString().split("T")[0];
                                                    const isSelected = form.dateOfRequirement === dateStr;

                                                    return (
                                                        <button
                                                            key={offset}
                                                            type="button"
                                                            onClick={() => set("dateOfRequirement", dateStr)}
                                                            className={`shrink-0 flex flex-col items-center justify-center w-[60px] h-[72px] rounded-2xl border-2 transition-all ${isSelected
                                                                ? "bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/25"
                                                                : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-amber-500/50"
                                                                }`}
                                                        >
                                                            <span className={`text-[10px] font-black uppercase tracking-tighter ${isSelected ? "text-black/70" : "text-zinc-400"}`}>
                                                                {isToday ? "Today" : isTomorrow ? "Tmrw" : d.toLocaleDateString('en-US', { weekday: 'short' })}
                                                            </span>
                                                            <span className="text-lg font-black leading-tight">
                                                                {d.getDate()}
                                                            </span>
                                                            <span className={`text-[10px] font-bold ${isSelected ? "text-black/70" : "text-zinc-500"}`}>
                                                                {d.toLocaleDateString('en-US', { month: 'short' })}
                                                            </span>
                                                        </button>
                                                    );
                                                })}

                                                <div
                                                    className="relative shrink-0 cursor-pointer"
                                                    onClick={() => dateInputRef.current?.showPicker()}
                                                >
                                                    <input
                                                        ref={dateInputRef}
                                                        type="date"
                                                        min={new Date().toISOString().split("T")[0]}
                                                        onChange={(e) => set("dateOfRequirement", e.target.value)}
                                                        className="absolute inset-0 opacity-0 cursor-pointer -z-10 w-full h-full"
                                                    />
                                                    {(() => {
                                                        const isPreset = [0, 1, 2, 3, 4, 5, 6].some(off => {
                                                            const d = new Date(); d.setDate(d.getDate() + off);
                                                            return form.dateOfRequirement === d.toISOString().split("T")[0];
                                                        });
                                                        const isCustom = form.dateOfRequirement && !isPreset;

                                                        if (isCustom && form.dateOfRequirement) {
                                                            const selectedD = new Date(form.dateOfRequirement);
                                                            return (
                                                                <div className="flex flex-col items-center justify-center w-[60px] h-[72px] rounded-2xl border-2 bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/25 transition-all">
                                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-black/70">
                                                                        {selectedD.toLocaleDateString('en-US', { weekday: 'short' })}
                                                                    </span>
                                                                    <span className="text-lg font-black leading-tight">
                                                                        {selectedD.getDate()}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-black/70">
                                                                        {selectedD.toLocaleDateString('en-US', { month: 'short' })}
                                                                    </span>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div className="flex flex-col items-center justify-center w-[60px] h-[72px] rounded-2xl border-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition-all hover:border-amber-500/50">
                                                                <Calendar size={18} />
                                                                <span className="text-[10px] font-black uppercase mt-1">Other</span>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                            {/* Detailed Selected Date Indicator */}
                                            <AnimatePresence>
                                                {form.dateOfRequirement && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -4 }}
                                                        className="mt-2.5 flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                                            <Calendar size={14} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Selected Date</span>
                                                            <span className="text-xs font-bold text-zinc-900 dark:text-white">
                                                                {new Date(form.dateOfRequirement!).toLocaleDateString('en-US', {
                                                                    weekday: 'long',
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <CheckCircle2 size={14} className="ml-auto text-green-500" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* ── Message ── */}
                                        <div>
                                            <label className="text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 block">
                                                Message <span className="text-zinc-400 normal-case font-normal">(optional)</span>
                                            </label>
                                            <div className="relative">
                                                <MessageSquare size={14} className="absolute left-3.5 top-3.5 text-zinc-400" />
                                                <textarea
                                                    rows={3}
                                                    placeholder="Describe your requirement, location details, etc."
                                                    value={form.message}
                                                    onChange={(e) => set("message", e.target.value)}
                                                    className={`${inputBase} ${inputBorder()} pl-9 resize-none`}
                                                />
                                            </div>
                                        </div>

                                        {/* ── Submit ── */}
                                        <button
                                            type="submit"
                                            disabled={isBooking || otpState !== "verified"}
                                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg
                        bg-zinc-950 dark:bg-white text-white dark:text-zinc-950
                        hover:bg-amber-500 hover:text-black dark:hover:bg-amber-500 dark:hover:text-black
                        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-zinc-950 dark:disabled:hover:bg-white dark:disabled:hover:text-zinc-950"
                                        >
                                            {isBooking ? (
                                                <><Loader2 size={16} className="animate-spin" /> Sending Request...</>
                                            ) : otpState !== "verified" ? (
                                                <><Phone size={14} /> Verify Number to Confirm</>
                                            ) : (
                                                <><CheckCircle2 size={14} /> Confirm Booking Request</>
                                            )}
                                        </button>

                                        {otpState !== "verified" && (
                                            <p className="text-center text-[11px] text-zinc-400 font-medium -mt-1">
                                                Verify your mobile number above to enable booking
                                            </p>
                                        )}
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
