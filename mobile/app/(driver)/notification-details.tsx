import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useMarkAsReadMutation } from '@/redux/apis/notificationApi';
import { formatDate } from '@/utils/formatters';

export default function NotificationDetailsScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const params = useLocalSearchParams();
    const { colors } = useAppTheme();
    const [markAsRead] = useMarkAsReadMutation();

    const notification = params.data ? JSON.parse(params.data as string) : null;

    useEffect(() => {
        if (notification?.id && (!notification.isRead && !notification.is_read)) {
            markAsRead(notification.id);
        }
    }, [notification, markAsRead]);

    if (!notification) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.textMuted }}>{t('common.notification_not_found')}</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('notifications_screen.title')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Surface style={[styles.messageCard, { backgroundColor: colors.card, borderColor: colors.border }]} elevation={1}>
                    <View style={styles.typeBadgeRow}>
                        <View style={[styles.typeBadge, { backgroundColor: colors.primary + '20' }]}>
                            <MaterialCommunityIcons name="bell-outline" size={16} color={colors.primary} />
                            <Text style={{ color: colors.primary, fontSize: 10, fontWeight: 'bold', marginLeft: 4 }}>
                                {notification.type?.toUpperCase() || 'INFO'}
                            </Text>
                        </View>
                        <Text style={[styles.dateText, { color: colors.textMuted }]}>
                            {notification.createdAt ? formatDate(notification.createdAt) : ''}
                        </Text>
                    </View>

                    <Text style={[styles.title, { color: colors.textMain }]}>{notification.title}</Text>
                    <Text style={[styles.body, { color: colors.textMuted }]}>{notification.body}</Text>
                </Surface>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollView: { flex: 1 },
    scrollContent: { padding: 24 },
    messageCard: { borderRadius: 16, padding: 24, borderWidth: 1 },
    typeBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    dateText: { fontSize: 11, fontWeight: '600' },
    title: { fontSize: 22, fontWeight: '900', marginBottom: 12 },
    body: { fontSize: 16, lineHeight: 24 }
});
