
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '@/redux/slices/authSlice';
import { toggleTheme, selectThemeMode } from '@/redux/slices/themeSlice';
import { setNotificationsEnabled } from '@/redux/slices/settingsSlice';
import { RootState } from '@/redux/store';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetDutyStatsQuery } from '@/redux/apis/workApi';

export default function DriverProfileScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { colors, isDark } = useAppTheme();
    const user = useSelector(selectCurrentUser);
    const { notificationsEnabled } = useSelector((state: RootState) => state.settings);

    const { data: dutyStats } = useGetDutyStatsQuery();
    const stats = dutyStats?.stats;

    const handleLogout = () => {
        dispatch(logout());
        // redux-persist will clear the persisted auth state automatically
        router.replace('/login');
    };

    const getInitials = (name: string) => {
        return name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2) : 'DR';
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('profile.title')}</Text>
                <TouchableOpacity onPress={() => router.push('/(driver)/settings' as any)} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="cog-outline" size={24} color={colors.textMain} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                <LinearGradient colors={isDark ? ['#111', '#000'] : ['#FFF', '#F9F9F9']} style={[styles.profileCard, { borderColor: colors.border }]}>
                    <Avatar.Text size={80} label={getInitials(user?.name || '')} style={{ backgroundColor: colors.primary }} color="#000" />
                    <Text style={[styles.userName, { color: colors.textMain }]}>{user?.name || 'Driver Name'}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: colors.primary + '15' }]}>
                        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{user?.role || 'Driver'}</Text>
                    </View>
                    {user?.assignedVehicle && (
                        <Text style={[styles.subInfo, { color: colors.textMuted }]}>
                            Vehicle: <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{user.assignedVehicle}</Text>
                        </Text>
                    )}
                    {user?.licenseNumber && (
                        <Text style={[styles.subInfo, { color: colors.textMuted }]}>
                            License: <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{user.licenseNumber}</Text>
                        </Text>
                    )}
                </LinearGradient>

                {/* Driving Stats */}
                <View style={[styles.statsRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderColor: colors.border }]}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="road-variant" size={20} color={colors.primary} />
                        <Text style={[styles.statValue, { color: colors.textMain }]}>{stats?.totalKm || "3,240"}</Text>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('profile.km_run')}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="timer-outline" size={20} color={colors.success} />
                        <Text style={[styles.statValue, { color: colors.textMain }]}>{stats?.totalHours || "420h"}</Text>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('profile.driven')}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="star" size={20} color="#FACC15" />
                        <Text style={[styles.statValue, { color: colors.textMain }]}>{stats?.rating || "4.8"}</Text>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('profile.rating')}</Text>
                    </View>
                </View>

                {/* Account Actions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile.personal_info') || "Personal Info"}</Text>
                    <View style={[styles.menuContainer, { borderColor: colors.border }]}>
                        <MenuRow
                            icon="account-details-outline"
                            label={t('profile.view_identity_docs') || "Identity Documents"}
                            colors={colors}
                            onPress={() => { }}
                            right={<MaterialCommunityIcons name="check-decagram" size={18} color={colors.success} />}
                        />
                        <MenuRow
                            icon="office-building-outline"
                            label="SS Infra Software"
                            colors={colors}
                            onPress={() => { }}
                        />
                        <MenuRow
                            icon="map-marker-outline"
                            label={`${user?.district || 'Raigad'}, ${user?.taluka || 'Maharashtra'}`}
                            colors={colors}
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Profile Link to Settings */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile.app_customization') || "App Customization"}</Text>
                    <View style={[styles.menuContainer, { borderColor: colors.border }]}>
                        <MenuRow
                            icon="cog-outline"
                            label={t('profile.go_to_settings') || "Go to Settings"}
                            colors={colors}
                            onPress={() => router.push('/(driver)/settings' as any)}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LinearGradient colors={[colors.danger, '#B91C1C']} style={styles.logoutGradient}>
                        <MaterialCommunityIcons name="logout" size={20} color="#FFF" />
                        <Text style={styles.logoutText}>{t('profile.logout')}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

function MenuRow({ icon, label, right, onPress, colors }: any) {
    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={!onPress}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
                <Text style={{ color: colors.textMain, fontWeight: '700' }}>{label}</Text>
            </View>
            {right ? right : <MaterialCommunityIcons name="chevron-right" size={20} color={colors.border} />}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    iconButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { padding: 24 },
    profileCard: { padding: 24, borderRadius: 12, alignItems: 'center', borderWidth: 1, marginBottom: 24 },
    userName: { fontSize: 22, fontWeight: '900', marginTop: 12 },
    roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8, marginBottom: 16 },
    subInfo: { fontSize: 13, fontWeight: '700', marginTop: 4 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 12, opacity: 0.6 },
    menuContainer: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
    menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    logoutButton: { borderRadius: 12, overflow: 'hidden', marginTop: 24 },
    logoutGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, gap: 12 },
    logoutText: { color: '#FFF', fontWeight: 'bold' },
    // Statistics Styles
    statsRow: { flexDirection: 'row', padding: 20, borderRadius: 12, borderWidth: 1, gap: 10, marginVertical: 10 },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontWeight: '900', fontSize: 18, marginTop: 4 },
    statLabel: { fontSize: 9, fontWeight: '800', marginTop: 2, letterSpacing: 0.5 },
    statDivider: { width: 1, height: '80%', backgroundColor: 'rgba(0,0,0,0.1)', alignSelf: 'center' }
});
