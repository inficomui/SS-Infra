'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, Star, MapPin } from 'lucide-react';
import Link from 'next/link';
import { DUMMY_MACHINES } from '@/utils/data';

export const FeaturedMachinery = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 dark:text-white mb-6">
              Featured <span className="text-primary">Machinery</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Handpicked high-quality machines from verified owners across major districts.
            </p>
          </div>
          <Link
            href="/machines"
            className="group flex items-center gap-2 text-primary font-bold hover:underline"
          >
            View All Machines
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DUMMY_MACHINES.map((machine, idx) => (
            <motion.div
              key={machine.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all group"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={machine.images[0]}
                  alt={machine.machineName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-primary flex items-center gap-2">
                  <Star className="w-3 h-3 fill-primary" />
                  Featured
                </div>
                <div className="absolute bottom-4 right-4 bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold">
                  ₹{machine.rentPrice} / {machine.rentType}
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{machine.machineType}</span>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Available
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                  {machine.machineName}
                </h3>
                
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-6">
                  <MapPin className="w-4 h-4" />
                  {machine.village}, {machine.subDistrict}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-600">
                      {machine.ownerName[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400">OWNER</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{machine.ownerName}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${machine.ownerPhone}`}
                      className="p-3 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
                    >
                      <Phone className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
