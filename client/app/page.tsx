'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, Variants } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/redux/hooks'
import { selectIsAuthenticated } from '@/redux/features/authSlice'
import {
  Shield,
  ArrowRight,
  Layers,
  Zap,
  BarChart3,
  Users,
  Lock,
  Globe,
  Settings,
  ChevronRight
} from 'lucide-react'
import { ModeToggle } from '@/components/ModeToggle'
import clsx from 'clsx'

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

export default function Home() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground font-sans">

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-yellow-600 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center transform rotate-3 hover:rotate-0 transition-all duration-300">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">SS <span className="text-primary italic">Infra</span></h1>
              <span className="text-[10px] text-muted-foreground font-bold tracking-[0.2em] uppercase opacity-80">Official Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-muted-foreground mr-4">
              <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
              <Link href="#architecture" className="hover:text-primary transition-colors">Architecture</Link>
            </div>

            <ModeToggle />

            <div className="h-8 w-px bg-border mx-1"></div>

            {isAuthenticated ? (
              <Link href="/dashboard" className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30">
                <span className="relative z-10 flex items-center gap-2">
                  Console <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ) : (
              <Link href="/login" className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold border-2 border-primary text-foreground rounded-lg overflow-hidden transition-all hover:bg-primary hover:text-primary-foreground">
                <span className="relative z-10 flex items-center gap-2">
                  Sign In <Lock className="h-4 w-4" />
                </span>
              </Link>
            )}
          </div>
        </div>
      </motion.nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex items-center justify-center min-h-screen">
          {/* Abstract Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 dark:opacity-20 pointer-events-none"></div>
          <motion.div style={{ y }} className="absolute right-0 top-1/4 w-[300px] h-[300px] bg-yellow-600/20 rounded-full blur-[80px] pointer-events-none"></motion.div>
          <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, 100]) }} className="absolute left-0 bottom-1/4 w-[400px] h-[400px] bg-zinc-500/10 rounded-full blur-[100px] pointer-events-none"></motion.div>

          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-4xl mx-auto"
            >
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-sm font-semibold text-muted-foreground mb-8 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                SS Infra Platform v2.0 is Live
              </motion.div>

              <motion.h1 variants={fadeIn} className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
                Next-Gen <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-600">
                  Infrastructure
                </span> Control
              </motion.h1>

              <motion.p variants={fadeIn} className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                Empower your operations with enterprise-grade management, real-time analytics, and secure administrative controls.
              </motion.p>

              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {isAuthenticated ? (
                  <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground text-lg font-bold rounded-xl hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                    <Layers className="h-5 w-5" />
                    Enter Dashboard
                  </Link>
                ) : (
                  <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground text-lg font-bold rounded-xl hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                    <Lock className="h-5 w-5" />
                    Secure Login
                  </Link>
                )}
                <Link href="#features" className="w-full sm:w-auto px-8 py-4 bg-muted hover:bg-muted/80 text-foreground text-lg font-bold rounded-xl transition-all flex items-center justify-center gap-3 border border-border/50">
                  Explore Features
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Floating Dashboard Preview (Imaginary) */}
        <section className="relative -mt-20 md:-mt-32 pb-32 z-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-2xl p-2 shadow-2xl overflow-hidden glassmorphism"
            >
              <div className="rounded-xl overflow-hidden border border-border/30 bg-background relative aspect-[16/9] flex items-center justify-center">
                {/* Mock UI elements overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-background"></div>
                <div className="absolute top-4 left-4 right-4 h-12 border-b border-border/50 flex items-center px-4 gap-4">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/80"></div><div className="w-3 h-3 rounded-full bg-yellow-500/80"></div><div className="w-3 h-3 rounded-full bg-green-500/80"></div></div>
                  <div className="h-6 w-full max-w-sm bg-muted rounded-md opacity-50"></div>
                </div>
                <div className="absolute top-20 left-4 bottom-4 w-48 border-r border-border/50 hidden md:flex flex-col gap-2 pr-4">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-8 w-full bg-muted/60 rounded-md"></div>)}
                </div>
                <div className="absolute top-20 md:left-56 left-4 right-4 bottom-4 flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="h-24 flex-1 bg-primary/10 rounded-xl border border-primary/20"></div>
                    <div className="h-24 flex-1 bg-muted/40 rounded-xl border border-border/50"></div>
                    <div className="h-24 flex-1 bg-muted/40 rounded-xl border border-border/50 hidden lg:block"></div>
                  </div>
                  <div className="flex-1 bg-card rounded-xl border border-border/50 p-4">
                    <div className="h-8 w-1/3 bg-muted rounded-md mb-4"></div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map(i => <div key={i} className={`h-12 w-full bg-muted/30 rounded-lg ${i % 2 === 0 ? 'opacity-70' : ''}`}></div>)}
                    </div>
                  </div>
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <Shield className="h-16 w-16 text-primary mb-4 opacity-50" />
                  <span className="text-xl font-bold text-muted-foreground/50">SS Infra Admin Architecture</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-muted/30 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-600">Capabilities</span></h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to run, monitor, and scale your infrastructure operations from a single unified portal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: "Enterprise Security", desc: "Bank-grade encryption and multi-tier access protocols to keep your operational data perfectly safe." },
                { icon: BarChart3, title: "Real-time Analytics", desc: "Deep operational insights with live metrics, transaction histories, and actionable reporting dashboards." },
                { icon: Users, title: "Role-based Access", desc: "Granular control over operator, owner, and administrator permissions with comprehensive audit logs." },
                { icon: Zap, title: "High Performance", desc: "Built on Next.js 15, enjoying sub-millisecond route transitions and instant data synchronization." },
                { icon: Lock, title: "Secure Transactions", desc: "Automated subscription monitoring and withdrawal verifications via robust backend integrations." },
                { icon: Globe, title: "Global Accessibility", desc: "Responsive, locale-aware interface designed to work flawlessly across all devices and regions." }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-card border border-border p-8 rounded-2xl hover:border-primary/50 transition-colors shadow-sm hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                    <feature.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5"></div>
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl md:text-6xl font-black mb-6">Ready to elevate your <br /> management flow?</h2>
            <p className="text-xl text-muted-foreground mb-10">Join the administrative echelon. Access the SS Infra console today.</p>

            <Link href={isAuthenticated ? "/dashboard" : "/login"} className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground text-lg font-bold rounded-xl hover:scale-105 transition-all shadow-xl shadow-primary/20">
              {isAuthenticated ? "Go to Dashboard" : "Authenticate Now"}
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold tracking-tight">SS Infra Platform</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SS Infra Operations. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">System Status</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
