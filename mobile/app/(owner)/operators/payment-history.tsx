import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, Divider, Avatar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetPaymentHistoryQuery } from '@/redux/apis/ownerApi';

export default function OperatorPaymentHistoryScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const operatorId = Number(params.operatorId);
    const operatorName = params.operatorName as string;
    const { colors } = useAppTheme();

    const [page, setPage] = useState(1);
    const { data, isLoading, isFetching, refetch } = useGetPaymentHistoryQuery({ operatorId, page });

    const payments = data?.payments?.data || [];
    const lastPage = data?.payments?.last_page || 1;

    const onRefresh = async () => {
        await refetch();
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.paymentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: item.type === 'salary' ? colors.primary + '15' : colors.success + '15' }]}>
                    <Text style={{ color: item.type === 'salary' ? colors.primary : colors.success, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>
                        {item.type}
                    </Text>
                </View>
                <Text style={[styles.amountText, { color: colors.textMain }]}>₹{item.amount}</Text>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="calendar" size={16} color={colors.textMuted} />
                    <Text style={[styles.infoText, { color: colors.textMain }]}>
                        {new Date(item.payment_date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                </View>

                {item.description && (
                    <View style={[styles.infoRow, { marginTop: 8, alignItems: 'flex-start' }]}>
                        <MaterialCommunityIcons name="text-box-outline" size={16} color={colors.textMuted} style={{ marginTop: 2 }} />
                        <Text style={[styles.infoText, { color: colors.textMuted, flex: 1 }]} numberOfLines={2}>
                            {item.description}
                        </Text>
                    </View>
                )}
            </View>

            <Divider style={{ backgroundColor: colors.border, marginVertical: 12 }} />

            <View style={styles.cardFooter}>
                <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '700' }}>PAID BY</Text>
                <Text style={{ fontSize: 12, color: colors.textMain, fontWeight: '800' }}>{item.owner?.name}</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <View style={{ flex: 1, paddingLeft: 16 }}>
                    <Text style={[styles.headerTitle, { color: colors.textMain }]} numberOfLines={1}>Payment History</Text>
                    <Text style={[styles.subTitle, { color: colors.textMuted }]}>{operatorName}</Text>
                </View>
            </View>

            <FlatList
                data={payments}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isFetching && page === 1} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="cash-multiple" size={64} color={colors.textMuted} />
                            <Text style={{ color: colors.textMuted, marginTop: 16, fontSize: 16, fontWeight: '600' }}>No payments recorded</Text>
                            <Text style={{ color: colors.textMuted, marginTop: 4, textAlign: 'center' }}>Salary and bonus payments will appear here.</Text>
                        </View>
                    ) : (
                        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
                    )
                }
                ListFooterComponent={
                    lastPage > 1 ? (
                        <View style={styles.pagination}>
                            <TouchableOpacity
                                disabled={page === 1 || isFetching}
                                onPress={() => setPage(page - 1)}
                                style={[styles.pageBtn, (page === 1 || isFetching) && { opacity: 0.5 }]}
                            >
                                <MaterialCommunityIcons name="chevron-left" size={24} color={colors.textMain} />
                            </TouchableOpacity>
                            <Text style={[styles.pageText, { color: colors.textMain }]}>Page {page} of {lastPage}</Text>
                            <TouchableOpacity
                                disabled={page === lastPage || isFetching}
                                onPress={() => setPage(page + 1)}
                                style={[styles.pageBtn, (page === lastPage || isFetching) && { opacity: 0.5 }]}
                            >
                                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMain} />
                            </TouchableOpacity>
                        </View>
                    ) : <View style={{ height: 40 }} />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: '900' },
    subTitle: { fontSize: 13, fontWeight: '600' },
    listContent: { padding: 24 },
    paymentCard: { padding: 18, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    amountText: { fontSize: 22, fontWeight: '900' },
    cardBody: { marginBottom: 4 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoText: { fontSize: 14, fontWeight: '600' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    emptyState: { alignItems: 'center', justifyContent: 'center', padding: 60, opacity: 0.6, marginTop: 40 },
    pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingBottom: 40 },
    pageBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.02)' },
    pageText: { fontSize: 14, fontWeight: '700' }
});
