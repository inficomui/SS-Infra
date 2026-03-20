import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import {
    useGetPlansQuery,
    useCreateSubscriptionOrderMutation,
    useVerifySubscriptionPaymentMutation,
} from '@/redux/apis/walletApi';
import { LinearGradient } from 'expo-linear-gradient';
import RazorpayCheckout from 'react-native-razorpay';
import { useSelector, useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import { subscriptionApi, useGetMySubscriptionQuery } from '@/redux/apis/subscriptionApi';

const { width } = Dimensions.get('window');

// Plan type → human readable label + icon
const PLAN_META: Record<string, { icon: string; color: string; gradient: [string, string] }> = {
    trial: { icon: 'gift-outline', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] },
    monthly: { icon: 'calendar-month', color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] },
    quarterly: { icon: 'calendar-multiple', color: '#10B981', gradient: ['#10B981', '#059669'] },
    semi_annual: { icon: 'calendar-range', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
    annual: { icon: 'crown', color: '#EF4444', gradient: ['#EF4444', '#DC2626'] },
};

const PLAN_FEATURES: Record<string, string[]> = {
    trial: ['Live tracking', 'Basic reports', 'Up to 2 workers', '7 day free access'],
    monthly: ['Full dashboard', 'Unlimited workers', 'Salary management', 'Priority support'],
    quarterly: ['Everything in Monthly', 'Advanced analytics', 'Machine management', 'Save 10%'],
    semi_annual: ['Everything in Quarterly', 'API access', 'Custom exports', 'Save 20%'],
    annual: ['Everything included', 'Dedicated manager', 'Onsite training', 'Save 35%'],
};

