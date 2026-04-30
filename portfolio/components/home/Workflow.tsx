import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";
import { UserPlus, Zap, Network } from "lucide-react";

export function Workflow() {
    const { t } = useTranslation();
    
    return (
        <section id="workflow" className="py-24 md:py-40 relative overflow-hidden bg-background">
            {/* Background Branding */}
            <div className="absolute top-0 right-0 p-24 opacity-[0.02] select-none pointer-events-none">
                 <h2 className="text-[20rem] font-black uppercase leading-none tracking-tighter text-foreground">INFRA</h2>
            </div>

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="flex flex-col items-center text-center mb-20 md:mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] mb-10"
                    >
                        How It Works
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl sm:text-6xl md:text-[6rem] font-black font-heading leading-[0.85] uppercase tracking-tighter mb-8"
                    >
                        THE <span className="text-gradient-yellow italic font-heading">Lifecycle.</span>
                    </motion.h2>
                    <p className="text-base md:text-xl text-muted-foreground font-medium max-w-2xl opacity-70">
                        A precision-engineered lifecycle designed to integrate your heavy machinery into a unified digital ecosystem.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
                    {/* Architectural Connection Line */}
                    <div className="hidden md:block absolute top-[40%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />

                    {[
                        {
                            num: "01",
                            title: "ONBOARD",
                            desc: "Initialize your industrial profile and integrate your entire fleet with our neural mesh in minutes.",
                            icon: <UserPlus size={36} />,
                        },
                        {
                            num: "02",
                            title: "MAP",
                            desc: "Assign high-performance operators to specific assets and monitor real-time telemetry instantly.",
                            icon: <Network size={36} />,
                        },
                        {
                            num: "03",
                            title: "SCALE",
                            desc: "Leverage advanced heuristics to optimize fuel, performance, and maximize infrastructure ROI.",
                            icon: <Zap size={36} />,
                        }
                    ].map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2, duration: 0.8 }}
                            className="relative group lg:px-6"
                        >
                            {/* Step Number Background */}
                            <div className="text-[12rem] font-black absolute -top-24 left-0 text-foreground/[0.03] select-none group-hover:text-primary/[0.05] transition-colors duration-700">
                                {step.num}
                            </div>

                            <div className="relative z-10 flex flex-col items-center md:items-start">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-card border border-border rounded-[2rem] flex items-center justify-center text-primary mb-10 shadow-2xl group-hover:bg-primary group-hover:text-black group-hover:-translate-y-2 transition-all duration-500">
                                    {step.icon}
                                </div>
                                <h3 className="text-2xl md:text-4xl font-black mb-6 uppercase italic tracking-tighter font-heading text-center md:text-left">
                                    {step.title}
                                </h3>
                                <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed text-center md:text-left opacity-80 group-hover:opacity-100 transition-opacity">
                                    {step.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
