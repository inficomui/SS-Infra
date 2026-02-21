import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import i18n from '@/utils/i18n';
import { storage } from '@/redux/storage';
import { useAppTheme } from '@/hooks/use-theme-color';
import { LinearGradient } from 'expo-linear-gradient';

const LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
];

export default function LanguageSelectionScreen() {
    const router = useRouter();
    const { colors, isDark } = useAppTheme();
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLang, setSelectedLang] = useState(i18n.language);

    const handleSelectLanguage = async (langCode: string) => {
        setSelectedLang(langCode);
        await i18n.changeLanguage(langCode);
        await storage.setItem('user-language', langCode);

        // Give a little delay for visual feedback
        setTimeout(() => {
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/login'); // Fallback if no history (e.g. initial launch)
            }
        }, 300);
    };

    const filteredLanguages = LANGUAGES.filter(lang =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/login')} style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('common.select_language')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.content}>
                <Searchbar
                    placeholder={t('common.search_language') || "Search Language"}
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
                    inputStyle={{ color: colors.textMain }}
                    iconColor={colors.textMuted}
                    placeholderTextColor={colors.textMuted}
                />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.langList}>
                    {filteredLanguages.map((lang) => {
                        const isSelected = selectedLang === lang.code;
                        return (
                            <TouchableOpacity
                                key={lang.code}
                                onPress={() => handleSelectLanguage(lang.code)}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={isSelected
                                        ? [colors.primary + '20', colors.primary + '05']
                                        : [colors.card, colors.card]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[
                                        styles.langCard,
                                        {
                                            borderColor: isSelected ? colors.primary : colors.border,
                                            borderWidth: isSelected ? 2 : 1
                                        }
                                    ]}
                                >
                                    <View style={styles.langInfo}>
                                        <Text style={styles.flag}>{lang.flag}</Text>
                                        <View>
                                            <Text style={[styles.langName, { color: colors.textMain }]}>{lang.name}</Text>
                                            <Text style={[styles.langNative, { color: colors.textMuted }]}>{lang.nativeName}</Text>
                                        </View>
                                    </View>

                                    <View style={[
                                        styles.radioCircle,
                                        {
                                            borderColor: isSelected ? colors.primary : colors.textMuted,
                                            backgroundColor: isSelected ? colors.primary : 'transparent'
                                        }
                                    ]}>
                                        {isSelected && <MaterialCommunityIcons name="check" size={16} color="#FFF" />}
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    searchBar: {
        marginBottom: 20,
        borderRadius: 12,
        borderWidth: 1,
        elevation: 0,
        height: 50,
    },
    langList: {
        paddingBottom: 40,
        gap: 12,
    },
    langCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        marginBottom: 4,
    },
    langInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    flag: {
        fontSize: 32,
    },
    langName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    langNative: {
        fontSize: 14,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
