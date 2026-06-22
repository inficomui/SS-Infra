'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Hammer, Mail, Lock, User, Phone, Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const ROLES = [
  { id: 'user', label: 'Regular User', icon: User, desc: 'Looking to hire machines' },
  { id: 'owner', label: 'Machine Owner', icon: Hammer, desc: 'List your machines for rent' },
  { id: 'operator', label: 'Operator / Driver', icon: Briefcase, desc: 'Find work as an operator' },
];

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState('user');

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 py-20 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8 px-4">
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
          className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800"
        >
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Create Account</h1>
            <p className="text-slate-500">Join the largest construction machinery network.</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-6 rounded-3xl border-2 transition-all text-left relative group ${
                  selectedRole === role.id
                    ? 'border-primary bg-blue-50 dark:bg-blue-900/10'
                    : 'border-slate-100 dark:border-slate-800 hover:border-blue-200'
                }`}
              >
                {selectedRole === role.id && (
                  <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-primary" />
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  selectedRole === role.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  <role.icon className="w-6 h-6" />
                </div>
                <h3 className={`font-bold mb-1 ${selectedRole === role.id ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                  {role.label}
                </h3>
                <p className="text-xs text-slate-500">{role.desc}</p>
              </button>
            ))}
          </div>

          <form className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="name@email.com"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="tel"
                  placeholder="+91 00000 00000"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button className="w-full py-5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-blue-100 dark:shadow-none hover:bg-accent transition-all flex items-center justify-center gap-2">
                Register as {ROLES.find(r => r.id === selectedRole)?.label}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="mt-10 text-center border-t border-slate-100 dark:border-slate-800 pt-10">
            <p className="text-slate-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary font-bold hover:underline">Sign In Instead</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
