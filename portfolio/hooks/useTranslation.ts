"use client";

import { useAppSelector } from "@/store/hooks";
import en from "@/locales/en.json";
import hi from "@/locales/hi.json";
import mr from "@/locales/mr.json";

const translations: any = { en, hi, mr };

export function useTranslation() {
    const lang = useAppSelector((state) => state.language.current);
    const t = (key: string): string => {
        const keys = key.split(".");
        let result: any = translations[lang];
        for (const k of keys) {
            if (result && result[k]) result = result[k];
            else return key;
        }
        return typeof result === "string" ? result : key;
    };

    return { t, currentLang: lang };
}
