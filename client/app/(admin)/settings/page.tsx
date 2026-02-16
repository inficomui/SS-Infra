'use client'

import React, { useState } from 'react'
import { useChangePasswordMutation } from '@/redux/apis/authApi'
import { useGetCommissionConfigsQuery, useUpdateCommissionConfigsMutation } from '@/redux/apis/commissionApi'
import { Loader2, Lock, Save, User, Moon, Bell, Shield, Smartphone, Eye, EyeOff, ChevronRight, CheckCircle2, Banknote, Percent, Plus, Trash2, RefreshCw, LayoutTemplate, Globe, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { ModeToggle } from '@/components/ModeToggle'
import { useAppSelector } from '@/redux/hooks'
import { selectCurrentUser } from '@/redux/features/authSlice'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export default function SettingsPage() {
    const user = useAppSelector(selectCurrentUser)
    const [activeTab, setActiveTab] = useState('appearance') // Default to match image

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

    // Notification Settings State (Mocked for now as no API endpoint specified)
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
        if (commissionData?.configs) {
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
                isActive: c.is_active
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
        // Mock save
        toast.success('General settings saved')
    }

    const tabs = [
        { id: 'profile', label: 'Account Profile', icon: User, description: 'Personal info & avatar' },
        { id: 'security', label: 'Security & Access', icon: Shield, description: 'Password & credentials' },
        { id: 'appearance', label: 'Interface Design', icon: Moon, description: 'Themes & customization' },
        { id: 'notifications', label: 'Communication', icon: Bell, description: 'Alerts & updates' },
        { id: 'commissions', label: 'Commission Rates', icon: Banknote, description: 'Referral & earnings' },
        { id: 'general', label: 'General Settings', icon: LayoutTemplate, description: 'Site configs & maintenance' },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Page Title */}
            <div>
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">System Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your administrative preferences and secure your account.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Settings Sidebar */}
                <div className="w-full lg:w-80 shrink-0 space-y-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "group w-full flex items-start gap-4 px-5 py-4 rounded-md text-left transition-all duration-300 border relative overflow-hidden",
                                activeTab === tab.id
                                    ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20'
                                    : 'bg-card border-border/50 text-muted-foreground hover:bg-muted/50 hover:border-border hover:translate-x-1'
                            )}
                        >
                            <div className={clsx(
                                "h-10 w-10 flex items-center justify-center rounded-md shrink-0 transition-colors",
                                activeTab === tab.id ? 'bg-black/10 text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:text-foreground'
                            )}>
                                <tab.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0 z-10">
                                <p className={clsx("font-bold text-sm", activeTab === tab.id ? 'text-primary-foreground' : 'text-zinc-500 dark:text-zinc-400')}>
                                    {tab.label}
                                </p>
                                <p className={clsx("text-xs mt-0.5 line-wrap", activeTab === tab.id ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{tab.description}</p>
                            </div>
                            <ChevronRight className={clsx("h-4 w-4 self-center transition-transform z-10", activeTab === tab.id ? 'opacity-100 translate-x-1 text-primary-foreground' : 'opacity-0')} />
                        </button>
                    ))}
                </div>

                {/* Settings Content Area */}
                <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                            className="bg-card border border-border/60 rounded-md shadow-2xl shadow-black/5 overflow-hidden ring-1 ring-border/20"
                        >
                            {activeTab === 'profile' && (
                                <div className="p-8 sm:p-12 space-y-10">
                                    <div className="flex flex-col sm:flex-row items-center gap-8">
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-primary/20 rounded-md blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="h-32 w-32 rounded-md bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center text-4xl font-black text-black border-[6px] border-card shadow-2xl relative z-10 transition-transform group-hover:scale-105">
                                                {user?.name?.[0] || 'A'}
                                            </div>
                                            <button className="absolute bottom-0 right-0 h-10 w-10 bg-zinc-900 border-4 border-card rounded-md flex items-center justify-center text-white shadow-lg z-20 hover:bg-black transition-colors" onClick={() => toast.success("Photo upload not implemented yet")}>
                                                <Smartphone className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="text-center sm:text-left space-y-1">
                                            <h3 className="text-2xl font-black text-foreground">{user?.name}</h3>
                                            <p className="text-muted-foreground font-medium flex items-center justify-center sm:justify-start gap-2">
                                                <span className="h-2 w-2 rounded-md bg-emerald-500"></span>
                                                System Administrator
                                            </p>
                                            <div className="pt-3">
                                                <button className="text-sm px-4 py-1.5 bg-muted hover:bg-border rounded-md font-bold transition-colors" onClick={() => toast.success("Photo upload not implemented yet")}>Change Photo</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border/50 pt-10">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Account Display Name</label>
                                            <div className="px-4 py-4 rounded-md bg-muted/30 border border-border/50 text-foreground font-bold text-sm">
                                                {user?.name || 'Not Available'}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Registered Email Address</label>
                                            <div className="px-4 py-4 rounded-md bg-muted/30 border border-border/50 text-foreground font-bold text-sm">
                                                {user?.email || 'Not Available'}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">System Privilege Level</label>
                                            <div className="inline-flex items-center px-4 py-4 rounded-md bg-primary/10 border border-primary/20 text-primary font-black text-xs uppercase tracking-tighter">
                                                {user?.role || 'Full Domain Admin'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="p-8 sm:p-12 space-y-10">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-foreground">Access Security</h3>
                                        <p className="text-muted-foreground font-medium">Update your secret credentials regularly to maintain vault security.</p>
                                    </div>

                                    <form onSubmit={handlePasswordChange} className="space-y-6 max-w-lg">
                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Current Validation Token</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <input
                                                        type={showOldPassword ? "text" : "password"}
                                                        required
                                                        value={oldPassword}
                                                        onChange={(e) => setOldPassword(e.target.value)}
                                                        className="pl-12 pr-12 w-full py-4 bg-muted/30 border border-border/50 rounded-md focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
                                                        placeholder="Enter current password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="h-px bg-border/50 w-full my-4"></div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">New System Password</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <input
                                                        type={showNewPassword ? "text" : "password"}
                                                        required
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        className="pl-12 pr-12 w-full py-4 bg-muted/30 border border-border/50 rounded-md focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
                                                        placeholder="Create complex password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Verify New Password</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        required
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="pl-12 pr-12 w-full py-4 bg-muted/30 border border-border/50 rounded-md focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
                                                        placeholder="Repeat new password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full sm:w-auto flex items-center justify-center px-10 py-4 bg-primary text-black font-black rounded-md hover:bg-yellow-400 transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
                                            >
                                                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                                Synchronize Security
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'appearance' && (
                                <div className="p-8 sm:p-12 space-y-10">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-foreground">Visual Interface</h3>
                                        <p className="text-muted-foreground font-medium">Personalize the dashboard aesthetics to match your workflow.</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center justify-between p-8 border border-border/60 rounded-md bg-muted/20 gap-6">
                                        <div className="text-center sm:text-left">
                                            <p className="font-black text-lg">System Dynamic Theme</p>
                                            <p className="text-sm text-muted-foreground font-medium">Switch between high-contrast Dark and natural Light modes.</p>
                                        </div>
                                        <div className="bg-background p-2 rounded-md shadow-inner border border-border/50">
                                            <ModeToggle />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="p-8 sm:p-12 space-y-10">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-foreground">Intelligence Alerts</h3>
                                        <p className="text-muted-foreground font-medium">Configure how the system communicates critical events.</p>
                                    </div>
                                    <div className="space-y-4">
                                        {notificationSettings.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => toggleNotification(item.id)}
                                                className="group flex items-start gap-5 p-6 rounded-md border border-border/30 hover:bg-muted/30 hover:border-primary/20 transition-all cursor-pointer"
                                            >
                                                <div className="flex items-center pt-1">
                                                    <div className={clsx(
                                                        "h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all",
                                                        item.checked ? "bg-primary border-primary shadow-sm shadow-primary/30" : "border-zinc-300 dark:border-zinc-700"
                                                    )}>
                                                        {item.checked && <CheckCircle2 className="h-4 w-4 text-black" />}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-foreground transition-colors group-hover:text-primary">{item.title}</p>
                                                    <p className="text-sm text-muted-foreground font-medium mt-1">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            )}

                            {activeTab === 'commissions' && (
                                <div className="p-8 sm:p-12 space-y-10">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-foreground">Commission Structure</h3>
                                        <p className="text-muted-foreground font-medium">Configure multi-level referral commission rates for your network.</p>
                                    </div>

                                    {isLoadingCommissions ? (
                                        <div className="flex justify-center p-12">
                                            <Loader2 className="animate-spin h-8 w-8 text-primary" />
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="bg-muted/30 border border-border/50 rounded-md overflow-hidden">
                                                <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/50 bg-muted/20 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                                    <div className="col-span-2 text-center">Level</div>
                                                    <div className="col-span-5">Percentage Share</div>
                                                    <div className="col-span-3 text-center">Status</div>
                                                    <div className="col-span-2 text-right">Action</div>
                                                </div>

                                                {commissionConfigs.length === 0 && (
                                                    <div className="p-8 text-center text-muted-foreground text-sm font-medium">
                                                        No commission levels configured.
                                                    </div>
                                                )}

                                                {commissionConfigs.map((config, idx) => (
                                                    <div key={idx} className="grid grid-cols-12 gap-4 p-4 items-center border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                                                        <div className="col-span-2 flex justify-center">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary">
                                                                {config.level}
                                                            </div>
                                                        </div>
                                                        <div className="col-span-5">
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    value={config.percentage}
                                                                    onChange={(e) => handleConfigChange(idx, 'percentage', e.target.value)}
                                                                    className="w-full pl-4 pr-8 py-2 bg-background border border-border rounded-md text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                                    placeholder="0.0"
                                                                    step="0.1"
                                                                    min="0"
                                                                    max="100"
                                                                />
                                                                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                            </div>
                                                        </div>
                                                        <div className="col-span-3 flex justify-center">
                                                            <button
                                                                onClick={() => handleConfigChange(idx, 'is_active', !config.is_active)}
                                                                className={clsx(
                                                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                                                    config.is_active ? 'bg-emerald-500' : 'bg-muted'
                                                                )}
                                                            >
                                                                <span
                                                                    className={clsx(
                                                                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                                                        config.is_active ? 'translate-x-6' : 'translate-x-1'
                                                                    )}
                                                                />
                                                            </button>
                                                        </div>
                                                        <div className="col-span-2 flex justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveLevel(idx)}
                                                                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                                                                title="Remove Level"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-between pt-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleAddLevel}
                                                        className="flex items-center px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs uppercase tracking-wider rounded-md transition-all border border-border"
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Add Level
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => refetchCommissions()}
                                                        className="flex items-center px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs uppercase tracking-wider rounded-md transition-all border border-border"
                                                        title="Refresh Configuration"
                                                    >
                                                        <RefreshCw className="h-4 w-4 mr-2" />
                                                        Refresh
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={handleSaveCommissions}
                                                    disabled={isUpdatingCommissions}
                                                    className="flex items-center px-8 py-2 bg-primary text-black font-black uppercase tracking-wider rounded-md hover:bg-yellow-400 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                                >
                                                    {isUpdatingCommissions ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                                    Save Configuration
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'general' && (
                                <div className="p-8 sm:p-12 space-y-10">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-foreground">General Configuration</h3>
                                        <p className="text-muted-foreground font-medium">Basic application settings and maintenance controls.</p>
                                    </div>

                                    <div className="space-y-6 max-w-lg">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Application Name</label>
                                            <div className="relative group">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="text"
                                                    value={generalSettings.siteName}
                                                    onChange={(e) => handleGeneralChange('siteName', e.target.value)}
                                                    className="pl-12 pr-4 w-full py-4 bg-muted/30 border border-border/50 rounded-md focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Support Email</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="email"
                                                    value={generalSettings.supportEmail}
                                                    onChange={(e) => handleGeneralChange('supportEmail', e.target.value)}
                                                    className="pl-12 pr-4 w-full py-4 bg-muted/30 border border-border/50 rounded-md focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between border-t border-border/50">
                                            <div>
                                                <p className="font-bold text-foreground">Maintenance Mode</p>
                                                <p className="text-xs text-muted-foreground">Disable user access temporarily</p>
                                            </div>
                                            <button
                                                onClick={() => handleGeneralChange('maintenanceMode', !generalSettings.maintenanceMode)}
                                                className={clsx(
                                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                                    generalSettings.maintenanceMode ? 'bg-primary' : 'bg-muted'
                                                )}
                                            >
                                                <span
                                                    className={clsx(
                                                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                                        generalSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                                                    )}
                                                />
                                            </button>
                                        </div>

                                        <div className="pt-6">
                                            <button
                                                onClick={saveGeneralSettings}
                                                className="w-full sm:w-auto flex items-center justify-center px-10 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-black rounded-md hover:opacity-90 transition-all"
                                            >
                                                Save General Settings
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div >
            </div >
        </div >
    )
}
