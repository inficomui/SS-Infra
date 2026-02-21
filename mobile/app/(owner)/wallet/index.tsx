import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetWalletQuery } from '@/redux/apis/walletApi';
import { formatDate } from '../../../utils/formatters';
import { useTranslation } from 'react-i18next';

export default function WalletScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const { data, isLoading, isFetching, refetch } = useGetWalletQuery({ page });
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const wallet = data?.wallet;
    const transactions = data?.transactions || [];
    const pagination = data?.pagination;
    const totalPages = pagination?.totalPages || 1;

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
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('owner.wallet.title')}</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(owner)/wallet/history' as any)}
                    style={[styles.historyButton, { backgroundColor: colors.primary + '15' }]}
                >
                    <MaterialCommunityIcons name="history" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                {/* Balance Card */}
                <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
                    <View>
                        <Text style={styles.balanceLabel}>{t('owner.wallet.available_balance')}</Text>
                        <Text style={styles.balanceValue}>
                            {wallet?.currency || '₹'} {wallet?.balance || '0.00'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.withdrawButton}
                        onPress={() => router.push('/(owner)/wallet/withdraw' as any)}
                    >
                        <Text style={styles.withdrawText}>{t('owner.wallet.withdraw')}</Text>
                        <MaterialCommunityIcons name="arrow-right" size={16} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Transactions Section */}
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('owner.wallet.recent_transactions')}</Text>

                {isLoading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
                ) : transactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="wallet-giftcard" size={64} color={colors.textMuted} />
                        <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 16, fontWeight: '600' }}>{t('owner.wallet.no_transactions')}</Text>
                        <Text style={{ color: colors.textMuted, marginTop: 4, textAlign: 'center' }}>{t('owner.wallet.no_transactions_sub')}</Text>
                    </View>
                ) : (
                    <>
                        <View style={{ gap: 12 }}>
                            {transactions.map((tx) => (
                                <View key={tx.id} style={[styles.txCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <View style={[styles.iconBox, { backgroundColor: tx.type === 'credit' ? colors.success + '15' : colors.danger + '15' }]}>
                                        <MaterialCommunityIcons
                                            name={tx.type === 'credit' ? 'arrow-down-left' : 'arrow-up-right'}
                                            size={20}
                                            color={tx.type === 'credit' ? colors.success : colors.danger}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={[styles.txRef, { color: colors.textMain }]}>{tx.category}</Text>
                                            <Text style={[
                                                styles.txAmount,
                                                { color: tx.type === 'credit' ? colors.success : colors.danger }
                                            ]}>
                                                {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                                            </Text>
                                        </View>
                                        <Text style={[styles.txDate, { color: colors.textMuted }]}>
                                            {formatDate(tx.createdAt)}
                                        </Text>
                                        <Text style={[styles.txDesc, { color: colors.textMuted }]} numberOfLines={2}>{tx.description}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {totalPages > 1 && (
                            <View style={styles.pagination}>
                                <TouchableOpacity
                                    disabled={page === 1 || isFetching}
                                    onPress={() => setPage(page - 1)}
                                    style={[styles.pageBtn, (page === 1 || isFetching) && { opacity: 0.5 }]}
                                >
                                    <MaterialCommunityIcons name="chevron-left" size={24} color={colors.textMain} />
                                </TouchableOpacity>
                                <Text style={[styles.pageText, { color: colors.textMain }]}>{t('common.page')} {page} {t('common.of')} {totalPages}</Text>
                                <TouchableOpacity
                                    disabled={page === totalPages || isFetching}
                                    onPress={() => setPage(page + 1)}
                                    style={[styles.pageBtn, (page === totalPages || isFetching) && { opacity: 0.5 }]}
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

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    historyButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollContent: { padding: 24 },
    balanceCard: { borderRadius: 12, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    balanceValue: { color: '#FFF', fontSize: 28, fontWeight: '900' },
    withdrawButton: { backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, gap: 4 },
    withdrawText: { fontWeight: '700', fontSize: 13 },
    sectionTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, marginTop: 8 },
    emptyState: { alignItems: 'center', justifyContent: 'center', padding: 60, opacity: 0.6 },
    txCard: { flexDirection: 'row', padding: 18, borderRadius: 16, borderWidth: 1, alignItems: 'flex-start', gap: 14 },
    iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    txRef: { fontSize: 15, fontWeight: '800', textTransform: 'capitalize' },
    txDate: { fontSize: 11, fontWeight: '600', marginVertical: 4 },
    txDesc: { fontSize: 12, lineHeight: 18 },
    txAmount: { fontSize: 17, fontWeight: '900' },
    pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingBottom: 20 },
    pageBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.02)' },
    pageText: { fontSize: 14, fontWeight: '700' }
});
