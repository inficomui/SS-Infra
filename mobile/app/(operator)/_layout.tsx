
import { Stack, useRouter } from 'expo-router';
import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '@/redux/slices/authSlice';
import { ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';

export default function StackLayout() {
    const router = useRouter();
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    useEffect(() => {
        if (isAuthenticated && user && user.role?.toLowerCase() !== 'operator') {
            router.replace('/');
        }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated) return <Redirect href="/login" />;
    
    if (!user) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#000" /></View>;
    }

    if (!user || user.role?.toLowerCase() !== 'operator') {
        return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }} />
    );
}
