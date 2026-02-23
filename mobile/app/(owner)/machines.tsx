
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Dimensions, Image } from 'react-native';
import { Text, ActivityIndicator, Searchbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetMachinesQuery, useDeleteMachineMutation, useGetOperatorsQuery } from '@/redux/apis/ownerApi';
import { useAppTheme } from '@/hooks/use-theme-color';
import Toast from 'react-native-toast-message';
import ConfirmationModal from '@/components/ConfirmationModal';
import { resolveImageUrl } from '../../utils/imageHelpers';

const { width } = Dimensions.get('window');

export default function MachinesListScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors, isDark } = useAppTheme();
    const { data: machinesData, isLoading, refetch } = useGetMachinesQuery();
    const { data: operatorsData } = useGetOperatorsQuery();
    const [deleteMachine, { isLoading: isDeleting }] = useDeleteMachineMutation();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [machineToDelete, setMachineToDelete] = useState<any>(null);

    const machines = machinesData?.machines || [];
    const operators = operatorsData?.operators || [];

    const getOperatorName = (id: number) => {
        const op = operators.find(o => o.id === id);
        return op ? op.name : `ID: ${id}`;
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refetch();
            Toast.show({ type: 'success', text1: t('fleet.refreshed_success'), text2: t('fleet.refreshed_msg') });
        } catch (e) {
            Toast.show({ type: 'error', text1: t('fleet.network_error'), text2: t('fleet.network_error_msg') });
        }
        setRefreshing(false);
    };

    const confirmDelete = (machine: any) => {
        setMachineToDelete(machine);
        setModalVisible(true);
    };

    const handleActualDelete = async () => {
        if (!machineToDelete) return;

        setModalVisible(false); // Close modal first
        try {
            await deleteMachine(machineToDelete.id).unwrap();
            Toast.show({
                type: 'success',
                text1: t('fleet.delete_success'),
                text2: t('fleet.delete_success_msg', { name: machineToDelete.name })
            });
            setMachineToDelete(null);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: t('fleet.delete_error'),
                text2: t('fleet.delete_error_msg')
            });
        }
    };

    const handleEdit = (machine: any) => {
        router.push({
            pathname: '/(owner)/add-machine',
            params: {
                id: machine.id,
                fullData: JSON.stringify(machine)
            }
        });
    };

    const filteredMachines = machines.filter((m: any) => {
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.registration_number && m.registration_number.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('fleet.title')}</Text>
                <TouchableOpacity onPress={() => router.push('/(owner)/add-machine' as any)} style={[styles.iconButton, { backgroundColor: colors.primary }]}>
                    <MaterialCommunityIcons name="plus" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchWrapper}>
                <Searchbar
                    placeholder={t('fleet.search_placeholder')}
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
                    inputStyle={{ color: colors.textMain }}
                    placeholderTextColor={colors.textMuted}
                    iconColor={colors.primary}
                />
            </View>

            <View style={styles.filtersWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                    <FilterChip label={t('fleet.all_fleet')} active={statusFilter === 'all'} onPress={() => setStatusFilter('all')} colors={colors} />
                    <FilterChip label={t('fleet.online')} active={statusFilter === 'available'} onPress={() => setStatusFilter('available')} colors={colors} />
                    <FilterChip label={t('fleet.active')} active={statusFilter === 'in_use'} onPress={() => setStatusFilter('in_use')} colors={colors} />
                    <FilterChip label={t('fleet.under_service')} active={statusFilter === 'maintenance'} onPress={() => setStatusFilter('maintenance')} colors={colors} />
                </ScrollView>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {isLoading ? (
                    <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
                ) : filteredMachines.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="truck-outline" size={80} color={colors.border} />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('fleet.no_machines')}</Text>
                    </View>
                ) : (
                    filteredMachines.map((machine: any) => (
                        <MachineListItem
                            key={machine.id}
                            machine={machine}
                            colors={colors}
                            currentOperator={machine.current_operator_id ? operators.find((o: any) => o.id === machine.current_operator_id) : null}
                            onEdit={() => handleEdit(machine)}
                            onDelete={() => confirmDelete(machine)}
                        />
                    ))
                )}
                <View style={{ height: 40 }} />
            </ScrollView>

            <ConfirmationModal
                visible={modalVisible}
                title={t('fleet.delete_title')}
                message={t('fleet.delete_confirm', { name: machineToDelete?.name, reg: machineToDelete?.registrationNumber })}
                onConfirm={handleActualDelete}
                onCancel={() => setModalVisible(false)}
                confirmText={t('fleet.delete')}
                cancelText={t('fleet.keep')}
                type="danger"
            />
        </View>
    );
}

