import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetBookingsQuery, useUpdateBookingStatusMutation } from '@/redux/apis/bookingApi';

export default function OperatorBookingsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colors } = useAppTheme();

    const { data, isLoading, refetch } = useGetBookingsQuery();
    const [updateStatus] = useUpdateBookingStatusMutation();

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
                        {(item.status === 'accepted' || item.status === 'assigned') && (
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
            <Stack.Screen options={{ title: t('overview.bookings'), headerShown: true, headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.textMain }} />

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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 16 },
    card: { borderWidth: 1, borderRadius: 8, padding: 16, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    dateText: { fontSize: 13 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    statusText: { fontSize: 11, fontWeight: 'bold' },
    locationText: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
    detailText: { fontSize: 13 },
    footerRow: { marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
    amountText: { fontSize: 16, fontWeight: '800' },
    emptyText: { marginTop: 16, fontSize: 16 },
    actionRow: { flexDirection: 'row', gap: 8 },
    actionButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    actionText: { fontSize: 12, fontWeight: 'bold' }
});
