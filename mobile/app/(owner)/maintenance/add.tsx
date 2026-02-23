import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { Text, TextInput, Button, Menu } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useAddMaintenanceRecordMutation } from '@/redux/apis/maintenanceApi';
import { useGetMachinesQuery } from '@/redux/apis/ownerApi';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddMaintenanceScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { colors } = useAppTheme();
    const { t } = useTranslation();

    // Form State
    const [machineId, setMachineId] = useState(params.preselectedMachineId?.toString() || '');
    const [serviceType, setServiceType] = useState('Maintenance');
    const [cost, setCost] = useState('');
    const [serviceDate, setServiceDate] = useState(new Date());
    const [description, setDescription] = useState('');
    const [serviceImage, setServiceImage] = useState<any>(null);
    const [invoiceImage, setInvoiceImage] = useState<any>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTypeMenu, setShowTypeMenu] = useState(false);

    const serviceTypes = ['Maintenance', 'Repair', 'Oil Change', 'Tyre Replacement', 'Hydraulic Service', 'Breakdown', 'Other'];

    // Mutations
    const [addMaintenance, { isLoading }] = useAddMaintenanceRecordMutation();
    const { data: machinesData } = useGetMachinesQuery();

    const pickImage = async (type: 'service' | 'invoice') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            if (type === 'service') setServiceImage(result.assets[0]);
            else setInvoiceImage(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!machineId || !serviceType || !cost) {
            Alert.alert(t('common.error'), t('maintenance_records.fill_required'));
            return;
        }

        const formData = new FormData();
        formData.append('machine_id', machineId);
        formData.append('service_type', serviceType);
        formData.append('cost', cost);
        formData.append('service_date', serviceDate.toISOString().split('T')[0]);
        formData.append('description', description);

        if (serviceImage) {
            formData.append('service_image', {
                uri: serviceImage.uri,
                type: 'image/jpeg',
                name: 'service_photo.jpg',
            } as any);
        }

        if (invoiceImage) {
            formData.append('invoice_image', {
                uri: invoiceImage.uri,
                type: 'image/jpeg',
                name: 'invoice_photo.jpg',
            } as any);
        }

        try {
            await addMaintenance(formData).unwrap();
            Alert.alert(t('common.success'), t('maintenance_records.log_success'));
            router.back();
        } catch (error: any) {
            Alert.alert(t('common.error'), error?.data?.message || t('maintenance_records.log_error'));
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('maintenance_records.log_title')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                <Text style={[styles.label, { color: colors.textMuted }]}>Select Machine</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.machineScroll}>
                    {machinesData?.machines?.map((m) => (
                        <TouchableOpacity
                            key={m.id}
                            style={[
                                styles.machineChip,
                                {
                                    backgroundColor: machineId === m.id.toString() ? colors.primary : colors.card,
                                    borderColor: machineId === m.id.toString() ? colors.primary : colors.border
                                }
                            ]}
                            onPress={() => setMachineId(m.id.toString())}
                        >
                            <MaterialCommunityIcons
                                name="crane"
                                size={20}
                                color={machineId === m.id.toString() ? '#FFF' : colors.textMuted}
                            />
                            <Text style={{ color: machineId === m.id.toString() ? '#FFF' : colors.textMain, fontWeight: '700' }}>
                                {m.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.formSection}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>{t('maintenance_records.service_details')}</Text>

                    <Menu
                        visible={showTypeMenu}
                        onDismiss={() => setShowTypeMenu(false)}
                        anchor={
                            <TouchableOpacity onPress={() => setShowTypeMenu(true)} style={[styles.typeSelector, { borderColor: colors.border, backgroundColor: colors.card }]}>
                                <Text style={{ color: colors.textMain }}>{serviceType}</Text>
                                <MaterialCommunityIcons name="chevron-down" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        }
                    >
                        {serviceTypes.map(type => (
                            <Menu.Item key={type} onPress={() => { setServiceType(type); setShowTypeMenu(false); }} title={type} />
                        ))}
                    </Menu>

                    <TextInput
                        label={t('maintenance_records.cost_label')}
                        value={cost}
                        onChangeText={setCost}
                        keyboardType="numeric"
                        mode="outlined"
                        style={styles.input}
                        outlineColor={colors.border}
                        activeOutlineColor={colors.primary}
                    />

                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.datePickerBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
                            <Text style={{ color: colors.textMain }}>{serviceDate.toLocaleDateString()}</Text>
                        </View>
                        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>CHANGE</Text>
                    </TouchableOpacity>

                    <TextInput
                        label={t('maintenance_records.desc_label')}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        mode="outlined"
                        style={[styles.input, { height: 100 }]}
                        outlineColor={colors.border}
                        activeOutlineColor={colors.primary}
                    />
                </View>

                <View style={styles.formSection}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>{t('maintenance_records.attachments')}</Text>
                    <View style={styles.imageRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.imgLabel}>{t('maintenance_records.service_photo')}</Text>
                            <TouchableOpacity style={[styles.imageUpload, { borderColor: colors.border }]} onPress={() => pickImage('service')}>
                                {serviceImage ? (
                                    <Image source={{ uri: serviceImage.uri }} style={styles.uploadedImage} />
                                ) : (
                                    <MaterialCommunityIcons name="camera-plus" size={32} color={colors.textMuted} />
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.imgLabel}>{t('maintenance_records.invoice_bill')}</Text>
                            <TouchableOpacity style={[styles.imageUpload, { borderColor: colors.border }]} onPress={() => pickImage('invoice')}>
                                {invoiceImage ? (
                                    <Image source={{ uri: invoiceImage.uri }} style={styles.uploadedImage} />
                                ) : (
                                    <MaterialCommunityIcons name="file-plus" size={32} color={colors.textMuted} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.submitBtn}
                    labelStyle={styles.submitBtnLabel}
                >
                    {t('maintenance_records.log_btn')}
                </Button>

            </ScrollView>

            {showDatePicker && (
                <DateTimePicker
                    value={serviceDate}
                    mode="date"
                    display="default"
                    onChange={(e, date) => {
                        setShowDatePicker(false);
                        if (date) setServiceDate(date);
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: '900' },
    scrollContent: { padding: 24, paddingBottom: 40 },
    label: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
    machineScroll: { flexDirection: 'row', marginBottom: 20 },
    machineChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, marginRight: 10 },
    formSection: { marginBottom: 24 },
    typeSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderWidth: 1, borderRadius: 12, marginBottom: 12 },
    input: { marginBottom: 12 },
    datePickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderWidth: 1, borderRadius: 12, marginBottom: 12 },
    imageRow: { flexDirection: 'row', gap: 16 },
    imgLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', marginBottom: 6, textAlign: 'center' },
    imageUpload: { height: 120, borderWidth: 1, borderStyle: 'dashed', borderRadius: 16, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    uploadedImage: { width: '100%', height: '100%' },
    submitBtn: { marginTop: 20, paddingVertical: 8, borderRadius: 12 },
    submitBtnLabel: { fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});
