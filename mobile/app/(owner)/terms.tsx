
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';

export default function TermsScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Terms & Privacy</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.heading, { color: colors.textMain }]}>1. Terms of Use</Text>
                <Text style={[styles.paragraph, { color: colors.textMuted }]}>
                    By accessing this application, you agree to be bound by these terms. This app is designed for fleet management purposes only. Misuse or unauthorized access is prohibited.
                </Text>

                <Text style={[styles.heading, { color: colors.textMain }]}>2. Privacy Policy</Text>
                <Text style={[styles.paragraph, { color: colors.textMuted }]}>
                    We value your privacy. Your data, including location and fleet details, is securely stored and used exclusively for service optimization. We do not share personal information with third parties without consent.
                </Text>

                <Text style={[styles.heading, { color: colors.textMain }]}>3. Data Security</Text>
                <Text style={[styles.paragraph, { color: colors.textMuted }]}>
                    We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
                </Text>

                <Text style={[styles.heading, { color: colors.textMain }]}>4. Changes to Policy</Text>
                <Text style={[styles.paragraph, { color: colors.textMuted }]}>
                    This policy may be updated periodically. Continued use of the app signifies acceptance of any changes.
                </Text>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textMuted }]}>Last updated: Feb 2026</Text>
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
    heading: { fontSize: 16, fontWeight: '800', marginTop: 16, marginBottom: 8 },
    paragraph: { fontSize: 14, lineHeight: 22 },
    footer: { marginTop: 40, alignItems: 'center' },
    footerText: { fontSize: 12, fontStyle: 'italic' }
});
