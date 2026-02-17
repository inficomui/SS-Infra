
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image,
    Modal
} from 'react-native';
import { Text, TextInput as PaperInput, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate, resolveImageUrl } from '@/utils/formatters';
import { useAddMachineMutation, useUpdateMachineMutation } from '@/redux/apis/ownerApi';
import { useAppTheme } from '@/hooks/use-theme-color';
import Toast from 'react-native-toast-message';

export default function AddMachineScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    console.log("Add/Edit Machine Params:", JSON.stringify(params, null, 2));

    // Parse full object if available
    const machineData = params.fullData ? JSON.parse(params.fullData as string) : {};

    const { colors } = useAppTheme();

    // Check if we are in edit mode
    const isEditMode = !!params.id;
    const machineId = params.id ? Number(params.id) : null;

    const [addMachine, { isLoading: isAdding }] = useAddMachineMutation();
    const [updateMachine, { isLoading: isUpdating }] = useUpdateMachineMutation();

    const isLoading = isAdding || isUpdating;

    const [formData, setFormData] = useState({
        name: (params.name as string) || machineData.name || '',
        registrationNumber: (params.regNo as string) || machineData.registration_number || machineData.registrationNumber || '',
        purchaseDate: (params.date as string) || machineData.purchase_date || machineData.purchaseDate || '',
    });

    // Date Picker state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(formData.purchaseDate ? new Date(formData.purchaseDate) : new Date());

    const initialPhoto = (params.photo as string) || machineData.photo_url || machineData.photoUrl || machineData.photo_path;
    const [photoUri, setPhotoUri] = useState<string | null>(initialPhoto ? resolveImageUrl(initialPhoto) : null);
    const [errors, setErrors] = useState<any>({});

    console.log("Initial Form Data:", JSON.stringify(formData, null, 2));
    console.log("Initial Photo URI:", photoUri);

    // Photo preview modal state
    const [previewVisible, setPreviewVisible] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            // If navigating with params, state is already set by useState initializers.
        }
    }, [isEditMode]);

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
            // Format to YYYY-MM-DD
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setFormData({ ...formData, purchaseDate: formattedDate });
        }
    };

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permission is required to capture machine photo.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            aspect: [16, 9],
            quality: 0.7,
        });

        if (!result.canceled) {
            setPhotoUri(result.assets[0].uri);
            setErrors({ ...errors, photo: null });
        }
    };

    const handlePickPhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Gallery permission is required to select machine photo.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            aspect: [16, 9],
            quality: 0.7,
        });

        if (!result.canceled) {
            setPhotoUri(result.assets[0].uri);
            setErrors({ ...errors, photo: null });
        }
    };

    const validateForm = () => {
        const newErrors: any = {};
        if (!formData.name.trim()) newErrors.name = 'Machine name is required';
        if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Serial number is required';
        if (!photoUri && !isEditMode) newErrors.photo = 'Machine photo is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('registrationNumber', formData.registrationNumber);

            if (formData.purchaseDate) {
                data.append('purchaseDate', formData.purchaseDate.trim());
            }

            const isLocalPhoto = photoUri && !photoUri.startsWith('http');

            if (isLocalPhoto) {
                const filename = photoUri!.split('/').pop() || 'machine.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                // @ts-ignore
                data.append('machinePhoto', {
                    uri: photoUri,
                    name: filename,
                    type: type
                });
            }

            if (isEditMode && machineId) {
                console.log("Updating Machine Data...", machineId);
                await updateMachine({ id: machineId, data: data }).unwrap();

                Toast.show({
                    type: 'success',
                    text1: 'Equipment Updated',
                    text2: 'Machine details have been successfully updated.'
                });

                setTimeout(() => router.back(), 1500);
            } else {
                console.log("Submitting New Machine Data...");
                await addMachine(data).unwrap();

                Toast.show({
                    type: 'success',
                    text1: 'New Equipment Added',
                    text2: `${formData.name} is now part of your fleet.`
                });

                setTimeout(() => router.back(), 1500);
            }

        } catch (error: any) {
            console.error('Machine Operation Error:', error);
            const serverMsg = error?.data?.message || error?.message || 'Operation failed';

            Toast.show({
                type: 'error',
                text1: 'Action Failed',
                text2: serverMsg
            });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>
                    {isEditMode ? 'Edit Equipment' : 'Register Equipment'}
                </Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Full Screen Image Preview Modal */}
            <Modal visible={previewVisible} transparent={true} animationType="fade" onRequestClose={() => setPreviewVisible(false)}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeModal} onPress={() => setPreviewVisible(false)}>
                        <MaterialCommunityIcons name="close-circle" size={40} color="#fff" />
                    </TouchableOpacity>
                    {photoUri && (
                        <Image source={{ uri: photoUri }} style={styles.fullScreenImage} resizeMode="contain" />
                    )}
                </View>
            </Modal>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.photoUploadSection}>
                        <TouchableOpacity
                            onPress={() => photoUri && setPreviewVisible(true)}
                            activeOpacity={0.9}
                            style={[
                                styles.photoFrame,
                                { backgroundColor: colors.card, borderColor: errors.photo ? colors.danger : colors.border }
                            ]}>
                            {photoUri ? (
                                <>
                                    <Image source={{ uri: photoUri }} style={styles.previewImage} />
                                    <View style={styles.photoOverlay}>
                                        <TouchableOpacity onPress={handleTakePhoto} style={[styles.actionFab, { backgroundColor: colors.primary }]}>
                                            <MaterialCommunityIcons name="camera" size={20} color="#000" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handlePickPhoto} style={[styles.actionFab, { backgroundColor: colors.primary }]}>
                                            <MaterialCommunityIcons name="image-multiple" size={20} color="#000" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setPreviewVisible(true)} style={[styles.actionFab, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                                            <MaterialCommunityIcons name="magnify-plus-outline" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                <View style={styles.placeholderContent}>
                                    <View style={[styles.photoIconCircle, { backgroundColor: colors.primary + '20' }]}>
                                        <MaterialCommunityIcons name="truck-outline" size={32} color={colors.primary} />
                                    </View>
                                    <Text style={[styles.photoLabel, { color: colors.textMuted }]}>Upload Machine Photo</Text>

                                    <View style={styles.choiceButtons}>
                                        <TouchableOpacity onPress={handleTakePhoto} style={[styles.choiceBtn, { backgroundColor: colors.primary }]}>
                                            <MaterialCommunityIcons name="camera" size={18} color="#000" />
                                            <Text style={styles.choiceBtnText}>CAMERA</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handlePickPhoto} style={[styles.choiceBtn, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}>
                                            <MaterialCommunityIcons name="image" size={18} color={colors.textMain} />
                                            <Text style={[styles.choiceBtnText, { color: colors.textMain }]}>GALLERY</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>
                        {errors.photo && <Text style={[styles.errorLabel, { color: colors.danger, textAlign: 'center', marginTop: 8 }]}>{errors.photo}</Text>}
                        {photoUri && <Text style={[styles.hintText, { color: colors.textMuted }]}>Tap image to preview full screen</Text>}
                    </View>

                    <View style={[styles.formSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <InputField
                            label="Machine Name / Model"
                            icon="truck-outline"
                            value={formData.name}
                            onChange={(text: string) => setFormData({ ...formData, name: text })}
                            error={errors.name}
                            placeholder="e.g. JCB 3DX Xtra"
                            colors={colors}
                        />

                        <InputField
                            label="Registration / Serial No."
                            icon="card-text-outline"
                            value={formData.registrationNumber}
                            onChange={(text: string) => setFormData({ ...formData, registrationNumber: text.toUpperCase() })}
                            error={errors.registrationNumber}
                            placeholder="e.g. INF-MC-001"
                            autoCapitalize="characters"
                            colors={colors}
                        />

                        {/* Date Picker Field */}
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
                            <View pointerEvents="none">
                                <InputField
                                    label="Purchase Date (Optional)"
                                    icon="calendar-outline"
                                    value={formData.purchaseDate}
                                    placeholder="YYYY-MM-DD"
                                    colors={colors}
                                    editable={false} // Make input read-only as we use picker
                                />
                            </View>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={date}
                                mode="date"
                                is24Hour={true}
                                display="default"
                                onChange={onDateChange}
                            />
                        )}

                    </View>

                    <TouchableOpacity onPress={handleSubmit} disabled={isLoading} style={styles.submitButton}>
                        <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            {isLoading ? <ActivityIndicator color="#000" /> : (
                                <>
                                    <MaterialCommunityIcons name={isEditMode ? "content-save-edit" : "check-decagram"} size={20} color="#000" />
                                    <Text style={styles.submitText}>{isEditMode ? 'Update Details' : 'Save to Fleet Network'}</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

function InputField({ label, icon, value, onChange, error, placeholder, colors, editable = true, ...props }: any) {
    return (
        <View style={styles.fieldWrapper}>
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{label}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }, error && { borderColor: colors.danger }]}>
                <MaterialCommunityIcons name={icon} size={20} color={error ? colors.danger : colors.textMuted} />
                <PaperInput
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    mode="flat"
                    style={styles.textInput}
                    textColor={colors.textMain}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    editable={editable}
                    {...props}
                />
            </View>
            {error && <Text style={[styles.errorLabel, { color: colors.danger }]}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollView: { flex: 1 },
    scrollContent: { padding: 24 },
    photoUploadSection: { marginBottom: 30 },
    photoFrame: { height: 200, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    photoOverlay: { position: 'absolute', bottom: 12, right: 12, flexDirection: 'row', gap: 8 },
    actionFab: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
    placeholderContent: { alignItems: 'center', gap: 14, width: '100%' },
    photoIconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    photoLabel: { fontSize: 14, fontWeight: '800' },
    hintText: { textAlign: 'center', fontSize: 11, marginTop: 8 },
    choiceButtons: { flexDirection: 'row', gap: 12, marginTop: 10, width: '80%', justifyContent: 'center' },
    choiceBtn: { flex: 1, height: 44, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    choiceBtnText: { fontSize: 11, fontWeight: '900' },
    formSection: { borderRadius: 12, padding: 20, borderWidth: 1, gap: 20 },
    fieldWrapper: { gap: 8 },
    inputLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 4 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingLeft: 12 },
    textInput: { flex: 1, backgroundColor: 'transparent', height: 50, fontSize: 15 },
    errorLabel: { fontSize: 11, fontWeight: '600', marginLeft: 4 },
    submitButton: { marginTop: 30, borderRadius: 16, overflow: 'hidden' },
    gradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
    submitText: { fontSize: 15, fontWeight: '900', color: '#000' },
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    fullScreenImage: { width: '100%', height: '90%' },
    closeModal: { position: 'absolute', top: 50, right: 20, zIndex: 10 }
});
