// "use client";

// import { motion } from "framer-motion";

// export function IPhone3D({ children }: { children?: React.ReactNode }) {
//     return (
//         <div className="iphone-container py-20 flex justify-center items-center">
//             <motion.div
//                 initial={{ rotateY: -30, rotateX: 10, y: 50, opacity: 0 }}
//                 whileInView={{ rotateY: -20, rotateX: 10, y: 0, opacity: 1 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
//                 className="iphone-x group"
//             >
//                 <div className="iphone-screen">
//                     <div className="iphone-notch" />
//                     {/* Fallback Mobile App UI Mockup */}
//                     <div className="w-full h-full bg-linear-to-b from-industrial-black to-industrial-gray p-6 pt-12">
//                         <div className="flex justify-between items-center mb-8">
//                             <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-black">
//                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                                     <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
//                                 </svg>
//                             </div>
//                             <div className="w-8 h-8 rounded-full bg-zinc-800" />
//                         </div>

//                         <div className="space-y-4 mb-8">
//                             <div className="h-6 w-3/4 bg-zinc-800 rounded-lg animate-pulse" />
//                             <div className="h-4 w-1/2 bg-zinc-800 rounded-lg animate-pulse" />
//                         </div>

//                         <div className="grid grid-cols-2 gap-3 mb-8">
//                             {[1, 2, 3, 4].map(i => (
//                                 <div key={i} className="h-24 bg-zinc-900 border border-zinc-800 rounded-lg p-3">
//                                     <div className="w-8 h-8 rounded-lg bg-amber-500/10 mb-2" />
//                                     <div className="h-2 w-10 bg-zinc-800 rounded-sm" />
//                                 </div>
//                             ))}
//                         </div>

//                         <div className="h-40 bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-hidden relative">
//                             <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/73.8567,18.5204,12,0/300x400?access_token=pk.ey')] bg-cover opacity-50" />
//                             <div className="relative z-10 w-4 h-4 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,1)]" />
//                         </div>
//                     </div>
//                     {children}
//                 </div>

//                 {/* Reflection */}
//                 <div className="absolute inset-0 pointer-events-none bg-linear-to-tr from-white/5 to-transparent rounded-[40px]" />
//             </motion.div>
//         </div>
//     );
// }

































"use client";

import { motion } from "framer-motion";
import { Signal, Battery, Wifi, MapPin, TrendingUp, Layers } from "lucide-react";

export function IPhone3D({ children }: { children?: React.ReactNode }) {
    return (
        <div className="iphone-container py-24 flex justify-center items-center bg-transparent perspective-2000">
            <motion.div
                initial={{ rotateY: -25, rotateX: 12, y: 60, opacity: 0 }}
                whileInView={{ rotateY: -15, rotateX: 8, y: 0, opacity: 1 }}
                whileHover={{ rotateY: -5, rotateX: 5, scale: 1.02 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative group"
            >
                {/* Physical Body of the Phone */}
                <div className="relative w-[300px] h-[600px] bg-zinc-800 dark:bg-zinc-900 rounded-[3rem] p-3 border-[6px] border-zinc-700/50 shadow-[20px_40px_80px_rgba(0,0,0,0.3)] backdrop-blur-md">

                    {/* Hardware Buttons */}
                    <div className="absolute -left-[7px] top-24 w-1 h-12 bg-zinc-600 rounded-l-md" /> {/* Volume Up */}
                    <div className="absolute -left-[7px] top-40 w-1 h-12 bg-zinc-600 rounded-l-md" /> {/* Volume Down */}
                    <div className="absolute -right-[7px] top-32 w-1 h-20 bg-zinc-600 rounded-r-md" /> {/* Power */}

                    {/* Screen Outer Border */}
                    <div className="w-full h-full bg-black rounded-[2.2rem] overflow-hidden relative border-2 border-zinc-800/50 shadow-inner">

                        {/* Notch / Dynamic Island */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black z-50 rounded-b-2xl flex items-center justify-center gap-2 px-4">
                            <div className="w-2 h-2 rounded-full bg-zinc-800" />
                            <div className="w-10 h-1 bg-zinc-800 rounded-full" />
                        </div>

                        {/* Status Bar */}
                        <div className="absolute top-0 w-full px-8 pt-3 flex justify-between items-center z-40 text-white/90">
                            <span className="text-[10px] font-bold">9:41</span>
                            <div className="flex gap-1.5">
                                <Signal size={10} />
                                <Wifi size={10} />
                                <Battery size={10} className="rotate-90" />
                            </div>
                        </div>

                        {/* Mobile App UI */}
                        <div className="w-full h-full bg-zinc-50 dark:bg-zinc-950 p-6 pt-12 flex flex-col gap-5">
                            {/* App Header */}
                            <div className="flex justify-between items-center mt-4">
                                <div>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">Fleet Dashboard</p>
                                    <h4 className="text-sm font-black text-zinc-900 dark:text-white">Active Units</h4>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
                                    <Layers size={14} />
                                </div>
                            </div>

                            {/* Mini Stats Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Uptime", val: "99%", icon: <TrendingUp size={12} /> },
                                    { label: "Active", val: "142", icon: <MapPin size={12} /> }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-2xl">
                                        <div className="text-amber-500 mb-1">{stat.icon}</div>
                                        <div className="text-xs font-black dark:text-white">{stat.val}</div>
                                        <div className="text-[9px] text-zinc-400 font-bold">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Realistic Map Component */}
                            <div className="flex-1 bg-zinc-200 dark:bg-zinc-900 rounded-[2rem] overflow-hidden relative group/map border border-zinc-200 dark:border-zinc-800 shadow-inner">
                                {/* Simulated Map Pattern */}
                                <div className="absolute inset-0 opacity-40 dark:opacity-20 bg-[radial-gradient(#808080_1px,transparent_1px)] [background-size:16px_16px]" />

                                {/* Pulsing User Location */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <span className="relative flex h-4 w-4">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 shadow-lg shadow-amber-500/50 border-2 border-white"></span>
                                    </span>
                                </div>

                                {/* Floating Map Controls */}
                                <div className="absolute bottom-3 right-3 flex flex-col gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur shadow-sm flex items-center justify-center text-[14px] font-bold">+</div>
                                    <div className="w-8 h-8 rounded-xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur shadow-sm flex items-center justify-center text-[14px] font-bold">-</div>
                                </div>
                            </div>

                            {/* Tab Bar */}
                            <div className="h-14 bg-white dark:bg-zinc-900 -mx-6 -mb-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-around items-center px-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`w-8 h-1 rounded-full ${i === 1 ? 'bg-amber-500' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                                ))}
                            </div>
                        </div>

                        {/* High-end Reflection Overlay */}
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-50" />
                    </div>
                </div>

                {/* Ground Shadow & Reflection */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[90%] h-12 bg-black/20 blur-3xl -z-10 rounded-full" />

                {children}
            </motion.div>
        </div>
    );
}