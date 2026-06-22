'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Headphones, Map, Award, CheckCircle2 } from 'lucide-react';

const REASONS = [
  {
    title: 'Verified Listings',
    desc: 'Every machine and owner is verified by our team to ensure reliability.',
    icon: ShieldCheck,
  },
  {
    title: 'Instant Contact',
    desc: 'No middleman. Contact owners directly via Call or WhatsApp.',
    icon: Zap,
  },
  {
    title: 'District-Wise Search',
    desc: 'Find machines specifically in your local area and sub-districts.',
    icon: Map,
  },
  {
    title: '24/7 Support',
    desc: 'Our support team is always available to help you find the right machine.',
    icon: Headphones,
  },
  {
    title: 'Quality Equipment',
    desc: 'Access to modern, well-maintained machinery for better productivity.',
    icon: Award,
  },
  {
    title: 'Trusted Platform',
    desc: 'Join a community of 5000+ satisfied users and providers.',
    icon: CheckCircle2,
  }
];

export const WhyChooseUs = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 dark:text-white mb-6">
            Why Choose <span className="text-primary">SS-Infra?</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We are revolutionizing how the construction industry connects with resources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {REASONS.map((reason, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all group"
            >
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                <reason.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{reason.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{reason.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
