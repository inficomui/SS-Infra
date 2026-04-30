"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";
import { Check, Star, Zap, Info } from "lucide-react";
import { useGetPlansQuery } from "@/redux/apis/plansApi";

export function Pricing() {
    const { t } = useTranslation();
    const { data: plansRes, isLoading } = useGetPlansQuery({});
    const fetchedPlans = plansRes?.data ?? [];

    const fallbackPlans = [
        {
            name: "Individual",
            price: "2,999",
            features: [
                "10 Operator Slots",
                "Basic Fleet Analytics",
                "Email Support",
                "Standard GPS Support",
                "Mobile App Access"
            ],
            popular: false,
            desc: "Designed for small owners."
        },
        {
            name: "Organization",
            price: "7,499",
            features: [
                "50 Operator Slots",
                "Real-time Neural Tracking",
                "Fuel Leak Detection",
                "Priority Support",
                "Custom Reports"
            ],
            popular: true,
            desc: "Ideal for growing fleets."
        },
        {
            name: "Enterprise",
            price: "Custom",
            features: [
                "Unlimited Operator Slots",
                "Full Neural Mesh Integration",
                "Dedicated Account Manager",
                "API Access & Webhooks",
                "On-site Training"
            ],
            popular: false,
            desc: "For large-scale infrastructure."
        }
    ];

    interface Plan {
        name: string;
        price: string;
        features: string[];
        popular: boolean;
        desc: string;
    }

    const displayPlans: Plan[] = fetchedPlans.length > 0
        ? fetchedPlans.map((p: any): Plan => ({
            name: p.name,
            price: p.price ? p.price.toLocaleString() : "Custom",
            features: p.features || [],
            popular: p.name === "Organization",
            desc: p.description || "Scaled for your success."
        }))
        : fallbackPlans;

    return (
        <section id="pricing" className="py-24 md:py-40 bg-background relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="flex flex-col items-center text-center mb-20 md:mb-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] mb-10"
                    >
                        <Zap size={14} fill="currentColor" /> Flexible Packages
                    </motion.div>
                    <h2 className="text-5xl sm:text-6xl md:text-[6rem] font-black font-heading leading-[0.85] uppercase tracking-tighter mb-8">
                        PRECISION <br />
                        <span className="text-gradient-yellow italic font-heading">Investment.</span>
                    </h2>
                    <p className="text-base md:text-xl text-muted-foreground font-medium max-w-2xl opacity-75">
                        Enterprise-grade functionality scaled to match your operational trajectory. No hidden costs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                    {displayPlans.map((plan: Plan, i: number) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15 }}
                            className={`relative p-10 md:p-12 rounded-[3.5rem] border transition-all duration-700 flex flex-col justify-between ${plan.popular
                                ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary shadow-[0_0_80px_-20px_rgba(255,204,0,0.3)] scale-[1.05] z-10'
                                : 'bg-card/50 border-border hover:border-border/80'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary text-black rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">
                                    <Star size={12} fill="currentColor" className="inline mr-2" />
                                    MOST POPULAR
                                </div>
                            )}

                            <div>
                                <div className="text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-10">
                                    {plan.name} Package
                                </div>

                                <div className="mb-10">
                                    <div className="flex items-baseline gap-2">
                                        {plan.price !== "Custom" && <span className="text-3xl font-black text-foreground">₹</span>}
                                        <span className="text-5xl md:text-7xl font-black text-foreground tracking-tighter italic leading-none lowercase">
                                            {plan.price}
                                        </span>
                                        {plan.price !== "Custom" && <span className="text-sm font-bold text-muted-foreground uppercase">/mo</span>}
                                    </div>
                                    <p className="mt-4 text-xs font-bold text-muted-foreground uppercase opacity-60 tracking-widest">
                                        {plan.desc}
                                    </p>
                                </div>

                                <div className="h-[1px] bg-border w-full mb-10" />

                                <ul className="space-y-6 mb-12">
                                    {plan.features.map((feat: string, j: number) => (
                                        <li key={j} className="flex items-start gap-4 text-sm font-medium text-muted-foreground">
                                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-3 ${plan.popular
                                ? 'bg-primary text-black hover:scale-[1.03] yellow-glow'
                                : 'bg-muted/50 text-foreground hover:bg-muted'
                                }`}>
                                Get Started Now
                                <Zap size={16} fill="currentColor" className={plan.popular ? "text-black" : "text-primary"} />
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Footnote */}
                <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-8 opacity-40">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                        <Info size={14} /> Annual Billing Discount (20% OFF)
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                        <Star size={14} /> Enterprise Customization available
                    </div>
                </div>
            </div>
        </section>
    );
}
