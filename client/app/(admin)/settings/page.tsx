'use client'

import React, { useState } from 'react'
import { useChangePasswordMutation } from '@/redux/apis/authApi'
import { useGetCommissionConfigsQuery, useUpdateCommissionConfigsMutation } from '@/redux/apis/commissionApi'
import { Loader2, Lock, Save, User, Moon, Bell, Shield, Smartphone, Eye, EyeOff, ChevronRight, CheckCircle2, Banknote, Percent, Plus, Trash2, RefreshCw, LayoutTemplate, Globe, Mail, AlertTriangle, Fingerprint, Layers, Cpu, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { ModeToggle } from '@/components/ModeToggle'
import { useAppSelector } from '@/redux/hooks'
import { selectCurrentUser } from '@/redux/features/authSlice'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export default function SettingsPage() {
    const user = useAppSelector(selectCurrentUser)
    const [activeTab, setActiveTab] = useState('appearance')

    // Password Form State
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Commission State
    const { data: commissionData, isLoading: isLoadingCommissions, refetch: refetchCommissions } = useGetCommissionConfigsQuery()
    const [updateCommissions, { isLoading: isUpdatingCommissions }] = useUpdateCommissionConfigsMutation()
    const [commissionConfigs, setCommissionConfigs] = useState<{ level: number, percentage: string | number, is_active: boolean }[]>([])

    // Notification Settings State (Mocked)
    const [notificationSettings, setNotificationSettings] = useState([
        { id: 'security', title: 'Security Incident Alerts', desc: 'Instant notification on unauthorized login attempts.', checked: true },
        { id: 'analytics', title: 'Analytical Summaries', desc: 'Weekly performance reports delivered to your inbox.', checked: false },
        { id: 'updates', title: 'Automated System Updates', desc: 'Notice for periodic maintenance and feature rollouts.', checked: true }
    ])

    // General Settings State (Mocked)
    const [generalSettings, setGeneralSettings] = useState({
        siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'SS Infra Admin',
        supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'admin@ssinfra.com',
        maintenanceMode: false
    })

    React.useEffect(() => {
        if (commissionData?.success && commissionData?.configs) {
            setCommissionConfigs(commissionData.configs)
        }
    }, [commissionData])

    // Commission Handlers
    const handleAddLevel = () => {
        const nextLevel = commissionConfigs.length > 0 ? Math.max(...commissionConfigs.map(c => c.level)) + 1 : 1
        setCommissionConfigs([...commissionConfigs, { level: nextLevel, percentage: '', is_active: true }])
    }

    const handleRemoveLevel = (index: number) => {
        const newConfigs = [...commissionConfigs]
        newConfigs.splice(index, 1)
        const renumbered = newConfigs.map((c, i) => ({ ...c, level: i + 1 }))
        setCommissionConfigs(renumbered)
    }

    const handleConfigChange = (index: number, field: string, value: any) => {
        const newConfigs = [...commissionConfigs]
        newConfigs[index] = { ...newConfigs[index], [field]: value }
        setCommissionConfigs(newConfigs)
    }

    const handleSaveCommissions = async () => {
        try {
            const payload = commissionConfigs.map(c => ({
                level: c.level,
                percentage: Number(c.percentage),
                isActive: c.is_active,
                is_active: c.is_active
            }))
            await updateCommissions({ configs: payload }).unwrap()
            toast.success('Commission structure updated')
            refetchCommissions()
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to update commissions')
        }
    }

    // Password Handler
    const [changePassword, { isLoading }] = useChangePasswordMutation()
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match')
            return
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }
        try {
            await changePassword({
                currentPassword: oldPassword,
                newPassword: newPassword,
                confirmPassword: confirmPassword
            }).unwrap()
            toast.success('Security settings updated successfully')
            setOldPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to update security settings')
        }
    }

    // Notification Handler
    const toggleNotification = (id: string) => {
        setNotificationSettings(prev => prev.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ))
        toast.success('Notification preference updated')
    }

    // General Settings Handler
    const handleGeneralChange = (field: string, value: any) => {
        setGeneralSettings(prev => ({ ...prev, [field]: value }))
    }

    const saveGeneralSettings = () => {
        toast.success('General settings saved permanent')
    }

    const tabs = [
        { id: 'profile', label: 'Admin Identity', icon: User, description: 'Personal domain & profile' },
        { id: 'security', label: 'Security Cryptography', icon: Shield, description: 'Access tokens & security' },
        { id: 'appearance', label: 'Core Interface', icon: Moon, description: 'Visual themes & aesthetics' },
        { id: 'notifications', label: 'Neural Network', icon: Bell, description: 'System alerts & comms' },
        { id: 'commissions', label: 'Revenue Topology', icon: Banknote, description: 'Multi-level earnings' },
        { id: 'general', label: 'Master Configs', icon: LayoutTemplate, description: 'Site-wide parameters' },
    ]

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
        >
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/5 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-zinc-900 dark:bg-zinc-100 rounded-2xl flex items-center justify-center border border-zinc-200 dark:border-white/10 shrink-0">
                        <Cpu className="h-7 w-7 text-white dark:text-black" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-foreground dark:text-white tracking-tight">System Core Settings</h2>
                        <p className="text-sm font-bold text-muted-foreground dark:text-zinc-400 mt-1 flex items-center gap-2">
                             <Fingerprint className="h-4 w-4 text-primary" />
                            Administrative Backbone & Security Logic
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
                {/* Settings Sidebar Architecture */}
                <div className="w-full lg:w-80 shrink-0 space-y-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "group w-full flex items-start gap-4 px-6 py-5 rounded-2xl text-left transition-all duration-300 border relative overflow-hidden active:scale-95",
                                activeTab === tab.id
                                    ? 'bg-primary border-primary text-black shadow-xl shadow-primary/20 scale-[1.02] z-10'
                                    : 'bg-card dark:bg-zinc-900 border-zinc-200/50 dark:border-white/5 text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            )}
                        >
                            <div className={clsx(
                                "h-11 w-11 flex items-center justify-center rounded-xl shrink-0 transition-all",
                                activeTab === tab.id ? 'bg-black/10 text-black' : 'bg-muted dark:bg-white/5 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                            )}>
                                <tab.icon className="h-5 w-5" strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={clsx("font-black text-xs uppercase tracking-widest", activeTab === tab.id ? 'text-black' : 'text-zinc-500 dark:text-zinc-400')}>
                                    {tab.label}
                                </p>
                                <p className={clsx("text-xs mt-1 font-medium italic opacity-70", activeTab === tab.id ? 'text-black/70' : 'text-muted-foreground')}>{tab.description}</p>
                            </div>
                            <ChevronRight className={clsx("h-4 w-4 mt-1 transition-transform", activeTab === tab.id ? 'opacity-100 translate-x-1 text-black' : 'opacity-0')} />
                        </button>
                    ))}
                </div>

                {/* Settings Terminal Content Area */}
                <div className="flex-1 w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="bg-card dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden min-h-[600px]"
                        >
                            {/* Account Profile Node */}
                            {activeTab === 'profile' && (
                                <div className="p-10 lg:p-14 space-y-12">
                                    <div className="flex flex-col sm:flex-row items-center gap-10">
                                        <div className="relative group">
                                            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="h-40 w-40 rounded-3xl bg-linear-to-br from-zinc-900 to-zinc-800 dark:from-white dark:to-zinc-200 flex items-center justify-center text-5xl font-black text-white dark:text-black border-8 border-card dark:border-zinc-900 shadow-2xl relative z-10 transition-transform group-hover:scale-105 group-hover:rotate-3 overflow-hidden">
                                                {user?.name?.[0]?.toUpperCase() || 'A'}
                                                <div className="absolute inset-x-0 bottom-0 py-2 bg-black/50 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Identity
                                                </div>
                                            </div>
                                            <button className="absolute -bottom-2 -right-2 h-12 w-12 bg-primary text-black border-4 border-card dark:border-zinc-900 rounded-2xl flex items-center justify-center shadow-xl z-20 hover:scale-110 active:scale-95 transition-all" onClick={() => toast.success("Module not operational")}>
                                                <Smartphone className="h-5 w-5" strokeWidth={3} />
                                            </button>
                                        </div>
                                        <div className="text-center sm:text-left space-y-3">
                                            <h3 className="text-3xl font-black text-foreground dark:text-white tracking-tighter">{user?.name}</h3>
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                System Administrator Mode Active
                                            </div>
                                            <div className="pt-4">
                                                <button className="text-[10px] font-black uppercase tracking-widest px-6 py-3 bg-muted dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-xl transition-all border border-zinc-200/50 dark:border-white/5 dark:text-white" onClick={() => toast.success("Update requested")}>Update Bio-Metric identity</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-zinc-200/50 dark:border-white/5 pt-12">
                                        {[
                                            { label: 'Display Network Identity', value: user?.name, icon: User },
                                            { label: 'Registered Communication Host', value: user?.email, icon: Mail },
                                            { label: 'Privilege Access Protocol', value: user?.role || 'ROOT_DOMAIN_ADMIN', icon: Shield, highlight: true }
                                        ].map((field, i) => (
                                            <div key={i} className={clsx("space-y-3", field.highlight && "md:col-span-2")}>
                                                <label className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <field.icon className="h-3 w-3" />
                                                    {field.label}
                                                </label>
                                                <div className={clsx(
                                                    "px-6 py-5 rounded-2xl font-bold text-sm tracking-tight border transition-all",
                                                    field.highlight 
                                                        ? "bg-primary/5 dark:bg-primary/10 border-primary/20 text-primary uppercase" 
                                                        : "bg-muted/30 dark:bg-white/5 border-zinc-200/50 dark:border-white/5 text-foreground dark:text-white"
                                                )}>
                                                    {field.value || 'NETWORK_ERROR'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Security & Access Cryptography Node */}
                            {activeTab === 'security' && (
                                <div className="p-10 lg:p-14 space-y-12">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20">
                                                <Lock className="h-5 w-5" strokeWidth={3} />
                                            </div>
                                            <h3 className="text-2xl font-black text-foreground dark:text-white tracking-tight">Security Cryptography</h3>
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground dark:text-zinc-500 leading-relaxed max-w-xl">
                                            Cycle your administrative tokens periodically to maintain a quantum-secure environment across the SS Infra network node.
                                        </p>
                                    </div>

                                    <form onSubmit={handlePasswordChange} className="space-y-8 max-w-lg">
                                        <div className="space-y-6">
                                            {[
                                                { id: 'old', label: 'Current Validation Token', state: oldPassword, setter: setOldPassword, show: showOldPassword, toggle: setShowOldPassword },
                                                { id: 'new', label: 'Next Generation Token', state: newPassword, setter: setNewPassword, show: showNewPassword, toggle: setShowNewPassword },
                                                { id: 'confirm', label: 'Verify Logical Token', state: confirmPassword, setter: setConfirmPassword, show: showConfirmPassword, toggle: setShowConfirmPassword }
                                            ].map((input, i) => (
                                                <div key={input.id} className="space-y-3">
                                                    <label className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-[0.2em]">{input.label}</label>
                                                    <div className="relative group">
                                                        <Fingerprint className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all group-focus-within:scale-110" />
                                                        <input
                                                            type={input.show ? "text" : "password"}
                                                            required
                                                            value={input.state}
                                                            onChange={(e) => input.setter(e.target.value)}
                                                            className="pl-14 pr-14 w-full py-4 bg-muted/30 dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 rounded-2xl focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all text-sm font-bold dark:text-white placeholder:text-muted-foreground/30 shadow-inner"
                                                            placeholder="••••••••••••••••"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => input.toggle(!input.show)}
                                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors p-2"
                                                        >
                                                            {input.show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-6">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full sm:w-auto flex items-center justify-center px-12 py-4 bg-primary text-black font-black rounded-2xl hover:bg-yellow-400 transition-all shadow-xl shadow-primary/20 group disabled:opacity-50"
                                            >
                                                {isLoading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Save className="mr-3 h-5 w-5 group-hover:rotate-6 transition-transform" strokeWidth={3} />}
                                                Commit Security Changes
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Appearance Theme Selector Node */}
                            {activeTab === 'appearance' && (
                                <div className="p-10 lg:p-14 space-y-12">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                                                <Moon className="h-5 w-5" strokeWidth={3} />
                                            </div>
                                            <h3 className="text-2xl font-black text-foreground dark:text-white tracking-tight">Core Interface Visuals</h3>
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground dark:text-zinc-500 leading-relaxed max-w-xl">
                                            Configure the aesthetic parameters of the system core to optimize visual performance and administrative focus.
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-between p-10 border border-zinc-200/50 dark:border-white/10 rounded-3xl bg-muted/20 dark:bg-white/5 gap-8 group hover:border-primary/20 transition-all">
                                        <div className="text-center sm:text-left space-y-2">
                                            <p className="font-black text-xl text-foreground dark:text-white tracking-tight">System Global Theme</p>
                                            <p className="text-sm text-muted-foreground font-medium max-w-xs">Oscillate between High-Entropy Dark and Radiant Light neural modes.</p>
                                        </div>
                                        <div className="bg-background dark:bg-zinc-800 p-3 rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/10 group-hover:scale-110 transition-transform">
                                            <ModeToggle />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 opacity-40 grayscale select-none pointer-events-none">
                                        <div className="p-6 rounded-2xl border border-dashed border-zinc-400 dark:border-zinc-700 flex items-center justify-between">
                                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">OLED Black (Labs)</span>
                                            <div className="h-6 w-6 rounded-full bg-zinc-400"></div>
                                        </div>
                                        <div className="p-6 rounded-2xl border border-dashed border-zinc-400 dark:border-zinc-700 flex items-center justify-between">
                                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Neural Blue (Pending)</span>
                                            <div className="h-6 w-6 rounded-full bg-zinc-400"></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Intelligence & Neural Alerts Node */}
                            {activeTab === 'notifications' && (
                                <div className="p-10 lg:p-14 space-y-12">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                                                <Bell className="h-5 w-5" strokeWidth={3} />
                                            </div>
                                            <h3 className="text-2xl font-black text-foreground dark:text-white tracking-tight">Intelligence Feed Nodes</h3>
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground dark:text-zinc-500 leading-relaxed max-w-xl">
                                            Calibrate the neural communication vectors for real-time audit logs and security telemetry.
                                        </p>
                                    </div>

                                    <div className="grid gap-6">
                                        {notificationSettings.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => toggleNotification(item.id)}
                                                className={clsx(
                                                    "group flex items-center gap-6 p-8 rounded-3xl border transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]",
                                                    item.checked 
                                                        ? "bg-primary/10 border-primary/30 dark:bg-primary/5 dark:border-primary/20" 
                                                        : "bg-muted/30 dark:bg-white/5 border-zinc-200/50 dark:border-white/5 grayscale saturate-50 hover:grayscale-0 hover:saturate-100"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all",
                                                    item.checked ? "bg-primary text-black border-primary/20 shadow-lg shadow-primary/20 scale-110" : "bg-muted/50 dark:bg-black/20 text-muted-foreground border-zinc-200/50 dark:border-white/10"
                                                )}>
                                                    <Zap className={clsx("h-6 w-6", item.checked ? "text-black fill-black" : "text-muted-foreground")} strokeWidth={3} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className={clsx("font-black text-lg tracking-tight", item.checked ? "text-foreground dark:text-white" : "text-muted-foreground")}>{item.title}</p>
                                                    <p className="text-xs font-medium text-muted-foreground dark:text-zinc-500 mt-1">{item.desc}</p>
                                                </div>
                                                <div className={clsx(
                                                    "h-7 w-12 rounded-full border-2 p-1 transition-all flex items-center",
                                                    item.checked ? "bg-primary border-primary justify-end" : "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 justify-start"
                                                )}>
                                                    <div className={clsx("h-4 w-4 rounded-full bg-white shadow-xl transition-all", item.checked ? "scale-100" : "scale-75")} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Revenue Topology & Commissions Node */}
                            {activeTab === 'commissions' && (
                                <div className="p-10 lg:p-14 space-y-12">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                                <Banknote className="h-5 w-5" strokeWidth={3} />
                                            </div>
                                            <h3 className="text-2xl font-black text-foreground dark:text-white tracking-tight">Revenue Network Topology</h3>
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground dark:text-zinc-500 leading-relaxed max-w-xl">
                                            Define the percentage distribution vectors for the referral grid across multiple hierarchical depths.
                                        </p>
                                    </div>

                                    {isLoadingCommissions ? (
                                        <div className="flex flex-col justify-center items-center h-80 space-y-4">
                                            <Loader2 className="animate-spin h-10 w-10 text-primary" strokeWidth={3} />
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Querying Commission Node...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className="bg-muted/30 dark:bg-white/5 border border-zinc-200/50 dark:border-white/5 rounded-3xl overflow-hidden shadow-inner">
                                                <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-zinc-200/50 dark:border-white/5 bg-muted/20 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-zinc-500 opacity-70">
                                                    <div className="col-span-2 text-center">Depth Node</div>
                                                    <div className="col-span-5">Yield Factor</div>
                                                    <div className="col-span-3 text-center">Protocol State</div>
                                                    <div className="col-span-2 text-right">Sanitize</div>
                                                </div>

                                                <div className="divide-y divide-zinc-200/50 dark:divide-white/5">
                                                    {commissionConfigs.length === 0 && (
                                                        <div className="p-20 text-center space-y-4">
                                                            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 dark:bg-white/5 border border-zinc-200/50 dark:border-white/5">
                                                                <Layers className="h-7 w-7 text-muted-foreground/30" />
                                                            </div>
                                                            <p className="text-sm font-bold text-muted-foreground italic">Topology nodes not defined in system memory.</p>
                                                        </div>
                                                    )}

                                                    {commissionConfigs.map((config, idx) => (
                                                        <motion.div 
                                                            key={idx} 
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-muted/20 dark:hover:bg-white/5 transition-all group"
                                                        >
                                                            <div className="col-span-2 flex justify-center">
                                                                <div className="h-10 w-10 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center text-xs font-black text-white dark:text-black border border-zinc-200 dark:border-white/10 group-hover:rotate-6 transition-transform">
                                                                    {config.level}
                                                                </div>
                                                            </div>
                                                            <div className="col-span-5">
                                                                <div className="relative group/input">
                                                                    <input
                                                                        type="number"
                                                                        value={config.percentage}
                                                                        onChange={(e) => handleConfigChange(idx, 'percentage', e.target.value)}
                                                                        className="w-full pl-6 pr-12 py-3 bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-white/10 rounded-2xl text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all dark:text-white dark:placeholder:text-zinc-600 shadow-sm"
                                                                        placeholder="0.00"
                                                                        step="0.01"
                                                                    />
                                                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-50 group-focus-within/input:opacity-100 transition-opacity">
                                                                        <Percent className="h-3.5 w-3.5 text-primary" strokeWidth={3} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-span-3 flex justify-center">
                                                                <button
                                                                    onClick={() => handleConfigChange(idx, 'is_active', !config.is_active)}
                                                                    className={clsx(
                                                                        "relative inline-flex h-7 w-14 items-center rounded-full transition-all ring-offset-2 ring-primary/20",
                                                                        config.is_active ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-zinc-300 dark:bg-zinc-800'
                                                                    )}
                                                                >
                                                                    <span
                                                                        className={clsx(
                                                                            "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all",
                                                                            config.is_active ? 'translate-x-8' : 'translate-x-1'
                                                                        )}
                                                                    />
                                                                </button>
                                                            </div>
                                                            <div className="col-span-2 flex justify-end">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveLevel(idx)}
                                                                    className="p-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20"
                                                                    title="Detach Level"
                                                                >
                                                                    <Trash2 className="h-5 w-5" />
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row justify-between pt-6 gap-4">
                                                <div className="flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={handleAddLevel}
                                                        className="flex items-center gap-2 px-6 py-4 bg-muted dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-foreground dark:text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all border border-zinc-200 dark:border-white/10 active:scale-95"
                                                    >
                                                        <Plus className="h-4 w-4" strokeWidth={3} />
                                                        Add Hierarchichal Depth
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => refetchCommissions()}
                                                        className="p-4 bg-muted dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-foreground dark:text-white rounded-2xl transition-all border border-zinc-200 dark:border-white/10 active:scale-95"
                                                    >
                                                        <RefreshCw className="h-5 w-5" />
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={handleSaveCommissions}
                                                    disabled={isUpdatingCommissions}
                                                    className="flex items-center justify-center gap-2 px-10 py-4 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-yellow-400 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 active:scale-95"
                                                >
                                                    {isUpdatingCommissions ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" strokeWidth={3} />}
                                                    Commit Network Yields
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* General Master Config Node */}
                            {activeTab === 'general' && (
                                <div className="p-10 lg:p-14 space-y-12">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-zinc-900 dark:bg-zinc-100 rounded-xl flex items-center justify-center text-white dark:text-black border border-zinc-200 dark:border-white/10">
                                                <LayoutTemplate className="h-5 w-5" strokeWidth={3} />
                                            </div>
                                            <h3 className="text-2xl font-black text-foreground dark:text-white tracking-tight">Master System Configs</h3>
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground dark:text-zinc-500 leading-relaxed max-w-xl">
                                            Configure the primary operational parameters and global state of the SS Infra administrative environment.
                                        </p>
                                    </div>

                                    <div className="space-y-10 max-w-xl">
                                        {[
                                            { id: 'siteName', label: 'Primary Network Alias', state: generalSettings.siteName, icon: Globe },
                                            { id: 'supportEmail', label: 'Central Response Gateway', state: generalSettings.supportEmail, icon: Mail }
                                        ].map((field) => (
                                            <div key={field.id} className="space-y-3">
                                                <label className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-[0.2em]">{field.label}</label>
                                                <div className="relative group">
                                                    <field.icon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all" />
                                                    <input
                                                        type={field.id === 'supportEmail' ? 'email' : 'text'}
                                                        value={field.state}
                                                        onChange={(e) => handleGeneralChange(field.id, e.target.value)}
                                                        className="pl-14 pr-6 w-full py-4 bg-muted/30 dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 rounded-2xl focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all text-sm font-bold dark:text-white shadow-inner"
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        <div className="p-8 border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-3xl bg-muted/10 dark:bg-white/5 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="font-black text-lg text-foreground dark:text-white tracking-tight">System Lockdown Protocol</p>
                                                    <p className="text-[10px] font-black uppercase text-red-500 tracking-[0.1em] flex items-center gap-1.5 animation-pulse">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Maintenance Mode Transition
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleGeneralChange('maintenanceMode', !generalSettings.maintenanceMode)}
                                                    className={clsx(
                                                        "relative inline-flex h-8 w-16 items-center rounded-full transition-all focus-visible:ring-4 ring-offset-2 ring-primary/20",
                                                        generalSettings.maintenanceMode ? 'bg-red-500 shadow-lg shadow-red-500/30' : 'bg-muted dark:bg-zinc-800 border-2 border-zinc-200 dark:border-white/5'
                                                    )}
                                                >
                                                    <span
                                                        className={clsx(
                                                            "inline-block h-6 w-6 transform rounded-full bg-white shadow-xl transition-all",
                                                            generalSettings.maintenanceMode ? 'translate-x-9' : 'translate-x-1'
                                                        )}
                                                    />
                                                </button>
                                            </div>
                                            <p className="text-xs font-medium text-muted-foreground leading-relaxed italic opacity-60">
                                                Activating Lockdown Protocol will terminate all active client sessions and restrict access to administrative nodes only. Proceed with extreme caution.
                                            </p>
                                        </div>

                                        <div className="pt-6">
                                            <button
                                                onClick={saveGeneralSettings}
                                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-black/10"
                                            >
                                                <Save className="h-4 w-4" strokeWidth={3} />
                                                Synchronize Master Node
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div >
            </div >
        </motion.div >
    )
}
