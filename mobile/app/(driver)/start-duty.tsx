
import React, { useState, useEffect } from 'react';
import { Text, TextInput, ActivityIndicator, Portal, Modal, Searchbar } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStartDutyMutation, useGetClientsQuery, useCreateClientMutation, Client } from '@/redux/apis/workApi';
import { useGetMachinesQuery, Machine } from '@/redux/apis/ownerApi';
import { useGetMeQuery, useUpdateProfileMutation } from '@/redux/apis/authApi';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setActiveDuty } from '@/redux/slices/driverSlice';
import { addCachedClient } from '@/redux/slices/cacheSlice';
import { useOfflineMutation } from '@/hooks/useOfflineMutation';
import { Platform, View, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView } from 'react-native';

export default function StartDutyScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colors } = useAppTheme();
    const dispatch = useAppDispatch();

    // API Hooks
    const { data: userData } = useGetMeQuery();
    const { performMutation } = useOfflineMutation();
    const [updateProfile] = useUpdateProfileMutation();
    const [startDuty, { isLoading: isSubmitting }] = useStartDutyMutation();
    const [createClient, { isLoading: isCreatingClient }] = useCreateClientMutation();
    
    const { data: clientsData, isLoading: isLoadingClients } = useGetClientsQuery();
    const { data: machinesData, isLoading: isLoadingMachines } = useGetMachinesQuery();

    // Cache Fallback
    const { machines: cachedMachines, clients: cachedClients } = useAppSelector(state => state.cache);
    const { isOnline } = useAppSelector(state => state.offline);

    const availableClients = isOnline && clientsData?.success ? clientsData.clients : cachedClients;
    const availableMachines = isOnline && machinesData?.machines ? machinesData.machines : cachedMachines;

    // Client Selection States
    const [isNewClient, setIsNewClient] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [showClientModal, setShowClientModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Machine Selection States
    const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
    const [showMachineModal, setShowMachineModal] = useState(false);
    const [machineSearch, setMachineSearch] = useState('');

    useEffect(() => {
        if (userData?.user?.assignedVehicle && availableMachines) {
            const preAssigned = availableMachines.find(m => m.registration_number === userData.user.assignedVehicle || m.registrationNumber === userData.user.assignedVehicle);
            if (preAssigned) setSelectedMachine(preAssigned);
        }
    }, [userData, availableMachines]);

    // New Client Form States
    const [newClientName, setNewClientName] = useState('');
    const [clientNumber, setClientNumber] = useState('');
    const [district, setDistrict] = useState('');
    const [tq, setTq] = useState('');

    // Duty Data States
    const [location, setLocation] = useState('');
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [meterReading, setMeterReading] = useState('');

    // UI States

    const handleGetLocation = async () => {
        setIsLocating(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({ type: 'error', text1: t('common.permission_denied'), text2: t('operator.location_permission_msg') });
                return;
            }

            let loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const { latitude, longitude } = loc.coords;
            setCoords({ latitude, longitude });

            try {
                const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
                if (address) {
                    const formatted = `${address.name || ''}, ${address.street || ''}, ${address.subregion || ''}, ${address.city || ''}`.replace(/^, |, $/g, '').replace(/, ,/g, ',');
                    setLocation(formatted || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                } else {
                    setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                }
            } catch (geoError) {
                console.warn("Geocoding failed, falling back to coordinates:", geoError);
                setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: t('common.error'), text2: t('operator.loc_fetch_error') });
        } finally {
            setIsLocating(false);
        }
    };

    const handleTakePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({ type: 'error', text1: t('common.permission_denied'), text2: t('operator.camera_permission') });
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.7,
            });

            if (!result.canceled) {
                setPhotoUri(result.assets[0].uri);
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: t('common.error'), text2: t('operator.camera_error') });
        }
    };

    const handlePickPhoto = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({ type: 'error', text1: t('common.permission_denied'), text2: t('owner.gallery_permission') });
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.7,
            });

            if (!result.canceled) {
                setPhotoUri(result.assets[0].uri);
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: t('common.error'), text2: 'Failed to pick image' });
        }
    };

    const handleCapturePhoto = () => {
        import('react-native').then(({ Alert }) => {
            Alert.alert(
                t('driver.meter_photo'),
                t('driver.meter_desc') || 'Capture meter reading photo',
                [
                    { text: t('operator.camera') || 'Camera', onPress: handleTakePhoto },
                    { text: t('operator.gallery') || 'Gallery', onPress: handlePickPhoto },
                    { text: t('common.cancel'), style: "cancel" }
                ]
            );
        });
    };

    const handleSubmit = async () => {
        if (!selectedMachine) {
            Toast.show({ type: 'error', text1: t('common.error'), text2: 'Please select a vehicle to start duty' });
            return;
        }
        if (!location) {
            Toast.show({ type: 'error', text1: t('common.error'), text2: t('driver.location_required') });
            return;
        }
        if (!photoUri) {
            Toast.show({ type: 'error', text1: t('common.error'), text2: t('driver.meter_required') });
            return;
        }
        if (!meterReading) {
            Toast.show({ type: 'error', text1: t('common.error'), text2: t('driver.reading_required') });
            return;
        }

        let clientIdToSend = selectedClient ? selectedClient.id.toString() : '';

        try {
            if (isNewClient) {
                if (!newClientName || !clientNumber || !district || !tq) {
                    Toast.show({ type: 'error', text1: t('common.error'), text2: t('operator.missing_details_msg') });
                    return;
                }
                const newClientRes = await performMutation(createClient, {
                    name: newClientName,
                    mobile: clientNumber,
                    district: district,
                    taluka: tq
                }, {
                    endpoint: '/clients',
                    method: 'POST',
                    description: `Create client ${newClientName}`
                });

                if (newClientRes.offline) {
                    clientIdToSend = newClientRes.id || `pending_${Date.now()}`;
                    dispatch(addCachedClient({
                        id: clientIdToSend,
                        name: newClientName,
                        mobile: clientNumber,
                        district: district,
                        taluka: tq,
                        createdAt: new Date().toISOString()
                    }));
                } else if (newClientRes.success) {
                    clientIdToSend = newClientRes.data.client.id.toString();
                } else {
                    return;
                }
            } else {
                if (!selectedClient) {
                    Toast.show({ type: 'error', text1: t('common.error'), text2: t('operator.select_client_msg') });
                    return;
                }
            }

            // 1. If machine is different from assigned vehicle, update profile
            const machineReg = selectedMachine.registration_number || selectedMachine.registrationNumber;
            if (machineReg !== userData?.user?.assignedVehicle) {
                try {
                    const regToUpdate = selectedMachine.registration_number || selectedMachine.registrationNumber;
                    await updateProfile({ assignedVehicle: regToUpdate }).unwrap();
                } catch (e) {
                    console.error("Failed to update profile assignment", e);
                }
            }

            const photoFilename = photoUri.split('/').pop() || 'meter.jpg';
            const photoMatch = /\.(\w+)$/.exec(photoFilename);
            const photoType = photoMatch ? `image/${photoMatch[1]}` : `image/jpeg`;
            const cleanUri = Platform.OS === 'ios' ? photoUri.replace('file://', '') : photoUri;

            const requestBody: any = {
                machine_id: Number(selectedMachine.id),
                machineId: Number(selectedMachine.id),
                start_location: location,
                siteAddress: location,
                site_address: location,
                start_meter_reading: meterReading,
                startMeterReading: meterReading,
                clientId: clientIdToSend,
                client_id: clientIdToSend,
                role: 'Driver',
                start_meter_photo: { uri: cleanUri, name: photoFilename, type: photoType },
                startMeterPhoto: { uri: cleanUri, name: photoFilename, type: photoType },
                beforePhoto: { uri: cleanUri, name: photoFilename, type: photoType },
                before_photo: { uri: cleanUri, name: photoFilename, type: photoType },
            };

            if (coords) {
                requestBody.siteLatitude = coords.latitude;
                requestBody.siteLongitude = coords.longitude;
                requestBody.start_latitude = coords.latitude;
                requestBody.start_longitude = coords.longitude;
            }

            const response = await performMutation(startDuty, requestBody, {
                endpoint: '/duty/start',
                method: 'POST',
                description: `Driver starting duty with ${selectedMachine.name}`
            });

            if (response.success && response.offline) {
                Toast.show({ type: 'info', text1: 'Saved Offline', text2: 'Duty start log will sync soon' });
                dispatch(setActiveDuty({
                    id: response.id || `pending_${Date.now()}`,
                    siteAddress: location,
                    startedAt: new Date().toISOString()
                }));
                router.replace('/(driver)');
                return;
            }

            if (response.success && response.workSession) {
                Toast.show({ type: 'success', text1: t('common.success'), text2: response.message || t('driver.duty_started') });
                dispatch(setActiveDuty({
                    id: response.workSession.id.toString(),
                    siteAddress: response.workSession.startLocation || response.workSession.siteAddress,
                    startedAt: response.workSession.startedAt
                }));
                setTimeout(() => router.replace('/(driver)'), 1500);
            }
        } catch (error: any) {
            console.error("=== START DUTY ERROR ===", error);
            const msg = error?.data?.message || 'Failed to start duty';
            Toast.show({ type: 'error', text1: t('common.error'), text2: msg });
        }
    };

    const filteredClients = availableClients?.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.mobile.includes(searchQuery)
    ) || [];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('driver.duty_setup')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Vehicle Selection */}
                <Text style={styles.sectionTitle}>Step 1: Assign Vehicle</Text>
                <TouchableOpacity
                    style={[styles.selectorBtn, { backgroundColor: colors.card, borderColor: selectedMachine ? colors.primary : colors.border }]}
                    onPress={() => setShowMachineModal(true)}
                >
                    <View style={[styles.selectorIcon, { backgroundColor: colors.primary + '20' }]}>
                        <MaterialCommunityIcons name="excavator" size={24} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.selectorLabel, { color: colors.textMuted }]}>
                            Selected Machine
                        </Text>
                        <Text style={[styles.selectorValue, { color: colors.textMain }]}>
                            {selectedMachine ? `${selectedMachine.name} - ${selectedMachine.registration_number || selectedMachine.registrationNumber}` : 'Tap to Select Machine'}
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-down" size={24} color={colors.textMuted} />
                </TouchableOpacity>

                <Text style={[styles.sectionTitle, { marginTop: 12 }]}>{t('operator.step_1_assign_client')}</Text>
                <TouchableOpacity
                    style={[styles.selectorBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => setShowClientModal(true)}
                >
                    <View style={[styles.selectorIcon, { backgroundColor: colors.primary + '20' }]}>
                        <MaterialCommunityIcons name="account-search-outline" size={24} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.selectorLabel, { color: colors.textMuted }]}>
                            {isNewClient ? t('operator.creating_new_client') : t('operator.selected_client')}
                        </Text>
                        <Text style={[styles.selectorValue, { color: colors.textMain }]}>
                            {isNewClient ? t('operator.register_new_client') : (selectedClient ? selectedClient.name : t('operator.tap_to_select_client'))}
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-down" size={24} color={colors.textMuted} />
                </TouchableOpacity>

                {isNewClient && (
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 8, gap: 12, padding: 16, borderRadius: 12, borderWidth: 1 }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase' }}>{t('operator.new_client_info')}</Text>
                            <TouchableOpacity onPress={() => setIsNewClient(false)}>
                                <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>{t('operator.back_to_list')}</Text>
                            </TouchableOpacity>
                        </View>
                        <StyledInput label={t('operator.client_name_label')} icon="account" value={newClientName} onChangeText={setNewClientName} colors={colors} />
                        <StyledInput label={t('operator.phone_number_label')} icon="phone" value={clientNumber} onChangeText={setClientNumber} keyboardType="phone-pad" colors={colors} />
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ flex: 1 }}><StyledInput label={t('owner.district')} icon="map-marker" value={district} onChangeText={setDistrict} colors={colors} /></View>
                            <View style={{ flex: 1 }}><StyledInput label={t('owner.taluka')} icon="map" value={tq} onChangeText={setTq} colors={colors} /></View>
                        </View>
                    </View>
                )}

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('driver.start_location')}</Text>
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

                <View style={{ height: 100 }} />
            </ScrollView>

            <Portal>
                <Modal
                    visible={showClientModal}
                    onDismiss={() => setShowClientModal(false)}
                    contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.background }]}
                >
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.textMain }]}>{t('operator.select_client_modal_title')}</Text>
                        <TouchableOpacity onPress={() => setShowClientModal(false)}>
                            <MaterialCommunityIcons name="close" size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <Searchbar
                        placeholder={t('operator.search_client_placeholder')}
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                        inputStyle={{ color: colors.textMain }}
                        iconColor={colors.primary}
                        placeholderTextColor={colors.textMuted}
                    />

                    <ScrollView style={{ marginTop: 10 }} showsVerticalScrollIndicator={false}>
                        <TouchableOpacity
                            style={[styles.clientItem, { borderBottomColor: colors.border }]}
                            onPress={() => {
                                setIsNewClient(true);
                                setSelectedClient(null);
                                setShowClientModal(false);
                            }}
                        >
                            <View style={[styles.clientIcon, { backgroundColor: colors.primary + '15' }]}>
                                <MaterialCommunityIcons name="account-plus" size={22} color={colors.primary} />
                            </View>
                            <Text style={[styles.clientName, { color: colors.primary }]}>{t('operator.register_new_client')}</Text>
                        </TouchableOpacity>

                        {isLoadingClients ? (
                            <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
                        ) : (
                            filteredClients.map(client => (
                                <TouchableOpacity
                                    key={client.id}
                                    style={[styles.clientItem, { borderBottomColor: colors.border }]}
                                    onPress={() => {
                                        setIsNewClient(false);
                                        setSelectedClient(client);
                                        setShowClientModal(false);
                                    }}
                                >
                                    <View style={[styles.clientIcon, { backgroundColor: colors.border + '30' }]}>
                                        <MaterialCommunityIcons name="account" size={22} color={colors.textMuted} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.clientName, { color: colors.textMain }]}>{client.name}</Text>
                                        <Text style={[styles.clientSub, { color: colors.textMuted }]}>{client.mobile} • {client.district}</Text>
                                    </View>
                                    {selectedClient?.id === client.id && !isNewClient && (
                                        <MaterialCommunityIcons name="check-circle" size={24} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </Modal>

                <Modal
                    visible={showMachineModal}
                    onDismiss={() => setShowMachineModal(false)}
                    contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.background }]}
                >
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.textMain }]}>Select Your Vehicle</Text>
                        <TouchableOpacity onPress={() => setShowMachineModal(false)}>
                            <MaterialCommunityIcons name="close" size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <Searchbar
                        placeholder="Search by name or number..."
                        onChangeText={setMachineSearch}
                        value={machineSearch}
                        style={styles.searchBar}
                        inputStyle={{ color: colors.textMain }}
                        iconColor={colors.primary}
                        placeholderTextColor={colors.textMuted}
                    />

                    <ScrollView style={{ marginTop: 10 }} showsVerticalScrollIndicator={false}>
                        {isLoadingMachines ? (
                            <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
                        ) : (
                            availableMachines?.filter(m =>
                                m.name.toLowerCase().includes(machineSearch.toLowerCase()) ||
                                (m.registration_number || m.registrationNumber || '').includes(machineSearch)
                            ).map(machine => (
                                <TouchableOpacity
                                    key={machine.id}
                                    style={[styles.clientItem, { borderBottomColor: colors.border }]}
                                    onPress={() => {
                                        setSelectedMachine(machine);
                                        setShowMachineModal(false);
                                    }}
                                >
                                    <View style={[styles.clientIcon, { backgroundColor: colors.primary + '15' }]}>
                                        <MaterialCommunityIcons name="excavator" size={22} color={colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.clientName, { color: colors.textMain }]}>{machine.name}</Text>
                                        <Text style={[styles.clientSub, { color: colors.textMuted }]}>{machine.registration_number || machine.registrationNumber} • {machine.status}</Text>
                                    </View>
                                    {selectedMachine?.id === machine.id && (
                                        <MaterialCommunityIcons name="check-circle" size={24} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </Modal>
            </Portal>

            <View style={styles.bottomBar}>
                <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting || isCreatingClient} style={styles.submitBtn}>
                    <LinearGradient colors={[colors.primary, colors.primary]} style={styles.gradient}>
                        {isSubmitting || isCreatingClient ? <ActivityIndicator color="#000" /> : <Text style={styles.submitText}>{t('driver.initiate_duty')}</Text>}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function StyledInput({ label, icon, colors, ...props }: any) {
    return (
        <TextInput
            label={label}
            mode="outlined"
            style={{ marginBottom: 4, height: 50, backgroundColor: colors.background }}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.textMain}
            placeholderTextColor={colors.textMuted}
            theme={{ colors: { onSurfaceVariant: colors.textMuted } }}
            left={<TextInput.Icon icon={icon} color={colors.primary} />}
            {...props}
        />
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollContent: { padding: 24, paddingBottom: 150 },
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
    submitText: { fontSize: 16, fontWeight: '900', color: '#000' },

    selectorBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
    selectorIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    selectorLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    selectorValue: { fontSize: 16, fontWeight: '900', marginTop: 2 },
    modalContainer: { margin: 20, padding: 20, borderRadius: 12, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '900' },
    searchBar: { elevation: 0, borderBottomWidth: 1, borderBottomColor: '#333', marginBottom: 16, borderRadius: 12 },
    clientItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, gap: 14 },
    clientIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    clientName: { fontSize: 16, fontWeight: '800' },
    clientSub: { fontSize: 12, marginTop: 2 },
    card: { borderRadius: 12, borderWidth: 1, padding: 12 }
});
