
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';

export default function AboutScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const { t } = useTranslation();
    const version = Constants.expoConfig?.version || '1.0.0';

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('owner.about.title')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.logoSection}>
                    <View style={[styles.logoBox, { backgroundColor: colors.primary + '20' }]}>
                        <MaterialCommunityIcons name="excavator" size={60} color={colors.primary} />
                    </View>
                    <Text style={[styles.appName, { color: colors.textMain }]}>SS Infra Software</Text>
                    <Text style={[styles.version, { color: colors.textMuted }]}>v{version} (Build 2024.1)</Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.textMain }]}>{t('owner.about.mission')}</Text>
                    <Text style={[styles.cardText, { color: colors.textMuted }]}>
                        {t('owner.about.mission_text')}
                    </Text>
                </View>

                <View style={[styles.section, { borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{t('owner.about.developer_info')}</Text>
                    <TouchableOpacity onPress={() => Linking.openURL('https://inficomsolutions.in')} style={[styles.linkRow, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.linkLabel, { color: colors.textMuted }]}>{t('owner.about.developed_by')}</Text>
                        <Text style={[styles.linkValue, { color: colors.primary }]}>Inficom Solutions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL('mailto:support@ssinfra.com')} style={styles.linkRow}>
                        <Text style={[styles.linkLabel, { color: colors.textMuted }]}>{t('owner.about.contact_support')}</Text>
                        <Text style={[styles.linkValue, { color: colors.textMain }]}>support@ssinfra.com</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textMuted }]}>
                        {t('owner.about.rights_reserved')}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { padding: 24 },
    logoSection: { alignItems: 'center', marginBottom: 40 },
    logoBox: { width: 100, height: 100, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    appName: { fontSize: 24, fontWeight: '900', letterSpacing: 0.5 },
    version: { fontSize: 14, marginTop: 4, fontWeight: '500' },
    card: { padding: 20, borderRadius: 4, borderWidth: 1, marginBottom: 24 },
    cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
    cardText: { fontSize: 14, lineHeight: 22 },
    section: { borderTopWidth: 1, paddingTop: 24 },
    sectionTitle: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', marginBottom: 16 },
    linkRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'transparent' },
    linkLabel: { fontSize: 14, fontWeight: '600' },
    linkValue: { fontSize: 14, fontWeight: '700' },
    footer: { marginTop: 40, alignItems: 'center' },
    footerText: { fontSize: 12 }
});
