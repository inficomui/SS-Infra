import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGenerateBillMutation } from '@/redux/apis/workApi';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';

export default function CreateBillScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const params = useLocalSearchParams();
    const [generateBill, { isLoading: isSubmitting }] = useGenerateBillMutation();
    const { t } = useTranslation();

    const initialSeconds = Number(params.elapsedSeconds) || 0;
    const clientName = params.clientName as string || 'SS Infra Site';
    const clientLocation = params.location as string || '';
    const workId = params.workId as string;

    const [rate, setRate] = useState('1200');
    const [hours, setHours] = useState((initialSeconds / 3600).toFixed(2));
    const [totalAmount, setTotalAmount] = useState('0');
    const [description, setDescription] = useState('Excavation services at ' + clientLocation);

    useEffect(() => {
        const h = parseFloat(hours) || 0;
        const r = parseFloat(rate) || 0;
        setTotalAmount((h * r).toFixed(0));
    }, [hours, rate]);

    const handleSubmit = async () => {
        if (!totalAmount || parseFloat(totalAmount) <= 0) {
            Alert.alert(t('create_bill_screen.invalid_amount'), t('create_bill_screen.invalid_amount_msg'));
            return;
        }

        if (!workId) {
            Alert.alert(t('finish_work_screen.error'), t('create_bill_screen.work_id_missing'));
            return;
        }

        Alert.alert(
            t('create_bill_screen.confirm_invoice'),
            t('create_bill_screen.generate_msg', { amount: totalAmount }),
            [
                { text: t('create_bill_screen.cancel'), style: "cancel" },
                {
                    text: t('create_bill_screen.confirm'),
                    onPress: async () => {
                        try {
                            // Store result to access invoice details
                            const result = await generateBill({
                                workSessionId: workId,
                                hourlyRate: parseFloat(rate),
                                totalHours: parseFloat(hours),
                                totalAmount: parseFloat(totalAmount),
                                description: description
                            }).unwrap();

                            Alert.alert(t('create_bill_screen.success'), t('create_bill_screen.invoice_success'), [
                                {
                                    text: t('create_bill_screen.view_invoice'),
                                    onPress: () => {
                                        router.replace({
                                            pathname: '/(operator)/invoice-preview',
                                            params: {
                                                invoiceNumber: result.invoice?.invoice_number || 'INV-' + Date.now().toString().slice(-6),
                                                clientName: clientName,
                                                totalAmount: totalAmount,
                                                totalHours: hours,
                                                hourlyRate: rate,
                                                description: description,
                                                date: new Date().toISOString(),
                                                photoUri: params.afterWorkPhoto,
                                                invoiceId: result.invoice?.id
                                            }
                                        });
                                    }
                                }
                            ]);
                        } catch (error: any) {
                            const errData = error?.data || error;
                            const msg = errData?.message || t('create_bill_screen.billing_unavailable');
                            Alert.alert(t('create_bill_screen.submission_failed'), msg);
                        }
                    }
                }
            ]
        );
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('create_bill_screen.title')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.clientRow}>
                        <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                            <MaterialCommunityIcons name="account-tie" size={28} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.cardLabel, { color: colors.textMuted }]}>{t('create_bill_screen.recipient')}</Text>
                            <Text style={[styles.cardValue, { color: colors.textMain }]}>{clientName}</Text>
                            <Text style={[styles.cardSubValue, { color: colors.textMuted }]}>{clientLocation}</Text>
                        </View>
                    </View>
                </View>

                {params.afterWorkPhoto && (
                    <View style={[styles.photoStatus, { backgroundColor: colors.success + '10', borderColor: colors.success + '30' }]}>
                        <Image source={{ uri: params.afterWorkPhoto as string }} style={styles.photoThumb} />
                        <View>
                            <Text style={[styles.statusTitle, { color: colors.success }]}>{t('create_bill_screen.work_verified')}</Text>
                            <Text style={[styles.statusSub, { color: colors.textMuted }]}>{t('create_bill_screen.proof_attached')}</Text>
                        </View>
                        <MaterialCommunityIcons name="check-decagram" size={24} color={colors.success} style={{ marginLeft: 'auto' }} />
                    </View>
                )}

                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('create_bill_screen.billing_computation')}</Text>

                <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('create_bill_screen.total_duration')}</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <TextInput
                                value={hours}
                                onChangeText={setHours}
                                keyboardType="numeric"
                                style={[styles.input, { color: colors.textMain }]}
                                placeholderTextColor={colors.textMuted}
                            />
                            <Text style={[styles.unitText, { color: colors.textMuted }]}>{t('create_bill_screen.hrs')}</Text>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('create_bill_screen.hourly_rate')}</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <Text style={[styles.currency, { color: colors.textMain }]}>₹</Text>
                            <TextInput
                                value={rate}
                                onChangeText={setRate}
                                keyboardType="numeric"
                                style={[styles.input, { color: colors.textMain }]}
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.totalRow}>
                        <Text style={[styles.totalLabel, { color: colors.textMain }]}>{t('create_bill_screen.total_payable')}</Text>
                        <Text style={[styles.totalValue, { color: colors.primary }]}>₹ {totalAmount}</Text>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('create_bill_screen.additional_remarks')}</Text>
                <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        style={[styles.input, { height: 80, textAlignVertical: 'top', color: colors.textMain }]}
                        placeholder={t('create_bill_screen.remarks_placeholder')}
                        placeholderTextColor={colors.textMuted}
                    />
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <View style={styles.btnContent}>
                            <MaterialCommunityIcons name="send-circle" size={26} color="#000" />
                            <Text style={styles.btnText}>{t('create_bill_screen.dispatch_invoice')}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollContent: { padding: 24 },
    card: { borderRadius: 12, padding: 20, marginBottom: 20, borderWidth: 1 },
    clientRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconBox: { width: 56, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    cardLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 2 },
    cardValue: { fontSize: 18, fontWeight: '900' },
    cardSubValue: { fontSize: 13, fontWeight: '600' },
    photoStatus: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 24, borderWidth: 1, gap: 12 },
    photoThumb: { width: 44, height: 44, borderRadius: 8 },
    statusTitle: { fontWeight: '900', fontSize: 14 },
    statusSub: { fontSize: 11, fontWeight: '600' },
    sectionTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
    formCard: { borderRadius: 12, padding: 20, marginBottom: 24, borderWidth: 1 },
    inputGroup: { marginBottom: 16 },
    inputLabel: { marginBottom: 8, fontSize: 13, fontWeight: '700' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, height: 54 },
    input: { flex: 1, fontSize: 16, fontWeight: '700' },
    unitText: { fontWeight: '900', fontSize: 12, marginLeft: 8 },
    currency: { fontSize: 18, fontWeight: '900', marginRight: 8 },
    divider: { height: 1, marginVertical: 20 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 18, fontWeight: '900' },
    totalValue: { fontSize: 26, fontWeight: '900' },
    footer: { padding: 24, borderTopWidth: 1 },
    submitBtn: { height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    btnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
    btnText: { fontSize: 16, fontWeight: '900', color: '#000', letterSpacing: 1 }
});
