
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetWalletQuery } from '@/redux/apis/walletApi';
import { useAppTheme } from '@/hooks/use-theme-color';

export default function DriverWalletDashboard() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colors, isDark } = useAppTheme();
    const { data: walletData, isLoading, refetch } = useGetWalletQuery();

    const balance = walletData?.wallet?.balance || 0;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('driver.wallet') || 'My Wallet'}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.balanceCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={styles.balanceLabel}>{t('wallet.available_balance')}</Text>
                    <Text style={styles.balanceValue}>₹{balance.toLocaleString()}</Text>
                    <TouchableOpacity style={styles.withdrawBtn} onPress={() => router.push('/(driver)/wallet/withdraw' as any)}>
                        <Text style={styles.withdrawText}>{t('wallet.withdraw')}</Text>
                        <MaterialCommunityIcons name="arrow-right" size={18} color="#000" />
                    </TouchableOpacity>
                </LinearGradient>

                <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.textMuted }]}>{t('wallet.wallet_info_msg')}</Text>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('wallet.recent_transactions')}</Text>
                    <TouchableOpacity onPress={() => router.push('/(driver)/wallet/transactions' as any)}>
                        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{t('overview.view_all')}</Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? <ActivityIndicator color={colors.primary} /> : (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="cash-multiple" size={64} color={colors.border} />
                        <Text style={{ color: colors.textMuted }}>{t('wallet.no_transactions')}</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollContent: { padding: 24 },
    balanceCard: { padding: 30, borderRadius: 20, marginBottom: 24, elevation: 10 },
    balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase' },
    balanceValue: { color: '#FFF', fontSize: 42, fontWeight: '900', marginVertical: 12 },
    withdrawBtn: { backgroundColor: '#FFF', alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
    withdrawText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
    infoRow: { flexDirection: 'row', padding: 16, borderRadius: 12, borderWidth: 1, gap: 12, alignItems: 'center', marginBottom: 30 },
    infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '900' },
    emptyState: { alignItems: 'center', marginTop: 40, gap: 16 }
});
