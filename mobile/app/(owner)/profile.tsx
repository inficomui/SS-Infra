import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout, selectActiveRole, setActiveRole } from '@/redux/slices/authSlice';
import { toggleTheme, selectThemeMode } from '@/redux/slices/themeSlice';
import Toast from 'react-native-toast-message';
import { setNotificationsEnabled } from '@/redux/slices/settingsSlice';
import { RootState } from '@/redux/store';
import { useAppTheme } from '@/hooks/use-theme-color';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useGetMySubscriptionQuery } from '@/redux/apis/subscriptionApi';
import { useGetMachinesQuery, useGetOperatorsQuery } from '@/redux/apis/ownerApi';
import { useGetClientsQuery } from '@/redux/apis/workApi';

export default function OwnerProfileScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { colors, isDark } = useAppTheme();
    const user = useSelector(selectCurrentUser);
    const themeMode = useSelector(selectThemeMode);
    const activeRole = useSelector(selectActiveRole);
    const { notificationsEnabled } = useSelector((state: RootState) => state.settings);
    const { t } = useTranslation();

    const { data: subData } = useGetMySubscriptionQuery();
    const { data: machinesData } = useGetMachinesQuery();
    const { data: workersData } = useGetOperatorsQuery();
    const { data: clientsData } = useGetClientsQuery();

    const machineCount = machinesData?.machines?.length || 0;
    const workerCount = (workersData?.workers?.length || workersData?.operators?.length) || 0;
    const clientCount = clientsData?.clients?.length || 0;

    const sub = subData?.subscription;
    const isSubActive = subData?.isActive ?? false;
    const subDaysLeft = Math.floor(sub?.daysRemaining ?? 0);
    const subStatusColor = !isSubActive ? colors.danger
        : subDaysLeft <= 7 ? colors.danger
            : subDaysLeft <= 14 ? colors.warning
                : colors.success;
    const subStatusLabel = !isSubActive ? 'Inactive'
        : sub?.status === 'expired' ? 'Expired'
            : `${subDaysLeft}d left`;

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
            : 'OW';
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('profile_screen.title') || "Profile"}</Text>
                <TouchableOpacity onPress={() => router.push('/(owner)/settings' as any)} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="cog-outline" size={24} color={colors.textMain} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
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
                        <Text style={[styles.editBtnText, { color: colors.primary }]}>{t('profile_screen.update_personal_info') || "Update Personal Info"}</Text>
                    </TouchableOpacity>
                </View>

                {/* Business Analytics */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile.business_analytics')}</Text>
                    <View style={[styles.statsRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        <StatItem label={t('profile.machines')} value={String(machineCount)} icon="excavator" color={colors.primary} colors={colors} />
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <StatItem label={t('profile.workers')} value={String(workerCount)} icon="account-group" color={colors.primary} colors={colors} />
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <StatItem label={t('profile.sites')} value={String(clientCount)} icon="map-marker-radius" color={colors.primary} colors={colors} />
                    </View>
                </View>

                {/* Operation Mode Switching */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('owner.operation_mode') || "Operation Mode"}</Text>
                    <View style={[styles.menuBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MenuRow
                            icon="shield-crown"
                            label={t('owner.mode_owner') || "Owner Mode"}
                            value={(activeRole === 'Owner' || !activeRole) ? "Active" : ""}
                            colors={colors}
                            right={(activeRole === 'Owner' || !activeRole) ? <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary} /> : null}
                            onPress={() => {
                                dispatch(setActiveRole('Owner'));
                                Toast.show({ type: 'success', text1: 'Switched to Owner Mode' });
                            }}
                        />
                        <MenuRow
                            icon="excavator"
                            label={t('owner.mode_operator') || "Operator Mode"}
                            value={activeRole === 'Operator' ? "Active" : ""}
                            colors={colors}
                            right={activeRole === 'Operator' ? <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary} /> : null}
                            onPress={() => {
                                dispatch(setActiveRole('Operator'));
                                Toast.show({ type: 'success', text1: 'Switched to Operator Mode' });
                            }}
                        />
                        <MenuRow
                            icon="truck-delivery"
                            label={t('owner.mode_driver') || "Driver Mode"}
                            value={activeRole === 'Driver' ? "Active" : ""}
                            colors={colors}
                            right={activeRole === 'Driver' ? <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary} /> : null}
                            onPress={() => {
                                dispatch(setActiveRole('Driver'));
                                Toast.show({ type: 'success', text1: 'Switched to Driver Mode' });
                            }}
                        />
                    </View>
                </View>

                {/* Account Management */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile_screen.trust_identity') || "Trust & Identity"}</Text>
                    <View style={[styles.menuBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MenuRow
                            icon="shield-check-outline"
                            label={t('profile_screen.kyc_verification')}
                            value={t('profile_screen.verified')}
                            colors={colors}
                            right={<MaterialCommunityIcons name="check-decagram" size={18} color={colors.success} />}
                            onPress={() => { }}
                        />
                        <MenuRow
                            icon="bank-outline"
                            label={t('profile_screen.billing_invoice')}
                            colors={colors}
                            onPress={() => { }}
                        />
                        <MenuRow
                            icon="card-account-details-outline"
                            label={t('profile_screen.referral_program')}
                            value={t('profile_screen.referral_earned', { amount: '1,200' })}
                            colors={colors}
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Business Profile Details */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile_screen.business_profile') || "Business Profile"}</Text>
                    <View style={[styles.menuBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.detailItem}>
                            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('profile_screen.business_name') || "Business Name"}</Text>
                            <Text style={[styles.detailValue, { color: colors.textMain }]}>SS Infra Software</Text>
                        </View>
                        <View style={[styles.detailItem, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t('profile_screen.registered_area') || "Registered Area"}</Text>
                            <Text style={[styles.detailValue, { color: colors.textMain }]}>{user?.district}, {user?.taluka}</Text>
                        </View>
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

function StatItem({ icon, label, value, color, colors, large }: any) {
    return (
        <View style={styles.statItem}>
            <MaterialCommunityIcons name={icon} size={large ? 24 : 18} color={color} style={{ marginBottom: 4 }} />
            <Text style={[styles.statValue, { color: colors.textMain, fontSize: large ? 20 : 16 }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
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
    menuBox: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
    menuRow: { flexDirection: 'row', height: 72, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1 },
    menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconBox: { width: 42, height: 42, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    menuLabel: { fontSize: 15, fontWeight: '700' },
    menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    menuValue: { fontSize: 14, fontWeight: '600' },

    // Statistics Styles
    statsRow: { flexDirection: 'row', padding: 20, borderRadius: 4, gap: 10 },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontWeight: '900' },
    statLabel: { fontSize: 10, fontWeight: '600', marginTop: 2, textTransform: 'uppercase' },
    statDivider: { width: 1, height: 40 },

    // Detail Item Styles
    detailItem: { padding: 16, gap: 2 },
    detailLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    detailValue: { fontSize: 15, fontWeight: '600' },

    logoutButton: { marginTop: 40, borderRadius: 4, overflow: 'hidden' },
    logoutGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 12 },
    logoutText: { fontSize: 15, fontWeight: '800', color: '#FFF' },
    subStatusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
    subStatusDot: { width: 6, height: 6, borderRadius: 3 },
});
