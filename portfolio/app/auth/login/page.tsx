'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Hammer, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Hammer className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold font-heading text-slate-900 dark:text-white">SS-Infra</span>
          </Link>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800"
        >
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Welcome Back</h1>
            <p className="text-slate-500">Sign in to manage your construction resources.</p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Remember me</span>
              </label>
              <Link href="/auth/forgot" className="text-primary font-bold hover:underline">Forgot password?</Link>
            </div>

            <button className="w-full py-5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-blue-100 dark:shadow-none hover:bg-accent transition-all flex items-center justify-center gap-2">
              Sign In
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-primary font-bold hover:underline">Create Account</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
