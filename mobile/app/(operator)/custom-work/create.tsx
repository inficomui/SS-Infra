import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {
    Text,
    TextInput,
    ActivityIndicator,
    Modal,
    Portal,
    Searchbar,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '@/hooks/use-theme-color';
import { storage } from '@/redux/storage';
import { useGetClientsQuery, useCreateClientMutation, Client } from '@/redux/apis/workApi';
import { useCreateCustomWorkMutation } from '@/redux/apis/customWorkApi';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { addCachedClient } from '@/redux/slices/cacheSlice';
import { formatDate } from '@/utils/formatters';

export default function CreateCustomWorkScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colors } = useAppTheme();
    const dispatch = useAppDispatch();
    const { isOnline } = useAppSelector(state => state.offline);
    const { clients: cachedClients } = useAppSelector(state => state.cache);

    const { data: clientsData, isLoading: isLoadingClients } = useGetClientsQuery();
    const [createClient, { isLoading: isCreatingClient }] = useCreateClientMutation();
    const [createCustomWork, { isLoading: isSubmitting }] = useCreateCustomWorkMutation();

    // Client state
    const availableClients = isOnline && clientsData?.success ? clientsData.clients : cachedClients;
    const [isNewClient, setIsNewClient] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [showClientModal, setShowClientModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newClientName, setNewClientName] = useState('');
    const [clientNumber, setClientNumber] = useState('');
    const [district, setDistrict] = useState('');
    const [tq, setTq] = useState('');

    // Work state
    const [workName, setWorkName] = useState('');
    const [workLocation, setWorkLocation] = useState('');
    const [workCost, setWorkCost] = useState('');
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    // Auto assigned machine
    const [selectedMachine, setSelectedMachine] = useState<any>(null);

    // Before photo (Camera ONLY)
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [photoTimestamp, setPhotoTimestamp] = useState<string | null>(null);

    useEffect(() => {
        const loadMachine = async () => {
            try {
                const stored = await storage.getItem('selected_machine');
                if (stored) {
                    setSelectedMachine(JSON.parse(stored));
                }
            } catch (e) {
                console.error("Failed to load machine", e);
            }
        };
        loadMachine();
        handleGetLocation();
    }, []);

    const handleGetLocation = async () => {
        setIsLocating(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    t('common.permission_denied') || 'Permission Denied',
                    t('operator.location_permission_msg') || 'Location permission is required.',
                    [
                        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
                        { text: t('common.retry') || 'Retry', onPress: handleGetLocation }
                    ]
                );
                setIsLocating(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });

            setCoords({
                lat: location.coords.latitude,
                lng: location.coords.longitude
            });

            let finalAddress = `Lat: ${location.coords.latitude.toFixed(4)}, Lng: ${location.coords.longitude.toFixed(4)}`;
            if (isOnline) {
                try {
                    const [address] = await Location.reverseGeocodeAsync({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude
                    });
                    if (address) {
                        const place = address.name || address.street || "";
                        const taluka = address.subregion || address.district || "";
                        const dist = address.city || address.region || "";
                        finalAddress = [place, taluka, dist].filter(p => p && p.length > 0).join(", ");
                    }
                } catch (geoError) {
                    console.log("Reverse geocoding failed");
                }
            }

            setWorkLocation(finalAddress);
            Toast.show({
                type: 'success',
                text1: t('operator.location_found') || 'Location Found',
                text2: finalAddress
            });
        } catch (error) {
            Alert.alert(
                t('common.error') || 'Location Error',
                t('operator.loc_fetch_error') || 'Failed to capture GPS coordinates.',
                [
                    { text: t('common.cancel') || 'Cancel', style: 'cancel' },
                    { text: t('common.retry') || 'Retry', onPress: handleGetLocation }
                ]
            );
        } finally {
            setIsLocating(false);
        }
    };

    // Camera Only requirement
    const handleTakePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    t('common.permission_denied') || 'Permission Denied',
                    t('owner.camera_permission') || 'Camera access is required.'
                );
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setPhotoUri(result.assets[0].uri);
                setPhotoTimestamp(new Date().toISOString());
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: t('common.error'), text2: 'Failed to capture photo.' });
        }
    };

    const handleSave = async (status: 'Draft' | 'Started') => {
        let clientIdToSend = selectedClient ? selectedClient.id : '';
        let clientNameToSend = selectedClient ? selectedClient.name : '';

        try {
            if (isNewClient) {
                if (!newClientName || !clientNumber) {
                    Toast.show({ type: 'error', text1: t('common.error'), text2: 'Please fill new client name and mobile number.' });
                    return;
                }
                const newClientRes = await createClient({
                    name: newClientName,
                    mobile: clientNumber,
                    district: district || 'N/A',
                    taluka: tq || 'N/A'
                }).unwrap();

                if (newClientRes.success) {
                    clientIdToSend = newClientRes.client.id;
                    clientNameToSend = newClientRes.client.name;
                    dispatch(addCachedClient(newClientRes.client));
                }
            } else {
                if (!selectedClient) {
                    Toast.show({ type: 'error', text1: t('common.error'), text2: 'Please select or create a client.' });
                    return;
                }
            }

            if (!workName) {
                Toast.show({ type: 'error', text1: t('common.error'), text2: 'Please enter Work Name.' });
                return;
            }

            if (!selectedMachine) {
                Toast.show({ type: 'error', text1: t('common.error'), text2: 'No machine assigned to operator.' });
                return;
            }

            const formData = new FormData();
            formData.append('clientId', clientIdToSend.toString());
            formData.append('clientName', clientNameToSend);
            formData.append('workName', workName);
            formData.append('workLocation', workLocation || 'Unknown Location');
            formData.append('machineId', selectedMachine.id.toString());
            formData.append('machineName', selectedMachine.name || '');
            formData.append('latitude', coords?.lat?.toString() || '0');
            formData.append('longitude', coords?.lng?.toString() || '0');
            formData.append('workCost', workCost ? workCost.toString() : '0');
            formData.append('status', status);

            if (photoUri) {
                const filename = photoUri.split('/').pop() || 'before_photo.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                const cleanUri = Platform.OS === 'ios' ? photoUri.replace('file://', '') : photoUri;
                formData.append('beforeImage', { uri: cleanUri, name: filename, type: type } as any);
                if (photoTimestamp) formData.append('photoTimestamp', photoTimestamp);
            }

            await createCustomWork(formData).unwrap();
            Toast.show({ type: 'success', text1: 'Success', text2: `Custom Work saved as ${status}.` });
            router.replace('/(operator)/custom-work' as any);
        } catch (error: any) {
            const msg = error?.data?.message || error?.message || 'Failed to save custom work.';
            Toast.show({ type: 'error', text1: t('common.error'), text2: msg });
        }
    };

    const filteredClients = availableClients?.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.mobile.includes(searchQuery)
    ) || [];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('custom_work.create_title') || 'New Custom Work'}</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Auto Selected Machine Card */}
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('custom_work.assigned_machine_auto') || 'ASSIGNED MACHINE (AUTO)'}</Text>
                    <View style={[styles.machineBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MaterialCommunityIcons name="excavator" size={32} color={colors.primary} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.machineTitle, { color: colors.textMain }]}>
                                {selectedMachine ? selectedMachine.name : (t('custom_work.no_machine_selected') || 'No Machine Selected')}
                            </Text>
                            <Text style={[styles.machineSub, { color: colors.textMuted }]}>
                                {selectedMachine ? selectedMachine.registration_number || selectedMachine.registrationNumber || 'No Reg' : (t('custom_work.assign_machine_hint') || 'Assign machine in overview first')}
                            </Text>
                        </View>
                        <MaterialCommunityIcons name="lock" size={20} color={colors.textMuted} />
                    </View>

                    {/* Section 1: Client Information */}
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('custom_work.section_client_info') || 'SECTION 1: CLIENT INFORMATION'}</Text>
                    <TouchableOpacity
                        style={[styles.selectorBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => setShowClientModal(true)}
                    >
                        <View style={[styles.selectorIcon, { backgroundColor: colors.primary + '20' }]}>
                            <MaterialCommunityIcons name="account-search-outline" size={24} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.selectorLabel, { color: colors.textMuted }]}>
                                {isNewClient ? (t('custom_work.creating_new_client') || 'Creating New Client') : (t('custom_work.selected_client') || 'Selected Client')}
                            </Text>
                            <Text style={[styles.selectorValue, { color: colors.textMain }]}>
                                {isNewClient ? newClientName || (t('custom_work.register_new_client') || 'Register New Client') : (selectedClient ? selectedClient.name : (t('custom_work.tap_select_client') || 'Tap to select client'))}
                            </Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-down" size={24} color={colors.textMuted} />
                    </TouchableOpacity>

                    {isNewClient && (
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                                <Text style={{ color: colors.textMain, fontWeight: '800' }}>{t('custom_work.new_client_details') || 'New Client Details'}</Text>
                                <TouchableOpacity onPress={() => setIsNewClient(false)}>
                                    <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('custom_work.select_existing') || 'Select Existing'}</Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput label={t('common.client_name') || "Client Name"} mode="outlined" value={newClientName} onChangeText={setNewClientName} style={[styles.input, { backgroundColor: colors.background }]} textColor={colors.textMain} />
                            <TextInput label={t('common.mobile_number') || "Mobile Number"} mode="outlined" value={clientNumber} onChangeText={setClientNumber} keyboardType="phone-pad" style={[styles.input, { backgroundColor: colors.background }]} textColor={colors.textMain} />
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <View style={{ flex: 1 }}><TextInput label={t('common.district') || "District"} mode="outlined" value={district} onChangeText={setDistrict} style={[styles.input, { backgroundColor: colors.background }]} textColor={colors.textMain} /></View>
                                <View style={{ flex: 1 }}><TextInput label={t('common.taluka') || "Address/Taluka"} mode="outlined" value={tq} onChangeText={setTq} style={[styles.input, { backgroundColor: colors.background }]} textColor={colors.textMain} /></View>
                            </View>
                        </View>
                    )}

                    {/* Section 2: Work Information */}
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('custom_work.section_work_info') || 'SECTION 2: WORK INFORMATION'}</Text>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <TextInput
                            label={t('custom_work.work_name_placeholder') || "Work Name (e.g. Foundation Excavation)"}
                            mode="outlined"
                            value={workName}
                            onChangeText={setWorkName}
                            style={[styles.input, { backgroundColor: colors.background }]}
                            textColor={colors.textMain}
                            left={<TextInput.Icon icon="briefcase" color={colors.primary} />}
                        />

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    label={t('custom_work.work_location_gps') || "Work Location (Auto GPS)"}
                                    mode="outlined"
                                    value={workLocation}
                                    onChangeText={setWorkLocation}
                                    style={[styles.input, { backgroundColor: colors.background }]}
                                    textColor={colors.textMain}
                                    left={<TextInput.Icon icon="map-marker" color={colors.primary} />}
                                />
                            </View>
                            <TouchableOpacity onPress={handleGetLocation} disabled={isLocating} style={[styles.gpsBtn, { backgroundColor: colors.primary }]}>
                                {isLocating ? <ActivityIndicator size="small" color="#000" /> : <MaterialCommunityIcons name="target" size={26} color="#000" />}
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            label={t('custom_work.agreed_cost') || "Final Agreed Cost (₹)"}
                            mode="outlined"
                            value={workCost}
                            onChangeText={setWorkCost}
                            keyboardType="numeric"
                            style={[styles.input, { backgroundColor: colors.background, marginTop: 4 }]}
                            textColor={colors.textMain}
                            left={<TextInput.Icon icon="currency-inr" color={colors.success} />}
                        />
                    </View>

                    {/* Section 3: Work Photos */}
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('custom_work.section_before_photo') || 'SECTION 3: BEFORE WORK PHOTO'}</Text>
                    <TouchableOpacity onPress={handleTakePhoto} activeOpacity={0.8}>
                        <View style={[
                            styles.photoBox,
                            { backgroundColor: colors.card, borderColor: photoUri ? colors.primary : colors.border }
                        ]}>
                            {photoUri ? (
                                <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
                            ) : (
                                <View style={styles.photoPlaceholder}>
                                    <View style={[styles.iconCircle, { backgroundColor: colors.background }]}>
                                        <MaterialCommunityIcons name="camera" size={36} color={colors.primary} />
                                    </View>
                                    <Text style={[styles.photoText, { color: colors.textMain }]}>{t('custom_work.capture_before_cam') || "Capture Before Work Photo (Camera Only)"}</Text>
                                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>{t('custom_work.gallery_disabled') || 'Gallery upload disabled per requirement'}</Text>
                                </View>
                            )}
                            {photoUri && (
                                <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
                                    <MaterialCommunityIcons name="camera-retake" size={18} color="#000" />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                    {photoTimestamp && (
                        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 6, textAlign: 'right' }}>
                            Timestamp: {formatDate(photoTimestamp)}
                        </Text>
                    )}

                    <View style={{ height: 120 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Actions */}
            <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <TouchableOpacity onPress={() => handleSave('Draft')} disabled={isSubmitting} style={[styles.draftBtn, { borderColor: colors.primary }]}>
                    <Text style={{ color: colors.primary, fontWeight: '800' }}>{t('custom_work.save_draft') || 'Save Draft'}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleSave('Started')} disabled={isSubmitting} style={styles.startBtn}>
                    <LinearGradient colors={['#0284C7', '#38BDF8']} style={styles.gradientBtn}>
                        {isSubmitting ? <ActivityIndicator color="#fff" /> : (
                            <Text style={styles.submitText}>{t('custom_work.start_work') || 'Start Work'}</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Client Select Modal */}
            <Portal>
                <Modal visible={showClientModal} onDismiss={() => setShowClientModal(false)} contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.textMain }]}>{t('custom_work.select_client_modal') || 'Select Client'}</Text>
                        <TouchableOpacity onPress={() => setShowClientModal(false)}>
                            <MaterialCommunityIcons name="close" size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                    <Searchbar placeholder={t('custom_work.search_placeholder') || "Search client..."} onChangeText={setSearchQuery} value={searchQuery} style={styles.searchBar} inputStyle={{ color: colors.textMain }} />
                    <ScrollView style={{ maxHeight: 350 }}>
                        <TouchableOpacity
                            style={[styles.clientItem, { borderBottomColor: colors.border }]}
                            onPress={() => { setIsNewClient(true); setSelectedClient(null); setShowClientModal(false); }}
                        >
                            <View style={[styles.clientIcon, { backgroundColor: colors.primary + '20' }]}>
                                <MaterialCommunityIcons name="account-plus" size={22} color={colors.primary} />
                            </View>
                            <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 16 }}>+ {t('custom_work.create_new_client') || 'Create New Client'}</Text>
                        </TouchableOpacity>

                        {isLoadingClients ? <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} /> : (
                            filteredClients.map(c => (
                                <TouchableOpacity
                                    key={c.id}
                                    style={[styles.clientItem, { borderBottomColor: colors.border }]}
                                    onPress={() => { setIsNewClient(false); setSelectedClient(c); setShowClientModal(false); }}
                                >
                                    <View style={[styles.clientIcon, { backgroundColor: colors.card }]}>
                                        <MaterialCommunityIcons name="account" size={22} color={colors.textMuted} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: colors.textMain, fontWeight: '800', fontSize: 15 }}>{c.name}</Text>
                                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{c.mobile} • {c.district}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 140 },
    sectionTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 0.5, marginTop: 24, marginBottom: 10 },
    machineBox: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, gap: 14 },
    machineTitle: { fontSize: 16, fontWeight: '900' },
    machineSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    selectorBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1 },
    selectorIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    selectorLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    selectorValue: { fontSize: 15, fontWeight: '900', marginTop: 2 },
    card: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 10, marginTop: 10 },
    input: { marginBottom: 6 },
    gpsBtn: { width: 54, height: 54, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    photoBox: { height: 200, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    photoPlaceholder: { alignItems: 'center', gap: 8 },
    iconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
    photoText: { fontSize: 14, fontWeight: '800' },
    previewImage: { width: '100%', height: '100%' },
    editBadge: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1, flexDirection: 'row', gap: 12 },
    draftBtn: { flex: 1, height: 56, borderRadius: 14, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
    startBtn: { flex: 2, height: 56, borderRadius: 14, overflow: 'hidden' },
    gradientBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '900' },
    modalContainer: { margin: 20, padding: 20, borderRadius: 14 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 20, fontWeight: '900' },
    searchBar: { elevation: 0, borderRadius: 10, marginBottom: 14 },
    clientItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, gap: 14 },
    clientIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
});
