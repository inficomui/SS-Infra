import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Avatar } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '@/redux/slices/authSlice';
import { toggleTheme, selectThemeMode } from '@/redux/slices/themeSlice';
import { setNotificationsEnabled } from '@/redux/slices/settingsSlice';
import { RootState } from '@/redux/store';
import { useAppTheme } from '@/hooks/use-theme-color';
import { storage } from '@/redux/storage';
import { Machine } from '@/redux/apis/ownerApi';
import { useGetDutyStatsQuery } from '@/redux/apis/workApi';

export default function OperatorProfileScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { colors, isDark } = useAppTheme();
    const user = useSelector(selectCurrentUser);
    const themeMode = useSelector(selectThemeMode);
    const { notificationsEnabled } = useSelector((state: RootState) => state.settings);

    const { data: dutyStats } = useGetDutyStatsQuery();
    const stats = dutyStats?.stats;

    const [assignedMachine, setAssignedMachine] = useState<Machine | null>(null);

    useFocusEffect(
        useCallback(() => {
            const loadMachine = async () => {
                try {
                    const stored = await storage.getItem('selected_machine');
                    if (stored) {
                        setAssignedMachine(JSON.parse(stored));
                    } else {
                        setAssignedMachine(null);
                    }
                } catch (e) {
                    console.error("Failed to load machine", e);
                }
            };
            loadMachine();
        }, [])
    );

    const handleLogout = () => {
        dispatch(logout());
        // redux-persist will clear the persisted auth state automatically
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
            : 'OP';
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('profile.operator_hub')}</Text>
                <TouchableOpacity onPress={() => router.push('/(operator)/settings' as any)} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="cog-outline" size={24} color={colors.textMain} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                {/* Profile Identity Card */}
                <LinearGradient
                    colors={isDark ? ['#111', '#000'] : ['#FFF', '#F9F9F9']}
                    style={[styles.profileCard, { borderColor: colors.border }]}
                >
                    <View style={styles.avatarContainer}>
                        <Avatar.Text
                            size={80}
                            label={getInitials(user?.name || '')}
                            style={{ backgroundColor: colors.primary }}
                            color="#000"
                        />
                        <View style={[styles.badge, { backgroundColor: colors.success, borderColor: colors.background }]}>
                            <MaterialCommunityIcons name="check" size={12} color="#FFF" />
                        </View>
                    </View>
                    <Text style={[styles.userName, { color: colors.textMain }]}>{user?.name || 'Operator Name'}</Text>

                    <View style={[styles.roleBadge, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                        <Text style={[styles.roleText, { color: colors.primary }]}>{user?.role || 'Machine Operator'}</Text>
                    </View>

                    <View style={[styles.statsRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        <StatItem label={t('profile.rating') || "Rating"} value={stats?.rating || "4.9"} icon="star" color="#FACC15" colors={colors} />
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <StatItem label={t('profile.hours') || "Hours"} value={stats?.totalHours || "1.2k"} icon="clock-outline" color={colors.primary} colors={colors} />
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <StatItem label={t('profile.jobs') || "Jobs"} value={stats?.totalJobs || "48"} icon="briefcase-check" color={colors.success} colors={colors} />
                    </View>
                </LinearGradient>

                {/* Professional Identity */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile.experience_skills') || "Experience & Skills"}</Text>
                    <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.skillItem}>
                            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('profile.machine_expertise') || "Machine Expertise"}</Text>
                            <Text style={[styles.detailValue, { color: colors.textMain }]}>Excavator, Backhoe Loader</Text>
                        </View>
                        <View style={[styles.skillItem, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('profile.total_experience') || "Total Experience"}</Text>
                            <Text style={[styles.detailValue, { color: colors.textMain }]}>5 Years • {t('profile.pro_level')}</Text>
                        </View>
                        <View style={[styles.skillItem, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('profile.license_status') || "License Status"}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <MaterialCommunityIcons name="check-decagram" size={16} color={colors.success} />
                                <Text style={[styles.detailValue, { color: colors.success }]}>{t('profile.active_verified')}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Equipment Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile.equipment_assignment') || "Equipment Assignment"}</Text>
                    <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MenuRow
                            icon="excavator"
                            label={assignedMachine ? `${assignedMachine.name} (${assignedMachine.registration_number || assignedMachine.registrationNumber})` : t('profile.no_machine')}
                            colors={colors}
                            onPress={() => { }}
                            right={assignedMachine ? <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} /> : null}
                        />
                    </View>
                </View>

                {/* Detailed Profile Info */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile.detailed_info') || "Detailed Info"}</Text>
                    <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.skillItem}>
                            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('profile.assigned_organization') || "Assigned Organization"}</Text>
                            <Text style={[styles.detailValue, { color: colors.textMain }]}>SS Infra Software</Text>
                        </View>
                        <View style={[styles.skillItem, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('profile.working_area') || "Working Area"}</Text>
                            <Text style={[styles.detailValue, { color: colors.textMain }]}>{user?.district}, {user?.taluka}</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Access to Settings */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile.quick_settings') || "Quick Settings"}</Text>
                    <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MenuRow
                            icon="cog-outline"
                            label={t('profile.global_settings') || "Global Settings"}
                            colors={colors}
                            onPress={() => router.push('/(operator)/settings' as any)} 
                        />
                    </View>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LinearGradient
                        colors={[colors.danger, '#B91C1C']}
                        style={styles.logoutGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <MaterialCommunityIcons name="logout" size={20} color="#FFF" />
                        <Text style={styles.logoutText}>{t('profile.logout')}</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
}

function StatItem({ label, value, icon, color, colors }: any) {
    return (
        <View style={styles.statItem}>
            <View style={styles.statValRow}>
                <MaterialCommunityIcons name={icon} size={14} color={color} />
                <Text style={[styles.statValue, { color: colors.textMain }]}>{value}</Text>
            </View>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
        </View>
    );
}

function MenuRow({ icon, label, right, onPress, colors }: any) {
    return (
        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={onPress} disabled={!onPress}>
            <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                    <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.textMain }]}>{label}</Text>
            </View>
            {right ? right : <MaterialCommunityIcons name="chevron-right" size={20} color={colors.border} />}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { flex: 1, paddingHorizontal: 24 },
    profileCard: { padding: 24, borderRadius: 12, alignItems: 'center', marginBottom: 30, borderWidth: 1 },
    avatarContainer: { position: 'relative', marginBottom: 16 },
    badge: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
    userName: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
    roleBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 20,
        borderWidth: 1,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', padding: 16, borderRadius: 4 },
    statItem: { alignItems: 'center' },
    statValRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statValue: { fontSize: 16, fontWeight: '800' },
    statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
    statDivider: { width: 1, height: 30 },
    section: { marginTop: 30 },
    sectionTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, marginLeft: 4 },
    menuContainer: { borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
    menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
    menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconBox: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    menuLabel: { fontSize: 15, fontWeight: '700' },

    // Detail & Skill Styles
    skillItem: { padding: 16, gap: 2 },
    detailLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    detailValue: { fontSize: 15, fontWeight: '600' },

    logoutButton: { marginTop: 40, borderRadius: 4, overflow: 'hidden' },
    logoutGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 12 },
    logoutText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
