
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share, Linking, Image } from 'react-native'; // Added Image import
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/hooks/use-theme-color';

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

    // Optional: photo proof if coming from finish-work flow
    // We check for both photoUri and afterWorkPhoto to handle different param naming conventions
    const photoUri = (params.photoUri as string) || (params.afterWorkPhoto as string);

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
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <Text style={styles.invoiceNumber}>#{invoiceNumber}</Text>
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

                <Text style={{ textAlign: 'center', color: colors.textMuted, marginTop: 20, marginBottom: 10 }}>
                    This invoice has been saved to the system.
                </Text>

            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
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
                            <Text style={styles.primaryBtnText}>SEND TO CLIENT</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { padding: 24, paddingBottom: 100 },
    invoiceCard: { borderRadius: 8, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 20 },
    invoiceHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    invoiceTitle: { fontSize: 20, fontWeight: '900', color: '#000', letterSpacing: 2 },
    invoiceNumber: { fontSize: 14, fontWeight: '700', color: '#000', opacity: 0.7 },
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
    footer: { padding: 24, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0 },
    footerBtnRow: { flexDirection: 'row', gap: 16 },
    actionBtn: { flex: 1, height: 56, borderWidth: 1, borderRadius: 4, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8 },
    actionText: { fontWeight: '700', fontSize: 14 },
    primaryBtn: { flex: 2, height: 56, borderRadius: 4, overflow: 'hidden' },
    primaryBtnText: { fontSize: 14, fontWeight: '900', color: '#000', letterSpacing: 1 },
    gradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }
});
