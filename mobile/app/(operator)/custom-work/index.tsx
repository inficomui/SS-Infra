import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Platform,
} from 'react-native';
import { Text, ActivityIndicator, Searchbar, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetCustomWorksQuery, CustomWork } from '@/redux/apis/customWorkApi';
import { formatDate } from '@/utils/formatters';

export default function OperatorCustomWorksScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colors } = useAppTheme();
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const { data, isLoading, refetch } = useGetCustomWorksQuery(
        statusFilter ? { status: statusFilter } : undefined
    );

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

    const customWorks: CustomWork[] = data?.data || data?.customWorks || [];
    const filteredWorks = customWorks.filter(w =>
        (w.workName && w.workName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (w.clientName && w.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (w.workLocation && w.workLocation.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return colors.success;
            case 'In Progress': return colors.primary;
            case 'Started': return colors.warning;
            default: return colors.textMuted;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Completed': return t('custom_work.status_completed') || 'Completed';
            case 'In Progress': return t('custom_work.status_in_progress') || 'In Progress';
            case 'Started': return t('custom_work.status_started') || 'Started';
            case 'Draft': return t('custom_work.status_draft') || 'Draft';
            default: return status;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('custom_work.title') || 'Custom Work Management'}</Text>
                <TouchableOpacity onPress={() => router.push('/(operator)/custom-work/create' as any)} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
                    <MaterialCommunityIcons name="plus" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Search and Filters */}
            <View style={styles.filterSection}>
                <Searchbar
                    placeholder={t('custom_work.search_placeholder') || 'Search work, client or location...'}
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={[styles.searchBar, { backgroundColor: colors.card }]}
                    inputStyle={{ color: colors.textMain, fontSize: 14 }}
                    iconColor={colors.primary}
                    placeholderTextColor={colors.textMuted}
                />

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                    {['', 'Draft', 'Started', 'In Progress', 'Completed'].map((status) => (
                        <Chip
                            key={status}
                            selected={statusFilter === status}
                            onPress={() => setStatusFilter(status)}
                            style={[
                                styles.chip,
                                { backgroundColor: statusFilter === status ? colors.primary : colors.card, borderColor: colors.border }
                            ]}
                            textStyle={{ color: statusFilter === status ? '#000' : colors.textMain, fontWeight: '700', fontSize: 12 }}
                        >
                            {status === '' ? (t('custom_work.all_statuses') || 'All Statuses') : getStatusLabel(status)}
                        </Chip>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                {isLoading ? (
                    <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
                ) : filteredWorks.length > 0 ? (
                    filteredWorks.map((work) => (
                        <TouchableOpacity
                            key={work.id}
                            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => router.push({
                                pathname: '/(operator)/custom-work/[id]',
                                params: { id: work.id.toString(), data: JSON.stringify(work) }
                            } as any)}
                        >
                            <View style={styles.cardHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.workName, { color: colors.textMain }]} numberOfLines={1}>
                                        {work.workName || 'Custom Work'}
                                    </Text>
                                    <Text style={[styles.clientName, { color: colors.textMuted }]} numberOfLines={1}>
                                        <MaterialCommunityIcons name="account" size={14} color={colors.primary} /> {work.clientName || 'Client'}
                                    </Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(work.status) + '20' }]}>
                                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(work.status) }]} />
                                    <Text style={[styles.statusText, { color: getStatusColor(work.status) }]}>{getStatusLabel(work.status)}</Text>
                                </View>
                            </View>

                            <View style={[styles.divider, { backgroundColor: colors.border }]} />

                            <View style={styles.cardBody}>
                                <View style={styles.infoItem}>
                                    <MaterialCommunityIcons name="excavator" size={16} color={colors.primary} />
                                    <Text style={[styles.infoText, { color: colors.textMain }]}>{work.machineName || 'Assigned Machine'}</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <MaterialCommunityIcons name="map-marker" size={16} color={colors.textMuted} />
                                    <Text style={[styles.infoText, { color: colors.textMuted }]} numberOfLines={1}>{work.workLocation || 'Location'}</Text>
                                </View>
                            </View>

                            <View style={styles.cardFooter}>
                                <Text style={[styles.dateText, { color: colors.textMuted }]}>
                                    {work.createdAt ? formatDate(work.createdAt) : ''}
                                </Text>
                                <Text style={[styles.costText, { color: colors.success }]}>
                                    ₹{Number(work.workCost || 0).toLocaleString('en-IN')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MaterialCommunityIcons name="briefcase-outline" size={48} color={colors.border} />
                        <Text style={[styles.emptyTitle, { color: colors.textMain }]}>{t('custom_work.no_records') || 'No custom work records found.'}</Text>
                        <TouchableOpacity
                            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
                            onPress={() => router.push('/(operator)/custom-work/create' as any)}
                        >
                            <Text style={styles.emptyBtnText}>{t('custom_work.create_title') || 'Log Custom Work'}</Text>
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
    filterSection: { paddingHorizontal: 20, marginBottom: 10 },
    searchBar: { elevation: 0, borderRadius: 12, height: 48 },
    chipsRow: { gap: 8, paddingVertical: 12 },
    chip: { borderRadius: 20, borderWidth: 1, height: 36, justifyContent: 'center' },
    listContent: { paddingHorizontal: 20, paddingBottom: 100 },
    card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 14 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    workName: { fontSize: 16, fontWeight: '800' },
    clientName: { fontSize: 13, fontWeight: '600', marginTop: 4 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 11, fontWeight: '800' },
    divider: { height: 1, marginVertical: 12 },
    cardBody: { gap: 6, marginBottom: 12 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoText: { fontSize: 13, fontWeight: '600' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dateText: { fontSize: 12, fontWeight: '500' },
    costText: { fontSize: 16, fontWeight: '900' },
    emptyBox: { borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', padding: 32, alignItems: 'center', marginTop: 30 },
    emptyTitle: { fontSize: 16, fontWeight: '800', marginTop: 16 },
    emptySub: { fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 20 },
    emptyBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    emptyBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
});
