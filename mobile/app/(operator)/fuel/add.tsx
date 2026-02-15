import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useAddFuelLogMutation } from '@/redux/apis/fuelApi';
import { useGetMachinesQuery } from '@/redux/apis/ownerApi';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddFuelLogScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();

    // Form State
    const [machineId, setMachineId] = useState('');
    const [fuelLiters, setFuelLiters] = useState('');
    const [amount, setAmount] = useState('');
    const [logDate, setLogDate] = useState(new Date());
    const [readingBefore, setReadingBefore] = useState<any>(null);
    const [readingAfter, setReadingAfter] = useState<any>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Mutations
    const [addFuelLog, { isLoading }] = useAddFuelLogMutation();
    const { data: machinesData } = useGetMachinesQuery();

    const pickImage = async (type: 'before' | 'after') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            if (type === 'before') setReadingBefore(result.assets[0]);
            else setReadingAfter(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!machineId || !fuelLiters || !amount) {
            Alert.alert("Error", "Please fill all required fields.");
            return;
        }

        const formData = new FormData();
        formData.append('machine_id', machineId);
        formData.append('fuel_liters', fuelLiters);
        formData.append('amount', amount);
        formData.append('log_date', logDate.toISOString().split('T')[0]);

        if (readingBefore) {
            formData.append('reading_before_image', {
                uri: readingBefore.uri,
                type: 'image/jpeg',
                name: 'reading_before.jpg',
            } as any);
        }

        if (readingAfter) {
            formData.append('reading_after_image', {
                uri: readingAfter.uri,
                type: 'image/jpeg',
                name: 'reading_after.jpg',
            } as any);
        }

        try {
            await addFuelLog(formData).unwrap();
            Alert.alert("Success", "Fuel log added successfully!");
            router.back();
        } catch (error: any) {
            Alert.alert("Error", error?.data?.message || "Failed to add fuel log.");
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
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Add Fuel Log</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Machine Selector (Simple Scroll) */}
                <Text style={[styles.label, { color: colors.textMuted }]}>Select Machine</Text>
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
                    <Text style={[styles.label, { color: colors.textMuted }]}>Fuel Details</Text>
                    <TextInput
                        label="Liters"
                        value={fuelLiters}
                        onChangeText={setFuelLiters}
                        keyboardType="numeric"
                        mode="outlined"
                        style={{ backgroundColor: colors.background, marginBottom: 12 }}
                        outlineColor={colors.border}
                        activeOutlineColor={colors.primary}
                    />
                    <TextInput
                        label="Amount (₹)"
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
                    <Text style={[styles.label, { color: colors.textMuted }]}>Date</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.dateInput, { borderColor: colors.border }]}>
                        <Text style={{ color: colors.textMain }}>{logDate.toLocaleDateString()}</Text>
                        <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Image Uploads */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Meter Readings (Optional)</Text>

                    <View style={styles.imageRow}>
                        <TouchableOpacity style={[styles.imageUpload, { borderColor: colors.border }]} onPress={() => pickImage('before')}>
                            {readingBefore ? (
                                <Image source={{ uri: readingBefore.uri }} style={styles.uploadedImage} />
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="camera-plus" size={24} color={colors.textMuted} />
                                    <Text style={{ fontSize: 10, marginTop: 4, color: colors.textMuted }}>Before</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.imageUpload, { borderColor: colors.border }]} onPress={() => pickImage('after')}>
                            {readingAfter ? (
                                <Image source={{ uri: readingAfter.uri }} style={styles.uploadedImage} />
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="camera-plus" size={24} color={colors.textMuted} />
                                    <Text style={{ fontSize: 10, marginTop: 4, color: colors.textMuted }}>After</Text>
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
                    Submit Log
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
    iconButton: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollContent: { padding: 24, paddingBottom: 40 },
    label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    machineScroll: { flexDirection: 'row', marginBottom: 12 },
    machineChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1, marginRight: 8 },
    inputGroup: { marginBottom: 24 },
    dateInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderWidth: 1, borderRadius: 4 },
    imageRow: { flexDirection: 'row', gap: 16 },
    imageUpload: { width: 100, height: 100, borderWidth: 1, borderStyle: 'dashed', borderRadius: 8, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    uploadedImage: { width: '100%', height: '100%' }
});
