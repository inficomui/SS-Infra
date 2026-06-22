'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, Users, Bell, ArrowUpRight, 
  TrendingUp, MessageCircle, Phone, Star,
  PlusCircle
} from 'lucide-react';

const STATS = [
  { label: 'Total Machines', value: '3', icon: Truck, trend: '+12%', color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'New Enquiries', value: '12', icon: Bell, trend: '+5%', color: 'text-orange-600', bg: 'bg-orange-50' },
  { label: 'WhatsApp Clicks', value: '45', icon: MessageCircle, trend: '+18%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Rating', value: '4.8', icon: Star, trend: 'stable', color: 'text-purple-600', bg: 'bg-purple-50' },
];

export default function OwnerDashboard() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Owner Dashboard</h1>
          <p className="text-slate-500">Welcome back, Rahul. Here's what's happening today.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-xl hover:scale-105 transition-all">
          <PlusCircle className="w-5 h-5" />
          Add New Machine
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 ${stat.bg} dark:bg-slate-800 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Enquiries */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Enquiries</h3>
            <button className="text-sm font-bold text-primary hover:underline">View All</button>
          </div>
          
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold">V</div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Vijay Patil</h4>
                    <p className="text-xs text-slate-500">Interested in JCB 3DX • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 bg-blue-50 text-primary rounded-xl hover:bg-primary hover:text-white transition-all">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Machines List */}
        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">My Machines</h3>
          <div className="space-y-6">
            {[
              { name: 'JCB 3DX Eco', status: 'Available', type: 'JCB' },
              { name: 'Tata Hitachi', status: 'Busy', type: 'Excavator' }
            ].map((m, i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.type}</span>
                  <div className={`flex items-center gap-1 text-[10px] font-bold ${m.status === 'Available' ? 'text-emerald-600' : 'text-orange-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'Available' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                    {m.status}
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">{m.name}</h4>
                <div className="flex gap-2">
                  <button className="flex-grow py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all">Edit</button>
                  <button className="flex-grow py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all">Manage</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
