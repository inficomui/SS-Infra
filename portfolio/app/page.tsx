"use client";

import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturedMachinery } from "@/components/home/FeaturedMachinery";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Testimonials } from "@/components/home/Testimonials";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { ArrowRight, Hammer, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Stats ────────────────────────────────────────────── */}
      <StatsSection />

      {/* ── Featured Machinery ───────────────────────────────── */}
      <FeaturedMachinery />

      {/* ── How It Works ─────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Why Choose Us ────────────────────────────────────── */}
      <WhyChooseUs />

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-[60px] p-12 md:p-20 relative overflow-hidden shadow-2xl shadow-blue-200 dark:shadow-none">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-4xl md:text-6xl font-bold font-heading text-white mb-8 leading-tight">
                  Ready to List Your <br />
                  <span className="text-blue-900">Heavy Machinery?</span>
                </h2>
                <p className="text-xl text-blue-50 mb-12 font-medium">
                  Join thousands of machine owners and start receiving verified leads from your local district today.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/auth/register?role=owner"
                    className="px-10 py-5 bg-white text-primary font-bold rounded-2xl hover:scale-105 transition-all shadow-xl"
                  >
                    Register as Owner
                  </Link>
                  <Link
                    href="/contact"
                    className="px-10 py-5 bg-blue-800 text-white font-bold rounded-2xl hover:bg-blue-900 transition-all flex items-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Contact Sales
                  </Link>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  <div className="w-full aspect-square bg-blue-400/30 rounded-full animate-pulse-slow blur-3xl absolute inset-0" />
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-2xl border border-blue-100"
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">TRUSTED BY</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">5000+ Providers</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-4/5 bg-primary" />
                      </div>
                      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-3/5 bg-primary" />
                      </div>
                      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-[90%] bg-primary" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────── */}
      <Testimonials />

      {/* ── Footer ───────────────────────────────────────────── */}
      <Footer />
    </main>
  );
}
