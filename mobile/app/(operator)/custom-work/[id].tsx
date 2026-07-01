import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Platform,
    Alert,
} from 'react-native';
import { Text, ActivityIndicator, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetCustomWorkByIdQuery, useCompleteCustomWorkMutation, CustomWork } from '@/redux/apis/customWorkApi';
import { resolveImageUrl, formatDate } from '@/utils/formatters';

export default function CustomWorkDetailsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { id, data: paramData } = useLocalSearchParams<{ id: string; data?: string }>();
    const { colors } = useAppTheme();

    const initialData = paramData ? JSON.parse(paramData) : null;
    const { data: apiData, isLoading } = useGetCustomWorkByIdQuery(id || '');
    const [completeCustomWork, { isLoading: isCompleting }] = useCompleteCustomWorkMutation();

    const work: CustomWork | null = apiData?.data || apiData?.customWork || initialData;

    const [afterPhotoUri, setAfterPhotoUri] = useState<string | null>(null);
    const [finalCost, setFinalCost] = useState<string>(work?.workCost ? work.workCost.toString() : '');

    const handleTakeAfterPhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Camera access is required to take completion photo.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setAfterPhotoUri(result.assets[0].uri);
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to open camera.' });
        }
    };

    const handleCompleteWork = async () => {
        if (!id) return;
        if (!afterPhotoUri) {
            Alert.alert('Mandatory Photo', 'After Work photo is mandatory when marking work as completed. Camera capture only.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('status', 'Completed');
            if (finalCost) formData.append('workCost', finalCost);

            const filename = afterPhotoUri.split('/').pop() || 'after_photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;
            const cleanUri = Platform.OS === 'ios' ? afterPhotoUri.replace('file://', '') : afterPhotoUri;
            formData.append('afterImage', { uri: cleanUri, name: filename, type: type } as any);

            await completeCustomWork({ id, formData }).unwrap();
            Toast.show({ type: 'success', text1: 'Completed', text2: 'Custom work successfully marked as Completed.' });
            router.back();
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: error?.data?.message || 'Failed to complete work.' });
        }
    };

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
                <Text style={{ color: colors.textMain }}>Work details not found.</Text>
            </View>
        );
    }

    const beforeImg = resolveImageUrl(work.beforeImage);
    const afterImg = resolveImageUrl(work.afterImage) || afterPhotoUri;

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

                    <InfoRow icon="account" label={t('common.client') || "Client"} value={work.clientName || 'N/A'} colors={colors} />
                    <InfoRow icon="excavator" label={t('common.machine') || "Machine"} value={work.machineName || 'Assigned Equipment'} colors={colors} />
                    <InfoRow icon="map-marker" label={t('common.location') || "Location"} value={work.workLocation || 'N/A'} colors={colors} />
                    <InfoRow icon="calendar" label={t('custom_work.created_at') || "Created At"} value={work.createdAt ? formatDate(work.createdAt) : 'N/A'} colors={colors} />

                    {work.status === 'Completed' ? (
                        <InfoRow icon="currency-inr" label={t('custom_work.final_cost') || "Final Cost"} value={`₹${Number(work.workCost || 0).toLocaleString('en-IN')}`} colors={colors} highlight />
                    ) : (
                        <View style={{ marginTop: 12 }}>
                            <TextInput
                                label={t('custom_work.update_agreed_cost') || "Update Agreed Cost (₹)"}
                                mode="outlined"
                                value={finalCost}
                                onChangeText={setFinalCost}
                                keyboardType="numeric"
                                style={{ backgroundColor: colors.background }}
                                textColor={colors.textMain}
                            />
                        </View>
                    )}
                </View>

                {/* Photos */}
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('custom_work.work_doc') || 'WORK DOCUMENTATION'}</Text>
                <View style={{ gap: 16 }}>
                    <View style={[styles.photoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.photoTitle, { color: colors.textMain }]}>{t('custom_work.before_photo') || 'Before Work Photo'}</Text>
                        {beforeImg ? (
                            <Image source={{ uri: beforeImg }} style={styles.photoImg} resizeMode="cover" />
                        ) : (
                            <View style={styles.noPhotoBox}>
                                <MaterialCommunityIcons name="image-off" size={32} color={colors.textMuted} />
                                <Text style={{ color: colors.textMuted, marginTop: 4 }}>{t('custom_work.no_before_photo') || 'No Before Photo Recorded'}</Text>
                            </View>
                        )}
                    </View>

                    {work.status !== 'Completed' ? (
                        <View style={[styles.photoCard, { backgroundColor: colors.card, borderColor: afterPhotoUri ? colors.success : colors.border }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={[styles.photoTitle, { color: colors.textMain }]}>{t('custom_work.after_photo_mand') || 'After Work Photo (Mandatory)'}</Text>
                                <Text style={{ color: colors.danger, fontSize: 11, fontWeight: '800' }}>{t('custom_work.camera_only') || 'CAMERA ONLY'}</Text>
                            </View>
                            <TouchableOpacity onPress={handleTakeAfterPhoto} activeOpacity={0.8}>
                                {afterPhotoUri ? (
                                    <Image source={{ uri: afterPhotoUri }} style={styles.photoImg} resizeMode="cover" />
                                ) : (
                                    <View style={[styles.takePhotoBox, { borderColor: colors.primary }]}>
                                        <MaterialCommunityIcons name="camera" size={36} color={colors.primary} />
                                        <Text style={{ color: colors.primary, fontWeight: '800', marginTop: 8 }}>{t('custom_work.take_after_photo') || 'Take After Work Photo'}</Text>
                                        <Text style={{ color: colors.textMuted, fontSize: 11 }}>{t('custom_work.mand_to_complete') || 'Mandatory to complete work'}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={[styles.photoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.photoTitle, { color: colors.textMain }]}>{t('custom_work.after_photo') || 'After Work Photo'}</Text>
                            {afterImg ? (
                                <Image source={{ uri: afterImg }} style={styles.photoImg} resizeMode="cover" />
                            ) : (
                                <View style={styles.noPhotoBox}>
                                    <MaterialCommunityIcons name="image-off" size={32} color={colors.textMuted} />
                                    <Text style={{ color: colors.textMuted, marginTop: 4 }}>{t('custom_work.no_after_photo') || 'No After Photo Recorded'}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {work.status !== 'Completed' && (
                <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                    <TouchableOpacity onPress={handleCompleteWork} disabled={isCompleting} style={styles.completeBtn}>
                        <LinearGradient colors={['#10B981', '#059669']} style={styles.gradientBtn}>
                            {isCompleting ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <MaterialCommunityIcons name="check-decagram" size={24} color="#fff" />
                                    <Text style={styles.completeText}>{t('custom_work.mark_as_completed') || 'Mark as Completed'}</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}
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
    scrollContent: { paddingHorizontal: 20, paddingBottom: 140 },
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
    takePhotoBox: { height: 180, borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1 },
    completeBtn: { height: 58, borderRadius: 14, overflow: 'hidden' },
    gradientBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    completeText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
