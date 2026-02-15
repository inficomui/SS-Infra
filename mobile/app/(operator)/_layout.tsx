
import { Stack } from 'expo-router';
import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slices/authSlice';

export default function StackLayout() {
    const user = useSelector(selectCurrentUser);

    if (!user || user.role !== 'Operator') {
        return <Redirect href="/login" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
        </Stack>
    );
}
