import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, FlatList } from 'react-native';
import { Text, ActivityIndicator, Button, Portal, Modal, RadioButton, Divider, Searchbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import {
    useGetUserSubscriptionsQuery,
    useAssignPlanMutation,
    useCancelSubscriptionMutation,
} from '@/redux/apis/subscriptionApi';
import { formatDate } from '../../utils/formatters';
import { useGetPlansQuery } from '@/redux/apis/walletApi';
import { useGetOperatorsQuery } from '@/redux/apis/ownerApi';
import { useTranslation } from 'react-i18next';

export default function SubscriptionManagementScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const { t } = useTranslation();

    const [targetUserId, setTargetUserId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserModal, setShowUserModal] = useState(false);

    // Queries
    const { data: operatorsData, isLoading: isLoadingOperators } = useGetOperatorsQuery();

    const { data: userSubsData, isLoading: isLoadingUserSubs, refetch: refetchUserSubs } = useGetUserSubscriptionsQuery(targetUserId!, {
        skip: !targetUserId
    });

    const { data: plansData, isLoading: isLoadingPlans } = useGetPlansQuery();

    // Mutations
    const [assignPlan, { isLoading: isAssigning }] = useAssignPlanMutation();
    const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation();

    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const [showAssignModal, setShowAssignModal] = useState(false);

    const filteredOperators = operatorsData?.operators?.filter(op =>
        op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.mobile.includes(searchQuery)
    ) || [];

    const handleSelectUser = (id: number) => {
        setTargetUserId(id);
        setShowUserModal(false);
    };

    const handleAssignPlan = async () => {
        if (!targetUserId || !selectedPlanId) return;

        try {
            await assignPlan({
                userId: targetUserId,
                planId: selectedPlanId,
                notes: notes,
                startDate: new Date().toISOString()
            }).unwrap();

            Alert.alert(t('common.success'), t('subscription_manager.plan_assigned'));
            setShowAssignModal(false);
            setNotes('');
            refetchUserSubs();
        } catch (error: any) {
            Alert.alert(t('common.error'), error?.data?.message || t('subscription_manager.failed_assign'));
        }
    };

    const handleCancelSubscription = async (subscriptionId: number) => {
        Alert.alert(
            t('subscription_manager.confirm_cancellation'),
            t('subscription_manager.confirm_cancel_msg'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.confirm'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await cancelSubscription({ id: subscriptionId, softDelete: true }).unwrap();
                            Alert.alert(t('common.success'), t('subscription_manager.subscription_cancelled'));
                            refetchUserSubs();
                        } catch (error: any) {
                            Alert.alert(t('common.error'), error?.data?.message || t('subscription_manager.failed_cancel'));
                        }
                    }
                }
            ]
        );
    };

    const activeSubscription = userSubsData?.subscriptions?.find((sub: any) => sub.status === 'active');
    const pastSubscriptions = userSubsData?.subscriptions?.filter((sub: any) => sub.status !== 'active') || [];

    const selectedOperator = operatorsData?.operators?.find(op => op.id === targetUserId);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('subscription_manager.title')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* User Selection Card */}
                <TouchableOpacity
                    onPress={() => setShowUserModal(true)}
                    style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 20 }]}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={[styles.sectionTitle, { color: colors.textMuted, marginBottom: 4 }]}>{t('subscription_manager.select_user')}</Text>
                            {selectedOperator ? (
                                <Text style={[styles.userName, { color: colors.textMain }]}>{selectedOperator.name}</Text>
                            ) : (
                                <Text style={{ color: colors.textMuted, fontSize: 16 }}>{t('subscription_manager.tap_search')}</Text>
                            )}
                        </View>
                        <MaterialCommunityIcons name="chevron-down" size={24} color={colors.textMuted} />
                    </View>
                </TouchableOpacity>

                {targetUserId && selectedOperator && (
                    <View style={{ gap: 20 }}>
                        {/* User Info Card */}
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                                    <MaterialCommunityIcons name="account" size={32} color={colors.primary} />
                                </View>
                                <View>
                                    <Text style={[styles.userName, { color: colors.textMain }]}>{userSubsData?.user?.name || selectedOperator.name}</Text>
                                    <Text style={{ color: colors.textMuted }}>{userSubsData?.user?.mobile || selectedOperator.mobile}</Text>
                                    <View style={[styles.roleBadge, { backgroundColor: colors.cardLight, borderColor: colors.border }]}>
                                        <Text style={{ color: colors.textMain, fontSize: 10, fontWeight: 'bold' }}>{userSubsData?.user?.role || selectedOperator.role || 'Operator'}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Subscription Status */}
                        {isLoadingUserSubs ? (
                            <ActivityIndicator color={colors.primary} />
                        ) : (
                            <>
                                {/* Active Subscription / Assign Plan */}
                                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('subscription_manager.current_subscription')}</Text>
                                    {activeSubscription ? (
                                        <View style={styles.activeSubContainer}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <View>
                                                    <Text style={[styles.planName, { color: colors.primary }]}>{activeSubscription.plan?.name}</Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                                        <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textMuted} />
                                                        <Text style={{ color: colors.textMuted }}>{t('subscription_manager.expires')} {formatDate(activeSubscription.endDate)}</Text>
                                                    </View>
                                                    <Text style={{ color: colors.textMain, fontWeight: 'bold', marginTop: 4 }}>{activeSubscription.daysRemaining} {t('subscription_manager.days_remaining')}</Text>
                                                </View>
                                                <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                                                    <Text style={{ color: colors.success, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>{t('subscription_manager.active')}</Text>
                                                </View>
                                            </View>

                                            <Button
                                                mode="outlined"
                                                textColor={colors.danger}
                                                style={{ marginTop: 16, borderColor: colors.border }}
                                                onPress={() => handleCancelSubscription(activeSubscription.id)}
                                                loading={isCancelling}
                                                disabled={isCancelling}
                                            >
                                                {t('subscription_manager.cancel_subscription')}
                                            </Button>
                                        </View>
                                    ) : (
                                        <View style={styles.emptyState}>
                                            <Text style={{ color: colors.textMuted }}>{t('subscription_manager.no_active_sub')}</Text>
                                            <Button
                                                mode="contained"
                                                buttonColor={colors.primary}
                                                textColor="#000"
                                                style={{ marginTop: 12 }}
                                                onPress={() => setShowAssignModal(true)}
                                            >
                                                {t('subscription_manager.assign_new_plan')}
                                            </Button>
                                        </View>
                                    )}
                                </View>

                                {/* History */}
                                {pastSubscriptions.length > 0 && (
                                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('subscription_manager.history')}</Text>
                                        {pastSubscriptions.map((sub: any) => (
                                            <View key={sub.id} style={[styles.historyItem, { borderBottomColor: colors.border }]}>
                                                <View>
                                                    <Text style={{ color: colors.textMain, fontWeight: '600' }}>{sub.plan?.name}</Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                        <MaterialCommunityIcons name="calendar-range" size={14} color={colors.textMuted} />
                                                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{formatDate(sub.startDate)} - {formatDate(sub.endDate)}</Text>
                                                    </View>
                                                </View>
                                                <Text style={{ color: sub.status === 'expired' ? colors.textMuted : colors.danger, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                    {sub.status}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Operator Selection Modal */}
            <Portal>
                <Modal visible={showUserModal} onDismiss={() => setShowUserModal(false)} contentContainerStyle={[styles.modalContent, { backgroundColor: colors.background, padding: 0, overflow: 'hidden' }]}>
                    <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <Text style={[styles.modalTitle, { color: colors.textMain, marginBottom: 10 }]}>{t('subscription_manager.select_operator_title')}</Text>
                        <Searchbar
                            placeholder={t('subscription_manager.search_placeholder')}
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            style={{ backgroundColor: colors.card, height: 44 }}
                            inputStyle={{ minHeight: 0 }}
                        />
                    </View>

                    {isLoadingOperators ? (
                        <ActivityIndicator style={{ margin: 20 }} color={colors.primary} />
                    ) : (
                        <FlatList
                            data={filteredOperators}
                            keyExtractor={item => item.id.toString()}
                            style={{ maxHeight: 400 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.operatorItem, { borderBottomColor: colors.border }]}
                                    onPress={() => handleSelectUser(item.id)}
                                >
                                    <View style={[styles.miniAvatar, { backgroundColor: colors.primary + '20' }]}>
                                        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{item.name[0]}</Text>
                                    </View>
                                    <View>
                                        <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{item.name}</Text>
                                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{item.mobile}</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={{ padding: 20, textAlign: 'center', color: colors.textMuted }}>{t('common.no_runners')} </Text>
                            }
                        />
                    )}
                    <Button mode="text" onPress={() => setShowUserModal(false)} style={{ margin: 8 }}>{t('subscription_manager.close')}</Button>
                </Modal>
            </Portal>

            {/* Assign Plan Modal */}
            <Portal>
                <Modal visible={showAssignModal} onDismiss={() => setShowAssignModal(false)} contentContainerStyle={[styles.modalContent, { backgroundColor: colors.background }]}>
                    <Text style={[styles.modalTitle, { color: colors.textMain }]}>{t('subscription_manager.assign_plan_title')}</Text>

                    <ScrollView style={{ maxHeight: 300 }}>
                        {isLoadingPlans ? (
                            <ActivityIndicator color={colors.primary} />
                        ) : (
                            <RadioButton.Group onValueChange={val => setSelectedPlanId(parseInt(val))} value={selectedPlanId?.toString() || ''}>
                                {plansData?.plans?.map((plan: any) => (
                                    <RadioButton.Item
                                        key={plan.id}
                                        label={`${plan.name} - ₹${plan.price} `}
                                        value={plan.id.toString()}
                                        color={colors.primary}
                                        labelStyle={{ color: colors.textMain }}
                                    />
                                ))}
                            </RadioButton.Group>
                        )}
                    </ScrollView>

                    <TextInput
                        style={[styles.input, { color: colors.textMain, backgroundColor: colors.background, borderColor: colors.border, marginTop: 16 }]}
                        placeholder={t('subscription_manager.admin_notes')}
                        placeholderTextColor={colors.textMuted}
                        value={notes}
                        onChangeText={setNotes}
                    />

                    <View style={styles.modalActions}>
                        <Button mode="text" textColor={colors.textMuted} onPress={() => setShowAssignModal(false)}>{t('common.cancel')}</Button>
                        <Button
                            mode="contained"
                            buttonColor={colors.primary}
                            textColor="#000"
                            onPress={handleAssignPlan}
                            loading={isAssigning}
                            disabled={!selectedPlanId || isAssigning}
                        >
                            {t('subscription_manager.assign_plan_title')}
                        </Button>
                    </View>
                </Modal>
            </Portal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { padding: 24, paddingBottom: 60 },
    card: { padding: 16, borderRadius: 8, borderWidth: 1, marginBottom: 16 },
    sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12 },
    searchRow: { flexDirection: 'row', gap: 12 },
    input: { flex: 1, height: 48, borderRadius: 4, borderWidth: 1, paddingHorizontal: 12 },
    searchBtn: { width: 48, height: 48, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
    avatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    userName: { fontSize: 18, fontWeight: 'bold' },
    roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, alignSelf: 'flex-start', marginTop: 4 },
    activeSubContainer: { marginTop: 4 },
    planName: { fontSize: 20, fontWeight: '900' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    emptyState: { alignItems: 'center', padding: 20 },
    historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
    modalContent: { margin: 24, padding: 24, borderRadius: 8 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 24 },
    operatorItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, gap: 12 },
    miniAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }
});
