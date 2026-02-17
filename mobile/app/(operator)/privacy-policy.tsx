import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';

export default function PrivacyPolicyScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Privacy Policy</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.paragraph, { color: colors.textMain }]}>
                    Your privacy is important to us. It is SS Infra's policy to respect your privacy regarding any information we may collect from you across our application.
                </Text>

                <Text style={[styles.heading, { color: colors.textMain }]}>1. Information We Collect</Text>
                <Text style={[styles.paragraph, { color: colors.textMain }]}>
                    We collect information that you proactively provide to us (such as profile details) and data that is automatically collected (such as GPS location during work sessions).
                </Text>

                <Text style={[styles.heading, { color: colors.textMain }]}>2. How We Use Information</Text>
                <Text style={[styles.paragraph, { color: colors.textMain }]}>
                    We use your information to facilitate equipment tracking, billing calculation, and improved operational efficiency.
                </Text>

                <Text style={[styles.heading, { color: colors.textMain }]}>3. Data Security</Text>
                <Text style={[styles.paragraph, { color: colors.textMain }]}>
                    We protect your data within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use, or modification.
                </Text>

                <Text style={[styles.heading, { color: colors.textMain }]}>4. Changes to This Policy</Text>
                <Text style={[styles.paragraph, { color: colors.textMain }]}>
                    We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { padding: 24, paddingBottom: 40 },
    heading: { fontSize: 16, fontWeight: '800', marginTop: 24, marginBottom: 8 },
    paragraph: { fontSize: 14, lineHeight: 22, opacity: 0.8 }
});
