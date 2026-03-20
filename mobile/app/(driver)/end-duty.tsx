import { View, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEndDutyMutation, useGetActiveDutyQuery } from '@/redux/apis/workApi';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useDispatch, useSelector } from 'react-redux';
import { clearActiveDuty } from '@/redux/slices/driverSlice';
import { RootState } from '@/redux/store';

export default function EndDutyScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colors } = useAppTheme();
    const dispatch = useDispatch();
    const activeWorkId = useSelector((state: RootState) => state.driver.activeWorkId);
    const localStartedAt = useSelector((state: RootState) => state.driver.startedAt);

    const [endDuty, { isLoading: isSubmitting }] = useEndDutyMutation();
    const { data: activeDutyData } = useGetActiveDutyQuery();

    const [location, setLocation] = useState('');
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [meterReading, setMeterReading] = useState('');
    const [notes, setNotes] = useState('');

    const handleGetLocation = async () => {
        setIsLocating(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({ type: 'error', text1: t('common.permission_denied'), text2: t('operator.location_permission_msg') });
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

            const [address] = await Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            });

            if (address) {
                const formatted = `${address.name || ''}, ${address.street || ''}, ${address.subregion || ''}, ${address.city || ''}`.replace(/^, |, $/g, '');
                setLocation(formatted);
            } else {
                setLocation(`${loc.coords.latitude}, ${loc.coords.longitude}`);
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: t('common.error'), text2: t('operator.loc_fetch_error') });
        } finally {
            setIsLocating(false);
        }
    };

    const handleCapturePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return;
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.7,
        });
        if (!result.canceled) setPhotoUri(result.assets[0].uri);
    };

    const handleSubmit = async () => {
        const currentWorkId = activeWorkId || activeDutyData?.workSession?.id?.toString();
        const startTimestamp = localStartedAt || activeDutyData?.workSession?.startedAt;

        if (!location || !photoUri || !currentWorkId) {
            Toast.show({ type: 'error', text1: t('common.error'), text2: 'Missing duty session ID or details' });
            return;
        }
        if (!meterReading) {
            Toast.show({ type: 'error', text1: t('common.error'), text2: t('driver.reading_required') });
            return;
        }

        const formData = new FormData();
        // Send both work_id and workSessionId for compatibility
        formData.append('work_id', currentWorkId);
        formData.append('workSessionId', currentWorkId);

        formData.append('end_location', location);
        formData.append('siteAddress', location);
        formData.append('end_meter_reading', meterReading);

        formData.append('finishedAt', new Date().toISOString());
        formData.append('finished_at', new Date().toISOString());

        // Calculate total hours if startedAt is available
        if (startTimestamp) {
            const start = new Date(startTimestamp).getTime();
            const end = new Date().getTime();
            const diffInHours = ((end - start) / (1000 * 60 * 60)).toFixed(2);
            formData.append('totalHours', diffInHours);
            formData.append('total_hours', diffInHours);
        }

        if (notes) {
            formData.append('notes', notes);
        }

        if (coords) {
            formData.append('siteLatitude', coords.latitude.toString());
            formData.append('siteLongitude', coords.longitude.toString());
            formData.append('end_latitude', coords.latitude.toString());
            formData.append('end_longitude', coords.longitude.toString());
        }

        const filename = photoUri.split('/').pop() || 'meter_after.jpg';
        const photoMatch = /\.(\w+)$/.exec(filename);
        const photoType = photoMatch ? `image/${photoMatch[1]}` : `image/jpeg`;
        const cleanUri = Platform.OS === 'android' ? photoUri : photoUri.replace('file://', '');

        // Send both end_meter_photo and afterPhoto
        formData.append('end_meter_photo', {
            uri: Platform.OS === 'android' ? photoUri : cleanUri,
            name: filename,
            type: photoType
        } as any);

        formData.append('afterPhoto', {
            uri: Platform.OS === 'android' ? photoUri : cleanUri,
            name: filename,
            type: photoType
        } as any);

        try {
            const response = await endDuty(formData).unwrap();
            Toast.show({ type: 'success', text1: t('common.success'), text2: response.message || t('driver.duty_finished') });
            dispatch(clearActiveDuty());
            setTimeout(() => router.replace('/(driver)'), 1500);
        } catch (error: any) {
            console.error("=== END DUTY ERROR ===", error);
            Toast.show({ type: 'error', text1: t('common.error'), text2: error?.data?.message || 'Failed to end duty' });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('driver.finish_duty')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>{t('driver.end_location')}</Text>
                <View style={styles.locationContainer}>
                    <TextInput
                        mode="outlined"
                        label={t('driver.manual_location')}
                        value={location}
                        onChangeText={setLocation}
                        style={styles.input}
                        right={<TextInput.Icon icon="map-marker" />}
                    />
                    <TouchableOpacity onPress={handleGetLocation} style={[styles.gpsBtn, { backgroundColor: colors.primary }]}>
                        {isLocating ? <ActivityIndicator size="small" color="#000" /> : <MaterialCommunityIcons name="target" size={24} color="#000" />}
                    </TouchableOpacity>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('driver.meter_reading')}</Text>
                <TextInput
                    mode="outlined"
                    label={t('driver.meter_reading')}
                    value={meterReading}
                    onChangeText={setMeterReading}
                    keyboardType="numeric"
                    style={styles.input}
                    right={<TextInput.Icon icon="counter" />}
                />

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('driver.meter_photo')}</Text>
                <TouchableOpacity onPress={handleCapturePhoto} style={[styles.photoBox, { borderColor: colors.border }]}>
                    {photoUri ? (
                        <Image source={{ uri: photoUri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <MaterialCommunityIcons name="camera" size={48} color={colors.primary} />
                            <Text style={{ color: colors.textMuted }}>{t('driver.camera_only')}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('driver.notes')}</Text>
                <TextInput
                    mode="outlined"
                    label={t('driver.notes_placeholder')}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                    style={[styles.input, { height: 100 }]}
                />

                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={styles.bottomBar}>
                <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting} style={styles.submitBtn}>
                    <LinearGradient colors={[colors.danger, colors.danger]} style={styles.gradient}>
                        {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={[styles.submitText, { color: '#FFF' }]}>{t('driver.end_duty')}</Text>}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollContent: { padding: 24 },
    sectionTitle: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase', marginBottom: 12 },
    locationContainer: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    input: { flex: 1 },
    gpsBtn: { width: 54, height: 54, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    photoBox: { height: 250, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    photoPlaceholder: { alignItems: 'center', gap: 12 },
    previewImage: { width: '100%', height: '100%' },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24 },
    submitBtn: { height: 64, borderRadius: 16, overflow: 'hidden' },
    gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    submitText: { fontSize: 16, fontWeight: '900' }
});
