'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MachineCard } from '@/components/machines/MachineCard';
import { CATEGORIES, DISTRICTS, DUMMY_MACHINES } from '@/utils/data';
import { Search, Filter, SlidersHorizontal, MapPin, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MachineryListing() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSubDistrict, setSelectedSubDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const filteredMachines = DUMMY_MACHINES.filter(machine => {
    const matchesSearch = machine.machineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         machine.village.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = !selectedDistrict || machine.district === selectedDistrict;
    const matchesSubDistrict = !selectedSubDistrict || machine.subDistrict === selectedSubDistrict;
    const matchesCategory = !selectedCategory || machine.machineType === selectedCategory;
    
    return matchesSearch && matchesDistrict && matchesSubDistrict && matchesCategory;
  });

  const selectedDistrictData = DISTRICTS.find(d => d.name === selectedDistrict);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32">
      <Navbar />

      <div className="container mx-auto px-4 pb-20">
        {/* Header & Global Search */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
            Browse All <span className="text-primary">Machinery</span>
          </h1>
          
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by machine name, location, or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-4 focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white shadow-sm"
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold"
            >
              <Filter className="w-5 h-5 text-primary" />
              Filters
            </button>
            <div className="relative min-w-[200px]">
              <SlidersHorizontal className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-10 appearance-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-700 dark:text-slate-200"
              >
                <option value="latest">Latest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm sticky top-32">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Filters</h3>
                <button 
                  onClick={() => {
                    setSelectedDistrict('');
                    setSelectedSubDistrict('');
                    setSelectedCategory('');
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Reset All
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">District</label>
                  <select 
                    value={selectedDistrict}
                    onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedSubDistrict(''); }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">All Districts</option>
                    {DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Sub-District</label>
                  <select 
                    value={selectedSubDistrict}
                    onChange={(e) => setSelectedSubDistrict(e.target.value)}
                    disabled={!selectedDistrict}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                  >
                    <option value="">All Sub-Districts</option>
                    {selectedDistrictData?.subDistricts.map(sd => (
                      <option key={sd.name} value={sd.name}>{sd.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Category</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {CATEGORIES.map(c => (
                      <label key={c} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedCategory === c}
                          onChange={() => setSelectedCategory(selectedCategory === c ? '' : c)}
                          className="w-5 h-5 rounded-md border-slate-300 text-primary focus:ring-primary transition-all"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">
                          {c}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Availability</label>
                  <div className="flex flex-wrap gap-2">
                    {['Available', 'Busy'].map(status => (
                      <button
                        key={status}
                        className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:border-primary hover:text-primary transition-all"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-8">
              <p className="text-slate-500 dark:text-slate-400">
                Showing <span className="font-bold text-slate-900 dark:text-white">{filteredMachines.length}</span> machines
              </p>
            </div>

            {filteredMachines.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMachines.map(machine => (
                  <MachineCard key={machine.id} machine={machine} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-20 text-center border border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Machines Found</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Try adjusting your filters or search query to find what you're looking for.
                </p>
                <button 
                  onClick={() => {
                    setSelectedDistrict('');
                    setSelectedSubDistrict('');
                    setSelectedCategory('');
                    setSearchQuery('');
                  }}
                  className="mt-8 px-8 py-3 bg-primary text-white font-bold rounded-xl"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-slate-950 z-[70] shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Filters</h3>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Reuse sidebar content or extract it to a component */}
              <div className="space-y-8">
                {/* (Same filter content as above) */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">District</label>
                  <select 
                    value={selectedDistrict}
                    onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedSubDistrict(''); }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-4 px-4 focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">All Districts</option>
                    {DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                {/* ... other mobile filters ... */}
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl mt-8"
                >
                  Show {filteredMachines.length} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
