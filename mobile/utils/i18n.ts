import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { storage } from '../redux/storage';

import en from '../constants/translations/en.json';
import hi from '../constants/translations/hi.json';
import mr from '../constants/translations/mr.json';

const resources = {
    en: { translation: en },
    hi: { translation: hi },
    mr: { translation: mr },
};

const initI18n = async () => {
    let savedLanguage = await storage.getItem('user-language');

    if (!savedLanguage) {
        const locales = Localization.getLocales();
        const deviceLanguage = locales[0]?.languageCode || 'en';
        savedLanguage = resources[deviceLanguage as keyof typeof resources] ? deviceLanguage : 'en';
    }

    await i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: savedLanguage,
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false,
            },
            react: {
                useSuspense: false,
            },
        });
};

initI18n();

export default i18n;
