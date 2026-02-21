import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Text, TextInput as PaperInput, ActivityIndicator, HelperText } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAddOperatorMutation, useUpdateSalaryConfigMutation } from '@/redux/apis/ownerApi';
import { useAppTheme } from '@/hooks/use-theme-color';
import Toast from 'react-native-toast-message';

export default function AddOperatorScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors } = useAppTheme();
    const [addOperator, { isLoading: isAdding }] = useAddOperatorMutation();
    const [updateSalaryConfig, { isLoading: isUpdatingSalary }] = useUpdateSalaryConfigMutation();

    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        district: '',
        taluka: '',
        // New Salary System Fields
        salaryType: 'none', // 'daily', 'monthly', 'none'
        salaryAmount: '',
    });

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

        if (formData.salaryType !== 'none' && !formData.salaryAmount) {
            newErrors.salaryAmount = t('owner.salary_required_msg');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            // 1. Create Operator
            const operatorResult = await addOperator({
                name: formData.name,
                mobile: formData.mobile,
                district: formData.district,
                taluka: formData.taluka,
            }).unwrap();

            // 2. If salary config is present, update it
            if (formData.salaryType !== 'none' && operatorResult.success && operatorResult.operator?.id) {
                await updateSalaryConfig({
                    operatorId: operatorResult.operator.id,
                    data: {
                        salaryType: formData.salaryType as 'daily' | 'monthly' | 'none',
                        salaryAmount: Number(formData.salaryAmount),
                    }
                }).unwrap();
            }

            Toast.show({
                type: 'success',
                text1: t('owner.op_registered_success'),
                text2: t('owner.op_added_success_msg', { name: formData.name })
            });

            setTimeout(() => router.back(), 1500);
        } catch (error: any) {
            console.error('Add Operator Error:', error);

            Toast.show({
                type: 'error',
                text1: t('owner.reg_failed'),
                text2: error?.data?.message || t('owner.failed_add_op')
            });
        }
    };

    const isProcessing = isAdding || isUpdatingSalary;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('owner.new_operator_title')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.iconHeader}>
                        <View style={[styles.mainIcon, { backgroundColor: colors.primary + '15' }]}>
                            <MaterialCommunityIcons name="account-plus-outline" size={40} color={colors.primary} />
                        </View>
                        <Text style={[styles.formTitle, { color: colors.textMain }]}>{t('owner.register_operator')}</Text>
                        <Text style={[styles.formSubtitle, { color: colors.textMuted }]}>{t('owner.certified_pro_desc')}</Text>
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

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <InputField
                                    label={t('owner.district')}
                                    icon="map-marker-outline"
                                    value={formData.district}
                                    onChange={(text: string) => setFormData({ ...formData, district: text })}
                                    error={errors.district}
                                    placeholder="e.g. Nasik"
                                    colors={colors}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <InputField
                                    label={t('owner.taluka')}
                                    icon="map-outline"
                                    value={formData.taluka}
                                    onChange={(text: string) => setFormData({ ...formData, taluka: text })}
                                    error={errors.taluka}
                                    placeholder="e.g. Niphad"
                                    colors={colors}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={[styles.formSection, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 20 }]}>
                        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{t('owner.salary_config')}</Text>

                        <View style={styles.salaryTypeContainer}>
                            <Text style={[styles.inputLabel, { color: colors.textMuted, marginBottom: 12 }]}>{t('owner.salary_type')}</Text>
                            <View style={styles.row}>
                                {['none', 'monthly', 'daily'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.salaryTypeButton,
                                            { borderColor: colors.border, backgroundColor: colors.background },
                                            formData.salaryType === type && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }
                                        ]}
                                        onPress={() => setFormData({ ...formData, salaryType: type })}
                                    >
                                        <Text style={[
                                            styles.salaryTypeText,
                                            { color: colors.textMuted },
                                            formData.salaryType === type && { color: colors.primary, fontWeight: '800' }
                                        ]}>
                                            {t(`owner.${type}`)}
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
                                placeholder="e.g. 15000"
                                keyboardType="numeric"
                                colors={colors}
                            />
                        )}
                    </View>

                    <TouchableOpacity onPress={handleSubmit} disabled={isProcessing} style={styles.submitButton}>
                        <LinearGradient colors={[colors.primary, colors.primary]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            {isProcessing ? <ActivityIndicator color="#000" /> : (
                                <>
                                    <MaterialCommunityIcons name="account-check-outline" size={20} color="#000" />
                                    <Text style={styles.submitText}>{t('owner.save_register_op')}</Text>
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
