'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Truck, MapPin, ShieldCheck, 
  Search, Filter, MoreVertical, CheckCircle, XCircle
} from 'lucide-react';

const ADMIN_STATS = [
  { label: 'Total Users', value: '5,240', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Active Machines', value: '1,120', icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Pending Verifications', value: '42', icon: ShieldCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
  { label: 'Active Districts', value: '35', icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Admin Control Center</h1>
          <p className="text-slate-500">Global overview and management of the SS-Infra platform.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ADMIN_STATS.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm"
          >
            <div className={`w-12 h-12 ${stat.bg} dark:bg-slate-800 rounded-xl flex items-center justify-center mb-6`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Listings Management */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Machine Listings</h3>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Search listings..." className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2 px-10 text-sm" />
            </div>
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl">
              <Filter className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Machine</th>
                <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Owner</th>
                <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Location</th>
                <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { name: 'JCB 3DX Eco', owner: 'Rahul Sharma', location: 'Gangapur, Aurangabad', status: 'Pending' },
                { name: 'Tata Hitachi ZAXIS', owner: 'Suresh Patil', location: 'Haveli, Pune', status: 'Approved' },
                { name: 'Poclain 210', owner: 'Amit Singh', location: 'Sillod, Aurangabad', status: 'Pending' }
              ].map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                  <td className="p-6">
                    <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-slate-500">Added 1 day ago</p>
                  </td>
                  <td className="p-6 text-sm text-slate-600 dark:text-slate-400">{item.owner}</td>
                  <td className="p-6 text-sm text-slate-600 dark:text-slate-400">{item.location}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-all" title="Approve">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all" title="Reject">
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
