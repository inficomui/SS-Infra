import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton, Portal, Modal, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';
import NotificationList from '@/components/NotificationList';
import { useMarkAllAsReadMutation, useSendNotificationMutation } from '@/redux/apis/notificationApi';
import Toast from 'react-native-toast-message';

export default function NotificationsScreen() {
    const { colors, isDark } = useAppTheme();
    const { t } = useTranslation();
    const router = useRouter();
    const [markAllAsRead] = useMarkAllAsReadMutation();
    const [sendNotification, { isLoading: isSending }] = useSendNotificationMutation();

    const [visible, setVisible] = React.useState(false);
    const [notifForm, setNotifForm] = React.useState({
        title: '',
        body: '',
        target: 'Operator'
    });

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead().unwrap();
            Toast.show({ type: 'success', text1: t('notifications.marked_all_read') || 'Marked all as read' });
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const handleSendBroadcast = async () => {
        if (!notifForm.title || !notifForm.body) {
            Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Please enter title and message' });
            return;
        }

        try {
            await sendNotification({
                title: notifForm.title,
                body: notifForm.body,
                targetRole: notifForm.target,
                type: 'info'
            }).unwrap();

            Toast.show({ type: 'success', text1: 'Broadcast Sent', text2: 'Notification sent to all ' + notifForm.target + 's' });
            setVisible(false);
            setNotifForm({ title: '', body: '', target: 'Operator' });
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Failed to send' });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('notifications_screen.title')}</Text>
                
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleMarkAllRead} style={styles.headerIcon}>
                        <MaterialCommunityIcons name="playlist-check" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setVisible(true)} style={[styles.headerIcon, { marginLeft: 12 }]}>
                        <MaterialCommunityIcons name="plus-circle" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <NotificationList basePath="/(owner)" />

            <Portal>
                <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.textMain }]}>Send Broadcast</Text>
                        <IconButton icon="close" size={20} onPress={() => setVisible(false)} />
                    </View>

                    <Text style={[styles.modalLabel, { color: colors.textMuted }]}>Target Audience</Text>
                    <SegmentedButtons
                        value={notifForm.target}
                        onValueChange={v => setNotifForm({ ...notifForm, target: v })}
                        buttons={[
                            { value: 'Operator', label: 'Operators' },
                            { value: 'Driver', label: 'Drivers' },
                        ]}
                        style={styles.segment}
                        density="medium"
                        theme={{ colors: { primary: colors.primary, onPrimary: '#fff' } }}
                    />

                    <TextInput
                        label="Notification Title"
                        value={notifForm.title}
                        onChangeText={t => setNotifForm({ ...notifForm, title: t })}
                        mode="outlined"
                        style={styles.input}
                        outlineStyle={{ borderRadius: 12 }}
                    />

                    <TextInput
                        label="Message Body"
                        value={notifForm.body}
                        onChangeText={t => setNotifForm({ ...notifForm, body: t })}
                        mode="outlined"
                        multiline
                        numberOfLines={4}
                        style={[styles.input, { height: 100 }]}
                        outlineStyle={{ borderRadius: 12 }}
                    />

                    <Button
                        mode="contained"
                        onPress={handleSendBroadcast}
                        loading={isSending}
                        style={styles.sendBtn}
                        contentStyle={styles.sendBtnContent}
                        labelStyle={styles.sendBtnLabel}
                    >
                        SEND BROADCAST
                    </Button>
                </Modal>
            </Portal>
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
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        flex: 1,
        textAlign: 'center'
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        margin: 20,
        padding: 24,
        borderRadius: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '900',
    },
    modalLabel: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 4
    },
    segment: {
        marginBottom: 20
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'transparent'
    },
    sendBtn: {
        marginTop: 8,
        borderRadius: 14,
    },
    sendBtnContent: {
        paddingVertical: 8
    },
    sendBtnLabel: {
        fontWeight: '900',
        fontSize: 14,
        letterSpacing: 1
    }
});
