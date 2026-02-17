import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import {
    Text,
    TextInput,
    ActivityIndicator,
    Modal,
    Portal,
    Searchbar,
    Snackbar
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStartWorkMutation, useGetClientsQuery, useCreateClientMutation, Client } from '@/redux/apis/workApi';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '@/hooks/use-theme-color';
import { storage } from '@/redux/storage';

export default function StartWorkForm() {
    const router = useRouter();
    const { colors, isDark } = useAppTheme();
    const [startWork, { isLoading: isSubmitting }] = useStartWorkMutation();
    const [createClient, { isLoading: isCreatingClient }] = useCreateClientMutation();
    const { data: clientsData, isLoading: isLoadingClients } = useGetClientsQuery();

    const [isNewClient, setIsNewClient] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [showClientModal, setShowClientModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Form States
    const [newClientName, setNewClientName] = useState('');
    const [clientNumber, setClientNumber] = useState('');
    const [district, setDistrict] = useState('');
    const [tq, setTq] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    // Machine State
    const [selectedMachine, setSelectedMachine] = useState<any>(null);

    useEffect(() => {
        const loadMachine = async () => {
            try {
                const stored = await storage.getItem('selected_machine');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setSelectedMachine(parsed);
                }
            } catch (e) {
                console.error("Failed to load machine", e);
            }
        };
        loadMachine();
        handleGetLocation(); // Auto-fetch location on mount
    }, []);

    // GPS Location
    const handleGetLocation = async () => {
        setIsLocating(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location access is required for site tracking.');
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

            // Reverse geocode to get human-readable address
            const [address] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (address) {
                const place = address.name || address.street || "";
                const taluka = address.subregion || address.district || "";
                const dist = address.city || address.region || "";

                const formattedAddress = [place, taluka, dist]
                    .filter(part => part && part.length > 0)
                    .join(", ");

                setNewLocation(formattedAddress);
                Alert.alert("Location Found", `Site detected at: ${formattedAddress}`);
            } else {
                setNewLocation(`Lat: ${location.coords.latitude.toFixed(4)}, Lng: ${location.coords.longitude.toFixed(4)}`);
                Alert.alert("Location Found", "GPS coordinates captured successfully.");
            }

        } catch (error) {
            console.error("Location Fetch Error:", error);
            Alert.alert("Error", "Failed to fetch live location.");
        } finally {
            setIsLocating(false);
        }
    };

    const handleCapturePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Camera access is needed to take site photos.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                aspect: [4, 3],
                quality: 0.7,
            });

            if (!result.canceled) {
                setPhotoUri(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert("Camera Error", "Could not open camera.");
        }
    };

    const handleStartWork = async () => {
        let clientIdToSend = selectedClient ? selectedClient.id.toString() : '';
        let clientNameToSend = selectedClient ? selectedClient.name : '';

        try {
            if (isNewClient) {
                if (!newClientName || !clientNumber || !district || !tq) {
                    Alert.alert("Missing Details", "Please fill all new client details.");
                    return;
                }
                const newClientRes = await createClient({
                    name: newClientName,
                    mobile: clientNumber,
                    district: district,
                    taluka: tq
                }).unwrap();
                console.log("New Client Registered Successfully:", JSON.stringify(newClientRes, null, 2));
                clientIdToSend = newClientRes.client.id.toString();
                clientNameToSend = newClientRes.client.name;
            } else {
                if (!selectedClient) {
                    Alert.alert("Select Client", "Please select a client from the list.");
                    return;
                }
            }

            if (!selectedMachine) {
                Alert.alert("Machine Required", "Please go back to the dashboard and select a machine.");
                return;
            }

            if (!newLocation) {
                Alert.alert("Location Missing", "Please detect site location using GPS.");
                return;
            }

            if (!photoUri) {
                Alert.alert("Photo Required", "Please capture a site photo.");
                return;
            }

            const formData = new FormData();
            formData.append('clientId', clientIdToSend);
            formData.append('siteAddress', newLocation);

            if (selectedMachine?.id) {
                // Backend expects machineId (camelCase) based on validation errors
                formData.append('machineId', selectedMachine.id.toString());
            }

            if (coords) {
                formData.append('siteLatitude', coords.lat.toString());
                formData.append('siteLongitude', coords.lng.toString());
            } else {
                formData.append('siteLatitude', '0');
                formData.append('siteLongitude', '0');
            }

            const startedAt = new Date().toISOString();
            formData.append('startedAt', startedAt);

            console.log("--- FORM DATA PREVIEW ---");
            console.log("Client ID:", clientIdToSend);
            console.log("Client Name:", clientNameToSend);
            console.log("Site Address:", newLocation);
            console.log("Coords:", JSON.stringify(coords));
            console.log("Photo URI:", photoUri);

            // Handle Photo upload properly for React Native FormData
            const filename = photoUri.split('/').pop() || 'start_work_photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('beforePhoto', {
                uri: photoUri,
                name: filename,
                type: type
            } as any);

            console.log("Image Data Prepared:", { uri: photoUri, name: filename, type: type });

            console.log("Submitting Work Data to Server...");


            // Explicitly unwrap to catch error status codes
            const response = await startWork(formData).unwrap();

            console.log("Start Work API Success:", JSON.stringify(response, null, 2));

            const session = response.workSession;
            if (!session) {
                throw new Error("Backend failed to return session details.");
            }

            router.replace({
                pathname: '/(operator)',
                params: {
                    workStarted: 'true',
                    workId: session.id.toString(),
                    startTime: session.startedAt,
                    clientName: clientNameToSend,
                    location: newLocation
                }
            });

        } catch (error: any) {
            console.error("--- START WORK ERROR LOG ---");
            // Enhanced error logging to see the actual response body
            if (error?.data) {
                console.error("Error Data:", JSON.stringify(error.data, null, 2));
            } else {
                console.error("Error Object:", JSON.stringify(error, null, 2));
            }

            const msg = error?.data?.message || error?.message || "Failed to start work session.";
            setErrorMsg(msg);
            Alert.alert("Process Failed", msg);
        }
    };

    const filteredClients = clientsData?.clients?.filter(c =>
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
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Session Setup</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {selectedMachine && (
                        <View style={{ marginBottom: 24, padding: 12, borderRadius: 4, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.primary + '10', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <MaterialCommunityIcons name="excavator" size={28} color={colors.primary} />
                            <View>
                                <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 }}>Active Equipment</Text>
                                <Text style={{ color: colors.textMain, fontSize: 16, fontWeight: '900' }}>{selectedMachine.name}</Text>
                                <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700' }}>{selectedMachine.registration_number || selectedMachine.registrationNumber || 'No REG'}</Text>
                            </View>
                        </View>
                    )}

                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>Step 1: Assign Client</Text>

                    <TouchableOpacity
                        style={[styles.selectorBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => setShowClientModal(true)}
                    >
                        <View style={[styles.selectorIcon, { backgroundColor: colors.primary + '20' }]}>
                            <MaterialCommunityIcons name="account-search-outline" size={24} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.selectorLabel, { color: colors.textMuted }]}>
                                {isNewClient ? "Creating New Client Profile" : "Selected Client"}
                            </Text>
                            <Text style={[styles.selectorValue, { color: colors.textMain }]}>
                                {isNewClient ? "Register New Client" : (selectedClient ? selectedClient.name : "Tap to Select Client")}
                            </Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-down" size={24} color={colors.textMuted} />
                    </TouchableOpacity>

                    <Portal>
                        <Modal
                            visible={showClientModal}
                            onDismiss={() => setShowClientModal(false)}
                            contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.background }]}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: colors.textMain }]}>Select Client</Text>
                                <TouchableOpacity onPress={() => setShowClientModal(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <Searchbar
                                placeholder="Search client or mobile..."
                                onChangeText={setSearchQuery}
                                value={searchQuery}
                                style={styles.searchBar}
                                inputStyle={{ color: colors.textMain }}
                                iconColor={colors.primary}
                                placeholderTextColor={colors.textMuted}
                            />

                            <ScrollView style={styles.clientList} showsVerticalScrollIndicator={false}>
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
                                    <Text style={[styles.clientName, { color: colors.primary }]}>Register New Client</Text>
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
                    </Portal>

                    {isNewClient && (
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 16, gap: 12 }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={[styles.subHeader, { color: colors.textMuted }]}>New Client Information</Text>
                                <TouchableOpacity onPress={() => setIsNewClient(false)}>
                                    <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>BACK TO LIST</Text>
                                </TouchableOpacity>
                            </View>
                            <StyledInput label="Client/Company Name" icon="account" value={newClientName} onChangeText={setNewClientName} colors={colors} />
                            <StyledInput label="Phone Number" icon="phone" value={clientNumber} onChangeText={setClientNumber} keyboardType="phone-pad" colors={colors} />
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <View style={{ flex: 1 }}><StyledInput label="District" icon="map-marker" value={district} onChangeText={setDistrict} colors={colors} /></View>
                                <View style={{ flex: 1 }}><StyledInput label="Taluka" icon="map" value={tq} onChangeText={setTq} colors={colors} /></View>
                            </View>
                        </View>
                    )}

                    <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 30 }]}>Step 2: Site Location (GPS Tracking)</Text>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, paddingVertical: 15 }]}>
                        <Text style={[styles.cardSub, { color: colors.textMuted, marginBottom: 12, fontSize: 12 }]}>
                            Tap the target icon to capture your current work site address.
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={{ flex: 1 }}>
                                <StyledInput
                                    label="Current Site Location"
                                    icon="map-marker-radius"
                                    value={newLocation}
                                    onChangeText={setNewLocation}
                                    disabled={isLocating}
                                    colors={colors}
                                    placeholder="Click target to detect site..."
                                />
                            </View>
                            <TouchableOpacity
                                onPress={handleGetLocation}
                                disabled={isLocating}
                                style={[styles.gpsBtn, { backgroundColor: colors.primary, width: 54, height: 54 }]}
                            >
                                {isLocating ? <ActivityIndicator size="small" color="#000" /> : <MaterialCommunityIcons name="target" size={26} color="#000" />}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 30 }]}>Step 3: Initial Documentation</Text>
                    <TouchableOpacity onPress={handleCapturePhoto} activeOpacity={0.8}>
                        <View style={[
                            styles.photoBox,
                            { backgroundColor: colors.card, borderColor: photoUri ? colors.primary : colors.border, borderStyle: photoUri ? 'solid' : 'dashed' }
                        ]}>
                            {photoUri ? (
                                <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
                            ) : (
                                <View style={styles.photoPlaceholder}>
                                    <View style={[styles.iconCircle, { backgroundColor: colors.background }]}>
                                        <MaterialCommunityIcons name="camera" size={36} color={colors.primary} />
                                    </View>
                                    <Text style={[styles.photoText, { color: colors.textMuted }]}>Capture Before-Work Photo</Text>
                                </View>
                            )}
                            {photoUri && (
                                <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
                                    <MaterialCommunityIcons name="camera-retake" size={18} color="#000" />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>

                    <View style={{ height: 120 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <TouchableOpacity onPress={handleStartWork} disabled={isSubmitting || isCreatingClient} style={styles.submitBtn}>
                    <LinearGradient colors={[colors.primary, colors.primary]} style={styles.gradientBtn}>
                        {isSubmitting || isCreatingClient ? <ActivityIndicator color="#000" /> : (
                            <>
                                <MaterialCommunityIcons name="play-circle-outline" size={26} color="#000" />
                                <Text style={styles.submitText}>INITIATE WORK</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <Snackbar
                visible={!!errorMsg}
                onDismiss={() => setErrorMsg(null)}
                action={{
                    label: 'OK',
                    onPress: () => setErrorMsg(null),
                }}
                style={{ backgroundColor: colors.danger }}
            >
                {errorMsg}
            </Snackbar>
        </View>
    );
}

function StyledInput({ label, icon, colors, ...props }: any) {
    return (
        <TextInput
            label={label}
            mode="outlined"
            style={[styles.input, { backgroundColor: colors.background }]}
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
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 150 },
    sectionTitle: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    card: { borderRadius: 12, borderWidth: 1, padding: 20 },
    cardSub: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
    subHeader: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 16 },
    input: { marginBottom: 4 },
    gpsBtn: { width: 56, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    photoBox: { height: 220, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    photoPlaceholder: { alignItems: 'center', gap: 12 },
    iconCircle: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center' },
    photoText: { fontSize: 13, fontWeight: '700' },
    previewImage: { width: '100%', height: '100%' },
    editBadge: { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(0,0,0,0.1)' },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, borderTopWidth: 1 },
    submitBtn: { borderRadius: 16, overflow: 'hidden', height: 64 },
    gradientBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
    submitText: { fontSize: 16, fontWeight: '900', color: '#000', letterSpacing: 1 },
    selectorBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
    selectorIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    selectorLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    selectorValue: { fontSize: 16, fontWeight: '900', marginTop: 2 },
    modalContainer: { margin: 20, padding: 20, borderRadius: 12, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '900' },
    searchBar: { elevation: 0, borderBottomWidth: 1, borderBottomColor: '#333', marginBottom: 16, borderRadius: 12 },
    clientList: { marginTop: 10 },
    clientItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, gap: 14 },
    clientIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    clientName: { fontSize: 16, fontWeight: '800' },
    clientSub: { fontSize: 12, marginTop: 2 },
});
