import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text, ActivityIndicator, Divider, Surface } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';
import { FuelLog, useGetFuelLogsQuery } from '@/redux/apis/fuelApi';
import { resolveImageUrl } from '../../../utils/imageHelpers';
import ImagePreviewModal from '@/components/ui/ImagePreviewModal';

const { width, height } = Dimensions.get('window');

export default function FuelDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors } = useAppTheme();
    const { t } = useTranslation();

    const { data: logsData, isLoading } = useGetFuelLogsQuery({});

    const log = useMemo(() => {
        if (!logsData) return null;
        const list = logsData.logs || logsData.data?.data || [];
        return list.find((l: FuelLog) => l.id.toString() === id);
    }, [logsData, id]);

    const [previewVisible, setPreviewVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);

    const openPreview = (url: string | undefined) => {
        if (!url) return;
        const resolved = resolveImageUrl(url);
        if (resolved) {
            setSelectedImage(resolved);
            setPreviewVisible(true);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!log) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={64} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, marginTop: 16 }}>{t('fuel_management.log_not_found')}</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{t('fuel_management.go_back')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const beforeImage = log.readingBeforeUrl || log.reading_before_url;
    const afterImage = log.readingAfterUrl || log.reading_after_url;

    const renderInfoRow = (icon: string, label: string, value: string, subValue?: string) => (
        <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                <MaterialCommunityIcons name={icon as any} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: colors.textMain }]}>{value}</Text>
                {subValue && <Text style={[styles.infoSubValue, { color: colors.textMuted }]}>{subValue}</Text>}
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ImagePreviewModal
                visible={previewVisible}
                imageUrl={selectedImage || null}
                onClose={() => setPreviewVisible(false)}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('fuel_management.details_title')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Surface style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]} elevation={2}>
                    <View style={styles.amountSection}>
                        <Text style={[styles.amountLabel, { color: colors.textMuted }]}>{t('fuel_management.total_amount')}</Text>
                        <Text style={[styles.amountValue, { color: colors.textMain }]}>₹{log.amount}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                            <Text style={[styles.statusText, { color: colors.success }]}>{t('fuel_management.verified')}</Text>
                        </View>
                    </View>
                    <Divider style={{ marginVertical: 20, backgroundColor: colors.border, opacity: 0.5 }} />
                    <View style={styles.quickStats}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('fuel_management.fuel_volume')}</Text>
                            <Text style={[styles.statValue, { color: colors.textMain }]}>{log.fuelLiters || log.fuel_liters} L</Text>
                        </View>
                        <View style={[styles.verticalDivider, { backgroundColor: colors.border, opacity: 0.3 }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('fuel_management.date')}</Text>
                            <Text style={[styles.statValue, { color: colors.textMain }]}>
                                {new Date(log.logDate || log.log_date || '').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </Text>
                        </View>
                    </View>
                </Surface>

                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{t('fuel_management.transaction_details')}</Text>
                <View style={[styles.detailsList, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {renderInfoRow('engine', t('fuel_management.machine'), log.machine?.name || 'N/A', log.machine?.registrationNumber || log.machine?.registration_number)}
                    <Divider style={styles.listDivider} />
                    {renderInfoRow('account-tie', t('fuel_management.operator'), log.operator?.name || 'N/A')}
                    <Divider style={styles.listDivider} />
                    {renderInfoRow('calendar-clock', t('fuel_management.date_time'), new Date(log.logDate || log.log_date || '').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))}
                </View>

                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{t('fuel_management.meter_readings')}</Text>
                <View style={styles.imageGrid}>
                    <View style={styles.imageContainer}>
                        <Text style={[styles.imageLabel, { color: colors.textMuted }]}>{t('fuel_management.before_filling')}</Text>
                        <Surface style={[styles.imageWrapper, { backgroundColor: colors.card, borderColor: colors.border }]} elevation={1}>
                            {beforeImage ? (
                                <TouchableOpacity onPress={() => openPreview(beforeImage)} activeOpacity={0.9} style={{ flex: 1 }}>
                                    <Image source={{ uri: resolveImageUrl(beforeImage) || '' }} style={styles.image} resizeMode="cover" />
                                </TouchableOpacity>
                            ) : <View style={styles.noImage}><MaterialCommunityIcons name="image-off" size={32} color={colors.textMuted} /></View>}
                        </Surface>
                    </View>
                    <View style={styles.imageContainer}>
                        <Text style={[styles.imageLabel, { color: colors.textMuted }]}>{t('fuel_management.after_filling')}</Text>
                        <Surface style={[styles.imageWrapper, { backgroundColor: colors.card, borderColor: colors.border }]} elevation={1}>
                            {afterImage ? (
                                <TouchableOpacity onPress={() => openPreview(afterImage)} activeOpacity={0.9} style={{ flex: 1 }}>
                                    <Image source={{ uri: resolveImageUrl(afterImage) || '' }} style={styles.image} resizeMode="cover" />
                                </TouchableOpacity>
                            ) : <View style={styles.noImage}><MaterialCommunityIcons name="image-off" size={32} color={colors.textMuted} /></View>}
                        </Surface>
                    </View>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backButton: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollContent: { padding: 24 },
    summaryCard: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 32 },
    amountSection: { alignItems: 'center' },
    amountLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
    amountValue: { fontSize: 36, fontWeight: '900', marginBottom: 12 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '900' },
    quickStats: { flexDirection: 'row', alignItems: 'center' },
    statItem: { flex: 1, alignItems: 'center' },
    verticalDivider: { width: 1, height: 30 },
    statLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
    statValue: { fontSize: 16, fontWeight: '900' },
    sectionTitle: { fontSize: 16, fontWeight: '900', marginBottom: 16, marginLeft: 4 },
    detailsList: { borderRadius: 24, borderWidth: 1, padding: 8, marginBottom: 32 },
    infoRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 16 },
    iconBox: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    infoLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    infoValue: { fontSize: 15, fontWeight: '800' },
    infoSubValue: { fontSize: 12, fontWeight: '600' },
    listDivider: { marginHorizontal: 12 },
    imageGrid: { flexDirection: 'row', gap: 16 },
    imageContainer: { flex: 1 },
    imageLabel: { fontSize: 12, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
    imageWrapper: { height: 180, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
    image: { width: '100%', height: '100%' },
    noImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
    closePreviewBtn: { position: 'absolute', top: 50, right: 24, zIndex: 10, width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    fullPreviewImage: { width: width, height: height * 0.7 }
});
