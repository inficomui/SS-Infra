'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Vijay Patil',
    role: 'Contractor',
    content: 'SS-Infra made it so easy to find a JCB in Gangapur. Within minutes, I was talking to the owner and the machine was on site the next morning.',
    rating: 5,
    image: 'https://i.pravatar.cc/150?u=1'
  },
  {
    name: 'Anil Deshmukh',
    role: 'Machine Owner',
    content: 'Since listing my crane on this platform, I have seen a 40% increase in bookings. The WhatsApp integration is a game changer for my business.',
    rating: 5,
    image: 'https://i.pravatar.cc/150?u=2'
  },
  {
    name: 'Suresh Kumar',
    role: 'Site Manager',
    content: 'The district-wise filtering is very accurate. I found a reliable Poclain operator in Pune district within 5 minutes. Highly recommended!',
    rating: 5,
    image: 'https://i.pravatar.cc/150?u=3'
  }
];

export const Testimonials = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 dark:text-white mb-6">
            Trusted by <span className="text-primary">Professionals</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            See what contractors and machine owners are saying about our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] relative group"
            >
              <Quote className="absolute top-8 right-8 w-12 h-12 text-blue-100 dark:text-blue-900/20 group-hover:text-primary/20 transition-colors" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-lg text-slate-700 dark:text-slate-300 mb-8 leading-relaxed italic">
                "{t.content}"
              </p>

              <div className="flex items-center gap-4">
                <img src={t.image} alt={t.name} className="w-14 h-14 rounded-full border-2 border-white dark:border-slate-700" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{t.name}</h4>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
