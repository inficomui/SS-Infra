import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Alert } from 'react-native';
import { Text, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetPlansQuery, useCreateSubscriptionOrderMutation, useVerifySubscriptionPaymentMutation } from '@/redux/apis/walletApi';
import { LinearGradient } from 'expo-linear-gradient';
import RazorpayCheckout from 'react-native-razorpay';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

export default function PlansScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colors, isDark } = useAppTheme();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const { user } = useSelector((state: any) => state.auth);

    const { data: plansData, isLoading } = useGetPlansQuery();
    const [createOrder, { isLoading: isCreatingOrder }] = useCreateSubscriptionOrderMutation();
    const [verifyPayment, { isLoading: isVerifyingPayment }] = useVerifySubscriptionPaymentMutation();

    // Mock plans if API returns empty - with enhanced metadata
    const plans = plansData?.plans || [
        {
            id: 'basic',
            name: t('plans.starter'),
            price: billingCycle === 'monthly' ? '999' : '9,999',
            period: billingCycle === 'monthly' ? `/${t('plans.monthly').substring(0, 2)}` : `/${t('plans.yearly').substring(0, 2)}`,
            description: t('plans.starter_desc'),
            features: [t('plans.features.live_tracking'), t('plans.features.fuel_maint_logs'), t('plans.features.basic_reports'), t('plans.features.admin_account')],
            icons: ['map-marker-radius', 'gas-station', 'file-chart', 'account'],
            gradient: ['#6366f1', '#4f46e5'],
            popular: false
        },
        {
            id: 'pro',
            name: t('plans.pro'),
            price: billingCycle === 'monthly' ? '2,499' : '24,999',
            period: billingCycle === 'monthly' ? `/${t('plans.monthly').substring(0, 2)}` : `/${t('plans.yearly').substring(0, 2)}`,
            description: t('plans.pro_desc'),
            features: [t('plans.features.live_fleet_dashboard'), t('plans.features.advanced_maint_alerts'), t('plans.features.ai_cost_analysis'), t('plans.features.unlimited_operators'), t('plans.features.priority_support')],
            icons: ['view-dashboard', 'wrench-clock', 'brain', 'account-group', 'headset'],
            gradient: [colors.primary, '#f97316'],
            popular: true
        },
        {
            id: 'enterprise',
            name: t('plans.enterprise'),
            price: t('plans.price_custom'),
            description: t('plans.enterprise_desc'),
            features: [t('plans.features.api_integrations'), t('plans.features.custom_whitelabeling'), t('plans.features.dedicated_manager'), t('plans.features.onsite_training')],
            icons: ['api', 'palette', 'shield-search', 'school'],
            gradient: ['#1e293b', '#0f172a'],
            popular: false
        }
    ];

    const handlePurchase = async (plan: any) => {
        console.log('Attempting purchase for plan:', plan);

        if (plan.price === 'Custom') {
            Toast.show({ type: 'info', text1: t('plans.contact_sales'), text2: t('plans.contact_sales_msg') });
            return;
        }

        try {
            // 1. Create Order on Backend
            const orderRes = await createOrder({ planId: plan.id, billingCycle }).unwrap();
            console.log('Order Response:', orderRes);

            if (!orderRes.success) {
                Toast.show({ type: 'error', text1: t('plans.order_failed'), text2: t('plans.order_failed_msg') });
                return;
            }

            const { order_id, amount, key, currency, user_email, user_mobile, user_name } = orderRes;

            // 2. Open Razorpay Checkout
            const options = {
                description: `Subscription to ${plan.name} (${billingCycle})`,
                image: 'https://i.imgur.com/3g7nmJC.png', // Replace with your logo URL
                currency: currency || 'INR',
                key: key,
                amount: amount,
                name: 'SS-Infra',
                order_id: order_id, // Updated to underscore
                prefill: {
                    email: user_email || user?.email || '',
                    contact: user_mobile || user?.mobile || '',
                    name: user_name || user?.name || ''
                },
                theme: { color: colors.primary }
            };

            RazorpayCheckout.open(options)
                .then(async (data: any) => {
                    // 3. Verify Payment on Backend
                    try {
                        const verifyRes = await verifyPayment({
                            planId: plan.id, // Added planId
                            razorpay_payment_id: data.razorpay_payment_id,
                            razorpay_order_id: data.razorpay_order_id,
                            razorpay_signature: data.razorpay_signature
                        }).unwrap();

                        if (verifyRes.success) {
                            Toast.show({ type: 'success', text1: t('plans.plan_activated'), text2: t('plans.welcome_plan', { planName: plan.name }) });
                            router.back();
                        } else {
                            Toast.show({ type: 'error', text1: t('plans.activation_failed'), text2: verifyRes.message || t('plans.verification_error_msg') });
                        }
                    } catch (err: any) {
                        console.error('Verification Error:', err);
                        Toast.show({ type: 'error', text1: t('plans.verification_error'), text2: t('plans.verification_error_msg') });
                    }
                })
                .catch((error: any) => {
                    console.log('Razorpay Error:', error);
                    // Razorpay returns an error object with code and description
                    if (error.code && error.description) {
                        Toast.show({ type: 'error', text1: t('plans.payment_failed'), text2: error.description });
                    } else {
                        // User cancelled or generic error
                        // Toast.show({ type: 'info', text1: 'Payment Cancelled' }); 
                    }
                });

        } catch (error: any) {
            console.error('Purchase Error:', error);
            const errorMessage = error?.data?.message || error?.data?.error || t('common.error');
            Toast.show({ type: 'error', text1: t('common.error'), text2: errorMessage });
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator color={colors.primary} size="large" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Subtle Top Gradient */}
            <LinearGradient
                colors={[colors.primary + '15', 'transparent']}
                style={styles.bgGradient}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <View style={[styles.titleBadge, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={[styles.titleBadgeText, { color: colors.primary }]}>{t('plans.title')}</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <Text style={[styles.heroTitle, { color: colors.textMain }]}>{t('plans.hero_title')}</Text>
                    <Text style={[styles.heroSub, { color: colors.textMuted }]}>{t('plans.hero_sub')}</Text>
                </View>

                {/* Billing Toggle */}
                <View style={[styles.toggleContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TouchableOpacity
                        onPress={() => setBillingCycle('monthly')}
                        style={[styles.toggleBtn, billingCycle === 'monthly' && { backgroundColor: colors.primary }]}
                    >
                        <Text style={[styles.toggleText, { color: billingCycle === 'monthly' ? '#000' : colors.textMuted }]}>{t('plans.monthly')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setBillingCycle('yearly')}
                        style={[styles.toggleBtn, billingCycle === 'yearly' && { backgroundColor: colors.primary }]}
                    >
                        <Text style={[styles.toggleText, { color: billingCycle === 'yearly' ? '#000' : colors.textMuted }]}>{t('plans.yearly')}</Text>
                        {billingCycle !== 'yearly' && (
                            <View style={styles.saveBadge}>
                                <Text style={styles.saveText}>{t('plans.save_badge')}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.plansContainer}>
                    {plans.map((plan: any) => (
                        <View
                            key={plan.id}
                            style={[
                                styles.planCardWrapper,
                                plan.popular && styles.popularCardScale
                            ]}
                        >
                            {plan.popular && (
                                <View style={[styles.popularTag, { backgroundColor: colors.primary }]}>
                                    <MaterialCommunityIcons name="star" size={12} color="#000" />
                                    <Text style={styles.popularTagText}>{t('plans.most_popular')}</Text>
                                </View>
                            )}

                            <TouchableOpacity activeOpacity={0.9} style={[styles.planCard, { backgroundColor: colors.card, borderColor: plan.popular ? colors.primary : colors.border }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.planName, { color: colors.textMain }]}>{plan.name}</Text>
                                    <View style={styles.priceContainer}>
                                        <Text style={[styles.currency, { color: colors.textMain }]}>₹</Text>
                                        <Text style={[styles.price, { color: colors.textMain }]}>{plan.price}</Text>
                                        <Text style={[styles.period, { color: colors.textMuted }]}>{plan.period}</Text>
                                    </View>
                                    <Text style={[styles.planDesc, { color: colors.textMuted }]}>{plan.description}</Text>
                                </View>

                                <Divider style={[styles.cardDivider, { backgroundColor: colors.border }]} />

                                <View style={styles.featureList}>
                                    {plan.features.map((feature: string, idx: number) => (
                                        <View key={idx} style={styles.featureRow}>
                                            <View style={[styles.checkCircle, { backgroundColor: plan.popular ? colors.primary + '20' : colors.border }]}>
                                                <MaterialCommunityIcons
                                                    name={plan.icons ? plan.icons[idx] || "check" : "check"}
                                                    size={14}
                                                    color={plan.popular ? colors.primary : colors.textMuted}
                                                />
                                            </View>
                                            <Text style={[styles.featureText, { color: colors.textMain }]}>{feature}</Text>
                                        </View>
                                    ))}
                                </View>

                                <TouchableOpacity
                                    style={styles.btnShadow}
                                    onPress={() => handlePurchase(plan)}
                                    disabled={isCreatingOrder || isVerifyingPayment}
                                >
                                    <LinearGradient
                                        colors={plan.popular ? plan.gradient : [colors.card, colors.card]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[styles.actionBtn, !plan.popular && { borderWidth: 1, borderColor: colors.border }]}
                                    >
                                        {isCreatingOrder || isVerifyingPayment ? (
                                            <ActivityIndicator color={plan.popular ? '#000' : colors.textMain} size="small" />
                                        ) : (
                                            <Text style={[styles.actionBtnText, { color: plan.popular ? '#000' : colors.textMain }]}>
                                                {plan.price === 'Custom' ? t('plans.contact_sales') : t('plans.get_started')}
                                            </Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Trust Section */}
                <View style={styles.trustSection}>
                    <Text style={[styles.trustTitle, { color: colors.textMuted }]}>{t('plans.trust_title')}</Text>
                    <View style={styles.trustIcons}>
                        <MaterialCommunityIcons name="shield-check" size={24} color={colors.success} />
                        <MaterialCommunityIcons name="lock" size={24} color={colors.textMuted} />
                        <MaterialCommunityIcons name="credit-card-check" size={24} color={colors.textMuted} />
                    </View>
                    <Text style={[styles.trustText, { color: colors.textMuted }]}>{t('plans.trust_text')}</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    bgGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    titleBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    titleBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    scrollContent: { paddingBottom: 60 },
    heroSection: { paddingHorizontal: 24, marginVertical: 30 },
    heroTitle: { fontSize: 40, fontWeight: '900', lineHeight: 46, marginBottom: 12, letterSpacing: -1 },
    heroSub: { fontSize: 15, fontWeight: '600', lineHeight: 22, opacity: 0.8 },
    toggleContainer: { flexDirection: 'row', marginHorizontal: 24, padding: 6, borderRadius: 12, borderWidth: 1, marginBottom: 40 },
    toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
    toggleText: { fontSize: 14, fontWeight: '800' },
    saveBadge: { backgroundColor: '#22c55e', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    saveText: { color: '#000', fontSize: 10, fontWeight: '900' },
    plansContainer: { paddingHorizontal: 20 },
    planCardWrapper: { marginBottom: 30 },
    popularCardScale: { transform: [{ scale: 1.02 }] },
    popularTag: { position: 'absolute', top: -12, alignSelf: 'center', zIndex: 10, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    popularTagText: { color: '#000', fontSize: 11, fontWeight: '900' },
    planCard: { borderRadius: 20, padding: 24, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
    cardHeader: { alignItems: 'center', marginBottom: 20 },
    planName: { fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, opacity: 0.9 },
    priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
    currency: { fontSize: 24, fontWeight: '800', marginRight: 2 },
    price: { fontSize: 48, fontWeight: '900', letterSpacing: -1 },
    period: { fontSize: 16, fontWeight: '700', marginLeft: 4, opacity: 0.6 },
    planDesc: { fontSize: 14, fontWeight: '500', textAlign: 'center', opacity: 0.7 },
    cardDivider: { marginVertical: 20, opacity: 0.5 },
    featureList: { gap: 16, marginBottom: 32 },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    checkCircle: { width: 32, height: 32, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    featureText: { fontSize: 14, fontWeight: '700', flex: 1 },
    btnShadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
    actionBtn: { paddingVertical: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionBtnText: { fontSize: 15, fontWeight: '900', letterSpacing: 1 },
    trustSection: { marginTop: 40, alignItems: 'center', paddingHorizontal: 40 },
    trustTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 20, textAlign: 'center' },
    trustIcons: { flexDirection: 'row', gap: 24, marginBottom: 16, opacity: 0.5 },
    trustText: { fontSize: 11, fontWeight: '600', opacity: 0.6, textAlign: 'center' }
});
