import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';

export default function AboutScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const { t } = useTranslation();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('operator_about.title')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.brandCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                        <MaterialCommunityIcons name="excavator" size={48} color={colors.primary} />
                    </View>
                    <Text style={[styles.brandName, { color: colors.textMain }]}>{t('operator_about.brand_name')}</Text>
                    <Text style={[styles.brandSub, { color: colors.textMuted }]}>{t('operator_about.brand_sub')}</Text>
                </View>

                <View style={styles.infoSection}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{t('operator_about.mission_title')}</Text>
                    <Text style={[styles.paragraph, { color: colors.textMain }]}>
                        {t('operator_about.mission_text')}
                    </Text>
                </View>

                <View style={styles.infoSection}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{t('operator_about.version')}</Text>
                    <Text style={[styles.paragraph, { color: colors.textMain }]}>v1.0.0 (Beta)</Text>
                </View>

                <View style={styles.infoSection}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{t('operator_about.support_title')}</Text>
                    <Text style={[styles.paragraph, { color: colors.textMain }]}>
                        {t('operator_about.support_text')}
                    </Text>
                </View>

                <View style={{ height: 40 }} />
                <Text style={[styles.copyright, { color: colors.textMuted }]}>{t('operator_about.copyright')}</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { padding: 24 },
    brandCard: { alignItems: 'center', padding: 40, borderRadius: 16, borderWidth: 1, marginBottom: 32 },
    logoPlaceholder: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    brandName: { fontSize: 24, fontWeight: '900', letterSpacing: 1 },
    brandSub: { fontSize: 12, fontWeight: '600', marginTop: 4 },
    infoSection: { marginBottom: 24 },
    sectionTitle: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
    paragraph: { fontSize: 14, lineHeight: 22, opacity: 0.8 },
    copyright: { textAlign: 'center', fontSize: 12 }
});
