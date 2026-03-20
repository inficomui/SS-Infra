
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Text, List, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';
import { useGetMySubscriptionQuery } from '@/redux/apis/subscriptionApi';

export default function SettingsScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors } = useAppTheme();
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [soundEnabled, setSoundEnabled] = React.useState(true);
    const [autoSync, setAutoSync] = React.useState(true);

    const { data: subData, isLoading: loadingSub } = useGetMySubscriptionQuery();

    const sub = subData?.subscription;
    const isActive = subData?.isActive ?? false;
    const daysLeft = Math.floor(sub?.daysRemaining ?? 0);
    const totalDays = sub?.plan?.durationDays ?? 30;
    const progress = Math.max(0, Math.min(1, daysLeft / totalDays));

    const statusColor =
        !isActive || sub?.status === 'expired' ? colors.danger
        : daysLeft <= 7 ? colors.danger
        : daysLeft <= 14 ? colors.warning
        : colors.success;

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const planTypeLabel: Record<string, string> = {
        trial: t('settings.trial'),
        monthly: t('settings.monthly'),
        quarterly: t('settings.quarterly'),
        semi_annual: t('settings.semi_annual'),
        annual: t('settings.annual'),
    };

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

                {/* ─── Subscription Card ─── */}
                <View style={styles.subSection}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('settings.my_subscription').toUpperCase()}</Text>

                    {loadingSub ? (
                        <View style={[styles.subCard, { backgroundColor: colors.card, borderColor: colors.border, alignItems: 'center', paddingVertical: 32 }]}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : !isActive || !sub ? (
                        /* ── No Active Subscription ── */
                        <View style={[styles.subCard, { backgroundColor: colors.card, borderColor: colors.danger + '60' }]}>
                            <View style={[styles.subCardHeader, { backgroundColor: colors.danger + '12' }]}>
                                <View style={[styles.subIconCircle, { backgroundColor: colors.danger + '20' }]}>
                                    <MaterialCommunityIcons name="shield-off-outline" size={26} color={colors.danger} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.subPlanName, { color: colors.danger }]}>{t('settings.no_active_plan')}</Text>
                                    <Text style={[styles.subPlanType, { color: colors.textMuted }]}>{t('settings.plan_expired_desc')}</Text>
                                </View>
                                <View style={[styles.statusPill, { backgroundColor: colors.danger + '20' }]}>
                                    <View style={[styles.statusDot, { backgroundColor: colors.danger }]} />
                                    <Text style={[styles.statusText, { color: colors.danger }]}>{t('settings.inactive').toUpperCase()}</Text>
                                </View>
                            </View>
                            <View style={styles.subCardBody}>
                                <Text style={[styles.subExpiredMsg, { color: colors.textMuted }]}>
                                    {t('settings.subscription_restricted_msg')}
                                </Text>
                                <TouchableOpacity
                                    style={[styles.renewButton, { backgroundColor: colors.danger }]}
                                    onPress={() => router.push({ pathname: '/(common)/plans' as any, params: { source: 'expired' } })}
                                >
                                    <MaterialCommunityIcons name="crown-outline" size={16} color="#FFF" />
                                    <Text style={styles.renewButtonText}>{t('settings.view_plans_renew').toUpperCase()}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        /* ── Active Subscription ── */
                        <View style={[styles.subCard, { backgroundColor: colors.card, borderColor: statusColor + '50' }]}>
                            {/* Card Header */}
                            <View style={[styles.subCardHeader, { backgroundColor: statusColor + '0D' }]}>
                                <View style={[styles.subIconCircle, { backgroundColor: statusColor + '20' }]}>
                                    <MaterialCommunityIcons name="crown" size={24} color={statusColor} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.subPlanName, { color: colors.textMain }]}>{sub.plan.name}</Text>
                                    <Text style={[styles.subPlanType, { color: colors.textMuted }]}>
                                        {planTypeLabel[sub.plan.type] ?? sub.plan.type}
                                        {sub.plan.price ? ` · ₹${parseFloat(String(sub.plan.price)).toLocaleString('en-IN')}` : ''}
                                    </Text>
                                </View>
                                <View style={[styles.statusPill, { backgroundColor: statusColor + '20' }]}>
                                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                                    <Text style={[styles.statusText, { color: statusColor }]}>
                                        {sub.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            {/* Progress Bar */}
                            <View style={styles.progressSection}>
                                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${progress * 100}%` as any, backgroundColor: statusColor }
                                        ]}
                                    />
                                </View>
                                <View style={styles.progressLabels}>
                                    <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                                        {formatDate(sub.startDate)}
                                    </Text>
                                    <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                                        {formatDate(sub.endDate)}
                                    </Text>
                                </View>
                            </View>

                            {/* Stats Row */}
                            <View style={styles.subCardBody}>
                                <View style={styles.subStatsRow}>
                                    <SubStat
                                        label={t('settings.days_left')}
                                        value={daysLeft}
                                        icon="calendar-clock"
                                        color={statusColor}
                                        colors={colors}
                                        large
                                    />
                                    <View style={[styles.subStatDivider, { backgroundColor: colors.border }]} />
                                    <SubStat
                                        label={t('settings.expires_on')}
                                        value={formatDate(sub.endDate)}
                                        icon="calendar-remove"
                                        color={colors.textMuted}
                                        colors={colors}
                                    />
                                    <View style={[styles.subStatDivider, { backgroundColor: colors.border }]} />
                                    <SubStat
                                        label={t('settings.plan_duration')}
                                        value={`${sub.plan.durationDays ?? '—'}d`}
                                        icon="timer-outline"
                                        color={colors.primary}
                                        colors={colors}
                                    />
                                </View>

                                {/* Expiry Warning */}
                                {daysLeft <= 14 && (
                                    <View style={[styles.expiryWarning, { backgroundColor: statusColor + '15', borderColor: statusColor + '40' }]}>
                                        <MaterialCommunityIcons name="clock-alert-outline" size={16} color={statusColor} />
                                        <Text style={[styles.expiryWarningText, { color: statusColor }]}>
                                            {daysLeft <= 3
                                                ? t('settings.expiry_warning_urgent', { days: daysLeft })
                                                : t('settings.expiry_warning_normal', { days: daysLeft })}
                                        </Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={[styles.renewButton, { backgroundColor: daysLeft <= 14 ? statusColor : colors.primary + '15', borderWidth: daysLeft <= 14 ? 0 : 1, borderColor: colors.primary }]}
                                    onPress={() => router.push({
                                        pathname: '/(common)/plans' as any,
                                        params: { source: daysLeft <= 0 ? 'expired' : 'renew' }
                                    })}
                                >
                                    <MaterialCommunityIcons name="refresh" size={16} color={daysLeft <= 14 ? '#FFF' : colors.primary} />
                                    <Text style={[styles.renewButtonText, { color: daysLeft <= 14 ? '#FFF' : colors.primary }]}>
                                        {daysLeft <= 14 ? t('settings.renew_now').toUpperCase() : t('settings.upgrade_plan').toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* ─── General Settings ─── */}
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

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

function SubStat({ label, value, icon, color, colors, large }: any) {
    return (
        <View style={styles.subStat}>
            <MaterialCommunityIcons name={icon} size={16} color={color} style={{ marginBottom: 4 }} />
            <Text style={[styles.subStatValue, { color: colors.textMain, fontSize: large ? 22 : 14 }]}>
                {value}
            </Text>
            <Text style={[styles.subStatLabel, { color: colors.textMuted }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    iconButton: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { paddingHorizontal: 20, paddingTop: 8 },
    sectionTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
    subSection: { marginBottom: 24 },
    section: { paddingVertical: 16, borderBottomWidth: 1 },

    // Subscription Card
    subCard: { borderRadius: 16, borderWidth: 1.5, overflow: 'hidden' },
    subCardHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    subIconCircle: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    subPlanName: { fontSize: 17, fontWeight: '900', letterSpacing: 0.3 },
    subPlanType: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    statusPill: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

    // Progress
    progressSection: { paddingHorizontal: 16, paddingBottom: 4 },
    progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
    progressFill: { height: '100%', borderRadius: 3 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    progressLabel: { fontSize: 10, fontWeight: '600' },

    // Stats
    subCardBody: { padding: 16, paddingTop: 12 },
    subStatsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    subStat: { flex: 1, alignItems: 'center' },
    subStatValue: { fontWeight: '900', letterSpacing: 0.3 },
    subStatLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },
    subStatDivider: { width: 1, height: 40 },

    // Expiry warning inside card
    expiryWarning: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 8,
        borderRadius: 8, padding: 12, borderWidth: 1, marginBottom: 14
    },
    expiryWarningText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 18 },

    // Expired message
    subExpiredMsg: { fontSize: 13, fontWeight: '500', lineHeight: 20, marginBottom: 16 },

    // Renew button
    renewButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 13, borderRadius: 10,
    },
    renewButtonText: { fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
});
