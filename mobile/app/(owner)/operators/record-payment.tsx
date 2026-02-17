import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { Text, TextInput, Button, Menu } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useRecordPaymentMutation } from '@/redux/apis/ownerApi';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { formatDate } from '../../../utils/formatters';

export default function RecordPaymentScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const params = useLocalSearchParams();
    const operatorId = Number(params.operatorId);
    const operatorName = params.operatorName as string;

    const [amount, setAmount] = useState('');
    const [type, setType] = useState('salary'); // 'salary' or 'bonus'
    const [description, setDescription] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTypeMenu, setShowTypeMenu] = useState(false);

    const [recordPayment, { isLoading }] = useRecordPaymentMutation();

    const handleSubmit = async () => {
        if (!amount || Number(amount) <= 0) {
            Alert.alert("Invalid Input", "Please enter a valid amount.");
            return;
        }

        const paymentData = {
            amount: Number(amount),
            type,
            description,
            paymentDate: paymentDate.toISOString().split('T')[0]
        };

        console.log("Submitting Payment:", { operatorId, data: paymentData });

        try {
            const result = await recordPayment({
                operatorId,
                data: paymentData
            }).unwrap();

            console.log("Payment Record Success:", result);

            Alert.alert(
                "Success",
                (result.message || "Payment recorded successfully!") + "\nThe operator has been notified.",
                [{ text: "OK", onPress: () => router.back() }]
            );

            Toast.show({
                type: 'success',
                text1: 'Payment Recorded',
                text2: result.message || `₹${amount} ${type} logged for ${operatorName}`
            });
        } catch (error: any) {
            console.error("Payment Record Error:", error);

            let errorMessage = "Failed to record payment.";

            if (error?.data?.errors) {
                // If there are validation errors, format them
                errorMessage = Object.values(error.data.errors).flat().join('\n');
            } else if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            Alert.alert("Payment Error", errorMessage);

            Toast.show({
                type: 'error',
                text1: 'Error Recording Payment',
                text2: errorMessage
            });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <View style={{ flex: 1, paddingLeft: 16 }}>
                    <Text style={[styles.headerTitle, { color: colors.textMain }]}>Record Payment</Text>
                    <Text style={[styles.subTitle, { color: colors.textMuted }]}>{operatorName}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Payment Details</Text>

                    <TextInput
                        label="Amount (₹)"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        mode="outlined"
                        style={styles.input}
                        outlineColor={colors.border}
                        activeOutlineColor={colors.primary}
                        left={<TextInput.Icon icon="cash" color={colors.primary} />}
                    />

                    <View style={styles.dropdownContainer}>
                        <Menu
                            visible={showTypeMenu}
                            onDismiss={() => setShowTypeMenu(false)}
                            anchor={
                                <TouchableOpacity
                                    onPress={() => setShowTypeMenu(true)}
                                    style={[styles.typeSelector, { borderColor: colors.border, backgroundColor: colors.background }]}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <MaterialCommunityIcons name={type === 'salary' ? 'calendar-check' : 'star-outline'} size={20} color={colors.primary} />
                                        <Text style={{ color: colors.textMain, textTransform: 'capitalize', fontWeight: '600' }}>{type}</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                            }
                        >
                            <Menu.Item onPress={() => { setType('salary'); setShowTypeMenu(false); }} title="Salary" />
                            <Menu.Item onPress={() => { setType('bonus'); setShowTypeMenu(false); }} title="Bonus" />
                        </Menu>
                    </View>

                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.datePickerBtn, { borderColor: colors.border, backgroundColor: colors.background }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
                            <Text style={{ color: colors.textMain, fontWeight: '600' }}>{formatDate(paymentDate)}</Text>
                        </View>
                        <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12 }}>CHANGE</Text>
                    </TouchableOpacity>

                    <TextInput
                        label="Description (Optional)"
                        value={description}
                        onChangeText={setDescription}
                        placeholder="e.g. October Salary"
                        mode="outlined"
                        multiline
                        numberOfLines={3}
                        style={[styles.input, { height: 100 }]}
                        outlineColor={colors.border}
                        activeOutlineColor={colors.primary}
                    />
                </View>

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.submitBtn}
                    contentStyle={{ paddingVertical: 8 }}
                    buttonColor={colors.primary}
                    textColor="#000"
                >
                    Confirm Payment
                </Button>
            </ScrollView>

            {showDatePicker && (
                <DateTimePicker
                    value={paymentDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(e, date) => {
                        setShowDatePicker(false);
                        if (date) setPaymentDate(date);
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: '900' },
    subTitle: { fontSize: 13, fontWeight: '600' },
    scrollContent: { padding: 24 },
    card: { padding: 20, borderRadius: 16, borderWidth: 1, gap: 16 },
    label: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    input: { backgroundColor: 'transparent' },
    dropdownContainer: { position: 'relative' },
    typeSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderWidth: 1, borderRadius: 8 },
    datePickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderWidth: 1, borderRadius: 8 },
    submitBtn: { marginTop: 24, borderRadius: 12 },
});
