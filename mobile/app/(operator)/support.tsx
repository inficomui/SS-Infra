
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/use-theme-color';

export default function SupportScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();

    const handleCall = () => {
        Linking.openURL('tel:+919876543210');
    };

    const handleEmail = () => {
        Linking.openURL('mailto:support@ssinfrasoftware.com');
    };

    const handleWhatsApp = () => {
        Linking.openURL('whatsapp://send?phone=+919876543210&text=Hello, I need support.');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Help & Support</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                        <MaterialCommunityIcons name="headset" size={40} color={colors.primary} />
                    </View>
                    <Text style={[styles.cardTitle, { color: colors.textMain }]}>How can we help you?</Text>
                    <Text style={[styles.cardtext, { color: colors.textMuted }]}>
                        Our support team is available Mon-Sat, 9am - 6pm to assist you with any issues related to the app or your work sessions.
                    </Text>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Contact Options</Text>

                <TouchableOpacity onPress={handleCall} style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.optionIcon, { backgroundColor: '#e0f2fe' }]}>
                        <MaterialCommunityIcons name="phone" size={24} color="#0284c7" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.optionTitle, { color: colors.textMain }]}>Call Support</Text>
                        <Text style={[styles.optionSub, { color: colors.textMuted }]}>Speak directly with an agent</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleWhatsApp} style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.optionIcon, { backgroundColor: '#dcfce7' }]}>
                        <MaterialCommunityIcons name="whatsapp" size={24} color="#16a34a" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.optionTitle, { color: colors.textMain }]}>WhatsApp Chat</Text>
                        <Text style={[styles.optionSub, { color: colors.textMuted }]}>Quick answers via chat</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleEmail} style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.optionIcon, { backgroundColor: '#f3e8ff' }]}>
                        <MaterialCommunityIcons name="email-outline" size={24} color="#9333ea" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.optionTitle, { color: colors.textMain }]}>Email Us</Text>
                        <Text style={[styles.optionSub, { color: colors.textMuted }]}>Send detailed queries</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
                </TouchableOpacity>

                <View style={{ height: 40 }} />
                <Text style={{ textAlign: 'center', color: colors.textMuted, opacity: 0.6 }}>v1.0.0 • SS Infra</Text>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { padding: 24 },
    card: { borderRadius: 4, padding: 30, alignItems: 'center', marginBottom: 32, borderWidth: 1 },
    iconBox: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    cardTitle: { fontSize: 20, fontWeight: '900', marginBottom: 12, textAlign: 'center' },
    cardtext: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
    sectionTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, marginLeft: 4 },
    optionCard: { borderRadius: 4, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16, borderWidth: 1 },
    optionIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    optionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
    optionSub: { fontSize: 12, fontWeight: '600' }
});
