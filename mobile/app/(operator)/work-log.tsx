
import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetWorkHistoryQuery } from '@/redux/apis/workApi';
import { useAppTheme } from '@/hooks/use-theme-color';
import { formatDate, formatDuration } from '../../utils/formatters';

export default function WorkLogScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const [page, setPage] = useState(1);
    const { data, isLoading, isFetching, refetch } = useGetWorkHistoryQuery({ page, limit: 20 });

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
                    pathname: '/(operator)/work-details',
                    params: { id: item.id }
                });
            }}
        >
            <View style={styles.cardHeader}>
                <View>
                    <Text style={[styles.clientName, { color: colors.textMain }]}>{item.clientName}</Text>
                    <Text style={[styles.date, { color: colors.textMuted }]}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.status === 'completed' ? colors.success + '20' : colors.primary + '20' }
                ]}>
                    <Text style={[
                        styles.statusText,
                        { color: item.status === 'completed' ? colors.success : colors.primary }
                    ]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textMuted} />
                    <Text style={[styles.detailText, { color: colors.textMain }]}>
                        {item.totalHours ? formatDuration(item.totalHours) : 'In Progress'}
                    </Text>
                </View>
                <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.textMuted} />
                    <Text style={[styles.detailText, { color: colors.textMain }]} numberOfLines={1}>
                        {item.clientDistrict || 'Site Location'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Work Logs</Text>
                <View style={{ width: 44 }} />
            </View>

            {isLoading && page === 1 ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={data?.workSessions || []}
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
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No work logs found.</Text>
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
    backBtn: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    listContent: { padding: 24, paddingBottom: 40 },
    card: { borderRadius: 4, padding: 16, marginBottom: 16, borderWidth: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    clientName: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
    date: { fontSize: 12, fontWeight: '600' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    statusText: { fontSize: 10, fontWeight: '900' },
    divider: { height: 1, marginVertical: 12 },
    detailsRow: { flexDirection: 'row', gap: 24 },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    detailText: { fontSize: 13, fontWeight: '600', maxWidth: 120 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 100, gap: 16 },
    emptyText: { fontSize: 16, fontWeight: '700' }
});
