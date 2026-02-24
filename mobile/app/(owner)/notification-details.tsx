
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useDispatch, useSelector } from 'react-redux';
import { useMarkAsReadMutation, useDeleteNotificationMutation, Notification } from '@/redux/apis/notificationApi';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function NotificationDetailsScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const { t } = useTranslation();
    const { id, notification: notificationParam } = useLocalSearchParams<{ id: string, notification: string }>();

    const [markAsRead] = useMarkAsReadMutation();
    const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();

    const notification = React.useMemo(() => {
        if (notificationParam) {
            try {
                return JSON.parse(notificationParam) as Notification;
            } catch (e) {
                console.error("Failed to parse notification param", e);
            }
        }
        return null;
    }, [notificationParam]);

    // Mark as read when viewing details
    React.useEffect(() => {
        const triggerMarkRead = async () => {
            if (notification && !(notification.isRead || notification.is_read)) {
                try {
                    await markAsRead(notification.id.toString()).unwrap();
                } catch (e) {
                    console.error("Failed to mark as read on detail view", e);
                }
            }
        };
        triggerMarkRead();
    }, [notification]);

    if (!notification) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('notification_details.title')}</Text>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('notification_details.not_found')}</Text>
                </View>
            </View>
        );
    }

    const handleDelete = () => {
        Alert.alert(
            t('common.delete') || "Delete",
            t('common.delete_confirm') || "Are you sure you want to delete this?",
            [
                { text: t('common.cancel'), style: "cancel" },
                {
                    text: t('common.delete'),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteNotification(notification.id.toString()).unwrap();
                            router.back();
                        } catch (e) {
                            Alert.alert("Error", "Failed to delete notification");
                        }
                    }
                }
            ]
        );
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'work_start': return 'play-circle-outline';
            case 'work_pause': return 'pause-circle-outline';
            case 'work_finish': return 'check-circle-outline';
            case 'invoice': return 'file-document-outline';
            case 'machine_assign': return 'truck-outline';
            case 'client_add': return 'account-plus-outline';
            case 'search_lead': return 'fire';
            case 'alert': return 'alert-circle-outline';
            default: return 'bell-outline';
        }
    };

    const getColorForType = (type: string) => {
        switch (type) {
            case 'work_start': return colors.success;
            case 'work_pause': return colors.warning;
            case 'work_finish': return colors.primary;
            case 'invoice': return colors.primary || '#9333EA';
            case 'machine_assign': return colors.textMuted;
            case 'search_lead': return '#FF5722';
            case 'alert': return colors.danger;
            default: return colors.primary;
        }
    };

    const createdAt = notification.createdAt || notification.created_at || new Date().toISOString();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('notification_details.title')}</Text>
                <TouchableOpacity onPress={handleDelete} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.danger }]}>
                    {isDeleting ? <ActivityIndicator size="small" color={colors.danger} /> : <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.danger} />}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.topSection}>
                    <View style={[styles.iconBox, { backgroundColor: getColorForType(notification.type) + '15' }]}>
                        <MaterialCommunityIcons name={getIconForType(notification.type) as any} size={40} color={getColorForType(notification.type)} />
                    </View>
                    <Text style={[styles.time, { color: colors.textMuted }]}>{new Date(createdAt).toLocaleString()}</Text>
                    <Text style={[styles.title, { color: colors.textMain }]}>{notification.title}</Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.body, { color: colors.textMain }]}>{notification.body}</Text>

                    {/* Specialized UI for Search Lead */}
                    {notification.type === 'search_lead' && (
                        <View style={styles.leadContainer}>
                            <View style={styles.leadHeader}>
                                <MaterialCommunityIcons name="lightning-bolt" size={16} color="#FFD700" />
                                <Text style={styles.leadHeaderText}>PROSPECTIVE LEAD</Text>
                            </View>
                            <View style={styles.leadInfo}>
                                <View style={styles.infoRow}>
                                    <MaterialCommunityIcons name="map-marker" size={18} color={colors.textMuted} />
                                    <Text style={[styles.infoText, { color: colors.textMain }]}>District: {notification.data?.district || 'Not specified'}</Text>
                                </View>
                                {notification.data?.taluka && (
                                    <View style={styles.infoRow}>
                                        <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.textMuted} />
                                        <Text style={[styles.infoText, { color: colors.textMain }]}>Taluka: {notification.data.taluka}</Text>
                                    </View>
                                )}
                                {notification.data?.searchQuery && (
                                    <View style={styles.infoRow}>
                                        <MaterialCommunityIcons name="magnify" size={18} color={colors.textMuted} />
                                        <Text style={[styles.infoText, { color: colors.textMain }]}>Search: "{notification.data.searchQuery}"</Text>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                                onPress={() => router.push('/(owner)/operators')}
                            >
                                <Text style={styles.actionBtnText}>CHECK OPERATORS</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Render additional data if available and not search_lead */}
                    {notification.type !== 'search_lead' && notification.data && Object.keys(notification.data).length > 0 && (
                        <View style={styles.dataContainer}>
                            <Text style={[styles.dataTitle, { color: colors.textMuted }]}>{t('notification_details.additional_data')}</Text>
                            {Object.entries(notification.data).map(([key, value]) => {
                                if (key === 'type') return null;
                                return (
                                    <View key={key} style={styles.dataRow}>
                                        <Text style={[styles.dataKey, { color: colors.textMuted }]}>{key.replace(/_/g, ' ')}:</Text>
                                        <Text style={[styles.dataValue, { color: colors.textMain }]}>{String(value)}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { flex: 1, paddingHorizontal: 24 },
    topSection: { alignItems: 'center', marginVertical: 30 },
    iconBox: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    time: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
    card: { padding: 24, borderRadius: 16, borderWidth: 1 },
    body: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 16, fontWeight: '600' },
    dataContainer: { marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#33333333' },
    dataTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 },
    dataRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    dataKey: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
    dataValue: { fontSize: 14, fontWeight: '700' },

    // Lead Styles
    leadContainer: { marginTop: 24, padding: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.03)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    leadHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    leadHeaderText: { fontSize: 10, fontWeight: '900', color: '#FFD700', letterSpacing: 1 },
    leadInfo: { gap: 10, marginBottom: 20 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    infoText: { fontSize: 15, fontWeight: '700' },
    actionBtn: { height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    actionBtnText: { color: '#000', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 }
});
