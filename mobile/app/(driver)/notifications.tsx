
import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useGetNotificationsQuery, Notification as ApiNotification } from '@/redux/apis/notificationApi';
import { useAppTheme } from '@/hooks/use-theme-color';
import { formatDate } from '../../utils/formatters';

export default function DriverNotificationsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colors } = useAppTheme();
    const { data, isLoading, refetch } = useGetNotificationsQuery();

    const notifications = Array.isArray(data?.notifications) ? data.notifications : 
                        (Array.isArray(data?.data) ? data.data : 
                        (Array.isArray((data?.data as any)?.data) ? (data?.data as any).data : []));

    const renderItem = ({ item }: { item: ApiNotification }) => (
        <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push({ pathname: '/(driver)/notification-details', params: { data: JSON.stringify(item) } })}
        >
            <View style={[styles.iconBox, { backgroundColor: item.isRead || item.is_read ? colors.border + '20' : colors.primary + '20' }]}>
                <MaterialCommunityIcons name="bell-outline" size={24} color={item.isRead || item.is_read ? colors.textMuted : colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.textMain, fontWeight: item.isRead || item.is_read ? '600' : '900' }]}>{item.title}</Text>
                <Text style={[styles.body, { color: colors.textMuted }]} numberOfLines={2}>{item.body}</Text>
                <Text style={[styles.time, { color: colors.textMuted }]}>{item.createdAt ? formatDate(item.createdAt) : ''}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('notifications_screen.title')}</Text>
                <View style={{ width: 44 }} />
            </View>

            {isLoading ? (
                <View style={styles.centered}><ActivityIndicator color={colors.primary} /></View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 24 }}
                    refreshing={isLoading}
                    onRefresh={refetch}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="bell-off-outline" size={64} color={colors.border} />
                            <Text style={{ color: colors.textMuted }}>{t('common.no_notifications')}</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    card: { flexDirection: 'row', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12, gap: 16 },
    iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 15, marginBottom: 4 },
    body: { fontSize: 13, marginBottom: 8 },
    time: { fontSize: 11, fontWeight: '700' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 100, gap: 16 }
});
