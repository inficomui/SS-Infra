import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { Text, TextInput as PaperInput, ActivityIndicator, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, updateUser } from '@/redux/slices/authSlice';
import { useAppTheme } from '@/hooks/use-theme-color';
import Toast from 'react-native-toast-message';
import { useUpdateProfileMutation } from '@/redux/apis/authApi';

export default function EditProfileScreen() {
    const router = useRouter();
    const { colors, isDark } = useAppTheme();
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        mobile: user?.mobile || '',
        district: user?.district || '',
        taluka: user?.taluka || '',
    });

    const handleUpdate = async () => {
        try {
            const result = await updateProfile(formData).unwrap();

            // specific logic to handle if the backend returns the updated user object
            if (result.user) {
                dispatch(updateUser(result.user));
            }

            Toast.show({
                type: 'success',
                text1: 'Profile Updated',
                text2: result.message || 'Your changes have been saved.'
            });

            setTimeout(() => router.back(), 1000);
        } catch (error: any) {
            console.error('Update Profile Error:', error);
            Toast.show({
                type: 'error',
                text1: 'Update Failed',
                text2: error?.data?.message || 'Could not update profile details.'
            });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Update Profile</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarWrapper}>
                            <Avatar.Text
                                size={100}
                                label={user?.name ? user.name.substring(0, 2).toUpperCase() : 'OW'}
                                style={{ backgroundColor: colors.primary }}
                                color="#000"
                            />
                            <TouchableOpacity style={[styles.editBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                                <MaterialCommunityIcons name="camera" size={18} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <InputField
                            label="Full Name"
                            icon="account-outline"
                            value={formData.name}
                            onChange={(text: string) => setFormData({ ...formData, name: text })}
                            colors={colors}
                        />
                        <InputField
                            label="Email Address"
                            icon="email-outline"
                            value={formData.email}
                            onChange={(text: string) => setFormData({ ...formData, email: text })}
                            keyboardType="email-address"
                            colors={colors}
                        />
                        <InputField
                            label="Mobile Number"
                            icon="phone-outline"
                            value={formData.mobile}
                            onChange={(text: string) => setFormData({ ...formData, mobile: text })}
                            keyboardType="phone-pad"
                            colors={colors}
                        />
                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <InputField
                                    label="District"
                                    icon="map-marker-outline"
                                    value={formData.district}
                                    onChange={(text: string) => setFormData({ ...formData, district: text })}
                                    colors={colors}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <InputField
                                    label="Taluka"
                                    icon="map-outline"
                                    value={formData.taluka}
                                    onChange={(text: string) => setFormData({ ...formData, taluka: text })}
                                    colors={colors}
                                />
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity onPress={handleUpdate} disabled={isLoading} style={styles.saveButton}>
                        <LinearGradient
                            colors={[colors.primary, colors.secondary]}
                            style={styles.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {isLoading ? <ActivityIndicator color="#000" /> : (
                                <>
                                    <MaterialCommunityIcons name="content-save-check-outline" size={20} color="#000" />
                                    <Text style={styles.saveText}>Save Changes</Text>
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

function InputField({ label, icon, value, onChange, colors, ...props }: any) {
    return (
        <View style={styles.fieldWrapper}>
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{label}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <MaterialCommunityIcons name={icon} size={20} color={colors.textMuted} />
                <PaperInput
                    value={value}
                    onChangeText={onChange}
                    mode="flat"
                    style={styles.textInput}
                    textColor={colors.textMain}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    placeholderTextColor={colors.textMuted}
                    {...props}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { flex: 1, paddingHorizontal: 24 },
    avatarSection: { alignItems: 'center', paddingVertical: 30 },
    avatarWrapper: { position: 'relative' },
    editBadge: { position: 'absolute', bottom: 0, right: 0, width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3 },
    formCard: { borderRadius: 24, padding: 20, borderWidth: 1, gap: 20 },
    fieldWrapper: { gap: 8 },
    inputLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 4 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingLeft: 12 },
    textInput: { flex: 1, backgroundColor: 'transparent', height: 48, fontSize: 14 },
    row: { flexDirection: 'row', gap: 12 },
    saveButton: { marginTop: 30, borderRadius: 16, overflow: 'hidden' },
    gradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
    saveText: { fontSize: 15, fontWeight: '900', color: '#000' },
});
