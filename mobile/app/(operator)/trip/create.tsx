import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {
    Text,
    TextInput,
    ActivityIndicator,
    Modal,
    Portal,
    Searchbar,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/use-theme-color';
import { storage } from '@/redux/storage';
import { useGetClientsQuery, Client } from '@/redux/apis/workApi';
import { useCreateTripEntryMutation } from '@/redux/apis/tripApi';

export default function CreateTripEntryScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colors } = useAppTheme();

    const { data: clientsData, isLoading: isLoadingClients } = useGetClientsQuery();
    const [createTripEntry, { isLoading: isSubmitting }] = useCreateTripEntryMutation();

    const clients = clientsData?.clients || [];
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [showClientModal, setShowClientModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [workName, setWorkName] = useState('');
    const [tripCount, setTripCount] = useState('');
    const [costPerTrip, setCostPerTrip] = useState('');
    const [selectedMachine, setSelectedMachine] = useState<any>(null);

    useEffect(() => {
        const loadMachine = async () => {
            try {
                const stored = await storage.getItem('selected_machine');
                if (stored) {
                    setSelectedMachine(JSON.parse(stored));
                }
            } catch (e) {
                console.error("Failed to load machine", e);
            }
        };
        loadMachine();
    }, []);

    const countNum = parseFloat(tripCount) || 0;
    const rateNum = parseFloat(costPerTrip) || 0;
    const totalAmount = countNum * rateNum;

    const handleSave = async () => {
        if (!selectedClient && !workName) {
            Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please select a client or enter work name.' });
            return;
        }

        if (countNum <= 0 || rateNum <= 0) {
            Toast.show({ type: 'error', text1: 'Invalid Numbers', text2: 'Please enter valid trip count and cost per trip.' });
            return;
        }

        try {
            const todayStr = new Date().toISOString().split('T')[0];
            await createTripEntry({
                clientId: selectedClient?.id || 0,
                clientName: selectedClient?.name || 'General Client',
                workName: workName || 'Trip Work',
                machineId: selectedMachine?.id || 0,
                machineName: selectedMachine?.name || 'Tractor/Dumper',
                tripCount: countNum,
                costPerTrip: rateNum,
                totalAmount: totalAmount,
                date: todayStr,
                entryDate: todayStr,
                entry_date: todayStr
            }).unwrap();

            Toast.show({ type: 'success', text1: 'Success', text2: `Trip entry logged: ₹${totalAmount.toLocaleString('en-IN')}` });
            router.replace('/(operator)/trip' as any);
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: error?.data?.message || 'Failed to save trip entry.' });
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.mobile.includes(searchQuery)
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('trip_management.log_trip') || 'Log Trip Entry'}</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Machine Info */}
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('custom_work.assigned_machine_auto') || 'MACHINE APPLICABLE (TRACTOR / JCB / DUMPER)'}</Text>
                    <View style={[styles.machineBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MaterialCommunityIcons name="dump-truck" size={32} color={colors.primary} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.machineTitle, { color: colors.textMain }]}>
                                {selectedMachine ? selectedMachine.name : (t('trip_management.default_machine') || 'Trip Equipment')}
                            </Text>
                            <Text style={[styles.machineSub, { color: colors.textMuted }]}>
                                {selectedMachine ? selectedMachine.registration_number || selectedMachine.registrationNumber || (t('custom_work.assigned_machine') || 'Assigned Fleet') : (t('custom_work.assign_machine_hint') || 'Auto Selected from Dashboard')}
                            </Text>
                        </View>
                    </View>

                    {/* Client Selection */}
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('trip_management.select_client_or_work') || 'SELECT CLIENT OR ENTER WORK'}</Text>
                    <TouchableOpacity
                        style={[styles.selectorBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => setShowClientModal(true)}
                    >
                        <MaterialCommunityIcons name="account" size={24} color={colors.primary} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.selectorLabel, { color: colors.textMuted }]}>{t('common.client') || 'Client Name'}</Text>
                            <Text style={[styles.selectorValue, { color: colors.textMain }]}>
                                {selectedClient ? selectedClient.name : (t('custom_work.tap_select_client') || 'Tap to select client')}
                            </Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-down" size={24} color={colors.textMuted} />
                    </TouchableOpacity>

                    <TextInput
                        label={t('trip_management.work_name') || "Work Description / Location"}
                        mode="outlined"
                        value={workName}
                        onChangeText={setWorkName}
                        style={[styles.input, { backgroundColor: colors.background, marginTop: 12 }]}
                        textColor={colors.textMain}
                        left={<TextInput.Icon icon="briefcase" color={colors.primary} />}
                    />

                    {/* Calculation Section */}
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('trip_management.trip_calc') || 'TRIP CALCULATION'}</Text>
                    <View style={[styles.calcCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <TextInput
                            label={t('trip_management.trip_count') || "Trip Count (No. of Trips)"}
                            mode="outlined"
                            value={tripCount}
                            onChangeText={setTripCount}
                            keyboardType="numeric"
                            style={[styles.input, { backgroundColor: colors.background }]}
                            textColor={colors.textMain}
                            left={<TextInput.Icon icon="counter" color={colors.warning} />}
                        />

                        <TextInput
                            label={t('trip_management.cost_per_trip') || "Cost Per Trip (Rate ₹)"}
                            mode="outlined"
                            value={costPerTrip}
                            onChangeText={setCostPerTrip}
                            keyboardType="numeric"
                            style={[styles.input, { backgroundColor: colors.background }]}
                            textColor={colors.textMain}
                            left={<TextInput.Icon icon="cash" color={colors.primary} />}
                        />

                        <View style={[styles.totalBox, { backgroundColor: colors.background, borderColor: colors.success }]}>
                            <Text style={[styles.totalLabel, { color: colors.textMuted }]}>{t('trip_management.auto_calc_earnings') || 'TOTAL AUTO-CALCULATED EARNINGS'}</Text>
                            <Text style={[styles.totalVal, { color: colors.success }]}>₹{totalAmount.toLocaleString('en-IN')}</Text>
                            <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                                ({countNum} {t('trip_management.trips_suffix') || 'trips'} × ₹{rateNum})
                            </Text>
                        </View>
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <TouchableOpacity onPress={handleSave} disabled={isSubmitting} style={styles.submitBtn}>
                    <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.gradientBtn}>
                        {isSubmitting ? <ActivityIndicator color="#fff" /> : (
                            <>
                                <MaterialCommunityIcons name="check-circle" size={24} color="#fff" />
                                <Text style={styles.submitText}>{t('trip_management.save_entry') || 'Save Trip Entry'} (₹{totalAmount.toLocaleString('en-IN')})</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Client Modal */}
            <Portal>
                <Modal visible={showClientModal} onDismiss={() => setShowClientModal(false)} contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <Text style={[styles.modalTitle, { color: colors.textMain }]}>{t('custom_work.select_client_modal') || 'Select Client'}</Text>
                    <Searchbar placeholder={t('custom_work.tap_select_client') || "Search client..."} onChangeText={setSearchQuery} value={searchQuery} style={styles.searchBar} inputStyle={{ color: colors.textMain }} />
                    <ScrollView style={{ maxHeight: 350 }}>
                        {isLoadingClients ? <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} /> : (
                            filteredClients.map(c => (
                                <TouchableOpacity
                                    key={c.id}
                                    style={[styles.clientItem, { borderBottomColor: colors.border }]}
                                    onPress={() => { setSelectedClient(c); setShowClientModal(false); }}
                                >
                                    <Text style={{ color: colors.textMain, fontWeight: '800', fontSize: 16 }}>{c.name}</Text>
                                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>{c.mobile} • {c.district}</Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 140 },
    sectionTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 0.5, marginTop: 24, marginBottom: 10 },
    machineBox: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, gap: 14 },
    machineTitle: { fontSize: 16, fontWeight: '900' },
    machineSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    selectorBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1 },
    selectorLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    selectorValue: { fontSize: 15, fontWeight: '900', marginTop: 2 },
    input: { marginBottom: 12 },
    calcCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
    totalBox: { padding: 16, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', marginTop: 8 },
    totalLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    totalVal: { fontSize: 26, fontWeight: '900', marginVertical: 4 },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1 },
    submitBtn: { height: 58, borderRadius: 14, overflow: 'hidden' },
    gradientBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '900' },
    modalContainer: { margin: 20, padding: 20, borderRadius: 14 },
    modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 14 },
    searchBar: { elevation: 0, borderRadius: 10, marginBottom: 14 },
    clientItem: { paddingVertical: 14, borderBottomWidth: 1 },
});
