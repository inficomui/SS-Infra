"use client";

import { motion } from "framer-motion";
import { 
    MapPin, Signal, Settings, Activity, 
    BarChart3, Fuel, Truck, AlertCircle, 
    Bell, LayoutDashboard, Database, ChevronRight 
} from "lucide-react";

export function FleetHUD() {
    return (
        <div className="relative w-full aspect-video md:aspect-[21/9] lg:aspect-video glass-card border-primary/20 bg-black/60 backdrop-blur-3xl overflow-hidden rounded-[3rem] shadow-2xl p-6 md:p-10 group">
            {/* Background Map Simulation */}
            <div className="absolute inset-0 opacity-20 pointer-events-none grayscale invert dark:invert-0 overflow-hidden">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--primary)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <motion.div 
                    animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 w-[200%] h-[200%] border-[2px] border-primary/5 rounded-full" 
                />
            </div>

            {/* Sidebar Controls */}
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-20 border-r border-white/10 flex flex-col items-center py-10 gap-8 z-20 bg-black/20">
                <div className="text-primary"><LayoutDashboard size={24} /></div>
                <div className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"><MapPin size={24} /></div>
                <div className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"><Database size={24} /></div>
                <div className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"><Activity size={24} /></div>
                <div className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"><Settings size={24} /></div>
                <div className="mt-auto text-muted-foreground opacity-50"><ChevronRight size={24} /></div>
            </div>

            <div className="pl-16 md:pl-24 h-full flex flex-col relative z-20">
                {/* HUD Header */}
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-black font-black">SS</div>
                        <div>
                            <div className="text-sm font-black uppercase tracking-[0.3em] text-white">SS INFRA <span className="text-primary italic">CRM</span></div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Global Fleet Command</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Connection</span>
                        </div>
                        <Bell size={20} className="text-muted-foreground" />
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-12 gap-6 md:gap-10 overflow-hidden">
                    {/* Main GPS Map Visualization Area */}
                    <div className="col-span-12 lg:col-span-7 relative bg-zinc-900/40 rounded-3xl border border-white/5 p-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">GPS TRACKING: FLEET MOVEMENT</div>
                            <div className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded">ENCRYPTED</div>
                        </div>
                        
                        {/* Abstract Simulated Map Path */}
                        <div className="h-full relative mt-4">
                           <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                             <motion.path 
                                d="M 20 80 Q 50 10 80 80 T 120 20" 
                                fill="none" 
                                stroke="var(--primary)" 
                                strokeWidth="0.5" 
                                className="opacity-20"
                             />
                             <motion.path 
                                d="M 10 20 L 40 40 L 70 20 L 90 60" 
                                fill="none" 
                                stroke="#3b82f6" 
                                strokeWidth="0.8" 
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 5, repeat: Infinity }}
                             />
                             {/* Points */}
                             <motion.circle cx="10" cy="20" r="1.5" fill="#3b82f6" />
                             <motion.circle cx="40" cy="40" r="1.5" fill="#3b82f6" />
                             <motion.circle cx="90" cy="60" r="1.5" fill="#3b82f6" className="animate-pulse" />
                           </svg>
                        </div>

                        {/* Bottom Chart Overlay */}
                        <div className="absolute bottom-6 left-6 right-6 h-24 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4">
                            <div className="text-[8px] font-black uppercase text-muted-foreground mb-2">OPERATIONAL HEURISTICS</div>
                            <div className="flex items-end gap-1 h-10">
                               {[40, 60, 30, 80, 50, 90, 70, 45, 85].map((h, i) => (
                                   <div key={i} className="flex-1 bg-primary/20 rounded-t-sm relative group overflow-hidden">
                                       <motion.div 
                                          initial={{ height: 0 }}
                                          animate={{ height: `${h}%` }}
                                          className="w-full bg-primary" 
                                       />
                                   </div>
                               ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Data Sidebar */}
                    <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 overflow-hidden">
                        {/* Fuel & Efficiency */}
                        <div className="bg-zinc-900/40 rounded-3xl border border-white/5 p-6 flex-1">
                             <div className="flex items-center gap-3 mb-6">
                                <Fuel size={18} className="text-amber-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fuel & Efficiency</span>
                             </div>
                             <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold mb-1 uppercase"><span>Fleet Usage</span> <span>78%</span></div>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: "78%" }} className="h-full bg-amber-500" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold mb-1 uppercase"><span>ROI Metric</span> <span>92%</span></div>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: "92%" }} className="h-full bg-primary" />
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* Vehicle Status List */}
                        <div className="bg-zinc-900/40 rounded-3xl border border-white/5 p-6 flex-1">
                             <div className="flex items-center gap-3 mb-6">
                                <Truck size={18} className="text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vehicle Status</span>
                             </div>
                             <div className="space-y-4 overflow-y-auto max-h-[150px] scrollbar-hide">
                                {[
                                    { id: "JCB-023", status: "Active", val: 45, color: "text-emerald-500" },
                                    { id: "HDC-004", status: "Idle", val: 12, color: "text-amber-500" },
                                    { id: "MXP-011", status: "Maintenance", val: 3, color: "text-red-500" }
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${s.color.replace('text-', 'bg-')}`} />
                                            <span className="text-xs font-black uppercase tracking-tighter">{s.id}</span>
                                        </div>
                                        <div className={`text-[10px] font-black uppercase italic ${s.color}`}>{s.status}: {s.val}</div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
