import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Modal, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetBookingsQuery, useUpdateBookingStatusMutation, useAssignOperatorMutation } from '@/redux/apis/bookingApi';
import { useGetOperatorsQuery } from '@/redux/apis/ownerApi';

export default function OwnerBookingsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colors } = useAppTheme();

    const { data, isLoading, refetch } = useGetBookingsQuery();
    const [updateStatus] = useUpdateBookingStatusMutation();
    const [assignOperator] = useAssignOperatorMutation();
    const { data: operatorsData } = useGetOperatorsQuery();
    const operators = operatorsData?.operators || [];

    const [isAssignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [])
    );

    const handleUpdateStatus = (id: number, status: string) => {
        Alert.alert(
            "Confirm Action",
            `Are you sure you want to change status to ${status.toUpperCase()}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Yes", onPress: () => updateStatus({ id, status }) }
            ]
        );
    };

    const handleAssignOperator = (operatorId: number) => {
        if (selectedBookingId) {
            assignOperator({ id: selectedBookingId, operator_id: operatorId })
                .unwrap()
                .then(() => {
                    Alert.alert("Success", "Operator assigned successfully");
                    setAssignModalVisible(false);
                    setSelectedBookingId(null);
                })
                .catch(() => {
                    Alert.alert("Error", "Failed to assign operator");
                });
        }
    };

    const renderBooking = ({ item }: any) => {
        const locationStr = [item.location_taluka, item.location_district].filter(Boolean).join(', ') || 'Location pending';
        const displayDate = item.date_of_requirement ? new Date(item.date_of_requirement).toLocaleDateString() : new Date(item.created_at).toLocaleDateString();

        return (
            <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => { }}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.dateText, { color: colors.textMuted }]}>{displayDate}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.statusText, { color: colors.primary }]}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>
                <Text style={[styles.locationText, { color: colors.textMain }]}>{locationStr}</Text>

                {/* Booker Details */}
                {item.client_name && (
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="account-outline" size={16} color={colors.textMuted} />
                        <Text style={[styles.detailText, { color: colors.textMuted }]}>{item.client_name} {item.mobile ? `(${item.mobile})` : ''}</Text>
                    </View>
                )}

                {/* Machine Info */}
                {item.machine?.name && (
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="excavator" size={16} color={colors.textMuted} />
                        <Text style={[styles.detailText, { color: colors.textMuted }]}>{item.machine.name} {item.machine.model ? `(${item.machine.model})` : ''}</Text>
                    </View>
                )}

                {/* Booking Purpose or Message */}
                {item.message && (
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="text-box-outline" size={16} color={colors.textMuted} />
                        <Text style={[styles.detailText, { color: colors.textMuted }]} numberOfLines={2}>
                            {item.message}
                        </Text>
                    </View>
                )}

                <View style={styles.footerRow}>
                    <Text style={[styles.amountText, { color: colors.textMain }]}>
                        {item.total_amount ? `₹${item.total_amount}` : 'Amount TBD'}
                    </Text>

                    <View style={styles.actionRow}>
                        {item.status === 'pending' && (
                            <>
                                <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]} onPress={() => handleUpdateStatus(item.id, 'rejected')}>
                                    <Text style={[styles.actionText, { color: '#ef4444' }]}>Reject</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]} onPress={() => handleUpdateStatus(item.id, 'accepted')}>
                                    <Text style={[styles.actionText, { color: '#22c55e' }]}>Accept</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {item.status === 'accepted' && (
                            <>
                                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]} onPress={() => { setSelectedBookingId(item.id); setAssignModalVisible(true); }}>
                                    <Text style={[styles.actionText, { color: colors.primary }]}>Assign Operator</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]} onPress={() => handleUpdateStatus(item.id, 'completed')}>
                                    <Text style={[styles.actionText, { color: '#22c55e' }]}>Complete</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {item.status === 'assigned' && (
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]} onPress={() => handleUpdateStatus(item.id, 'completed')}>
                                <Text style={[styles.actionText, { color: '#22c55e' }]}>Complete Job</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ title: t('owner.bookings'), headerShown: true, headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.textMain }} />

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={data?.data?.data || []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderBooking}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <MaterialCommunityIcons name="calendar-blank" size={48} color={colors.textMuted} />
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('common.no_bookings')}</Text>
                        </View>
                    }
                />
            )}

            <Modal visible={isAssignModalVisible} transparent={true} animationType="slide" onRequestClose={() => setAssignModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.textMain }]}>Select Operator to Assign</Text>
                        <FlatList
                            data={operators}
                            keyExtractor={(op) => op.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.operatorItem} onPress={() => handleAssignOperator(item.id)}>
                                    <View style={styles.operatorAvatar}>
                                        <Text style={styles.operatorAvatarText}>{item?.name?.charAt(0)}</Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.operatorName, { color: colors.textMain }]}>{item?.name}</Text>
                                        <Text style={[styles.operatorPhone, { color: colors.textMuted }]}>{item?.mobile}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text style={{ padding: 20, textAlign: 'center', color: colors.textMuted }}>No operators found in your fleet.</Text>}
                        />
                        <TouchableOpacity style={[styles.closeModalButton, { backgroundColor: colors.background }]} onPress={() => setAssignModalVisible(false)}>
                            <Text style={[styles.closeModalText, { color: colors.textMain }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 20 },
    card: {
        borderWidth: 1,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
    dateText: { fontSize: 13, fontWeight: '600', opacity: 0.7 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    statusText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    locationText: { fontSize: 18, fontWeight: '800', marginBottom: 12, letterSpacing: 0.2 },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
    detailText: { fontSize: 14, fontWeight: '500', opacity: 0.8 },
    footerRow: { marginTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
    amountText: { fontSize: 20, fontWeight: '800' },
    emptyText: { marginTop: 20, fontSize: 18, fontWeight: '600', opacity: 0.7 },
    actionRow: { flexDirection: 'row', gap: 10 },
    actionButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, elevation: 1 },
    actionText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 32, maxHeight: '85%', elevation: 10 },
    modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20, letterSpacing: 0.2 },
    operatorItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    operatorAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(245, 158, 11, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    operatorAvatarText: { color: '#f59e0b', fontWeight: '800', fontSize: 18 },
    operatorName: { fontSize: 16, fontWeight: '700' },
    operatorPhone: { fontSize: 14, marginTop: 4, fontWeight: '500', opacity: 0.7 },
    closeModalButton: { marginTop: 24, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
    closeModalText: { fontSize: 16, fontWeight: '700' }
});
