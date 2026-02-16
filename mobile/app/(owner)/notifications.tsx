import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import NotificationList from '@/components/NotificationList';
import { useMarkAllAsReadMutation } from '@/redux/apis/notificationApi';

export default function NotificationsScreen() {
    const { colors } = useAppTheme();
    const router = useRouter();
    const [markAllAsRead] = useMarkAllAsReadMutation();

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead().unwrap();
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Notifications</Text>
                <TouchableOpacity onPress={handleMarkAllRead}>
                    <MaterialCommunityIcons name="playlist-check" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <NotificationList basePath="/(owner)" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900'
    }
});
