'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Truck, ChevronDown, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { CATEGORIES, DISTRICTS } from '@/utils/data';

export const HeroSection = () => {
  const [district, setDistrict] = useState('');
  const [subDistrict, setSubDistrict] = useState('');
  const [category, setCategory] = useState('');

  const selectedDistrictData = DISTRICTS.find(d => d.name === district);

  return (
    <section className="relative min-height-[90vh] flex items-center pt-32 pb-20 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-100/50 dark:bg-blue-900/10 rounded-l-[100px] -z-10 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/30 dark:bg-blue-800/10 rounded-full -z-10 blur-3xl" />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary text-sm font-bold mb-6">
              <CheckCircle2 className="w-4 h-4" />
              <span>1000+ Verified Machines Listed</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold font-heading text-slate-900 dark:text-white leading-tight mb-6">
              Find Construction <span className="text-primary">Machines</span> & Operators Near You
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-lg">
              The most trusted directory to find JCB, Poclain, Cranes and more in your district. Direct contact with owners via WhatsApp & Call.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link
                href="/machines"
                className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none hover:scale-105 transition-all flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Find Machines
              </Link>
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                Register Your Machine
              </Link>
            </div>

            {/* Stats Preview */}
            <div className="flex items-center gap-8">
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">500+</p>
                <p className="text-sm text-slate-500">Machine Owners</p>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">35+</p>
                <p className="text-sm text-slate-500">Districts Covered</p>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">1200+</p>
                <p className="text-sm text-slate-500">Active Operators</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Search Box Card */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-blue-50 dark:border-blue-900/20 relative z-10">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Quick Search</h3>
              
              <div className="space-y-4">
                {/* District */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">District</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <select 
                      value={district}
                      onChange={(e) => { setDistrict(e.target.value); setSubDistrict(''); }}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 appearance-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                    >
                      <option value="">Select District</option>
                      {DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>

                {/* Sub-District */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Sub-District / Taluka</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <select 
                      value={subDistrict}
                      onChange={(e) => setSubDistrict(e.target.value)}
                      disabled={!district}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 appearance-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 text-slate-900 dark:text-white"
                    >
                      <option value="">Select Sub-District</option>
                      {selectedDistrictData?.subDistricts.map(sd => (
                        <option key={sd.name} value={sd.name}>{sd.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Machine Category</label>
                  <div className="relative">
                    <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 appearance-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>

                <button className="w-full py-5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-blue-100 dark:shadow-none hover:bg-accent transition-all flex items-center justify-center gap-2 mt-4">
                  <Search className="w-5 h-5" />
                  Search Machines
                </button>
              </div>
            </div>

            {/* Decorative construction visual mockup */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl -z-0" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
