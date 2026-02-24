"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Star, MapPin, Briefcase, Calendar, Clock, Banknote, CheckCircle, Flame, ShieldCheck, ThumbsUp } from "lucide-react";
import Link from "next/link";

export default function OperatorProfilePage() {
    const { t } = useTranslation();

    // Mock Operator Data
    const operator = {
        id: 101,
        name: "Vijay Singh",
        owner: "Sharma Infra Works",
        ownerId: 1,
        skill: "Excavator Operator",
        experience: "5 Years",
        rate: "₹500/hr",
        dailyRate: "₹4000/day",
        image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=400&fit=crop",
        rating: 4.9,
        reviews: 84,
        location: "Mumbai, Maharashtra",
        bio: "Certified Heavy Machinery Operator with 5+ years of experience in urban excavation and trenching. Excellent safety record and highly proficient in Komatsu and JCB excavators.",
        completedJobs: 300,
        availability: "Available Tomorrow",
        verified: true
    };

    return (
        <main className="min-h-screen bg-[var(--bg-muted)] text-[var(--fg)]">
            <Navbar />

            <section className="pt-32 pb-16 bg-[var(--bg)] border-b border-[var(--border)]">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="flex flex-col md:flex-row gap-10 items-start">

                        {/* Operator Image */}
                        <div className="w-32 h-32 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-[var(--bg-muted)] shadow-2xl shrink-0 z-10 bg-[var(--card)]">
                            <img src={operator.image} alt={operator.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Operator Details */}
                        <div className="flex-1 mt-4 md:mt-2">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl md:text-5xl font-black tracking-tight">{operator.name}</h1>
                                {operator.verified && <ShieldCheck className="text-green-500 w-8 h-8" />}
                            </div>
                            <div className="text-lg text-[var(--accent)] font-black uppercase tracking-widest mb-4">
                                {operator.skill}
                            </div>

                            <div className="flex flex-wrap items-center gap-6 mb-8 text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <Star className="text-amber-500 fill-amber-500 w-5 h-5" />
                                    <span className="font-bold text-lg">{operator.rating}</span>
                                    <span className="text-[var(--fg-muted)]">({operator.reviews} Reviews)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="text-[var(--fg-muted)] w-5 h-5" /> {operator.location}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="text-[var(--fg-muted)] w-5 h-5" /> {operator.experience} Exp
                                </div>
                            </div>

                            <div className="bg-[var(--bg-muted)] p-6 rounded-2xl border border-[var(--border)] max-w-2xl">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)] mb-1">Pricing Options</div>
                                        <div className="text-2xl font-black text-green-600 dark:text-green-400">{operator.rate} <span className="text-sm font-medium text-[var(--fg-muted)]">or {operator.dailyRate}</span></div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)] mb-1">Status</div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> {operator.availability}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Link href={`/book/${operator.id}`} className="flex-1">
                                        <button className="w-full py-4 bg-[var(--accent)] text-black rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center shadow-lg shadow-amber-500/20">
                                            Book Operator Now
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-4 text-xs font-bold text-[var(--fg-muted)] uppercase tracking-widest">
                                Employed by: <Link href={`/owner/${operator.ownerId}`} className="text-[var(--accent)] hover:underline">{operator.owner}</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-6 max-w-5xl flex flex-col lg:flex-row gap-10">

                    {/* Main Info */}
                    <div className="w-full lg:w-2/3 space-y-10">
                        <div>
                            <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                                <Flame className="text-orange-500" /> Professional Summary
                            </h3>
                            <p className="text-[var(--fg-muted)] leading-relaxed text-sm">
                                {operator.bio}
                            </p>
                        </div>

                        {/* Performance Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bento-card p-5 text-center flex flex-col items-center justify-center">
                                <ThumbsUp size={24} className="text-[var(--accent)] mb-2" />
                                <div className="text-2xl font-black">{operator.completedJobs}+</div>
                                <div className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-widest">Jobs Done</div>
                            </div>
                            <div className="bento-card p-5 text-center flex flex-col items-center justify-center">
                                <Clock size={24} className="text-[var(--accent)] mb-2" />
                                <div className="text-2xl font-black">100%</div>
                                <div className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-widest">On-Time</div>
                            </div>
                            <div className="bento-card p-5 text-center flex flex-col items-center justify-center">
                                <ShieldCheck size={24} className="text-[var(--accent)] mb-2" />
                                <div className="text-2xl font-black">Zero</div>
                                <div className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-widest">Incidents</div>
                            </div>
                            <div className="bento-card p-5 text-center flex flex-col items-center justify-center">
                                <Star size={24} className="text-[var(--accent)] mb-2" />
                                <div className="text-xl font-black tracking-tight cursor-pointer hover:underline">Read All</div>
                                <div className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-widest">Reviews</div>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div>
                            <h3 className="text-2xl font-black mb-6">Recent Reviews</h3>
                            <div className="space-y-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="bento-card p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[var(--bg-muted)] flex items-center justify-center font-bold">C{i}</div>
                                                <div>
                                                    <div className="font-bold text-sm">Client {i}</div>
                                                    <div className="text-xs text-[var(--fg-muted)]">Verified Booking</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-[var(--accent)]">
                                                <Star size={12} className="fill-current" />
                                                <Star size={12} className="fill-current" />
                                                <Star size={12} className="fill-current" />
                                                <Star size={12} className="fill-current" />
                                                <Star size={12} className="fill-current" />
                                            </div>
                                        </div>
                                        <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                                            "Vijay was highly professional and handled the excavation project flawlessly. Showed up on time and completed the work 2 hours early."
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Schedule Info */}
                    <div className="w-full lg:w-1/3">
                        <div className="bento-card p-6 sticky top-24">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                <Calendar className="text-[var(--accent)]" /> Availability
                            </h3>

                            <div className="space-y-3 mb-8">
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                                    <div key={day} className="flex justify-between items-center p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm font-medium">
                                        <span>{day}</span>
                                        {i === 2 ? (
                                            <span className="text-amber-500 font-bold uppercase text-[10px] tracking-widest">Booked</span>
                                        ) : (
                                            <span className="text-green-500 font-bold uppercase text-[10px] tracking-widest">Available</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-4 rounded-xl text-xs font-bold leading-relaxed mb-6">
                                Operator schedules can fill up quickly. Secure your booking at least 24 hours in advance.
                            </div>

                            <Link href={`/book/${operator.id}`}>
                                <button className="w-full py-4 bg-[var(--fg)] text-[var(--bg)] rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-80 transition-all flex items-center justify-center">
                                    Proceed to Booking
                                </button>
                            </Link>
                        </div>
                    </div>

                </div>
            </section>

            <Footer />
        </main>
    );
}
