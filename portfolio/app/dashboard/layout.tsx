'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Truck, Users, MapPin, 
  Settings, LogOut, Menu, X, Bell, Search,
  PlusCircle, Hammer
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Machines', href: '/dashboard/owner/machines', icon: Truck },
  { name: 'Enquiries', href: '/dashboard/enquiries', icon: Bell },
  { name: 'Operators', href: '/dashboard/operators', icon: Users },
  { name: 'Profile', href: '/dashboard/profile', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-72' : 'w-20'
        } fixed lg:sticky top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-300 z-50 flex flex-col`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className={`flex items-center gap-2 ${!isSidebarOpen && 'hidden'}`}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Hammer className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold font-heading text-slate-900 dark:text-white">SS-Infra</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            {isSidebarOpen ? <X className="w-5 h-5 lg:hidden" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                pathname === item.href
                  ? 'bg-primary text-white shadow-lg shadow-blue-100 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-6 h-6 shrink-0" />
              <span className={`font-bold transition-opacity ${!isSidebarOpen && 'opacity-0 hidden'}`}>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button className="w-full flex items-center gap-4 p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all">
            <LogOut className="w-6 h-6" />
            <span className={`font-bold ${!isSidebarOpen && 'hidden'}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Top Header */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search in dashboard..."
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2.5 pl-12 pr-4 text-sm"
            />
          </div>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Rahul Sharma</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Machine Owner</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full border-2 border-primary" />
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
