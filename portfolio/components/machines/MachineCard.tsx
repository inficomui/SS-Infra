'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, MapPin, Truck, User, Info, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Machine } from '@/types';

interface MachineCardProps {
  machine: Machine;
}

export const MachineCard: React.FC<MachineCardProps> = ({ machine }) => {
  const whatsappUrl = `https://wa.me/${machine.ownerWhatsapp.replace('+', '')}?text=Hello, I found your ${machine.machineName} listing on the website. I want more details about availability and rent.`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all group flex flex-col h-full"
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden shrink-0">
        <img
          src={machine.images[0]}
          alt={machine.machineName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {machine.verified && (
          <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </div>
        )}
        <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-primary shadow-sm">
          ₹{machine.rentPrice} / {machine.rentType}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
            {machine.machineType}
          </span>
          <div className={`flex items-center gap-1 text-[10px] font-bold ${machine.availability === 'Available' ? 'text-emerald-600' : 'text-red-500'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${machine.availability === 'Available' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            {machine.availability}
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {machine.machineName}
        </h3>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            {machine.village}, {machine.subDistrict}
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <User className="w-3.5 h-3.5 text-primary" />
            Owner: {machine.ownerName}
          </div>
          {machine.operatorName && (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
              <Truck className="w-3.5 h-3.5 text-primary" />
              Operator: {machine.operatorName}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-auto grid grid-cols-2 gap-3">
          <a
            href={`tel:${machine.ownerPhone}`}
            className="flex items-center justify-center gap-2 py-3 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all"
          >
            <Phone className="w-4 h-4" />
            Call
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:text-white transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          <Link
            href={`/machines/${machine.id}`}
            className="col-span-2 flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
          >
            <Info className="w-4 h-4" />
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
