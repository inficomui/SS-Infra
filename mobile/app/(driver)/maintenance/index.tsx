import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform, FlatList } from 'react-native';
import { Text, ActivityIndicator, Searchbar, IconButton, Menu, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';
import { MaintenanceRecord, useGetMaintenanceRecordsQuery } from '@/redux/apis/maintenanceApi';
import { useGetMeQuery } from '@/redux/apis/authApi';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '../../../utils/formatters';

export default function DriverMaintenanceRecordsScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const { t } = useTranslation();

    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const [showSortMenu, setShowSortMenu] = useState(false);

    // User Query
    const { data: userData } = useGetMeQuery();

    const { data: recordsData, isLoading, isFetching, refetch } = useGetMaintenanceRecordsQuery({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        page: page,
    });

    const recordsList = recordsData?.records || recordsData?.data?.data || [];
    const totalPages = recordsData?.pagination?.totalPages || recordsData?.data?.last_page || 1;

    const processedRecords = useMemo(() => {
        let list = [...recordsList];

        if (userData?.user?.id) {
            list = list.filter(record => record.operatorId === userData.user.id || record.operator_id === userData.user.id || record.operator?.id === userData.user.id);
        }

        if (searchQuery) {
            list = list.filter(record =>
                record.machine?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (record.serviceType || record.service_type || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        list.sort((a, b) => {
            const dateA = new Date(a.serviceDate || a.service_date || '').getTime();
            const dateB = new Date(b.serviceDate || b.service_date || '').getTime();
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return list;
    }, [recordsList, searchQuery, sortBy]);

    const onStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(false);
        if (selectedDate) setStartDate(selectedDate);
    };

    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(false);
        if (selectedDate) setEndDate(selectedDate);
    };

    const renderItem = ({ item: record }: { item: MaintenanceRecord }) => (
        <TouchableOpacity
            style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push({
                pathname: '/(driver)/maintenance/[id]',
                params: { id: record.id, data: JSON.stringify(record) }
            } as any)}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                        <MaterialCommunityIcons name="wrench" size={24} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.machineName, { color: colors.textMain }]} numberOfLines={1}>
                            {record.machine?.name || 'Unknown Vehicle'}
                        </Text>
                        <Text style={[styles.dateText, { color: colors.textMuted }]}>
                            {record.serviceType || record.service_type} • {formatDate(record.serviceDate || record.service_date || '')}
                        </Text>
                    </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.amountText, { color: colors.textMain }]}>₹{record.cost}</Text>
                    <Text style={[styles.operatorSubText, { color: colors.textMuted }]}>{record.operator?.name}</Text>
                </View>
            </View>

            <View style={[styles.statsRow, { borderTopColor: colors.border + '30' }]}>
                <View style={styles.statItem}>
                    <MaterialCommunityIcons name="image-multiple-outline" size={16} color={colors.textMuted} style={{ marginBottom: 4 }} />
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>Photos</Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        <MaterialCommunityIcons name={(record.serviceImageUrl || record.service_image_url) ? "check-circle" : "minus-circle-outline"} size={14} color={(record.serviceImageUrl || record.service_image_url) ? colors.success : colors.textMuted} />
                        <MaterialCommunityIcons name={(record.invoiceImageUrl || record.invoice_image_url) ? "check-circle" : "minus-circle-outline"} size={14} color={(record.invoiceImageUrl || record.invoice_image_url) ? colors.success : colors.textMuted} />
                    </View>
                </View>

                <View style={[styles.verticalDivider, { backgroundColor: colors.border + '30' }]} />

                <View style={styles.viewDetailBtn}>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
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
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Maintenance Records</Text>
                <TouchableOpacity onPress={() => router.push('/(driver)/maintenance/add' as any)} style={[styles.addButton, { backgroundColor: colors.primary }]}>
                    <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Search records..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={[styles.searchBar, { backgroundColor: colors.card }]}
                    inputStyle={{ color: colors.textMain }}
                    iconColor={colors.textMuted}
                />
            </View>

            <View style={styles.filtersRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
                    <TouchableOpacity onPress={() => setShowStartPicker(true)} style={[styles.filterChip, { borderColor: colors.border, backgroundColor: colors.card }]}>
                        <MaterialCommunityIcons name="calendar-import" size={16} color={colors.primary} />
                        <Text style={[styles.filterText, { color: colors.textMain }]}>From {formatDate(startDate)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setShowEndPicker(true)} style={[styles.filterChip, { borderColor: colors.border, backgroundColor: colors.card }]}>
                        <MaterialCommunityIcons name="calendar-export" size={16} color={colors.primary} />
                        <Text style={[styles.filterText, { color: colors.textMain }]}>To {formatDate(endDate)}</Text>
                    </TouchableOpacity>

                    <Menu
                        visible={showSortMenu}
                        onDismiss={() => setShowSortMenu(false)}
                        anchor={
                            <TouchableOpacity onPress={() => setShowSortMenu(true)} style={[styles.filterChip, { borderColor: colors.border, backgroundColor: colors.card }]}>
                                <MaterialCommunityIcons name="sort-variant" size={16} color={colors.primary} />
                                <Text style={[styles.filterText, { color: colors.textMain }]}>Sort: {sortBy}</Text>
                            </TouchableOpacity>
                        }
                    >
                        <Menu.Item onPress={() => { setSortBy('newest'); setShowSortMenu(false); }} title="Newest First" />
                        <Menu.Item onPress={() => { setSortBy('oldest'); setShowSortMenu(false); }} title="Oldest First" />
                    </Menu>
                </ScrollView>
            </View>

            <FlatList
                data={processedRecords}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />}
                ListEmptyComponent={!isLoading ? <View style={styles.emptyState}><MaterialCommunityIcons name="wrench-cog" size={64} color={colors.textMuted} /><Text style={{ color: colors.textMuted, marginTop: 16 }}>No records found</Text></View> : null}
                ListHeaderComponent={isLoading ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} /> : null}
                ListFooterComponent={totalPages > 1 ? (
                    <View style={styles.pagination}>
                        <IconButton icon="chevron-left" disabled={page === 1} onPress={() => setPage(page - 1)} />
                        <Text style={{ color: colors.textMain }}>Page {page} of {totalPages}</Text>
                        <IconButton icon="chevron-right" disabled={page === totalPages} onPress={() => setPage(page + 1)} />
                    </View>
                ) : <View style={{ height: 20 }} />}
            />

            {(showStartPicker || showEndPicker) && (
                <DateTimePicker
                    value={showStartPicker ? startDate : endDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
    filterScrollContent: { paddingHorizontal: 24, gap: 10 },
    filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
    filterText: { fontSize: 12, fontWeight: '700' },
    listContent: { paddingHorizontal: 24, paddingBottom: 40 },
    emptyState: { alignItems: 'center', justifyContent: 'center', padding: 60, opacity: 0.5 },
    recordCard: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    machineName: { fontSize: 17, fontWeight: '900', letterSpacing: -0.3 },
    dateText: { fontSize: 13, fontWeight: '600', marginTop: 2 },
    amountText: { fontSize: 20, fontWeight: '900', textAlign: 'right' },
    operatorSubText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', opacity: 0.7, marginTop: 2 },
    statsRow: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 16, alignItems: 'center' },
    statItem: { flex: 1, alignItems: 'center' },
    verticalDivider: { width: 1, height: 30, opacity: 0.5 },
    statLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 2 },
    viewDetailBtn: { paddingLeft: 10 },
    pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, paddingBottom: 20 }
});
