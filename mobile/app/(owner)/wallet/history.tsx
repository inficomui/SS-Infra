import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetWithdrawalsQuery } from '@/redux/apis/walletApi';
import { formatDate } from '../../../utils/formatters';

export default function WithdrawalHistoryScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const [page, setPage] = React.useState(1);
    const { data, isLoading, isFetching } = useGetWithdrawalsQuery({ page });

    const withdrawals = data?.withdrawals || [];
    const pagination = data?.pagination;
    const totalPages = pagination?.totalPages || 1;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return colors.success;
            case 'rejected': return colors.danger;
            default: return colors.warning;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Withdrawal History</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {isLoading ? (
                    <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
                ) : withdrawals.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="cash-clock" size={64} color={colors.textMuted} />
                        <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 16, fontWeight: '600' }}>No withdrawals yet</Text>
                        <Text style={{ color: colors.textMuted, marginTop: 4, textAlign: 'center' }}>Your payout requests will appear here once you initiate them.</Text>
                    </View>
                ) : (
                    <>
                        <View style={{ gap: 16 }}>
                            {withdrawals.map((w) => (
                                <View key={w.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <View style={styles.row}>
                                        <View>
                                            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 1 }}>REQUEST ID: #{w.id}</Text>
                                            <Text style={{ fontSize: 24, fontWeight: '900', color: colors.textMain, marginTop: 6 }}>
                                                ₹{w.amount}
                                            </Text>
                                        </View>
                                        <View style={[styles.badge, { backgroundColor: getStatusColor(w.status) + '15', borderColor: getStatusColor(w.status) + '30', borderWidth: 1 }]}>
                                            <Text style={[styles.badgeText, { color: getStatusColor(w.status) }]}>
                                                {w.status.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={[styles.infoBar, { backgroundColor: colors.background + '80' }]}>
                                        <MaterialCommunityIcons name="calendar-month" size={16} color={colors.textMuted} />
                                        <Text style={{ fontSize: 13, color: colors.textMain, fontWeight: '600' }}>
                                            {formatDate(w.createdAt)}
                                        </Text>
                                    </View>

                                    {w.adminNote && (
                                        <View style={[styles.noteBox, { borderLeftColor: colors.primary }]}>
                                            <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '700', marginBottom: 4 }}>ADMIN REMARK:</Text>
                                            <Text style={{ fontSize: 13, color: colors.textMain, lineHeight: 18 }}>
                                                &quot;{w.adminNote}&quot;
                                            </Text>
                                        </View>
                                    )}
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
                                <Text style={[styles.pageText, { color: colors.textMain }]}>Page {page} of {totalPages}</Text>
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
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollContent: { padding: 24, paddingBottom: 60 },
    emptyState: { alignItems: 'center', justifyContent: 'center', padding: 60, opacity: 0.6 },
    card: { padding: 20, borderRadius: 16, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    badgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
    infoBar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, marginTop: 16 },
    noteBox: { marginTop: 16, paddingLeft: 12, borderLeftWidth: 3 },
    pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 },
    pageBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.02)' },
    pageText: { fontSize: 14, fontWeight: '700' }
});
