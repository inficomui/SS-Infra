'use client'

import React, { useState, useEffect } from 'react'
import { useGetOperatorsQuery, useCreateOperatorMutation, useUpdateOperatorMutation, useDeleteOperatorMutation } from '@/redux/apis/usersApi'
import { Loader2, Search, Filter, MoreVertical, Eye, MapPin, Phone, Hash, ChevronLeft, ChevronRight, User, Shield, Plus, X, Edit2, Trash2, MoreHorizontal, RefreshCw, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import SubscriptionManagerModal from '@/components/subscriptions/SubscriptionManagerModal'

export default function OperatorsPage() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    // Proper Debounce Logic
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search)
        }, 500)
        return () => clearTimeout(handler)
    }, [search])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingOperator, setEditingOperator] = useState<any>(null)

    // Subscription Modal State
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
    const [selectedOperatorForSub, setSelectedOperatorForSub] = useState<any>(null)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        district: '',
        taluka: '',
        referralCode: '',
        role: 'Operator'
    })

    const [createOperator, { isLoading: isCreating }] = useCreateOperatorMutation()
    const [updateOperator, { isLoading: isUpdating }] = useUpdateOperatorMutation()
    const [deleteOperator] = useDeleteOperatorMutation()

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    const { data, isLoading, refetch } = useGetOperatorsQuery({
        page,
        limit: 10,
        search: debouncedSearch
    })

    const handleEdit = (operator: any) => {
        setEditingOperator(operator)
        setFormData({
            name: operator.name,
            mobile: operator.mobile,
            district: operator.district,
            taluka: operator.taluka,
            referralCode: operator.referralCode || '',
            role: operator.role || 'Operator'
        })
        setIsModalOpen(true)
    }

    const handleManageSubscription = (operator: any) => {
        setSelectedOperatorForSub(operator)
        setIsSubscriptionModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this operator? This action cannot be undone.')) {
            try {
                await deleteOperator(id).unwrap()
                toast.success('Operator deleted successfully')
            } catch (err: any) {
                toast.error(err?.data?.message || 'Failed to delete operator')
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingOperator) {
                await updateOperator({ id: editingOperator.id, data: formData }).unwrap()
                toast.success('Operator updated successfully')
            } else {
                await createOperator(formData).unwrap()
                toast.success('Operator created successfully')
            }
            setIsModalOpen(false)
            setFormData({ name: '', mobile: '', district: '', taluka: '', referralCode: '', role: 'Operator' })
            setEditingOperator(null)
        } catch (err: any) {
            console.error('Failed to save operator:', err)
            if (err?.data?.errors) {
                Object.values(err.data.errors).flat().forEach((msg: any) => {
                    toast.error(msg)
                })
            } else {
                toast.error(err?.data?.message || 'Failed to save operator')
            }
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingOperator(null)
        setFormData({ name: '', mobile: '', district: '', taluka: '', referralCode: '', role: 'Operator' })
    }

    const operators = data?.operators || []
    const pagination = data?.pagination

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-card border border-border p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shrink-0">
                        <Shield className="h-7 w-7 text-primary" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-foreground tracking-tight">Operators & Drivers</h2>
                        <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                            Field Personnel & Logistics Control
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-80 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search personnel..."
                            value={search}
                            onChange={handleSearch}
                            className="block w-full pl-11 pr-4 py-3 bg-muted/30 border border-transparent focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all font-bold placeholder:text-muted-foreground"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingOperator(null)
                            setFormData({ name: '', mobile: '', district: '', taluka: '', referralCode: '', role: 'Operator' })
                            setIsModalOpen(true)
                        }}
                        className="flex items-center px-6 py-3 bg-primary text-black font-black rounded-xl hover:opacity-90 transition-all shadow-xl shadow-primary/25 active:scale-95 shrink-0"
                    >
                        <Plus className="h-5 w-5 mr-2" strokeWidth={3} />
                        Add Personnel
                    </button>
                </div>
            </div>

            {/* List Content */}
            <div className="bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl overflow-hidden border border-border transition-all">
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-80 space-y-4">
                        <Loader2 className="animate-spin h-10 w-10 text-primary" strokeWidth={3} />
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Accessing Node...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-muted/30 border-b border-border">
                                <tr>
                                    <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">User Details</th>
                                    <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">Privilege</th>
                                    <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">Geographic Node</th>
                                    <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">Referral</th>
                                    <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">Affiliation</th>
                                    <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">Verification</th>
                                    <th scope="col" className="relative px-8 py-5"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-transparent">
                                {operators.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="h-20 w-20 rounded-[2rem] bg-muted/30 flex items-center justify-center border border-border group hover:rotate-6 transition-all duration-500">
                                                    <User className="h-10 w-10 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-black text-foreground tracking-tight">No records located</p>
                                                    <p className="text-sm text-muted-foreground mt-1">Refine your search parameters or register new personnel.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : operators.map((operator: any, index: number) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={operator.id}
                                        className="group hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-11 w-11 shrink-0">
                                                    <div className="h-11 w-11 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
                                                        {operator.name?.[0]?.toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-black text-foreground group-hover:text-primary transition-colors tracking-tight">{operator.name}</div>
                                                    <div className="flex items-center text-[10px] font-black text-muted-foreground mt-1 uppercase tracking-widest opacity-70">
                                                        <Phone className="h-3 w-3 mr-1.5" />
                                                        {operator.mobile}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className={clsx(
                                                "inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                                                operator.role === 'Driver'
                                                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                    : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                                            )}>
                                                {operator.role || 'Operator'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <div className="flex items-center text-sm font-bold text-foreground">
                                                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                                    {operator.district || '-'}
                                                </div>
                                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-5 mt-1 opacity-60">{operator.taluka || '-'}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-tighter">
                                                <Hash className="h-3 w-3 mr-1" />
                                                {operator.referralCode || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            {operator.owner ? (
                                                <Link href={`/users/owners/${operator.owner.id}`} className="flex items-center group/owner">
                                                    <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-[10px] font-black mr-3 group-hover/owner:bg-primary group-hover/owner:text-black transition-all border border-border shadow-sm">
                                                        {operator.owner.name[0]}
                                                    </div>
                                                    <span className="text-xs font-bold text-foreground group-hover/owner:text-primary transition-colors">
                                                        {operator.owner.name}
                                                    </span>
                                                </Link>
                                            ) : (
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            {new Date(operator.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleManageSubscription(operator)}
                                                    className="p-2.5 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all border border-transparent hover:border-emerald-500/20"
                                                    title="Manage Subscription"
                                                >
                                                    <CreditCard className="h-4.5 w-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(operator)}
                                                    className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all border border-transparent hover:border-primary/20"
                                                    title="Edit Unit"
                                                >
                                                    <Edit2 className="h-4.5 w-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(operator.id)}
                                                    className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                                                    title="Decommission"
                                                >
                                                    <Trash2 className="h-4.5 w-4.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
 
                {pagination && pagination.totalPages > 1 && (
                    <div className="bg-muted/10 px-8 py-6 flex items-center justify-between border-t border-border">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hidden sm:block">
                            Node Cluster: <span className="text-foreground">{(pagination.total || pagination.totalCount || 0) || operators.length} Entities</span> Identified
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
                             <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-5 py-2 text-[10px] font-black uppercase tracking-widest bg-background border border-border rounded-xl hover:bg-muted disabled:opacity-30 transition-all disabled:grayscale"
                            >
                                Previous Node
                            </button>
                            <div className="h-9 px-4 flex items-center justify-center bg-primary text-black text-[10px] font-black rounded-lg shadow-lg shadow-primary/20 tracking-widest">
                                PAGE {page} / {pagination.totalPages}
                            </div>
                            <button
                                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                                disabled={page === pagination.totalPages}
                                className="px-5 py-2 text-[10px] font-black uppercase tracking-widest bg-background border border-border rounded-xl hover:bg-muted disabled:opacity-30 transition-all disabled:grayscale"
                            >
                                Next Node
                            </button>
                        </div>
                    </div>
                )}
            </div>


            {/* Create/Edit Operator Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                            onClick={closeModal}
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-card w-full max-w-lg rounded-md shadow-2xl pointer-events-auto border border-border/50 overflow-hidden"
                            >
                                <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/20">
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">{editingOperator ? 'Edit User' : 'Add New User'}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {editingOperator ? 'Update details' : 'Enter the details for the new operator or driver.'}
                                        </p>
                                    </div>
                                    <button onClick={closeModal} className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-md transition-colors">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    required
                                                    className="block w-full pl-10 pr-3 py-2.5 bg-muted/50 border border-transparent rounded-md text-sm focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                                    placeholder="e.g. Suresh Operator"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Mobile Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    type="tel"
                                                    required
                                                    pattern="[0-9]{10}"
                                                    className="block w-full pl-10 pr-3 py-2.5 bg-muted/50 border border-transparent rounded-md text-sm focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                                    placeholder="10 digit mobile number"
                                                    value={formData.mobile}
                                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Role</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <select
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                    className="block w-full pl-10 pr-3 py-2.5 bg-muted/50 border border-transparent rounded-md text-sm focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                                >
                                                    <option value="Operator">Operator</option>
                                                    <option value="Driver">Driver</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground">District</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <input
                                                        type="text"
                                                        required
                                                        className="block w-full pl-10 pr-3 py-2.5 bg-muted/50 border border-transparent rounded-md text-sm focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                                        placeholder="District"
                                                        value={formData.district}
                                                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground">Taluka</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="block w-full px-3 py-2.5 bg-muted/50 border border-transparent rounded-md text-sm focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                                    placeholder="Taluka"
                                                    value={formData.taluka}
                                                    onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Referral Code <span className="text-muted-foreground font-normal">(Optional)</span></label>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    className="block w-full pl-10 pr-3 py-2.5 bg-muted/50 border border-transparent rounded-md text-sm focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                                    placeholder="Enter referrer code"
                                                    value={formData.referralCode}
                                                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-5 py-2.5 border border-border rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isCreating || isUpdating}
                                            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-md shadow-lg shadow-primary/25 text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center"
                                        >
                                            {(isCreating || isUpdating) && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                                            {editingOperator ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Subscription Modal */}
            <SubscriptionManagerModal
                isOpen={isSubscriptionModalOpen}
                onClose={() => {
                    setIsSubscriptionModalOpen(false)
                    setSelectedOperatorForSub(null)
                }}
                userId={selectedOperatorForSub?.id || null}
                userName={selectedOperatorForSub?.name || ''}
                userRole="Operator"
            />
        </motion.div>
    )
}
