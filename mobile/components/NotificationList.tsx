import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useAppSelector } from '@/redux/hooks';
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
    const { isOnline } = useAppSelector(state => state.offline);
    const { data, isLoading, refetch, isError } = useGetNotificationsQuery(undefined, { skip: !isOnline });
    const [markAsRead] = useMarkAsReadMutation();
    const [deleteNotification] = useDeleteNotificationMutation();

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        if (!isOnline) return;
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handlePress = async (notification: Notification) => {
        const isRead = notification.isRead || notification.is_read;
        if (!isRead && isOnline) {
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
        if (!isOnline) return;
        try {
            await deleteNotification(id).unwrap();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const renderItem = ({ item }: { item: Notification }) => {
        const isRead = item.isRead || item.is_read;
        const createdAt = item.createdAt || item.created_at || new Date().toISOString();
        
        // Define theme colors for different notification types
        const typeConfig: Record<string, { icon: any, color: string, label: string }> = {
            work_event: { icon: 'briefcase-clock', color: colors.success, label: t('notifications.work') },
            alert: { icon: 'alert-decagram', color: colors.danger, label: t('notifications.alert') },
            payment: { icon: 'cash-multiple', color: colors.primary, label: t('notifications.payment') },
            search_lead: { icon: 'fire', color: '#FF5722', label: t('notifications.lead') },
            info: { icon: 'information', color: colors.secondary || '#64748b', label: t('notifications.info') },
        };

        const config = typeConfig[item.type] || typeConfig.info;

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                style={[
                    styles.itemContainer, 
                    { 
                        backgroundColor: colors.card, 
                        borderColor: isRead ? colors.border : colors.primary + '30',
                        borderLeftWidth: isRead ? 1 : 4,
                        borderLeftColor: isRead ? colors.border : config.color
                    }
                ]}
                onPress={() => handlePress(item)}
            >
                <View style={[styles.iconWrapper, { backgroundColor: config.color + '12' }]}>
                    <MaterialCommunityIcons name={config.icon} size={22} color={config.color} />
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <View style={styles.titleArea}>
                            {!isRead && <View style={[styles.unreadDot, { backgroundColor: config.color }]} />}
                            <Text style={[styles.title, { color: colors.textMain, fontWeight: isRead ? '600' : '900' }]} numberOfLines={1}>
                                {item.title}
                            </Text>
                        </View>
                        <Text style={[styles.time, { color: colors.textMuted }]}>
                            {timeAgo(createdAt)}
                        </Text>
                    </View>
                    
                    <Text style={[styles.body, { color: colors.textMuted }]} numberOfLines={2}>
                        {item.body}
                    </Text>

                    {!isRead && (
                        <View style={styles.badgeRow}>
                            <View style={[styles.typeBadge, { backgroundColor: config.color + '15' }]}>
                                <Text style={[styles.typeBadgeText, { color: config.color }]}>{config.label}</Text>
                            </View>
                        </View>
                    )}
                </View>

                <TouchableOpacity 
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id)}
                >
                    <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.textMuted} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>{t('common.loading')}</Text>
            </View>
        );
    }

    const notifications = data?.notifications || data?.data || [];

    if (!isLoading && notifications.length === 0) {
        return (
            <View style={styles.center}>
                <View style={[styles.emptyIconContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="bell-off-outline" size={48} color={colors.textMuted} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.textMain }]}>{t('notifications.all_caught_up') || "All Caught Up!"}</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                    {t('notifications.no_new_notifications') || "You have no new notifications. We'll alert you when something important happens."}
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {!isOnline && (
                <View style={{ backgroundColor: colors.warning + '20', padding: 8, alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: colors.warning, fontWeight: '700' }}>
                        <MaterialCommunityIcons name="wifi-off" size={14} /> {t('common.offline_mode')} - {t('common.showing_cached_data')}
                    </Text>
                </View>
            )}
            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                        colors={[colors.primary]} 
                        tintColor={colors.primary}
                        progressBackgroundColor={colors.card}
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    loadingText: { marginTop: 12, fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
    listContent: { padding: 20, paddingTop: 10 },
    itemContainer: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    contentContainer: {
        flex: 1,
        marginRight: 8
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6
    },
    titleArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    title: {
        fontSize: 15,
        letterSpacing: 0.2
    },
    time: {
        fontSize: 11,
        fontWeight: '600'
    },
    body: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 8
    },
    badgeRow: {
        flexDirection: 'row',
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    deleteBtn: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: 24
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 10
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20
    }
});
