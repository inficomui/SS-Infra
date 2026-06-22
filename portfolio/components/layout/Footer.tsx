'use client';

import React from 'react';
import Link from 'next/link';
import { Hammer, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from 'lucide-react';

const FOOTER_LINKS = [
  {
    title: 'Platform',
    links: [
      { name: 'Find Machines', href: '/machines' },
      { name: 'Districts', href: '/districts' },
      { name: 'Operators', href: '/operators' },
      { name: 'Categories', href: '/#categories' },
    ],
  },
  {
    title: 'For Owners',
    links: [
      { name: 'Register Machine', href: '/auth/register?role=owner' },
      { name: 'Owner Dashboard', href: '/dashboard/owner' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Success Stories', href: '/stories' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
                <Hammer className="text-white w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-heading text-slate-900 dark:text-white leading-tight">
                  SS-Infra
                </span>
                <span className="text-[12px] uppercase tracking-widest text-primary font-bold">
                  Machinery Platform
                </span>
              </div>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm leading-relaxed">
              India's leading directory for construction machinery, operators, and drivers. Connecting projects with the right equipment since 2024.
            </p>
            <div className="flex items-center gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition-all"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h4 className="text-slate-900 dark:text-white font-bold mb-6">{group.title}</h4>
              <ul className="space-y-4">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm flex items-center group"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:row items-center justify-between gap-6">
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            © 2026 SS-Infra Platform. All rights reserved. Designed for Construction Excellence.
          </p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Phone className="w-4 h-4 text-primary" />
              <span>+91 123 456 7890</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Mail className="w-4 h-4 text-primary" />
              <span>support@ssinfra.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
