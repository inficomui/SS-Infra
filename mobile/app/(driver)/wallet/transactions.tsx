import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetWalletQuery } from '@/redux/apis/walletApi';
import { useAppTheme } from '@/hooks/use-theme-color';
import { formatDate } from '@/utils/formatters';

export default function WalletTransactionsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colors } = useAppTheme();
    const [page, setPage] = useState(1);
    const { data: walletData, isLoading, isFetching, refetch } = useGetWalletQuery({ page });

    const transactions = walletData?.transactions || [];

    const handleLoadMore = () => {
        if (walletData?.pagination && walletData.pagination.currentPage < walletData.pagination.totalPages) {
            setPage(prev => prev + 1);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: item.type === 'credit' ? colors.success + '20' : colors.danger + '20' }]}>
                <MaterialCommunityIcons 
                    name={item.type === 'credit' ? "arrow-down-left" : "arrow-up-right"} 
                    size={24} 
                    color={item.type === 'credit' ? colors.success : colors.danger} 
                />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.textMain }]}>{item.description || 'Transaction Detail'}</Text>
                <Text style={[styles.category, { color: colors.textMuted }]}>{item.category?.toUpperCase() || 'WALLET'}</Text>
                <Text style={[styles.time, { color: colors.textMuted }]}>{formatDate(item.createdAt)}</Text>
            </View>
            <Text style={[styles.amount, { color: item.type === 'credit' ? colors.success : colors.danger }]}>
                {item.type === 'credit' ? '+' : '-'} ₹{Number(item.amount).toLocaleString()}
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('wallet.transactions') || 'Transactions'}</Text>
                <View style={{ width: 44 }} />
            </View>

            {isLoading && page === 1 ? (
                <View style={styles.centered}><ActivityIndicator color={colors.primary} /></View>
            ) : (
                <FlatList
                    data={transactions}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 24 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="cash-multiple" size={64} color={colors.border} />
                            <Text style={{ color: colors.textMuted }}>{t('wallet.no_transactions')}</Text>
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
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    card: { flexDirection: 'row', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12, gap: 16, alignItems: 'center' },
    iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
    category: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5, marginBottom: 4 },
    time: { fontSize: 11, fontWeight: '700' },
    amount: { fontSize: 16, fontWeight: '900' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 100, gap: 16 }
});
