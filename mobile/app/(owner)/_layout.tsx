
import { Stack } from 'expo-router';
import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slices/authSlice';

export default function StackLayout() {
    const user = useSelector(selectCurrentUser);

    if (!user || user.role !== 'Owner') {
        return <Redirect href="/login" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="operators/index" />
            <Stack.Screen name="operators/payment-history" />
            <Stack.Screen name="machines" />
            <Stack.Screen name="add-operator" />
            <Stack.Screen name="add-machine" />
        </Stack>
    );
}
