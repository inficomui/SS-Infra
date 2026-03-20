
import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetDutyHistoryQuery } from '@/redux/apis/workApi';
import { useAppTheme } from '@/hooks/use-theme-color';
import { formatDate, formatDuration } from '../../utils/formatters';
import { useCallback } from 'react';

export default function DutyLogScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colors } = useAppTheme();
    const [page, setPage] = useState(1);
    const { data, isLoading, isFetching, refetch } = useGetDutyHistoryQuery({ page, limit: 20 });
    
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const handleLoadMore = () => {
        if (data?.pagination && data.pagination.currentPage < data.pagination.totalPages) {
            setPage(prev => prev + 1);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
                router.push({
                    pathname: '/(driver)/duty-details',
                    params: { id: item.id }
                });
            }}
        >
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.clientName, { color: colors.textMain }]}>
                        {item.clientName || item.client_name || item.startLocation || item.start_location || item.siteAddress || item.site_address || t('overview.ss_infra_site')}
                    </Text>
                    <Text style={[styles.date, { color: colors.textMuted }]}>{formatDate(item.startedAt || item.started_at || item.createdAt || item.created_at)}</Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.status === 'completed' ? colors.success + '15' : (item.status === 'cancelled' ? colors.danger + '15' : colors.primary + '15') }
                ]}>
                    <Text style={[
                        styles.statusText,
                        { color: item.status === 'completed' ? colors.success : (item.status === 'cancelled' ? colors.danger : colors.primary) }
                    ]}>
                        {item.status === 'in_progress' ? `🚨 ${t('overview.active').toUpperCase()}` : (t(`overview.${item.status}`) || item.status).toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.locationContainer}>
                <View style={styles.timelineRow}>
                    <MaterialCommunityIcons name="circle-outline" size={14} color={colors.primary} />
                    <Text style={[styles.locationText, { color: colors.textMain }]} numberOfLines={1}>
                        {item.startLocation || item.start_location || item.siteAddress || item.site_address || t('driver.start_location')}
                    </Text>
                    {item.startMeterReading && (
                        <Text style={[styles.meterLabel, { color: colors.textMuted }]}>
                            {item.startMeterReading} KM
                        </Text>
                    )}
                </View>
                <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                <View style={styles.timelineRow}>
                    <MaterialCommunityIcons name="map-marker" size={14} color={colors.danger} />
                    <Text style={[styles.locationText, { color: colors.textMain }]} numberOfLines={1}>
                        {item.endLocation || t('overview.in_progress')}
                    </Text>
                    {item.endMeterReading && (
                        <Text style={[styles.meterLabel, { color: colors.textMuted }]}>
                            {item.endMeterReading} KM
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={[styles.statBadge, { backgroundColor: colors.border + '30' }]}>
                    <MaterialCommunityIcons name="clock-outline" size={12} color={colors.textMuted} />
                    <Text style={[styles.statValue, { color: colors.textMain }]}>
                        {(item.totalHours || item.total_hours) ? `${item.totalHours || item.total_hours} hrs` : (item.status === 'completed' ? 'Done' : t('overview.active'))}
                    </Text>
                </View>
                {item.clientDistrict && (
                    <View style={[styles.statBadge, { backgroundColor: colors.border + '30' }]}>
                        <MaterialCommunityIcons name="map-marker-outline" size={12} color={colors.textMuted} />
                        <Text style={[styles.statValue, { color: colors.textMain }]}>{item.clientDistrict}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('driver.duty_history') || 'Duty Log'}</Text>
                <View style={{ width: 44 }} />
            </View>

            {isLoading && page === 1 ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={data?.workSessions || data?.work_sessions || data?.data || []}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={colors.border} />
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('overview.no_sessions_found')}</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    listContent: { padding: 20, paddingBottom: 100 },
    card: { borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
    clientName: { fontSize: 16, fontWeight: '900', marginBottom: 2 },
    date: { fontSize: 12, fontWeight: '700' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
    divider: { height: 1, marginVertical: 16, opacity: 0.5 },
    locationContainer: { gap: 4, marginBottom: 20 },
    timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    timelineLine: { width: 1, height: 12, marginLeft: 6.5, marginVertical: 2 },
    locationText: { fontSize: 13, fontWeight: '700', flex: 1 },
    meterLabel: { fontSize: 11, fontWeight: '800' },
    cardFooter: { flexDirection: 'row', gap: 12 },
    statBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    statValue: { fontSize: 12, fontWeight: '800' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 100, gap: 16 },
    emptyText: { fontSize: 16, fontWeight: '800' }
});
