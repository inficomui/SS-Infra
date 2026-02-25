import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetBookingsQuery } from '@/redux/apis/bookingApi';

export default function OperatorBookingsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colors } = useAppTheme();

    const { data, isLoading, refetch } = useGetBookingsQuery();

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [])
    );

    const renderBooking = ({ item }: any) => {
        return (
            <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => { }}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.dateText, { color: colors.textMuted }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.statusText, { color: colors.primary }]}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>
                <Text style={[styles.locationText, { color: colors.textMain }]}>{item.location}</Text>
                <Text style={[styles.amountText, { color: colors.textMain }]}>₹{item.total_amount}</Text>
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
                    data={data?.bookings || []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderBooking}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <MaterialCommunityIcons name="calendar-blank" size={48} color={colors.textMuted} />
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No bookings found.</Text>
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
    locationText: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    amountText: { fontSize: 14, fontWeight: '500' },
    emptyText: { marginTop: 16, fontSize: 16 }
});
