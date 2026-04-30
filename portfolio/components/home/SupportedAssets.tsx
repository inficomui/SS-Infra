"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function SupportedAssets() {
    const { t } = useTranslation();

    const assets = [
        { name: "Earthmoving", desc: "JCB, Excavators & Dozers", img: "https://images.unsplash.com/photo-1579455341639-61882103f56e?auto=format&fit=crop&q=80&w=600" },
        { name: "Lifting", desc: "Cranes & Forklifts", img: "https://images.unsplash.com/photo-1532619675605-1dec6c23fb86?auto=format&fit=crop&q=80&w=600" },
        { name: "Transportation", desc: "Dumpers & Trailers", img: "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=600" },
        { name: "Farming", desc: "Tractors & Harvesters", img: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=600" },
        { name: "Custom Ops", desc: "Specialized Machinery", img: "https://images.unsplash.com/photo-1504307651254-35680fb3ba66?auto=format&fit=crop&q=80&w=600" }
    ];

    return (
        <section id="fleet" className="py-24 md:py-32 bg-background border-y border-white/5">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col items-center text-center mb-16 md:mb-24">
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6">Industrial Ecosystem</div>
                    <h2 className="text-4xl md:text-5xl font-black font-heading uppercase tracking-tighter italic">
                        The <span className="text-gradient-yellow">Machinery</span> We Power.
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {assets.map((asset, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative h-[400px] rounded-[2.5rem] overflow-hidden border border-white/5 cursor-crosshair bg-zinc-900"
                        >
                            <img
                                src={asset.img}
                                alt={asset.name}
                                className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110 opacity-50 group-hover:opacity-100"
                            />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="text-primary font-black uppercase text-[10px] tracking-widest mb-1 opacity-60 group-hover:opacity-100">{asset.name}</div>
                                <div className="text-white font-black uppercase text-xl md:text-2xl leading-tight font-heading group-hover:text-primary transition-colors">{asset.desc}</div>
                            </div>

                            {/* Corner Accent */}
                            <div className="absolute top-6 right-6 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Zap size={24} className="text-primary" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
