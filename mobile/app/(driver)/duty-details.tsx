import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetWorkDetailsQuery } from '@/redux/apis/workApi';
import { formatDate, formatDuration } from '@/utils/formatters';
import { resolveImageUrl } from '@/utils/imageHelpers';
import ImagePreviewModal from '@/components/ui/ImagePreviewModal';

export default function DutyDetailsScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { id } = useLocalSearchParams();
    const { colors } = useAppTheme();
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

    const { data: detailData, isLoading, error } = useGetWorkDetailsQuery(Number(id), { skip: !id });

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const duty = detailData?.workSession;

    if (!duty) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.textMuted }}>{error ? 'Error loading duty details' : 'No duty data found'}</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ImagePreviewModal
                visible={previewVisible}
                imageUrl={selectedImage}
                onClose={() => setPreviewVisible(false)}
            />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('driver.duty_details') || 'Duty Details'}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Surface style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]} elevation={1}>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusBadge, { backgroundColor: duty.status === 'completed' ? colors.success + '20' : colors.primary + '20' }]}>
                            <Text style={{ color: duty.status === 'completed' ? colors.success : colors.primary, fontWeight: 'bold' }}>
                                {duty.status?.toUpperCase() || 'IN PROGRESS'}
                            </Text>
                        </View>
                        <Text style={[styles.dateText, { color: colors.textMuted }]}>{formatDate(duty.createdAt)}</Text>
                    </View>

                    <View style={styles.infoSection}>
                        {(duty.clientName || duty.client_name) && (
                            <DetailItem icon="account-outline" label="Client" value={duty.clientName || duty.client_name} colors={colors} />
                        )}
                        <DetailItem icon="map-marker-outline" label="Start Location" value={duty.startLocation || duty.start_location || duty.siteAddress || duty.site_address || 'N/A'} colors={colors} />
                        {(duty.endLocation || duty.end_location) && <DetailItem icon="map-marker-check-outline" label="End Location" value={duty.endLocation || duty.end_location} colors={colors} />}
                        <DetailItem icon="counter" label="Start Meter" value={duty.startMeterReading || duty.start_meter_reading || 'N/A'} colors={colors} />
                        {(duty.endMeterReading || duty.end_meter_reading) && <DetailItem icon="counter" label="End Meter" value={duty.endMeterReading || duty.end_meter_reading} colors={colors} />}
                        <DetailItem icon="clock-outline" label="Duration" value={duty.totalHours ? formatDuration(duty.totalHours) : 'Tracking...'} colors={colors} />
                        <DetailItem icon="calendar-clock" label="Started At" value={new Date(duty.startedAt).toLocaleString()} colors={colors} />
                        {duty.finishedAt && (
                           <DetailItem icon="calendar-check" label="Finished At" value={new Date(duty.finishedAt).toLocaleString()} colors={colors} />
                        )}
                        {duty.notes && <DetailItem icon="note-text-outline" label="Notes" value={duty.notes} colors={colors} />}
                    </View>
                </Surface>

                <Surface style={[styles.photoCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 20 }]} elevation={1}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Meter Photos</Text>
                    <View style={styles.photoGrid}>
                        <View style={styles.photoBox}>
                            {duty.startMeterPhotoUrl || duty.beforePhotoUrl || duty.start_meter_photo_url || duty.before_photo_url ? (
                                <TouchableOpacity 
                                    onPress={() => openPreview(duty.startMeterPhotoUrl || duty.beforePhotoUrl || duty.start_meter_photo_url || duty.before_photo_url)}
                                    activeOpacity={0.9}
                                    style={styles.fullImage}
                                >
                                    <Image 
                                        source={{ uri: resolveImageUrl(duty.startMeterPhotoUrl || duty.beforePhotoUrl || duty.start_meter_photo_url || duty.before_photo_url) || '' }} 
                                        style={styles.fullImage} 
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="camera-off" size={32} color={colors.border} />
                                    <Text style={{ color: colors.textMuted, fontSize: 10 }}>No Start Photo</Text>
                                </>
                            )}
                        </View>
                        <View style={styles.photoBox}>
                             {duty.endMeterPhotoUrl || duty.afterPhotoUrl || duty.end_meter_photo_url || duty.after_photo_url ? (
                                <TouchableOpacity 
                                    onPress={() => openPreview(duty.endMeterPhotoUrl || duty.afterPhotoUrl || duty.end_meter_photo_url || duty.after_photo_url)}
                                    activeOpacity={0.9}
                                    style={styles.fullImage}
                                >
                                    <Image 
                                        source={{ uri: resolveImageUrl(duty.endMeterPhotoUrl || duty.afterPhotoUrl || duty.end_meter_photo_url || duty.after_photo_url) || '' }} 
                                        style={styles.fullImage} 
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="camera-off" size={32} color={colors.border} />
                                    <Text style={{ color: colors.textMuted, fontSize: 10 }}>No End Photo</Text>
                                </>
                            )}
                        </View>
                    </View>
                </Surface>
            </ScrollView>
        </View>
    );
}

function DetailItem({ icon, label, value, colors }: any) {
    return (
        <View style={styles.detailItem}>
            <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
                <Text style={[styles.value, { color: colors.textMain }]}>{value}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollView: { flex: 1 },
    scrollContent: { padding: 24 },
    infoCard: { borderRadius: 12, padding: 20, borderWidth: 1 },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
    dateText: { fontSize: 12, fontWeight: '600' },
    infoSection: { gap: 16 },
    detailItem: { flexDirection: 'row', gap: 16, alignItems: 'center' },
    label: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
    value: { fontSize: 15, fontWeight: '600', marginTop: 2 },
    photoCard: { borderRadius: 12, padding: 20, borderWidth: 1 },
    sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 16, textTransform: 'uppercase' },
    photoGrid: { flexDirection: 'row', gap: 16 },
    photoBox: { flex: 1, height: 120, borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', gap: 8, overflow: 'hidden' },
    fullImage: { width: '100%', height: '100%' }
});
