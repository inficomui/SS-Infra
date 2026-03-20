import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRequestWithdrawalMutation } from '@/redux/apis/walletApi';
import { useAppTheme } from '@/hooks/use-theme-color';

export default function WithdrawalScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colors } = useAppTheme();
    const [requestWithdrawal, { isLoading }] = useRequestWithdrawalMutation();

    const [amount, setAmount] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [bankName, setBankName] = useState('');
    const [holderName, setHolderName] = useState('');

    const handleSubmit = async () => {
        if (!amount || !accountNumber || !ifsc || !bankName || !holderName) {
            Toast.show({ type: 'error', text1: t('common.error'), text2: 'Please fill all bank details' });
            return;
        }

        try {
            await requestWithdrawal({
                amount: Number(amount),
                bankDetails: {
                    accountNumber,
                    ifsc,
                    bankName,
                    holderName
                }
            }).unwrap();
            
            Toast.show({ type: 'success', text1: t('common.success'), text2: 'Withdrawal request submitted successfully!' });
            router.back();
        } catch (error: any) {
            const msg = error?.data?.message || 'Failed to submit withdrawal request';
            Toast.show({ type: 'error', text1: t('common.error'), text2: msg });
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('wallet.request_withdrawal') || 'Request Withdrawal'}</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Text style={styles.sectionTitle}>{t('wallet.withdrawal_amount') || 'Withdrawal Amount'}</Text>
                    <TextInput
                        mode="outlined"
                        label="Amount (₹)"
                        placeholder="Enter amount"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        style={styles.input}
                    />

                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('wallet.bank_details') || 'Bank Details'}</Text>
                    <TextInput
                        mode="outlined"
                        label={t('wallet.holder_name') || 'Account Holder Name'}
                        value={holderName}
                        onChangeText={setHolderName}
                        style={styles.input}
                    />
                    <TextInput
                        mode="outlined"
                        label={t('wallet.account_number') || 'Account Number'}
                        value={accountNumber}
                        onChangeText={setAccountNumber}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    <TextInput
                        mode="outlined"
                        label={t('wallet.ifsc_code') || 'IFSC Code'}
                        value={ifsc}
                        onChangeText={setIfsc}
                        autoCapitalize="characters"
                        style={styles.input}
                    />
                    <TextInput
                        mode="outlined"
                        label={t('wallet.bank_name') || 'Bank Name'}
                        value={bankName}
                        onChangeText={setBankName}
                        style={styles.input}
                    />

                    <View style={{ height: 120 }} />
                </ScrollView>

                <View style={styles.bottomBar}>
                    <TouchableOpacity onPress={handleSubmit} disabled={isLoading} style={styles.submitBtn}>
                        <LinearGradient colors={['#10B981', '#059669']} style={styles.gradient}>
                            {isLoading ? <ActivityIndicator color="#FFF" /> : (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <MaterialCommunityIcons name="bank-transfer-out" size={24} color="#FFF" />
                                    <Text style={styles.submitText}>{t('wallet.submit_request') || 'SUBMIT REQUEST'}</Text>
                                </View>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollContent: { padding: 24 },
    sectionTitle: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase', marginBottom: 12, opacity: 0.7 },
    input: { marginBottom: 16 },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24 },
    submitBtn: { height: 60, borderRadius: 16, overflow: 'hidden' },
    gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    submitText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 1 }
});
