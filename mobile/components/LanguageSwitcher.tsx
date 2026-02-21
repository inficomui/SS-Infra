import React, { useState } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text, Modal, Portal } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import i18n from '@/utils/i18n';
import { storage } from '@/redux/storage';
import { useAppTheme } from '@/hooks/use-theme-color';

interface LanguageSwitcherProps {
    size?: number;
    containerStyle?: any;
}

export default function LanguageSwitcher({ size = 50, containerStyle }: LanguageSwitcherProps) {
    const { t } = useTranslation();
    const { colors } = useAppTheme();
    const [visible, setVisible] = useState(false);

    const changeLanguage = async (lng: string) => {
        try {
            await i18n.changeLanguage(lng);
            await storage.setItem('user-language', lng);
            setVisible(false);
        } catch (error) {
            console.error("Failed to change language", error);
        }
    };

    const radius = size / 2;

    return (
        <View style={containerStyle}>
            <TouchableOpacity onPress={() => setVisible(true)}>
                <View style={[
                    styles.profileCircle,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        width: size,
                        height: size,
                        borderRadius: radius
                    }
                ]}>
                    <MaterialCommunityIcons name="translate" size={size * 0.48} color={colors.textMain} />
                </View>
            </TouchableOpacity>

            <Portal>
                <Modal
                    visible={visible}
                    onDismiss={() => setVisible(false)}
                    contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.background }]}
                >
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.textMain }]}>{t('common.select_language')}</Text>
                        <TouchableOpacity onPress={() => setVisible(false)}>
                            <MaterialCommunityIcons name="close" size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.langItem, i18n.language === 'en' && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
                        onPress={() => changeLanguage('en')}
                    >
                        <Text style={[styles.langText, { color: colors.textMain }, i18n.language === 'en' && { color: colors.primary }]}>English</Text>
                        {i18n.language === 'en' && <MaterialCommunityIcons name="check" size={20} color={colors.primary} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.langItem, i18n.language === 'hi' && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
                        onPress={() => changeLanguage('hi')}
                    >
                        <Text style={[styles.langText, { color: colors.textMain }, i18n.language === 'hi' && { color: colors.primary }]}>हिन्दी (Hindi)</Text>
                        {i18n.language === 'hi' && <MaterialCommunityIcons name="check" size={20} color={colors.primary} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.langItem, i18n.language === 'mr' && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
                        onPress={() => changeLanguage('mr')}
                    >
                        <Text style={[styles.langText, { color: colors.textMain }, i18n.language === 'mr' && { color: colors.primary }]}>मराठी (Marathi)</Text>
                        {i18n.language === 'mr' && <MaterialCommunityIcons name="check" size={20} color={colors.primary} />}
                    </TouchableOpacity>
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    profileCircle: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    modalContainer: {
        margin: 20,
        padding: 24,
        borderRadius: 12,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
    },
    langItem: {
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    langText: {
        fontSize: 16,
        fontWeight: '700',
    },
});
