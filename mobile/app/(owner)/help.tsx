
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, List } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';

export default function HelpScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const { t } = useTranslation();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('owner.help.title')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <List.AccordionGroup>
                    <List.Accordion
                        title={t('owner.help.faq_1_title')}
                        id="1"
                        style={[styles.accordionItem, { backgroundColor: colors.card }]}
                        titleStyle={{ fontWeight: '700', color: colors.textMain }}
                        theme={{ colors: { primary: colors.primary } }}
                    >
                        <List.Item title={t('owner.help.faq_1_desc')} titleStyle={{ color: colors.textMuted }} titleNumberOfLines={2} />
                    </List.Accordion>

                    <List.Accordion
                        title={t('owner.help.faq_2_title')}
                        id="2"
                        style={[styles.accordionItem, { backgroundColor: colors.card }]}
                        titleStyle={{ fontWeight: '700', color: colors.textMain }}
                        theme={{ colors: { primary: colors.primary } }}
                    >
                        <List.Item title={t('owner.help.faq_2_desc')} titleStyle={{ color: colors.textMuted }} titleNumberOfLines={2} />
                    </List.Accordion>

                    <List.Accordion
                        title={t('owner.help.faq_3_title')}
                        id="3"
                        style={[styles.accordionItem, { backgroundColor: colors.card }]}
                        titleStyle={{ fontWeight: '700', color: colors.textMain }}
                        theme={{ colors: { primary: colors.primary } }}
                    >
                        <List.Item title={t('owner.help.faq_3_desc')} titleStyle={{ color: colors.textMuted }} titleNumberOfLines={3} />
                    </List.Accordion>

                    <List.Accordion
                        title={t('owner.help.faq_4_title')}
                        id="4"
                        style={[styles.accordionItem, { backgroundColor: colors.card }]}
                        titleStyle={{ fontWeight: '700', color: colors.textMain }}
                        theme={{ colors: { primary: colors.primary } }}
                    >
                        <List.Item title={t('owner.help.faq_4_desc')} titleStyle={{ color: colors.textMuted }} titleNumberOfLines={2} />
                    </List.Accordion>
                </List.AccordionGroup>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    content: { paddingHorizontal: 24 },
    accordionItem: { borderRadius: 4, marginVertical: 4 },
});
