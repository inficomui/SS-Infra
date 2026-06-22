import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal,
    FlatList
} from 'react-native';
import { Text, TextInput as PaperInput, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRegisterOwnerMutation, useRegisterOperatorMutation, useGetPublicOwnersQuery } from '@/redux/apis/authApi';
import { useAppTheme } from '@/hooks/use-theme-color';
import Toast from 'react-native-toast-message';
import { MAHARASHTRA_DATA } from '@/constants/maharashtraData';

export default function RegisterScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors } = useAppTheme();

    // Form fields state
    const [role, setRole] = useState<'Owner' | 'Operator' | 'Driver'>('Owner');
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [district, setDistrict] = useState('');
    const [subdistrict, setSubdistrict] = useState(''); // Displays as subdistrict, maps to taluka in backend
    const [referralCode, setReferralCode] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Dropdown/Modal search states
    const [isOwnerModalVisible, setIsOwnerModalVisible] = useState(false);
    const [ownerSearchQuery, setOwnerSearchQuery] = useState('');
    const [selectedOwner, setSelectedOwner] = useState<any>(null);

    const [isDistrictModalVisible, setIsDistrictModalVisible] = useState(false);
    const [districtSearchQuery, setDistrictSearchQuery] = useState('');

    const [isSubdistrictModalVisible, setIsSubdistrictModalVisible] = useState(false);
    const [subdistrictSearchQuery, setSubdistrictSearchQuery] = useState('');

    const districtsList = Object.keys(MAHARASHTRA_DATA).sort();
    const subdistrictsList = district ? MAHARASHTRA_DATA[district].sort() || [] : [];

    // Filtered lists
    const filteredDistricts = districtsList.filter(dist =>
        dist.toLowerCase().includes(districtSearchQuery.toLowerCase())
    );

    const filteredSubdistricts = subdistrictsList.filter(sub =>
        sub.toLowerCase().includes(subdistrictSearchQuery.toLowerCase())
    );

    // Validation errors state
    const [errors, setErrors] = useState<any>({});

    // Mutations
    const [registerOwner, { isLoading: isRegisteringOwner }] = useRegisterOwnerMutation();
    const [registerOperator, { isLoading: isRegisteringOperator }] = useRegisterOperatorMutation();

    // Query for owners (Skip if role is Owner)
    const { data: ownersData, isLoading: isLoadingOwners } = useGetPublicOwnersQuery(
        { limit: 1000 },
        { skip: role === 'Owner' }
    );

    const ownersList = ownersData?.data?.data || [];

    // Filtered owners list for searching
    const filteredOwners = ownersList.filter((owner: any) =>
        owner.name?.toLowerCase().includes(ownerSearchQuery.toLowerCase()) ||
        owner.company_name?.toLowerCase().includes(ownerSearchQuery.toLowerCase()) ||
        owner.district?.toLowerCase().includes(ownerSearchQuery.toLowerCase())
    );

    const isProcessing = isRegisteringOwner || isRegisteringOperator;

    const validateForm = () => {
        const newErrors: any = {};
        if (!name.trim()) newErrors.name = 'auth.error_name_required';
        
        if (!mobile.trim()) {
            newErrors.mobile = 'auth.error_mobile_required';
        } else if (!/^\d{10}$/.test(mobile)) {
            newErrors.mobile = 'auth.error_mobile_digits';
        }

        if (!password.trim()) {
            newErrors.password = 'auth.error_password_required';
        } else if (password.length < 6) {
            newErrors.password = 'auth.error_password_length';
        }

        if (!district) newErrors.district = 'auth.error_district_required';
        if (!subdistrict) newErrors.subdistrict = 'auth.error_subdistrict_required';

        if (role !== 'Owner' && !selectedOwner) {
            newErrors.owner = 'auth.error_owner_required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleServerErrors = (errorData: any) => {
        const newErrors: any = {};
        let mainMessage = t('auth.registration_failed', { defaultValue: 'Registration Failed' });
        
        if (errorData) {
            if (errorData.errors && typeof errorData.errors === 'object') {
                Object.keys(errorData.errors).forEach((key) => {
                    const messages = errorData.errors[key];
                    const msg = Array.isArray(messages) && messages.length > 0 
                        ? messages[0] 
                        : (typeof messages === 'string' ? messages : '');
                    if (msg) {
                        if (key === 'taluka') {
                            newErrors.subdistrict = msg;
                        } else {
                            newErrors[key] = msg;
                        }
                    }
                });
            }
            if (errorData.message) {
                mainMessage = errorData.message;
            }
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            // Show the first validation error message in the Toast
            const firstKey = Object.keys(newErrors)[0];
            Toast.show({
                type: 'error',
                text1: mainMessage,
                text2: t(newErrors[firstKey], { defaultValue: newErrors[firstKey] })
            });
        } else {
            Toast.show({
                type: 'error',
                text1: t('auth.registration_failed', { defaultValue: 'Registration Failed' }),
                text2: mainMessage || t('common.something_went_wrong', { defaultValue: 'Something went wrong.' })
            });
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Toast.show({
                type: 'error',
                text1: t('common.error', { defaultValue: 'Error' }),
                text2: t('auth.error_fill_fields', { defaultValue: 'Please fill in all required fields correctly.' })
            });
            return;
        }

        const commonPayload = {
            name: name.trim(),
            mobile: mobile.trim(),
            district,
            taluka: subdistrict, // Sent as taluka for backend compatibility
            password,
            referralCode: referralCode.trim() || undefined
        };

        try {
            if (role === 'Owner') {
                const response = await registerOwner(commonPayload).unwrap();
                if (response.success) {
                    Toast.show({
                        type: 'success',
                        text1: t('auth.registration_success', { defaultValue: 'Registration Successful' }),
                        text2: t('auth.login_credentials_msg', { defaultValue: 'Please login using your credentials.' })
                    });
                    setTimeout(() => router.replace('/login'), 1500);
                } else {
                    handleServerErrors(response);
                }
            } else {
                const operatorPayload = {
                    ...commonPayload,
                    role, // 'Operator' or 'Driver'
                    ownerId: selectedOwner.id,
                    owner_id: selectedOwner.id // Send both keys for safety
                };
                const response = await registerOperator(operatorPayload).unwrap();
                if (response.success) {
                    const roleText = role === 'Operator' ? t('owner.mode_operator', { defaultValue: 'Operator' }) : t('owner.mode_driver', { defaultValue: 'Driver' });
                    Toast.show({
                        type: 'success',
                        text1: t('auth.role_registered', { role: roleText, defaultValue: `${role} Registered` }),
                        text2: t('auth.login_mobile_msg', { defaultValue: 'Please login with your mobile number.' })
                    });
                    setTimeout(() => router.replace('/login'), 1500);
                } else {
                    handleServerErrors(response);
                }
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            const errData = error?.data ?? error;
            handleServerErrors(errData);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>
                    {t('auth.register_account', { defaultValue: 'Register Account' })}
                </Text>
                <TouchableOpacity 
                    onPress={() => router.push('/language-selection')} 
                    style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <MaterialCommunityIcons name="translate" size={24} color={colors.textMain} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.iconHeader}>
                        <View style={[styles.mainIcon, { backgroundColor: colors.primary + '15' }]}>
                            <MaterialCommunityIcons
                                name={role === 'Owner' ? 'account-cog' : role === 'Operator' ? 'account-hard-hat' : 'steering'}
                                size={40}
                                color={colors.primary}
                            />
                        </View>
                        <Text style={[styles.formTitle, { color: colors.textMain }]}>
                            {t('auth.create_account', { defaultValue: 'Create Account' })}
                        </Text>
                        <Text style={[styles.formSubtitle, { color: colors.textMuted }]}>
                            {t('auth.register_subtitle', { defaultValue: 'Join the SS Infra ecosystem. Start managing your operations.' })}
                        </Text>
                    </View>

                    {/* Role Selector Tabs */}
                    <View style={[styles.formSection, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 20 }]}>
                        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{t('auth.choose_role', { defaultValue: 'Choose Role' })}</Text>
                        <View style={styles.row}>
                            {(['Owner', 'Operator', 'Driver'] as const).map((r) => (
                                <TouchableOpacity
                                    key={r}
                                    style={[
                                        styles.roleButton,
                                        { borderColor: colors.border, backgroundColor: colors.background },
                                        role === r && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }
                                    ]}
                                    onPress={() => {
                                        setRole(r);
                                        setSelectedOwner(null);
                                    }}
                                >
                                    <Text style={[
                                        styles.roleButtonText,
                                        { color: colors.textMuted },
                                        role === r && { color: colors.primary, fontWeight: '800' }
                                    ]}>
                                        {r === 'Owner' ? t('owner.mode_owner', { defaultValue: 'Owner' }) : r === 'Operator' ? t('owner.mode_operator', { defaultValue: 'Operator' }) : t('owner.mode_driver', { defaultValue: 'Driver' })}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Main Registration Form */}
                    <View style={[styles.formSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        
                        {/* Name Input */}
                        <InputField
                            label={t('auth.full_name_required_label', { defaultValue: 'Full Name *' })}
                            icon="account-outline"
                            value={name}
                            onChange={(text: string) => setName(text)}
                            error={errors.name ? t(errors.name, { defaultValue: errors.name }) : null}
                            placeholder={t('auth.full_name_placeholder', { defaultValue: 'e.g. Rahul Kumar' })}
                            colors={colors}
                        />

                        {/* Mobile Number */}
                        <InputField
                            label={t('auth.mobile_required_label', { defaultValue: 'Mobile Number *' })}
                            icon="phone-outline"
                            value={mobile}
                            onChange={(text: string) => setMobile(text.replace(/[^0-9]/g, ''))}
                            error={errors.mobile ? t(errors.mobile, { defaultValue: errors.mobile }) : null}
                            placeholder={t('auth.mobile_placeholder', { defaultValue: '10 digit mobile number' })}
                            keyboardType="phone-pad"
                            maxLength={10}
                            colors={colors}
                        />

                        {/* Password */}
                        <View style={styles.fieldWrapper}>
                            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('auth.password_required_label', { defaultValue: 'Password *' })}</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }, errors.password && { borderColor: colors.danger }]}>
                                <MaterialCommunityIcons name="lock-outline" size={20} color={errors.password ? colors.danger : colors.textMuted} />
                                <PaperInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder={t('auth.password_placeholder', { defaultValue: 'Min. 6 characters' })}
                                    placeholderTextColor={colors.textMuted}
                                    secureTextEntry={!showPassword}
                                    mode="flat"
                                    style={styles.textInput}
                                    textColor={colors.textMain}
                                    underlineColor="transparent"
                                    activeUnderlineColor="transparent"
                                />
                                <TouchableOpacity 
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={{ paddingRight: 12 }}
                                >
                                    <MaterialCommunityIcons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={colors.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.password && <Text style={[styles.errorLabel, { color: colors.danger }]}>{t(errors.password, { defaultValue: errors.password })}</Text>}
                        </View>

                        {/* District & Subdistrict Search Picker Buttons */}
                        <View style={styles.row}>
                            <View style={{ flex: 1, gap: 8 }}>
                                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('auth.district_required_label', { defaultValue: 'District *' })}</Text>
                                <TouchableOpacity
                                    onPress={() => setIsDistrictModalVisible(true)}
                                    style={[
                                        styles.inputContainer,
                                        { backgroundColor: colors.background, borderColor: colors.border, height: 50 },
                                        errors.district && { borderColor: colors.danger }
                                    ]}>
                                    <MaterialCommunityIcons name="map-marker-outline" size={20} color={errors.district ? colors.danger : colors.textMuted} />
                                    <Text style={{ flex: 1, paddingLeft: 10, color: district ? colors.textMain : colors.textMuted, fontSize: 13 }} numberOfLines={1}>
                                        {district || t('auth.district_placeholder', { defaultValue: 'District' })}
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textMuted} style={{ paddingRight: 12 }} />
                                </TouchableOpacity>
                                {errors.district && <Text style={[styles.errorLabel, { color: colors.danger }]}>{t(errors.district, { defaultValue: errors.district })}</Text>}
                            </View>
                            
                            <View style={{ flex: 1, gap: 8 }}>
                                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('auth.subdistrict_required_label', { defaultValue: 'Subdistrict *' })}</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        if (district) {
                                            setIsSubdistrictModalVisible(true);
                                        } else {
                                            Toast.show({ type: 'info', text1: t('auth.select_district_first', { defaultValue: 'Select District First' }) });
                                        }
                                    }}
                                    style={[
                                        styles.inputContainer,
                                        { backgroundColor: colors.background, borderColor: colors.border, height: 50 },
                                        errors.subdistrict && { borderColor: colors.danger }
                                    ]}>
                                    <MaterialCommunityIcons name="map-outline" size={20} color={errors.subdistrict ? colors.danger : colors.textMuted} />
                                    <Text style={{ flex: 1, paddingLeft: 10, color: subdistrict ? colors.textMain : colors.textMuted, fontSize: 13 }} numberOfLines={1}>
                                        {subdistrict || t('auth.subdistrict_placeholder', { defaultValue: 'Subdistrict' })}
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textMuted} style={{ paddingRight: 12 }} />
                                </TouchableOpacity>
                                {errors.subdistrict && <Text style={[styles.errorLabel, { color: colors.danger }]}>{t(errors.subdistrict, { defaultValue: errors.subdistrict })}</Text>}
                            </View>
                        </View>

                        {/* Owner Selection for Operators and Drivers */}
                        {role !== 'Owner' && (
                            <View style={styles.fieldWrapper}>
                                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('auth.select_owner_required_label', { defaultValue: 'Select Owner *' })}</Text>
                                <TouchableOpacity
                                    onPress={() => setIsOwnerModalVisible(true)}
                                    style={[
                                        styles.inputContainer,
                                        { backgroundColor: colors.background, borderColor: colors.border, height: 50 },
                                        errors.owner && { borderColor: colors.danger }
                                    ]}>
                                    <MaterialCommunityIcons name="account-search-outline" size={20} color={errors.owner ? colors.danger : colors.textMuted} />
                                    <Text style={{ flex: 1, paddingLeft: 10, color: selectedOwner ? colors.textMain : colors.textMuted, fontSize: 13 }} numberOfLines={1}>
                                        {selectedOwner
                                            ? `${selectedOwner.name} ${selectedOwner.company_name ? `(${selectedOwner.company_name})` : ''}`
                                            : t('auth.select_owner_placeholder', { defaultValue: 'Select Owner from list' })}
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textMuted} style={{ paddingRight: 12 }} />
                                </TouchableOpacity>
                                {errors.owner && <Text style={[styles.errorLabel, { color: colors.danger }]}>{t(errors.owner, { defaultValue: errors.owner })}</Text>}
                            </View>
                        )}

                        {/* Referral Code */}
                        <InputField
                            label={t('auth.referral_code_label', { defaultValue: 'Referral Code (Optional)' })}
                            icon="pound"
                            value={referralCode}
                            onChange={(text: string) => setReferralCode(text)}
                            placeholder={t('auth.referral_code_placeholder', { defaultValue: 'Enter Referral Code' })}
                            colors={colors}
                        />

                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity onPress={handleSubmit} disabled={isProcessing} style={styles.submitButton}>
                        <LinearGradient colors={['#0284C7', '#38BDF8']} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            {isProcessing ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <MaterialCommunityIcons name="account-plus-outline" size={20} color="#fff" />
                                    <Text style={[styles.submitText, { color: '#fff' }]}>
                                        {t('auth.register_now_btn', { defaultValue: 'Register Now' })}
                                    </Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Login Link */}
                    <TouchableOpacity
                        onPress={() => router.replace('/login')}
                        style={styles.loginLink}
                    >
                        <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
                            {t('auth.already_have_account', { defaultValue: 'Already have an account? ' })}<Text style={{ color: colors.primary, fontWeight: 'bold' }}>{t('auth.login_link', { defaultValue: 'Login' })}</Text>
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* District Search Modal */}
            <Modal
                visible={isDistrictModalVisible}
                animationType="slide"
                onRequestClose={() => setIsDistrictModalVisible(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={() => { setIsDistrictModalVisible(false); setDistrictSearchQuery(''); }} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <MaterialCommunityIcons name="close" size={24} color={colors.textMain} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.textMain }]}>{t('auth.select_district_title', { defaultValue: 'Select District' })}</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    <View style={styles.modalSearchWrapper}>
                        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, height: 50 }]}>
                            <MaterialCommunityIcons name="magnify" size={22} color={colors.textMuted} />
                            <PaperInput
                                value={districtSearchQuery}
                                onChangeText={setDistrictSearchQuery}
                                placeholder={t('auth.search_district_placeholder', { defaultValue: 'Search District' })}
                                placeholderTextColor={colors.textMuted}
                                mode="flat"
                                style={styles.textInput}
                                textColor={colors.textMain}
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                            />
                        </View>
                    </View>

                    <FlatList
                        data={filteredDistricts}
                        keyExtractor={(item) => item}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    setDistrict(item);
                                    setSubdistrict(''); // Clear subdistrict when district changes
                                    setIsDistrictModalVisible(false);
                                    setDistrictSearchQuery('');
                                }}
                                style={[styles.selectItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                            >
                                <Text style={[styles.selectItemText, { color: colors.textMain }]}>{item}</Text>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>

            {/* Subdistrict Search Modal */}
            <Modal
                visible={isSubdistrictModalVisible}
                animationType="slide"
                onRequestClose={() => setIsSubdistrictModalVisible(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={() => { setIsSubdistrictModalVisible(false); setSubdistrictSearchQuery(''); }} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <MaterialCommunityIcons name="close" size={24} color={colors.textMain} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.textMain }]}>{t('auth.select_subdistrict_title', { defaultValue: 'Select Subdistrict' })}</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    <View style={styles.modalSearchWrapper}>
                        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, height: 50 }]}>
                            <MaterialCommunityIcons name="magnify" size={22} color={colors.textMuted} />
                            <PaperInput
                                value={subdistrictSearchQuery}
                                onChangeText={setSubdistrictSearchQuery}
                                placeholder={t('auth.search_subdistrict_placeholder', { defaultValue: 'Search Subdistrict' })}
                                placeholderTextColor={colors.textMuted}
                                mode="flat"
                                style={styles.textInput}
                                textColor={colors.textMain}
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                            />
                        </View>
                    </View>

                    <FlatList
                        data={filteredSubdistricts}
                        keyExtractor={(item) => item}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    setSubdistrict(item);
                                    setIsSubdistrictModalVisible(false);
                                    setSubdistrictSearchQuery('');
                                }}
                                style={[styles.selectItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                            >
                                <Text style={[styles.selectItemText, { color: colors.textMain }]}>{item}</Text>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>

            {/* Owner Search Modal */}
            <Modal
                visible={isOwnerModalVisible}
                animationType="slide"
                onRequestClose={() => setIsOwnerModalVisible(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={() => { setIsOwnerModalVisible(false); setOwnerSearchQuery(''); }} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <MaterialCommunityIcons name="close" size={24} color={colors.textMain} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.textMain }]}>{t('auth.select_owner_title', { defaultValue: 'Select Owner' })}</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    <View style={styles.modalSearchWrapper}>
                        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, height: 50 }]}>
                            <MaterialCommunityIcons name="magnify" size={22} color={colors.textMuted} />
                            <PaperInput
                                value={ownerSearchQuery}
                                onChangeText={setOwnerSearchQuery}
                                placeholder={t('auth.search_owner_placeholder', { defaultValue: 'Search by name, company, or district' })}
                                placeholderTextColor={colors.textMuted}
                                mode="flat"
                                style={styles.textInput}
                                textColor={colors.textMain}
                                underlineColor="transparent"
                                activeUnderlineColor="transparent"
                            />
                        </View>
                    </View>

                    {isLoadingOwners ? (
                        <View style={styles.loadingWrapper}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[styles.loadingText, { color: colors.textMuted }]}>{t('auth.loading_owners', { defaultValue: 'Loading owners list...' })}</Text>
                        </View>
                    ) : filteredOwners.length === 0 ? (
                        <View style={styles.emptyWrapper}>
                            <MaterialCommunityIcons name="account-search-outline" size={60} color={colors.textMuted} />
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('auth.no_owners_found', { defaultValue: 'No owners found matching search.' })}</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredOwners}
                            keyExtractor={(item) => String(item.id)}
                            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedOwner(item);
                                        setIsOwnerModalVisible(false);
                                        setOwnerSearchQuery('');
                                    }}
                                    style={[styles.ownerItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                                >
                                    <View style={styles.ownerItemInfo}>
                                        <Text style={[styles.ownerItemName, { color: colors.textMain }]}>{item.name}</Text>
                                        {item.company_name ? (
                                            <Text style={[styles.ownerItemCompany, { color: colors.primary }]}>{item.company_name}</Text>
                                        ) : null}
                                        <Text style={[styles.ownerItemLocation, { color: colors.textMuted }]}>
                                            {item.district}, {item.taluka}
                                        </Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
}

function InputField({ label, icon, value, onChange, error, placeholder, colors, ...props }: any) {
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
    iconHeader: { alignItems: 'center', marginBottom: 30 },
    mainIcon: { width: 80, height: 80, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    formTitle: { fontSize: 24, fontWeight: '900', marginBottom: 8 },
    formSubtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20 },
    formSection: { borderRadius: 12, padding: 20, borderWidth: 1, gap: 20 },
    row: { flexDirection: 'row', gap: 12 },
    fieldWrapper: { gap: 8 },
    inputLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 4 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingLeft: 12, flex: 1 },
    textInput: { flex: 1, backgroundColor: 'transparent', height: 50, fontSize: 15 },
    errorLabel: { fontSize: 11, fontWeight: '600', marginLeft: 4 },
    submitButton: { marginTop: 24, borderRadius: 16, overflow: 'hidden' },
    gradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
    submitText: { fontSize: 15, fontWeight: '900' },
    sectionHeader: { fontSize: 14, fontWeight: '800', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
    roleButton: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
    roleButtonText: { fontSize: 13, fontWeight: '600' },
    loginLink: { marginTop: 20, marginBottom: 40 },
    
    // Modal Styles
    modalContainer: { flex: 1 },
    modalHeader: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0 },
    modalTitle: { fontSize: 18, fontWeight: '900' },
    modalSearchWrapper: { paddingHorizontal: 24, paddingVertical: 16 },
    loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 15, fontWeight: '600' },
    emptyWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyText: { marginTop: 12, fontSize: 15, fontWeight: '600', textAlign: 'center' },
    ownerItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
    ownerItemInfo: { flex: 1 },
    ownerItemName: { fontSize: 16, fontWeight: '700' },
    ownerItemCompany: { fontSize: 13, fontWeight: '600', marginTop: 2 },
    ownerItemLocation: { fontSize: 12, marginTop: 4 },
    
    // Select item list
    selectItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
    selectItemText: { fontSize: 15, fontWeight: '700' }
});
