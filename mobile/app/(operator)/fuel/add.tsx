import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useAddFuelLogMutation } from '@/redux/apis/fuelApi';
import { useGetMachinesQuery } from '@/redux/apis/ownerApi';
import { storage } from '@/redux/storage';
import { useOfflineMutation } from '@/hooks/useOfflineMutation';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';

export default function AddFuelLogScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const { t } = useTranslation();

    // Form State
    const [machineId, setMachineId] = useState('');
    const [fuelLiters, setFuelLiters] = useState('');
    const [amount, setAmount] = useState('');
    const [logDate, setLogDate] = useState(new Date());
    const [readingBefore, setReadingBefore] = useState<any>(null);
    const [readingAfter, setReadingAfter] = useState<any>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Load pre-selected machine
    React.useEffect(() => {
        const loadMachine = async () => {
            const stored = await storage.getItem('selected_machine');
            if (stored) {
                const machine = JSON.parse(stored);
                setMachineId(machine.id.toString());
            }
        };
        loadMachine();
    }, []);

    // Mutations
    const { performMutation } = useOfflineMutation();
    const [addFuelLog, { isLoading }] = useAddFuelLogMutation();
    const { data: machinesData } = useGetMachinesQuery();

    const takePhoto = async (type: 'before' | 'after') => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({ type: 'error', text1: t('common.permission_denied'), text2: t('owner.camera_permission') });
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            if (type === 'before') setReadingBefore(result.assets[0]);
            else setReadingAfter(result.assets[0]);
        }
    };

    const pickImageFromGallery = async (type: 'before' | 'after') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({ type: 'error', text1: t('common.permission_denied'), text2: t('owner.gallery_permission') });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            if (type === 'before') setReadingBefore(result.assets[0]);
            else setReadingAfter(result.assets[0]);
        }
    };

    const pickImage = (type: 'before' | 'after') => {
        import('react-native').then(({ Alert }) => {
            Alert.alert(
                t('fuel_management.meter_readings_opt') || 'Meter Readings',
                t('finish_work_screen.upload_method') || 'How would you like to upload the photo?',
                [
                    { text: t('finish_work_screen.camera') || 'Camera', onPress: () => takePhoto(type) },
                    { text: t('finish_work_screen.gallery') || 'Gallery', onPress: () => pickImageFromGallery(type) },
                    { text: t('finish_work_screen.cancel') || 'Cancel', style: "cancel" }
                ]
            );
        });
    };

    const handleSubmit = async () => {
        if (!machineId || !fuelLiters || !amount) {
            Toast.show({ type: 'error', text1: t('common.error'), text2: t('fuel_management.error_fill_fields') });
            return;
        }

        const dateStr = logDate.toISOString().split('T')[0];

        const requestBody: any = {
            machineId: Number(machineId),
            machine_id: Number(machineId),
            fuelLiters: fuelLiters,
            fuel_liters: fuelLiters,
            amount: amount,
            logDate: dateStr,
            log_date: dateStr,
        };

        if (readingBefore) {
            const filename = readingBefore.uri.split('/').pop() || 'reading_before.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;
            const cleanUri = Platform.OS === 'ios' ? readingBefore.uri.replace('file://', '') : readingBefore.uri;
            requestBody.readingBeforeImage = { uri: cleanUri, type, name: filename };
            requestBody.reading_before_image = requestBody.readingBeforeImage;
        }

        if (readingAfter) {
            const filename = readingAfter.uri.split('/').pop() || 'reading_after.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;
            const cleanUri = Platform.OS === 'ios' ? readingAfter.uri.replace('file://', '') : readingAfter.uri;
            requestBody.readingAfterImage = { uri: cleanUri, type, name: filename };
            requestBody.reading_after_image = requestBody.readingAfterImage;
        }

        try {
            const response = await performMutation(addFuelLog, requestBody, {
                endpoint: '/fuel-logs',
                method: 'POST',
                description: `Fuel log for machine #${machineId}`
            });

            if (response.success) {
                Toast.show({
                    type: response.offline ? 'info' : 'success',
                    text1: response.offline ? 'Saved Offline' : t('common.success'),
                    text2: response.offline ? 'Log will sync when online' : t('fuel_management.success_msg')
                });
                router.back();
            }
        } catch (error: any) {
            Toast.show({ type: 'error', text1: t('common.error'), text2: error?.data?.message || t('fuel_management.error_add_failed') });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('fuel_management.add_log_title')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Machine Selector (Simple Scroll) */}
                <Text style={[styles.label, { color: colors.textMuted }]}>{t('common.select_machine')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.machineScroll}>
                    {machinesData?.machines?.map((m) => (
                        <TouchableOpacity
                            key={m.id}
                            style={[
                                styles.machineChip,
                                {
                                    backgroundColor: machineId === m.id.toString() ? colors.primary : colors.card,
                                    borderColor: colors.border
                                }
                            ]}
                            onPress={() => setMachineId(m.id.toString())}
                        >
                            <MaterialCommunityIcons
                                name="excavator"
                                size={20}
                                color={machineId === m.id.toString() ? '#FFF' : colors.textMuted}
                            />
                            <Text style={{
                                color: machineId === m.id.toString() ? '#FFF' : colors.textMain,
                                fontWeight: '600'
                            }}>
                                {m.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={[styles.inputGroup, { marginTop: 24 }]}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>{t('fuel_management.transaction_details')}</Text>
                    <TextInput
                        label={t('fuel_management.liters_label')}
                        value={fuelLiters}
                        onChangeText={setFuelLiters}
                        keyboardType="numeric"
                        mode="outlined"
                        style={{ backgroundColor: colors.background, marginBottom: 12 }}
                        outlineColor={colors.border}
                        activeOutlineColor={colors.primary}
                    />
                    <TextInput
                        label={t('fuel_management.amount_label')}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        mode="outlined"
                        style={{ backgroundColor: colors.background, marginBottom: 12 }}
                        outlineColor={colors.border}
                        activeOutlineColor={colors.primary}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>{t('fuel_management.date')}</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.dateInput, { borderColor: colors.border }]}>
                        <Text style={{ color: colors.textMain }}>{logDate.toLocaleDateString()}</Text>
                        <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Image Uploads */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>{t('fuel_management.meter_readings_opt')}</Text>

                    <View style={styles.imageRow}>
                        <TouchableOpacity style={[styles.imageUpload, { borderColor: colors.border }]} onPress={() => pickImage('before')}>
                            {readingBefore ? (
                                <Image source={{ uri: readingBefore.uri }} style={styles.uploadedImage} />
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="camera-plus" size={24} color={colors.textMuted} />
                                    <Text style={{ fontSize: 10, marginTop: 4, color: colors.textMuted }}>{t('fuel_management.before_filling')}</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.imageUpload, { borderColor: colors.border }]} onPress={() => pickImage('after')}>
                            {readingAfter ? (
                                <Image source={{ uri: readingAfter.uri }} style={styles.uploadedImage} />
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="camera-plus" size={24} color={colors.textMuted} />
                                    <Text style={{ fontSize: 10, marginTop: 4, color: colors.textMuted }}>{t('fuel_management.after_filling')}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={isLoading}
                    disabled={isLoading}
                    style={{ marginTop: 32, borderRadius: 8, paddingVertical: 6 }}
                    buttonColor={colors.primary}
                >
                    {t('fuel_management.submit_btn')}
                </Button>

            </ScrollView>

            {showDatePicker && (
                <DateTimePicker
                    value={logDate}
                    mode="date"
                    display="default"
                    onChange={(e, date) => {
                        setShowDatePicker(false);
                        if (date) setLogDate(date);
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollContent: { padding: 24, paddingBottom: 40 },
    label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    machineScroll: { flexDirection: 'row', marginBottom: 12 },
    machineChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginRight: 8 },
    inputGroup: { marginBottom: 24 },
    dateInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderWidth: 1, borderRadius: 12 },
    imageRow: { flexDirection: 'row', gap: 16 },
    imageUpload: { width: 100, height: 100, borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    uploadedImage: { width: '100%', height: '100%' }
});
