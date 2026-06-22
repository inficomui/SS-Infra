'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Users, MapPin, CheckCircle } from 'lucide-react';

const STATS = [
  { label: 'Total Machines Listed', value: '1,200+', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Total Operators', value: '850+', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Districts Covered', value: '35+', icon: MapPin, color: 'text-orange-600', bg: 'bg-orange-50' },
  { label: 'Verified Owners', value: '450+', icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
];

export const StatsSection = () => {
  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all group"
            >
              <div className={`w-14 h-14 ${stat.bg} dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{stat.value}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
