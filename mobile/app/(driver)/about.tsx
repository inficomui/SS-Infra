import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import DeveloperCard from '@/components/DeveloperCard';

export default function DriverAboutScreen() {
    const router = useRouter();
    const { colors, isDark } = useAppTheme();
    const { t } = useTranslation();
    const version = Constants.expoConfig?.version || '1.0.0';

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>About</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Brand Card */}
                <View style={[styles.brandCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                        <MaterialCommunityIcons name="truck-outline" size={48} color={colors.primary} />
                    </View>
                    <Text style={[styles.brandName, { color: colors.textMain }]}>SS Infra Software</Text>
                    <Text style={[styles.brandSub, { color: colors.textMuted }]}>Driver Management Portal</Text>
                    <View style={[styles.versionBadge, { backgroundColor: colors.primary + '15', borderColor: colors.border }]}>
                        <Text style={[styles.versionText, { color: colors.primary }]}>v{version} (Beta)</Text>
                    </View>
                </View>

                {/* Mission */}
                <View style={styles.infoSection}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Our Mission</Text>
                    <Text style={[styles.paragraph, { color: colors.textMuted }]}>
                        Empowering drivers with smart tools to manage duty sessions, track earnings, and stay connected with the fleet — even offline.
                    </Text>
                </View>

                {/* App Info */}
                <View style={styles.infoSection}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>App Info</Text>
                    <View style={[styles.infoRow, { borderColor: colors.border }]}>
                        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Version</Text>
                        <Text style={[styles.infoValue, { color: colors.textMain }]}>v{version}</Text>
                    </View>
                    <View style={[styles.infoRow, { borderColor: colors.border, borderTopWidth: 0 }]}>
                        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Platform</Text>
                        <Text style={[styles.infoValue, { color: colors.textMain }]}>React Native (Expo)</Text>
                    </View>
                    <View style={[styles.infoRow, { borderColor: colors.border, borderTopWidth: 0 }]}>
                        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Support</Text>
                        <Text style={[styles.infoValue, { color: colors.primary }]}>support@ssinfra.com</Text>
                    </View>
                </View>

                {/* Developer Info — shared component */}
                <Text style={[styles.sectionTitle, { color: colors.textMain, marginBottom: 12 }]}>Developer Info</Text>
                <DeveloperCard colors={colors} isDark={isDark} />

                <View style={{ height: 20 }} />
                <Text style={[styles.copyright, { color: colors.textMuted }]}>
                    © {new Date().getFullYear()} SS Infra Software. All rights reserved.
                </Text>
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { padding: 24 },
    brandCard: { alignItems: 'center', padding: 36, borderRadius: 16, borderWidth: 1, marginBottom: 32 },
    logoPlaceholder: { width: 84, height: 84, borderRadius: 42, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    brandName: { fontSize: 24, fontWeight: '900', letterSpacing: 1 },
    brandSub: { fontSize: 12, fontWeight: '600', marginTop: 4, marginBottom: 14 },
    versionBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1, marginTop: 4 },
    versionText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
    infoSection: { marginBottom: 24 },
    sectionTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 1 },
    paragraph: { fontSize: 14, lineHeight: 22 },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 6,
    },
    infoLabel: { fontSize: 13, fontWeight: '600' },
    infoValue: { fontSize: 13, fontWeight: '700' },
    copyright: { textAlign: 'center', fontSize: 11 },
});