export default function PlansScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { colors, isDark } = useAppTheme();
    const { source } = useLocalSearchParams<{ source?: string }>();

    const { user } = useSelector((state: any) => state.auth);

    const { data: plansData, isLoading } = useGetPlansQuery();
    const { data: subData } = useGetMySubscriptionQuery();
    const [createOrder, { isLoading: isCreatingOrder }] = useCreateSubscriptionOrderMutation();
    const [verifyPayment] = useVerifySubscriptionPaymentMutation();

    const [purchasingPlanId, setPurchasingPlanId] = useState<number | null>(null);

    // Active-plan warning state
    const [pendingPlan, setPendingPlan] = useState<any>(null);  // plan waiting to be purchased
    const [countdown, setCountdown] = useState(5);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const currentSub = subData?.subscription;
    const hasActivePlan = subData?.isActive && currentSub;

    // Clear countdown timer on unmount
    useEffect(() => {
        return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
    }, []);

    const startCountdownFor = useCallback((plan: any) => {
        setPendingPlan(plan);
        setCountdown(5);
        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    // Countdown finished — proceed with payment
                    clearInterval(countdownRef.current!);
                    countdownRef.current = null;
                    doPurchase(plan);
                    setPendingPlan(null);
                    return 5;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const cancelPendingPurchase = () => {
        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = null;
        setPendingPlan(null);
        setCountdown(5);
    };

    // Plans from API, sorted cheapest → most expensive
    const plans = (plansData?.plans ?? []).sort(
        (a: any, b: any) => parseFloat(a.price ?? 0) - parseFloat(b.price ?? 0)
    );

    const handlePurchase = async (plan: any) => {
        // If the user already has an active plan, show warning + countdown
        if (hasActivePlan && source !== 'expired') {
            startCountdownFor(plan);
            return;
        }
        doPurchase(plan);
    };

    const doPurchase = async (plan: any) => {
        const planIdStr = String(plan.id);
        setPurchasingPlanId(plan.id);

        try {
            // 1. Create Razorpay order on backend
            const orderRes = await createOrder({ planId: planIdStr, billingCycle: 'monthly' }).unwrap();

            if (!orderRes.success) {
                Toast.show({ type: 'error', text1: 'Order Failed', text2: 'Could not create payment order. Please try again.' });
                setPurchasingPlanId(null);
                return;
            }

            const { order_id, amount, key, currency, user_email, user_mobile, user_name } = orderRes;

            // 2. Launch Razorpay checkout
            const options = {
                description: `SS-Infra — ${plan.name}`,
                image: 'https://i.imgur.com/3g7nmJC.png',
                currency: currency || 'INR',
                key,
                amount,
                name: 'SS-Infra Software',
                order_id,
                prefill: {
                    email: user_email || user?.email || '',
                    contact: user_mobile || user?.mobile || '',
                    name: user_name || user?.name || '',
                },
                theme: { color: colors.primary },
            };

            RazorpayCheckout.open(options)
                .then(async (data: any) => {
                    // 3. Verify payment on backend
                    try {
                        const verifyRes = await verifyPayment({
                            planId: planIdStr,
                            razorpay_payment_id: data.razorpay_payment_id,
                            razorpay_order_id: data.razorpay_order_id,
                            razorpay_signature: data.razorpay_signature,
                        }).unwrap();

                        if (verifyRes.success) {
                            // ✅ Invalidate subscription cache so ALL screens reflect new plan
                            dispatch(subscriptionApi.util.invalidateTags(['UserSubscriptions', 'Subscriptions']));

                            Toast.show({
                                type: 'success',
                                text1: '🎉 Plan Activated!',
                                text2: `${plan.name} is now active. Enjoy full access!`,
                            });

                            // Go back to where the user came from
                            setTimeout(() => {
                                if (router.canGoBack()) router.back();
                            }, 1500);
                        } else {
                            Toast.show({
                                type: 'error',
                                text1: 'Activation Failed',
                                text2: verifyRes.message || 'Payment received but could not activate plan. Contact support.',
                            });
                        }
                    } catch (err: any) {
                        console.error('Verify Payment Error:', err);
                        Toast.show({
                            type: 'error',
                            text1: 'Verification Error',
                            text2: 'Payment may have gone through. Contact support with your payment ID.',
                        });
                    }
                    setPurchasingPlanId(null);
                })
                .catch((err: any) => {
                    setPurchasingPlanId(null);
                    // err.code is set only if Razorpay returns an error (not when user cancels)
                    if (err?.code && err?.description) {
                        Toast.show({ type: 'error', text1: 'Payment Failed', text2: err.description });
                    }
                    // User just dismissed the sheet — silently ignore
                });

        } catch (err: any) {
            setPurchasingPlanId(null);
            console.error('Create Order Error:', err);
            Toast.show({
                type: 'error',
                text1: 'Something went wrong',
                text2: err?.data?.message || err?.message || 'Please try again.',
            });
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={{ color: colors.textMuted, marginTop: 12, fontWeight: '600' }}>Loading plans...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            {/* ── Active-Plan Replacement Warning Overlay ───────────────────── */}
            {pendingPlan && (
                <View style={styles.warningOverlay}>
                    <TouchableOpacity style={styles.warningBackdrop} activeOpacity={1} onPress={cancelPendingPurchase} />
                    <View style={[styles.warningSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        {/* Warning icon + countdown badge */}
                        <View style={styles.warningIconRow}>
                            <View style={[styles.warningIconCircle, { backgroundColor: '#F59E0B20' }]}>
                                <MaterialCommunityIcons name="swap-horizontal-bold" size={28} color="#F59E0B" />
                            </View>
                            <View style={[styles.countdownBadge, { backgroundColor: colors.primary }]}>
                                <Text style={styles.countdownText}>{countdown}</Text>
                            </View>
                        </View>

                        <Text style={[styles.warningTitle, { color: colors.textMain }]}>
                            Replace Active Plan?
                        </Text>
                        <Text style={[styles.warningBody, { color: colors.textMuted }]}>
                            You currently have an active{' '}
                            <Text style={{ color: colors.textMain, fontWeight: '800' }}>
                                {currentSub?.plan?.name ?? 'plan'}
                            </Text>
                            {'. '}Purchasing{' '}
                            <Text style={{ color: colors.primary, fontWeight: '800' }}>
                                {pendingPlan?.name}
                            </Text>
                            {' '}will replace it immediately.
                        </Text>

                        {/* Countdown progress bar */}
                        <View style={[styles.countdownTrack, { backgroundColor: colors.border }]}>
                            <View
                                style={[
                                    styles.countdownFill,
                                    {
                                        backgroundColor: colors.primary,
                                        width: `${((5 - countdown) / 5) * 100}%` as any,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={[styles.countdownHint, { color: colors.textMuted }]}>
                            Payment will open automatically in {countdown}s
                        </Text>

                        {/* Action buttons */}
                        <View style={styles.warningActions}>
                            <TouchableOpacity
                                style={[styles.warningCancelBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
                                onPress={cancelPendingPurchase}
                            >
                                <Text style={[styles.warningCancelText, { color: colors.textMain }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}
                                onPress={() => {
                                    cancelPendingPurchase();
                                    doPurchase(pendingPlan);
                                }}
                            >
                                <LinearGradient
                                    colors={[colors.primary, colors.primary]}
                                    style={styles.warningProceedBtn}
                                >
                                    <MaterialCommunityIcons name="credit-card-outline" size={16} color="#000" />
                                    <Text style={styles.warningProceedText}>Pay Now</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
            {/* ───────────────────────────────────────────────────────────────── */}

            {/* Top gradient */}
            <LinearGradient colors={[colors.primary + '18', 'transparent']} style={styles.bgGradient} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/(owner)' as any)}
                    style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Choose Your Plan</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Expired banner — shown when user navigates here from an expired/blocked state */}
                {source === 'expired' && (
                    <View style={[styles.expiredBanner, { backgroundColor: '#EF444420', borderColor: '#EF4444' }]}>
                        <MaterialCommunityIcons name="shield-off-outline" size={22} color="#EF4444" />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.expiredBannerTitle, { color: '#EF4444' }]}>
                                Subscription Expired
                            </Text>
                            <Text style={[styles.expiredBannerSub, { color: '#EF444499' }]}>
                                Select a plan below to restore full access to all features.
                            </Text>
                        </View>
                    </View>
                )}

                {/* Hero */}
                <View style={styles.heroSection}>
                    <Text style={[styles.heroTitle, { color: colors.textMain }]}>
                        Unlock{'\n'}Full Access
                    </Text>
                    <Text style={[styles.heroSub, { color: colors.textMuted }]}>
                        Manage your entire fleet — machines, workers, bookings and salary — all in one place.
                    </Text>
                </View>

                {/* Plans List */}
                <View style={styles.plansContainer}>
                    {plans.length === 0 ? (
                        <View style={styles.emptyPlans}>
                            <MaterialCommunityIcons name="package-variant-closed" size={60} color={colors.border} />
                            <Text style={{ color: colors.textMuted, marginTop: 16, fontWeight: '600', textAlign: 'center' }}>
                                No plans available right now.{'\n'}Please contact support.
                            </Text>
                        </View>
                    ) : (
                        plans.map((plan: any, index: number) => {
                            const meta = PLAN_META[plan.type] ?? PLAN_META['monthly'];
                            const features = plan.features?.length
                                ? plan.features
                                : PLAN_FEATURES[plan.type] ?? ['Full access to all features'];
                            const price = parseFloat(plan.price ?? '0');
                            const isPopular = plan.type === 'quarterly';
                            const isBuying = purchasingPlanId === plan.id;
                            const isAnyBuying = purchasingPlanId !== null;

                            return (
                                <View
                                    key={plan.id}
                                    style={[
                                        styles.planCardWrapper,
                                        isPopular && styles.popularCardScale,
                                    ]}
                                >
                                    {isPopular && (
                                        <View style={[styles.popularTag, { backgroundColor: colors.primary }]}>
                                            <MaterialCommunityIcons name="star" size={11} color="#000" />
                                            <Text style={styles.popularTagText}>MOST POPULAR</Text>
                                        </View>
                                    )}

                                    <View style={[
                                        styles.planCard,
                                        {
                                            backgroundColor: colors.card,
                                            borderColor: isPopular ? colors.primary : colors.border,
                                            borderWidth: isPopular ? 1.5 : 1,
                                        }
                                    ]}>
                                        {/* Card top stripe */}
                                        <LinearGradient
                                            colors={meta.gradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.cardStripe}
                                        />

                                        <View style={styles.cardBody}>
                                            {/* Plan name + icon */}
                                            <View style={styles.planNameRow}>
                                                <View style={[styles.planIconCircle, { backgroundColor: meta.color + '20' }]}>
                                                    <MaterialCommunityIcons name={meta.icon as any} size={20} color={meta.color} />
                                                </View>
                                                <View>
                                                    <Text style={[styles.planName, { color: colors.textMain }]}>{plan.name}</Text>
                                                    <Text style={[styles.planDuration, { color: colors.textMuted }]}>
                                                        {plan.durationDays} days validity
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Price */}
                                            <View style={styles.priceRow}>
                                                <Text style={[styles.currency, { color: colors.textMain }]}>₹</Text>
                                                <Text style={[styles.price, { color: colors.textMain }]}>
                                                    {price.toLocaleString('en-IN')}
                                                </Text>
                                                <Text style={[styles.pricePer, { color: colors.textMuted }]}>
                                                    {' '}/ {plan.durationDays}d
                                                </Text>
                                            </View>

                                            {/* Per-day rate */}
                                            <Text style={[styles.perDayRate, { color: colors.textMuted }]}>
                                                ≈ ₹{(price / (plan.durationDays || 30)).toFixed(1)}/day
                                            </Text>

                                            {/* Features */}
                                            <View style={styles.featureList}>
                                                {features.map((feature: string, i: number) => (
                                                    <View key={i} style={styles.featureRow}>
                                                        <View style={[styles.checkCircle, { backgroundColor: meta.color + '20' }]}>
                                                            <MaterialCommunityIcons name="check" size={12} color={meta.color} />
                                                        </View>
                                                        <Text style={[styles.featureText, { color: colors.textMain }]}>{feature}</Text>
                                                    </View>
                                                ))}
                                            </View>

                                            {/* Purchase button */}
                                            <TouchableOpacity
                                                onPress={() => handlePurchase(plan)}
                                                disabled={isAnyBuying}
                                                activeOpacity={0.85}
                                                style={{ borderRadius: 12, overflow: 'hidden' }}
                                            >
                                                <LinearGradient
                                                    colors={meta.gradient}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 0 }}
                                                    style={[styles.buyBtn, isAnyBuying && !isBuying && { opacity: 0.45 }]}
                                                >
                                                    {isBuying ? (
                                                        <ActivityIndicator color="#000" size="small" />
                                                    ) : (
                                                        <>
                                                            <MaterialCommunityIcons name="credit-card-outline" size={18} color="#000" />
                                                            <Text style={styles.buyBtnText}>
                                                                Pay ₹{price.toLocaleString('en-IN')}
                                                            </Text>
                                                        </>
                                                    )}
                                                </LinearGradient>
                                            </TouchableOpacity>

                                            <Text style={[styles.paymentNote, { color: colors.textMuted }]}>
                                                🔒 Secured by Razorpay · UPI, Card, Net Banking
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                {/* Trust badges */}
                <View style={styles.trustSection}>
                    <View style={styles.trustRow}>
                        <TrustBadge icon="shield-check" label="Secure Payment" color={colors.success} colors={colors} />
                        <TrustBadge icon="lock" label="SSL Encrypted" color={colors.textMuted} colors={colors} />
                        <TrustBadge icon="refresh" label="Instant Activation" color={colors.primary} colors={colors} />
                    </View>
                    <Text style={[styles.trustNote, { color: colors.textMuted }]}>
                        Your plan activates instantly after successful payment.
                    </Text>
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

function TrustBadge({ icon, label, color, colors }: any) {
    return (
        <View style={styles.trustBadge}>
            <MaterialCommunityIcons name={icon} size={22} color={color} />
            <Text style={[styles.trustBadgeLabel, { color: colors.textMuted }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    bgGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 280 },
    header: {
        paddingTop: 60, paddingHorizontal: 24, paddingBottom: 12,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    backBtn: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollContent: { paddingBottom: 60 },

    // Expired banner
    expiredBanner: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 12,
        marginHorizontal: 20, marginTop: 12, padding: 16,
        borderRadius: 12, borderWidth: 1
    },
    expiredBannerTitle: { fontSize: 14, fontWeight: '900', marginBottom: 2 },
    expiredBannerSub: { fontSize: 12, fontWeight: '600', lineHeight: 18 },

    // Hero
    heroSection: { paddingHorizontal: 24, marginTop: 24, marginBottom: 32 },
    heroTitle: { fontSize: 38, fontWeight: '900', lineHeight: 44, letterSpacing: -1, marginBottom: 12 },
    heroSub: { fontSize: 14, fontWeight: '600', lineHeight: 21, opacity: 0.8 },

    // Plans
    plansContainer: { paddingHorizontal: 20 },
    emptyPlans: { alignItems: 'center', paddingVertical: 60 },
    planCardWrapper: { marginBottom: 28 },
    popularCardScale: { transform: [{ scale: 1.02 }] },

    popularTag: {
        position: 'absolute', top: -12, alignSelf: 'center', zIndex: 10,
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20
    },
    popularTagText: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

    planCard: { borderRadius: 20, overflow: 'hidden' },
    cardStripe: { height: 5 },
    cardBody: { padding: 22 },

    planNameRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    planIconCircle: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    planName: { fontSize: 18, fontWeight: '900', letterSpacing: 0.2 },
    planDuration: { fontSize: 12, fontWeight: '600', marginTop: 2 },

    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
    currency: { fontSize: 22, fontWeight: '800' },
    price: { fontSize: 44, fontWeight: '900', letterSpacing: -1 },
    pricePer: { fontSize: 14, fontWeight: '600' },
    perDayRate: { fontSize: 12, fontWeight: '600', marginBottom: 20, opacity: 0.7 },

    featureList: { gap: 12, marginBottom: 24 },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    checkCircle: { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    featureText: { fontSize: 14, fontWeight: '600', flex: 1 },

    buyBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 16, gap: 10,
    },
    buyBtnText: { fontSize: 16, fontWeight: '900', color: '#000', letterSpacing: 0.5 },
    paymentNote: { fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 12, opacity: 0.7 },

    // Trust
    trustSection: { marginTop: 40, paddingHorizontal: 24, alignItems: 'center' },
    trustRow: { flexDirection: 'row', gap: 0, marginBottom: 16, width: '100%', justifyContent: 'space-around' },
    trustBadge: { alignItems: 'center', gap: 6 },
    trustBadgeLabel: { fontSize: 11, fontWeight: '700' },
    trustNote: { fontSize: 11, fontWeight: '600', textAlign: 'center', opacity: 0.6 },

    // ── Warning overlay ──────────────────────────────────────────────────
    warningOverlay: {
        position: 'absolute', zIndex: 999,
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'flex-end',
    },
    warningBackdrop: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    warningSheet: {
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        borderWidth: 1, padding: 28, paddingBottom: 40,
    },
    warningIconRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20,
    },
    warningIconCircle: {
        width: 56, height: 56, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
    },
    countdownBadge: {
        width: 44, height: 44, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center',
    },
    countdownText: { fontSize: 20, fontWeight: '900', color: '#000' },
    warningTitle: { fontSize: 22, fontWeight: '900', marginBottom: 10, letterSpacing: 0.2 },
    warningBody: { fontSize: 14, fontWeight: '600', lineHeight: 22, marginBottom: 20 },
    countdownTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
    countdownFill: { height: '100%', borderRadius: 3 },
    countdownHint: { fontSize: 12, fontWeight: '600', marginBottom: 24, textAlign: 'center' },
    warningActions: { flexDirection: 'row', gap: 12 },
    warningCancelBtn: {
        flex: 1, paddingVertical: 16, borderRadius: 12,
        borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    },
    warningCancelText: { fontSize: 15, fontWeight: '800' },
    warningProceedBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 16, gap: 8,
    },
    warningProceedText: { fontSize: 15, fontWeight: '900', color: '#000' },
});
