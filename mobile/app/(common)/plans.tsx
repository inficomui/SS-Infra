import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Text, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useGetPlansQuery } from '@/redux/apis/walletApi';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function PlansScreen() {
    const router = useRouter();
    const { colors, isDark } = useAppTheme();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const { data: plansData, isLoading } = useGetPlansQuery();

    // Mock plans if API returns empty - with enhanced metadata
    const plans = plansData?.plans || [
        {
            id: 'basic',
            name: 'Starter',
            price: billingCycle === 'monthly' ? '999' : '9,999',
            period: billingCycle === 'monthly' ? '/mo' : '/yr',
            description: 'Perfect for single machine owners',
            features: ['Live Tracking', 'Fuel & Maintenance Logs', 'Basic Reports', '1 Admin Account'],
            icons: ['map-marker-radius', 'gas-station', 'file-chart', 'account'],
            gradient: ['#6366f1', '#4f46e5'],
            popular: false
        },
        {
            id: 'pro',
            name: 'Business Pro',
            price: billingCycle === 'monthly' ? '2,499' : '24,999',
            period: billingCycle === 'monthly' ? '/mo' : '/yr',
            description: 'Scale your infrastructure fleet',
            features: ['Live Fleet Dashboard', 'Advanced Maintenance alerts', 'AI-Powered Cost analysis', 'Unlimited Operators', 'Priority 24/7 Support'],
            icons: ['view-dashboard', 'wrench-clock', 'brain', 'account-group', 'headset'],
            gradient: [colors.primary, '#f97316'],
            popular: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 'Custom',
            description: 'Full ERP for large projects',
            features: ['API Integrations', 'Custom Whitelabeling', 'Dedicated Success Manager', 'On-site Training'],
            icons: ['api', 'palette', 'shield-search', 'school'],
            gradient: ['#1e293b', '#0f172a'],
            popular: false
        }
    ];

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
                    <Text style={[styles.titleBadgeText, { color: colors.primary }]}>SUBSCRIPTIONS</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <Text style={[styles.heroTitle, { color: colors.textMain }]}>Built for the{'\n'}Future of Infra</Text>
                    <Text style={[styles.heroSub, { color: colors.textMuted }]}>Choose the strength your business needs to grow.</Text>
                </View>

                {/* Billing Toggle */}
                <View style={[styles.toggleContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TouchableOpacity
                        onPress={() => setBillingCycle('monthly')}
                        style={[styles.toggleBtn, billingCycle === 'monthly' && { backgroundColor: colors.primary }]}
                    >
                        <Text style={[styles.toggleText, { color: billingCycle === 'monthly' ? '#000' : colors.textMuted }]}>Monthly</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setBillingCycle('yearly')}
                        style={[styles.toggleBtn, billingCycle === 'yearly' && { backgroundColor: colors.primary }]}
                    >
                        <Text style={[styles.toggleText, { color: billingCycle === 'yearly' ? '#000' : colors.textMuted }]}>Yearly</Text>
                        {billingCycle !== 'yearly' && (
                            <View style={styles.saveBadge}>
                                <Text style={styles.saveText}>-20%</Text>
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
                                    <Text style={styles.popularTagText}>MOST POPULAR</Text>
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

                                <TouchableOpacity style={styles.btnShadow}>
                                    <LinearGradient
                                        colors={plan.popular ? plan.gradient : [colors.card, colors.card]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[styles.actionBtn, !plan.popular && { borderWidth: 1, borderColor: colors.border }]}
                                    >
                                        <Text style={[styles.actionBtnText, { color: plan.popular ? '#000' : colors.textMain }]}>
                                            {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Trust Section */}
                <View style={styles.trustSection}>
                    <Text style={[styles.trustTitle, { color: colors.textMuted }]}>POWERING INFRASTRUCTURE TEAMS WORLDWIDE</Text>
                    <View style={styles.trustIcons}>
                        <MaterialCommunityIcons name="shield-check" size={24} color={colors.success} />
                        <MaterialCommunityIcons name="lock" size={24} color={colors.textMuted} />
                        <MaterialCommunityIcons name="credit-card-check" size={24} color={colors.textMuted} />
                    </View>
                    <Text style={[styles.trustText, { color: colors.textMuted }]}>SSL Encrypted • Safe & Secure • Auto-renewing</Text>
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
