
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';

export default function MachineDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { colors } = useAppTheme();

    const machine = params.data ? JSON.parse(params.data as string) : null;

    if (!machine) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.textMuted }}>No machine data found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const { name, registration_number, photo_url, status, purchase_date, current_operator } = machine;

    const statusConfig: any = {
        available: { color: colors.success, label: 'Online', icon: 'check-circle' },
        in_use: { color: colors.warning, label: 'On Site', icon: 'play-circle' },
        maintenance: { color: colors.danger, label: 'At Service', icon: 'alert-circle' },
    };
    const currentStatus = statusConfig[status || 'available'];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Machine Details</Text>
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/(owner)/add-machine', params: { id: machine.id, fullData: JSON.stringify(machine) } })}
                    style={[styles.iconButton, { backgroundColor: colors.primary }]}
                >
                    <MaterialCommunityIcons name="pencil" size={20} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.imageContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
                    {photo_url ? (
                        <Image source={{ uri: photo_url }} style={styles.machineImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.placeholderImage, { backgroundColor: colors.background }]}>
                            <MaterialCommunityIcons name="excavator" size={60} color={colors.textMuted} />
                        </View>
                    )}
                    <View style={[styles.statusBadge, { backgroundColor: currentStatus.color }]}>
                        <MaterialCommunityIcons name={currentStatus.icon} size={14} color="#fff" />
                        <Text style={styles.statusText}>{currentStatus.label}</Text>
                    </View>
                </View>

                <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.machineName, { color: colors.textMain }]}>{name}</Text>
                    <Text style={[styles.machineReg, { color: colors.textMuted }]}>{registration_number || 'N/A'}</Text>

                    <View style={styles.divider} />

                    <View style={styles.detailGrid}>
                        <DetailItem icon="calendar" label="Purchase Date" value={purchase_date || 'N/A'} colors={colors} />
                        <DetailItem icon="alert-circle-outline" label="Status" value={currentStatus.label} colors={colors} valueColor={currentStatus.color} />
                    </View>

                    {current_operator && (
                        <View style={[styles.operatorSection, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Current Operator</Text>
                            <View style={styles.operatorRow}>
                                <Avatar.Text size={40} label={current_operator.name.substring(0, 2).toUpperCase()} style={{ backgroundColor: colors.primary }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.operatorName, { color: colors.textMain }]}>{current_operator.name}</Text>
                                    <Text style={[styles.operatorPhone, { color: colors.textMuted }]}>{current_operator.mobile}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/(owner)/maintenance/add' as any, params: { preselectedMachineId: machine.id } })}
                            style={[styles.actionBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
                        >
                            <MaterialCommunityIcons name="wrench-outline" size={24} color={colors.primary} />
                            <Text style={[styles.actionBtnText, { color: colors.textMain }]}>Log Maintenance</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/(owner)/fuel' as any, params: { preselectedMachineId: machine.id } })}
                            style={[styles.actionBtn, { backgroundColor: colors.warning + '15', borderColor: colors.warning }]}
                        >
                            <MaterialCommunityIcons name="gas-station-outline" size={24} color={colors.warning} />
                            <Text style={[styles.actionBtnText, { color: colors.textMain }]}>Fuel Logs</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

function DetailItem({ icon, label, value, colors, valueColor }: any) {
    return (
        <View style={[styles.detailItem, { borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
            </View>
            <View>
                <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
                <Text style={[styles.value, { color: valueColor || colors.textMain }]}>{value}</Text>
            </View>
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
    imageContainer: { height: 240, borderRadius: 4, borderWidth: 1, overflow: 'hidden', position: 'relative', marginBottom: 20 },
    machineImage: { width: '100%', height: '100%' },
    placeholderImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    statusBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
    statusText: { color: '#fff', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
    infoCard: { padding: 20, borderRadius: 4, borderWidth: 1 },
    machineName: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
    machineReg: { fontSize: 14, fontWeight: '600', marginBottom: 16 },
    divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginBottom: 20 },
    detailGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    detailItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    label: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
    value: { fontSize: 14, fontWeight: '700' },
    operatorSection: { padding: 16, borderRadius: 4, borderWidth: 1, marginTop: 10 },
    sectionTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 12 },
    operatorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    operatorName: { fontSize: 15, fontWeight: '700' },
    operatorPhone: { fontSize: 13, fontWeight: '600' },
    actionRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
    actionBtn: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center', gap: 8 },
    actionBtnText: { fontSize: 12, fontWeight: '800', textAlign: 'center' }
});
