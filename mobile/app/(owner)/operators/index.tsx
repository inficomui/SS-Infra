import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Linking } from 'react-native';
import { Text, ActivityIndicator, Searchbar, Avatar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetOperatorsQuery } from '@/redux/apis/ownerApi';
import { useAppTheme } from '@/hooks/use-theme-color';
import Toast from 'react-native-toast-message';

export default function OperatorsListScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors } = useAppTheme();
    const { data: operatorsData, isLoading, refetch } = useGetOperatorsQuery();
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const operators = operatorsData?.operators || [];

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refetch();
            Toast.show({ type: 'success', text1: t('owner.refreshed_success'), text2: t('owner.refreshed_msg') || 'Operator list refreshed.' });
        } catch (error) {
            Toast.show({ type: 'error', text1: t('common.error'), text2: t('owner.network_error_msg') });
        }
        setRefreshing(false);
    };

    const filteredOperators = operators.filter((operator: any) => {
        const query = searchQuery.toLowerCase();
        return (
            operator.name.toLowerCase().includes(query) ||
            operator.mobile.includes(query) ||
            operator.district.toLowerCase().includes(query) ||
            operator.taluka.toLowerCase().includes(query)
        );
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('owner.operator_fleet')}</Text>
                <TouchableOpacity onPress={() => router.push('/(owner)/add-operator' as any)} style={[styles.iconButton, { backgroundColor: colors.primary }]}>
                    <MaterialCommunityIcons name="account-plus" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchWrapper}>
                <Searchbar
                    placeholder={t('owner.search_operators')}
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
                    inputStyle={{ color: colors.textMain }}
                    placeholderTextColor={colors.textMuted}
                    iconColor={colors.primary}
                />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                <View style={styles.summaryBar}>
                    <Text style={[styles.summaryText, { color: colors.textMuted }]}>
                        {t('owner.total_registered')} <Text style={{ color: colors.primary, fontWeight: '900' }}>{operators.length}</Text>
                    </Text>
                </View>

                {isLoading ? (
                    <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
                ) : filteredOperators.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="account-off-outline" size={80} color={colors.border} />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('owner.no_operators_found')}</Text>
                    </View>
                ) : (
                    filteredOperators.map((operator: any) => (
                        <OperatorListItem key={operator.id} operator={operator} colors={colors} />
                    ))
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

function OperatorListItem({ operator, colors }: any) {
    const router = useRouter();
    const initials = operator.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

    const handleCall = () => {
        if (operator.mobile) {
            Linking.openURL(`tel:${operator.mobile}`);
        }
    };

    const handlePress = () => {
        router.push({
            pathname: '/(owner)/operator-details',
            params: { data: JSON.stringify(operator) }
        });
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[styles.operatorCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
            <Avatar.Text
                size={52}
                label={initials}
                style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}
                color={colors.primary}
                labelStyle={{ fontWeight: '900' }}
            />
            <View style={styles.operatorInfo}>
                <View style={styles.nameRow}>
                    <Text style={[styles.operatorName, { color: colors.textMain }]}>{operator.name}</Text>
                    <MaterialCommunityIcons name="check-decagram" size={16} color={colors.success} />
                </View>
                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="phone" size={12} color={colors.textMuted} />
                    <Text style={[styles.detailText, { color: colors.textMuted }]}>{operator.mobile}</Text>
                </View>
                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="map-marker" size={12} color={colors.primary} />
                    <Text style={[styles.detailText, { color: colors.textMuted }]}>{operator.district}, {operator.taluka}</Text>
                </View>
            </View>
            <View style={styles.actionColumn}>
                <TouchableOpacity onPress={handleCall} style={[styles.callBtn, { backgroundColor: colors.primary + '20' }]}>
                    <MaterialCommunityIcons name="phone-outgoing" size={18} color={colors.primary} />
                </TouchableOpacity>
                <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.textMuted} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        marginBottom: 16
    },
    iconButton: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1, elevation: 2 },
    headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
    searchWrapper: { paddingHorizontal: 20, marginBottom: 20 },
    searchBar: { borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, borderWidth: 1 },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    summaryBar: { marginBottom: 20, paddingLeft: 8 },
    summaryText: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, opacity: 0.8 },
    operatorCard: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        flexDirection: 'row',
        marginBottom: 16,
        gap: 20,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    operatorInfo: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    operatorName: { fontSize: 18, fontWeight: '800', letterSpacing: 0.2 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    detailText: { fontSize: 14, fontWeight: '500', opacity: 0.8 },
    actionColumn: { alignItems: 'center', gap: 16 },
    callBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    emptyContainer: { alignItems: 'center', marginTop: 120 },
    emptyText: { fontSize: 18, marginTop: 20, fontWeight: '600', opacity: 0.7 },
});
