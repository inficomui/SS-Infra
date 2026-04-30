
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Text, List } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setNotificationsEnabled, setSoundEnabled, setAutoSync } from '@/redux/slices/settingsSlice';
import { toggleTheme } from '@/redux/slices/themeSlice';
import i18n from '@/utils/i18n';

export default function OperatorSettingsScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { colors, isDark } = useAppTheme();

    // Redux Settings
    const { notificationsEnabled, soundEnabled, autoSync } = useSelector((state: RootState) => state.settings);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('settings.title')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* ─── General Settings ─── */}
                <View style={[styles.section, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('settings.general')}</Text>
                    <List.Item
                        title={t('settings.language')}
                        description={i18n.language === 'en' ? 'English' : i18n.language === 'hi' ? 'हिन्दी' : 'मराठी'}
                        left={() => <List.Icon icon="web" color={colors.primary} />}
                        right={() => <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />}
                        onPress={() => router.push('/language-selection')}
                        titleStyle={{ color: colors.textMain }}
                        descriptionStyle={{ color: colors.textMuted }}
                    />
                    <List.Item
                        title={t('profile.dark_mode')}
                        description={t('settings.dark_mode_desc')}
                        left={() => <List.Icon icon="theme-light-dark" color={colors.primary} />}
                        right={() => (
                            <Switch
                                value={isDark}
                                onValueChange={() => { dispatch(toggleTheme()); }}
                                trackColor={{ false: '#767577', true: colors.primary }}
                                thumbColor={isDark ? '#f4f3f4' : '#f4f3f4'}
                            />
                        )}
                        titleStyle={{ color: colors.textMain }}
                        descriptionStyle={{ color: colors.textMuted }}
                    />
                    <List.Item
                        title={t('settings.notifications')}
                        description={t('settings.notifications_desc')}
                        left={() => <List.Icon icon="bell-outline" color={colors.primary} />}
                        right={() => (
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={(val) => { dispatch(setNotificationsEnabled(val)); }}
                                trackColor={{ false: '#767577', true: colors.primary }}
                                thumbColor={notificationsEnabled ? '#f4f3f4' : '#f4f3f4'}
                            />
                        )}
                        titleStyle={{ color: colors.textMain }}
                        descriptionStyle={{ color: colors.textMuted }}
                    />
                </View>

                {/* ─── Preferences ─── */}
                <View style={[styles.section, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('settings.preferences')}</Text>
                    <List.Item
                        title={t('settings.sound_effects')}
                        description={t('settings.sound_effects_desc')}
                        left={() => <List.Icon icon="volume-high" color={colors.primary} />}
                        right={() => (
                            <Switch
                                value={soundEnabled}
                                onValueChange={(val) => { dispatch(setSoundEnabled(val)); }}
                                trackColor={{ false: '#767577', true: colors.primary }}
                                thumbColor={soundEnabled ? '#f4f3f4' : '#f4f3f4'}
                            />
                        )}
                        titleStyle={{ color: colors.textMain }}
                        descriptionStyle={{ color: colors.textMuted }}
                    />
                    <List.Item
                        title={t('settings.auto_sync')}
                        description={t('settings.auto_sync_desc')}
                        left={() => <List.Icon icon="sync" color={colors.primary} />}
                        right={() => (
                            <Switch
                                value={autoSync}
                                onValueChange={(val) => { dispatch(setAutoSync(val)); }}
                                trackColor={{ false: '#767577', true: colors.primary }}
                                thumbColor={autoSync ? '#f4f3f4' : '#f4f3f4'}
                            />
                        )}
                        titleStyle={{ color: colors.textMain }}
                        descriptionStyle={{ color: colors.textMuted }}
                    />
                </View>

                {/* ─── Information & Support ─── */}
                <View style={[styles.section, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile.information')}</Text>
                    <List.Item
                        title={t('profile.about_us')}
                        left={() => <List.Icon icon="information-outline" color={colors.primary} />}
                        right={() => <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />}
                        onPress={() => router.push('/(operator)/about' as any)}
                        titleStyle={{ color: colors.textMain }}
                    />
                    <List.Item
                        title={t('profile.support')}
                        left={() => <List.Icon icon="help-circle-outline" color={colors.primary} />}
                        right={() => <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />}
                        onPress={() => router.push('/(operator)/support' as any)}
                        titleStyle={{ color: colors.textMain }}
                    />
                    <List.Item
                        title={t('profile.privacy_policy')}
                        left={() => <List.Icon icon="shield-check-outline" color={colors.primary} />}
                        right={() => <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />}
                        onPress={() => router.push('/(operator)/privacy-policy' as any)}
                        titleStyle={{ color: colors.textMain }}
                    />
                </View>

                {/* ─── Advanced ─── */}
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
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    iconButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { paddingHorizontal: 20, paddingTop: 8 },
    sectionTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
    section: { paddingVertical: 16, borderBottomWidth: 1 },
});
