import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Platform } from 'react-native';
import { Text, Badge, ActivityIndicator, Modal, Portal } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useGetActiveWorkQuery, useGetWorkHistoryQuery } from '@/redux/apis/workApi';
import { useGetNotificationsQuery, Notification as ApiNotification } from '@/redux/apis/notificationApi';
import { useGetMachinesQuery, Machine } from '@/redux/apis/ownerApi';
import { useAppTheme } from '@/hooks/use-theme-color';
import { storage } from '@/redux/storage';
import { formatDate, formatDuration, resolveImageUrl } from '../../utils/formatters';

const { width } = Dimensions.get('window');

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export default function OperatorOverview() {
    const router = useRouter();
    const { colors, isDark } = useAppTheme();
    const params = useLocalSearchParams();

    // Local Pause Logic
    const [isPaused, setIsPaused] = useState(false);
    const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
    const [totalPausedSeconds, setTotalPausedSeconds] = useState(0);

    const [workStatus, setWorkStatus] = useState<'idle' | 'running' | 'paused'>('idle');
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [activeWorkId, setActiveWorkId] = useState<string | null>(null);
    const [currentClient, setCurrentClient] = useState<any>(null);

    // Machine Logic
    const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
    const [showMachineModal, setShowMachineModal] = useState(false);
    const { data: machinesData, isLoading: isLoadingMachines } = useGetMachinesQuery();
    // console.log(JSON.stringify(machinesData));

    // Active Work Query
    const {
        data: activeWorkData,
        isLoading: isLoadingActive,
        refetch: refetchActive
    } = useGetActiveWorkQuery(undefined, {
        pollingInterval: 30000,
    });

    // Today's Stats Query
    const todayStr = new Date().toISOString().split('T')[0];
    const {
        data: todayStatsData,
        isLoading: isLoadingStats,
        refetch: refetchStats
    } = useGetWorkHistoryQuery({
        from: todayStr,
        to: todayStr
    });

    const { data: notificationsData, refetch: refetchNotifications } = useGetNotificationsQuery();

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            refetchActive();
            refetchStats();
            refetchNotifications();

            // Load selected machine
            const loadMachine = async () => {
                try {
                    const stored = await storage.getItem('selected_machine');
                    if (stored) {
                        setSelectedMachine(JSON.parse(stored));
                    }
                } catch (e) {
                    // Failed to load machine, continue without it
                }
            };
            loadMachine();
        }, [])
    );

    const allNotifications = notificationsData?.notifications || notificationsData?.data || [];
    const unreadCount = allNotifications.filter((n: ApiNotification) => !n.isRead && !n.is_read).length || 0;

    const intervalRef = useRef<number | null>(null);

    // --- Derived Stats Calculation ---
    // 1. Completed hours from history
    const completedHours = todayStatsData?.workSessions?.reduce((acc, session) => acc + Number(session.totalHours || 0), 0) || 0;

    // 2. Active hours (live)
    const activeHours = activeWorkId ? (elapsedSeconds / 3600) : 0;

    // 3. Total Today
    const totalTodayHours = (Number(completedHours) + Number(activeHours));

    // 4. Tasks Count (Completed + 1 if active)
    const completedTasksCount = todayStatsData?.workSessions?.length || 0;
    // If there is an active session, it might optionally be counted as a "task in progress"
    // For now, let's just show completed tasks count, or maybe completed + active if meaningful.
    // Let's stick to "Tasks Done" -> Completed only.
    const tasksDoneCount = completedTasksCount;


    // Load pause state from storage
    useEffect(() => {
        const loadPauseState = async () => {
            if (!activeWorkId) return;
            try {
                // Check if currently paused
                const storedPauseStart = await storage.getItem(`pause_start_${activeWorkId}`);
                if (storedPauseStart) {
                    setIsPaused(true);
                    setPauseStartTime(parseInt(storedPauseStart));
                    setWorkStatus('paused');
                } else {
                    setIsPaused(false);
                    setPauseStartTime(null);
                    setWorkStatus('running');
                }

                // Load total accumulated pause duration
                const storedTotalPaused = await storage.getItem(`total_paused_${activeWorkId}`);
                if (storedTotalPaused) {
                    setTotalPausedSeconds(parseInt(storedTotalPaused));
                } else {
                    setTotalPausedSeconds(0);
                }
            } catch (e) {
                console.error("Failed to load pause state", e);
            }
        };
        loadPauseState();
    }, [activeWorkId]);

    useEffect(() => {
        if (activeWorkData?.success && activeWorkData.workSession) {
            const session = activeWorkData.workSession;
            // Only set status based on backend if not locally overridden by pause
            if (session.status === 'in_progress') {
                setActiveWorkId(session.id.toString());
                setCurrentClient({
                    clientName: session.clientName,
                    location: session.siteAddress,
                });
                // Status is managed by local pause state, so we don't overwrite it here blindly
                if (!isPaused) setWorkStatus('running');
            } else {
                setWorkStatus('idle');
                setActiveWorkId(null);
                setCurrentClient(null);
                setElapsedSeconds(0);
                setIsPaused(false);
            }
        } else if (activeWorkData?.success && !activeWorkData.workSession) {
            setWorkStatus('idle');
            setActiveWorkId(null);
            setCurrentClient(null);
            setElapsedSeconds(0);
            setIsPaused(false);
        }
    }, [activeWorkData]);

    // Timer Logic
    useEffect(() => {
        const updateTimer = () => {
            if (!activeWorkData?.workSession || !activeWorkId) return;

            const start = new Date(activeWorkData.workSession.startedAt).getTime();
            const now = new Date().getTime();
            let diff = Math.floor((now - start) / 1000);

            // Subtract total paused time
            diff -= totalPausedSeconds;

            // If currently paused, subtract current pause duration too
            if (isPaused && pauseStartTime) {
                const currentPauseDuration = Math.floor((now - pauseStartTime) / 1000);
                diff -= currentPauseDuration;
            }

            setElapsedSeconds(diff > 0 ? diff : 0);
        };

        if (activeWorkId) {
            // Update immediately
            updateTimer();
            // Interval
            intervalRef.current = setInterval(updateTimer, 1000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [activeWorkId, totalPausedSeconds, isPaused, pauseStartTime, activeWorkData]);

    // Handle Params
    useEffect(() => {
        if (params.workStarted === 'true') {
            refetchActive();
            refetchStats();
            router.setParams({ workStarted: 'false' });
        }
    }, [params.workStarted]);


    const handlePause = async () => {
        if (!activeWorkId) return;
        try {
            const now = Date.now();
            await storage.setItem(`pause_start_${activeWorkId}`, now.toString());
            setPauseStartTime(now);
            setIsPaused(true);
            setWorkStatus('paused');
        } catch (error) {
            Alert.alert("Error", "Failed to pause work locally.");
        }
    };

    const handleResume = async () => {
        if (!activeWorkId || !pauseStartTime) return;
        try {
            const now = Date.now();
            const pauseDuration = Math.floor((now - pauseStartTime) / 1000);

            const newTotal = totalPausedSeconds + pauseDuration;
            await storage.setItem(`total_paused_${activeWorkId}`, newTotal.toString());
            await storage.removeItem(`pause_start_${activeWorkId}`);

            setTotalPausedSeconds(newTotal);
            setPauseStartTime(null);
            setIsPaused(false);
            setWorkStatus('running');
        } catch (error) {
            Alert.alert("Error", "Failed to resume work locally.");
        }
    };

    const handleFinish = async () => {
        Alert.alert(
            "Finish Work?",
            "End your current work session and submit logs?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Finish",
                    style: "destructive",
                    onPress: async () => {
                        // Cleanup storage for this session
                        if (activeWorkId) {
                            await storage.removeItem(`pause_start_${activeWorkId}`);
                            await storage.removeItem(`total_paused_${activeWorkId}`);
                        }

                        router.push({
                            pathname: '/(operator)/finish-work',
                            params: {
                                workId: activeWorkId,
                                elapsedSeconds: elapsedSeconds.toString()
                            }
                        });
                        setWorkStatus('idle');
                        setElapsedSeconds(0);
                        setActiveWorkId(null);
                        router.setParams({ workStarted: 'false' });
                    }
                }
            ]
        );
    };

    const handleSelectMachine = async (machine: Machine) => {
        try {
            setSelectedMachine(machine);
            await storage.setItem('selected_machine', JSON.stringify(machine));
            setShowMachineModal(false);
        } catch (error) {
            Alert.alert("Error", "Failed to save machine selection.");
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, { color: colors.textMain }]}>Performance Hub</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>Tracking your daily milestones</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity onPress={() => router.push('/(operator)/notifications' as any)}>
                        <View style={[styles.profileCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <MaterialCommunityIcons name="bell-outline" size={26} color={colors.textMain} />
                            {unreadCount > 0 && (
                                <View style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, borderWidth: 1, borderColor: colors.card }} />
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/(operator)/profile' as any)}>
                        <View style={[styles.profileCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <MaterialCommunityIcons name="account" size={26} color={colors.primary} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>

                {/* Status Card */}
                <LinearGradient
                    colors={isDark ? ['#1A1A1A', '#000000'] : ['#FFFFFF', '#F3F4F6']}
                    style={[styles.statusCard, { borderColor: colors.border, borderWidth: 1 }]}
                >
                    <View style={styles.statusHeader}>
                        <View>
                            <Text style={[styles.statusLabel, { color: colors.textMuted }]}>Current Session</Text>
                            <Text style={[styles.statusValue, { color: colors.textMain }]}>
                                {workStatus === 'idle' ? 'No Active Task' : (currentClient?.clientName || 'SS Infra Site')}
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.statusBadgeContainer,
                                { backgroundColor: workStatus === 'running' ? colors.success + '20' : (workStatus === 'paused' ? colors.warning + '20' : colors.border + '20') }
                            ]}
                        >
                            <View style={[styles.statusIndicatorDot, { backgroundColor: workStatus === 'running' ? colors.success : (workStatus === 'paused' ? colors.warning : colors.textMuted) }]} />
                            <Text style={[styles.statusBadgeText, { color: workStatus === 'running' ? colors.success : (workStatus === 'paused' ? colors.warning : colors.textMuted) }]}>
                                {workStatus.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    {workStatus !== 'idle' ? (
                        <View style={styles.timerContainer}>
                            <Text style={[styles.timerValue, { color: colors.primary }]}>{formatTime(elapsedSeconds)}</Text>
                            <Text style={[styles.timerSub, { color: colors.textMuted }]}>TRACKING ACTIVE DURATION</Text>
                        </View>
                    ) : (
                        <View style={styles.idleState}>
                            <MaterialCommunityIcons name="lightning-bolt" size={40} color={colors.primary} />
                            <Text style={[styles.idleText, { color: colors.textMuted }]}>Ready to pick up new work?</Text>
                        </View>
                    )}

                    <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
                        <StatItem
                            icon="clock-check"
                            label="Today's Hours"
                            value={formatDuration(totalTodayHours)}
                            colors={colors}
                            loading={isLoadingStats}
                        />
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <StatItem
                            icon="map-marker-path"
                            label="Tasks Done"
                            value={`${tasksDoneCount} Sites`}
                            colors={colors}
                            loading={isLoadingStats}
                        />
                    </View>
                </LinearGradient>

                {/* Machine Selection Card */}
                <TouchableOpacity
                    style={[styles.machineCard, { backgroundColor: colors.card, borderColor: selectedMachine ? colors.primary : colors.border }]}
                    onPress={() => setShowMachineModal(true)}
                >
                    <View style={styles.machineIconBox}>
                        <MaterialCommunityIcons name="excavator" size={24} color={selectedMachine ? colors.primary : colors.textMuted} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.machineLabel, { color: colors.textMuted }]}>Current Machine</Text>
                        <Text style={[styles.machineValue, { color: selectedMachine ? colors.textMain : colors.textMuted }]}>
                            {selectedMachine ? `${selectedMachine?.name || 'Unknown Machine'} (${selectedMachine?.registration_number || selectedMachine.registrationNumber || "No Reg Number"})` : 'Tap to assign machine'}
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-down" size={24} color={colors.textMuted} />
                </TouchableOpacity>

                {/* Grid Menu */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Operations</Text>
                <View style={styles.menuGrid}>
                    <MenuIconButton
                        icon="account-multiple-plus"
                        label="Clients"
                        onPress={() => router.push('/(operator)/add-client')}
                        color="#3B82F6"
                        colors={colors}
                    />
                    <MenuIconButton
                        icon="chart-timeline-variant"
                        label="Work Log"
                        onPress={() => router.push('/(operator)/work-log')}
                        color={colors.success}
                        colors={colors}
                    />
                    <MenuIconButton
                        icon="wallet-outline"
                        label="Wallet"
                        onPress={() => router.push('/(operator)/wallet' as any)}
                        color={colors.primary}
                        colors={colors}
                    />
                    <MenuIconButton
                        icon="gas-station"
                        label="Fuel"
                        onPress={() => router.push('/(operator)/fuel' as any)}
                        color={colors.warning}
                        colors={colors}
                    />
                    <MenuIconButton
                        icon="hammer-wrench"
                        label="Maintenance"
                        onPress={() => router.push('/(operator)/maintenance' as any)}
                        color={colors.primary}
                        colors={colors}
                    />
                    <MenuIconButton
                        icon="star-outline"
                        label="Plans"
                        onPress={() => router.push('/(common)/plans' as any)}
                        color={colors.warning}
                        colors={colors}
                    />
                </View>

                {/* History */}
                <RecentActivity router={router} colors={colors} />

                <View style={{ height: 160 }} />
            </ScrollView>

            <Portal>
                <Modal
                    visible={showMachineModal}
                    onDismiss={() => setShowMachineModal(false)}
                    contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.background }]}
                >
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.textMain }]}>Select Machine</Text>
                        <TouchableOpacity onPress={() => setShowMachineModal(false)}>
                            <MaterialCommunityIcons name="close" size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ maxHeight: 400 }}>
                        {isLoadingMachines ? (
                            <ActivityIndicator color={colors.primary} style={{ margin: 20 }} />
                        ) : machinesData?.machines?.map((machine) => (
                            <TouchableOpacity
                                key={machine.id}
                                style={[
                                    styles.machineItem,
                                    {
                                        backgroundColor: selectedMachine?.id === machine.id ? colors.primary + '15' : 'transparent',
                                        borderColor: selectedMachine?.id === machine.id ? colors.primary : colors.border
                                    }
                                ]}
                                onPress={() => handleSelectMachine(machine)}
                            >
                                <View style={[styles.machineItemIcon, { backgroundColor: selectedMachine?.id === machine.id ? colors.primary : colors.border }]}>
                                    <MaterialCommunityIcons name="excavator" size={20} color={selectedMachine?.id === machine.id ? '#FFF' : colors.textMuted} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.machineItemName, { color: colors.textMain }]}>{machine.name}</Text>
                                    <Text style={[styles.machineItemSub, { color: colors.textMuted }]}>{machine.registration_number}</Text>
                                </View>
                                {selectedMachine?.id === machine.id && (
                                    <MaterialCommunityIcons name="check-circle" size={24} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                        {machinesData?.success && machinesData.machines.length === 0 && (
                            <Text style={{ textAlign: 'center', padding: 20, color: colors.textMuted }}>No machines found.</Text>
                        )}
                    </ScrollView>
                </Modal>
            </Portal>

            {/* Persistent Bottom Controls */}
            <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                {workStatus === 'idle' ? (
                    <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/(operator)/start-work-form')}>
                        <LinearGradient colors={[colors.primary, colors.primary]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <MaterialCommunityIcons name="play" size={28} color="#000" />
                            <Text style={styles.startBtnText}>START NEW SESSION</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.activeControls}>
                        <TouchableOpacity
                            style={[styles.controlBtn, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}
                            onPress={workStatus === 'running' ? handlePause : handleResume}
                        >
                            <MaterialCommunityIcons name={workStatus === 'running' ? "pause" : "play"} size={26} color={colors.warning} />
                            <Text style={[styles.controlText, { color: colors.warning }]}>{workStatus === 'running' ? 'PAUSE' : 'RESUME'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
                            <LinearGradient colors={[colors.danger, '#B91C1C']} style={styles.gradient}>
                                <MaterialCommunityIcons name="stop" size={26} color="#FFF" />
                                <Text style={[styles.startBtnText, { color: '#FFF' }]}>FINISH WORK</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

function StatItem({ icon, label, value, colors, loading }: any) {
    return (
        <View style={styles.statItem}>
            <View style={styles.statTop}>
                <MaterialCommunityIcons name={icon} size={16} color={colors.primary} />
                {loading ? (
                    <ActivityIndicator size={16} color={colors.textMain} style={{ marginLeft: 6 }} />
                ) : (
                    <Text style={[styles.statValue, { color: colors.textMain }]}>{value}</Text>
                )}
            </View>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
        </View>
    );
}


function RecentActivity({ router, colors }: any) {
    const { data, isLoading, refetch } = useGetWorkHistoryQuery({ page: 1, limit: 1 });
    const latestWork = data?.workSessions?.[0];

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [])
    );

    return (
        <View>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Recent Activity</Text>
                <TouchableOpacity onPress={() => router.push('/(operator)/work-log')}>
                    <Text style={{ color: colors.primary, fontWeight: '700' }}>View All</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border, justifyContent: 'center', height: 80 }]}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            ) : latestWork ? (
                <TouchableOpacity
                    style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => router.push({
                        pathname: '/(operator)/work-details',
                        params: { id: latestWork.id }
                    })}
                >
                    <View style={[styles.activityIcon, { backgroundColor: colors.success + '20' }]}>
                        <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.activityTitle, { color: colors.textMain }]}>{latestWork.clientName}</Text>
                        <Text style={[styles.activityTime, { color: colors.textMuted }]}>
                            {formatDate(latestWork.createdAt)} • {formatDuration(latestWork.totalHours || 0)} Logged
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
                </TouchableOpacity>
            ) : (
                <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border, padding: 24, justifyContent: 'center' }]}>
                    <Text style={{ color: colors.textMuted, textAlign: 'center' }}>No recent activity found.</Text>
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
    statusCard: { borderRadius: 4, padding: 24, marginTop: 10, marginBottom: 30 },
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
    statsRow: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 20, marginTop: 10 },
    statItem: { flex: 1, alignItems: 'center' },
    statTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statValue: { fontSize: 16, fontWeight: '900' },
    statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
    statDivider: { width: 1, height: 30 },
    sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 16 },
    menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 30 },
    menuItem: { width: (width - 60) / 2, borderRadius: 4, padding: 20, alignItems: 'center', borderWidth: 1 },
    menuIconBox: { width: 56, height: 56, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    menuLabel: { fontSize: 14, fontWeight: '800' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    activityCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 4, borderWidth: 1, gap: 16 },
    activityIcon: { width: 48, height: 48, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
    activityTitle: { fontSize: 15, fontWeight: '800' },
    activityTime: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    bottomBar: { position: 'absolute', bottom: 0, width: '100%', padding: 24, borderTopWidth: 1 },
    startBtn: { height: 64, borderRadius: 4, overflow: 'hidden' },
    gradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
    startBtnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
    activeControls: { flexDirection: 'row', gap: 12, height: 64 },
    controlBtn: { flex: 1, borderRadius: 4, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    controlText: { fontWeight: '900', fontSize: 14 },
    finishBtn: { flex: 1.5, borderRadius: 4, overflow: 'hidden' },

    // Machine Card Styles
    machineCard: { padding: 16, borderRadius: 4, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 30 },
    machineIconBox: { width: 44, height: 44, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
    machineLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 2 },
    machineValue: { fontSize: 16, fontWeight: '900' },
    modalContainer: { margin: 20, padding: 20, borderRadius: 4 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 20, fontWeight: '900' },
    machineItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 4, marginBottom: 8, borderWidth: 1, gap: 12 },
    machineItemIcon: { width: 40, height: 40, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
    machineItemName: { fontSize: 14, fontWeight: '800' },
    machineItemSub: { fontSize: 12 }
});