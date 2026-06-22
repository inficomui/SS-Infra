'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { User, MapPin, Briefcase, Star, Phone, MessageCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const OPERATORS = [
  {
    id: '1',
    name: 'Amit Kumar',
    photo: 'https://i.pravatar.cc/150?u=a',
    skills: ['JCB', 'Excavator'],
    experience: '8 Years',
    district: 'Aurangabad',
    subDistrict: 'Gangapur',
    phone: '+919876543211',
    whatsapp: '+919876543211',
    rating: 4.9,
    verified: true
  },
  {
    id: '2',
    name: 'Vijay Singh',
    photo: 'https://i.pravatar.cc/150?u=b',
    skills: ['Poclain', 'Dozer'],
    experience: '12 Years',
    district: 'Pune',
    subDistrict: 'Haveli',
    phone: '+919876543221',
    whatsapp: '+919876543221',
    rating: 4.7,
    verified: true
  }
];

export default function OperatorsDirectory() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32">
      <Navbar />

      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Find Professional <span className="text-primary">Operators</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Connecting projects with experienced and verified machine operators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {OPERATORS.map((op, idx) => (
            <motion.div
              key={op.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all group"
            >
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <img src={op.photo} alt={op.name} className="w-20 h-20 rounded-3xl object-cover border-4 border-slate-50 dark:border-slate-800 shadow-lg" />
                  <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-xl shadow-lg">
                    <Star className="w-4 h-4 fill-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{op.name}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    {op.subDistrict}, {op.district}
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Experience</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{op.experience}</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {op.skills.map(skill => (
                    <span key={skill} className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-primary text-xs font-bold rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <a
                  href={`tel:${op.phone}`}
                  className="flex items-center justify-center gap-2 py-4 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-2xl font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  <Phone className="w-5 h-5" />
                  Call
                </a>
                <a
                  href={`https://wa.me/${op.whatsapp.replace('+', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
