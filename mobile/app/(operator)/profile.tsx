import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '@/redux/slices/authSlice';
import { toggleTheme, selectThemeMode } from '@/redux/slices/themeSlice';
import { useAppTheme } from '@/hooks/use-theme-color';
import { storage } from '@/redux/storage';
import { Machine } from '@/redux/apis/ownerApi';

export default function OperatorProfileScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { colors, isDark } = useAppTheme();
    const user = useSelector(selectCurrentUser);
    const themeMode = useSelector(selectThemeMode);

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
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Operator Hub</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                        <StatItem label="Rating" value="4.9" icon="star" color="#FACC15" colors={colors} />
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <StatItem label="Hours" value="1.2k" icon="clock-outline" color={colors.primary} colors={colors} />
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <StatItem label="Jobs" value="48" icon="briefcase-check" color={colors.success} colors={colors} />
                    </View>
                </LinearGradient>

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Preferences</Text>
                    <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MenuRow
                            icon="account-edit-outline"
                            label="Edit Profile"
                            colors={colors}
                            onPress={() => router.push('/(operator)/edit-profile' as any)}
                        />
                        <MenuRow
                            icon="theme-light-dark"
                            label="Dark Mode"
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
                            icon="bell-outline"
                            label="Notifications"
                            colors={colors}
                            right={<Switch value={true} onValueChange={() => { }} trackColor={{ true: colors.primary }} />}
                        />
                    </View>
                </View>

                {/* Equipment Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Equipment Assignment</Text>
                    <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MenuRow
                            icon="excavator"
                            label={assignedMachine ? `${assignedMachine.name} (${assignedMachine.registration_number || assignedMachine.registrationNumber})` : "No Machine Assigned"}
                            colors={colors}
                            onPress={() => { }} // Disabled for now, or could link to selector
                            right={assignedMachine ? <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} /> : null}
                        />
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Information</Text>
                    <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MenuRow
                            icon="shield-check-outline"
                            label="Privacy Policy"
                            colors={colors}
                            onPress={() => router.push('/(operator)/privacy-policy' as any)}
                        />
                        <MenuRow
                            icon="information-outline"
                            label="About Us"
                            colors={colors}
                            onPress={() => router.push('/(operator)/about' as any)}
                        />
                        <MenuRow
                            icon="help-circle-outline"
                            label="Support"
                            colors={colors}
                            onPress={() => { }}
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
                        <Text style={styles.logoutText}>Log Out</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
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
    iconButton: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { flex: 1, paddingHorizontal: 24 },
    profileCard: { padding: 24, borderRadius: 4, alignItems: 'center', marginBottom: 30, borderWidth: 1 },
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
    menuContainer: { borderRadius: 4, overflow: 'hidden', borderWidth: 1 },
    menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
    menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconBox: { width: 40, height: 40, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
    menuLabel: { fontSize: 15, fontWeight: '700' },
    logoutButton: { marginTop: 40, borderRadius: 4, overflow: 'hidden' },
    logoutGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 12 },
    logoutText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
