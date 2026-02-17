import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform, FlatList, Image } from 'react-native';
import { Text, ActivityIndicator, Searchbar, IconButton, Menu } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetMaintenanceRecordsQuery } from '@/redux/apis/maintenanceApi';
import DateTimePicker from '@react-native-community/datetimepicker';
import { resolveImageUrl } from '../../../utils/imageHelpers';
import { formatDate } from '../../../utils/formatters';

export default function MaintenanceRecordsScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();

    // Filters & Pagination
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const [showSortMenu, setShowSortMenu] = useState(false);

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

        list.sort((a, b) => {
            const dateA = new Date(a.service_date).getTime();
            const dateB = new Date(b.service_date).getTime();
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

    const renderItem = ({ item: record }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push({ pathname: '/(owner)/maintenance/[id]', params: { id: record.id, data: JSON.stringify(record) } })}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <View style={[styles.iconBox, { backgroundColor: colors.primary + '15', overflow: 'hidden' }]}>
                        {record.service_image_url ? (
                            <Image source={{ uri: resolveImageUrl(record.service_image_url) }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        ) : (
                            <MaterialCommunityIcons name="tools" size={20} color={colors.primary} />
                        )}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.machineName, { color: colors.textMain }]} numberOfLines={1}>{record.machine?.name || 'Machine #' + record.machine_id}</Text>
                        <Text style={[styles.subText, { color: colors.textMuted }]}>{formatDate(record.service_date)}</Text>
                    </View>
                </View>
                <Text style={[styles.amountText, { color: colors.textMain }]}>₹{record.cost}</Text>
            </View>

            <View style={[styles.statsRow, { borderColor: colors.border }]}>
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>Service Type</Text>
                    <Text style={[styles.statValue, { color: colors.textMain }]}>{record.service_type}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>Documents</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        {record.service_image_url ? (
                            <MaterialCommunityIcons name="camera" size={18} color={colors.success} />
                        ) : (
                            <MaterialCommunityIcons name="camera-off" size={18} color={colors.textMuted} />
                        )}
                        {record.invoice_image_url ? (
                            <MaterialCommunityIcons name="file-document" size={18} color={colors.success} />
                        ) : (
                            <MaterialCommunityIcons name="file-document-outline" size={18} color={colors.textMuted} />
                        )}
                    </View>
                </View>
            </View>

            {record.description && (
                <View style={[styles.descriptionBox, { backgroundColor: colors.background + '50' }]}>
                    <Text style={[styles.descriptionText, { color: colors.textMuted }]} numberOfLines={2}>{record.description}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Fleet Maintenance</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(owner)/maintenance/add' as any)}
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                >
                    <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Search Machine or Service..."
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
                        <MaterialCommunityIcons name="calendar-range" size={16} color={colors.primary} />
                        <Text style={[styles.filterText, { color: colors.textMain }]}>From: {formatDate(startDate)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setShowEndPicker(true)} style={[styles.filterChip, { borderColor: colors.border, backgroundColor: colors.card }]}>
                        <MaterialCommunityIcons name="calendar-check" size={16} color={colors.primary} />
                        <Text style={[styles.filterText, { color: colors.textMain }]}>To: {formatDate(endDate)}</Text>
                    </TouchableOpacity>

                    <Menu
                        visible={showSortMenu}
                        onDismiss={() => setShowSortMenu(false)}
                        anchor={
                            <TouchableOpacity
                                onPress={() => setShowSortMenu(true)}
                                style={[styles.filterChip, { borderColor: colors.border, backgroundColor: colors.card }]}
                            >
                                <MaterialCommunityIcons name="sort" size={16} color={colors.primary} />
                                <Text style={[styles.filterText, { color: colors.textMain }]}>Sort</Text>
                            </TouchableOpacity>
                        }
                    >
                        <Menu.Item onPress={() => { setSortBy('newest'); setShowSortMenu(false); }} title="Newest" />
                        <Menu.Item onPress={() => { setSortBy('oldest'); setShowSortMenu(false); }} title="Oldest" />
                    </Menu>
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
                            <MaterialCommunityIcons name="toolbox-outline" size={64} color={colors.textMuted} />
                            <Text style={{ color: colors.textMuted, marginTop: 16 }}>No maintenance records found.</Text>
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
                            <Text style={{ color: colors.textMain }}>{page} / {totalPages}</Text>
                            <IconButton icon="chevron-right" disabled={page === totalPages} onPress={() => setPage(page + 1)} />
                        </View>
                    ) : <View style={{ height: 20 }} />
                }
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
    card: { padding: 18, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
    iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    machineName: { fontSize: 16, fontWeight: '800' },
    subText: { fontSize: 12, marginTop: 2 },
    amountText: { fontSize: 20, fontWeight: '900' },
    statsRow: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 14 },
    statItem: { flex: 1, alignItems: 'center' },
    divider: { width: 1, height: '80%' },
    statLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
    statValue: { fontSize: 15, fontWeight: '800' },
    descriptionBox: { marginTop: 14, padding: 10, borderRadius: 8 },
    descriptionText: { fontSize: 12, lineHeight: 18 },
    pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }
});
