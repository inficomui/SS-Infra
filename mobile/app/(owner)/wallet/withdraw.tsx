import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, TextInput as PaperInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useRequestWithdrawalMutation } from '@/redux/apis/walletApi';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

export default function WithdrawalRequestScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const { t } = useTranslation();
    const [requestWithdrawal, { isLoading }] = useRequestWithdrawalMutation();

    const [amount, setAmount] = useState('');
    const [bankDetails, setBankDetails] = useState({
        accountNumber: '',
        ifsc: '',
        bankName: '',
        holderName: ''
    });

    const [errors, setErrors] = useState<any>({});

    const validate = () => {
        const newErrors: any = {};
        if (!amount || Number(amount) <= 0) newErrors.amount = t('wallet.enter_valid_amount');
        if (!bankDetails.accountNumber) newErrors.accountNumber = t('wallet.account_number_required');
        if (!bankDetails.ifsc) newErrors.ifsc = t('wallet.ifsc_required');
        if (!bankDetails.bankName) newErrors.bankName = t('wallet.bank_name_required');
        if (!bankDetails.holderName) newErrors.holderName = t('wallet.holder_name_required');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            await requestWithdrawal({
                amount: Number(amount),
                bankDetails
            }).unwrap();

            Toast.show({
                type: 'success',
                text1: t('wallet.request_submitted'),
                text2: t('wallet.request_success')
            });

            setTimeout(() => router.back(), 1500);
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: t('wallet.submission_failed'),
                text2: error?.data?.message || t('wallet.failed_submit')
            });
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
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('wallet.withdraw_funds')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <SectionHeader title={t('wallet.amount')} colors={colors} />
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <PaperInput
                        label={t('wallet.amount_label')}
                        value={amount}
                        onChangeText={text => setAmount(text.replace(/[^0-9]/g, ''))}
                        keyboardType="numeric"
                        mode="outlined"
                        outlineColor={colors.border}
                        activeOutlineColor={colors.primary}
                        style={{ backgroundColor: colors.background }}
                        error={!!errors.amount}
                        left={<PaperInput.Icon icon="cash" color={colors.textMuted} />}
                    />
                    {errors.amount && <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>{errors.amount}</Text>}
                </View>

                <SectionHeader title={t('wallet.bank_details')} colors={colors} />
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, gap: 16 }]}>
                    <Input
                        label={t('wallet.holder_name')}
                        value={bankDetails.holderName}
                        onChangeText={(t: string) => setBankDetails({ ...bankDetails, holderName: t })}
                        error={errors.holderName}
                        colors={colors}
                        icon="account"
                    />
                    <Input
                        label={t('wallet.bank_name')}
                        value={bankDetails.bankName}
                        onChangeText={(t: string) => setBankDetails({ ...bankDetails, bankName: t })}
                        error={errors.bankName}
                        colors={colors}
                        icon="bank"
                    />
                    <Input
                        label={t('wallet.account_number')}
                        value={bankDetails.accountNumber}
                        onChangeText={(t: string) => setBankDetails({ ...bankDetails, accountNumber: t.replace(/[^0-9]/g, '') })}
                        error={errors.accountNumber}
                        colors={colors}
                        icon="numeric"
                        keyboardType="numeric"
                    />
                    <Input
                        label={t('wallet.ifsc_code')}
                        value={bankDetails.ifsc}
                        onChangeText={(t: string) => setBankDetails({ ...bankDetails, ifsc: t.toUpperCase() })}
                        error={errors.ifsc}
                        colors={colors}
                        icon="code-string"
                        autoCapitalize="characters"
                    />
                </View>

                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isLoading}
                    style={[styles.submitButton, { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }]}
                >
                    {isLoading ? <ActivityIndicator color="#FFF" /> : (
                        <Text style={styles.submitText}>{t('wallet.submit_request')}</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

function Input({ label, value, onChangeText, error, colors, icon, ...props }: any) {
    return (
        <View>
            <PaperInput
                label={label}
                value={value}
                onChangeText={onChangeText}
                mode="outlined"
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
                style={{ backgroundColor: colors.background }}
                error={!!error}
                left={<PaperInput.Icon icon={icon} color={colors.textMuted} />}
                {...props}
            />
            {error && <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>{error}</Text>}
        </View>
    );
}

function SectionHeader({ title, colors }: any) {
    return (
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 24 }}>
            {title}
        </Text>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollContent: { padding: 24 },
    card: { padding: 16, borderRadius: 8, borderWidth: 1 },
    submitButton: { marginTop: 32, paddingVertical: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    submitText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
