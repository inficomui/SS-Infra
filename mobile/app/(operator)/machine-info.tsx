import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const THEME = {
    bg: '#111827',
    primary: '#FBBF24',
    textMuted: '#9CA3AF',
};

import { useTranslation } from 'react-i18next';

export default function MachineInfoScreen() {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.content}>
                <MaterialCommunityIcons name="engine" size={80} color={THEME.primary} />
                <Text style={styles.title}>{t('machine_info.title')}</Text>
                <Text style={styles.subtitle}>{t('machine_info.subtitle')}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg, padding: 20 },
    backButton: { marginTop: 40, alignSelf: 'flex-start' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 20 },
    subtitle: { color: THEME.textMuted, fontSize: 16, marginTop: 10 },
});
