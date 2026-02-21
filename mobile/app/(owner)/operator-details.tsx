
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';

export default function OperatorDetailsScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const params = useLocalSearchParams();
    const { colors } = useAppTheme();

    const operator = params.data ? JSON.parse(params.data as string) : null;

    if (!operator) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.textMuted }}>{t('owner.no_operator_data')}</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary }}>{t('owner.go_back')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const initials = operator.name ? operator.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'OP';

    const handleCall = () => {
        if (operator.mobile) {
            Linking.openURL(`tel:${operator.mobile}`);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('owner.operator_details')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.avatarSection}>
                        <Avatar.Text
                            size={100}
                            label={initials}
                            style={{ backgroundColor: colors.background, borderWidth: 2, borderColor: colors.primary }}
                            color={colors.primary}
                            labelStyle={{ fontSize: 36, fontWeight: 'bold' }}
                        />
                        <Text style={[styles.operatorName, { color: colors.textMain }]}>{operator.name}</Text>
                        <Text style={[styles.operatorRole, { color: colors.textMuted }]}>{t('owner.certified_operator')}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoSection}>
                        <DetailRow icon="phone" label={t('owner.phone_number')} value={operator.mobile} colors={colors} action={handleCall} actionIcon="phone-outgoing" />
                        <DetailRow icon="map-marker" label={t('owner.district')} value={operator.district} colors={colors} />
                        <DetailRow icon="map" label={t('owner.taluka')} value={operator.taluka} colors={colors} />
                        {operator.salary && <DetailRow icon="cash" label={t('owner.salary_rate')} value={`₹${operator.salary}`} colors={colors} />}
                        {operator.referralCode && <DetailRow icon="ticket-confirmation" label={t('owner.referral_code')} value={operator.referralCode} colors={colors} />}
                    </View>
                </View>

                {/* Additional Stats or Info could go here */}
                <View style={[styles.actionSection, { marginTop: 20, gap: 12 }]}>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity
                            onPress={() => router.push({
                                pathname: '/(owner)/fuel' as any,
                                params: { operatorName: operator.name }
                            })}
                            style={[styles.fullWidthBtn, { flex: 1, backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary }]}
                        >
                            <MaterialCommunityIcons name="gas-station" size={20} color={colors.primary} />
                            <Text style={[styles.btnText, { color: colors.textMain, fontSize: 13 }]}>{t('owner.fuel_logs_btn')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push({
                                pathname: '/(owner)/operators/payment-history' as any,
                                params: { operatorId: operator.id, operatorName: operator.name }
                            })}
                            style={[styles.fullWidthBtn, { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
                        >
                            <MaterialCommunityIcons name="history" size={20} color={colors.primary} />
                            <Text style={[styles.btnText, { color: colors.textMain, fontSize: 13 }]}>{t('owner.history')}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push({
                            pathname: '/(owner)/operators/record-payment' as any,
                            params: { operatorId: operator.id, operatorName: operator.name }
                        })}
                        style={[styles.fullWidthBtn, { backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary }]}
                    >
                        <MaterialCommunityIcons name="currency-inr" size={20} color={colors.primary} />
                        <Text style={[styles.btnText, { color: colors.textMain, fontSize: 13 }]}>{t('owner.pay_salary')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleCall} style={[styles.fullWidthBtn, { backgroundColor: colors.primary }]}>
                        <MaterialCommunityIcons name="phone" size={20} color="#000" />
                        <Text style={styles.btnText}>{t('owner.call_operator')}</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

function DetailRow({ icon, label, value, colors, action, actionIcon }: any) {
    return (
        <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
                <Text style={[styles.value, { color: colors.textMain }]}>{value || 'N/A'}</Text>
            </View>
            {action && (
                <TouchableOpacity onPress={action} style={[styles.actionMiniBtn, { backgroundColor: colors.primary + '20' }]}>
                    <MaterialCommunityIcons name={actionIcon} size={18} color={colors.primary} />
                </TouchableOpacity>
            )}
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
    profileCard: { borderRadius: 4, borderWidth: 1, padding: 24, alignItems: 'center' },
    avatarSection: { alignItems: 'center', marginBottom: 24 },
    operatorName: { fontSize: 24, fontWeight: '800', marginTop: 16 },
    operatorRole: { fontSize: 14, fontWeight: '600' },
    divider: { height: 1, width: '100%', backgroundColor: 'rgba(0,0,0,0.1)', marginBottom: 20 }, // Simplified divider
    infoSection: { width: '100%', gap: 16 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingBottom: 12, borderBottomWidth: 1 },
    iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    label: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
    value: { fontSize: 16, fontWeight: '600', marginTop: 2 },
    actionMiniBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    actionSection: { width: '100%' },
    fullWidthBtn: { flexDirection: 'row', height: 50, borderRadius: 4, justifyContent: 'center', alignItems: 'center', gap: 10 },
    halfWidthBtn: { flex: 1, flexDirection: 'row', height: 50, borderRadius: 4, justifyContent: 'center', alignItems: 'center', gap: 8 },
    btnText: { fontSize: 16, fontWeight: '900', color: '#000' }
});
