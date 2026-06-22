'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Phone, Truck, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    title: 'Search Machine',
    desc: 'Select your district, sub-district and the type of machine you need.',
    icon: Search,
    color: 'bg-blue-500'
  },
  {
    title: 'Contact Owner',
    desc: 'Get direct contact details and call or WhatsApp them instantly.',
    icon: Phone,
    color: 'bg-emerald-500'
  },
  {
    title: 'Get Work Done',
    desc: 'Hire verified machines and professional operators for your project.',
    icon: Truck,
    color: 'bg-orange-500'
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 dark:text-white mb-6">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Hiring construction machinery has never been this simple and transparent.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {STEPS.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative bg-white dark:bg-slate-900 p-8 flex flex-col items-center text-center"
              >
                <div className={`w-20 h-20 ${step.color} text-white rounded-[32px] flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-10 h-10" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-900 rounded-full flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
