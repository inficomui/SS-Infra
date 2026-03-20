import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';
import { resolveImageUrl } from '../../../utils/imageHelpers';
import { formatDate } from '../../../utils/formatters';
import ImagePreviewModal from '@/components/ui/ImagePreviewModal';

const { width } = Dimensions.get('window');

export default function DriverMaintenanceDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { colors } = useAppTheme();
    const { t } = useTranslation();

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

    const record = params.data ? JSON.parse(params.data as string) : null;

    if (!record) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.textMuted }}>{t('maintenance_records.record_not_found')}</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary }}>{t('common.go_back')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const { machine, serviceDate, service_date, serviceType, service_type, cost, description, operator } = record;
    const resolvedServiceDate = serviceDate || service_date || '';
    const resolvedServiceType = serviceType || service_type;

    const serviceImg = record.serviceImageUrl || record.service_image_url || record.service_image || record.service_photo_url || record.service_photo || record.service_photo_path || record.service_image_path;
    const invoiceImg = record.invoiceImageUrl || record.invoice_image_url || record.invoice_image || record.invoice_photo_url || record.invoice_photo || record.invoice_path || record.invoice_photo_path || record.invoice_image_path;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ImagePreviewModal
                visible={previewVisible}
                imageUrl={selectedImage || null}
                onClose={() => setPreviewVisible(false)}
            />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Record Details</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                            <MaterialCommunityIcons name="excavator" size={24} color={colors.primary} />
                        </View>
                        <View>
                            <Text style={[styles.machineName, { color: colors.textMain }]}>{machine?.name || 'Unknown Vehicle'}</Text>
                            <Text style={[styles.dateText, { color: colors.textMuted }]}>{formatDate(resolvedServiceDate)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Cost</Text>
                        <Text style={[styles.costText, { color: colors.danger }]}>₹{cost}</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Type</Text>
                        <Text style={[styles.typeText, { color: colors.textMain }]}>{resolvedServiceType}</Text>
                    </View>
                </View>

                {description && (
                    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Description</Text>
                        <Text style={[styles.descriptionText, { color: colors.textMuted }]}>{description}</Text>
                    </View>
                )}

                <View style={styles.imagesContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain, marginBottom: 12 }]}>Attachments</Text>
                    {serviceImg ? (
                        <TouchableOpacity onPress={() => openPreview(serviceImg)} activeOpacity={0.9} style={[styles.imageWrapper, { borderColor: colors.border }]}>
                            <Text style={[styles.imageLabel, { backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }]}>Service Photo</Text>
                            <Image source={{ uri: resolveImageUrl(serviceImg) || '' }} style={styles.fullImage} resizeMode="cover" />
                        </TouchableOpacity>
                    ) : <View style={[styles.noImage, { backgroundColor: colors.card, borderColor: colors.border }]}><MaterialCommunityIcons name="camera-off" size={30} color={colors.textMuted} /></View>}

                    {invoiceImg ? (
                        <TouchableOpacity onPress={() => openPreview(invoiceImg)} activeOpacity={0.9} style={[styles.imageWrapper, { borderColor: colors.border, marginTop: 16 }]}>
                            <Text style={[styles.imageLabel, { backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }]}>Invoice Bill</Text>
                            <Image source={{ uri: resolveImageUrl(invoiceImg) || '' }} style={styles.fullImage} resizeMode="cover" />
                        </TouchableOpacity>
                    ) : <View style={[styles.noImage, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 16 }]}><MaterialCommunityIcons name="file-document-outline" size={30} color={colors.textMuted} /></View>}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: '900' },
    scrollContent: { padding: 24, paddingBottom: 40 },
    section: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
    iconBox: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    machineName: { fontSize: 18, fontWeight: '800' },
    dateText: { fontSize: 14, marginTop: 2 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    statCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
    statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
    costText: { fontSize: 22, fontWeight: '900' },
    typeText: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
    sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
    descriptionText: { fontSize: 14, lineHeight: 22 },
    imagesContainer: { marginTop: 8 },
    imageWrapper: { width: '100%', height: 250, borderRadius: 16, overflow: 'hidden', borderWidth: 1, position: 'relative' },
    fullImage: { width: '100%', height: '100%' },
    noImage: { width: '100%', height: 150, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', borderStyle: 'dotted' },
    imageLabel: { position: 'absolute', top: 10, left: 10, zIndex: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 10, fontWeight: '700', overflow: 'hidden' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
    closePreviewBtn: { position: 'absolute', top: 50, right: 24, zIndex: 10, width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    fullPreviewImage: { width: width, height: Dimensions.get('window').height * 0.7 }
});
