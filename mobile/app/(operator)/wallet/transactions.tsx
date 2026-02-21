import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetWalletQuery } from '@/redux/apis/walletApi';
import { useFocusEffect } from 'expo-router';

export default function TransactionsScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);

    const { data: walletData, isLoading, isFetching, refetch } = useGetWalletQuery({ page });

    // Auto-refresh on focus
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

    const transactions = walletData?.transactions || [];
    const totalPages = walletData?.pagination?.totalPages || 1;

    // Group transactions by date
    const groupedTransactions = transactions.reduce((acc: any, tx: any) => {
        const date = new Date(tx.createdAt).toLocaleDateString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(tx);
        return acc;
    }, {});

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('owner.history')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                {isLoading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                ) : transactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="history" size={64} color={colors.textMuted} />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('wallet.no_transactions')}</Text>
                        <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                            {t('wallet.no_transactions_sub')}
                        </Text>
                    </View>
                ) : (
                    <>
                        {Object.entries(groupedTransactions).map(([date, txs]: [string, any]) => (
                            <View key={date} style={styles.dateGroup}>
                                <Text style={[styles.dateHeader, { color: colors.textMuted }]}>{date}</Text>
                                <View style={styles.transactionsList}>
                                    {txs.map((tx: any) => (
                                        <TransactionItem key={tx.id} transaction={tx} colors={colors} />
                                    ))}
                                </View>
                            </View>
                        ))}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <View style={styles.pagination}>
                                <TouchableOpacity
                                    disabled={page === 1 || isFetching}
                                    onPress={() => setPage(page - 1)}
                                    style={[
                                        styles.pageButton,
                                        { backgroundColor: colors.card, borderColor: colors.border },
                                        (page === 1 || isFetching) && { opacity: 0.5 }
                                    ]}
                                >
                                    <MaterialCommunityIcons name="chevron-left" size={24} color={colors.textMain} />
                                </TouchableOpacity>
                                <Text style={[styles.pageText, { color: colors.textMain }]}>
                                    {t('fuel_management.page')} {page} {t('fuel_management.of')} {totalPages}
                                </Text>
                                <TouchableOpacity
                                    disabled={page === totalPages || isFetching}
                                    onPress={() => setPage(page + 1)}
                                    style={[
                                        styles.pageButton,
                                        { backgroundColor: colors.card, borderColor: colors.border },
                                        (page === totalPages || isFetching) && { opacity: 0.5 }
                                    ]}
                                >
                                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMain} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

function TransactionItem({ transaction, colors }: any) {
    const isCredit = transaction.type === 'credit';
    const icon = isCredit ? 'arrow-down-circle' : 'arrow-up-circle';
    const iconColor = isCredit ? colors.success : colors.danger;
    const amountColor = isCredit ? colors.success : colors.danger;
    const amountPrefix = isCredit ? '+' : '-';

    return (
        <View style={[styles.transactionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.transactionIcon, { backgroundColor: iconColor + '15' }]}>
                <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
            </View>
            <View style={styles.transactionContent}>
                <Text style={[styles.transactionCategory, { color: colors.textMain }]}>
                    {transaction.category}
                </Text>
                <Text style={[styles.transactionDescription, { color: colors.textMuted }]} numberOfLines={1}>
                    {transaction.description}
                </Text>
                <Text style={[styles.transactionTime, { color: colors.textMuted }]}>
                    {new Date(transaction.createdAt).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>
            </View>
            <Text style={[styles.transactionAmount, { color: amountColor }]}>
                {amountPrefix}₹{transaction.amount}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1
    },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollContent: { padding: 24 },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16
    },
    emptySubtext: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'center'
    },
    dateGroup: {
        marginBottom: 24
    },
    dateHeader: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12
    },
    transactionsList: {
        gap: 10
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1
    },
    transactionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    transactionContent: {
        flex: 1
    },
    transactionCategory: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 2
    },
    transactionDescription: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2
    },
    transactionTime: {
        fontSize: 11,
        fontWeight: '600'
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: -0.5
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        marginTop: 24,
        paddingBottom: 20
    },
    pageButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1
    },
    pageText: {
        fontSize: 14,
        fontWeight: '700'
    }
});
