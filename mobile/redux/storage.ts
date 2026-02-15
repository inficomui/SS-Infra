import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Web-compatible storage wrapper
const createWebStorage = () => {
    if (typeof window === 'undefined') {
        // SSR/Node environment - return a no-op storage
        return {
            getItem: async () => null,
            setItem: async () => { },
            removeItem: async () => { },
        };
    }

    // Browser environment - use localStorage
    return {
        getItem: async (key: string) => {
            try {
                return window.localStorage.getItem(key);
            } catch {
                return null;
            }
        },
        setItem: async (key: string, value: string) => {
            try {
                window.localStorage.setItem(key, value);
            } catch {
                // Ignore errors
            }
        },
        removeItem: async (key: string) => {
            try {
                window.localStorage.removeItem(key);
            } catch {
                // Ignore errors
            }
        },
    };
};

// Use web storage for web platform, AsyncStorage for native
export const storage = Platform.OS === 'web' ? createWebStorage() : AsyncStorage;
