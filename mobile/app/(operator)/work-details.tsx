
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Linking } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGetWorkDetailsQuery } from '@/redux/apis/workApi';
import { useAppTheme } from '@/hooks/use-theme-color';
import { resolveImageUrl } from '../../utils/imageHelpers';
import { formatDuration, formatDate } from '@/utils/formatters';

export default function WorkDetailsScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const { id } = useLocalSearchParams();

    // Fetch detailed work session data
    const { data, isLoading, error } = useGetWorkDetailsQuery(Number(id));
    const workSession = data?.workSession;

    const handleViewInvoice = () => {
        if (!workSession) return;

        router.push({
            pathname: '/(operator)/invoice-preview',
            params: {
                invoiceNumber: `WS-${workSession.id}`, // Placeholder or real invoice number if available
                clientName: workSession.clientName,
                totalHours: workSession.totalHours?.toString() || '0',
                hourlyRate: '1200', // Should come from API if available
                totalAmount: ((workSession.totalHours || 0) * 1200).toString(),
                description: workSession.notes || 'Work session',
                date: formatDate(workSession.createdAt),
                photoUri: workSession.afterPhotoUrl
            }
        });
    };

    const handleCallClient = () => {
        if (workSession?.clientMobile) {
            Linking.openURL(`tel:${workSession.clientMobile}`);
        }
    };

    const handleOpenMap = () => {
        if (workSession?.siteLatitude && workSession?.siteLongitude) {
            const url = `https://www.google.com/maps/search/?api=1&query=${workSession.siteLatitude},${workSession.siteLongitude}`;
            Linking.openURL(url);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error || !workSession) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.danger} />
                <Text style={{ color: colors.textMuted, marginTop: 16 }}>Failed to load work details.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary, fontWeight: '700' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Work Details #{workSession.id}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Status Card */}
                <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.statusRow}>
                        <Text style={[styles.label, { color: colors.textMuted }]}>Status</Text>
                        <View style={[styles.badge, { backgroundColor: workSession.status === 'completed' ? colors.success + '20' : colors.primary + '20' }]}>
                            <Text style={[styles.badgeText, { color: workSession.status === 'completed' ? colors.success : colors.primary }]}>
                                {workSession.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.timeRow}>
                        <View>
                            <Text style={[styles.label, { color: colors.textMuted }]}>Date</Text>
                            <Text style={[styles.value, { color: colors.textMain }]}>
                                {formatDate(workSession.createdAt)}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[styles.label, { color: colors.textMuted }]}>Duration</Text>
                            <Text style={[styles.value, { color: colors.textMain }]}>
                                {workSession.totalHours ? formatDuration(workSession.totalHours) : 'In Progress'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Client Details */}
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Client Information</Text>
                <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.clientHeader}>
                        <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                            <Text style={{ fontSize: 20, fontWeight: '900', color: colors.primary }}>
                                {workSession.clientName?.charAt(0) || 'C'}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.clientName, { color: colors.textMain }]}>{workSession.clientName}</Text>
                            <Text style={[styles.clientMeta, { color: colors.textMuted }]}>ID: {workSession.clientId}</Text>
                        </View>
                        {workSession.clientMobile && (
                            <TouchableOpacity onPress={handleCallClient} style={[styles.actionIcon, { backgroundColor: '#e0f2fe' }]}>
                                <MaterialCommunityIcons name="phone" size={20} color="#0284c7" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.divider} />

                    <TouchableOpacity onPress={handleOpenMap} style={styles.locationRow}>
                        <MaterialCommunityIcons name="map-marker" size={20} color={colors.danger} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.locationText, { color: colors.textMain }]}>
                                {workSession.siteAddress || workSession.clientDistrict || 'Location not specified'}
                            </Text>
                            {workSession.siteLatitude && (
                                <Text style={[styles.coordText, { color: colors.textMuted }]}>
                                    {workSession.siteLatitude}, {workSession.siteLongitude}
                                </Text>
                            )}
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Photos */}
                {(workSession.beforePhotoUrl || workSession.afterPhotoUrl) && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Site Photos</Text>
                        <View style={styles.photosRow}>
                            {workSession.beforePhotoUrl && (
                                <View style={[styles.photoContainer, { borderColor: colors.border }]}>
                                    <Image source={{ uri: resolveImageUrl(workSession.beforePhotoUrl) }} style={styles.photo} />
                                    <View style={styles.photoLabel}>
                                        <Text style={styles.photoLabelText}>BEFORE</Text>
                                    </View>
                                </View>
                            )}
                            {workSession.afterPhotoUrl && (
                                <View style={[styles.photoContainer, { borderColor: colors.border }]}>
                                    <Image source={{ uri: resolveImageUrl(workSession.afterPhotoUrl) }} style={styles.photo} />
                                    <View style={[styles.photoLabel, { backgroundColor: 'rgba(34, 197, 94, 0.8)' }]}>
                                        <Text style={styles.photoLabelText}>AFTER</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </>
                )}

                {/* Actions */}
                {workSession.status === 'completed' && (
                    <View style={styles.actionSection}>
                        <TouchableOpacity style={styles.invoiceBtn} onPress={handleViewInvoice}>
                            <LinearGradient
                                colors={[colors.primary, colors.primary]}
                                style={styles.gradient}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            >
                                <MaterialCommunityIcons name="file-document-outline" size={24} color="#000" />
                                <Text style={styles.btnText}>VIEW INVOICE / BILL</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 16, fontWeight: '900' },
    content: { padding: 24 },
    statusCard: { padding: 20, borderRadius: 4, marginBottom: 24, borderWidth: 1 },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    badgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
    value: { fontSize: 16, fontWeight: '900' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
    sectionTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
    detailCard: { padding: 20, borderRadius: 4, marginBottom: 24, borderWidth: 1 },
    clientHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    clientName: { fontSize: 16, fontWeight: '800' },
    clientMeta: { fontSize: 12, fontWeight: '600' },
    actionIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    locationText: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
    coordText: { fontSize: 11, marginTop: 2 },
    photosRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    photoContainer: { flex: 1, height: 120, borderRadius: 4, overflow: 'hidden', borderWidth: 1, position: 'relative' },
    photo: { width: '100%', height: '100%' },
    photoLabel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 4, alignItems: 'center' },
    photoLabelText: { color: '#fff', fontSize: 10, fontWeight: '900' },
    actionSection: { marginTop: 10 },
    invoiceBtn: { height: 56, borderRadius: 4, overflow: 'hidden' },
    gradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
    btnText: { fontSize: 14, fontWeight: '900', color: '#000', letterSpacing: 1 }
});
