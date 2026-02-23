import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '@/redux/slices/authSlice';
import { toggleTheme, selectThemeMode } from '@/redux/slices/themeSlice';
import { useAppTheme } from '@/hooks/use-theme-color';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function OwnerProfileScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { colors, isDark } = useAppTheme();
    const user = useSelector(selectCurrentUser);
    const themeMode = useSelector(selectThemeMode);
    const { t } = useTranslation();

    const handleLogout = () => {
        dispatch(logout());
        router.replace('/login');
    };

    const getInitials = (name: string) => {
        return name
            ? name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2)
            : 'OW';
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('profile_screen.title')}</Text>
                <TouchableOpacity onPress={() => router.push('/(owner)/settings' as any)} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="cog-outline" size={24} color={colors.textMain} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Identity */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrapper}>
                        <Avatar.Text
                            size={90}
                            label={getInitials(user?.name || '')}
                            style={{ backgroundColor: colors.primary }}
                            color="#000"
                        />
                    </View>
                    <Text style={[styles.userName, { color: colors.textMain }]}>{user?.name || t('profile_screen.fleet_owner')}</Text>

                    <View style={[styles.roleBadge, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                        <Text style={[styles.roleText, { color: colors.primary }]}>{user?.role || t('profile_screen.owner_role')}</Text>
                    </View>

                    <Text style={[styles.userLocation, { color: colors.textMuted }]}>
                        <MaterialCommunityIcons name="map-marker" size={14} color={colors.primary} /> {user?.district}, {user?.taluka}
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.push('/(owner)/edit-profile' as any)}
                        style={[styles.editBtn, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
                    >
                        <Text style={[styles.editBtnText, { color: colors.primary }]}>{t('profile_screen.update_personal_info')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Account Settings */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile_screen.customization')}</Text>
                    <View style={[styles.menuBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MenuRow
                            icon="theme-light-dark"
                            label={t('profile_screen.dark_experience')}
                            colors={colors}
                            right={
                                <Switch
                                    value={isDark}
                                    onValueChange={() => { dispatch(toggleTheme()); }}
                                    trackColor={{ true: colors.primary, false: colors.border }}
                                    thumbColor={isDark ? '#FFF' : '#F4F3F4'}
                                />
                            }
                        />
                        <MenuRow
                            icon="bell-ring-outline"
                            label={t('settings.notifications')}
                            colors={colors}
                            right={<Switch value={true} onValueChange={() => { }} trackColor={{ true: colors.primary, false: colors.border }} />}
                        />
                        <MenuRow
                            icon="translate"
                            label={t('profile_screen.change_language')}
                            colors={colors}
                            onPress={() => router.push('/language-selection')}
                        />
                    </View>
                </View>

                <View style={[styles.section, { borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile_screen.app_info')}</Text>
                    <View style={[styles.menuBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MenuRow icon="information-outline" label={t('profile_screen.about_app')} colors={colors} onPress={() => router.push('/(owner)/about' as any)} />
                    </View>
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile_screen.support')}</Text>
                    <View style={[styles.menuBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MenuRow icon="help-circle-outline" label={t('profile_screen.help_center')} colors={colors} onPress={() => router.push('/(owner)/help' as any)} />
                        <MenuRow icon="file-document-outline" label={t('profile_screen.legal_docs')} colors={colors} onPress={() => router.push('/(owner)/terms' as any)} />
                    </View>
                </View>

                {/* Danger Zone */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LinearGradient
                        colors={[colors.danger, '#B91C1C']}
                        style={styles.logoutGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <MaterialCommunityIcons name="logout" size={20} color="#FFF" />
                        <Text style={styles.logoutText}>{t('profile_screen.sign_out')}</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

function MenuRow({ icon, label, value, right, onPress, colors }: any) {
    const Content = () => (
        <View style={[styles.menuRow, { borderBottomColor: colors.border }]}>
            <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                    <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.textMain }]}>{label}</Text>
            </View>
            <View style={styles.menuRight}>
                {value && <Text style={[styles.menuValue, { color: colors.textMuted }]}>{value}</Text>}
                {right}
                {onPress && !right && <MaterialCommunityIcons name="chevron-right" size={20} color={colors.border} />}
            </View>
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress}>
                <Content />
            </TouchableOpacity>
        );
    }

    return <Content />;
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { flex: 1, paddingHorizontal: 24 },
    profileSection: { alignItems: 'center', paddingVertical: 20 },
    avatarWrapper: { marginBottom: 16 },
    userName: { fontSize: 24, fontWeight: '900', marginBottom: 6 },
    roleBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 8,
        borderWidth: 1,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    userLocation: { fontSize: 14, fontWeight: '600', marginBottom: 20 },
    editBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 4, borderWidth: 1 },
    editBtnText: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
    section: { marginTop: 30 },
    sectionTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, marginLeft: 4 },
    menuBox: { borderRadius: 4, borderWidth: 1, overflow: 'hidden' },
    menuRow: { flexDirection: 'row', height: 72, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1 },
    menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconBox: { width: 42, height: 42, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
    menuLabel: { fontSize: 15, fontWeight: '700' },
    menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    menuValue: { fontSize: 14, fontWeight: '600' },
    logoutButton: { marginTop: 40, borderRadius: 4, overflow: 'hidden' },
    logoutGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 12 },
    logoutText: { fontSize: 15, fontWeight: '800', color: '#FFF' },
});