function FilterChip({ label, active, onPress, colors }: any) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.filterChip,
                { backgroundColor: colors.card, borderColor: colors.border },
                active && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
        >
            <Text style={[styles.filterChipText, { color: colors.textMuted }, active && { color: '#000' }]}>{label}</Text>
        </TouchableOpacity>
    );
}

function MachineListItem({ machine, colors, currentOperator, onEdit, onDelete }: any) {
    const router = useRouter();
    const { t } = useTranslation();
    const statusConfig: any = {
        available: { color: colors.success, label: t('fleet.online'), icon: 'check-circle' },
        in_use: { color: colors.warning, label: t('fleet.on_site'), icon: 'play-circle' },
        maintenance: { color: colors.at_service, label: t('fleet.at_service'), icon: 'alert-circle' },
    };
    const status = statusConfig[machine.status || 'available'];

    const handlePress = () => {
        const fullData = {
            ...machine,
            current_operator: currentOperator
        };

        router.push({
            pathname: '/(owner)/machine-details',
            params: { data: JSON.stringify(fullData) }
        });
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[styles.machineCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
            <View style={[styles.machineIconBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {machine.photo_url ? (
                    <Image source={{ uri: resolveImageUrl(machine.photo_url) }} style={styles.machineImage} />
                ) : (
                    <MaterialCommunityIcons name="excavator" size={32} color={colors.textMuted} />
                )}
            </View>
            <View style={styles.machineInfo}>
                <View style={styles.machineHeader}>
                    <Text style={[styles.machineName, { color: colors.textMain }]} numberOfLines={1}>{machine.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                </View>
                <View style={styles.snWrapper}>
                    <Text style={[styles.snLabel, { color: colors.textMuted }]}>{t('fleet.reg_label')}</Text>
                    <Text style={[styles.machineReg, { color: colors.textMain }]}>{machine.registration_number || 'N/A'}</Text>
                </View>

                {machine.status === 'in_use' && currentOperator && (
                    <View style={styles.operatorRow}>
                        <MaterialCommunityIcons name="account-hard-hat" size={14} color={colors.primary} />
                        <Text style={[styles.operatorName, { color: colors.textMain }]}>{currentOperator.name}</Text>
                    </View>
                )}

                <View style={styles.machineFooter}>
                    <View style={styles.actionIcons}>
                        <TouchableOpacity style={[styles.miniBtn, { borderColor: colors.border, backgroundColor: colors.primary + '10' }]} onPress={handlePress}>
                            <MaterialCommunityIcons name="eye" size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.miniBtn, { borderColor: colors.border }]} onPress={onEdit}>
                            <MaterialCommunityIcons name="pencil" size={16} color={colors.textMain} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.miniBtn, { borderColor: colors.border, backgroundColor: colors.danger + '10' }]} onPress={onDelete}>
                            <MaterialCommunityIcons name="delete-outline" size={16} color={colors.danger} />
                        </TouchableOpacity>
                    </View>
                </View>
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
    filtersWrapper: { marginBottom: 16 },
    filterContent: { paddingHorizontal: 24, gap: 10 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4, borderWidth: 1 },
    filterChipText: { fontSize: 13, fontWeight: '700' },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 24 },
    machineCard: { padding: 12, borderRadius: 4, borderWidth: 1, flexDirection: 'row', marginBottom: 12, gap: 14 },
    machineIconBox: { width: 80, height: 80, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1, overflow: 'hidden' },
    machineImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    machineInfo: { flex: 1, justifyContent: 'center' },
    machineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    machineName: { fontSize: 16, fontWeight: '800', flex: 1 },
    snWrapper: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    snLabel: { fontSize: 10, fontWeight: '800' },
    machineReg: { fontSize: 13, fontWeight: '900' },
    operatorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10, paddingVertical: 2, paddingHorizontal: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 4, alignSelf: 'flex-start' },
    operatorName: { fontSize: 12, fontWeight: '600' },
    machineFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
    actionIcons: { flexDirection: 'row', gap: 8 },
    miniBtn: { width: 32, height: 32, borderRadius: 4, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, marginTop: 16, fontWeight: '600' },
});
