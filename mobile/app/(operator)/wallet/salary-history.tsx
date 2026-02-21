import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, FlatList, Platform } from 'react-native';
import { Text, ActivityIndicator, IconButton, Divider, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetMyPaymentsQuery } from '@/redux/apis/walletApi';
import { useFocusEffect } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

// Helper function to format date as YYYY-MM-DD in local timezone
const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function SalaryHistoryScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const { t } = useTranslation();

    // State
    const [page, setPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState<'all' | 'salary' | 'bonus'>('all');

    // Default to current month (first day to today)
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [endDate, setEndDate] = useState(new Date());

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Format dates as local date strings (YYYY-MM-DD)
    const formattedStartDate = formatLocalDate(startDate);
    const formattedEndDate = formatLocalDate(endDate);

    // API Query
    const { data: paymentsData, isLoading, isFetching, refetch } = useGetMyPaymentsQuery({
        page,
        startDate: formattedStartDate,
        endDate: formattedEndDate
    });

    // Auto-refresh on focus for "immediate" updates
    useFocusEffect(
        React.useCallback(() => {
            refetch();
        }, [refetch])
    );

    const rawPayments = useMemo(() => {
        // Try multiple common property names for the payment list
        const source = paymentsData?.payments || paymentsData?.data || paymentsData?.report?.payments;
        if (!source) return [];

        // Handle both direct array and paginated object structure
        if (Array.isArray(source)) return source;
        if (Array.isArray(source.data)) return source.data;

        return [];
    }, [paymentsData]);

    const totalPages = paymentsData?.payments?.last_page ||
        paymentsData?.data?.last_page ||
        paymentsData?.pagination?.totalPages || 1;

    // Local Filtering & Grouping
    const sectionedPayments = useMemo(() => {
        const todayStr = new Date().toDateString();
        const filtered = activeFilter === 'all'
            ? rawPayments
            : rawPayments.filter((p: any) => p.type.toLowerCase() === activeFilter);

        const sections = {
            today: [] as any[],
            earlier: [] as any[],
            todayTotal: 0
        };

        filtered.forEach((p: any) => {
            const pDate = new Date(p.payment_date || p.paymentDate || p.createdAt).toDateString();
            if (pDate === todayStr) {
                sections.today.push(p);
                sections.todayTotal += Number(p.amount);
            } else {
                sections.earlier.push(p);
            }
        });

        return sections;
    }, [rawPayments, activeFilter]);

    const onStartDateChange = (event: any, date?: Date) => {
        setShowStartPicker(false);
        if (date) {
            setStartDate(date);
            setPage(1);
        }
    };

    const onEndDateChange = (event: any, date?: Date) => {
        setShowEndPicker(false);
        if (date) {
            setEndDate(date);
            setPage(1);
        }
    };

    const renderPaymentItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: item.type === 'bonus' ? colors.warning + '15' : colors.success + '15' }]}>
                    <MaterialCommunityIcons
                        name={item.type === 'bonus' ? 'star-circle' : 'cash-check'}
                        size={24}
                        color={item.type === 'bonus' ? colors.warning : colors.success}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.amount, { color: colors.textMain }]}>₹{item.amount}</Text>
                    <Text style={[styles.date, { color: colors.textMuted }]}>
                        {new Date(item.payment_date || item.paymentDate || item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: item.type === 'bonus' ? colors.warning + '20' : colors.success + '20' }]}>
                    <Text style={[styles.typeText, { color: item.type === 'bonus' ? colors.warning : colors.success }]}>
                        {item.type.toUpperCase()}
                    </Text>
                </View>
            </View>

            {item.description && (
                <>
                    <Divider style={{ marginVertical: 12, backgroundColor: colors.border, opacity: 0.5 }} />
                    <View style={styles.descRow}>
                        <MaterialCommunityIcons name="information-outline" size={14} color={colors.textMuted} />
                        <Text style={[styles.description, { color: colors.textMuted }]}>{item.description}</Text>
                    </View>
                </>
            )}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('payments.total_earnings')}</Text>
                <View style={styles.rangeContainer}>
                    <TouchableOpacity
                        onPress={() => setShowStartPicker(true)}
                        style={[styles.dateSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                        <MaterialCommunityIcons name="calendar-import" size={16} color={colors.primary} />
                        <Text style={[styles.dateText, { color: colors.textMain }]}>
                            {startDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </Text>
                    </TouchableOpacity>
                    <MaterialCommunityIcons name="arrow-right" size={14} color={colors.textMuted} />
                    <TouchableOpacity
                        onPress={() => setShowEndPicker(true)}
                        style={[styles.dateSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                        <MaterialCommunityIcons name="calendar-export" size={16} color={colors.primary} />
                        <Text style={[styles.dateText, { color: colors.textMain }]}>
                            {endDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Today's Summary */}
            {sectionedPayments.todayTotal > 0 && (
                <View style={[styles.todaySummary, { backgroundColor: colors.success + '10', borderColor: colors.success + '30' }]}>
                    <MaterialCommunityIcons name="cash-multiple" size={20} color={colors.success} />
                    <Text style={[styles.todaySummaryText, { color: colors.success }]}>
                        {t('payments.today_total', { amount: sectionedPayments.todayTotal })}
                    </Text>
                </View>
            )}

            {/* Filters */}
            <View style={styles.filterSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    <Chip
                        selected={activeFilter === 'all'}
                        onPress={() => setActiveFilter('all')}
                        style={[styles.filterChip, activeFilter === 'all' && { backgroundColor: colors.primary }]}
                        textStyle={[styles.filterChipText, activeFilter === 'all' && { color: '#000' }]}
                    >
                        {t('payments.all_transactions')}
                    </Chip>
                    <Chip
                        selected={activeFilter === 'salary'}
                        onPress={() => setActiveFilter('salary')}
                        style={[styles.filterChip, activeFilter === 'salary' && { backgroundColor: colors.primary }]}
                        textStyle={[styles.filterChipText, activeFilter === 'salary' && { color: '#000' }]}
                    >
                        {t('payments.monthly_salary')}
                    </Chip>
                    <Chip
                        selected={activeFilter === 'bonus'}
                        onPress={() => setActiveFilter('bonus')}
                        style={[styles.filterChip, activeFilter === 'bonus' && { backgroundColor: colors.primary }]}
                        textStyle={[styles.filterChipText, activeFilter === 'bonus' && { color: '#000' }]}
                    >
                        {t('payments.bonus_credits')}
                    </Chip>
                </ScrollView>
            </View>

            <FlatList
                data={[
                    ...(sectionedPayments.today.length > 0 ? [{ type: 'header', title: t('payments.today'), isToday: true }] : []),
                    ...sectionedPayments.today.map(p => ({ ...p, type: 'item' })),
                    ...(sectionedPayments.earlier.length > 0 ? [{ type: 'header', title: t('payments.previous'), isToday: false }] : []),
                    ...sectionedPayments.earlier.map(p => ({ ...p, type: 'item' }))
                ]}
                renderItem={({ item }: any) => {
                    if (item.type === 'header') {
                        return (
                            <Text style={[styles.sectionHeader, { color: item.isToday ? colors.primary : colors.textMuted }]}>
                                {item.title}
                            </Text>
                        );
                    }
                    return renderPaymentItem({ item });
                }}
                keyExtractor={(item, index) => item.id?.toString() || `header-${index}`}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIconCircle, { backgroundColor: colors.card }]}>
                                <MaterialCommunityIcons name="cash-multiple" size={48} color={colors.border} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.textMain }]}>{t('common.no_records_found') || t('payments.no_payments')}</Text>
                            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
                                {t('payments.no_payments')}
                            </Text>
                        </View>
                    ) : null
                }
                ListHeaderComponent={
                    isLoading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator color={colors.primary} size="small" />
                            <Text style={[styles.loaderText, { color: colors.textMuted }]}>{t('common.loading')}</Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={
                    totalPages > 1 ? (
                        <View style={styles.pagination}>
                            <IconButton
                                icon="chevron-left"
                                disabled={page === 1}
                                onPress={() => setPage(p => p - 1)}
                            />
                            <View style={[styles.pageIndicator, { backgroundColor: colors.card }]}>
                                <Text style={{ color: colors.textMain, fontWeight: '800' }}>{t('fuel_management.page')} {page}</Text>
                                <Text style={{ color: colors.textMuted }}> {t('fuel_management.of')} {totalPages}</Text>
                            </View>
                            <IconButton
                                icon="chevron-right"
                                disabled={page === totalPages}
                                onPress={() => setPage(p => p + 1)}
                            />
                        </View>
                    ) : <View style={{ height: 40 }} />
                }
            />

            {showStartPicker && (
                <DateTimePicker
                    value={startDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onStartDateChange}
                    maximumDate={endDate}
                />
            )}

            {showEndPicker && (
                <DateTimePicker
                    value={endDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onEndDateChange}
                    minimumDate={startDate}
                    maximumDate={new Date()}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backButton: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    rangeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dateSelector: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
    dateText: { fontSize: 12, fontWeight: '700' },
    filterSection: { marginBottom: 15 },
    filterScroll: { paddingHorizontal: 24, gap: 10 },
    filterChip: { borderRadius: 12, height: 40, borderWidth: 0 },
    filterChipText: { fontSize: 12, fontWeight: '700' },
    listContent: { paddingHorizontal: 24, paddingBottom: 40 },
    card: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconContainer: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    amount: { fontSize: 20, fontWeight: '900' },
    date: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    typeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    typeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
    descRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    description: { fontSize: 13, fontWeight: '500', flex: 1 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyIconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 18, fontWeight: '900', marginBottom: 8 },
    emptySub: { fontSize: 14, fontWeight: '600', textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
    loaderContainer: { paddingVertical: 30, alignItems: 'center', gap: 10 },
    loaderText: { fontSize: 12, fontWeight: '700' },
    pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20, gap: 10 },
    pageIndicator: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    todaySummary: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginHorizontal: 24, marginBottom: 20 },
    todaySummaryText: { fontSize: 14, fontWeight: '800' },
    sectionHeader: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginTop: 10, marginBottom: 15 },
});
