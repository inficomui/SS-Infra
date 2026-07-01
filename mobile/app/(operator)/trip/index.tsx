import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { Text, ActivityIndicator, Searchbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetTripEntriesQuery, TripEntry } from '@/redux/apis/tripApi';
import { formatDate } from '@/utils/formatters';

export default function OperatorTripEntriesScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colors } = useAppTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const { data, isLoading, refetch } = useGetTripEntriesQuery();

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const tripEntries: TripEntry[] = data?.data || data?.tripEntries || [];
    const filteredTrips = tripEntries.filter(t =>
        (t.workName && t.workName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.clientName && t.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.machineName && t.machineName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const totalEarnings = filteredTrips.reduce((acc, trip) => acc + Number(trip.totalAmount || 0), 0);
    const totalTripsCount = filteredTrips.reduce((acc, trip) => acc + Number(trip.tripCount || 0), 0);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('trip_management.title') || 'Trip Management'}</Text>
                <TouchableOpacity onPress={() => router.push('/(operator)/trip/create' as any)} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
                    <MaterialCommunityIcons name="plus" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{t('trip_management.total_amount') || 'Total Trip Earnings'}</Text>
                    <Text style={[styles.summaryValue, { color: colors.success }]}>₹{totalEarnings.toLocaleString('en-IN')}</Text>
                </View>
                <View style={[styles.summaryDiv, { backgroundColor: colors.border }]} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{t('trip_management.trip_count') || 'Total Trips Logged'}</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>{totalTripsCount} {t('trip_management.trips_suffix') || 'Trips'}</Text>
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchSection}>
                <Searchbar
                    placeholder={t('trip_management.search_placeholder') || 'Search client, machine, work...'}
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={[styles.searchBar, { backgroundColor: colors.card }]}
                    inputStyle={{ color: colors.textMain, fontSize: 14 }}
                    iconColor={colors.primary}
                    placeholderTextColor={colors.textMuted}
                />
            </View>

            <ScrollView
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {isLoading ? (
                    <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
                ) : filteredTrips.length > 0 ? (
                    filteredTrips.map((trip) => (
                        <View key={trip.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={styles.cardHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.workName, { color: colors.textMain }]}>{trip.workName || (t('trip_management.default_work') || 'Trip Based Work')}</Text>
                                    <Text style={[styles.clientName, { color: colors.textMuted }]}>
                                        <MaterialCommunityIcons name="account" size={14} color={colors.primary} /> {trip.clientName || (t('common.client') || 'Client')}
                                    </Text>
                                </View>
                                <View style={[styles.amtBadge, { backgroundColor: colors.success + '15' }]}>
                                    <Text style={[styles.amtText, { color: colors.success }]}>₹{Number(trip.totalAmount || 0).toLocaleString('en-IN')}</Text>
                                </View>
                            </View>

                            <View style={[styles.divider, { backgroundColor: colors.border }]} />

                            <View style={styles.statsRow}>
                                <View style={styles.statBox}>
                                    <MaterialCommunityIcons name="dump-truck" size={18} color={colors.primary} />
                                    <Text style={[styles.statVal, { color: colors.textMain }]}>{trip.machineName || (t('trip_management.default_machine') || 'Tractor / Dumper')}</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <MaterialCommunityIcons name="counter" size={18} color={colors.warning} />
                                    <Text style={[styles.statVal, { color: colors.textMain }]}>{trip.tripCount} {t('trip_management.trips_suffix') || 'Trips'} @ ₹{trip.costPerTrip}</Text>
                                </View>
                            </View>

                            <View style={styles.cardFooter}>
                                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                                    {t('common.date') || 'Date'}: {trip.date || (trip.createdAt ? formatDate(trip.createdAt) : (t('common.today') || 'Today'))}
                                </Text>
                                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                                    {t('common.operator') || 'Operator'}: {trip.operatorName || (t('common.you') || 'You')}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MaterialCommunityIcons name="dump-truck" size={48} color={colors.border} />
                        <Text style={[styles.emptyTitle, { color: colors.textMain }]}>{t('trip_management.no_records') || 'No Trip Entries Found'}</Text>
                        <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: colors.primary }]} onPress={() => router.push('/(operator)/trip/create' as any)}>
                            <Text style={styles.emptyBtnText}>{t('trip_management.log_trip') || 'New Trip Entry'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    addBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    summaryCard: { marginHorizontal: 20, marginBottom: 14, padding: 18, borderRadius: 14, borderWidth: 1, flexDirection: 'row' },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryLabel: { fontSize: 12, fontWeight: '700' },
    summaryValue: { fontSize: 20, fontWeight: '900', marginTop: 4 },
    summaryDiv: { width: 1, height: '100%' },
    searchSection: { paddingHorizontal: 20, marginBottom: 14 },
    searchBar: { elevation: 0, borderRadius: 12, height: 48 },
    listContent: { paddingHorizontal: 20, paddingBottom: 100 },
    card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 14, gap: 10 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    workName: { fontSize: 16, fontWeight: '800' },
    clientName: { fontSize: 13, fontWeight: '600', marginTop: 4 },
    amtBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    amtText: { fontSize: 15, fontWeight: '900' },
    divider: { height: 1, marginVertical: 4 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statVal: { fontSize: 13, fontWeight: '700' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    emptyBox: { borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', padding: 32, alignItems: 'center', marginTop: 30 },
    emptyTitle: { fontSize: 16, fontWeight: '800', marginTop: 16 },
    emptySub: { fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 20 },
    emptyBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    emptyBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
});
