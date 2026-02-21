import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetWalletQuery } from '@/redux/apis/walletApi';
import { useFocusEffect } from 'expo-router';

export default function WalletScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colors } = useAppTheme();
    const [refreshing, setRefreshing] = useState(false);

    // Fetch wallet data
    const { data: walletData, isLoading, refetch } = useGetWalletQuery({ page: 1 });

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

    const balance = walletData?.wallet?.balance || '0';

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
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('wallet.title')}</Text>
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
                ) : (
                    <>
                        {/* Balance Card */}
                        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
                            <View style={styles.balanceHeader}>
                                <MaterialCommunityIcons name="wallet" size={32} color="#FFF" />
                                <Text style={styles.balanceLabel}>{t('wallet.available_balance')}</Text>
                            </View>
                            <Text style={styles.balanceAmount}>₹{parseFloat(balance).toFixed(2)}</Text>

                            {/* Withdraw Button */}
                            <TouchableOpacity
                                onPress={() => router.push('/(operator)/wallet/withdraw' as any)}
                                style={[styles.withdrawButton, { backgroundColor: '#FFF' }]}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="bank-transfer" size={20} color={colors.primary} />
                                <Text style={[styles.withdrawButtonText, { color: colors.primary }]}>{t('wallet.withdraw')}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Quick Actions */}
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity
                                onPress={() => router.push('/(operator)/wallet/salary-history' as any)}
                                style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.actionIconBox, { backgroundColor: colors.success + '15' }]}>
                                    <MaterialCommunityIcons name="cash-multiple" size={28} color={colors.success} />
                                </View>
                                <View style={styles.actionContent}>
                                    <Text style={[styles.actionTitle, { color: colors.textMain }]}>{t('payments.history_title')}</Text>
                                    <Text style={[styles.actionDescription, { color: colors.textMuted }]}>
                                        {t('wallet.view_salary_bonuses')}
                                    </Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => router.push('/(operator)/wallet/transactions' as any)}
                                style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.actionIconBox, { backgroundColor: colors.primary + '15' }]}>
                                    <MaterialCommunityIcons name="history" size={28} color={colors.primary} />
                                </View>
                                <View style={styles.actionContent}>
                                    <Text style={[styles.actionTitle, { color: colors.textMain }]}>{t('owner.history')}</Text>
                                    <Text style={[styles.actionDescription, { color: colors.textMuted }]}>
                                        {t('wallet.view_all_transactions')}
                                    </Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        {/* Info Cards */}
                        <View style={styles.infoSection}>
                            <View style={[styles.infoCard, { backgroundColor: colors.success + '10', borderColor: colors.success + '30' }]}>
                                <MaterialCommunityIcons name="information" size={20} color={colors.success} />
                                <Text style={[styles.infoText, { color: colors.success }]}>
                                    {t('wallet.wallet_info_msg')}
                                </Text>
                            </View>

                            <View style={[styles.infoCard, { backgroundColor: colors.warning + '10', borderColor: colors.warning + '30' }]}>
                                <MaterialCommunityIcons name="alert-circle" size={20} color={colors.warning} />
                                <Text style={[styles.infoText, { color: colors.warning }]}>
                                    {t('wallet.withdrawal_info_msg')}
                                </Text>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
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
    balanceCard: {
        borderRadius: 20,
        padding: 28,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6
    },
    balanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16
    },
    balanceLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFF',
        opacity: 0.9
    },
    balanceAmount: {
        fontSize: 42,
        fontWeight: '900',
        color: '#FFF',
        marginBottom: 20,
        letterSpacing: -1
    },
    withdrawButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    withdrawButtonText: {
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.3
    },
    actionsContainer: {
        gap: 12,
        marginBottom: 24
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2
    },
    actionIconBox: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14
    },
    actionContent: { flex: 1 },
    actionTitle: {
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 3
    },
    actionDescription: {
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 16
    },
    infoSection: {
        gap: 12
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 17
    }
});
