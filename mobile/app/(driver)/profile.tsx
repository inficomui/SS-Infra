
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
import { useAppTheme } from '@/hooks/use-theme-color';

export default function DriverProfileScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { colors, isDark } = useAppTheme();
    const user = useSelector(selectCurrentUser);

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
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('profile.title')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('profile.preferences')}</Text>
                    <View style={styles.menuContainer}>
                        <MenuRow icon="theme-light-dark" label={t('profile.dark_mode')} colors={colors} right={
                            <Switch value={isDark} onValueChange={() => { dispatch(toggleTheme()); }} trackColor={{ true: colors.primary }} />
                        } />
                        <MenuRow icon="translate" label={t('common.change_language')} colors={colors} onPress={() => router.push('/language-selection')} />
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
    iconButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
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
    logoutText: { color: '#FFF', fontWeight: 'bold' }
});
