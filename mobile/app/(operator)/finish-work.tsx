import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useFinishWorkMutation } from '@/redux/apis/workApi';
import { useAppTheme } from '@/hooks/use-theme-color';

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export default function FinishWorkScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const params = useLocalSearchParams();
    const { elapsedSeconds, clientName, location, workId } = params;
    const [finishWork, { isLoading: isSubmitting }] = useFinishWorkMutation();

    const [photoUri, setPhotoUri] = useState<string | null>(null);

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permission is required.');
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
    };

    const handlePickPhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Gallery permission is required.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const handleCapturePhoto = () => {
        Alert.alert(
            "Proof of Completion",
            "How would you like to upload the photo?",
            [
                { text: "Camera", onPress: handleTakePhoto },
                { text: "Gallery", onPress: handlePickPhoto },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const handleFinish = async () => {
        if (!photoUri) {
            Alert.alert("Photo Required", "Please upload a photo of the completed work site.");
            return;
        }

        if (!workId) {
            Alert.alert("Error", "Work ID missing.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('workSessionId', workId as string);
            formData.append('finishedAt', new Date().toISOString());

            // Convert seconds to decimal hours (e.g. 1h 30m = 1.5)
            const hours = (Number(elapsedSeconds) / 3600).toFixed(2);
            formData.append('totalHours', hours);

            const filename = photoUri.split('/').pop() || 'finish_work_photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            // @ts-ignore
            formData.append('afterPhoto', {
                uri: photoUri,
                name: filename,
                type: type
            });

            await finishWork(formData).unwrap();

            router.push({
                pathname: '/(operator)/create-bill',
                params: {
                    ...params,
                    afterWorkPhoto: photoUri
                }
            });
        } catch (error: any) {
            console.error("Finish Work Error:", error);
            const msg = error?.data?.message || error?.message || "Failed to submit completion logs.";
            Alert.alert("Error", msg);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Final Logs</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>Session Summary</Text>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.summaryRow}>
                        <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                            <MaterialCommunityIcons name="timer-sand" size={32} color={colors.primary} />
                        </View>
                        <View>
                            <Text style={[styles.label, { color: colors.textMuted }]}>Total Billed Time</Text>
                            <Text style={[styles.value, { color: colors.textMain }]}>{formatTime(Number(elapsedSeconds) || 0)}</Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.clientInfo}>
                        <Text style={[styles.label, { color: colors.textMuted }]}>Project / Client</Text>
                        <Text style={[styles.clientValue, { color: colors.textMain }]}>{clientName || 'SS Infra Site'}</Text>
                        <Text style={[styles.subValue, { color: colors.textMuted }]}>
                            <MaterialCommunityIcons name="map-marker" size={12} color={colors.primary} /> {location || 'Site Location'}
                        </Text>
                    </View>
                </View>

                <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>Completion Proof</Text>
                <TouchableOpacity onPress={handleCapturePhoto} activeOpacity={0.8}>
                    <View style={[
                        styles.photoBox,
                        {
                            backgroundColor: colors.card,
                            borderColor: photoUri ? colors.primary : colors.border,
                            borderStyle: photoUri ? 'solid' : 'dashed'
                        }
                    ]}>
                        {photoUri ? (
                            <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
                        ) : (
                            <View style={styles.placeholder}>
                                <View style={[styles.cameraCircle, { backgroundColor: colors.background }]}>
                                    <MaterialCommunityIcons name="camera-plus-outline" size={40} color={colors.primary} />
                                </View>
                                <Text style={[styles.placeholderText, { color: colors.textMuted }]}>Click After-Work Photo</Text>
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

            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleFinish}
                    disabled={isSubmitting}
                >
                    <LinearGradient
                        colors={[colors.primary, colors.primary]}
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="file-document-edit-outline" size={24} color="#000" />
                                <Text style={styles.btnText}>GENERATE INVOICE</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { padding: 24 },
    card: { borderRadius: 12, padding: 24, marginBottom: 30, borderWidth: 1 },
    sectionHeader: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
    summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    iconBox: { width: 64, height: 64, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    label: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
    value: { fontSize: 32, fontWeight: '900' },
    clientInfo: { gap: 4 },
    clientValue: { fontSize: 18, fontWeight: '800' },
    subValue: { fontSize: 13, fontWeight: '600' },
    divider: { height: 1, marginVertical: 20 },
    photoBox: { height: 240, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    placeholder: { alignItems: 'center', gap: 12 },
    cameraCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
    placeholderText: { fontSize: 14, fontWeight: '800' },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    editBadge: { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    footer: { padding: 24, borderTopWidth: 1 },
    submitBtn: { height: 64, borderRadius: 16, overflow: 'hidden' },
    gradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
    btnText: { fontSize: 16, fontWeight: '900', color: '#000', letterSpacing: 1 }
});
