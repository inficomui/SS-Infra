import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useGetMeQuery } from '@/redux/apis/authApi';
import { useGetDutyHistoryQuery, useGetActiveDutyQuery, useGetDutyStatsQuery } from '@/redux/apis/workApi';
import { useGetNotificationsQuery, Notification as ApiNotification } from '@/redux/apis/notificationApi';
import { useAppTheme } from '@/hooks/use-theme-color';
import { formatDate, formatDuration } from '@/utils/formatters';
import { selectWorkStatus, selectActiveWorkId, selectSiteAddress, selectStartedAt, syncWithServer } from '@/redux/slices/driverSlice';

const { width } = Dimensions.get('window');

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export function DriverOverview() {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useDispatch();
    const { colors, isDark } = useAppTheme();

    // Persistent Redux State
    const workStatus = useSelector(selectWorkStatus);
    const activeWorkId = useSelector(selectActiveWorkId);
    const startedAt = useSelector(selectStartedAt);

    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    const { data: userData } = useGetMeQuery();
    const { data: statsData, isLoading: isLoadingStats, refetch: refetchStats } = useGetDutyStatsQuery();

    // Active Work Query
    const {
        data: activeWorkData,
        isLoading: isLoadingActive,
        refetch: refetchActive
    } = useGetActiveDutyQuery(undefined, {
        pollingInterval: 30000,
    });

    // Recent History
    const {
        data: historyData,
        isLoading: isLoadingHistory,
        refetch: refetchHistory
    } = useGetDutyHistoryQuery({
        page: 1,
        limit: 5
    });

    const { data: notificationsData, refetch: refetchNotifications } = useGetNotificationsQuery();

    // RTK Query fetches data on mount and polls automatically based on pollingInterval.
    useFocusEffect(
        useCallback(() => {
            refetchActive();
            refetchStats();
            refetchHistory();
            refetchNotifications();
        }, [refetchActive, refetchStats, refetchHistory, refetchNotifications])
    );

    const rawNotifications = notificationsData?.notifications || notificationsData?.data;
    const allNotifications: ApiNotification[] = Array.isArray(rawNotifications) ? rawNotifications : [];
    const unreadCount = allNotifications.filter((n: ApiNotification) => !n.isRead && !n.is_read).length || 0;

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Sync persistent state with server data
    useEffect(() => {
        if (activeWorkData?.success && activeWorkData?.workSession) {
            const serverId = activeWorkData.workSession.id.toString();
            // Only sync if the ID has changed to avoid unnecessary re-renders/loops
            if (serverId !== activeWorkId) {
                dispatch(syncWithServer({
                    activeWork: {
                        ...activeWorkData.workSession,
                        siteAddress: activeWorkData.workSession.startLocation || activeWorkData.workSession.siteAddress
                    }
                }));
            }
        } else if (activeWorkData?.success === true && activeWorkData?.workSession === null && workStatus === 'running') {
            // Server says no active duty, but we think there is one (clear it)
            dispatch(syncWithServer({ activeWork: null }));
        }
    }, [activeWorkData, dispatch, activeWorkId, workStatus]);

    // Timer logic based on persistent 'startedAt'
    useEffect(() => {
        const updateTimer = () => {
            if (workStatus !== 'running' || !startedAt) {
                setElapsedSeconds(0);
                return;
            }
            const start = new Date(startedAt).getTime();
            const now = new Date().getTime();
            const diff = Math.floor((now - start) / 1000);
            setElapsedSeconds(diff > 0 ? diff : 0);
        };

        if (workStatus === 'running') {
            updateTimer();
            intervalRef.current = setInterval(updateTimer, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setElapsedSeconds(0);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [workStatus, startedAt]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.greeting, { color: colors.textMain }]}>
                        {userData?.user?.name || 'Driver Hub'}
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                        {userData?.user?.assignedVehicle ? `Vehicle: ${userData.user.assignedVehicle}` : t('overview.subtitle')}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity onPress={() => router.push('/(driver)/notifications')}>
                        <View style={[styles.profileCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <MaterialCommunityIcons name="bell-outline" size={26} color={colors.textMain} />
                            {unreadCount > 0 && (
                                <View style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, borderWidth: 1, borderColor: colors.card }} />
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/(driver)/profile')}>
                        <View style={[styles.profileCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <MaterialCommunityIcons name="account" size={26} color={colors.primary} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
                <LinearGradient
                    colors={isDark ? ['#1A1A1A', '#000000'] : ['#FFFFFF', '#F3F4F6']}
                    style={[styles.statusCard, { borderColor: colors.border, borderWidth: 1 }]}
                >
                    <View style={styles.statusHeader}>
                        <View>
                            <Text style={[styles.statusLabel, { color: colors.textMuted }]}>{t('driver.active_duty') || 'Active Duty'}</Text>
                            <Text style={[styles.statusValue, { color: colors.textMain }]}>
                                {workStatus === 'idle' ? t('overview.no_active_task') : 'Duty in Progress'}
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.statusBadgeContainer,
                                { backgroundColor: workStatus === 'running' ? colors.success + '20' : colors.border + '20' }
                            ]}
                        >
                            <View style={[styles.statusIndicatorDot, { backgroundColor: workStatus === 'running' ? colors.success : colors.textMuted }]} />
                            <Text style={[styles.statusBadgeText, { color: workStatus === 'running' ? colors.success : colors.textMuted }]}>
                                {workStatus === 'running' ? 'ON DUTY' : 'OFF DUTY'}
                            </Text>
                        </View>
                    </View>

                    {workStatus === 'running' ? (
                        <View style={styles.timerContainer}>
                            <Text style={[styles.timerValue, { color: colors.primary }]}>{formatTime(elapsedSeconds)}</Text>
                            <Text style={[styles.timerSub, { color: colors.textMuted }]}>{t('overview.tracking_duration')}</Text>
                        </View>
                    ) : (
                        <View style={styles.idleState}>
                            <MaterialCommunityIcons name="car-connected" size={40} color={colors.primary} />
                            <Text style={[styles.idleText, { color: colors.textMuted }]}>Ready to start your duty?</Text>
                        </View>
                    )}
                </LinearGradient>

                {/* Performance Stats */}
                <View style={styles.statsRow}>
                    <View style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.statIcon, { backgroundColor: '#8B5CF620' }]}>
                            <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#8B5CF6" />
                        </View>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Sessions</Text>
                        <Text style={[styles.statNb, { color: colors.textMain }]}>{statsData?.stats?.totalSessions || 0}</Text>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
                            <MaterialCommunityIcons name="history" size={24} color={colors.primary} />
                        </View>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Hours</Text>
                        <Text style={[styles.statNb, { color: colors.textMain }]}>{statsData?.stats?.totalHours || 0}</Text>
                    </View>
                </View>

                {/* Grid Menu */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{t('overview.operations')}</Text>
                <View style={styles.menuGrid}>
                    <MenuIconButton
                        icon="history"
                        label={t('driver.duty_history') || 'Duty History'}
                        onPress={() => router.push('/(driver)/duty-log')}
                        color="#8B5CF6"
                        colors={colors}
                    />
                    <MenuIconButton
                        icon="wallet-outline"
                        label={t('driver.wallet') || 'Wallet'}
                        onPress={() => router.push('/(driver)/wallet')}
                        color={colors.primary}
                        colors={colors}
                    />
                    <MenuIconButton
                        icon="gas-station"
                        label={t('overview.fuel') || 'Fuel Logs'}
                        onPress={() => router.push('/(driver)/fuel' as any)}
                        color={colors.warning}
                        colors={colors}
                    />
                    <MenuIconButton
                        icon="hammer-wrench"
                        label={t('overview.maintenance') || 'Maintenance'}
                        onPress={() => router.push('/(driver)/maintenance' as any)}
                        color={colors.primary}
                        colors={colors}
                    />
                    <MenuIconButton
                        icon="bell-outline"
                        label={t('notifications_screen.title')}
                        onPress={() => router.push('/(driver)/notifications')}
                        color="#3B82F6"
                        colors={colors}
                    />
                    <MenuIconButton
                        icon="account-outline"
                        label={t('profile_screen.title')}
                        onPress={() => router.push('/(driver)/profile')}
                        color={colors.success}
                        colors={colors}
                    />
                </View>

                {/* History */}
                <RecentDutyHistory router={router} colors={colors} historyData={historyData} isLoading={isLoadingHistory} />

                <View style={{ height: 160 }} />
            </ScrollView>

            <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                {workStatus === 'idle' ? (
                    <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/(driver)/start-duty')}>
                        <LinearGradient colors={[colors.primary, colors.primary]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <MaterialCommunityIcons name="play" size={28} color="#000" />
                            <Text style={styles.startBtnText}>{t('driver.start_duty') || 'START DUTY'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.finishBtn} onPress={() => router.push('/(driver)/end-duty')}>
                        <LinearGradient colors={[colors.danger, '#B91C1C']} style={styles.gradient}>
                            <MaterialCommunityIcons name="stop" size={26} color="#FFF" />
                            <Text style={[styles.startBtnText, { color: '#FFF' }]}>{t('driver.end_duty') || 'END DUTY'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

function RecentDutyHistory({ router, colors, historyData, isLoading }: any) {
    const { t } = useTranslation();
    const recentWorks = (historyData?.workSessions || historyData?.work_sessions || historyData?.data || []).slice(0, 5);

    return (
        <View style={{ marginTop: 10 }}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textMain, marginBottom: 0 }]}>{t('driver.duty_history') || 'Recent Duties'}</Text>
                <TouchableOpacity onPress={() => router.push('/(driver)/duty-log')}>
                    <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('overview.view_all')}</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border, justifyContent: 'center', height: 80 }]}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            ) : recentWorks.length > 0 ? (
                <View style={{ gap: 12 }}>
                    {recentWorks.map((work: any) => (
                        <TouchableOpacity
                            key={work.id}
                            style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => router.push({
                                pathname: '/(driver)/duty-details',
                                params: { id: work.id }
                            })}
                        >
                            <View style={[styles.activityIcon, { backgroundColor: (work.status === 'completed' ? colors.success : colors.primary) + '20' }]}>
                                <MaterialCommunityIcons
                                    name={work.status === 'completed' ? "check-circle" : "clock-outline"}
                                    size={24}
                                    color={work.status === 'completed' ? colors.success : colors.primary}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.activityTitle, { color: colors.textMain }]} numberOfLines={1}>
                                    {work.clientName || work.client_name || work.startLocation || work.start_location || work.siteAddress || work.site_address || t('overview.ss_infra_site')}
                                </Text>
                                <Text style={[styles.activityTime, { color: colors.textMuted }]}>
                                    {formatDate(work.startedAt || work.started_at || work.createdAt || work.created_at)} • { (work.totalHours || work.total_hours) ? `${work.totalHours || work.total_hours} hrs` : (work.status === 'completed' ? 'Done' : t('overview.in_progress'))}
                                </Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border, padding: 30, justifyContent: 'center' }]}>
                    <View style={{ alignItems: 'center', gap: 8 }}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={32} color={colors.border} />
                        <Text style={{ color: colors.textMuted, textAlign: 'center', fontWeight: 'bold' }}>{t('overview.no_recent_activity')}</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

