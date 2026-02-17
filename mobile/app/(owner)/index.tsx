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
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useSelector } from 'react-redux';
import { useGetOperatorsQuery, useGetMachinesQuery, Machine } from '@/redux/apis/ownerApi';
import { useGetNotificationsQuery, Notification as ApiNotification } from '@/redux/apis/notificationApi';
import { useAppTheme } from '@/hooks/use-theme-color';
import { storage } from '@/redux/storage';
import { formatDate, formatDuration, resolveImageUrl } from '../../utils/formatters';

const { width } = Dimensions.get('window');

export default function OwnerDashboard() {
    const router = useRouter();
    const { colors, isDark } = useAppTheme();
    const user = useSelector((state: any) => state.auth.user);

    // Fetch data
    const { data: operatorsData, isLoading: loadingOperators, refetch: refetchOperators } = useGetOperatorsQuery();
    const { data: machinesData, isLoading: loadingMachines, refetch: refetchMachines } = useGetMachinesQuery();
    const { data: notificationsData, refetch: refetchNotifications } = useGetNotificationsQuery();

    const [refreshing, setRefreshing] = useState(false);

    const operators = operatorsData?.operators || [];
    const machines = machinesData?.machines || [];

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refetchOperators(), refetchMachines(), refetchNotifications()]);
        setRefreshing(false);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const allNotifications = notificationsData?.notifications || notificationsData?.data || [];
    const unreadCount = allNotifications.filter((n: ApiNotification) => !n.isRead && !n.is_read).length || 0;

    // Calculate statistics
    const activeOperators = operators.length;
    const availableMachines = machines.filter(m => m.status === 'available').length;
    const machinesInUse = machines.filter(m => m.status === 'in_use').length;
    const machinesInMaintenance = machines.filter(m => m.status === 'maintenance').length;

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
                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                        <StatCard
                            onPress={() => router.push('/(owner)/operators' as any)}
                            icon="account-hard-hat"
                            label="Operators"
                            value={activeOperators.toString()}
                            color={colors.primary}
                            loading={loadingOperators}
                            colors={colors}
                        />
                        <StatCard
                            onPress={() => router.push('/(owner)/machines' as any)}
                            icon="crane"
                            label="Total Fleet"
                            value={machines.length.toString()}
                            color={colors.primary}
                            loading={loadingMachines}
                            colors={colors}
                        />
                    </View>
                    <View style={[styles.miniStatsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MiniStat label="Available" value={availableMachines} icon="check-circle" color={colors.success} colors={colors} />
                        <MiniStat label="In Use" value={machinesInUse} icon="play-circle" color={colors.warning} colors={colors} />
                        <MiniStat label="Service" value={machinesInMaintenance} icon="alert-circle" color={colors.danger} colors={colors} />
                    </View>
                </View>

                {/* Management Quick Actions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Management</Text>
                    <View style={styles.actionsGrid}>
                        <ActionButton
                            icon="account-plus"
                            label="New Operator"
                            onPress={() => router.push('/(owner)/add-operator' as any)}
                            gradient={[colors.primary]}
                            colors={colors}
                        />
                        <ActionButton
                            icon="truck-plus"
                            label="New Machine"
                            onPress={() => router.push('/(owner)/add-machine' as any)}
                            gradient={[colors.primary]}
                            colors={colors}
                        />
                        <ActionButton
                            icon="account-group"
                            label="Operators"
                            onPress={() => router.push('/(owner)/operators' as any)}
                            gradient={[colors.primary]}
                            colors={colors}
                        />
                        <ActionButton
                            icon="format-list-bulleted"
                            label="Fleet List"
                            onPress={() => router.push('/(owner)/machines' as any)}
                            colors={colors}
                        />
                        <ActionButton
                            icon="wallet-outline"
                            label="Wallet"
                            onPress={() => router.push('/(owner)/wallet' as any)}
                            gradient={[colors.primary]}
                            colors={colors}
                        />
                        <ActionButton
                            icon="finance"
                            label="Salary Report"
                            onPress={() => router.push('/(owner)/salary-report' as any)}
                            gradient={[colors.primary]}
                            colors={colors}
                        />
                        <ActionButton
                            icon="gas-station"
                            label="Fuel Logs"
                            onPress={() => router.push('/(owner)/fuel' as any)}
                            gradient={[colors.primary]}
                            colors={colors}
                        />
                        <ActionButton
                            icon="wrench"
                            label="Maintenance"
                            onPress={() => router.push('/(owner)/maintenance' as any)}
                            gradient={[colors.primary]}
                            colors={colors}
                        />
                        <ActionButton
                            icon="star-outline"
                            label="Our Plans"
                            onPress={() => router.push('/(common)/plans' as any)}
                            colors={colors}
                        />
                    </View>
                </View>

                {/* Recent Operators */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Recent Operators</Text>
                        <TouchableOpacity onPress={() => router.push('/(owner)/operators' as any)}>
                            <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    {loadingOperators ? (
                        <ActivityIndicator color={colors.primary} />
                    ) : operators.length === 0 ? (
                        <EmptyState icon="account-off" text="No operators registered" colors={colors} />
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
                        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Recent Machines</Text>
                        <TouchableOpacity onPress={() => router.push('/(owner)/machines' as any)}>
                            <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    {loadingMachines ? (
                        <ActivityIndicator color={colors.primary} />
                    ) : machines.length === 0 ? (
                        <EmptyState icon="truck" text="No machines in fleet" colors={colors} />
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
    return (
        <View style={styles.miniStat}>
            <MaterialCommunityIcons name={icon} size={14} color={color} />
            <Text style={[styles.miniStatValue, { color: colors.textMain }]}>{value}</Text>
            <Text style={[styles.miniStatLabel, { color: colors.textMuted }]}>{label}</Text>
        </View>
    );
}

function EmptyState({ icon, text, colors }: any) {
    return (
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialCommunityIcons name={icon} size={40} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{text}</Text>
        </View>
    );
}

function StatCard({ icon, label, value, color, loading, colors }: any) {
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

function ActionButton({ icon, label, onPress, gradient, dark, colors }: any) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.actionButton}>
            <View style={[
                styles.actionGradient,
                { backgroundColor: dark ? colors.primary : colors.card },
                !dark && { borderWidth: 1, borderColor: colors.border }
            ]}>
                <MaterialCommunityIcons name={icon as any} size={28} color={dark ? '#000' : colors.primary} />
                <Text style={[styles.actionLabel, { color: dark ? '#000' : colors.textMain }]}>{label}</Text>
            </View>
        </TouchableOpacity>
    );
}

function OperatorCard({ operator, colors, onPress }: any) {
    return (
        <TouchableOpacity
            style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onPress}
        >
            <View style={[styles.listCardIcon, { backgroundColor: colors.cardLight }]}>
                <MaterialCommunityIcons name="account" size={24} color={colors.primary} />
            </View>
            <View style={styles.listCardContent}>
                <Text style={[styles.listCardTitle, { color: colors.textMain }]}>{operator.name}</Text>
                <Text style={[styles.listCardSubtitle, { color: colors.textMuted }]}>{operator.mobile}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.border} />
        </TouchableOpacity>
    );
}

function MachineCard({ machine, colors, onPress }: any) {
    const statusColors: Record<string, string> = {
        available: colors.success,
        in_use: colors.warning,
        maintenance: colors.danger,
    };

    const statusLabels: Record<string, string> = {
        available: 'Online',
        in_use: 'Active',
        maintenance: 'Service',
    };

    const status = (machine.status || 'available') as string;

    const imageUrl = resolveImageUrl(machine.photo_url || machine.photo_path || machine.photoUrl);

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
        paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    headerRight: { flexDirection: 'row' },
    locationBadge: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginTop: 4, alignSelf: 'flex-start'
    },
    greeting: {
        fontSize: 14, fontWeight: '500'
    },
    ownerName: { fontSize: 26, fontWeight: '900' },
    subtitle: { fontSize: 12, marginLeft: 4 },
    profileCircle: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
    statsContainer: { marginTop: 10 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    statCard: { flex: 1, borderRadius: 12, padding: 16, borderWidth: 1 },
    statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    statIconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: '900' },
    statLabel: { fontSize: 13, fontWeight: '500' },
    miniStatsRow: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 12, padding: 12, borderWidth: 1 },
    miniStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    miniStatValue: { fontSize: 14, fontWeight: '700' },
    miniStatLabel: { fontSize: 11 },
    section: { marginTop: 28 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
    viewAll: { fontSize: 13, fontWeight: '700' },
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    actionButton: { width: (width - 60) / 2 },
    actionGradient: { width: '100%', paddingVertical: 20, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
    actionLabel: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
    listCard: { flexDirection: 'row', borderRadius: 12, padding: 12, marginBottom: 10, alignItems: 'center', borderWidth: 1 },
    listCardIcon: { width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    listCardContent: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
    listCardTitle: { fontSize: 15, fontWeight: '700' },
    typeChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
    typeChipText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
    listCardSubtitle: { fontSize: 12 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    emptyState: { alignItems: 'center', paddingVertical: 30, borderRadius: 4, borderStyle: 'dashed', borderWidth: 1 },
    emptyText: { fontSize: 14, marginTop: 10, fontWeight: '500' },
});
