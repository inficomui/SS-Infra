'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DUMMY_MACHINES } from '@/utils/data';
import { 
  Phone, MessageCircle, MapPin, Truck, User, 
  Calendar, Clock, ShieldCheck, Star, ArrowLeft,
  Info, Share2, Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function MachineDetails() {
  const { id } = useParams();
  const router = useRouter();
  const machine = DUMMY_MACHINES.find(m => m.id === id);

  if (!machine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Machine Not Found</h1>
          <button onClick={() => router.back()} className="text-primary font-bold">Go Back</button>
        </div>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${machine.ownerWhatsapp.replace('+', '')}?text=Hello, I found your ${machine.machineName} listing on the website. I want more details about availability and rent.`;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32">
      <Navbar />

      <div className="container mx-auto px-4 pb-20">
        {/* Breadcrumbs & Actions */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Listings
          </button>
          <div className="flex gap-3">
            <button className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-all">
              <Share2 className="w-5 h-5 text-slate-600" />
            </button>
            <button className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-all">
              <Heart className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-12">
            {/* Image Gallery */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm p-4">
              <div className="relative aspect-video rounded-[32px] overflow-hidden mb-4">
                <img 
                  src={machine.images[0]} 
                  alt={machine.machineName}
                  className="w-full h-full object-cover"
                />
                {machine.verified && (
                  <div className="absolute top-6 left-6 bg-emerald-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-xl">
                    <ShieldCheck className="w-5 h-5" />
                    Verified Listing
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                    <img src={machine.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 text-primary font-bold mb-4">
                <Info className="w-5 h-5" />
                <span>Description</span>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">{machine.machineName}</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                {machine.description}
              </p>
              
              <div className="grid sm:grid-cols-2 gap-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Machine Type</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{machine.machineType}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Service Area</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{machine.serviceArea || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Working Hours</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{machine.workingHours || '7 AM - 7 PM'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{machine.village}, {machine.subDistrict}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Actions (Right) */}
          <div className="space-y-8">
            {/* Contact Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl sticky top-32">
              <div className="mb-8">
                <p className="text-slate-500 font-medium mb-1">Rent Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-slate-900 dark:text-white">₹{machine.rentPrice}</span>
                  <span className="text-slate-400 font-bold">/ {machine.rentType}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <a
                  href={`tel:${machine.ownerPhone}`}
                  className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none hover:bg-accent transition-all"
                >
                  <Phone className="w-6 h-6" />
                  Call Now
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 py-5 bg-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-100 dark:shadow-none hover:bg-emerald-600 transition-all"
                >
                  <MessageCircle className="w-6 h-6" />
                  WhatsApp Now
                </a>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contact Persons</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-600">
                        {machine.ownerName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{machine.ownerName}</p>
                        <p className="text-xs text-slate-500">Machine Owner</p>
                      </div>
                    </div>
                    {machine.operatorName && (
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-600">
                          {machine.operatorName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{machine.operatorName}</p>
                          <p className="text-xs text-slate-500">Machine Operator</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Location</h3>
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-[32px] overflow-hidden mb-6 flex items-center justify-center relative group">
                <MapPin className="w-12 h-12 text-slate-300 group-hover:text-primary transition-colors" />
                <p className="absolute bottom-6 text-xs font-bold text-slate-400 uppercase tracking-widest">MAP PREVIEW</p>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-slate-600 dark:text-slate-400"><strong>Village:</strong> {machine.village}</p>
                <p className="text-slate-600 dark:text-slate-400"><strong>Sub-District:</strong> {machine.subDistrict}</p>
                <p className="text-slate-600 dark:text-slate-400"><strong>District:</strong> {machine.district}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
