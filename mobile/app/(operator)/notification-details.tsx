
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useDispatch, useSelector } from 'react-redux';
import { markAsRead, selectNotificationById, deleteNotification } from '@/redux/slices/notificationSlice';
import { LinearGradient } from 'expo-linear-gradient';

export default function NotificationDetailsScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const dispatch = useDispatch();
    const { id, notification: notificationParam } = useLocalSearchParams<{ id: string, notification: string }>();

    const reduxNotification = useSelector((state) => selectNotificationById(state, id));

    const notification = React.useMemo(() => {
        if (notificationParam) {
            try {
                return JSON.parse(notificationParam);
            } catch (e) {
                console.error("Failed to parse notification param", e);
            }
        }
        return reduxNotification;
    }, [notificationParam, reduxNotification]);

    // Mark as read when viewing details (only if ID exists)
    React.useEffect(() => {
        if ((id || notification?.id) && notification && !notification.isRead) {
            dispatch(markAsRead(id || notification.id));
        }
    }, [id, notification]);

    if (!notification) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.textMain }]}>Details</Text>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>Notification not found</Text>
                </View>
            </View>
        );
    }

    const handleDelete = () => {
        dispatch(deleteNotification(id));
        router.back();
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
            case 'invoice': return colors.primary || '#9333EA';
            case 'machine_assign': return colors.textMuted;
            default: return colors.primary;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Details</Text>
                <TouchableOpacity onPress={handleDelete} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.danger }]}>
                    <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.danger} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.topSection}>
                    <View style={[styles.iconBox, { backgroundColor: getColorForType(notification.type) + '15' }]}>
                        <MaterialCommunityIcons name={getIconForType(notification.type) as any} size={40} color={getColorForType(notification.type)} />
                    </View>
                    <Text style={[styles.time, { color: colors.textMuted }]}>{new Date(notification.createdAt).toLocaleString()}</Text>
                    <Text style={[styles.title, { color: colors.textMain }]}>{notification.title}</Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.body, { color: colors.textMain }]}>{notification.body}</Text>

                    {/* Render additional data if available */}
                    {notification.data && Object.keys(notification.data).length > 0 && (
                        <View style={styles.dataContainer}>
                            <Text style={[styles.dataTitle, { color: colors.textMuted }]}>Additional Data</Text>
                            {Object.entries(notification.data).map(([key, value]) => (
                                <View key={key} style={styles.dataRow}>
                                    <Text style={[styles.dataKey, { color: colors.textMuted }]}>{key}:</Text>
                                    <Text style={[styles.dataValue, { color: colors.textMain }]}>{String(value)}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
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
    dataTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
    dataRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    dataKey: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
    dataValue: { fontSize: 14, fontWeight: '700' },
});
