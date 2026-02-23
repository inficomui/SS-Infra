
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';

export default function TermsScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const { t } = useTranslation();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('terms.title')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.heading, { color: colors.textMain }]}>{t('terms.section_1_title')}</Text>
                <Text style={[styles.paragraph, { color: colors.textMuted }]}>
                    {t('terms.section_1_text')}
                </Text>

                <Text style={[styles.heading, { color: colors.textMain }]}>{t('terms.section_2_title')}</Text>
                <Text style={[styles.paragraph, { color: colors.textMuted }]}>
                    {t('terms.section_2_text')}
                </Text>

                <Text style={[styles.heading, { color: colors.textMain }]}>{t('terms.section_3_title')}</Text>
                <Text style={[styles.paragraph, { color: colors.textMuted }]}>
                    {t('terms.section_3_text')}
                </Text>

                <Text style={[styles.heading, { color: colors.textMain }]}>{t('terms.section_4_title')}</Text>
                <Text style={[styles.paragraph, { color: colors.textMuted }]}>
                    {t('terms.section_4_text')}
                </Text>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textMuted }]}>{t('terms.last_updated')}</Text>
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
