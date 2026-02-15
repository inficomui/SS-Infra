import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Linking } from 'react-native';
import { Text, ActivityIndicator, Searchbar, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetOperatorsQuery } from '@/redux/apis/ownerApi';
import { useAppTheme } from '@/hooks/use-theme-color';
import Toast from 'react-native-toast-message';

export default function OperatorsListScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const { data: operatorsData, isLoading, refetch } = useGetOperatorsQuery();
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const operators = operatorsData?.operators || [];

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refetch();
            Toast.show({ type: 'success', text1: 'Updated', text2: 'Operator list refreshed.' });
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not refresh data.' });
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
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Operator Fleet</Text>
                <TouchableOpacity onPress={() => router.push('/(owner)/add-operator' as any)} style={[styles.iconButton, { backgroundColor: colors.primary }]}>
                    <MaterialCommunityIcons name="account-plus" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchWrapper}>
                <Searchbar
                    placeholder="Search name or mobile..."
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
                        Total Registered: <Text style={{ color: colors.primary, fontWeight: '900' }}>{operators.length}</Text>
                    </Text>
                </View>

                {isLoading ? (
                    <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
                ) : filteredOperators.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="account-off-outline" size={80} color={colors.border} />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No operators found</Text>
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
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: '900' },
    searchWrapper: { paddingHorizontal: 24, marginBottom: 16 },
    searchBar: { borderRadius: 4, elevation: 0, borderWidth: 1 },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 24 },
    summaryBar: { marginBottom: 16, paddingLeft: 4 },
    summaryText: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    operatorCard: { padding: 16, borderRadius: 4, borderWidth: 1, flexDirection: 'row', marginBottom: 12, gap: 16, alignItems: 'center' },
    operatorInfo: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    operatorName: { fontSize: 16, fontWeight: '800' },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    detailText: { fontSize: 13, fontWeight: '600' },
    actionColumn: { alignItems: 'center', gap: 12 },
    callBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, marginTop: 16, fontWeight: '600' },
});
