'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateOwnerMutation, useCreateOperatorMutation, useGetPublicOwnersQuery } from '@/redux/apis/usersApi'
import { Loader2, Lock, Mail, Eye, EyeOff, LayoutDashboard, ArrowRight, ShieldCheck, User, Phone, MapPin, Hash, Search, ChevronDown, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function RegisterPage() {
    const router = useRouter()
    const [role, setRole] = useState<'Owner' | 'Operator' | 'Driver'>('Owner')
    const [name, setName] = useState('')
    const [mobile, setMobile] = useState('')
    const [district, setDistrict] = useState('')
    const [taluka, setTaluka] = useState('')
    const [referralCode, setReferralCode] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    
    // Owner Selection state
    const [selectedOwnerId, setSelectedOwnerId] = useState<string>('')
    const [ownerSearchQuery, setOwnerSearchQuery] = useState('')
    const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false)

    // Mutations
    const [createOwner, { isLoading: isRegisteringOwner }] = useCreateOwnerMutation()
    const [createOperator, { isLoading: isRegisteringOperator }] = useCreateOperatorMutation()

    // Public Owners query for Operator/Driver
    const { data: ownersData, isLoading: isLoadingOwners } = useGetPublicOwnersQuery(undefined, {
        skip: role === 'Owner'
    })

    const ownersList = ownersData?.data?.data || []
    
    // Filter owners based on search query
    const filteredOwners = ownersList.filter((owner: any) =>
        owner.name?.toLowerCase().includes(ownerSearchQuery.toLowerCase()) ||
        owner.company_name?.toLowerCase().includes(ownerSearchQuery.toLowerCase()) ||
        owner.district?.toLowerCase().includes(ownerSearchQuery.toLowerCase())
    )

    const selectedOwner = ownersList.find((o: any) => String(o.id) === selectedOwnerId)

    const isLoading = isRegisteringOwner || isRegisteringOperator

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name || !mobile || !district || !taluka || !password) {
            toast.error('Please fill in all required fields')
            return
        }

        if (mobile.length !== 10) {
            toast.error('Mobile number must be exactly 10 digits')
            return
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        if (role !== 'Owner' && !selectedOwnerId) {
            toast.error('Please select an Owner to register under')
            return
        }

        const commonPayload = {
            name,
            mobile,
            district,
            taluka,
            referralCode: referralCode || undefined,
            password
        }

        try {
            if (role === 'Owner') {
                const result = await createOwner(commonPayload).unwrap()
                if (result.success) {
                    toast.success('Registration successful! Please login.')
                    router.push('/login')
                } else {
                    toast.error(result.message || 'Registration failed')
                }
            } else {
                const operatorPayload = {
                    ...commonPayload,
                    role, // 'Operator' or 'Driver'
                    ownerId: Number(selectedOwnerId),
                    owner_id: Number(selectedOwnerId) // Send both for compatibility
                }
                const result = await createOperator(operatorPayload).unwrap()
                if (result.success) {
                    toast.success(`${role} registration successful! Please login via Mobile App.`)
                    router.push('/login')
                } else {
                    toast.error(result.message || 'Registration failed')
                }
            }
        } catch (err: any) {
            console.error('Registration failed', err)
            const errorMessage = err?.data?.message || 'Registration failed. Please check details and try again.'
            toast.error(errorMessage)
        }
    }

    return (
        <div className="min-h-screen w-full flex bg-background selection:bg-primary/30">
            {/* Left Panel - Premium Branding */}
            <div className="hidden lg:flex w-[45%] bg-[#0F172A] relative items-center justify-center overflow-hidden border-r border-border">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] to-[#1E293B]"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]"></div>

                {/* Tech Grid Lines */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                <div className="relative z-10 w-full max-w-lg p-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8"
                    >
                        <Link href="/login" className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative group">
                            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <LayoutDashboard className="h-10 w-10 text-white relative z-10" />
                        </Link>

                        <div className="space-y-4">
                            <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight leading-none">
                                SS <span className="text-primary text-opacity-90">INFRA</span>
                                <span className="block h-1.5 w-16 bg-primary mt-6 rounded-full"></span>
                            </h1>
                            <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-sm mt-4">
                                Join the industry-leading infrastructure ecosystem. Secure register panel.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 pt-4">
                            {[
                                { icon: ShieldCheck, text: "Role-based Onboarding" },
                                { icon: ArrowRight, text: "Dynamic Fleet Management" }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (idx * 0.1) }}
                                    className="flex items-center gap-3 text-white font-medium opacity-90"
                                >
                                    <item.icon className="h-5 w-5 text-primary" />
                                    <span>{item.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div className="absolute bottom-8 left-12">
                    <p className="text-xs text-zinc-500 font-semibold tracking-widest uppercase">Ecosystem Registration</p>
                </div>
            </div>

            {/* Right Panel - Registration Form */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 bg-background overflow-y-auto max-h-screen">
                <div className="w-full max-w-lg my-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-card p-6 sm:p-10 rounded-[16px] shadow-xl border border-border overflow-visible"
                    >
                        <div className="mb-8 text-center sm:text-left">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground">
                                Account Registration
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground font-medium">
                                Choose your role and join the SS Infra platform.
                            </p>
                        </div>

                        {/* Role Selector Tabs */}
                        <div className="mb-8 bg-muted p-1 rounded-xl flex gap-1 border border-border/50">
                            {(['Owner', 'Operator', 'Driver'] as const).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => {
                                        setRole(r)
                                        // Reset selected owner if changing role to Owner
                                        if (r === 'Owner') setSelectedOwnerId('')
                                    }}
                                    className={clsx(
                                        "flex-1 py-3 text-sm font-bold rounded-lg transition-all relative overflow-hidden",
                                        role === r
                                            ? "bg-primary text-white shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                                    )}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-foreground ml-1">Full Name *</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            className="block w-full pl-12 pr-4 py-3 bg-background border border-border rounded-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                            placeholder="e.g. Rahul Kumar"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Mobile Input */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-foreground ml-1">Mobile Number *</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <input
                                            type="tel"
                                            required
                                            pattern="[0-9]{10}"
                                            className="block w-full pl-12 pr-4 py-3 bg-background border border-border rounded-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                            placeholder="10 digit mobile number"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                                        />
                                    </div>
                                </div>

                                {/* District and Taluka in Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-foreground ml-1">District *</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <MapPin className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                className="block w-full pl-10 pr-4 py-3 bg-background border border-border rounded-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                                placeholder="District"
                                                value={district}
                                                onChange={(e) => setDistrict(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-foreground ml-1">Taluka *</label>
                                        <input
                                            type="text"
                                            required
                                            className="block w-full px-4 py-3 bg-background border border-border rounded-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                            placeholder="Taluka"
                                            value={taluka}
                                            onChange={(e) => setTaluka(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Owner Selector for Operator / Driver */}
                                {role !== 'Owner' && (
                                    <div className="space-y-2 relative">
                                        <label className="block text-sm font-bold text-foreground ml-1">
                                            Select Owner * <span className="text-xs font-normal text-muted-foreground">(Under whom you operate)</span>
                                        </label>
                                        
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsOwnerDropdownOpen(!isOwnerDropdownOpen)}
                                                className="w-full flex items-center justify-between px-4 py-3 bg-background border border-border rounded-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                            >
                                                <span className={clsx(!selectedOwner && "text-muted-foreground")}>
                                                    {selectedOwner 
                                                        ? `${selectedOwner.name} ${selectedOwner.company_name ? `(${selectedOwner.company_name})` : ''}` 
                                                        : "Select Owner from list"}
                                                </span>
                                                <ChevronDown className={clsx("h-4 w-4 text-muted-foreground transition-transform duration-200", isOwnerDropdownOpen && "rotate-180")} />
                                            </button>

                                            <AnimatePresence>
                                                {isOwnerDropdownOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="absolute z-50 w-full mt-2 bg-card border border-border rounded-[12px] shadow-xl overflow-hidden max-h-64 flex flex-col"
                                                    >
                                                        <div className="p-2 border-b border-border/50 bg-muted/30 flex items-center gap-2">
                                                            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                                                            <input
                                                                type="text"
                                                                className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                                                                placeholder="Search owners..."
                                                                value={ownerSearchQuery}
                                                                onChange={(e) => setOwnerSearchQuery(e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                                                            {isLoadingOwners ? (
                                                                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                    <span>Loading owners list...</span>
                                                                </div>
                                                            ) : filteredOwners.length === 0 ? (
                                                                <div className="py-6 text-center text-sm text-muted-foreground">
                                                                    No owners found.
                                                                </div>
                                                            ) : (
                                                                filteredOwners.map((owner: any) => (
                                                                    <button
                                                                        key={owner.id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedOwnerId(String(owner.id))
                                                                            setIsOwnerDropdownOpen(false)
                                                                            setOwnerSearchQuery('')
                                                                        }}
                                                                        className={clsx(
                                                                            "w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between hover:bg-primary/5",
                                                                            selectedOwnerId === String(owner.id) ? "bg-primary/10 text-primary font-bold" : "text-foreground"
                                                                        )}
                                                                    >
                                                                        <div className="flex flex-col">
                                                                            <span>{owner.name}</span>
                                                                            <span className="text-xs text-muted-foreground">
                                                                                {owner.company_name || 'No company'} • {owner.district}, {owner.taluka}
                                                                            </span>
                                                                        </div>
                                                                        {selectedOwnerId === String(owner.id) && (
                                                                            <Check className="h-4 w-4 text-primary shrink-0" />
                                                                        )}
                                                                    </button>
                                                                ))
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                {/* Referral Code */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-foreground ml-1">Referral Code <span className="text-xs font-normal text-muted-foreground">(Optional)</span></label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Hash className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            className="block w-full pl-10 pr-4 py-3 bg-background border border-border rounded-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                            placeholder="Enter referral code if any"
                                            value={referralCode}
                                            onChange={(e) => setReferralCode(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-foreground ml-1">Password *</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            minLength={6}
                                            className="block w-full pl-12 pr-12 py-3 bg-background border border-border rounded-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                            placeholder="Min. 6 characters"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-primary transition-colors"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center mt-6 py-4 px-4 bg-primary hover:bg-primary/90 text-white font-bold text-base rounded-[12px] shadow-sm transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <>
                                        Register Account <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm font-medium">
                            <span className="text-muted-foreground">Already have an account? </span>
                            <Link href="/login" className="text-primary hover:underline font-bold">
                                Login here
                            </Link>
                        </div>
                    </motion.div>

                    <p className="mt-8 text-center text-xs text-foreground font-medium uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} SS Infra Ecosystem. Protected Node.
                    </p>
                </div>
            </div>
        </div>
    )
}
