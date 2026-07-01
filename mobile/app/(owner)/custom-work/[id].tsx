import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetCustomWorkByIdQuery, CustomWork } from '@/redux/apis/customWorkApi';
import { resolveImageUrl, formatDate } from '@/utils/formatters';

export default function OwnerCustomWorkDetailsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { id, data: paramData } = useLocalSearchParams<{ id: string; data?: string }>();
    const { colors } = useAppTheme();

    const initialData = paramData ? JSON.parse(paramData) : null;
    const { data: apiData, isLoading } = useGetCustomWorkByIdQuery(id || '');

    const work: CustomWork | null = apiData?.data || apiData?.customWork || initialData;

    if (isLoading && !work) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }

    if (!work) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.textMain }}>Custom work record not found.</Text>
            </View>
        );
    }

    const beforeImg = resolveImageUrl(work.beforeImage);
    const afterImg = resolveImageUrl(work.afterImage);

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Completed': return t('custom_work.status_completed') || 'Completed';
            case 'In Progress': return t('custom_work.status_in_progress') || 'In Progress';
            case 'Started': return t('custom_work.status_started') || 'Started';
            case 'Draft': return t('custom_work.status_draft') || 'Draft';
            default: return status;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('custom_work.details_title') || 'Custom Work Details'}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[styles.workTitle, { color: colors.textMain }]}>{work.workName}</Text>
                        <View style={[styles.statusChip, { backgroundColor: work.status === 'Completed' ? colors.success + '20' : colors.warning + '20' }]}>
                            <Text style={[styles.statusText, { color: work.status === 'Completed' ? colors.success : colors.warning }]}>{getStatusLabel(work.status)}</Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <InfoRow icon="account-hard-hat" label={t('common.operator') || "Operator"} value={work.operatorName || 'Assigned Worker'} colors={colors} />
                    <InfoRow icon="account" label={t('common.client') || "Client"} value={work.clientName || 'N/A'} colors={colors} />
                    <InfoRow icon="excavator" label={t('common.machine') || "Machine"} value={work.machineName || 'Fleet Equipment'} colors={colors} />
                    <InfoRow icon="map-marker" label={t('custom_work.gps_location') || "GPS Location"} value={work.workLocation || 'N/A'} colors={colors} />
                    <InfoRow icon="calendar" label={t('custom_work.date_logged') || "Date Logged"} value={work.createdAt ? formatDate(work.createdAt) : 'N/A'} colors={colors} />
                    <InfoRow icon="currency-inr" label={t('custom_work.final_earnings') || "Final Earnings"} value={`₹${Number(work.workCost || 0).toLocaleString('en-IN')}`} colors={colors} highlight />
                </View>

                {/* Photos */}
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('custom_work.photos_title') || 'WORK EVIDENCE & PHOTOS'}</Text>
                <View style={{ gap: 16 }}>
                    <View style={[styles.photoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.photoTitle, { color: colors.textMain }]}>{t('custom_work.before_photo') || 'Before Work Photo'}</Text>
                        {beforeImg ? (
                            <Image source={{ uri: beforeImg }} style={styles.photoImg} resizeMode="cover" />
                        ) : (
                            <View style={styles.noPhotoBox}>
                                <MaterialCommunityIcons name="image-off" size={32} color={colors.textMuted} />
                                <Text style={{ color: colors.textMuted, marginTop: 4 }}>{t('custom_work.no_before_photo') || 'No Before Photo Available'}</Text>
                            </View>
                        )}
                    </View>

                    <View style={[styles.photoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.photoTitle, { color: colors.textMain }]}>{t('custom_work.after_photo') || 'After Work Completion Photo'}</Text>
                        {afterImg ? (
                            <Image source={{ uri: afterImg }} style={styles.photoImg} resizeMode="cover" />
                        ) : (
                            <View style={styles.noPhotoBox}>
                                <MaterialCommunityIcons name="image-off" size={32} color={colors.textMuted} />
                                <Text style={{ color: colors.textMuted, marginTop: 4 }}>{t('custom_work.no_after_photo') || 'Work not yet completed or no photo taken'}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

function InfoRow({ icon, label, value, colors, highlight }: any) {
    return (
        <View style={styles.infoRow}>
            <MaterialCommunityIcons name={icon} size={20} color={highlight ? colors.success : colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}:</Text>
            <Text style={[styles.infoVal, { color: highlight ? colors.success : colors.textMain, fontWeight: highlight ? '900' : '700' }]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
    card: { borderRadius: 16, borderWidth: 1, padding: 20, gap: 12 },
    workTitle: { fontSize: 20, fontWeight: '900', flex: 1 },
    statusChip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: '800' },
    divider: { height: 1, marginVertical: 4 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    infoLabel: { fontSize: 13, fontWeight: '600' },
    infoVal: { fontSize: 14, flex: 1, textAlign: 'right' },
    sectionTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 0.5, marginTop: 24, marginBottom: 12 },
    photoCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
    photoTitle: { fontSize: 14, fontWeight: '800' },
    photoImg: { width: '100%', height: 200, borderRadius: 10 },
    noPhotoBox: { height: 140, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
});
