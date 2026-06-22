'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DISTRICTS } from '@/utils/data';
import { MapPin, ChevronRight, Truck, Map as MapIcon, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DistrictsPage() {
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICTS[0].name);

  const activeDistrict = DISTRICTS.find(d => d.name === selectedDistrict);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32">
      <Navbar />

      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Explore by <span className="text-primary">Locations</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Find construction machinery specifically in your district and sub-district.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Districts List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-4">Select District</h3>
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
              {DISTRICTS.map((district) => (
                <button
                  key={district.name}
                  onClick={() => setSelectedDistrict(district.name)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                    selectedDistrict === district.name
                      ? 'bg-blue-50 text-primary dark:bg-blue-900/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      selectedDistrict === district.name ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="font-bold">{district.name}</span>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform ${selectedDistrict === district.name ? 'translate-x-1' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Districts Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 p-10 shadow-sm min-h-full">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                  <MapIcon className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{selectedDistrict}</h2>
                  <p className="text-slate-500">Available Sub-Districts / Talukas</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {activeDistrict?.subDistricts.map((sd, idx) => (
                  <motion.div
                    key={sd.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={`/machines?district=${selectedDistrict}&subDistrict=${sd.name}`}
                      className="group block p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:shadow-xl transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          <Truck className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 group-hover:text-primary transition-colors">
                          VIEW MACHINES
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{sd.name}</h4>
                      <div className="flex items-center justify-between">
                        <p className="text-slate-500 text-sm">{sd.machineCount} machines available</p>
                        <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
