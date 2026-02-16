
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share, Linking, Image, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useRecordPaymentMutation } from '@/redux/apis/workApi';

export default function InvoicePreviewScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const params = useLocalSearchParams();

    // Safe extraction of params with defaults
    const invoiceNumber = params.invoiceNumber as string || 'INV-PENDING';
    const clientName = params.clientName as string || 'Client';
    const totalAmount = params.totalAmount as string || '0';
    const totalHours = params.totalHours as string || '0';
    const hourlyRate = params.hourlyRate as string || '0';
    const description = params.description as string || '';
    const date = params.date as string || new Date().toLocaleDateString();
    const invoiceId = params.invoiceId as string;

    // Optional: photo proof if coming from finish-work flow
    const photoUri = (params.photoUri as string) || (params.afterWorkPhoto as string);

    // Payment State
    const [recordPayment, { isLoading: isRecording }] = useRecordPaymentMutation();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(totalAmount);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [nextPaymentDate, setNextPaymentDate] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'partially_paid' | 'paid'>('pending');
    const [paidAmount, setPaidAmount] = useState(0);

    const handleShare = async () => {
        try {
            const message = `
INVOICE: ${invoiceNumber}
Date: ${date}

Client: ${clientName}

Work Details:
Hours: ${totalHours} hrs
Rate: ₹${hourlyRate}/hr
----------------------
TOTAL: ₹${totalAmount}
PAID: ₹${paidAmount}
BALANCE: ₹${parseFloat(totalAmount) - paidAmount}
----------------------

${description ? `Notes: ${description}` : ''}

Sent via SS Infra App
            `;

            await Share.share({
                message: message.trim(),
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleHome = () => {
        router.dismissAll();
        router.replace('/(operator)');
    };

    const handleRecordPayment = async () => {
        if (!invoiceId) {
            Alert.alert("Error", "Invoice ID is missing. Cannot record payment.");
            return;
        }

        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert("Invalid Amount", "Please enter a valid payment amount.");
            return;
        }

        if (amount > (parseFloat(totalAmount) - paidAmount)) {
            Alert.alert("Invalid Amount", "Payment amount cannot exceed the remaining balance.");
            return;
        }

        try {
            const result = await recordPayment({
                invoiceId,
                amount,
                paymentDate,
                nextPaymentDate: nextPaymentDate || undefined,
                notes: paymentNotes
            }).unwrap();

            setShowPaymentModal(false);

            // Update local state based on response
            setPaidAmount(prev => prev + amount);
            if (result.invoice?.status) {
                setPaymentStatus(result.invoice.status);
            } else {
                // Fallback logic
                const newPaid = paidAmount + amount;
                if (newPaid >= parseFloat(totalAmount)) {
                    setPaymentStatus('paid');
                } else {
                    setPaymentStatus('partially_paid');
                }
            }

            Alert.alert("Success", "Payment recorded successfully!");
            setPaymentNotes('');

        } catch (error: any) {
            console.error("Payment Error:", error);
            Alert.alert("Error", error?.data?.message || "Failed to record payment.");
        }
    };

    const getStatusColor = () => {
        switch (paymentStatus) {
            case 'paid': return colors.success;
            case 'partially_paid': return '#f59e0b'; // Amber
            default: return colors.danger;
        }
    };

    const getStatusText = () => {
        switch (paymentStatus) {
            case 'paid': return 'PAID';
            case 'partially_paid': return 'PARTIALLY PAID';
            default: return 'UNPAID';
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Invoice Details</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Invoice Card */}
                <View style={[styles.invoiceCard, { backgroundColor: '#fff' }]}>
                    <LinearGradient
                        colors={[colors.primary, colors.secondary]}
                        style={styles.invoiceHeader}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <View>
                            <Text style={styles.invoiceTitle}>INVOICE</Text>
                            <Text style={styles.invoiceNumber}>#{invoiceNumber}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: '#fff' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
                        </View>
                    </LinearGradient>

                    <View style={styles.invoiceBody}>
                        <View style={styles.row}>
                            <View>
                                <Text style={styles.label}>Billed To</Text>
                                <Text style={styles.value}>{clientName}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.label}>Date</Text>
                                <Text style={styles.value}>{date}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.lineItem}>
                            <Text style={styles.itemText}>Machine Work ({totalHours} hrs @ ₹{hourlyRate})</Text>
                            <Text style={styles.itemTotal}>₹{totalAmount}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Grand Total</Text>
                            <Text style={styles.totalAmount}>₹ {totalAmount}</Text>
                        </View>

                        {paidAmount > 0 && (
                            <View style={[styles.totalRow, { marginTop: 8 }]}>
                                <Text style={[styles.totalLabel, { fontSize: 14, color: colors.success }]}>Paid Amount</Text>
                                <Text style={[styles.totalAmount, { fontSize: 18, color: colors.success }]}>- ₹ {paidAmount}</Text>
                            </View>
                        )}

                        {(parseFloat(totalAmount) - paidAmount) > 0 && (
                            <View style={[styles.totalRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#eee' }]}>
                                <Text style={[styles.totalLabel, { color: colors.danger }]}>Balance Due</Text>
                                <Text style={[styles.totalAmount, { color: colors.danger }]}>₹ {parseFloat(totalAmount) - paidAmount}</Text>
                            </View>
                        )}

                    </View>

                    {/* Dashed Tear Line */}
                    <View style={styles.tearLine}>
                        {Array.from({ length: 20 }).map((_, i) => (
                            <View key={i} style={styles.dash} />
                        ))}
                    </View>

                    <View style={[styles.footerInfo, { backgroundColor: '#f9f9f9' }]}>
                        <Text style={styles.footerText}>Thank you for your business!</Text>
                        <Text style={styles.footerSubText}>SS Infra Structure</Text>
                    </View>
                </View>

                {/* Photo Proof Section - If available */}
                {photoUri && (
                    <View style={[styles.proofCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Work Proof</Text>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: photoUri }}
                                style={styles.proofImage}
                                resizeMode="cover"
                            />
                            <View style={styles.verifiedBadge}>
                                <MaterialCommunityIcons name="check-decagram" size={16} color="#fff" />
                                <Text style={styles.verifiedText}>VERIFIED</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                {paymentStatus !== 'paid' && (
                    <TouchableOpacity
                        style={[styles.paymentBtn, { backgroundColor: colors.success }]}
                        onPress={() => setShowPaymentModal(true)}
                    >
                        <MaterialCommunityIcons name="cash-register" size={24} color="#fff" />
                        <Text style={styles.paymentBtnText}>RECORD PAYMENT</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.footerBtnRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={handleHome}
                    >
                        <MaterialCommunityIcons name="home-outline" size={24} color={colors.textMain} />
                        <Text style={[styles.actionText, { color: colors.textMain }]}>Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.primaryBtn]}
                        onPress={handleShare}
                    >
                        <LinearGradient
                            colors={[colors.primary, colors.primary]}
                            style={styles.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <MaterialCommunityIcons name="share-variant-outline" size={24} color="#000" />
                            <Text style={styles.primaryBtnText}>SHARE INVOICE</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Payment Modal */}
            <Modal
                visible={showPaymentModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPaymentModal(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textMain }]}>Record Payment</Text>
                            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ maxHeight: 400 }}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Amount Received (₹)</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.card }]}
                                    value={paymentAmount}
                                    onChangeText={setPaymentAmount}
                                    keyboardType="numeric"
                                    placeholder="Enter amount"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Payment Date</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.card }]}
                                    value={paymentDate}
                                    onChangeText={setPaymentDate}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Next Payment Date (Optional)</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.card }]}
                                    value={nextPaymentDate}
                                    onChangeText={setNextPaymentDate}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor={colors.textMuted}
                                />
                                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                                    Set this if payment is partial.
                                </Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Notes</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.card, height: 80, textAlignVertical: 'top' }]}
                                    value={paymentNotes}
                                    onChangeText={setPaymentNotes}
                                    placeholder="Check number, transaction ID, etc."
                                    placeholderTextColor={colors.textMuted}
                                    multiline
                                />
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                            onPress={handleRecordPayment}
                            disabled={isRecording}
                        >
                            {isRecording ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.confirmBtnText}>CONFIRM PAYMENT</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { padding: 24, paddingBottom: 150 },
    invoiceCard: { borderRadius: 8, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 20 },
    invoiceHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    invoiceTitle: { fontSize: 20, fontWeight: '900', color: '#000', letterSpacing: 2 },
    invoiceNumber: { fontSize: 14, fontWeight: '700', color: '#000', opacity: 0.7 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    invoiceBody: { padding: 24 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    label: { fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 4, fontWeight: '700' },
    value: { fontSize: 16, fontWeight: '800', color: '#333' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
    lineItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemText: { fontSize: 14, color: '#444', fontWeight: '600' },
    itemTotal: { fontSize: 14, fontWeight: '800', color: '#333' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    totalLabel: { fontSize: 16, fontWeight: '900', color: '#333' },
    totalAmount: { fontSize: 24, fontWeight: '900', color: '#000' },
    tearLine: { flexDirection: 'row', overflow: 'hidden', height: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
    dash: { width: 10, height: 2, backgroundColor: '#ddd', marginRight: 5 },
    footerInfo: { padding: 16, alignItems: 'center', backgroundColor: '#f9f9f9' },
    footerText: { fontSize: 12, fontWeight: '700', color: '#555' },
    footerSubText: { fontSize: 10, color: '#999', marginTop: 4 },
    proofCard: { marginTop: 16, borderWidth: 1, padding: 16, borderRadius: 6 },
    sectionTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    imageContainer: { height: 200, borderRadius: 4, overflow: 'hidden', position: 'relative' },
    proofImage: { width: '100%', height: '100%' },
    verifiedBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: '#22c55e', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4 },
    verifiedText: { color: '#fff', fontSize: 10, fontWeight: '800' },
    footer: { padding: 24, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0, gap: 16 },
    paymentBtn: { height: 50, borderRadius: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    paymentBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
    footerBtnRow: { flexDirection: 'row', gap: 16 },
    actionBtn: { flex: 1, height: 56, borderWidth: 1, borderRadius: 4, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8 },
    actionText: { fontWeight: '700', fontSize: 14 },
    primaryBtn: { flex: 2, height: 56, borderRadius: 4, overflow: 'hidden' },
    primaryBtnText: { fontSize: 14, fontWeight: '900', color: '#000', letterSpacing: 1 },
    gradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '900' },
    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
    input: { height: 50, borderWidth: 1, borderRadius: 4, paddingHorizontal: 16, fontSize: 16, fontWeight: '600' },
    confirmBtn: { height: 56, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    confirmBtnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 }
});
