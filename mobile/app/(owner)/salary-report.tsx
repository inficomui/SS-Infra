import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform, Modal, TextInput as RNTextInput } from 'react-native';
import { Text, ActivityIndicator, Divider, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetSalaryReportQuery, useGetOperatorsQuery } from '@/redux/apis/ownerApi';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SalaryReportScreen() {
    const router = useRouter();
    const { colors, isDark } = useAppTheme();
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedOperator, setSelectedOperator] = useState<number | undefined>(undefined);
    const [selectedOperatorName, setSelectedOperatorName] = useState<string>('All Operators');

    // UI state for date pickers
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Operator Selection Modal State
    const [isOperatorModalVisible, setIsOperatorModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [recentOperators, setRecentOperators] = useState<{ id: number, name: string }[]>([]);

    // Format dates for API (YYYY-MM-DD)
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // Queries
    const { data: reportData, isLoading, isFetching, refetch } = useGetSalaryReportQuery({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        operatorId: selectedOperator
    });

    const { data: operatorsData } = useGetOperatorsQuery();

    // Filtered Operators
    const filteredOperators = useMemo(() => {
        if (!operatorsData?.operators) return [];
        return operatorsData.operators.filter(op =>
            op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            op.mobile.includes(searchQuery)
        );
    }, [operatorsData, searchQuery]);

    const onStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(false);
        if (selectedDate) setStartDate(selectedDate);
    };

    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(false);
        if (selectedDate) setEndDate(selectedDate);
    };

    const handleSelectOperator = (id: number | undefined, name: string) => {
        setSelectedOperator(id);
        setSelectedOperatorName(name);
        setIsOperatorModalVisible(false);

        if (id) {
            // Add to recent
            const newRecent = { id, name };
            setRecentOperators(prev => {
                const filtered = prev.filter(p => p.id !== id);
                return [newRecent, ...filtered].slice(0, 5); // Keep last 5
            });
        }
    };

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
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Salary Report</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />
                }
            >
                {/* Filters Section */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Report Filters</Text>

                    {/* Date Range Selectors */}
                    <View style={styles.dateRow}>
                        <TouchableOpacity style={styles.dateInput} onPress={() => setShowStartPicker(true)}>
                            <Text style={[styles.label, { color: colors.textMuted }]}>Start Date</Text>
                            <View style={[styles.dateBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
                                <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
                                <Text style={{ color: colors.textMain, fontWeight: '600' }}>{formatDate(startDate)}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndPicker(true)}>
                            <Text style={[styles.label, { color: colors.textMuted }]}>End Date</Text>
                            <View style={[styles.dateBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
                                <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
                                <Text style={{ color: colors.textMain, fontWeight: '600' }}>{formatDate(endDate)}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Operator Selector Box */}
                    <View style={styles.operatorContainer}>
                        <Text style={[styles.label, { color: colors.textMuted }]}>Select Operator</Text>
                        <TouchableOpacity
                            style={[
                                styles.selectBox,
                                { borderColor: colors.border, backgroundColor: colors.background }
                            ]}
                            onPress={() => setIsOperatorModalVisible(true)}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={[styles.avatarSmall, { backgroundColor: selectedOperator ? colors.primary : colors.textMuted }]}>
                                    <MaterialCommunityIcons name="account" size={16} color="#FFF" />
                                </View>
                                <Text style={{ color: colors.textMain, fontSize: 16, fontWeight: '500' }}>
                                    {selectedOperatorName}
                                </Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-down" size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {/* Recent Chips */}
                    {recentOperators.length > 0 && (
                        <View style={{ marginTop: 12 }}>
                            <Text style={[styles.label, { color: colors.textMuted, fontSize: 10, marginBottom: 6 }]}>RECENTLY SELECTED</Text>
                            <View style={styles.chipRow}>
                                {recentOperators.map(op => (
                                    <TouchableOpacity
                                        key={op.id}
                                        style={[
                                            styles.recentChip,
                                            {
                                                backgroundColor: selectedOperator === op.id ? colors.primary + '15' : colors.background,
                                                borderColor: selectedOperator === op.id ? colors.primary : colors.border
                                            }
                                        ]}
                                        onPress={() => {
                                            setSelectedOperator(op.id);
                                            setSelectedOperatorName(op.name);
                                        }}
                                    >
                                        <Text style={{
                                            color: selectedOperator === op.id ? colors.primary : colors.textMuted,
                                            fontSize: 12,
                                            fontWeight: '600'
                                        }}>
                                            {op.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Summary Card */}
                {isLoading ? (
                    <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} size="large" />
                ) : (
                    <>
                        <View style={[styles.summaryCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
                            <View>
                                <Text style={{ color: colors.textMuted, fontSize: 13, textTransform: 'uppercase', fontWeight: '700' }}>Total Payout</Text>
                                <Text style={{ color: colors.primary, fontSize: 36, fontWeight: '900', marginTop: 4 }}>
                                    ₹{reportData?.report?.totalAmount || '0.00'}
                                </Text>
                                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
                                    {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                                <MaterialCommunityIcons name="finance" size={32} color="#FFF" />
                            </View>
                        </View>

                        {/* Payments List */}
                        <Text style={[styles.sectionHeader, { color: colors.textMain }]}>
                            Payment History <Text style={{ fontSize: 14, fontWeight: 'normal', color: colors.textMuted }}>({reportData?.report?.payments?.data?.length || 0})</Text>
                        </Text>

                        {reportData?.report?.payments?.data?.length === 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="file-document-outline" size={48} color={colors.textMuted} />
                                <Text style={{ color: colors.textMuted, marginTop: 12 }}>No payments found in this range.</Text>
                            </View>
                        ) : (
                            <View style={{ gap: 12 }}>
                                {reportData?.report?.payments?.data.map((payment) => (
                                    <View key={payment.id} style={[styles.paymentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <View style={styles.paymentHeader}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                <View style={[styles.listIcon, { backgroundColor: colors.primary + '15' }]}>
                                                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>
                                                        {payment.operator?.name?.charAt(0) || '?'}
                                                    </Text>
                                                </View>
                                                <View>
                                                    <Text style={{ color: colors.textMain, fontWeight: '700', fontSize: 16 }}>{payment.operator?.name || 'Unknown Operator'}</Text>
                                                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>{payment.payment_date}</Text>
                                                </View>
                                            </View>
                                            <Text style={{ color: colors.success, fontWeight: '800', fontSize: 16 }}>+ ₹{payment.amount}</Text>
                                        </View>
                                        <Divider style={{ marginVertical: 12, backgroundColor: colors.border }} />
                                        <View style={styles.paymentFooter}>
                                            <View style={[styles.badge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                                <Text style={{ color: colors.textMain, fontSize: 11, fontWeight: '600', textTransform: 'capitalize' }}>{payment.type}</Text>
                                            </View>
                                            <Text style={{ color: colors.textMuted, fontSize: 12, fontStyle: 'italic' }}>
                                                Ref: #{payment.id}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Date Pickers */}
            {(showStartPicker || showEndPicker) && (
                <DateTimePicker
                    value={showStartPicker ? startDate : endDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={showStartPicker ? onStartDateChange : onEndDateChange}
                />
            )}

            {/* Operator Selection Modal */}
            <Modal
                visible={isOperatorModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsOperatorModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textMain }]}>Select Operator</Text>
                            <TouchableOpacity onPress={() => setIsOperatorModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
                            <RNTextInput
                                placeholder="Search operators..."
                                placeholderTextColor={colors.textMuted}
                                style={[styles.searchInput, { color: colors.textMain }]}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <MaterialCommunityIcons name="close-circle" size={16} color={colors.textMuted} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <ScrollView style={styles.modalList}>
                            {/* Option: All Operators */}
                            <TouchableOpacity
                                style={[styles.modalItem, { borderBottomColor: colors.border }]}
                                onPress={() => handleSelectOperator(undefined, 'All Operators')}
                            >
                                <View style={[styles.avatarSmall, { backgroundColor: colors.primary }]}>
                                    <MaterialCommunityIcons name="account-group" size={16} color="#FFF" />
                                </View>
                                <Text style={[styles.modalItemText, { color: colors.textMain }]}>All Operators</Text>
                                {!selectedOperator && <MaterialCommunityIcons name="check" size={20} color={colors.primary} />}
                            </TouchableOpacity>

                            {/* Filtered List */}
                            {filteredOperators.map(op => (
                                <TouchableOpacity
                                    key={op.id}
                                    style={[styles.modalItem, { borderBottomColor: colors.border }]}
                                    onPress={() => handleSelectOperator(op.id, op.name)}
                                >
                                    <View style={[styles.avatarSmall, { backgroundColor: colors.card }]}>
                                        <Text style={{ fontWeight: '700', color: colors.primary }}>{op.name.charAt(0)}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.modalItemText, { color: colors.textMain }]}>{op.name}</Text>
                                        <Text style={{ fontSize: 12, color: colors.textMuted }}>{op.mobile}</Text>
                                    </View>
                                    {selectedOperator === op.id && <MaterialCommunityIcons name="check" size={20} color={colors.primary} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollContent: { padding: 24, paddingBottom: 40 },
    card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 24 },
    sectionTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
    dateRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    dateInput: { flex: 1 },
    label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
    dateBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 8, borderWidth: 1 },

    // Select Box Styles
    operatorContainer: { marginBottom: 4 },
    selectBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderWidth: 1, borderRadius: 8 },
    avatarSmall: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 0 },

    // Chips
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    recentChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },

    // Summary
    summaryCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderRadius: 16, borderWidth: 1, marginBottom: 32 },
    iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },

    // List
    sectionHeader: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
    emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, opacity: 0.6 },
    paymentCard: { padding: 16, borderRadius: 12, borderWidth: 1 },
    paymentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    listIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    paymentFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1 },

    // Modal
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalContent: { height: '80%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '900' },
    searchBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 16, gap: 8 },
    searchInput: { flex: 1, fontSize: 16 },
    modalList: { flex: 1 },
    modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, gap: 12 },
    modalItemText: { fontSize: 16, fontWeight: '600' }
});
