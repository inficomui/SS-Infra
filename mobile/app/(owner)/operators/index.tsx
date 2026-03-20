import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Linking } from 'react-native';
import { Text, ActivityIndicator, Searchbar, Avatar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetOperatorsQuery } from '@/redux/apis/ownerApi';
import { useAppTheme } from '@/hooks/use-theme-color';
import Toast from 'react-native-toast-message';

// Simple debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export default function OperatorsListScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors, isDark } = useAppTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'All' | 'Operator' | 'Driver'>('All');

    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const { data: operatorsData, error: apiError, isLoading, refetch, isFetching } = useGetOperatorsQuery({
        search: debouncedSearchQuery || undefined,
        role: roleFilter === 'All' ? undefined : roleFilter as 'Operator' | 'Driver'
    });

    const [refreshing, setRefreshing] = useState(false);

    // Determine if we have an API error (either HTTP error or 200 OK with success: false)
    const errorData = (apiError as any)?.data || (operatorsData?.success === false ? operatorsData : null);
    const errorMessage = errorData?.message || (apiError as any)?.error;
    const isSubscriptionExpired = errorData?.subscription_expired === true;

    // Support both { operators: [] } and { data: [] } formats based on API responses
    const rawData = operatorsData as any;
    const operators = Array.isArray(rawData?.operators)
        ? rawData.operators
        : (Array.isArray(rawData?.data) ? rawData.data : []);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refetch();
            Toast.show({ type: 'success', text1: t('owner.refreshed_success'), text2: t('owner.refreshed_msg') || 'Operator list refreshed.' });
        } catch (error) {
            Toast.show({ type: 'error', text1: t('common.error'), text2: t('owner.network_error_msg') });
        }
        setRefreshing(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('owner.operators')}</Text>
                <TouchableOpacity onPress={() => router.push('/(owner)/add-operator' as any)} style={[styles.iconButton, { backgroundColor: colors.primary }]}>
                    <MaterialCommunityIcons name="account-plus" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchWrapper}>
                <Searchbar
                    placeholder="Search by name or mobile..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
                    inputStyle={{ color: colors.textMain }}
                    placeholderTextColor={colors.textMuted}
                    iconColor={colors.primary}
                />
            </View>

            <View style={{ marginBottom: 20 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                    <FilterChip label={t('owner.all_staff')} active={roleFilter === 'All'} onPress={() => setRoleFilter('All')} colors={colors} />
                    <FilterChip label={t('owner.driver')} active={roleFilter === 'Driver'} onPress={() => setRoleFilter('Driver')} colors={colors} />
                    <FilterChip label={t('owner.operator')} active={roleFilter === 'Operator'} onPress={() => setRoleFilter('Operator')} colors={colors} />
                </ScrollView>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                <View style={styles.summaryBar}>
                    <Text style={[styles.summaryText, { color: colors.textMuted }]}>
                        {t('owner.total_registered')} <Text style={{ color: colors.primary, fontWeight: '900' }}>{operators.length}</Text>
                    </Text>
                    {isFetching && !refreshing && <ActivityIndicator size={12} color={colors.primary} style={{ marginLeft: 8 }} />}
                </View>

                {isLoading && !isFetching ? (
                    <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
                ) : errorMessage ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons
                            name={isSubscriptionExpired ? "credit-card-off-outline" : "alert-circle-outline"}
                            size={80}
                            color={colors.danger || '#EF4444'}
                            style={{ marginBottom: 16 }}
                        />
                        <Text style={[styles.emptyText, { color: colors.textMain, fontWeight: '900', fontSize: 20 }]}>
                            {isSubscriptionExpired ? t('owner.subscription_expired', 'Subscription Ended') : t('common.error', 'Error Loading Data')}
                        </Text>
                        <Text style={[{ color: colors.textMuted, textAlign: 'center', marginTop: 12, paddingHorizontal: 20, fontSize: 14, lineHeight: 22 }]}>
                            {errorMessage}
                        </Text>
                        {isSubscriptionExpired && (
                            <TouchableOpacity
                                onPress={() => router.push({ pathname: '/(common)/plans' as any, params: { source: 'expired' } })}
                                style={{ marginTop: 30, backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 }}
                            >
                                <Text style={{ color: '#000', fontWeight: '800', fontSize: 16 }}>Renew Plan Now</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : operators.length === 0 && !isFetching ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="account-group-outline" size={80} color={colors.border} />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('owner.no_operators_found')}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
                            {t('owner.add_first_worker_hint')}
                        </Text>
                    </View>
                ) : (
                    operators.map((operator: any) => (
                        <OperatorListItem key={operator.id} operator={operator} colors={colors} />
                    ))
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

function FilterChip({ label, active, onPress, colors }: any) {
    const { t } = useTranslation();
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.filterChip,
                { backgroundColor: colors.card, borderColor: colors.border },
                active && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
        >
            <Text style={[styles.filterChipText, { color: colors.textMuted }, active && { color: '#000' }]}>{label}</Text>
        </TouchableOpacity>
    );
}

function OperatorListItem({ operator, colors }: any) {
    const { t } = useTranslation();
    const router = useRouter();
    const initials = operator.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
    const isDriver = operator.role === 'Driver';

    // Salary display
    const salaryLabel = operator.salaryType === 'monthly'
        ? `₹${parseFloat(operator.salaryAmount || '0').toLocaleString('en-IN')}/mo`
        : operator.salaryType === 'daily'
            ? `₹${parseFloat(operator.salaryAmount || '0').toLocaleString('en-IN')}/day`
            : null;

    const handleCall = () => {
        if (operator.mobile) Linking.openURL(`tel:${operator.mobile}`);
    };

    const handlePress = () => {
        router.push({
            pathname: '/(owner)/operator-details',
            params: { data: JSON.stringify(operator) }
        });
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[styles.operatorCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
            <Avatar.Text
                size={52}
                label={initials}
                style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}
                color={colors.primary}
                labelStyle={{ fontWeight: '900' }}
            />
            <View style={styles.operatorInfo}>
                <View style={styles.nameRow}>
                    <Text style={[styles.operatorName, { color: colors.textMain }]}>{operator.name}</Text>
                    <View style={[
                        styles.roleBadge,
                        { backgroundColor: isDriver ? '#3B82F620' : colors.success + '20' }
                    ]}>
                        <MaterialCommunityIcons
                            name={isDriver ? 'steering' : 'account-hard-hat'}
                            size={10}
                            color={isDriver ? '#3B82F6' : colors.success}
                            style={{ marginRight: 3 }}
                        />
                        <Text style={[
                            styles.roleBadgeText,
                            { color: isDriver ? '#3B82F6' : colors.success }
                        ]}>
                            {isDriver ? t('owner.driver').toUpperCase() : t('owner.operator').toUpperCase()}
                        </Text>
                    </View>
                </View>
                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="phone" size={12} color={colors.textMuted} />
                    <Text style={[styles.detailText, { color: colors.textMuted }]}>{operator.mobile}</Text>
                </View>
                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="map-marker" size={12} color={colors.primary} />
                    <Text style={[styles.detailText, { color: colors.textMuted }]}>{operator.district}, {operator.taluka}</Text>
                </View>
                {isDriver && operator.license_number && (
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="card-account-details-outline" size={12} color={colors.textMuted} />
                        <Text style={[styles.detailText, { color: colors.textMuted }]}>{operator.license_number}</Text>
                    </View>
                )}
                {salaryLabel && (
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="cash" size={12} color={colors.success} />
                        <Text style={[styles.detailText, { color: colors.success, fontWeight: '700' }]}>{salaryLabel}</Text>
                    </View>
                )}
            </View>
            <View style={styles.actionColumn}>
                <TouchableOpacity onPress={handleCall} style={[styles.callBtn, { backgroundColor: colors.primary + '20' }]}>
                    <MaterialCommunityIcons name="phone-outgoing" size={18} color={colors.primary} />
                </TouchableOpacity>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
        marginBottom: 16
    },
    iconButton: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1, elevation: 2 },
    headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
    searchWrapper: { paddingHorizontal: 20, marginBottom: 20 },
    searchBar: { borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, borderWidth: 1 },
    filterChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, elevation: 1 },
    filterChipText: { fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    summaryBar: { marginBottom: 20, paddingLeft: 8 },
    summaryText: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, opacity: 0.8 },
    operatorCard: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        flexDirection: 'row',
        marginBottom: 16,
        gap: 20,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    operatorInfo: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' },
    operatorName: { fontSize: 18, fontWeight: '800', letterSpacing: 0.2 },
    roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    roleBadgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    detailText: { fontSize: 14, fontWeight: '500', opacity: 0.8 },
    actionColumn: { alignItems: 'center', gap: 16 },
    callBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    emptyContainer: { alignItems: 'center', marginTop: 120 },
    emptyText: { fontSize: 18, marginTop: 20, fontWeight: '600', opacity: 0.7 },
});
