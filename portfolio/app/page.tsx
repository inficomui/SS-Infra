"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { Workflow } from "@/components/home/Workflow";
import { SupportedAssets } from "@/components/home/SupportedAssets";
import { OwnersList } from "@/components/home/OwnersList";
import { OperatorDiscovery } from "@/components/home/OperatorDiscovery";
import { NetworkDirectory } from "@/components/home/NetworkDirectory";
import { EnquiryForm } from "@/components/home/EnquiryForm";
import { Pricing } from "@/components/home/Pricing";
import { Footer } from "@/components/layout/Footer";
import { IPhone3D } from "@/components/ui/IPhone3D";
import { motion } from "framer-motion";
import {
  Shield, Zap, Network, Database,
  Smartphone as Mobile, Download, Apple,
} from "lucide-react";

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <Hero />

      {/* ── Workflow ─────────────────────────────────────────── */}
      <Workflow />

      {/* ── Supported Assets ─────────────────────────────────── */}
      <SupportedAssets />

      {/* ── Network Directory ────────────────────────────────── */}
      <NetworkDirectory />

      {/* ── Features Bento Grid ──────────────────────────────── */}
      <section
        id="features"
        className="py-24 md:py-32 bg-background relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,204,0,0.03)_0%,transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center mb-16 md:mb-24">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-primary/5 border border-primary/20 text-primary rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-8">
              <Zap size={14} className="animate-pulse" /> Powerful Capabilities
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-[5.5rem] font-black tracking-tight leading-[0.85] mb-8 uppercase font-heading">
              Technological <br />
              <span className="text-gradient-yellow italic font-heading">
                Backbone.
              </span>
            </h2>
            <p className="text-base md:text-xl text-muted-foreground font-medium max-w-2xl opacity-75">
              Enterprise-grade tools built for the rigorous demands of modern infrastructure management and fleet optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 auto-rows-[280px]">
            {/* 1. Live Location Tracking (Large) */}
            <motion.div
              whileHover={{ y: -5, borderColor: 'rgba(255,204,0,0.3)' }}
              className="md:col-span-8 md:row-span-2 glass-card p-10 md:p-14 flex flex-col justify-between rounded-[3.5rem] border-white/5 bg-gradient-to-br from-zinc-900/80 to-black/80 relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,204,0,0.05)_0%,transparent_50%)]" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-primary text-black rounded-[1.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-primary/30 transition-transform group-hover:scale-110">
                  <Network size={32} />
                </div>
                <h3 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 uppercase italic leading-[0.85] font-heading text-white">
                  Live Location <br /> 
                  <span className="text-primary group-hover:text-white transition-colors">Tracking.</span>
                </h3>
                <p className="text-base md:text-xl text-muted-foreground font-medium leading-relaxed max-w-md opacity-80">
                  Monitor every asset in real-time with sub-meter precision. Our GPS mesh ensures zero signal downtime across remote industrial zones.
                </p>
              </div>
              
              {/* Animated Map HUD Accent */}
              <div className="absolute right-[-5%] bottom-[-5%] w-[55%] h-[60%] opacity-20 pointer-events-none grayscale invert dark:invert-0 group-hover:opacity-30 transition-opacity">
                 <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--primary)_1.5px,transparent_1.5px)] bg-[size:40px_40px]" />
                 <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 border-[3px] border-primary/10 rounded-full" 
                 />
              </div>

              <div className="flex gap-4 relative z-10">
                <span className="px-5 py-2.5 rounded-2xl bg-primary text-black text-[10px] font-black uppercase tracking-widest font-heading shadow-lg shadow-primary/20">
                  GPS ACTIVE
                </span>
                <span className="px-5 py-2.5 rounded-2xl bg-white/5 text-muted-foreground text-[10px] font-black uppercase tracking-widest border border-white/10 font-heading backdrop-blur-md">
                  NEURAL MESH
                </span>
              </div>
            </motion.div>

            {/* 2. Fleet Monitoring (Small) */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-4 glass-card p-10 rounded-[2.2rem] border-white/5 flex flex-col justify-center gap-6"
            >
              <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/20">
                <Database size={28} />
              </div>
              <div>
                <h4 className="text-2xl font-black mb-2 uppercase leading-none">Fleet Monitoring</h4>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider opacity-60">
                  Real-time machine health diagnostics and maintenance alerts.
                </p>
              </div>
            </motion.div>

            {/* 3. Fuel Management (Small) */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-4 glass-card p-10 rounded-[2.2rem] border-white/5 flex flex-col justify-center gap-6"
            >
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Zap size={28} />
              </div>
              <div>
                <h4 className="text-2xl font-black mb-2 uppercase leading-none">Fuel Management</h4>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider opacity-60">
                  Automated consumption tracking and leak detection protocols.
                </p>
              </div>
            </motion.div>

            {/* 4. Universal Control Showcase (Full Width) */}
            <motion.div
                whileHover={{ y: -5 }}
                className="md:col-span-12 md:row-span-2 glass-card p-10 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 rounded-[3rem] border-white/5 relative overflow-hidden"
            >
              <div className="max-w-xl text-center lg:text-left relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest mb-8 border border-primary/20">
                  <Mobile size={13} /> Paperless Workflow
                </div>
                <h3 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.85] uppercase font-heading italic">
                  Complete <br />
                  <span className="text-gradient-yellow">Digital Mesh.</span>
                </h3>
                <p className="text-base md:text-xl text-muted-foreground font-medium leading-relaxed mb-12 opacity-80">
                  Eliminate paperwork with integrated digital reporting. From operator attendance to site logs, manage your entire lifecycle from any device.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <button className="flex items-center gap-3 bg-foreground text-background px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
                    <Apple size={18} fill="currentColor" /> App Store
                  </button>
                  <button className="flex items-center gap-3 border border-white/10 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all">
                    <Download size={18} /> Play Store
                  </button>
                </div>
              </div>

              <div className="relative shrink-0 scale-90 sm:scale-100 lg:scale-110 mt-12 lg:mt-0 lg:mr-10">
                <IPhone3D />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-8 md:-right-12 top-24 bg-card/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shrink-0">
                    <Shield size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verification</div>
                    <div className="text-sm font-black text-white italic uppercase">Session Secured</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Owners List ──────────────────────────────────────── */}
      <OwnersList />

      {/* ── Pricing ──────────────────────────────────────────── */}
      <Pricing />

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-[#080B10] text-white relative overflow-hidden">
        <div className="absolute inset-0 industrial-grid opacity-[0.04]" />
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-7xl font-black tracking-tight mb-3 uppercase font-heading">
                Ready to <span className="text-primary font-heading">Scale?</span>
              </h2>
              <p className="text-base md:text-lg text-slate-400 font-medium max-w-lg">
                Join the network that powers the next generation of industrial growth.
              </p>
            </div>
            <a
              href="#enquiry"
              className="w-full md:w-auto bg-primary hover:bg-amber-600 text-black px-12 py-5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95 whitespace-nowrap text-center"
            >
              Send Enquiry
            </a>
          </div>
        </div>
      </section>

      {/* ── Operator Discovery ───────────────────────────────── */}
      <div className="bg-background">
        <OperatorDiscovery />
      </div>

      {/* ── Enquiry Form ─────────────────────────────────────── */}
      <EnquiryForm />

      {/* ── Trust Ticker ─────────────────────────────────────── */}
      <div className="py-12 md:py-16 border-y border-border bg-background overflow-hidden">
        <div className="flex whitespace-nowrap gap-12 md:gap-20 opacity-[0.15] dark:opacity-[0.08] grayscale animate-scroll">
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className="text-2xl md:text-3xl font-black uppercase tracking-[0.4em]"
            >
              SS-INFRA • SCALE • PRECISION • GROWTH
            </span>
          ))}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <Footer />
    </main>
  );
}

