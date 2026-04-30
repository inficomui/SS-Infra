'use client'

import { useState } from 'react'
import { useGetPlansQuery, useCreatePlanMutation, useDeletePlanMutation, useUpdatePlanMutation } from '@/redux/apis/plansApi'
import { Loader2, Plus, Check, X, Trash2, Edit2, Zap, Crown, Star, RefreshCw, Database, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Default Plans — keys match the actual API schema ────────────────────────
const DEFAULT_PLANS = [
    {
        name: 'Trial',
        type: 'trial',
        price: 0,
        durationDays: 7,
        description: 'Free trial for new machine owners. Single operator testing with demo clients and first-time contractors.',
        features: ['1 machine access', 'Basic earnings dashboard', 'Operator login', 'Push notifications', 'Withdrawal request demo', 'Basic admin access'],
        isActive: true,
        displayOrder: 1,
    },
    {
        name: 'Basic',
        type: 'monthly',
        price: 299,
        durationDays: 30,
        description: 'Essential plan for small fleet owners. Track daily earnings, manage operators and run basic job assignments.',
        features: ['Up to 3 machines', 'Daily earnings tracking', 'Machine live status', 'Job assignment', 'Withdrawal requests', 'Role based access', 'Basic reports'],
        isActive: true,
        displayOrder: 2,
    },
    {
        name: 'Growth',
        type: 'monthly',
        price: 699,
        durationDays: 30,
        description: 'Advanced fleet monitoring for growing contractors. Includes financial ledger, live sync and priority support.',
        features: ['Up to 15 machines', 'Advanced fleet monitoring', 'Live sync', 'Financial ledger', 'Operator performance reports', 'Priority support', 'Export reports'],
        isActive: true,
        displayOrder: 3,
    },
    {
        name: 'Enterprise',
        type: 'annual',
        price: 9999,
        durationDays: 365,
        description: 'Full-scale enterprise solution. Unlimited machines, dedicated support, white-label branding and API integrations.',
        features: ['Unlimited machines', 'Unlimited operators', 'Multi-location management', 'Dedicated support', 'Advanced analytics', 'White-label branding', 'Custom reporting', 'API integrations'],
        isActive: true,
        displayOrder: 4,
    },
]

const TYPE_COLORS: Record<string, string> = {
    trial: 'from-zinc-400 to-zinc-600',
    monthly: 'from-sky-400 to-blue-600',
    quarterly: 'from-teal-400 to-emerald-600',
    semi_annual: 'from-violet-400 to-purple-600',
    annual: 'from-amber-400 to-orange-600',
}

function PlanIcon({ price }: { price: number }) {
    if (price === 0) return <Star className="h-7 w-7 text-primary group-hover:text-white" strokeWidth={2.5} />
    if (price > 1000) return <Crown className="h-7 w-7 text-primary group-hover:text-white" strokeWidth={2.5} />
    return <Zap className="h-7 w-7 text-primary group-hover:text-white" strokeWidth={2.5} />
}

const BLANK_FORM = {
    name: '',
    type: 'monthly',
    price: '',
    durationDays: '30',
    description: '',
    isActive: true,
    displayOrder: '',
    features: [''],
}

export default function PlansPage() {
    const { data, isLoading, error, refetch } = useGetPlansQuery({ showInactive: true })
    const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation()
    const [deletePlan] = useDeletePlanMutation()
    const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState<any | null>(null)
    const [isSeedingAll, setIsSeedingAll] = useState(false)
    const [seedingPlanName, setSeedingPlanName] = useState<string | null>(null)

    const [formData, setFormData] = useState<any>({ ...BLANK_FORM })

    const resetForm = () => { setFormData({ ...BLANK_FORM }); setEditingPlan(null) }

    const handleOpenModal = (plan?: any) => {
        if (plan) {
            setEditingPlan(plan)
            setFormData({
                name: plan.name || '',
                type: plan.type || 'monthly',
                price: String(plan.price ?? ''),
                durationDays: String(plan.durationDays ?? 30),
                description: plan.description || '',
                isActive: plan.isActive !== false,
                displayOrder: String(plan.displayOrder ?? ''),
                features: plan.features?.length > 0 ? plan.features : [''],
            })
        } else {
            resetForm()
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => { setIsModalOpen(false); resetForm() }

    const handleFeatureChange = (i: number, v: string) => {
        const f = [...formData.features]; f[i] = v
        setFormData({ ...formData, features: f })
    }
    const addFeature = () => setFormData({ ...formData, features: [...formData.features, ''] })
    const removeFeature = (i: number) => setFormData({
        ...formData,
        features: formData.features.filter((_: any, idx: number) => idx !== i)
    })

    const buildPayload = (fd: any) => ({
        name: fd.name,
        type: fd.type,
        price: parseFloat(fd.price) || 0,
        durationDays: parseInt(fd.durationDays) || 30,
        description: fd.description,
        isActive: fd.isActive,
        displayOrder: fd.displayOrder ? parseInt(fd.displayOrder) : undefined,
        features: fd.features.filter((f: string) => f.trim() !== ''),
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name) { toast.error('Plan name is required'); return }
        try {
            if (editingPlan) {
                await updatePlan({ id: editingPlan.id, data: buildPayload(formData) }).unwrap()
                toast.success('Plan updated successfully')
            } else {
                await createPlan(buildPayload(formData)).unwrap()
                toast.success('Plan created successfully')
            }
            handleCloseModal()
        } catch (err: any) {
            console.error('Plan save failed', err)
            if (err?.data?.errors) {
                Object.values(err.data.errors).flat().forEach((msg: any) => toast.error(msg))
            } else {
                toast.error(err?.data?.message || 'Failed to save plan')
            }
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this plan? This cannot be undone.')) return
        try { await deletePlan(id).unwrap(); toast.success('Plan deleted') }
        catch { toast.error('Failed to delete plan') }
    }

    // ── Seed all 4 default plans into the DB ──────────────────────────────────
    const handleSeedDefaultPlans = async () => {
        if (!confirm('Insert all 4 default plans into the database via the API?')) return
        setIsSeedingAll(true)
        let created = 0; let failed = 0
        for (const plan of DEFAULT_PLANS) {
            try { await createPlan(plan).unwrap(); created++ }
            catch (err: any) { failed++; console.error(`Failed: ${plan.name}`, err) }
        }
        setIsSeedingAll(false)
        if (created > 0) toast.success(`${created} plan(s) added to database`)
        if (failed > 0) toast.error(`${failed} plan(s) failed (may already exist)`)
        refetch()
    }

    // ── Seed a single plan into the DB ────────────────────────────────────────
    const handleSeedSinglePlan = async (plan: typeof DEFAULT_PLANS[0]) => {
        setSeedingPlanName(plan.name)
        try {
            await createPlan(plan).unwrap()
            toast.success(`"${plan.name}" added to database`)
            refetch()
        } catch (err: any) {
            toast.error(err?.data?.message || `Failed to add ${plan.name}`)
        } finally {
            setSeedingPlanName(null)
        }
    }

    const plans = data?.plans || []

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-card border border-border p-8 rounded-[16px] shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shrink-0">
                        <Zap className="h-7 w-7 text-primary" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-foreground tracking-tight">Subscription Plans</h2>
                        <p className="text-sm font-medium text-foreground/60 mt-1 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                            Pricing Architecture &amp; Plan Control
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button onClick={() => refetch()} className="p-3 text-foreground hover:text-primary hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all border border-border" title="Refresh">
                        <RefreshCw className="h-5 w-5" />
                    </button>
                    {plans.length === 0 && (
                        <button
                            onClick={handleSeedDefaultPlans}
                            disabled={isSeedingAll}
                            className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50 text-sm"
                        >
                            {isSeedingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            Add All 4 to DB
                        </button>
                    )}
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center px-6 py-3 bg-primary text-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-xl shadow-primary/25 active:scale-95 shrink-0"
                    >
                        <Plus className="h-5 w-5 mr-2" strokeWidth={3} />
                        Create Plan
                    </button>
                </div>
            </div>

            {/* ── Content ── */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <Loader2 className="animate-spin h-10 w-10 text-primary" />
                    <p className="text-sm font-bold text-foreground/50 uppercase tracking-widest">Fetching from Database...</p>
                </div>
            ) : error ? (
                <div className="p-10 text-destructive text-center bg-destructive/10 rounded-xl">Error loading plans from database</div>
            ) : plans.length === 0 ? (
                /* ── Empty state: seed panel ── */
                <div className="space-y-6">
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center border border-amber-300 dark:border-amber-700">
                            <Database className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-amber-800 dark:text-amber-300">No plans found in the database</h3>
                            <p className="text-sm text-amber-700/80 dark:text-amber-400/70 mt-1">
                                Click <strong>"Add to Database"</strong> on each plan, or <strong>"Add All 4 to DB"</strong> in the header to insert them via the API.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                        {DEFAULT_PLANS.map((plan, idx) => {
                            const isAddingThis = seedingPlanName === plan.name
                            return (
                                <motion.div
                                    key={plan.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08 }}
                                    className="relative bg-card rounded-2xl border border-dashed border-border overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all"
                                >
                                    <div className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold rounded uppercase tracking-wide border border-zinc-200 dark:border-zinc-700 flex items-center gap-1">
                                        <Database className="h-2.5 w-2.5" /> Not in DB
                                    </div>

                                    <div className={clsx('h-1.5 w-full bg-gradient-to-r', TYPE_COLORS[plan.type] || TYPE_COLORS['monthly'])} />

                                    <div className="p-5">
                                        <div className="flex items-center gap-3 mb-3 mt-6">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                                <PlanIcon price={plan.price} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-foreground">{plan.name}</h3>
                                                <span className="text-[11px] font-semibold text-foreground/50 capitalize">{plan.type} · {plan.durationDays} days</span>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <span className="text-3xl font-black text-foreground">₹{plan.price}</span>
                                            <span className="text-xs text-foreground/50 ml-1.5">/ {plan.durationDays} days</span>
                                        </div>

                                        <p className="text-xs text-foreground/50 mb-4 line-clamp-2">{plan.description}</p>

                                        <ul className="space-y-1.5 mb-5">
                                            {plan.features.slice(0, 4).map((f, fi) => (
                                                <li key={fi} className="flex items-start gap-2">
                                                    <Check className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" strokeWidth={3} />
                                                    <span className="text-xs text-foreground/60">{f}</span>
                                                </li>
                                            ))}
                                            {plan.features.length > 4 && (
                                                <li className="text-xs text-primary font-bold ml-5">+{plan.features.length - 4} more</li>
                                            )}
                                        </ul>

                                        <button
                                            onClick={() => handleSeedSinglePlan(plan)}
                                            disabled={isAddingThis || isSeedingAll}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30 hover:border-primary rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                        >
                                            {isAddingThis ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                            Add to Database
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            ) : (
                /* ── Live plan cards from DB ── */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {plans.map((plan: any, idx: number) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className={clsx(
                                'group relative bg-card rounded-2xl overflow-hidden border transition-all duration-300',
                                !plan.isActive
                                    ? 'border-dashed border-border opacity-60'
                                    : 'border-border hover:border-primary/50 hover:shadow-xl hover:-translate-y-1'
                            )}
                        >
                            {!plan.isActive && (
                                <div className="absolute top-3 right-3 z-10 px-2 py-0.5 bg-muted text-foreground/50 text-[10px] font-bold rounded uppercase border border-border">Inactive</div>
                            )}

                            <div className={clsx('h-1.5 w-full bg-gradient-to-r', TYPE_COLORS[plan.type] || TYPE_COLORS['monthly'])} />

                            <div className="p-6 pb-0">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                                        <PlanIcon price={parseFloat(plan.price)} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors">{plan.name}</h3>
                                        <span className="text-[11px] font-semibold text-foreground/50 capitalize">{plan.typeName || plan.type}</span>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-foreground">₹{parseFloat(plan.price).toFixed(0)}</span>
                                        <span className="text-xs font-bold text-foreground/50 uppercase ml-1">/ {plan.durationDays} days</span>
                                    </div>
                                </div>

                                {plan.description && (
                                    <p className="text-xs text-foreground/50 mb-4 line-clamp-2">{plan.description}</p>
                                )}
                            </div>

                            <div className="px-6 pb-4">
                                <ul className="space-y-2">
                                    {plan.features?.slice(0, 5).map((feature: string, fi: number) => (
                                        <li key={fi} className="flex items-start gap-2.5">
                                            <div className="mt-0.5 shrink-0 h-4 w-4 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                                <Check className="h-2.5 w-2.5 text-emerald-500" strokeWidth={3} />
                                            </div>
                                            <span className="text-xs font-semibold text-foreground/70">{feature}</span>
                                        </li>
                                    ))}
                                    {plan.features?.length > 5 && (
                                        <li className="text-xs text-primary font-bold ml-6">+{plan.features.length - 5} more</li>
                                    )}
                                </ul>
                            </div>

                            <div className="px-4 pb-4 pt-2 flex justify-between items-center border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] text-foreground/40 font-mono">#{plan.id} · order {plan.displayOrder}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => handleOpenModal(plan)} className="p-2 text-foreground hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border" title="Edit">
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete(plan.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Add new plan card */}
                    <button
                        onClick={() => handleOpenModal()}
                        className="group flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all min-h-[260px]"
                    >
                        <div className="h-14 w-14 rounded-2xl bg-muted group-hover:bg-primary flex items-center justify-center transition-all duration-300 mb-4 group-hover:rotate-12">
                            <Plus className="h-7 w-7 text-foreground group-hover:text-white" strokeWidth={3} />
                        </div>
                        <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors">Create Plan</span>
                        <span className="text-xs text-foreground/50 mt-1">Add a custom pricing tier</span>
                    </button>
                </div>
            )}

            {/* ── Create / Edit Modal ── */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-card w-full max-w-xl rounded-2xl shadow-2xl pointer-events-auto border border-border flex flex-col max-h-[92vh] overflow-hidden"
                            >
                                <div className="p-6 border-b border-border flex justify-between items-center bg-blue-50/50 dark:bg-blue-950/20 shrink-0">
                                    <div>
                                        <h3 className="text-xl font-black text-foreground">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
                                        <p className="text-xs text-foreground/60 mt-0.5">Fields match the database schema</p>
                                    </div>
                                    <button onClick={handleCloseModal} className="p-2 hover:bg-muted rounded-xl transition-all">
                                        <X className="h-5 w-5 text-foreground" />
                                    </button>
                                </div>

                                <div className="overflow-y-auto">
                                    <form onSubmit={handleSubmit} className="p-6 space-y-5">

                                        {/* Name */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Plan Name *</label>
                                            <input
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g. Basic Plan"
                                                className="block w-full px-3 py-2.5 bg-muted/50 border border-transparent rounded-xl text-sm font-bold focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                            />
                                        </div>

                                        {/* Type & Duration */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Type</label>
                                                <select
                                                    value={formData.type}
                                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                                    className="block w-full px-3 py-2.5 bg-muted/50 border border-transparent rounded-xl text-sm font-bold focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all appearance-none"
                                                >
                                                    <option value="trial">Trial</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="quarterly">Quarterly</option>
                                                    <option value="semi_annual">Semi Annual</option>
                                                    <option value="annual">Annual</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Duration (Days) *</label>
                                                <input
                                                    required type="number" min="1"
                                                    value={formData.durationDays}
                                                    onChange={e => setFormData({ ...formData, durationDays: e.target.value })}
                                                    placeholder="30"
                                                    className="block w-full px-3 py-2.5 bg-muted/50 border border-transparent rounded-xl text-sm font-bold focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Price & Display Order */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Price (₹) *</label>
                                                <input
                                                    required type="number" min="0" step="0.01"
                                                    value={formData.price}
                                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                    placeholder="0"
                                                    className="block w-full px-3 py-2.5 bg-muted/50 border border-transparent rounded-xl text-sm font-bold focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Display Order</label>
                                                <input
                                                    type="number" min="0"
                                                    value={formData.displayOrder}
                                                    onChange={e => setFormData({ ...formData, displayOrder: e.target.value })}
                                                    placeholder="1"
                                                    className="block w-full px-3 py-2.5 bg-muted/50 border border-transparent rounded-xl text-sm font-bold focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Description</label>
                                            <textarea
                                                rows={3}
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Describe what's included in this plan..."
                                                className="block w-full px-3 py-2.5 bg-muted/50 border border-transparent rounded-xl text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none"
                                            />
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider flex justify-between items-center">
                                                <span>Features</span>
                                                <button type="button" onClick={addFeature} className="text-xs text-primary font-bold hover:underline normal-case tracking-normal">
                                                    + Add Feature
                                                </button>
                                            </label>
                                            <div className="space-y-2">
                                                {formData.features.map((feature: string, index: number) => (
                                                    <div key={index} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={feature}
                                                            onChange={e => handleFeatureChange(index, e.target.value)}
                                                            placeholder="e.g. Unlimited machines"
                                                            className="block w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                                        />
                                                        <button type="button" onClick={() => removeFeature(index)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Active Toggle */}
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                                    className="sr-only"
                                                />
                                                <div className={clsx('w-10 h-6 rounded-full shadow-inner transition-colors', formData.isActive ? 'bg-primary' : 'bg-muted')} />
                                                <div className={clsx('absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform', formData.isActive && 'translate-x-4')} />
                                            </div>
                                            <span className="text-sm font-semibold text-foreground">Active (visible to users)</span>
                                        </label>

                                        {/* Submit */}
                                        <div className="pt-4 flex justify-end gap-3 border-t border-border">
                                            <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 border border-border rounded-xl text-sm font-bold text-foreground hover:bg-muted transition-all">
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isCreating || isUpdating}
                                                className="px-8 py-2.5 bg-primary text-foreground rounded-xl shadow-lg shadow-primary/25 text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {(isCreating || isUpdating) && <Loader2 className="h-4 w-4 animate-spin" />}
                                                {editingPlan ? 'Update Plan' : 'Create Plan'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
