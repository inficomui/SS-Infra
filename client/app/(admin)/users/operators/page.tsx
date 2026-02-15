'use client'

import { useState } from 'react'
import { useGetOperatorsQuery, useCreateOperatorMutation, useUpdateOperatorMutation, useDeleteOperatorMutation } from '@/redux/apis/usersApi'
import { Loader2, Search, Filter, MoreVertical, Eye, MapPin, Phone, Hash, ChevronLeft, ChevronRight, User, Shield, Plus, X, Edit2, Trash2, MoreHorizontal, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import toast from 'react-hot-toast'

export default function OperatorsPage() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingOperator, setEditingOperator] = useState<any>(null)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        district: '',
        taluka: '',
        referralCode: ''
    })

    const [createOperator, { isLoading: isCreating }] = useCreateOperatorMutation()
    const [updateOperator, { isLoading: isUpdating }] = useUpdateOperatorMutation()
    const [deleteOperator] = useDeleteOperatorMutation()

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        setTimeout(() => setDebouncedSearch(e.target.value), 500)
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
            referralCode: operator.referralCode || ''
        })
        setIsModalOpen(true)
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
            setFormData({ name: '', mobile: '', district: '', taluka: '', referralCode: '' })
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
        setFormData({ name: '', mobile: '', district: '', taluka: '', referralCode: '' })
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border/50 p-6 rounded-md shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Operators Management</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage field operators and their assignments</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => {
                            setPage(1)
                            setSearch('')
                            setDebouncedSearch('')
                            refetch()
                        }}
                        className="p-2.5 bg-muted/50 text-muted-foreground hover:text-primary hover:bg-muted border border-transparent hover:border-border/50 rounded-md transition-all"
                        title="Reset & Refresh"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                    <div className="relative flex-1 sm:w-72 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search operators..."
                            value={search}
                            onChange={handleSearch}
                            className="block w-full pl-10 pr-3 py-2.5 bg-muted/50 border border-transparent focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/20 rounded-md text-sm transition-all"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingOperator(null)
                            setFormData({ name: '', mobile: '', district: '', taluka: '', referralCode: '' })
                            setIsModalOpen(true)
                        }}
                        className="flex items-center px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 transition-all shadow-lg shadow-primary/25 shrink-0"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Operator
                    </button>
                </div>
            </div>

            {/* List Content */}
            <div className="bg-card shadow-sm rounded-md overflow-hidden border border-border/50">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border/50">
                            <thead className="bg-muted/30">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operator Details</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Referral</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Owner</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined Date</th>
                                    <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-card divide-y divide-border/50">
                                {operators.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                                                    <User className="h-6 w-6 text-muted-foreground/50" />
                                                </div>
                                                <p>No operators found matching your search</p>
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 shrink-0">
                                                    <div className="h-10 w-10 rounded-md bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
                                                        {operator.name?.[0]?.toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{operator.name}</div>
                                                    <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                                        <Phone className="h-3 w-3 mr-1" />
                                                        {operator.mobile}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <div className="flex items-center text-sm font-medium text-foreground">
                                                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                                    {operator.district || '-'}
                                                </div>
                                                <div className="text-xs text-muted-foreground pl-5">{operator.taluka || '-'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                <Hash className="h-3 w-3 mr-1" />
                                                {operator.referralCode || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {operator.owner ? (
                                                <Link href={`/users/owners/${operator.owner.id}`} className="flex items-center group/owner">
                                                    <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center text-[10px] font-bold mr-2 group-hover/owner:bg-primary/20 transition-colors">
                                                        {operator.owner.name[0]}
                                                    </div>
                                                    <span className="text-sm font-medium text-foreground group-hover/owner:text-primary transition-colors hover:underline">
                                                        {operator.owner.name}
                                                    </span>
                                                </Link>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {new Date(operator.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/users/operators/${operator.id}`}
                                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                                    title="View Details"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleEdit(operator)}
                                                    className="p-2 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 rounded-md transition-colors"
                                                    title="Edit Operator"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(operator.id)}
                                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                                    title="Delete Operator"
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
                        <div className="text-sm text-muted-foreground">
                            Showing <span className="font-medium text-foreground">{((page - 1) * 10) + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * 10, pagination.totalCount || 0)}</span> of <span className="font-medium text-foreground">{pagination.totalCount}</span> results
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
                                className="p-2 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
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
                                        <h3 className="text-xl font-bold text-foreground">{editingOperator ? 'Edit Operator' : 'Add New Operator'}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {editingOperator ? 'Update operator details' : 'Enter the details for the new operator.'}
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
                                            {editingOperator ? 'Update Operator' : 'Create Operator'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
