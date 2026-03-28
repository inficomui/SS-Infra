'use client'

import { useState } from 'react'
import { useGetPlansQuery, useCreatePlanMutation, useDeletePlanMutation, useUpdatePlanMutation } from '@/redux/apis/plansApi'
import { Loader2, Plus, Check, X, Trash2, Edit2, Shield, Zap, Crown, Star, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

export default function PlansPage() {
    const { data, isLoading, error, refetch } = useGetPlansQuery({ showInactive: true })
    const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation()
    const [deletePlan, { isLoading: isDeleting }] = useDeletePlanMutation()
    const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState<any | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        type: 'monthly',
        price: '',
        durationDays: '30',
        description: '',
        isActive: true,
        features: ['']
    })

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'monthly',
            price: '',
            durationDays: '30',
            description: '',
            isActive: true,
            features: ['']
        })
        setEditingPlan(null)
    }

    const handleOpenModal = (plan?: any) => {
        if (plan) {
            setEditingPlan(plan)
            setFormData({
                name: plan.name,
                type: plan.type,
                price: plan.price.toString(),
                durationDays: plan.durationDays.toString(),
                description: plan.description,
                isActive: plan.isActive,
                features: plan.features && plan.features.length > 0 ? plan.features : ['']
            })
        } else {
            resetForm()
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        resetForm()
    }

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...formData.features]
        newFeatures[index] = value
        setFormData({ ...formData, features: newFeatures })
    }

    const addFeature = () => {
        setFormData({ ...formData, features: [...formData.features, ''] })
    }

    const removeFeature = (index: number) => {
        const newFeatures = formData.features.filter((_, i) => i !== index)
        setFormData({ ...formData, features: newFeatures })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.price || !formData.durationDays) {
            toast.error('Please fill in all required fields')
            return
        }

        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            durationDays: parseInt(formData.durationDays),
            features: formData.features.filter(f => f.trim() !== '')
        }

        try {
            if (editingPlan) {
                await updatePlan({ id: editingPlan.id, data: payload }).unwrap()
                toast.success('Plan updated successfully')
            } else {
                await createPlan(payload).unwrap()
                toast.success('Plan created successfully')
            }
            handleCloseModal()
        } catch (err: any) {
            console.error('Plan save failed', err)
            toast.error(err?.data?.message || 'Failed to save plan')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this plan?')) return
        try {
            await deletePlan(id).unwrap()
            toast.success('Plan deleted')
        } catch (err: any) {
            toast.error('Failed to delete plan')
        }
    }

    const plans = data?.plans || []

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-card border border-border p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shrink-0">
                        <Zap className="h-7 w-7 text-primary" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-foreground tracking-tight">Subscription Plans</h2>
                        <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                            Pricing Architecture & Yield Control
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="p-3 text-muted-foreground hover:text-primary hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-zinc-200 dark:hover:border-white/10"
                        title="Sync with Node"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center px-6 py-3 bg-primary text-black font-black rounded-xl hover:opacity-90 transition-all shadow-xl shadow-primary/25 active:scale-95 shrink-0"
                    >
                        <Plus className="h-5 w-5 mr-2" strokeWidth={3} />
                        Create New Plan
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
            ) : error ? (
                <div className="p-10 text-destructive text-center bg-destructive/10 rounded-md">Error loading plans</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan: any, idx: number) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={clsx(
                                "group relative bg-card rounded-[2rem] overflow-hidden border transition-all duration-500",
                                !plan.isActive 
                                    ? "border-dashed border-border opacity-70" 
                                    : "border-border hover:border-primary/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:-translate-y-2"
                            )}
                        >
                            {!plan.isActive && (
                                <div className="absolute top-4 right-4 px-3 py-1 bg-muted/80 backdrop-blur-sm text-muted-foreground text-xs rounded-md font-bold uppercase tracking-wide border border-border">
                                    Inactive
                                </div>
                            )}

                            {/* Card Header */}
                            <div className="p-8 pb-0">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:bg-primary group-hover:border-primary transition-all duration-500 group-hover:rotate-6">
                                    {plan.price > 1000 ? <Crown className="h-7 w-7 text-primary group-hover:text-black" strokeWidth={2.5} /> :
                                        plan.price > 0 ? <Zap className="h-7 w-7 text-primary group-hover:text-black" strokeWidth={2.5} /> :
                                            <Star className="h-7 w-7 text-primary group-hover:text-black" strokeWidth={2.5} />}
                                </div>
                                <h3 className="text-2xl font-black text-foreground dark:text-white group-hover:text-primary transition-colors tracking-tight">{plan.name}</h3>
                                <p className="text-sm font-medium text-muted-foreground dark:text-zinc-400 mt-2 line-clamp-2 min-h-[40px] opacity-80">{plan.description}</p>
                            </div>

                            {/* Pricing */}
                            <div className="p-8 pt-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-foreground tracking-tighter">₹{plan.price}</span>
                                    <span className="text-xs font-black text-muted-foreground uppercase tracking-widest bg-muted/30 px-2 py-1 rounded-md">/ {plan.durationDays} days</span>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="px-8 pb-8">
                                <ul className="space-y-4">
                                    {plan.features?.map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-start group/feature">
                                            <div className="mr-3 mt-0.5 shrink-0 h-5 w-5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20 group-hover/feature:bg-emerald-500 transition-all">
                                                <Check className="h-3 w-3 text-emerald-500 group-hover/feature:text-white" strokeWidth={3} />
                                            </div>
                                            <span className="text-sm font-bold text-muted-foreground dark:text-zinc-400 group-hover/feature:text-foreground dark:group-hover/feature:text-white transition-colors">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Actions */}
                            <div className="p-4 bg-muted/30 border-t border-border/50 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenModal(plan)}
                                    className="p-2 text-foreground hover:bg-background rounded-md transition-colors border border-transparent hover:border-border"
                                    title="Edit Plan"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors border border-transparent hover:border-destructive/20"
                                    title="Delete Plan"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {/* Add New Plan Placeholder */}
                    <button
                        onClick={() => handleOpenModal()}
                        className="group flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-3xl hover:border-primary/50 hover:bg-primary/5 transition-all text-center min-h-[400px]"
                    >
                        <div className="h-16 w-16 rounded-2xl bg-muted dark:bg-white/5 group-hover:bg-primary flex items-center justify-center transition-all duration-500 mb-6 group-hover:rotate-12 group-hover:scale-110">
                            <Plus className="h-8 w-8 text-muted-foreground dark:text-zinc-500 group-hover:text-black transition-colors" strokeWidth={3} />
                        </div>
                        <span className="text-xl font-black text-foreground dark:text-white group-hover:text-primary transition-colors">Create New Plan</span>
                        <span className="text-sm font-medium text-muted-foreground dark:text-zinc-500 mt-2 opacity-60">Architect a new pricing tier</span>
                    </button>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                            onClick={handleCloseModal}
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-card w-full max-w-xl rounded-3xl shadow-2xl pointer-events-auto border border-border flex flex-col max-h-[90vh] overflow-hidden"
                            >
                                <div className="p-8 border-b border-border flex justify-between items-center bg-muted/20 shrink-0">
                                    <div>
                                        <h3 className="text-2xl font-black text-foreground dark:text-white tracking-tight">
                                            {editingPlan ? 'Refine Architecture' : 'Architect New Plan'}
                                        </h3>
                                        <p className="text-sm font-medium text-muted-foreground dark:text-zinc-500 mt-1">Configure parameters and yield factors</p>
                                    </div>
                                    <button onClick={handleCloseModal} className="text-muted-foreground hover:text-foreground dark:hover:text-white p-2.5 hover:bg-muted dark:hover:bg-white/5 rounded-xl transition-all active:scale-95">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="overflow-y-auto">
                                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-xs font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest ml-1">Plan Specification</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="e.g. Enterprise Tier"
                                                    className="block w-full px-4 py-3.5 bg-muted/30 dark:bg-white/5 border border-transparent focus:border-primary/50 dark:focus:border-primary/50 focus:bg-background dark:focus:bg-zinc-950 focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all font-bold placeholder:text-zinc-400 dark:text-white"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-xs font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest ml-1">Asset Yield (₹)</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        value={formData.price}
                                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                        className="block w-full px-4 py-3.5 bg-muted/30 dark:bg-white/5 border border-transparent focus:border-primary/50 focus:bg-background dark:focus:bg-zinc-950 focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all font-bold dark:text-white"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-xs font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest ml-1">Tenure (Days)</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="1"
                                                        value={formData.durationDays}
                                                        onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                                                        className="block w-full px-4 py-3.5 bg-muted/30 dark:bg-white/5 border border-transparent focus:border-primary/50 focus:bg-background dark:focus:bg-zinc-950 focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all font-bold dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-xs font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-widest ml-1">Category</label>
                                                <select
                                                    value={formData.type}
                                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                    className="block w-full px-4 py-3.5 bg-muted/30 dark:bg-white/5 border border-transparent focus:border-primary/50 focus:bg-background dark:focus:bg-zinc-950 focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all font-bold outline-none dark:text-white appearance-none"
                                                >
                                                    <option value="trial">Trial</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="quarterly">Quarterly</option>
                                                    <option value="semi_annual">Semi Annual</option>
                                                    <option value="annual">Annual</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground">Description</label>
                                                <textarea
                                                    rows={3}
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className="block w-full px-3 py-2.5 bg-muted/30 border border-border rounded-md text-sm focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground flex justify-between items-center">
                                                    <span>Features</span>
                                                    <button type="button" onClick={addFeature} className="text-xs text-primary font-bold hover:underline">
                                                        + Add Feature
                                                    </button>
                                                </label>
                                                <div className="space-y-2">
                                                    {formData.features.map((feature, index) => (
                                                        <div key={index} className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={feature}
                                                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                                                placeholder="Feature details"
                                                                className="block w-full px-3 py-2 bg-muted/30 border border-border rounded-md text-sm focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFeature(index)}
                                                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center pt-2">
                                            <label className="flex items-center cursor-pointer">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.isActive}
                                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                        className="sr-only"
                                                    />
                                                    <div className={clsx("w-10 h-6 bg-muted rounded-md shadow-inner transition-colors", formData.isActive && "bg-primary")}></div>
                                                    <div className={clsx("absolute top-1 left-1 bg-white w-4 h-4 rounded-md shadow transition-transform", formData.isActive && "translate-x-4")}></div>
                                                </div>
                                                <span className="ml-3 text-sm font-medium text-foreground">Active (Visible to users)</span>
                                            </label>
                                        </div>

                                        <div className="pt-6 flex justify-end gap-4">
                                            <button
                                                type="button"
                                                onClick={handleCloseModal}
                                                className="px-6 py-3 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-black text-muted-foreground hover:bg-muted dark:hover:bg-white/5 transition-all active:scale-95"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isCreating || isUpdating}
                                                className="px-8 py-3 bg-primary text-black rounded-xl shadow-xl shadow-primary/25 text-sm font-black hover:opacity-90 transition-all disabled:opacity-50 active:scale-95"
                                            >
                                                {isCreating || isUpdating ? 'Processing...' : 'Deploy Plan'}
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
