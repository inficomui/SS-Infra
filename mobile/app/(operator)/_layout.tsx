
import { Stack, useRouter } from 'expo-router';
import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated, selectActiveRole } from '@/redux/slices/authSlice';
import { ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';

export default function StackLayout() {
    const router = useRouter();
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const activeRole = useSelector(selectActiveRole);

    useEffect(() => {
        const currentActiveRole = activeRole || user?.role;
        if (isAuthenticated && user && currentActiveRole?.toLowerCase() !== 'operator') {
            router.replace('/');
        }
    }, [isAuthenticated, user, activeRole, router]);

    if (!isAuthenticated) return <Redirect href="/login" />;
    
    if (!user) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#000" /></View>;
    }

    const currentActiveRole = activeRole || user?.role;
    if (!user || currentActiveRole?.toLowerCase() !== 'operator') {
        return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }} />
    );
}
