'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, User, Search, MapPin, Hammer, LogIn } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Find Machines', href: '/machines' },
  { name: 'Districts', href: '/districts' },
  { name: 'Operators', href: '/operators' },
  { name: 'Register Machine', href: '/auth/register?role=owner' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg border-b border-blue-100 dark:border-blue-900/30 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none group-hover:rotate-12 transition-transform">
            <Hammer className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold font-heading text-slate-900 dark:text-white leading-tight">
              SS-Infra
            </span>
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
              Machinery Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href 
                  ? 'text-primary' 
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <ThemeToggle />
          <Link 
            href="/auth/login"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full shadow-lg shadow-blue-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all"
          >
            Register Now
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-medium p-2 rounded-lg transition-colors ${
                    pathname === link.href 
                      ? 'bg-blue-50 text-primary dark:bg-blue-900/20' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 p-3 text-slate-700 dark:text-slate-200 font-semibold"
                >
                  <LogIn className="w-5 h-5" />
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 bg-primary text-white text-center font-bold rounded-xl shadow-lg"
                >
                  Register Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
