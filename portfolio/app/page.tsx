"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { OwnersList } from "@/components/home/OwnersList";
import { OperatorDiscovery } from "@/components/home/OperatorDiscovery";
import { NetworkDirectory } from "@/components/home/NetworkDirectory";
import { EnquiryForm } from "@/components/home/EnquiryForm";
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
    <main className="min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--fg)]">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <Hero />

      {/* ── Network Directory ────────────────────────────────── */}
      <NetworkDirectory />

      {/* ── Features Bento Grid ──────────────────────────────── */}
      <section
        id="features"
        className="py-28 bg-[var(--bg-muted)] border-t border-[var(--border)]"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center mb-20">
            <div className="w-12 h-0.5 bg-amber-500 mb-6" />
            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.88] mb-6 max-w-3xl">
              Technological{" "}
              <span className="text-[var(--fg-muted)]">Backbone</span> of{" "}
              <br />
              <span className="gradient-text">Infrastructure.</span>
            </h2>
            <p className="text-lg text-[var(--fg-muted)] font-medium max-w-xl">
              Enterprise-grade tools built for the demands of modern infrastructure management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Big Card – Security */}
            <motion.div
              whileHover={{ scale: 0.985 }}
              className="md:col-span-2 md:row-span-2 bento-card p-10 flex flex-col justify-between min-h-[360px]"
            >
              <div>
                <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center text-black mb-8 shadow-lg shadow-amber-500/20">
                  <Shield size={28} />
                </div>
                <h3 className="text-3xl font-black tracking-tight mb-4">
                  Unrivaled Security Protocols
                </h3>
                <p className="text-base text-[var(--fg-muted)] font-medium leading-relaxed max-w-sm">
                  Every machine log and personnel session is encrypted via industrial-grade AES-256 protocols. Your data integrity is our operational priority.
                </p>
              </div>
              <div className="flex gap-3 mt-8">
                <span className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest">
                  SSL Secure
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest">
                  End-to-End
                </span>
              </div>
            </motion.div>

            {/* Small Card – DB */}
            <div className="md:col-span-2 bento-card p-8 flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                <Database size={28} />
              </div>
              <div>
                <h4 className="text-xl font-black mb-1">Scalable DB</h4>
                <p className="text-sm text-[var(--fg-muted)] font-semibold uppercase tracking-wider">
                  High-Concurrency Engine
                </p>
              </div>
            </div>

            {/* Small Card – Neural Mesh */}
            <div className="md:col-span-2 bento-card p-8 flex items-center gap-6">
              <div className="w-16 h-16 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center shrink-0">
                <Network size={28} />
              </div>
              <div>
                <h4 className="text-xl font-black mb-1">Neural Mesh</h4>
                <p className="text-sm text-[var(--fg-muted)] font-semibold uppercase tracking-wider">
                  Distributed Network Ops
                </p>
              </div>
            </div>

            {/* Wide Card – Mobile Showcase */}
            <div className="md:col-span-4 bento-card p-10 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-visible">
              <div className="max-w-lg text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--accent-dim)] text-amber-600 dark:text-amber-400 rounded-lg text-[11px] font-black uppercase tracking-widest mb-6">
                  <Mobile size={13} /> Ecosystem Mobility
                </div>
                <h3 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[0.9]">
                  Universal <br />
                  <span className="gradient-text">Fleet Control.</span>
                </h3>
                <p className="text-lg text-[var(--fg-muted)] font-medium leading-relaxed mb-10">
                  Control your entire infrastructure fleet from any device, anywhere. Real-time updates push directly to your operators' fingertips.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <button className="flex items-center gap-2.5 bg-[var(--fg)] text-[var(--bg)] px-7 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all">
                    <Apple size={18} /> App Store
                  </button>
                  <button className="flex items-center gap-2.5 border border-[var(--border)] px-7 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[var(--bg-muted)] transition-all">
                    <Download size={18} /> Play Store
                  </button>
                </div>
              </div>

              <div className="relative shrink-0 lg:scale-105">
                <IPhone3D />
                {/* Floating notification badge */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  className="absolute -right-8 top-24 bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl shadow-xl z-50 hidden md:flex items-center gap-3"
                >
                  <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center text-white shrink-0">
                    <Zap size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)]">Live Alert</div>
                    <div className="text-sm font-black">Machine JCB-02 Active</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Owners List ──────────────────────────────────────── */}
      <OwnersList />

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="py-24 bg-zinc-950 dark:bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-[0.04]" />
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left">
              <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-3">
                Ready to <span className="text-amber-500">Scale?</span>
              </h2>
              <p className="text-lg text-zinc-400 font-medium max-w-lg">
                Join the network that powers the next generation of industrial growth.
              </p>
            </div>
            <a
              href="#enquiry"
              className="bg-amber-500 hover:bg-amber-600 text-black px-12 py-5 rounded-xl text-base font-black uppercase tracking-widest transition-all shadow-2xl shadow-amber-500/20 active:scale-95 whitespace-nowrap"
            >
              Send Enquiry
            </a>
          </div>
        </div>
      </section>

      {/* ── Operator Discovery ───────────────────────────────── */}
      <div className="bg-[var(--bg)]">
        <OperatorDiscovery />
      </div>

      {/* ── Enquiry Form ─────────────────────────────────────── */}
      <EnquiryForm />

      {/* ── Trust Ticker ─────────────────────────────────────── */}
      <div className="py-16 border-y border-[var(--border)] bg-[var(--bg)] overflow-hidden">
        <div className="flex whitespace-nowrap gap-20 opacity-[0.15] dark:opacity-[0.08] grayscale animate-scroll">
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className="text-3xl font-black uppercase tracking-[0.4em]"
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
