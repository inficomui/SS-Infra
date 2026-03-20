import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Text, TextInput as PaperInput, ActivityIndicator, HelperText, Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAddOperatorMutation } from '@/redux/apis/ownerApi';
import { useAppTheme } from '@/hooks/use-theme-color';
import Toast from 'react-native-toast-message';
import { MAHARASHTRA_DATA } from '@/constants/maharashtraData';

export default function AddOperatorScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors } = useAppTheme();
    const [addOperator, { isLoading: isAdding }] = useAddOperatorMutation();

    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        district: '',
        taluka: '',
        role: 'Operator' as 'Operator' | 'Driver',
        license_number: '',
        assigned_vehicle: '',
        // Salary fields
        salaryType: 'none',     // 'daily' | 'monthly' | 'none'
        salaryAmount: '',
    });

    const [showDistrictMenu, setShowDistrictMenu] = useState(false);
    const [showTalukaMenu, setShowTalukaMenu] = useState(false);

    const districts = Object.keys(MAHARASHTRA_DATA).sort();
    const talukas = formData.district ? MAHARASHTRA_DATA[formData.district].sort() || [] : [];

    const [errors, setErrors] = useState<any>({});

    const validateForm = () => {
        const newErrors: any = {};
        if (!formData.name.trim()) newErrors.name = t('owner.name_required_msg');
        if (!formData.mobile.trim()) {
            newErrors.mobile = t('owner.mobile_required_msg');
        } else if (!/^\d{10}$/.test(formData.mobile)) {
            newErrors.mobile = t('owner.invalid_mobile_msg');
        }
        if (!formData.district.trim()) newErrors.district = t('owner.district_required_msg');
        if (!formData.taluka.trim()) newErrors.taluka = t('owner.taluka_required_msg');

        if (formData.role === 'Driver' && !formData.license_number.trim()) {
            newErrors.license_number = t('owner.license_required_msg');
        }

        if (formData.salaryType !== 'none' && !formData.salaryAmount) {
            newErrors.salaryAmount = t('owner.salary_required_msg');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            // Build payload using API convenience salary fields
            const registerPayload: any = {
                name: formData.name.trim(),
                mobile: formData.mobile.trim(),
                district: formData.district,
                taluka: formData.taluka,
                role: formData.role,
            };

            // Use convenience shorthand instead of sending both salaryType + salaryAmount
            if (formData.salaryType === 'monthly' && formData.salaryAmount) {
                registerPayload.fixedMonthly = Number(formData.salaryAmount);
            } else if (formData.salaryType === 'daily' && formData.salaryAmount) {
                registerPayload.perDayWise = Number(formData.salaryAmount);
            }
            // salaryType=none → don't send any salary fields; API defaults to none/0

            // Driver-only fields
            if (formData.role === 'Driver') {
                registerPayload.license_number = formData.license_number.trim();
                if (formData.assigned_vehicle.trim()) {
                    registerPayload.assigned_vehicle = formData.assigned_vehicle.trim();
                }
            }

            const result = await addOperator(registerPayload).unwrap();

            const workerName = result.worker?.name ?? formData.name;
            const successMsgKey = formData.role === 'Operator'
                ? 'owner.op_added_success_msg'
                : 'owner.dr_added_success_msg';

            Toast.show({
                type: 'success',
                text1: formData.role === 'Operator'
                    ? t('owner.op_registered_success')
                    : t('owner.dr_registered_success', { defaultValue: 'Driver Registered Successfully' }),
                text2: t(successMsgKey, { name: workerName }),
            });

            setTimeout(() => router.back(), 1500);

        } catch (error: any) {
            console.error('Register Worker Error:', JSON.stringify(error, null, 2));

            const errData = error?.data ?? error;
            const status = error?.status;

            // --- Subscription expired (403 with subscription_expired flag) ---
            if (status === 403 && errData?.subscription_expired) {
                Toast.show({
                    type: 'error',
                    text1: 'Subscription Expired',
                    text2: errData.message || 'Renew your plan to add workers.',
                });
                setTimeout(() => router.push({ pathname: '/(common)/plans' as any, params: { source: 'expired' } }), 1800);
                return;
            }

            // --- Field-level validation errors from API (400) ---
            if (errData?.errors && typeof errData.errors === 'object') {
                const apiErrors: any = {};
                // Map API field names → form keys
                Object.entries(errData.errors).forEach(([field, messages]) => {
                    apiErrors[field] = Array.isArray(messages)
                        ? (messages as string[])[0]
                        : messages;
                });
                setErrors(apiErrors);
                Toast.show({
                    type: 'error',
                    text1: t('owner.reg_failed'),
                    text2: errData.message || t('owner.check_fields'),
                });
                return;
            }

            // --- Generic error ---
            Toast.show({
                type: 'error',
                text1: t('owner.reg_failed'),
                text2: errData?.message || error?.message || t('owner.failed_add_op'),
            });
        }
    };

    const isProcessing = isAdding;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>
                    {t('owner.new_operator_title')}
                </Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.iconHeader}>
                        <View style={[styles.mainIcon, { backgroundColor: colors.primary + '15' }]}>
                            <MaterialCommunityIcons
                                name={formData.role === 'Operator' ? 'account-hard-hat' : 'steering'}
                                size={40}
                                color={colors.primary}
                            />
                        </View>
                        <Text style={[styles.formTitle, { color: colors.textMain }]}>
                            {formData.role === 'Operator' ? t('owner.register_operator') : t('owner.register_driver')}
                        </Text>
                        <Text style={[styles.formSubtitle, { color: colors.textMuted }]}>
                            {formData.role === 'Operator'
                                ? t('owner.add_operator_hint')
                                : t('owner.add_driver_hint')}
                        </Text>
                    </View>

                    <View style={[styles.formSection, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 20 }]}>
                        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{t('owner.select_role')}</Text>
                        <View style={styles.row}>
                            {(['Operator', 'Driver'] as const).map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[
                                        styles.salaryTypeButton,
                                        { borderColor: colors.border, backgroundColor: colors.background },
                                        formData.role === role && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }
                                    ]}
                                    onPress={() => setFormData({ ...formData, role })}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <MaterialCommunityIcons
                                            name={role === 'Operator' ? 'account-hard-hat' : 'steering'}
                                            size={18}
                                            color={formData.role === role ? colors.primary : colors.textMuted}
                                        />
                                        <Text style={[
                                            styles.salaryTypeText,
                                            { color: colors.textMuted },
                                            formData.role === role && { color: colors.primary, fontWeight: '800' }
                                        ]}>
                                            {role === 'Operator' ? t('owner.operator') : t('owner.driver')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={[styles.formSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <InputField
                            label={t('owner.legal_full_name')}
                            icon="account-outline"
                            value={formData.name}
                            onChange={(text: string) => setFormData({ ...formData, name: text })}
                            error={errors.name}
                            placeholder={t('owner.rahul_sharma')}
                            colors={colors}
                        />

                        <InputField
                            label={t('owner.contact_number')}
                            icon="phone-outline"
                            value={formData.mobile}
                            onChange={(text: string) => setFormData({ ...formData, mobile: text.replace(/[^0-9]/g, '') })}
                            error={errors.mobile}
                            placeholder={t('owner.mobile_hint')}
                            keyboardType="phone-pad"
                            maxLength={10}
                            colors={colors}
                        />

                        {formData.role === 'Driver' && (
                            <>
                                <InputField
                                    label={t('owner.license_number')}
                                    icon="card-account-details-outline"
                                    value={formData.license_number}
                                    onChange={(text: string) => setFormData({ ...formData, license_number: text.toUpperCase() })}
                                    error={errors.license_number}
                                    placeholder={t('owner.license_placeholder')}
                                    colors={colors}
                                />
                                <InputField
                                    label={t('owner.assigned_vehicle', 'Assigned Vehicle (Optional)')}
                                    icon="truck-outline"
                                    value={formData.assigned_vehicle}
                                    onChange={(text: string) => setFormData({ ...formData, assigned_vehicle: text })}
                                    error={errors.assigned_vehicle}
                                    placeholder={t('owner.assigned_vehicle_placeholder', 'e.g. JCB-001, TN-02-AB-1234')}
                                    colors={colors}
                                />
                            </>
                        )}

                        <View style={styles.row}>
                            <View style={{ flex: 1, gap: 8 }}>
                                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('owner.district')}</Text>
                                <Menu
                                    visible={showDistrictMenu}
                                    onDismiss={() => setShowDistrictMenu(false)}
                                    anchor={
                                        <TouchableOpacity
                                            onPress={() => setShowDistrictMenu(true)}
                                            style={[
                                                styles.inputContainer,
                                                { backgroundColor: colors.background, borderColor: colors.border, height: 50 },
                                                errors.district && { borderColor: colors.danger }
                                            ]}>
                                            <MaterialCommunityIcons name="map-marker-outline" size={20} color={errors.district ? colors.danger : colors.textMuted} />
                                            <Text style={{ flex: 1, paddingLeft: 10, color: formData.district ? colors.textMain : colors.textMuted, fontSize: 13 }}>
                                                {formData.district || t('operator.district_placeholder')}
                                            </Text>
                                            <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textMuted} style={{ paddingRight: 12 }} />
                                        </TouchableOpacity>
                                    }
                                >
                                    {districts.map(dist => (
                                        <Menu.Item
                                            key={dist}
                                            onPress={() => {
                                                setFormData({ ...formData, district: dist, taluka: '' });
                                                setShowDistrictMenu(false);
                                            }}
                                            title={dist}
                                        />
                                    ))}
                                </Menu>
                                {errors.district && <Text style={[styles.errorLabel, { color: colors.danger }]}>{errors.district}</Text>}
                            </View>
                            <View style={{ flex: 1, gap: 8 }}>
                                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('owner.taluka')}</Text>
                                <Menu
                                    visible={showTalukaMenu}
                                    onDismiss={() => setShowTalukaMenu(false)}
                                    anchor={
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (formData.district) setShowTalukaMenu(true);
                                                else Toast.show({ type: 'info', text1: 'Select District First' });
                                            }}
                                            style={[
                                                styles.inputContainer,
                                                { backgroundColor: colors.background, borderColor: colors.border, height: 50 },
                                                errors.taluka && { borderColor: colors.danger }
                                            ]}>
                                            <MaterialCommunityIcons name="map-outline" size={20} color={errors.taluka ? colors.danger : colors.textMuted} />
                                            <Text style={{ flex: 1, paddingLeft: 10, color: formData.taluka ? colors.textMain : colors.textMuted, fontSize: 13 }}>
                                                {formData.taluka || t('operator.taluka_placeholder')}
                                            </Text>
                                            <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textMuted} style={{ paddingRight: 12 }} />
                                        </TouchableOpacity>
                                    }
                                >
                                    {talukas.map(taluka => (
                                        <Menu.Item
                                            key={taluka}
                                            onPress={() => {
                                                setFormData({ ...formData, taluka: taluka });
                                                setShowTalukaMenu(false);
                                            }}
                                            title={taluka}
                                        />
                                    ))}
                                </Menu>
                                {errors.taluka && <Text style={[styles.errorLabel, { color: colors.danger }]}>{errors.taluka}</Text>}
                            </View>
                        </View>
                    </View>

                    <View style={[styles.formSection, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 20 }]}>
                        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{t('owner.salary_config')}</Text>

                        <View style={styles.salaryTypeContainer}>
                            <View style={styles.row}>
                                {[
                                    { key: 'none', label: t('owner.none'), icon: 'cash-off' },
                                    { key: 'monthly', label: t('owner.monthly'), icon: 'calendar-month' },
                                    { key: 'daily', label: t('owner.daily'), icon: 'calendar-today' }
                                ].map(({ key, label, icon }) => (
                                    <TouchableOpacity
                                        key={key}
                                        style={[
                                            styles.salaryTypeButton,
                                            { borderColor: colors.border, backgroundColor: colors.background },
                                            formData.salaryType === key && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }
                                        ]}
                                        onPress={() => setFormData({ ...formData, salaryType: key as any })}
                                    >
                                        <MaterialCommunityIcons
                                            name={icon as any}
                                            size={20}
                                            color={formData.salaryType === key ? colors.primary : colors.textMuted}
                                            style={{ marginBottom: 4 }}
                                        />
                                        <Text style={[
                                            styles.salaryTypeText,
                                            { color: colors.textMuted },
                                            formData.salaryType === key && { color: colors.primary, fontWeight: '800' }
                                        ]}>
                                            {label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {formData.salaryType !== 'none' && (
                            <InputField
                                label={formData.salaryType === 'monthly' ? t('owner.monthly_amount') : t('owner.daily_wage')}
                                icon="cash-multiple"
                                value={formData.salaryAmount}
                                onChange={(text: string) => setFormData({ ...formData, salaryAmount: text.replace(/[^0-9]/g, '') })}
                                error={errors.salaryAmount}
                                placeholder={formData.salaryType === 'monthly' ? 'e.g. 15000' : 'e.g. 700'}
                                keyboardType="numeric"
                                colors={colors}
                            />
                        )}
                    </View>

                    <TouchableOpacity onPress={handleSubmit} disabled={isProcessing} style={styles.submitButton}>
                        <LinearGradient colors={[colors.primary, colors.primary]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            {isProcessing ? <ActivityIndicator color="#000" /> : (
                                <>
                                    <MaterialCommunityIcons
                                        name={formData.role === 'Operator' ? 'account-check' : 'card-account-details-outline'}
                                        size={20} color="#000"
                                    />
                                    <Text style={styles.submitText}>
                                        {t('owner.save_register_op')}
                                    </Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
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
    iconHeader: { alignItems: 'center', marginBottom: 40 },
    mainIcon: { width: 80, height: 80, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    formTitle: { fontSize: 24, fontWeight: '900', marginBottom: 8 },
    formSubtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20 },
    formSection: { borderRadius: 12, padding: 20, borderWidth: 1, gap: 20 },
    row: { flexDirection: 'row', gap: 12 },
    fieldWrapper: { gap: 8 },
    inputLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 4 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingLeft: 12 },
    textInput: { flex: 1, backgroundColor: 'transparent', height: 50, fontSize: 15 },
    errorLabel: { fontSize: 11, fontWeight: '600', marginLeft: 4 },
    submitButton: { marginTop: 30, borderRadius: 16, overflow: 'hidden' },
    gradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
    submitText: { fontSize: 15, fontWeight: '900', color: '#000' },
    sectionHeader: { fontSize: 14, fontWeight: '800', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
    salaryTypeContainer: { marginBottom: 16 },
    salaryTypeButton: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
    salaryTypeText: { fontSize: 13, fontWeight: '600' }
});
