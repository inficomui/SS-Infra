
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Text, List } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors } = useAppTheme();
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [soundEnabled, setSoundEnabled] = React.useState(true);
    const [autoSync, setAutoSync] = React.useState(true);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('settings.title')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.section, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('settings.general')}</Text>
                    <List.Item
                        title={t('settings.language')}
                        description="English / हिन्दी / मराठी"
                        left={() => <List.Icon icon="web" color={colors.primary} />}
                        right={() => <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />}
                        onPress={() => { }}
                        titleStyle={{ color: colors.textMain }}
                        descriptionStyle={{ color: colors.textMuted }}
                    />
                    <List.Item
                        title={t('settings.notifications')}
                        description={t('settings.notifications_desc')}
                        left={() => <List.Icon icon="bell-outline" color={colors.primary} />}
                        right={() => <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: '#767577', true: colors.primary }} thumbColor={notificationsEnabled ? '#f4f3f4' : '#f4f3f4'} />}
                        onPress={() => { }}
                        titleStyle={{ color: colors.textMain }}
                        descriptionStyle={{ color: colors.textMuted }}
                    />
                </View>

                <View style={[styles.section, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('settings.preferences')}</Text>
                    <List.Item
                        title={t('settings.sound_effects')}
                        description={t('settings.sound_effects_desc')}
                        left={() => <List.Icon icon="volume-high" color={colors.primary} />}
                        right={() => <Switch value={soundEnabled} onValueChange={setSoundEnabled} trackColor={{ false: '#767577', true: colors.primary }} thumbColor={soundEnabled ? '#f4f3f4' : '#f4f3f4'} />}
                        onPress={() => { }}
                        titleStyle={{ color: colors.textMain }}
                        descriptionStyle={{ color: colors.textMuted }}
                    />
                    <List.Item
                        title={t('settings.auto_sync')}
                        description={t('settings.auto_sync_desc')}
                        left={() => <List.Icon icon="sync" color={colors.primary} />}
                        right={() => <Switch value={autoSync} onValueChange={setAutoSync} trackColor={{ false: '#767577', true: colors.primary }} thumbColor={autoSync ? '#f4f3f4' : '#f4f3f4'} />}
                        onPress={() => { }}
                        titleStyle={{ color: colors.textMain }}
                        descriptionStyle={{ color: colors.textMuted }}
                    />
                </View>

                <View style={[styles.section, { borderBottomColor: 'transparent' }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('settings.advanced')}</Text>
                    <List.Item
                        title={t('settings.clear_cache')}
                        description={t('settings.clear_cache_desc')}
                        left={() => <List.Icon icon="delete-sweep-outline" color={colors.danger} />}
                        onPress={() => alert(t('settings.cache_cleared'))}
                        titleStyle={{ color: colors.textMain }}
                        descriptionStyle={{ color: colors.textMuted }}
                    />
                    <List.Item
                        title={t('settings.factory_reset')}
                        description={t('settings.factory_reset_desc')}
                        left={() => <List.Icon icon="restore" color={colors.danger} />}
                        onPress={() => alert(t('settings.reset_complete'))}
                        titleStyle={{ color: colors.textMain }}
                        descriptionStyle={{ color: colors.textMuted }}
                    />
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { paddingHorizontal: 24 },
    section: { paddingVertical: 16, borderBottomWidth: 1 },
    sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 1 },
});