function MenuIconButton({ icon, label, onPress, color, colors }: any) {
    return (
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress}>
            <View style={[styles.menuIconBox, { backgroundColor: color + '15' }]}>
                <MaterialCommunityIcons name={icon} size={28} color={color} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.textMain }]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    greeting: { fontSize: 24, fontWeight: '900' },
    subtitle: { fontSize: 13, fontWeight: '500' },
    profileCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    scrollBody: { flex: 1, paddingHorizontal: 24 },
    statusCard: { borderRadius: 12, padding: 24, marginTop: 10, marginBottom: 30 },
    statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    statusLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
    statusValue: { fontSize: 20, fontWeight: '900', marginTop: 4 },
    statusBadgeContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 4, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
    statusIndicatorDot: { width: 8, height: 8, borderRadius: 4 },
    statusBadgeText: { fontWeight: '900', fontSize: 11, letterSpacing: 0.5 },
    timerContainer: { alignItems: 'center', marginVertical: 30 },
    timerValue: { fontSize: 44, fontWeight: '900', letterSpacing: 2, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
    timerSub: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    idleState: { alignItems: 'center', marginVertical: 30, gap: 10 },
    idleText: { fontSize: 14, fontWeight: '600' },
    sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 16 },
    menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 30 },
    menuItem: { width: (width - 60) / 2, borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1 },
    menuIconBox: { width: 56, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    menuLabel: { fontSize: 13, fontWeight: '800' },
    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 30 },
    statItem: { flex: 1, borderRadius: 12, padding: 16, borderWidth: 1 },
    statIcon: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statNb: { fontSize: 20, fontWeight: '900' },
    statLabel: { fontSize: 11, fontWeight: '800', marginBottom: 2, textTransform: 'uppercase' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    activityCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, gap: 16 },
    activityIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    activityTitle: { fontSize: 15, fontWeight: '800' },
    activityTime: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    bottomBar: { position: 'absolute', bottom: 0, width: '100%', padding: 24, borderTopWidth: 1 },
    startBtn: { height: 64, borderRadius: 16, overflow: 'hidden' },
    gradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
    startBtnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
    finishBtn: { height: 64, borderRadius: 16, overflow: 'hidden' },
});
