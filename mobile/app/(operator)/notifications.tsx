
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import Toast from 'react-native-toast-message';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllNotifications, markAllAsRead } from '@/redux/slices/notificationSlice';

export default function NotificationsScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const [refreshing, setRefreshing] = useState(false);
    const notifications = useSelector(selectAllNotifications);
    const dispatch = useDispatch();

    const onRefresh = async () => {
        setRefreshing(true);
        // Simulate a refresh or dispatch an action if fetching from API
        setTimeout(() => setRefreshing(false), 1000);
        Toast.show({ type: 'success', text1: 'Updated', text2: 'Notifications refreshed.' });
    };

    const handleMarkAllRead = () => {
        dispatch(markAllAsRead());
        Toast.show({ type: 'success', text1: 'All Read', text2: 'All notifications marked as read.' });
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'work_start': return 'play-circle-outline';
            case 'work_pause': return 'pause-circle-outline';
            case 'work_finish': return 'check-circle-outline';
            case 'invoice': return 'file-document-outline';
            case 'machine_assign': return 'truck-outline';
            case 'client_add': return 'account-plus-outline';
            default: return 'bell-outline';
        }
    };

    const getColorForType = (type: string) => {
        switch (type) {
            case 'work_start': return colors.success;
            case 'work_pause': return colors.warning;
            case 'work_finish': return colors.primary;
            case 'invoice': return colors.secondary || '#9333EA';
            case 'machine_assign': return colors.textMuted;
            default: return colors.primary;
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        // If less than 24 hours
        if (diff < 86400000) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Notifications</Text>
                <TouchableOpacity onPress={handleMarkAllRead} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="check-all" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {notifications.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="bell-off-outline" size={60} color={colors.border} />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No notifications yet</Text>
                    </View>
                ) : (
                    notifications.map((item: any) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.notificationCard,
                                { backgroundColor: colors.card, borderColor: colors.border },
                                !item.isRead && { borderLeftWidth: 4, borderLeftColor: colors.primary }
                            ]}
                            onPress={() => router.push({ pathname: '/(operator)/notification-details', params: { id: item.id } } as any)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: getColorForType(item.type) + '15' }]}>
                                <MaterialCommunityIcons name={getIconForType(item.type) as any} size={24} color={getColorForType(item.type)} />
                            </View>
                            <View style={styles.contentContainer}>
                                <View style={styles.row}>
                                    <Text style={[styles.title, { color: colors.textMain }]} numberOfLines={1}>{item.title}</Text>
                                    <Text style={[styles.time, { color: colors.textMuted }]}>{formatTime(item.createdAt)}</Text>
                                </View>
                                <Text style={[styles.body, { color: colors.textMuted }]} numberOfLines={2}>{item.body}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: '900' },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 24 },
    notificationCard: { flexDirection: 'row', padding: 16, borderRadius: 4, borderWidth: 1, marginBottom: 12, alignItems: 'flex-start', gap: 14 },
    iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    contentContainer: { flex: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    title: { fontSize: 15, fontWeight: '800' },
    time: { fontSize: 11 },
    body: { fontSize: 13, lineHeight: 18 },
    emptyContainer: { alignItems: 'center', marginTop: 100, opacity: 0.7 },
    emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600' }
});
