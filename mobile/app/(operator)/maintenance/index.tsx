import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform, FlatList } from 'react-native';
import { Text, ActivityIndicator, Searchbar, IconButton, Menu } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';
import { useGetMaintenanceRecordsQuery } from '@/redux/apis/maintenanceApi';
import DateTimePicker from '@react-native-community/datetimepicker';
import { resolveImageUrl } from '../../../utils/imageHelpers';
import { formatDate } from '../../../utils/formatters';
import { Image } from 'react-native';

export default function OperatorMaintenanceRecordsScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const { t } = useTranslation();

    // Filters & Pagination
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Query
    const { data: recordsData, isLoading, isFetching, refetch } = useGetMaintenanceRecordsQuery({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        page: page,
    });

    const recordsResponse = recordsData?.data;
    const recordsList = recordsResponse?.data || [];
    const totalPages = recordsResponse?.last_page || 1;

    const processedRecords = useMemo(() => {
        let list = [...recordsList];

        if (searchQuery) {
            list = list.filter(record =>
                record.machine?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.service_type.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        list.sort((a, b) => new Date(b.service_date).getTime() - new Date(a.service_date).getTime());

        return list;
    }, [recordsList, searchQuery]);

    const onStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(false);
        if (selectedDate) setStartDate(selectedDate);
    };

    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(false);
        if (selectedDate) setEndDate(selectedDate);
    };

    const renderItem = ({ item: record }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push({ pathname: '/(operator)/maintenance/[id]', params: { id: record.id, data: JSON.stringify(record) } })}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <View style={[styles.iconBox, { backgroundColor: colors.primary + '15', overflow: 'hidden' }]}>
                        {record.service_image_url ? (
                            <Image source={{ uri: resolveImageUrl(record.service_image_url) }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        ) : (
                            <MaterialCommunityIcons name="wrench-outline" size={20} color={colors.primary} />
                        )}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.machineName, { color: colors.textMain }]} numberOfLines={1}>{record.machine?.name || t('maintenance_records.unknown_machine')}</Text>
                        <Text style={[styles.subText, { color: colors.textMuted }]}>{formatDate(record.service_date)}</Text>
                    </View>
                </View>
                <IconButton icon="chevron-right" iconColor={colors.textMuted} onPress={() => router.push({ pathname: '/(operator)/maintenance/[id]', params: { id: record.id, data: JSON.stringify(record) } })} />
            </View>

            <View style={[styles.statsRow, { borderColor: colors.border }]}>
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('maintenance_records.service_type')}</Text>
                    <Text style={[styles.statValue, { color: colors.textMain }]}>{record.service_type}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('maintenance_records.documents')}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        {record.service_image_url && <MaterialCommunityIcons name="camera" size={16} color={colors.success} />}
                        {record.invoice_image_url && <MaterialCommunityIcons name="file-document" size={16} color={colors.success} />}
                        {!record.service_image_url && !record.invoice_image_url && <Text style={{ fontSize: 10, color: colors.textMuted }}>{t('maintenance_records.no_photo')}</Text>}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('maintenance_records.title')}</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(operator)/maintenance/add' as any)}
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                >
                    <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder={t('maintenance_records.search_placeholder')}
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={[styles.searchBar, { backgroundColor: colors.card }]}
                    inputStyle={{ color: colors.textMain }}
                    placeholderTextColor={colors.textMuted}
                    iconColor={colors.textMuted}
                />
            </View>

            <View style={styles.filtersRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
                    <TouchableOpacity onPress={() => setShowStartPicker(true)} style={[styles.filterChip, { borderColor: colors.border, backgroundColor: colors.card }]}>
                        <MaterialCommunityIcons name="calendar" size={16} color={colors.primary} />
                        <Text style={[styles.filterText, { color: colors.textMain }]}>{formatDate(startDate)}</Text>
                    </TouchableOpacity>
                    <MaterialCommunityIcons name="minus" size={16} color={colors.textMuted} />
                    <TouchableOpacity onPress={() => setShowEndPicker(true)} style={[styles.filterChip, { borderColor: colors.border, backgroundColor: colors.card }]}>
                        <MaterialCommunityIcons name="calendar" size={16} color={colors.primary} />
                        <Text style={[styles.filterText, { color: colors.textMain }]}>{formatDate(endDate)}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <FlatList
                data={processedRecords}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="hammer-wrench" size={64} color={colors.textMuted} />
                            <Text style={{ color: colors.textMuted, marginTop: 16 }}>{t('maintenance_records.no_records')}</Text>
                        </View>
                    ) : null
                }
                ListHeaderComponent={
                    isLoading ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} /> : null
                }
                ListFooterComponent={
                    totalPages > 1 ? (
                        <View style={styles.pagination}>
                            <IconButton icon="chevron-left" disabled={page === 1} onPress={() => setPage(page - 1)} />
                            <Text style={{ color: colors.textMain }}>{t('fuel_management.page')} {page} {t('fuel_management.of')} {totalPages}</Text>
                            <IconButton icon="chevron-right" disabled={page === totalPages} onPress={() => setPage(page + 1)} />
                        </View>
                    ) : null
                }
            />

            {(showStartPicker || showEndPicker) && (
                <DateTimePicker
                    value={showStartPicker ? startDate : endDate}
                    mode="date"
                    display="default"
                    onChange={showStartPicker ? onStartDateChange : onEndDateChange}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    addButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    headerTitle: { fontSize: 20, fontWeight: '900' },
    searchContainer: { paddingHorizontal: 24, marginBottom: 16 },
    searchBar: { borderRadius: 12, elevation: 0, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    filtersRow: { marginBottom: 16 },
    filterScrollContent: { paddingHorizontal: 24, gap: 10, alignItems: 'center' },
    filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
    filterText: { fontSize: 12, fontWeight: '600' },
    listContent: { paddingHorizontal: 24, paddingBottom: 40 },
    emptyState: { alignItems: 'center', justifyContent: 'center', padding: 60, opacity: 0.5 },
    card: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    machineName: { fontSize: 15, fontWeight: '800' },
    subText: { fontSize: 11, marginTop: 2 },
    amountText: { fontSize: 18, fontWeight: '900' },
    statsRow: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 12 },
    statItem: { flex: 1, alignItems: 'center' },
    divider: { width: 1, height: '80%' },
    statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
    statValue: { fontSize: 14, fontWeight: '700' },
    pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }
});
