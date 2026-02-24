import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetNotificationsQuery, useMarkAsReadMutation, useDeleteNotificationMutation, Notification } from '@/redux/apis/notificationApi';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min ago";
    return Math.floor(seconds) + " sec ago";
};

export default function NotificationList({ basePath = '/(owner)' }: { basePath?: string }) {
    const { colors } = useAppTheme();
    const router = useRouter();
    const { t } = useTranslation();
    const { data, isLoading, refetch, isError } = useGetNotificationsQuery();
    const [markAsRead] = useMarkAsReadMutation();
    const [deleteNotification] = useDeleteNotificationMutation();

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handlePress = async (notification: Notification) => {
        const isRead = notification.isRead || notification.is_read;
        if (!isRead) {
            try {
                await markAsRead(notification.id).unwrap();
            } catch (error) {
                console.error("Failed to mark as read", error);
            }
        }

        // Handle navigation based on type
        if (notification.data?.type === 'work_event' && notification.data?.operator_id) {
            // Placeholder for specific navigation logic if needed
        }

        // Navigate to details
        router.push({
            pathname: `${basePath}/notification-details` as any,
            params: { notification: JSON.stringify(notification) }
        });
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteNotification(id).unwrap();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const renderItem = ({ item }: { item: Notification }) => {
        const isRead = item.isRead || item.is_read;
        const createdAt = item.createdAt || item.created_at || new Date().toISOString();
        const isWorkEvent = item.type === 'work_event';
        const isAlert = item.type === 'alert';

        let iconName: any = 'bell-outline';
        let iconColor = colors.primary;

        if (isWorkEvent) {
            iconName = 'briefcase-clock-outline';
            iconColor = colors.success;
        } else if (isAlert) {
            iconName = 'alert-circle-outline';
            // Corrected: using colors.danger instead of colors.error
            iconColor = colors.danger;
        } else if (item.type === 'payment') {
            iconName = 'cash';
            iconColor = colors.success;
        } else if (item.type === 'search_lead') {
            iconName = 'fire';
            iconColor = '#FF5722'; // Deep Orange for leads
        }

        return (
            <TouchableOpacity
                style={[styles.itemContainer, { backgroundColor: isRead ? colors.background : colors.cardLight, borderColor: colors.border }]}
                onPress={() => handlePress(item)}
            >
                <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
                    <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.title, { color: colors.textMain, fontWeight: isRead ? '600' : '800' }]}>
                            {item.title}
                        </Text>
                        <Text style={[styles.time, { color: colors.textMuted }]}>
                            {timeAgo(createdAt)}
                        </Text>
                    </View>
                    <Text style={[styles.body, { color: colors.textMuted }]} numberOfLines={2}>
                        {item.body}
                    </Text>
                </View>
                <IconButton
                    icon="close"
                    size={20}
                    iconColor={colors.textMuted}
                    onPress={() => handleDelete(item.id)}
                />
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={colors.primary} size="large" />
            </View>
        );
    }

    const notifications = data?.notifications || data?.data || [];

    if (!isLoading && notifications.length === 0) {
        return (
            <View style={styles.center}>
                <MaterialCommunityIcons name="bell-sleep" size={64} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('common.no_notifications')}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    listContent: { padding: 16 },
    itemContainer: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        alignItems: 'flex-start'
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    contentContainer: {
        flex: 1,
        marginRight: 8
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4
    },
    title: {
        fontSize: 14,
        flex: 1,
        marginRight: 8
    },
    time: {
        fontSize: 10
    },
    body: {
        fontSize: 13,
        lineHeight: 18
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500'
    }
});
