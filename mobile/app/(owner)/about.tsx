
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import DeveloperCard from '@/components/DeveloperCard';

export default function AboutScreen() {
    const router = useRouter();
    const { colors, isDark } = useAppTheme();
    const { t } = useTranslation();
    const version = Constants.expoConfig?.version || '1.0.0';

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('about.title')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <View style={[styles.logoBox, { backgroundColor: colors.primary + '20' }]}>
                        <MaterialCommunityIcons name="excavator" size={60} color={colors.primary} />
                    </View>
                    <Text style={[styles.appName, { color: colors.textMain }]}>SS Infra Software</Text>
                    <View style={[styles.versionBadge, { backgroundColor: colors.primary + '15', borderColor: colors.border }]}>
                        <Text style={[styles.versionText, { color: colors.primary }]}>v{version} (Build 2024.1)</Text>
                    </View>
                </View>

                {/* Mission */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.textMain }]}>{t('about.mission')}</Text>
                    <Text style={[styles.cardText, { color: colors.textMuted }]}>
                        {t('about.mission_text')}
                    </Text>
                </View>

                {/* Contact */}
                <View style={[styles.section, { borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{t('about.developer_info')}</Text>
                    <TouchableOpacity
                        onPress={() => Linking.openURL('mailto:support@ssinfra.com')}
                        style={[styles.linkRow, { borderBottomColor: colors.border }]}
                    >
                        <Text style={[styles.linkLabel, { color: colors.textMuted }]}>{t('about.contact_support')}</Text>
                        <Text style={[styles.linkValue, { color: colors.textMain }]}>support@ssinfra.com</Text>
                    </TouchableOpacity>
                </View>

                {/* Developer Info — shared component */}
                <Text style={[styles.sectionTitle, { color: colors.textMain, marginBottom: 12 }]}>Developer Info</Text>
                <DeveloperCard colors={colors} isDark={isDark} />

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textMuted }]}>
                        {t('about.rights_reserved')}
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
    logoSection: { alignItems: 'center', marginBottom: 36 },
    logoBox: { width: 100, height: 100, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    appName: { fontSize: 24, fontWeight: '900', letterSpacing: 0.5, marginBottom: 10 },
    versionBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
    versionText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
    card: { padding: 20, borderRadius: 12, borderWidth: 1, marginBottom: 24 },
    cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
    cardText: { fontSize: 14, lineHeight: 22 },
    section: { borderTopWidth: 1, paddingTop: 24, marginBottom: 28 },
    sectionTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 },
    linkRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
    linkLabel: { fontSize: 14, fontWeight: '600' },
    linkValue: { fontSize: 14, fontWeight: '700' },
    footer: { marginTop: 36, alignItems: 'center', paddingBottom: 40 },
    footerText: { fontSize: 12 },
});
