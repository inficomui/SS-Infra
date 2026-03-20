import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    Dimensions,
    Image,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useSelector } from 'react-redux';
import { useGetOperatorsQuery, useGetMachinesQuery, Machine } from '@/redux/apis/ownerApi';
import { useGetNotificationsQuery, Notification as ApiNotification } from '@/redux/apis/notificationApi';
import { useGetMySubscriptionQuery, GetMySubscriptionResponse } from '@/redux/apis/subscriptionApi';
import { useAppTheme } from '@/hooks/use-theme-color';
import { storage } from '@/redux/storage';
import { formatDate, formatDuration, resolveImageUrl } from '../../utils/formatters';
import { t } from 'i18next';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

export default function OwnerDashboard() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colors, isDark } = useAppTheme();
    const user = useSelector((state: any) => state.auth.user);

    // Fetch data
    const { data: operatorsData, isLoading: loadingOperators, refetch: refetchOperators } = useGetOperatorsQuery();
    const { data: machinesData, isLoading: loadingMachines, refetch: refetchMachines } = useGetMachinesQuery();
    const { data: notificationsData, refetch: refetchNotifications } = useGetNotificationsQuery();
    const { data: subData, isLoading: loadingSub, refetch: refetchSub } = useGetMySubscriptionQuery();

    const [refreshing, setRefreshing] = useState(false);

    const operators = (operatorsData as any)?.operators || (operatorsData as any)?.workers || [];
    const machines = machinesData?.machines || (machinesData as any)?.data || [];

    // Subscription status helpers
    const isSubActive = subData?.isActive ?? true; // default true until loaded
    const subDaysLeft = Math.floor(subData?.subscription?.daysRemaining ?? 999);
    const subStatus = subData?.subscription?.status;
    const isSubExpired = !isSubActive || subStatus === 'expired';
    const isSubNearExpiry = isSubActive && subDaysLeft <= 14 && subDaysLeft > 0;

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refetchOperators(), refetchMachines(), refetchNotifications(), refetchSub()]);
        setRefreshing(false);
    };

    const handleLockedAction = (feature: string) => {
        Toast.show({
            type: 'error',
            text1: 'Subscription Required',
            text2: `Renew your plan to access ${feature}.`,
        });
        setTimeout(() => {
            router.push({ pathname: '/(common)/plans' as any, params: { source: 'expired' } });
        }, 1200);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('owner.good_morning');
        if (hour < 17) return t('owner.good_afternoon');
        return t('owner.good_evening');
    };

    const rawNotifications = notificationsData?.notifications || notificationsData?.data;
    const allNotifications: ApiNotification[] = Array.isArray(rawNotifications) ? rawNotifications : (Array.isArray((notificationsData?.data as any)?.data) ? (notificationsData?.data as any).data : []);
    const unreadCount = allNotifications.filter((n: ApiNotification) => !n.isRead && !n.is_read).length || 0;

    // Calculate statistics
    const activeOperators = operators.length;
    const availableMachines = machines.filter((m: any) => m.status === 'available').length;
    const machinesInUse = machines.filter((m: any) => m.status === 'in_use').length;
    const machinesInMaintenance = machines.filter((m: any) => m.status === 'maintenance').length;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, { color: colors.textMuted }]}>{getGreeting()},</Text>
                    <Text style={[styles.ownerName, { color: colors.textMain }]}>{user?.name || 'Owner'}</Text>
                    <View style={[styles.locationBadge, { backgroundColor: colors.card }]}>
                        <MaterialCommunityIcons name="map-marker" size={12} color={colors.primary} />
                        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{user?.district}, {user?.taluka}</Text>
                    </View>
                </View>
                <View style={styles.headerRight}>

                    <TouchableOpacity
                        onPress={() => router.push('/(owner)/notifications' as any)}
                        style={[styles.profileCircle, { backgroundColor: colors.card, borderColor: colors.border, marginRight: 12 }]}
                    >
                        <MaterialCommunityIcons name="bell-outline" size={24} color={colors.textMain} />
                        {unreadCount > 0 && (
                            <View style={{ position: 'absolute', top: 12, right: 14, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, borderWidth: 1, borderColor: colors.card }} />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/(owner)/profile' as any)}
                        style={[styles.profileCircle, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                        <MaterialCommunityIcons name="account" size={28} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            >
                {/* Subscription Warning */}
                {!loadingSub && (
                    <SubscriptionWarning
                        subscription={subData?.subscription}
                        isActive={subData?.isActive}
                        colors={colors}
                        t={t}
                        onPress={() => router.push('/(common)/plans' as any)}
                    />
                )}

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                        <StatCard
                            onPress={() => router.push('/(owner)/operators' as any)}
                            icon="account-hard-hat"
                            label={t('owner.operators')}
                            value={activeOperators.toString()}
                            color={colors.primary}
                            loading={loadingOperators}
                            colors={colors}
                        />
                        <StatCard
                            onPress={() => router.push('/(owner)/machines' as any)}
                            icon="crane"
                            label={t('owner.total_fleet')}
                            value={machines.length.toString()}
                            color={colors.primary}
                            loading={loadingMachines}
                            colors={colors}
                        />
                    </View>
                    <View style={[styles.miniStatsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MiniStat label={t('owner.available')} value={availableMachines} icon="check-circle" color={colors.success} colors={colors} />
                        <MiniStat label={t('owner.in_use')} value={machinesInUse} icon="play-circle" color={colors.warning} colors={colors} />
                        <MiniStat label={t('owner.service')} value={machinesInMaintenance} icon="alert-circle" color={colors.danger} colors={colors} />
                    </View>
                </View>

                {/* Management Quick Actions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{t('owner.management')}</Text>
                    <View style={styles.actionsGrid}>
                        <ActionButton
                            icon="account-plus"
                            label={t('owner.new_operator')}
                            onPress={() => router.push('/(owner)/add-operator' as any)}
                            gradient={[colors.primary]}
                            colors={colors}
                            isLocked={isSubExpired}
                            onLockedPress={() => handleLockedAction(t('owner.new_operator'))}
                        />
                        <ActionButton
                            icon="truck-plus"
                            label={t('owner.new_machine')}
                            onPress={() => router.push('/(owner)/add-machine' as any)}
                            gradient={[colors.primary]}
                            colors={colors}
                            isLocked={isSubExpired}
                            onLockedPress={() => handleLockedAction(t('owner.new_machine'))}
                        />
                        <ActionButton
                            icon="account-group"
                            label={t('owner.operators')}
                            onPress={() => router.push('/(owner)/operators' as any)}
                            gradient={[colors.primary]}
                            colors={colors}
                        />
                        <ActionButton
                            icon="calendar-check"
                            label={t('owner.bookings')}
                            onPress={() => router.push('/(owner)/bookings' as any)}
                            gradient={[colors.primary]}
                            colors={colors}
                            isLocked={isSubExpired}
                            onLockedPress={() => handleLockedAction(t('owner.bookings'))}
                        />
                        <ActionButton
                            icon="format-list-bulleted"
                            label={t('owner.fleet_list')}
                            onPress={() => router.push('/(owner)/machines' as any)}
                            colors={colors}
                        />
                        <ActionButton
                            icon="wallet-outline"
                            label={t('overview.wallet')}
                            onPress={() => router.push('/(owner)/wallet' as any)}
                            gradient={[colors.primary]}
                            colors={colors}
                        />
                        <ActionButton
                            icon="finance"
                            label={t('owner.salary_report')}
                            onPress={() => router.push('/(owner)/salary-report' as any)}
                            gradient={[colors.primary]}
                            colors={colors}
                            isLocked={isSubExpired}
                            onLockedPress={() => handleLockedAction(t('owner.salary_report'))}
                        />
                        <ActionButton
                            icon="gas-station"
                            label={t('owner.fuel_logs')}
                            onPress={() => router.push('/(owner)/fuel' as any)}
                            gradient={[colors.primary]}
                            colors={colors}
                        />
                        <ActionButton
                            icon="wrench"
                            label={t('owner.maintenance')}
                            onPress={() => router.push('/(owner)/maintenance' as any)}
                            gradient={[colors.primary]}
                            colors={colors}
                        />
                        <ActionButton
                            icon="star-outline"
                            label={t('owner.our_plans')}
                            onPress={() => router.push('/(common)/plans' as any)}
                            colors={colors}
                        />
                    </View>
                </View>

                {/* Recent Operators */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{t('owner.recent_operators')}</Text>
                        <TouchableOpacity onPress={() => router.push('/(owner)/operators' as any)}>
                            <Text style={[styles.viewAll, { color: colors.primary }]}>{t('owner.view_all')}</Text>
                        </TouchableOpacity>
                    </View>
                    {loadingOperators ? (
                        <ActivityIndicator color={colors.primary} />
                    ) : operators.length === 0 ? (
                        <EmptyState icon="account-off" text={t('owner.no_operators')} colors={colors} />
                    ) : (
                        operators.slice(0, 3).map((operator: any) => (
                            <OperatorCard
                                key={operator.id}
                                operator={operator}
                                colors={colors}
                                onPress={() => router.push({
                                    pathname: '/(owner)/operator-details',
                                    params: { data: JSON.stringify(operator) }
                                })}
                            />
                        ))
                    )}
                </View>

                {/* Recent Machines */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{t('owner.recent_machines')}</Text>
                        <TouchableOpacity onPress={() => router.push('/(owner)/machines' as any)}>
                            <Text style={[styles.viewAll, { color: colors.primary }]}>{t('owner.view_all')}</Text>
                        </TouchableOpacity>
                    </View>
                    {loadingMachines ? (
                        <ActivityIndicator color={colors.primary} />
                    ) : machines.length === 0 ? (
                        <EmptyState icon="truck" text={t('owner.no_fleet')} colors={colors} />
                    ) : (
                        machines.slice(0, 3).map((machine: any) => {
                            const currentOperator = machine.current_operator_id ? operators.find((o: any) => o.id === machine.current_operator_id) : null;
                            const fullData = { ...machine, current_operator: currentOperator };
                            return (
                                <MachineCard
                                    key={machine.id}
                                    machine={machine}
                                    colors={colors}
                                    onPress={() => router.push({
                                        pathname: '/(owner)/machine-details',
                                        params: { data: JSON.stringify(fullData) }
                                    })}
                                />
                            );
                        })
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

// Sub-components
function MiniStat({ label, value, icon, color, colors }: any) {
    const { t } = useTranslation();
    return (
        <View style={styles.miniStat}>
            <MaterialCommunityIcons name={icon} size={14} color={color} />
            <Text style={[styles.miniStatValue, { color: colors.textMain }]}>{value}</Text>
            <Text style={[styles.miniStatLabel, { color: colors.textMuted }]}>{label}</Text>
        </View>
    );
}

function EmptyState({ icon, text, colors }: any) {
    const { t } = useTranslation();
    return (
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialCommunityIcons name={icon} size={40} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{text}</Text>
        </View>
    );
}

function SubscriptionWarning({ subscription, isActive, colors, t, onPress }: any) {
    const daysLeft = Math.floor(subscription?.daysRemaining ?? 0);

    // ── Case 1: Expired or no active subscription → large red banner ──
    if (!isActive || !subscription || subscription.status === 'expired') {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.9}
                style={[styles.expiredBanner, { backgroundColor: colors.danger + '12', borderColor: colors.danger }]}
            >
                <View style={[styles.expiredBannerTop, { borderBottomColor: colors.danger + '30' }]}>
                    <View style={[styles.expiredIconCircle, { backgroundColor: colors.danger + '20' }]}>
                        <MaterialCommunityIcons name="shield-off-outline" size={28} color={colors.danger} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.expiredTitle, { color: colors.danger }]}>Subscription Expired</Text>
                        <Text style={[styles.expiredSubtitle, { color: colors.textMuted }]}>
                            {subscription?.status === 'expired'
                                ? `Your plan ended on ${new Date(subscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                : 'You have no active plan assigned to your account'}
                        </Text>
                    </View>
                </View>
                <View style={styles.expiredBannerBody}>
                    <View style={styles.expiredFeatureRow}>
                        {['Add Operators', 'Add Machines', 'View Bookings', 'Salary Reports'].map(f => (
                            <View key={f} style={[styles.expiredFeatureChip, { backgroundColor: colors.danger + '15', borderColor: colors.danger + '30' }]}>
                                <MaterialCommunityIcons name="lock-outline" size={11} color={colors.danger} />
                                <Text style={[styles.expiredFeatureText, { color: colors.danger }]}>{f}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={[styles.expiredRenewBtn, { backgroundColor: colors.danger }]}>
                        <MaterialCommunityIcons name="crown-outline" size={16} color="#FFF" />
                        <Text style={styles.expiredRenewText}>TAP TO VIEW PLANS & RENEW</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    // ── Case 2: Near expiry ≤14 days → compact orange/red strip ──
    if (daysLeft <= 14) {
        const urgentColor = daysLeft <= 3 ? colors.danger : colors.warning;
        return (
            <TouchableOpacity
                onPress={onPress}
                style={[styles.warningCard, { backgroundColor: urgentColor + '12', borderColor: urgentColor }]}
            >
                <View style={styles.warningIconContainer}>
                    <MaterialCommunityIcons
                        name={daysLeft <= 3 ? 'alert-circle' : 'clock-alert-outline'}
                        size={24} color={urgentColor}
                    />
                </View>
                <View style={styles.warningContent}>
                    <Text style={[styles.warningTitle, { color: urgentColor }]}>
                        {daysLeft <= 3 ? '⚠️ Expiring Very Soon!' : 'Plan Expiring Soon'}
                    </Text>
                    <Text style={[styles.warningText, { color: colors.textMuted }]}>
                        <Text style={{ fontWeight: '900', color: urgentColor }}>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</Text> left on your {subscription.plan?.name ?? 'plan'}
                    </Text>
                </View>
                <View style={[styles.renewBtn, { backgroundColor: urgentColor }]}>
                    <Text style={styles.renewText}>RENEW</Text>
                </View>
            </TouchableOpacity>
        );
    }

    // ── Case 3: Healthy subscription → no banner ──
    return null;
}

function StatCard({ icon, label, value, color, loading, colors }: any) {
    const { t } = useTranslation();
    return (
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statHeader}>
                <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
                    <MaterialCommunityIcons name={icon as any} size={24} color={color} />
                </View>
                {loading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                    <Text style={[styles.statValue, { color: colors.textMain }]}>{value}</Text>
                )}
            </View>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
        </View>
    );
}

function ActionButton({ icon, label, onPress, gradient, dark, colors, isLocked, onLockedPress }: any) {
    const { t } = useTranslation();
    return (
        <TouchableOpacity
            onPress={isLocked ? onLockedPress : onPress}
            style={styles.actionButton}
            activeOpacity={0.75}
        >
            <View style={[
                styles.actionGradient,
                { backgroundColor: dark ? colors.primary : colors.card },
                !dark && { borderWidth: 1, borderColor: colors.border },
                isLocked && { opacity: 0.55 }
            ]}>
                <MaterialCommunityIcons name={icon as any} size={28} color={dark ? '#000' : colors.primary} />
                <Text style={[styles.actionLabel, { color: dark ? '#000' : colors.textMain }]}>{label}</Text>
                {isLocked && (
                    <View style={[styles.lockBadge, { backgroundColor: colors.danger }]}>
                        <MaterialCommunityIcons name="lock" size={10} color="#FFF" />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

function OperatorCard({ operator, colors, onPress }: any) {
    const { t } = useTranslation();
    return (
        <TouchableOpacity
            style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onPress}
        >
            <View style={[styles.listCardIcon, { backgroundColor: colors.cardLight }]}>
                <MaterialCommunityIcons name={operator.role === 'Driver' ? "car" : "account"} size={24} color={colors.primary} />
            </View>
            <View style={styles.listCardContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.listCardTitle, { color: colors.textMain }]}>{operator.name}</Text>
                    <View style={{
                        backgroundColor: operator.role === 'Driver' ? '#3B82F620' : colors.success + '20',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4
                    }}>
                        <Text style={{
                            fontSize: 10,
                            fontWeight: 'bold',
                            color: operator.role === 'Driver' ? '#3B82F6' : colors.success
                        }}>
                            {(operator.role || 'Operator').toUpperCase()}
                        </Text>
                    </View>
                </View>
                <Text style={[styles.listCardSubtitle, { color: colors.textMuted }]}>{operator.mobile}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.border} />
        </TouchableOpacity>
    );
}

function MachineCard({ machine, colors, onPress }: any) {
    const { t } = useTranslation();
    const statusColors: Record<string, string> = {
        available: colors.success,
        in_use: colors.warning,
        maintenance: colors.danger,
    };

    const statusLabels: Record<string, string> = {
        available: t('owner.status_online'),
        in_use: t('owner.status_active'),
        maintenance: t('owner.status_service'),
    };

    const status = (machine.status || 'available') as string;

    const machinePhoto = machine.photo_url || machine.photo_path || machine.photoUrl || machine.machine_photo || machine.photo;
    const imageUrl = resolveImageUrl(machinePhoto);

    return (
        <TouchableOpacity
            style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onPress}
        >
            <View style={[styles.listCardIcon, { backgroundColor: statusColors[status] + '15' }]}>
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: '100%', borderRadius: 8 }}
                    />
                ) : (
                    <MaterialCommunityIcons name="truck-outline" size={24} color={statusColors[status]} />
                )}
            </View>
            <View style={styles.listCardContent}>
                <View style={styles.titleRow}>
                    <Text style={[styles.listCardTitle, { color: colors.textMain }]}>{machine.name}</Text>
                    {machine.type && (
                        <View style={[styles.typeChip, { backgroundColor: colors.cardLight, borderColor: colors.border }]}>
                            <Text style={[styles.typeChipText, { color: colors.primary }]}>{machine.type}</Text>
                        </View>
                    )}
                </View>
                <Text style={[styles.listCardSubtitle, { color: colors.textMuted }]}>{machine.registrationNumber}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColors[status] + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColors[status] }]} />
                <Text style={[styles.statusText, { color: statusColors[status] }]}>
                    {statusLabels[status]}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 8,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)'
    },
    greeting: {
        fontSize: 16, fontWeight: '600', opacity: 0.8
    },
    ownerName: { fontSize: 28, fontWeight: '800', marginTop: 4, letterSpacing: 0.5 },
    subtitle: { fontSize: 13, marginLeft: 6, fontWeight: '500' },
    profileCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1, elevation: 2 },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 16 },
    statsContainer: { marginTop: 4 },
    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
    statCard: { flex: 1, borderRadius: 16, padding: 18, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    statIconContainer: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    statValue: { fontSize: 28, fontWeight: '800' },
    statLabel: { fontSize: 14, fontWeight: '600', opacity: 0.8 },
    miniStatsRow: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 16, padding: 16, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    miniStat: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    miniStatValue: { fontSize: 16, fontWeight: '800' },
    miniStatLabel: { fontSize: 13, fontWeight: '500', opacity: 0.8 },
    section: { marginTop: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingHorizontal: 4 },
    sectionTitle: { fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
    viewAll: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    actionButton: { width: (width - 56) / 2 },
    actionGradient: { width: '100%', paddingVertical: 24, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6 },
    actionLabel: { fontSize: 14, fontWeight: '700', textAlign: 'center', letterSpacing: 0.5 },
    listCard: { flexDirection: 'row', borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    listCardIcon: { width: 52, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    listCardContent: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
    listCardTitle: { fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
    typeChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
    typeChipText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    listCardSubtitle: { fontSize: 14, fontWeight: '500', opacity: 0.7 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, gap: 8 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    emptyState: { alignItems: 'center', paddingVertical: 40, borderRadius: 16, borderStyle: 'dashed', borderWidth: 2 },
    emptyText: { fontSize: 16, marginTop: 12, fontWeight: '600', opacity: 0.7 },
    warningCard: {
        marginBottom: 20,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    warningIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    warningContent: { flex: 1 },
    warningTitle: { fontSize: 13, fontWeight: '900', marginBottom: 2 },
    warningText: { fontSize: 12, lineHeight: 16 },
    renewBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    renewText: { color: '#fff', fontSize: 11, fontWeight: '900' },

    // Expired banner (large)
    expiredBanner: {
        marginBottom: 20,
        borderRadius: 16,
        borderWidth: 1.5,
        overflow: 'hidden',
    },
    expiredBannerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderBottomWidth: 1,
    },
    expiredIconCircle: {
        width: 52, height: 52, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center',
    },
    expiredTitle: { fontSize: 16, fontWeight: '900', marginBottom: 3 },
    expiredSubtitle: { fontSize: 12, fontWeight: '500', lineHeight: 17 },
    expiredBannerBody: { padding: 16, paddingTop: 12, gap: 12 },
    expiredFeatureRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    expiredFeatureChip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 20, borderWidth: 1,
    },
    expiredFeatureText: { fontSize: 11, fontWeight: '700' },
    expiredRenewBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 13, borderRadius: 10,
    },
    expiredRenewText: { color: '#FFF', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },

    // Lock badge on action buttons
    lockBadge: {
        position: 'absolute', top: 10, right: 10,
        width: 18, height: 18, borderRadius: 9,
        justifyContent: 'center', alignItems: 'center',
    },
});
