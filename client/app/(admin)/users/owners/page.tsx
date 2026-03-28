'use client'

import React, { useState, useEffect } from 'react'
import { useGetOwnersQuery, useCreateOwnerMutation, useUpdateOwnerMutation, useDeleteOwnerMutation } from '@/redux/apis/usersApi'
import { Loader2, Search, Plus, MapPin, User, X, Check, Filter, MoreHorizontal, ChevronLeft, ChevronRight, Phone, Hash, Edit2, Trash2, RefreshCw, CreditCard } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import SubscriptionManagerModal from '@/components/subscriptions/SubscriptionManagerModal'

export default function OwnersPage() {
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
    const [editingOwner, setEditingOwner] = useState<any>(null)

    // Subscription Modal State
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
    const [selectedOwnerForSub, setSelectedOwnerForSub] = useState<any>(null)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        district: '',
        taluka: '',
        referralCode: ''
    })

    const [createOwner, { isLoading: isCreating }] = useCreateOwnerMutation()
    const [updateOwner, { isLoading: isUpdating }] = useUpdateOwnerMutation()
    const [deleteOwner] = useDeleteOwnerMutation()

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    const { data, isLoading, refetch } = useGetOwnersQuery({
        page,
        limit: 10,
        search: debouncedSearch
    })

    const handleEdit = (owner: any) => {
        setEditingOwner(owner)
        setFormData({
            name: owner.name,
            mobile: owner.mobile,
            district: owner.district,
            taluka: owner.taluka,
            referralCode: owner.referralCode || ''
        })
        setIsModalOpen(true)
    }

    const handleManageSubscription = (owner: any) => {
        setSelectedOwnerForSub(owner)
        setIsSubscriptionModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this owner? This action cannot be undone.')) {
            try {
                await deleteOwner(id).unwrap()
                toast.success('Owner deleted successfully')
            } catch (err: any) {
                toast.error(err?.data?.message || 'Failed to delete owner')
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingOwner) {
                await updateOwner({ id: editingOwner.id, data: formData }).unwrap()
                toast.success('Owner updated successfully')
            } else {
                await createOwner(formData).unwrap()
                toast.success('Owner created successfully')
            }
            setIsModalOpen(false)
            setFormData({ name: '', mobile: '', district: '', taluka: '', referralCode: '' })
            setEditingOwner(null)
        } catch (err: any) {
            console.error('Failed to save owner:', err)
            if (err?.data?.errors) {
                Object.values(err.data.errors).flat().forEach((msg: any) => {
                    toast.error(msg)
                })
            } else {
                toast.error(err?.data?.message || 'Failed to save owner')
            }
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingOwner(null)
        setFormData({ name: '', mobile: '', district: '', taluka: '', referralCode: '' })
    }

    const owners = data?.owners || []
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
                        <User className="h-7 w-7 text-primary" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-foreground tracking-tight">Owners Management</h2>
                        <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
                             <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            System Network Infrastructure Control
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
                            placeholder="Find records..."
                            value={search}
                            onChange={handleSearch}
                            className="block w-full pl-11 pr-4 py-3 bg-muted/30 border border-transparent focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all font-bold placeholder:text-muted-foreground"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingOwner(null)
                            setFormData({ name: '', mobile: '', district: '', taluka: '', referralCode: '' })
                            setIsModalOpen(true)
                        }}
                        className="flex items-center px-6 py-3 bg-primary text-black font-black rounded-xl hover:opacity-90 transition-all shadow-xl shadow-primary/25 active:scale-95 shrink-0"
                    >
                        <Plus className="h-5 w-5 mr-2" strokeWidth={3} />
                        Register New
                    </button>
                </div>
            </div>

            {/* List Content */}
            <div className="bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl overflow-hidden border border-border transition-all">
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-80 space-y-4">
                        <Loader2 className="animate-spin h-10 w-10 text-primary" strokeWidth={3} />
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Accessing Vault...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-muted/30 border-b border-border">
                                <tr>
                                    <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">Entity Details</th>
                                    <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">Geographic Node</th>
                                    <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">Ledger Referral</th>
                                    <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">Fleet Stats</th>
                                    <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">Verification</th>
                                    <th scope="col" className="relative px-8 py-5"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-transparent">
                                {owners.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                                                    <User className="h-6 w-6 text-muted-foreground/50" />
                                                </div>
                                                <p>No owners found matching your search</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : owners.map((owner: any, index: number) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={owner.id}
                                        className="group hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-11 w-11 shrink-0">
                                                    <div className="h-11 w-11 rounded-full bg-linear-to-br from-primary to-yellow-600 flex items-center justify-center text-primary-foreground font-black shadow-lg shadow-primary/20">
                                                        {owner.name?.[0]?.toUpperCase() || 'O'}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">{owner.name}</div>
                                                    <div className="flex items-center text-xs font-medium text-muted-foreground mt-1">
                                                        <Phone className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                                                        {owner.mobile}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <div className="flex items-center text-sm font-medium text-foreground">
                                                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                                    {owner.district || '-'}
                                                </div>
                                                <div className="text-xs text-muted-foreground pl-5">{owner.taluka || '-'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                                <Hash className="h-3 w-3 mr-1" />
                                                {owner.referralCode || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-foreground font-medium">
                                                {owner.operatorsCount || 0} <span className="text-xs text-muted-foreground font-normal">Operators</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {owner.createdAt ? new Date(owner.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleManageSubscription(owner)}
                                                    className="p-2 text-muted-foreground hover:text-green-600 hover:bg-green-500/10 rounded-md transition-colors"
                                                    title="Manage Subscription"
                                                >
                                                    <CreditCard className="h-4 w-4" />
                                                </button>
                                                <Link
                                                    href={`/users/owners/${owner.id}`}
                                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                                    title="View Details"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleEdit(owner)}
                                                    className="p-2 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 rounded-md transition-colors"
                                                    title="Edit Owner"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(owner.id)}
                                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                                    title="Delete Owner"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {pagination && (
                    <div className="bg-card px-6 py-4 flex items-center justify-between border-t border-border/50">
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                            Showing <span className="font-black text-foreground">{(pagination.total || pagination.totalCount || pagination.totalItems || data?.data?.length || 0) > 0 ? ((page - 1) * 10) + 1 : 0}</span> to <span className="font-black text-foreground">{Math.min(page * 10, pagination.total || pagination.totalCount || pagination.totalItems || data?.data?.length || 0)}</span> of <span className="font-black text-foreground">{pagination.total || pagination.totalCount || pagination.totalItems || data?.data?.length || 0}</span> results
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="p-2 border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-medium px-2">Page {page} of {pagination.totalPages}</span>
                            <button
                                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                                disabled={page === pagination.totalPages}
                                className="p-2 border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Owner Modal */}
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
                                        <h3 className="text-xl font-bold text-foreground">{editingOwner ? 'Edit Owner' : 'Add New Owner'}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {editingOwner ? 'Update owner details' : 'Enter the details for the new infrastructure owner.'}
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
                                                    placeholder="e.g. Rahul Kumar"
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
                                            {editingOwner ? 'Update Owner' : 'Create Owner'}
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
                    setSelectedOwnerForSub(null)
                }}
                userId={selectedOwnerForSub?.id || null}
                userName={selectedOwnerForSub?.name || ''}
                userRole="Owner"
            />
        </motion.div>
    )
}
