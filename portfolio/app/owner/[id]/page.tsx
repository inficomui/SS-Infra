"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { MapPin, Briefcase, Star, Users, Phone, Mail, Award, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function OwnerProfilePage() {
    const { t } = useTranslation();

    // Mock Owner Data
    const owner = {
        id: 1,
        name: "Rajesh Sharma",
        company: "Sharma Infra Works",
        rating: 4.8,
        reviews: 124,
        location: "Mumbai, Maharashtra, India",
        joined: "2020",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
        verified: true,
        about: "Sharma Infra Works is a leading provider of heavy machinery and skilled operators in the Maharashtra region. We specialize in excavation, drilling, and site preparation with a proven track record of on-time project completion."
    };

    // Mock Operators Data
    const operators = [
        { id: 101, name: "Vijay Singh", skill: "Excavator Operator", experience: "5 Years", rate: "₹500/hr", image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=400&fit=crop", rating: 4.9 },
        { id: 102, name: "Amit Kumar", skill: "JCB Operator", experience: "3 Years", rate: "₹450/hr", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", rating: 4.7 },
        { id: 103, name: "Rajat Patel", skill: "Crane Operator", experience: "8 Years", rate: "₹800/hr", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop", rating: 5.0 },
        { id: 104, name: "Sandeep Nayak", skill: "Bulldozer Driver", experience: "4 Years", rate: "₹600/hr", image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop", rating: 4.6 },
    ];

    return (
        <main className="min-h-screen bg-[var(--bg-muted)] text-[var(--fg)]">
            <Navbar />

            {/* Owner Header Cover */}
            <section className="pt-32 pb-16 bg-[var(--bg)] border-b border-[var(--border)]">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="flex flex-col md:flex-row gap-8 items-start relative">

                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-[var(--bg-muted)] shadow-xl shrink-0 -mt-16 md:mt-0 z-10 bg-[var(--card)]">
                            <img src={owner.image} alt={owner.name} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-1 mt-4 md:mt-0">
                            <div className="flex items-center gap-2 mb-2">
                                <h1 className="text-4xl md:text-5xl font-black tracking-tight">{owner.company}</h1>
                                {owner.verified && <CheckCircle className="text-blue-500 w-8 h-8" />}
                            </div>
                            <p className="text-lg text-[var(--fg-muted)] font-medium mb-4">Owned by {owner.name} • Member since {owner.joined}</p>

                            <div className="flex flex-wrap items-center gap-6 mb-6">
                                <div className="flex items-center gap-2 text-[var(--accent)] font-bold">
                                    <Star className="fill-current w-5 h-5" /> {owner.rating} <span className="text-[var(--fg-muted)] font-normal text-sm">({owner.reviews} Reviews)</span>
                                </div>
                                <div className="flex items-center gap-2 text-[var(--fg)] font-medium text-sm">
                                    <MapPin className="text-[var(--fg-muted)] w-5 h-5" /> {owner.location}
                                </div>
                                <div className="flex items-center gap-2 text-[var(--fg)] font-medium text-sm">
                                    <Users className="text-[var(--fg-muted)] w-5 h-5" /> {operators.length} Active Operators
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button className="px-6 py-3 bg-[var(--fg)] text-[var(--bg)] rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-80 transition-all flex items-center gap-2">
                                    <Mail size={16} /> Message
                                </button>
                                <button className="px-6 py-3 border border-[var(--border)] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[var(--bg-muted)] transition-all flex items-center gap-2">
                                    <Phone size={16} /> Contact
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16">
                <div className="container mx-auto px-6 max-w-5xl flex flex-col lg:flex-row gap-12">

                    {/* About Section */}
                    <div className="w-full lg:w-1/3 space-y-8">
                        <div className="bento-card p-8">
                            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                                <Award className="text-[var(--accent)]" /> About Company
                            </h3>
                            <p className="text-[var(--fg-muted)] text-sm leading-relaxed mb-6">
                                {owner.about}
                            </p>
                            <div className="space-y-4 pt-6 border-t border-[var(--border)]">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-[var(--fg-muted)]">Completed Projects</span>
                                    <span className="font-bold">450+</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-[var(--fg-muted)]">Response Time</span>
                                    <span className="font-bold">< 2 Hours</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-[var(--fg-muted)]">Verified Status</span>
                                    <span className="font-bold text-green-500">Tier 1 Partner</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operators List */}
                    <div className="w-full lg:w-2/3">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black">Available <span className="text-[var(--accent)]">Operators</span> ({operators.length})</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {operators.map((op, idx) => (
                                <motion.div
                                    key={op.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bento-card p-6 flex flex-col group"
                                >
                                    <div className="flex gap-4 mb-4">
                                        <img src={op.image} alt={op.name} className="w-16 h-16 rounded-full object-cover border-2 border-[var(--bg-muted)]" />
                                        <div>
                                            <h4 className="text-lg font-black group-hover:text-[var(--accent)] transition-colors">{op.name}</h4>
                                            <div className="text-xs text-[var(--fg-muted)] font-black uppercase tracking-widest mb-1">{op.skill}</div>
                                            <div className="flex items-center gap-1 text-[var(--accent)] text-xs font-bold">
                                                <Star size={12} className="fill-current" /> {op.rating}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-6 text-sm">
                                        <div className="bg-[var(--bg-muted)] p-3 rounded-lg text-center">
                                            <div className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider font-bold mb-1">Experience</div>
                                            <div className="font-black">{op.experience}</div>
                                        </div>
                                        <div className="bg-[var(--bg-muted)] p-3 rounded-lg text-center">
                                            <div className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider font-bold mb-1">Rate</div>
                                            <div className="font-black text-green-600 dark:text-green-400">{op.rate}</div>
                                        </div>
                                    </div>

                                    <Link href={`/operator/${op.id}`} className="mt-auto">
                                        <button className="w-full py-3 bg-[var(--fg)] text-[var(--bg)] rounded-lg text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all flex items-center justify-center">
                                            View Profile & Book
                                        </button>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

            <Footer />
        </main>
    );
}
